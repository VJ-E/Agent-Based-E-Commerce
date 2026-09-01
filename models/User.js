import mongoose from 'mongoose';

const UserSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  passwordHash: { type: String, required: true },
  groqApiKey: { type: String, required: false },
  role: { type: String, enum: ['customer', 'admin'], default: 'customer' }
}, { timestamps: true });

export default mongoose.models.User || mongoose.model('User', UserSchema);
