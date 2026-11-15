import mongoose, { Schema, Document, Types } from 'mongoose';

export interface IBookmark extends Document {
  user: Types.ObjectId;
  platform: 'Codeforces' | 'LeetCode' | 'Other';
  problemName: string;
  problemLink: string;
  difficulty?: string;
  status: 'To Do' | 'Attempted' | 'Solved';
  createdAt: Date;
  updatedAt: Date;
}

const bookmarkSchema = new Schema<IBookmark>({
  user: { type: Schema.Types.ObjectId, required: true, ref: 'User' },
  platform: { type: String, required: true, enum: ['Codeforces', 'LeetCode', 'Other'] },
  problemName: { type: String, required: true },
  problemLink: { type: String, required: true },
  difficulty: { type: String, required: false },
  status: { type: String, enum: ['To Do', 'Attempted', 'Solved'], default: 'To Do' },
}, { timestamps: true });

export default mongoose.model<IBookmark>('Bookmark', bookmarkSchema);
