import { NextResponse } from 'next/server';
import connectToDatabase from '@/lib/db/mongoose';
import Product from '@/models/Product';

export async function GET(request) {
  try {
    await connectToDatabase();
    
    // Optional: Extract query params for filtering
    const { searchParams } = new URL(request.url);
    const category = searchParams.get('category');
    const query = searchParams.get('q');
    const minPrice = searchParams.get('minPrice');
    const maxPrice = searchParams.get('maxPrice');
    const isDeal = searchParams.get('isDeal');
    
    let filter = {};
    if (category && category !== 'All') filter.category = category;
    if (isDeal === 'true') filter.isDeal = true;
    
    if (minPrice || maxPrice) {
      filter.price = {};
      if (minPrice) filter.price.$gte = Number(minPrice);
      if (maxPrice) filter.price.$lte = Number(maxPrice);
    }

    if (query) {
      filter.$or = [
        { name: { $regex: query, $options: 'i' } },
        { description: { $regex: query, $options: 'i' } }
      ];
    }
    
    const products = await Product.find(filter).sort({ createdAt: -1 });
    
    return NextResponse.json(products);
  } catch (error) {
    console.error('Error fetching products:', error);
    return NextResponse.json({ error: 'Failed to fetch products' }, { status: 500 });
  }
}
