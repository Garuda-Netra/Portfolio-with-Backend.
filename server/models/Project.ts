import mongoose from 'mongoose';

const projectSchema = new mongoose.Schema({
  title: { type: String, required: true, trim: true },
  description: { type: String, required: true, trim: true },
  tags: [{ type: String, trim: true }],
  link: { type: String, default: '', trim: true },
  github: { type: String, default: '', trim: true },
  imageUrl: { type: String, default: '', trim: true },
  accentColor: { type: String, default: '#00E5FF', trim: true },
  order: { type: Number, default: 0 },
  isVisible: { type: Boolean, default: true }
});

export default mongoose.model('Project', projectSchema);
