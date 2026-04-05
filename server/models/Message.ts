import mongoose, { Document, Schema } from 'mongoose';

export interface IMessage extends Document {
  name: string;
  email: string;
  subject: string;
  message: string;
  timestamp: Date;
  isRead: boolean;
  isStarred: boolean;
  isArchived: boolean;
}

const messageSchema = new Schema<IMessage>({
  name: { type: String, required: true, trim: true },
  email: { type: String, required: true, trim: true },
  subject: { type: String, required: true, trim: true },
  message: { type: String, required: true, trim: true },
  timestamp: { type: Date, default: Date.now },
  isRead: { type: Boolean, default: false },
  isStarred: { type: Boolean, default: false },
  isArchived: { type: Boolean, default: false }
});

export default mongoose.model<IMessage>('Message', messageSchema);
