import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db/mongoose';
import Product from '@/models/Product';
import Order from '@/models/Order';
import AuditLog from '@/models/AuditLog';
import AnalyticsEvent from '@/models/AnalyticsEvent';
import crypto from 'crypto';

export async function POST(request) {
  try {
    await dbConnect();
    const body = await request.json();
    const { agentId, userId, items } = body;

    // Validate Input
    if (!agentId || !items || !Array.isArray(items) || items.length === 0) {
      return NextResponse.json(
        { success: false, reason: "Invalid payload. Requires 'agentId' and non-empty 'items' array." }, 
        { status: 400 }
      );
    }

    // Hash items for Idempotency
    const cartHash = crypto.createHash('sha256').update(JSON.stringify(items)).digest('hex');
    const fifteenMinsAgo = new Date(Date.now() - 15 * 60000);
    
    // Idempotency Check
    const existingOrder = await Order.findOne({ 
      sessionId: agentId, 
      cartHash: cartHash, 
      createdAt: { $gte: fifteenMinsAgo } 
    });
    
    if (existingOrder) {
      return NextResponse.json({
        success: true,
        orderId: existingOrder._id.toString(),
        totalAmount: existingOrder.totalAmount,
        message: "Order successfully processed (Idempotent response)."
      }, { status: 200 });
    }

    let total = 0;
    const validatedItems = [];

    // Validation & Inventory Check
    for (const item of items) {
      if (!item.productId || !item.quantity || item.quantity < 1) {
        return NextResponse.json({ success: false, reason: "Invalid item format." }, { status: 400 });
      }

      const product = await Product.findById(item.productId);
      if (!product) {
        return NextResponse.json({ success: false, reason: `Product ID ${item.productId} not found.` }, { status: 404 });
      }

      if (product.stockCount < item.quantity) {
        await AuditLog.create({ 
          action: 'api_checkout', 
          reason: `Item ${product.name} out of stock. Requested: ${item.quantity}, Available: ${product.stockCount}`, 
          status: 'blocked' 
        });
        return NextResponse.json({ success: false, reason: `Item ${product.name} is out of stock.` }, { status: 400 });
      }

      const price = product.isDeal ? Math.round(product.price * (1 - product.discountPercentage / 100)) : product.price;
      total += (price * item.quantity);

      validatedItems.push({
        productId: product._id,
        name: product.name,
        quantity: item.quantity,
        priceAtPurchase: price
      });
    }

    // SPEND BOUNDING POLICY
    if (total > 5000) {
      await AuditLog.create({ 
        action: 'api_checkout', 
        details: { agentId, total, items: validatedItems },
        reason: `Cart total ₹${total} exceeds the strict ₹5,000 policy limit.`, 
        status: 'blocked' 
      });
      return NextResponse.json({ 
        success: false, 
        reason: `BLOCKED: The cart total (₹${total}) exceeds the ₹5,000 limit.`,
        totalAmount: total
      }, { status: 403 });
    }

    // Execution: Decrement Inventory
    for (const item of validatedItems) {
      await Product.findByIdAndUpdate(item.productId, { $inc: { stockCount: -item.quantity } });
    }

    // Create Order
    const newOrder = await Order.create({
      userId: userId || null,
      sessionId: agentId,
      cartHash: cartHash,
      totalAmount: total,
      items: validatedItems,
      status: 'paid'
    });

    // Audit Logging
    await AuditLog.create({ 
      action: 'api_checkout', 
      details: { agentId, total, orderId: newOrder._id },
      reason: 'Programmatic checkout processed successfully', 
      status: 'success' 
    });

    // Analytics Logging
    const analyticsEvents = validatedItems.map(item => ({
      userId: userId || null,
      sessionId: agentId, // use agentId/userId as session here
      eventType: 'purchase',
      eventData: {
        orderId: newOrder._id.toString(),
        productId: item.productId,
        name: item.name,
        quantity: item.quantity,
        priceAtPurchase: item.priceAtPurchase
      }
    }));
    await AnalyticsEvent.insertMany(analyticsEvents);

    return NextResponse.json({
      success: true,
      orderId: newOrder._id.toString(),
      totalAmount: total,
      message: "Order successfully confirmed."
    }, { status: 200 });

  } catch (error) {
    console.error('API Checkout Error:', error);
    return NextResponse.json({ success: false, reason: 'Internal server error' }, { status: 500 });
  }
}
