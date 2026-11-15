import 'dotenv/config';
import express from 'express';
import connectDB from './config/db';
import Bookmark from './models/Bookmark';

const app = express();
app.use(express.json());
const PORT = process.env.PORT || 5004;
connectDB();

// All routes use x-user-id header for user scoping
app.get('/bookmarks', async (req, res) => {
  const userId = req.headers['x-user-id'] as string;
  try {
    const bookmarks = await Bookmark.find({ user: userId as any }).sort({ createdAt: -1 });
    res.json(bookmarks);
  } catch (err: any) { res.status(500).json({ message: 'Failed to fetch bookmarks', error: err.message }); }
});

app.post('/bookmarks', async (req, res) => {
  const userId = req.headers['x-user-id'] as string;
  try {
    const { platform, problemName, problemLink, difficulty, status } = req.body;
    if (!platform || !problemName || !problemLink) { res.status(400).json({ message: 'Platform, problem name and link are required.' }); return; }
    const bookmark = await Bookmark.create({ user: userId as any, platform, problemName, problemLink, difficulty, status });
    res.status(201).json(bookmark);
  } catch (err: any) { res.status(500).json({ message: 'Failed to add bookmark', error: err.message }); }
});

app.delete('/bookmarks/:id', async (req, res) => {
  const userId = req.headers['x-user-id'] as string;
  try {
    const bookmark = await Bookmark.findOneAndDelete({ _id: req.params.id, user: userId as any });
    if (!bookmark) { res.status(404).json({ message: 'Bookmark not found or unauthorized' }); return; }
    res.json({ message: 'Bookmark deleted successfully' });
  } catch (err: any) { res.status(500).json({ message: 'Failed to delete bookmark', error: err.message }); }
});

app.listen(PORT, () => console.log(`bookmark-service on port ${PORT}`));
