import mongoose from 'mongoose';

const ProductSchema = new mongoose.Schema({
  name: { type: String, required: true },
  description: { type: String },
  price: { type: Number, required: true },
  category: { type: String, required: true },
  imageUrl: { type: String },
  stockCount: { type: Number, default: 10 },
  isDeal: { type: Boolean, default: false },
  discountPercentage: { type: Number, default: 0 },
  
  // Rich dataset fields
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

export default mongoose.models.Product || mongoose.model('Product', ProductSchema);
