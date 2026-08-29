import mongoose from 'mongoose';
import dotenv from 'dotenv';
import path from 'path';
import https from 'https';
import readline from 'readline';

// Load environment variables
dotenv.config({ path: path.resolve(process.cwd(), '.env.local') });

// Load models
import Product from '../models/Product.js';
import AuditLog from '../models/AuditLog.js';

const MONGODB_URI = process.env.MONGODB_URI;

// HuggingFace raw URLs
const BASE_URL = 'https://huggingface.co/datasets/McAuley-Lab/Amazon-Reviews-2023/resolve/main/raw/meta_categories/meta_';
const CATEGORIES = [
  'All_Beauty', 'Amazon_Fashion', 'Appliances', 'Arts_Crafts_and_Sewing', 
  'Automotive', 'Baby_Products', 'Beauty_and_Personal_Care', 'Books', 
  'CDs_and_Vinyl', 'Cell_Phones_and_Accessories', 'Clothing_Shoes_and_Jewelry', 
  'Digital_Music', 'Electronics', 'Gift_Cards', 'Grocery_and_Gourmet_Food', 
  'Handmade_Products', 'Health_and_Household', 'Health_and_Personal_Care', 
  'Home_and_Kitchen', 'Industrial_and_Scientific', 'Kindle_Store', 
  'Magazine_Subscriptions', 'Movies_and_TV', 'Musical_Instruments', 
  'Office_Products', 'Patio_Lawn_and_Garden', 'Pet_Supplies', 'Software', 
  'Sports_and_Outdoors', 'Subscription_Boxes', 'Tools_and_Home_Improvement', 
  'Toys_and_Games', 'Video_Games'
];

const ITEMS_PER_CATEGORY = 50;
const FASHION_CATEGORIES = ['Amazon_Fashion', 'Clothing_Shoes_and_Jewelry', 'Beauty_and_Personal_Care', 'All_Beauty'];
const FASHION_ITEMS_LIMIT = 300;

function streamAndParseJSONL(url, limit) {
  return new Promise((resolve, reject) => {
    const products = [];
    
    https.get(url, (res) => {
      if (res.statusCode === 302 || res.statusCode === 301) {
        // Handle redirect (HuggingFace usually redirects to cdn-lfs)
        console.log(`Redirecting to ${res.headers.location.substring(0, 50)}...`);
        return streamAndParseJSONL(res.headers.location, limit).then(resolve).catch(reject);
      }
      
      if (res.statusCode !== 200) {
        return reject(new Error(`Failed to fetch ${url}, status code: ${res.statusCode}`));
      }

      const rl = readline.createInterface({
        input: res,
        crlfDelay: Infinity
      });

      let count = 0;
      
      rl.on('line', (line) => {
        if (!line.trim()) return;
        
        try {
          const item = JSON.parse(line);
          
          // Must have at least one image and a title to be useful for UI
          if (item.title && item.title.trim() !== '' && item.images && item.images.length > 0) {
            
            // Prioritize high-res image
            const primaryImage = item.images[0];
            const imageUrl = primaryImage.hi_res || primaryImage.large || primaryImage.thumb;
            
            if (imageUrl) {
              // Description parsing
              let desc = "";
              if (item.description && item.description.length > 0) {
                desc = item.description[0];
              } else if (item.features && item.features.length > 0) {
                desc = item.features.join('. ');
              } else {
                desc = item.title; // fallback
              }

              // Handle missing price
              let price = null;
              if (item.price && typeof item.price === 'number') {
                price = item.price * 83; // Convert USD to INR
              } else if (item.price && typeof item.price === 'string') {
                // Parse string like "$19.99"
                const parsed = parseFloat(item.price.replace(/[^0-9.]/g, ''));
                if (!isNaN(parsed)) price = parsed * 83;
              }
              
              if (!price) {
                // Random INR price between 499 and 9999
                price = Math.floor(Math.random() * (9999 - 499 + 1)) + 499;
              }

              // Randomize Deal - Force fashion to be deals
              const isFashionCategory = FASHION_CATEGORIES.includes(url.split('/').pop().replace('.jsonl', ''));
              const isDeal = isFashionCategory ? true : Math.random() > 0.8;
              const discountPercentage = isDeal ? Math.floor(Math.random() * 40) + 15 : 0;
              
              const product = {
                name: item.title,
                description: desc,
                price: Math.round(price),
                imageUrl: imageUrl,
                category: item.main_category || "General",
                stock: Math.floor(Math.random() * 100) + 10,
                isDeal: isDeal,
                discountPercentage: discountPercentage
              };
              
              products.push(product);
              count++;
              
              if (count >= limit) {
                rl.close();
                res.destroy(); // Abort the request early to save bandwidth
              }
            }
          }
        } catch (e) {
          // Ignore parse errors for single lines
        }
      });

      rl.on('close', () => {
        resolve(products);
      });
      
      rl.on('error', (err) => {
        reject(err);
      });
    }).on('error', (err) => {
      reject(err);
    });
  });
}

async function seedDatabase() {
  if (!MONGODB_URI) {
    console.error('Missing MONGODB_URI in .env.local');
    process.exit(1);
  }

  try {
    console.log('Connecting to MongoDB...');
    await mongoose.connect(MONGODB_URI);
    console.log('Connected.');

    console.log('Wiping database (products and audit logs)...');
    await Product.deleteMany({});
    await AuditLog.deleteMany({});
    console.log('Database wiped.');

    let allProducts = [];

    for (const cat of CATEGORIES) {
      const isFashion = FASHION_CATEGORIES.includes(cat);
      const limit = isFashion ? FASHION_ITEMS_LIMIT : ITEMS_PER_CATEGORY;
      console.log(`\nFetching ${limit} items for category: ${cat}...`);
      const url = `${BASE_URL}${cat}.jsonl`;
      const products = await streamAndParseJSONL(url, limit);
      console.log(`Successfully parsed ${products.length} items for ${cat}.`);
      allProducts = allProducts.concat(products);
    }

    console.log(`\nInserting ${allProducts.length} high-res products into the database...`);
    await Product.insertMany(allProducts);
    
    console.log('Seeding complete! Database is now populated with the high-quality Amazon-2023 dataset.');
    process.exit(0);
  } catch (error) {
    console.error('Error during seeding:', error);
    process.exit(1);
  }
}

seedDatabase();
