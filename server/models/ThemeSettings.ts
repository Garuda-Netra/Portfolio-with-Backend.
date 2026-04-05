import mongoose from 'mongoose';

const themeSettingsSchema = new mongoose.Schema({
  darkMode: {
    type: mongoose.Schema.Types.Mixed,
    default: {
      primaryBg: '#020509',
      secondaryBg: '#050A12',
      accentCyan: '#00E5FF',
      accentPurple: '#A855F7',
      accentGreen: '#00CC6A',
      primaryText: '#E8EDF4',
      secondaryText: '#AAB4C2',
      cardBg: 'rgba(6,12,24,0.65)',
      cardBorder: 'rgba(0,229,255,0.06)',
      glowIntensity: 0.6
    }
  },
  lightMode: {
    type: mongoose.Schema.Types.Mixed,
    default: {
      primaryBg: '#F8FAFC',
      secondaryBg: '#F1F5F9',
      accentColor: '#0891B2',
      primaryText: '#0F172A',
      secondaryText: '#475569',
      cardBg: 'rgba(255,255,255,0.8)',
      cardBorder: 'rgba(0,0,0,0.08)'
    }
  },
  animationSpeed: { type: String, default: 'normal', trim: true },
  particleDensity: { type: String, default: 'medium', trim: true },
  fontFamily: { type: String, default: 'jetbrains', trim: true },
  isActive: { type: Boolean, default: true },
  lastUpdated: { type: Date, default: Date.now }
});

export default mongoose.model('ThemeSettings', themeSettingsSchema);
