require('dotenv').config({ path: '.env.local' });
const mongoose = require('mongoose');
const fs = require('fs');
const csv = require('csv-parser');
const path = require('path');

// Mongoose Model
const ProductSchema = new mongoose.Schema({
  name: { type: String, required: true },
  description: { type: String },
  price: { type: Number, required: true },
  category: { type: String, required: true },
  imageUrl: { type: String },
  stockCount: { type: Number, default: 10 },
  isDeal: { type: Boolean, default: false },
  discountPercentage: { type: Number, default: 0 },
  
  brandName: { type: String },
  listedPrice: { type: Number },
  salePrice: { type: Number },
  imageUrls: [{ type: String }],
  rating: { type: Number },
  reviewCount: { type: Number },
  inStock: { type: Boolean },
  features: [{ type: String }],
  url: { type: String },
  additionalProperties: { type: mongoose.Schema.Types.Mixed },
  breadcrumbs: { type: mongoose.Schema.Types.Mixed },
  metadata: { type: mongoose.Schema.Types.Mixed },
}, { timestamps: true });

const Product = mongoose.models.Product || mongoose.model('Product', ProductSchema);

const CSV_FILE_PATH = path.join(__dirname, '../assets/Dataset/amazon_com_best_sellers_2025_01_27.csv');

async function seedDatabase() {
  console.log('Connecting to MongoDB...');
  await mongoose.connect(process.env.MONGODB_URI);
  console.log('Connected!');

  console.log('Deleting existing products...');
  await Product.deleteMany({});
  console.log('Existing products deleted.');

  const results = [];
  let batchCount = 0;
  let totalInserted = 0;
  
  console.log('Parsing CSV...');
  
  const processBatch = async (batch) => {
    try {
      await Product.insertMany(batch);
      totalInserted += batch.length;
      console.log(`Inserted ${totalInserted} products...`);
    } catch (err) {
      console.error('Error inserting batch:', err);
    }
  };

  return new Promise((resolve, reject) => {
    fs.createReadStream(CSV_FILE_PATH)
      .pipe(csv())
      .on('data', (data) => {
        try {
          const safeParse = (str, fallback = []) => {
            if (!str) return fallback;
            try { return JSON.parse(str); } catch (e) { return fallback; }
          };

          const imageUrls = safeParse(data.imageUrls, []);
          const listedPrice = parseFloat(data.listedPrice) || 0;
          const salePrice = parseFloat(data.salePrice) || 0;
          const price = salePrice > 0 ? salePrice : (listedPrice > 0 ? listedPrice : Math.floor(Math.random() * 100) + 10);
          
          let discountPercentage = 0;
          let isDeal = false;
          if (salePrice > 0 && listedPrice > 0 && listedPrice > salePrice) {
            discountPercentage = Math.round(((listedPrice - salePrice) / listedPrice) * 100);
            if (discountPercentage > 0) isDeal = true;
          }

          const product = {
            name: data.name || 'Unknown Product',
            description: data.description || '',
            price: price,
            category: data.nodeName || 'Uncategorized',
            imageUrl: imageUrls.length > 0 ? imageUrls[0] : 'https://via.placeholder.com/400',
            stockCount: (data.inStock === 'True' || data.inStock === 'true') ? 100 : 0,
            isDeal: isDeal,
            discountPercentage: discountPercentage,
            
            brandName: data.brandName,
            listedPrice: listedPrice,
            salePrice: salePrice,
            imageUrls: imageUrls,
            rating: parseFloat(data.rating) || 0,
            reviewCount: parseFloat(data.reviewCount) || 0,
            inStock: data.inStock === 'True' || data.inStock === 'true',
            features: safeParse(data.features, []),
            url: data.url,
            additionalProperties: safeParse(data.additionalProperties, []),
            breadcrumbs: safeParse(data.breadcrumbs, [])
          };
          
          results.push(product);
          
          if (results.length >= 1000) {
            const batchToProcess = [...results];
            results.length = 0; // Clear the array
            // Process synchronously in stream to avoid memory overload
            // Wait, csv-parser doesn't pause unless explicitly told. We will push to array and pause.
          }
        } catch (e) {
          console.error('Error processing row:', e);
        }
      })
      .on('end', async () => {
         console.log('Finished reading CSV. Processing all batches sequentially...');
      });
  });
}

// Rewriting stream parser to support async/await pausing correctly
async function run() {
    console.log('Connecting to MongoDB...');
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected!');

    console.log('Deleting existing products...');
    await Product.deleteMany({});
    console.log('Existing products deleted.');

    let batch = [];
    let totalInserted = 0;

    const readStream = fs.createReadStream(CSV_FILE_PATH).pipe(csv());

    for await (const data of readStream) {
        try {
            const safeParse = (str, fallback = []) => {
                if (!str) return fallback;
                try { return JSON.parse(str.replace(/'/g, '"')); } catch (e) { return fallback; } // some datasets use single quotes, though standard is double
            };
            
            // Re-parse standard json array string
            const safeJsonArray = (str) => {
                if (!str) return [];
                try { return JSON.parse(str); } catch (e) { return []; }
            }

            const imageUrls = safeJsonArray(data.imageUrls);
            const listedPrice = parseFloat(data.listedPrice) || 0;
            const salePrice = parseFloat(data.salePrice) || 0;
            const price = salePrice > 0 ? salePrice : (listedPrice > 0 ? listedPrice : Math.floor(Math.random() * 100) + 10);
            
            let discountPercentage = 0;
            let isDeal = false;
            if (salePrice > 0 && listedPrice > 0 && listedPrice > salePrice) {
              discountPercentage = Math.round(((listedPrice - salePrice) / listedPrice) * 100);
              if (discountPercentage > 0) isDeal = true;
            }

            const product = {
              name: data.name || 'Unknown Product',
              description: data.description || '',
              price: price,
              category: data.nodeName || 'Uncategorized',
              imageUrl: imageUrls.length > 0 ? imageUrls[0] : 'https://via.placeholder.com/400',
              stockCount: (data.inStock === 'True' || data.inStock === 'true') ? 100 : 0,
              isDeal: isDeal,
              discountPercentage: discountPercentage,
              
              brandName: data.brandName,
              listedPrice: listedPrice,
              salePrice: salePrice,
              imageUrls: imageUrls,
              rating: parseFloat(data.rating) || 0,
              reviewCount: parseFloat(data.reviewCount) || 0,
              inStock: data.inStock === 'True' || data.inStock === 'true',
              features: safeJsonArray(data.features),
              url: data.url,
              additionalProperties: safeJsonArray(data.additionalProperties),
              breadcrumbs: safeJsonArray(data.breadcrumbs)
            };
            
            batch.push(product);
            
            if (batch.length >= 2500) {
                await Product.insertMany(batch);
                totalInserted += batch.length;
                console.log(`Inserted ${totalInserted} products...`);
                batch = []; // Reset batch
            }
        } catch (e) {
            console.error('Row mapping error');
        }
    }

    // Insert remaining
    if (batch.length > 0) {
        await Product.insertMany(batch);
        totalInserted += batch.length;
        console.log(`Inserted ${totalInserted} products...`);
    }

    console.log(`\nSuccessfully seeded ${totalInserted} Amazon products!`);
    process.exit(0);
}

run().catch(console.error);
