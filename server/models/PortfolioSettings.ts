import mongoose from 'mongoose';

const portfolioSettingsSchema = new mongoose.Schema({
  settingKey: { type: String, required: true, unique: true, trim: true },
  settingValue: { type: Boolean, default: true },
  label: { type: String, default: '', trim: true },
  description: { type: String, default: '', trim: true }
});

export default mongoose.model('PortfolioSettings', portfolioSettingsSchema);
