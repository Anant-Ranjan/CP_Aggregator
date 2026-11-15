import mongoose, { Schema } from 'mongoose';
import { IUser } from '../types';

const userSchema = new Schema<IUser>({
  username: { type: String, required: true, unique: true, trim: true },
  email: { type: String, required: true, unique: true, lowercase: true },
  password: { type: String, required: true },
  codeforcesHandle: { type: String, default: '' },
  leetcodeHandle: { type: String, default: '' },
}, { timestamps: true });

export default mongoose.model<IUser>('User', userSchema);
