import 'dotenv/config';
import express from 'express';
import axios from 'axios';
import { getOrSetCache } from './utils/cache';

const app = express();
app.use(express.json());
const PORT = process.env.PORT || 5003;
const LEADERBOARD_URL = process.env.LEADERBOARD_SERVICE_URL!;

const LC_QUERY = `
  query getUserData($username: String!) {
    matchedUser(username: $username) {
      submitStats: submitStatsGlobal { acSubmissionNum { difficulty count } }
    }
    userContestRankingHistory(username: $username) { attended rating contest { title } }
  }
`;

app.get('/stats', async (req, res) => {
  const handle = req.query.handle as string;
  if (!handle) { res.status(400).json({ message: 'handle query param required' }); return; }
  try {
    const data = await getOrSetCache(`lc:stats:${handle}`, 300, async () => {
      const response = await axios.post('https://leetcode.com/graphql',
        { query: LC_QUERY, variables: { username: handle } },
        { headers: { 'Content-Type': 'application/json', 'User-Agent': 'Mozilla/5.0' } }
      );
      const matchedUser = response.data.data.matchedUser;
      if (!matchedUser) throw new Error('LeetCode user not found');
      const stats = matchedUser.submitStats.acSubmissionNum;
      const getCount = (level: string) => stats.find((s: any) => s.difficulty === level)?.count || 0;
      const contestHistory = response.data.data.userContestRankingHistory;
      const ratingHistory = contestHistory
        ? contestHistory.filter((c: any) => c.attended).slice(-15).map((c: any) => ({ contestName: c.contest.title, rating: Math.round(c.rating) }))
        : [];
      const totalSolved = getCount('All');
      const result = { platform: 'LeetCode', handle, problemsSolved: { all: totalSolved, easy: getCount('Easy'), medium: getCount('Medium'), hard: getCount('Hard') }, ratingHistory };
      try {
        await axios.post(`${LEADERBOARD_URL}/internal/update`, { platform: 'leetcode', member: handle, score: totalSolved });
      } catch { /* non-critical */ }
      return result;
    });
    res.json(data);
  } catch (err: any) {
    res.status(500).json({ message: 'Failed to fetch LeetCode data', error: err.message });
  }
});

app.listen(PORT, () => console.log(`leetcode-service on port ${PORT}`));
