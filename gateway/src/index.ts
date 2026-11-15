import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import axios from 'axios';
import { protect } from './middleware/protect';
import { GatewayRequest } from './types';
import { Response } from 'express';

const app = express();
const PORT = process.env.PORT || 5000;
const USER_URL = process.env.USER_SERVICE_URL!;
const CF_URL = process.env.CF_SERVICE_URL!;
const LC_URL = process.env.LC_SERVICE_URL!;
const BOOKMARK_URL = process.env.BOOKMARK_SERVICE_URL!;
const LEADERBOARD_URL = process.env.LEADERBOARD_SERVICE_URL!;

app.use(express.json());
app.use(cors({ origin: process.env.CLIENT_URL || 'http://localhost:5173' }));

// Helper to forward x-user-id header to internal services
const userHeader = (userId: string) => ({ headers: { 'x-user-id': userId } });

// ── User routes (public) ──────────────────────────────────────────────────────
app.post('/api/users/register', async (req, res) => {
  try {
    const { data } = await axios.post(`${USER_URL}/users/register`, req.body);
    res.status(201).json(data);
  } catch (err: any) {
    res.status(err.response?.status || 500).json(err.response?.data || { message: 'Gateway error' });
  }
});

app.post('/api/users/login', async (req, res) => {
  try {
    const { data } = await axios.post(`${USER_URL}/users/login`, req.body);
    res.status(200).json(data);
  } catch (err: any) {
    res.status(err.response?.status || 500).json(err.response?.data || { message: 'Gateway error' });
  }
});

// ── User routes (protected) ───────────────────────────────────────────────────
app.get('/api/users/profile', protect as any, async (req: GatewayRequest, res: Response) => {
  try {
    const { data } = await axios.get(`${USER_URL}/users/profile`, userHeader(req.userId!));
    res.json(data);
  } catch (err: any) {
    res.status(err.response?.status || 500).json(err.response?.data || { message: 'Gateway error' });
  }
});

app.put('/api/users/profile', protect as any, async (req: GatewayRequest, res: Response) => {
  try {
    const { data } = await axios.put(`${USER_URL}/users/profile`, req.body, userHeader(req.userId!));
    res.json(data);
  } catch (err: any) {
    res.status(err.response?.status || 500).json(err.response?.data || { message: 'Gateway error' });
  }
});

// ── Codeforces stats ─────────────────────────────────────────────────────────
app.get('/api/codeforces/stats', protect as any, async (req: GatewayRequest, res: Response) => {
  try {
    const profile = await axios.get(`${USER_URL}/internal/users/${req.userId}`);
    const handle = profile.data.codeforcesHandle;
    if (!handle) { res.status(400).json({ message: 'No Codeforces handle linked' }); return; }
    const { data } = await axios.get(`${CF_URL}/stats?handle=${handle}`);
    res.json(data);
  } catch (err: any) {
    res.status(err.response?.status || 500).json(err.response?.data || { message: 'Gateway error' });
  }
});

// ── LeetCode stats ───────────────────────────────────────────────────────────
app.get('/api/leetcode/stats', protect as any, async (req: GatewayRequest, res: Response) => {
  try {
    const profile = await axios.get(`${USER_URL}/internal/users/${req.userId}`);
    const handle = profile.data.leetcodeHandle;
    if (!handle) { res.status(400).json({ message: 'No LeetCode handle linked' }); return; }
    const { data } = await axios.get(`${LC_URL}/stats?handle=${handle}`);
    res.json(data);
  } catch (err: any) {
    res.status(err.response?.status || 500).json(err.response?.data || { message: 'Gateway error' });
  }
});

// ── Bookmarks ────────────────────────────────────────────────────────────────
app.get('/api/bookmarks', protect as any, async (req: GatewayRequest, res: Response) => {
  try {
    const { data } = await axios.get(`${BOOKMARK_URL}/bookmarks`, userHeader(req.userId!));
    res.json(data);
  } catch (err: any) {
    res.status(err.response?.status || 500).json(err.response?.data || { message: 'Gateway error' });
  }
});

app.post('/api/bookmarks', protect as any, async (req: GatewayRequest, res: Response) => {
  try {
    const { data } = await axios.post(`${BOOKMARK_URL}/bookmarks`, req.body, userHeader(req.userId!));
    res.status(201).json(data);
  } catch (err: any) {
    res.status(err.response?.status || 500).json(err.response?.data || { message: 'Gateway error' });
  }
});

app.delete('/api/bookmarks/:id', protect as any, async (req: GatewayRequest, res: Response) => {
  try {
    const { data } = await axios.delete(`${BOOKMARK_URL}/bookmarks/${req.params.id}`, userHeader(req.userId!));
    res.json(data);
  } catch (err: any) {
    res.status(err.response?.status || 500).json(err.response?.data || { message: 'Gateway error' });
  }
});

// ── Dashboard (orchestrator) ─────────────────────────────────────────────────
app.get('/api/dashboard', protect as any, async (req: GatewayRequest, res: Response) => {
  try {
    const { data: profile } = await axios.get(`${USER_URL}/internal/users/${req.userId}`);

    const requests: Promise<any>[] = [
      axios.get(`${BOOKMARK_URL}/bookmarks`, userHeader(req.userId!)),
      profile.codeforcesHandle
        ? axios.get(`${CF_URL}/stats?handle=${profile.codeforcesHandle}`)
        : Promise.resolve(null),
      profile.leetcodeHandle
        ? axios.get(`${LC_URL}/stats?handle=${profile.leetcodeHandle}`)
        : Promise.resolve(null),
    ];

    const [bookmarkRes, cfRes, lcRes] = await Promise.allSettled(requests);

    res.json({
      user: profile,
      codeforces: cfRes.status === 'fulfilled' && cfRes.value ? cfRes.value.data : null,
      leetcode: lcRes.status === 'fulfilled' && lcRes.value ? lcRes.value.data : null,
    });
  } catch (err: any) {
    res.status(err.response?.status || 500).json(err.response?.data || { message: 'Dashboard aggregation failed' });
  }
});

// ── Leaderboard ──────────────────────────────────────────────────────────────
app.get('/api/leaderboard', protect as any, async (req: GatewayRequest, res: Response) => {
  try {
    const { data } = await axios.get(`${LEADERBOARD_URL}/leaderboard`, { params: req.query });
    res.json(data);
  } catch (err: any) {
    res.status(err.response?.status || 500).json(err.response?.data || { message: 'Gateway error' });
  }
});

app.get('/api/leaderboard/rank', protect as any, async (req: GatewayRequest, res: Response) => {
  try {
    const profile = await axios.get(`${USER_URL}/internal/users/${req.userId}`);
    const { data } = await axios.get(`${LEADERBOARD_URL}/internal/rank`, {
      params: { platform: req.query.platform, member: profile.data.username }
    });
    res.json(data);
  } catch (err: any) {
    res.status(err.response?.status || 500).json(err.response?.data || { message: 'Gateway error' });
  }
});

app.get('/', (_req, res) => { res.send('Gateway running'); });

app.listen(PORT, () => console.log(`Gateway on port ${PORT}`));
