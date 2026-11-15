import 'dotenv/config';
import express from 'express';
import mongoose from 'mongoose';
import connectDB from './config/db';
import Bookmark from './models/Bookmark';

const app = express();
app.use(express.json());
const PORT = process.env.PORT || 5004;
connectDB();

const isMongoConnected = () => mongoose.connection.readyState === 1;

interface InMemoryBookmark {
  _id: string;
  user: string;
  platform: 'Codeforces' | 'LeetCode' | 'Other';
  problemName: string;
  problemLink: string;
  difficulty?: string;
  status: 'To Do' | 'Attempted' | 'Solved';
  createdAt: string;
  updatedAt: string;
}

const memoryBookmarks: InMemoryBookmark[] = [
  {
    _id: '650c1f1e1f1e1f1e1f1e1001',
    user: '650c1f1e1f1e1f1e1f1e1f1e',
    platform: 'LeetCode',
    problemName: 'Two Sum',
    problemLink: 'https://leetcode.com/problems/two-sum/',
    difficulty: 'Easy',
    status: 'Solved',
    createdAt: new Date(Date.now() - 86400000).toISOString(),
    updatedAt: new Date(Date.now() - 86400000).toISOString(),
  },
  {
    _id: '650c1f1e1f1e1f1e1f1e1002',
    user: '650c1f1e1f1e1f1e1f1e1f1e',
    platform: 'Codeforces',
    problemName: 'Watermelon (4A)',
    problemLink: 'https://codeforces.com/problemset/problem/4/A',
    difficulty: '800',
    status: 'Solved',
    createdAt: new Date(Date.now() - 43200000).toISOString(),
    updatedAt: new Date(Date.now() - 43200000).toISOString(),
  },
  {
    _id: '650c1f1e1f1e1f1e1f1e1003',
    user: '650c1f1e1f1e1f1e1f1e1f1e',
    platform: 'Other',
    problemName: 'Weird Algorithm',
    problemLink: 'https://cses.fi/problemset/task/1068',
    difficulty: 'Introductory',
    status: 'To Do',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
];

// All routes use x-user-id header for user scoping
app.get('/bookmarks', async (req, res) => {
  const userId = req.headers['x-user-id'] as string;
  try {
    if (isMongoConnected()) {
      const bookmarks = await Bookmark.find({ user: userId as any }).sort({ createdAt: -1 });
      res.json(bookmarks);
      return;
    }

    const userBookmarks = memoryBookmarks
      .filter((bm) => bm.user === userId)
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    res.json(userBookmarks);
  } catch (err: any) {
    res.status(500).json({ message: 'Failed to fetch bookmarks', error: err.message });
  }
});

app.post('/bookmarks', async (req, res) => {
  const userId = req.headers['x-user-id'] as string;
  try {
    const { platform, problemName, problemLink, difficulty, status } = req.body;
    if (!platform || !problemName || !problemLink) {
      res.status(400).json({ message: 'Platform, problem name and link are required.' });
      return;
    }

    if (isMongoConnected()) {
      const bookmark = await Bookmark.create({ user: userId as any, platform, problemName, problemLink, difficulty, status });
      res.status(201).json(bookmark);
      return;
    }

    const newBookmark: InMemoryBookmark = {
      _id: new mongoose.Types.ObjectId().toString(),
      user: userId,
      platform,
      problemName,
      problemLink,
      difficulty,
      status: status || 'To Do',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    memoryBookmarks.push(newBookmark);
    res.status(201).json(newBookmark);
  } catch (err: any) {
    res.status(500).json({ message: 'Failed to add bookmark', error: err.message });
  }
});

app.delete('/bookmarks/:id', async (req, res) => {
  const userId = req.headers['x-user-id'] as string;
  try {
    if (isMongoConnected()) {
      const bookmark = await Bookmark.findOneAndDelete({ _id: req.params.id, user: userId as any });
      if (!bookmark) {
        res.status(404).json({ message: 'Bookmark not found or unauthorized' });
        return;
      }
      res.json({ message: 'Bookmark deleted successfully' });
      return;
    }

    const index = memoryBookmarks.findIndex((bm) => bm._id === req.params.id && bm.user === userId);
    if (index === -1) {
      res.status(404).json({ message: 'Bookmark not found or unauthorized' });
      return;
    }
    memoryBookmarks.splice(index, 1);
    res.json({ message: 'Bookmark deleted successfully' });
  } catch (err: any) {
    res.status(500).json({ message: 'Failed to delete bookmark', error: err.message });
  }
});

app.listen(PORT, () => console.log(`bookmark-service on port ${PORT}`));
