import mongoose from 'mongoose';

const securityLogSchema = new mongoose.Schema({
  action: { type: String, required: true, trim: true },
  performedBy: { type: String, default: 'admin', trim: true },
  ipAddress: { type: String, default: '', trim: true },
  userAgent: { type: String, default: 'unknown', trim: true },
  timestamp: { type: Date, default: Date.now },
  status: { type: String, enum: ['success', 'failure'], required: true },
  details: { type: mongoose.Schema.Types.Mixed, default: {} }
});

securityLogSchema.index({ timestamp: -1 });

export default mongoose.model('SecurityLog', securityLogSchema);
