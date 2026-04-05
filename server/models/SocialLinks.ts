import mongoose from 'mongoose';

const socialLinksSchema = new mongoose.Schema({
  platform: { type: String, required: true, trim: true },
  url: { type: String, required: true, trim: true },
  displayText: { type: String, default: '', trim: true },
  icon: { type: String, default: '', trim: true },
  isVisible: { type: Boolean, default: true },
  order: { type: Number, default: 0 }
});

export default mongoose.model('SocialLinks', socialLinksSchema);
