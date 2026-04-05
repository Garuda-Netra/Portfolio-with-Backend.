import mongoose from 'mongoose';

const analyticsSchema = new mongoose.Schema({
  eventType: { type: String, required: true, trim: true },
  eventData: { type: mongoose.Schema.Types.Mixed, default: {} },
  timestamp: { type: Date, default: Date.now },
  sessionId: { type: String, default: '', trim: true },
  device: { type: String, default: '', trim: true },
  browser: { type: String, default: '', trim: true }
});

analyticsSchema.index({ eventType: 1 });
analyticsSchema.index({ timestamp: -1 });
analyticsSchema.index({ sessionId: 1 });

export default mongoose.model('Analytics', analyticsSchema);
