import { NextResponse } from 'next/server';
import connectToDatabase from '@/lib/db/mongoose';
import Product from '@/models/Product';

export async function GET(request) {
  try {
    await connectToDatabase();
    
    // Parse pagination and filtering params
    const { searchParams } = new URL(request.url);
    const category = searchParams.get('category');
    const query = searchParams.get('q');
    const limit = parseInt(searchParams.get('limit')) || 50; // Max 100
    
    let filter = {};
    if (category) filter.category = { $regex: category, $options: 'i' };
    if (query) {
      filter.$or = [
        { name: { $regex: query, $options: 'i' } },
        { description: { $regex: query, $options: 'i' } }
      ];
    }
    
    // Fetch products but select ONLY fields relevant to LLMs to save tokens
    const products = await Product.find(filter)
      .select('_id name price category stockCount isDeal discountPercentage')
      .sort({ createdAt: -1 })
      .limit(Math.min(limit, 100))
      .lean();
    
    // Format the response to be as token-efficient as possible
    const semanticCatalog = products.map(p => {
      const finalPrice = p.isDeal ? Math.round(p.price * (1 - p.discountPercentage / 100)) : p.price;
      return {
        id: p._id.toString(),
        name: p.name,
        category: p.category,
        price_inr: finalPrice,
        in_stock: p.stockCount > 0,
        stock_qty: p.stockCount,
        is_deal: p.isDeal ? true : undefined
      };
    });
    
    return NextResponse.json({
      meta: {
        total_returned: semanticCatalog.length,
        description: "Token-optimized semantic catalog for LLM ingestion. Prices are in INR."
      },
      products: semanticCatalog
    });
  } catch (error) {
    console.error('Error in Semantic Catalog API:', error);
    return NextResponse.json({ error: 'Failed to fetch catalog' }, { status: 500 });
  }
}
