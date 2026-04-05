import mongoose from 'mongoose';

const resumeSchema = new mongoose.Schema({
  filename: { type: String, required: true, trim: true },
  originalName: { type: String, required: true, trim: true },
  uploadDate: { type: Date, default: Date.now },
  fileSize: { type: Number, required: true },
  downloadCount: { type: Number, default: 0 },
  isActive: { type: Boolean, default: true },
  filePath: { type: String, required: true, trim: true },
  cloudinaryPublicId: { type: String, default: '', trim: true }
});

export default mongoose.model('Resume', resumeSchema);
