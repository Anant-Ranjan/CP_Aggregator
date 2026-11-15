import 'dotenv/config';
import express from 'express';
import { updateLeaderboardScore, getTopN, getUserRank } from './utils/leaderboard';

const app = express();
app.use(express.json());
const PORT = process.env.PORT || 5005;

// Called by codeforces-service and leetcode-service on cache miss
app.post('/internal/update', async (req, res) => {
  const { platform, member, score } = req.body;
  if (!platform || !member || score === undefined) { res.status(400).json({ message: 'platform, member, score required' }); return; }
  await updateLeaderboardScore(platform, member, Number(score));
  res.json({ ok: true });
});

// Proxied by gateway as /api/leaderboard
app.get('/leaderboard', async (req, res) => {
  const platform = (req.query.platform as string) || 'codeforces';
  const limit = Math.min(parseInt((req.query.limit as string) || '10', 10), 50);
  const leaderboard = await getTopN(platform, limit);
  res.json({ platform, leaderboard });
});

// Internal rank lookup
app.get('/internal/rank', async (req, res) => {
  const platform = (req.query.platform as string) || 'codeforces';
  const member = req.query.member as string;
  if (!member) { res.status(400).json({ message: 'member required' }); return; }
  const rank = await getUserRank(platform, member);
  res.json(rank);
});

app.listen(PORT, () => console.log(`leaderboard-service on port ${PORT}`));
