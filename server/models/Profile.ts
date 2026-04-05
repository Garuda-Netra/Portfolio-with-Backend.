import mongoose from 'mongoose';

const profileSchema = new mongoose.Schema({
  name: { type: String, default: 'Prince Kumar' },
  title: { type: String, default: 'Cybersecurity Enthusiast | Digital Forensics Learner' },
  tagline: { type: String, default: 'Exploring the digital frontier, one vulnerability at a time.' },
  email: { type: String, default: 'princekumaarr2005@gmail.com' },
  bio: {
    type: String,
    default:
      'I am Prince Kumar, a B.Tech student with a burning passion for cybersecurity and digital forensics. I love building, breaking, and defending systems with a security-first mindset.'
  },
  profileImageUrl: { type: String, default: '' },
  githubUrl: { type: String, default: 'https://github.com/princekumar' },
  linkedinUrl: { type: String, default: 'https://linkedin.com/in/princekumar' },
  typingTitles: {
    type: [String],
    default: [
      'Cybersecurity Enthusiast',
      'Digital Forensics Learner',
      'Red Teamer & Blue Teamer'
    ]
  },
  lastUpdated: { type: Date, default: Date.now }
});

export default mongoose.model('Profile', profileSchema);
