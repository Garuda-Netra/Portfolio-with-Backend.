import mongoose from 'mongoose';

const contentSchema = new mongoose.Schema({
  sectionName: { type: String, required: true, unique: true, trim: true },
  content: { type: mongoose.Schema.Types.Mixed, default: {} },
  lastUpdated: { type: Date, default: Date.now }
});

export default mongoose.model('Content', contentSchema);
