import 'dotenv/config';
import express from 'express';
import axios from 'axios';
import { getOrSetCache } from './utils/cache';

const app = express();
app.use(express.json());
const PORT = process.env.PORT || 5002;
const LEADERBOARD_URL = process.env.LEADERBOARD_SERVICE_URL!;

app.get('/stats', async (req, res) => {
  const handle = req.query.handle as string;
  if (!handle) { res.status(400).json({ message: 'handle query param required' }); return; }
  try {
    const data = await getOrSetCache(`cf:stats:${handle}`, 300, async () => {
      const [infoRes, historyRes] = await Promise.all([
        axios.get(`https://codeforces.com/api/user.info?handles=${handle}`),
        axios.get(`https://codeforces.com/api/user.rating?handle=${handle}`)
      ]);
      const cfData = infoRes.data.result[0];
      const rawHistory = historyRes.data.result;
      const ratingHistory = rawHistory.slice(-15).map((c: any) => ({ contestName: c.contestName, rating: c.newRating }));
      const result = { platform: 'Codeforces', handle: cfData.handle, rating: cfData.rating || 0, rank: cfData.rank || 'Unrated', maxRating: cfData.maxRating || 0, ratingHistory };
      // Update leaderboard on cache miss
      try {
        await axios.post(`${LEADERBOARD_URL}/internal/update`, { platform: 'codeforces', member: cfData.handle, score: cfData.rating || 0 });
      } catch { /* non-critical */ }
      return result;
    });
    res.json(data);
  } catch (err: any) {
    res.status(500).json({ message: 'Failed to fetch Codeforces data', error: err.message });
  }
});

app.listen(PORT, () => console.log(`codeforces-service on port ${PORT}`));
