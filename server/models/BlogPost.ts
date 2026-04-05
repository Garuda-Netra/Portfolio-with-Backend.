import mongoose from 'mongoose';

interface BlogPostDocument extends mongoose.Document {
  title: string;
  slug: string;
  content: string;
  excerpt: string;
  tags: string[];
  category: string;
  isPublished: boolean;
  isFeatured: boolean;
  thumbnailUrl: string;
  publishedDate?: Date;
  createdDate: Date;
  readTime: number;
  views: number;
}

const blogPostSchema = new mongoose.Schema<BlogPostDocument>({
  title: { type: String, required: true, trim: true },
  slug: { type: String, unique: true, required: true, trim: true },
  content: { type: String, default: '' },
  excerpt: { type: String, default: '' },
  tags: { type: [String], default: [] },
  category: { type: String, default: 'Other' },
  isPublished: { type: Boolean, default: false },
  isFeatured: { type: Boolean, default: false },
  thumbnailUrl: { type: String, default: '' },
  publishedDate: { type: Date },
  createdDate: { type: Date, default: Date.now },
  readTime: { type: Number, default: 1 },
  views: { type: Number, default: 0 }
});

export default mongoose.model<BlogPostDocument>('BlogPost', blogPostSchema);
