import { NextResponse } from 'next/server';
import connectToDatabase from '@/lib/db/mongoose';
import Product from '@/models/Product';

const categories = ['Electronics', 'Clothing', 'Furniture', 'Accessories', 'Sports', 'Home & Kitchen'];

const adjectives = ['Premium', 'Wireless', 'Smart', 'Ergonomic', 'Classic', 'Ultra', 'Minimalist', 'Waterproof', 'Organic', 'Compact', 'Heavy Duty', 'Pro', 'Elite', 'Essential'];
const nouns = {
  'Electronics': ['Headphones', 'Watch', 'Keyboard', 'Monitor', 'Mouse', 'Tablet', 'Speaker', 'Camera', 'Drone', 'Charger'],
  'Clothing': ['Jacket', 'T-Shirt', 'Sneakers', 'Jeans', 'Sweater', 'Hoodie', 'Socks', 'Cap', 'Backpack', 'Scarf'],
  'Furniture': ['Chair', 'Desk', 'Lamp', 'Sofa', 'Table', 'Shelf', 'Bed Frame', 'Cabinet', 'Stool', 'Rug'],
  'Accessories': ['Wallet', 'Sunglasses', 'Belt', 'Watch Band', 'Phone Case', 'Water Bottle', 'Umbrella', 'Keychain', 'Gloves', 'Beanie'],
  'Sports': ['Yoga Mat', 'Dumbbells', 'Jump Rope', 'Resistance Bands', 'Foam Roller', 'Treadmill', 'Kettlebell', 'Gym Bag', 'Tennis Racket', 'Basketball'],
  'Home & Kitchen': ['Coffee Maker', 'Blender', 'Toaster', 'Knife Set', 'Pan', 'Air Fryer', 'Vacuum', 'Thermos', 'Scale', 'Mixer']
};

const images = {
  'Electronics': 'https://images.unsplash.com/photo-1498049794561-7780e7231661?w=800&q=80',
  'Clothing': 'https://images.unsplash.com/photo-1441984904996-e0b6ba687e08?w=800&q=80',
  'Furniture': 'https://images.unsplash.com/photo-1555041469-a586c61ea9bc?w=800&q=80',
  'Accessories': 'https://images.unsplash.com/photo-1523206489230-c012c64b2b48?w=800&q=80',
  'Sports': 'https://images.unsplash.com/photo-1517836357463-d25dfeac3438?w=800&q=80',
  'Home & Kitchen': 'https://images.unsplash.com/photo-1556910103-1c02745a872f?w=800&q=80'
};

function getRandomInt(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

export async function GET() {
  try {
    await connectToDatabase();
    await Product.deleteMany({});
    
    const products = [];
    
    for (let i = 0; i < 100; i++) {
      const category = categories[getRandomInt(0, categories.length - 1)];
      const categoryNouns = nouns[category];
      
      const adj = adjectives[getRandomInt(0, adjectives.length - 1)];
      const noun = categoryNouns[getRandomInt(0, categoryNouns.length - 1)];
      
      const name = `${adj} ${noun}`;
      const isDeal = Math.random() > 0.8; // 20% chance to be a deal
      const basePrice = getRandomInt(10, 500) * 10;
      const discountPercentage = isDeal ? getRandomInt(10, 40) : 0;
      
      products.push({
        name,
        description: `Experience the best in class with our ${name}. Carefully crafted for durability and performance in the ${category} category.`,
        price: basePrice,
        category,
        imageUrl: images[category],
        stockCount: getRandomInt(0, 100),
        isDeal,
        discountPercentage,
        metadata: { brand: 'AgentShop', sku: `AS-${getRandomInt(1000,9999)}` }
      });
    }

    const insertedProducts = await Product.insertMany(products);
    
    return NextResponse.json({
      message: 'Database successfully seeded with ~100 products!',
      count: insertedProducts.length
    });
  } catch (error) {
    console.error('Seeding error:', error);
    return NextResponse.json({ error: 'Failed to seed database', details: error.message }, { status: 500 });
  }
}
