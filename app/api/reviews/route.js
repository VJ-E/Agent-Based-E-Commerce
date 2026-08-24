import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db/mongoose';
import Review from '@/models/Review';
import Order from '@/models/Order';
import { verifyToken } from '@/lib/auth';

export async function POST(request) {
  try {
    const token = request.cookies.get('bentely_auth_token')?.value;
    if (!token) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    
    const payload = await verifyToken(token);
    if (!payload) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    await dbConnect();
    const { productId, orderId, rating, comment } = await request.json();

    if (!productId || !orderId || !rating || !comment) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    // Verify the order belongs to this user and contains this product
    const order = await Order.findOne({ _id: orderId, userId: payload.userId });
    if (!order) return NextResponse.json({ error: 'Order not found or unauthorized' }, { status: 403 });

    const hasProduct = order.items.some(item => item.productId.toString() === productId);
    if (!hasProduct) return NextResponse.json({ error: 'Product not in this order' }, { status: 400 });

    if (order.trackingStatus !== 'delivered') {
      return NextResponse.json({ error: 'You can only review delivered items.' }, { status: 400 });
    }

    // Create Review
    const review = await Review.create({
      userId: payload.userId,
      productId,
      orderId,
      rating: parseInt(rating),
      comment
    });

    return NextResponse.json({ success: true, review }, { status: 201 });
  } catch (error) {
    if (error.code === 11000) {
      return NextResponse.json({ error: 'You have already reviewed this product for this order.' }, { status: 400 });
    }
    console.error('Review API Error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
