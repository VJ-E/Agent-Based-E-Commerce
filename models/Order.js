import mongoose from 'mongoose';

const OrderItemSchema = new mongoose.Schema({
  productId: { type: mongoose.Schema.Types.ObjectId, ref: 'Product', required: true },
  quantity: { type: Number, required: true, default: 1 },
  priceAtPurchase: { type: Number, required: true }
});

const OrderSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  sessionId: { type: String, required: true },
  cartHash: { type: String, required: true },
  items: [OrderItemSchema],
  totalAmount: { type: Number, required: true },
  status: { type: String, enum: ['pending', 'paid', 'failed'], default: 'pending' },
  trackingStatus: { type: String, enum: ['processing', 'shipped', 'out_for_delivery', 'delivered'], default: 'processing' },
  paymentDetails: { type: mongoose.Schema.Types.Mixed },
}, { timestamps: true });

export default mongoose.models.Order || mongoose.model('Order', OrderSchema);
