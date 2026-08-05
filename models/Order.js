import mongoose from 'mongoose';

const OrderItemSchema = new mongoose.Schema({
  productId: { type: mongoose.Schema.Types.ObjectId, ref: 'Product', required: true },
  quantity: { type: Number, required: true, default: 1 },
  priceAtPurchase: { type: Number, required: true }
});

const OrderSchema = new mongoose.Schema({
  orderId: { type: String, required: true, unique: true }, // Razorpay order ID or internal UUID
  items: [OrderItemSchema],
  totalAmount: { type: Number, required: true },
  status: { type: String, enum: ['pending', 'paid', 'failed'], default: 'pending' },
  paymentDetails: { type: mongoose.Schema.Types.Mixed },
}, { timestamps: true });

export default mongoose.models.Order || mongoose.model('Order', OrderSchema);
