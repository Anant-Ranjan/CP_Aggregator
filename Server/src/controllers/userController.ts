import { Response } from 'express';
import User from '../models/User';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { AuthRequest } from '../types';

const generateToken = (id: string): string => {
  return jwt.sign({ id }, process.env.JWT_SECRET as string, { expiresIn: '30d' });
};

export const registerUser = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { username, email, password } = req.body;
    if (!username || !email || !password) {
      res.status(400).json({ message: 'Please fill in all fields' });
      return;
    }
    const userExists = await User.findOne({ email });
    if (userExists) {
      res.status(400).json({ message: 'User already exists' });
      return;
    }
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);
    const newUser = await User.create({ username, email, password: hashedPassword });
    res.status(201).json({ _id: newUser.id, username: newUser.username, email: newUser.email, message: 'User registered successfully!' });
  } catch (error) {
    res.status(500).json({ message: 'Server Error', error: (error as Error).message });
  }
};

export const loginUser = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email });
    if (user && (await bcrypt.compare(password, user.password))) {
      res.status(200).json({ _id: user.id, username: user.username, email: user.email, token: generateToken(user._id.toString()) });
    } else {
      res.status(401).json({ message: 'Invalid email or password' });
    }
  } catch (error) {
    res.status(500).json({ message: 'Server Error', error: (error as Error).message });
  }
};

export const getUserProfile = async (req: AuthRequest, res: Response): Promise<void> => {
  res.status(200).json(req.user);
};

export const updateUserProfile = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const user = await User.findById(req.user!._id);
    if (user) {
      user.codeforcesHandle = req.body.codeforcesHandle || user.codeforcesHandle;
      user.leetcodeHandle = req.body.leetcodeHandle || user.leetcodeHandle;
      const updatedUser = await user.save();
      res.status(200).json({ _id: updatedUser._id, username: updatedUser.username, email: updatedUser.email, codeforcesHandle: updatedUser.codeforcesHandle, leetcodeHandle: updatedUser.leetcodeHandle });
    } else {
      res.status(404).json({ message: 'User not found' });
    }
  } catch (error) {
    res.status(500).json({ message: 'Server Error', error: (error as Error).message });
  }
};
