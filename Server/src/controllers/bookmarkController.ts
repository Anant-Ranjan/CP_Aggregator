import { Response } from 'express';
import Bookmark from '../models/Bookmark';
import { AuthRequest } from '../types';

export const addBookmark = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { platform, problemName, problemLink, difficulty, status } = req.body;
    if (!platform || !problemName || !problemLink) {
      res.status(400).json({ message: 'Platform, problem name and link are required.' });
      return;
    }
    const bookmark = await Bookmark.create({ user: req.user!._id, platform, problemName, problemLink, difficulty, status });
    res.status(201).json(bookmark);
  } catch (error) {
    res.status(500).json({ message: 'Failed to add bookmark', error: (error as Error).message });
  }
};

export const getBookmarks = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const bookmarks = await Bookmark.find({ user: req.user!._id }).sort({ createdAt: -1 });
    res.status(200).json(bookmarks);
  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch bookmarks', error: (error as Error).message });
  }
};

export const deleteBookmark = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const bookmark = await Bookmark.findOneAndDelete({ _id: id, user: req.user!._id });
    if (!bookmark) {
      res.status(404).json({ message: 'Bookmark not found or unauthorized' });
      return;
    }
    res.status(200).json({ message: 'Bookmark deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Failed to delete bookmark', error: (error as Error).message });
  }
};
