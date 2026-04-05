import mongoose from 'mongoose';

const certificationSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true },
  organization: { type: String, required: true, trim: true },
  category: { type: String, required: true, trim: true },
  dateEarned: { type: String, default: '', trim: true },
  credentialLink: { type: String, default: '', trim: true },
  imageUrl: { type: String, default: '', trim: true },
  accentColor: { type: String, default: '#00E5FF', trim: true },
  order: { type: Number, default: 0 },
  isVisible: { type: Boolean, default: true }
});

export default mongoose.model('Certification', certificationSchema);
