import mongoose from 'mongoose';

const AuditLogSchema = new mongoose.Schema({
  action: { type: String, required: true },
  entityType: { type: String }, // e.g., 'cart', 'payment', 'recommendation'
  entityId: { type: String },
  details: { type: mongoose.Schema.Types.Mixed },
  reason: { type: String, required: true }, // Why the AI did this
  status: { type: String, enum: ['success', 'blocked', 'failed'], default: 'success' },
}, { timestamps: true });

export default mongoose.models.AuditLog || mongoose.model('AuditLog', AuditLogSchema);
