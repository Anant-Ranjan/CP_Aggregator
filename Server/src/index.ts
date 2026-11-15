import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import connectDB from './config/db';

import userRoutes from './routes/userRoutes';
import codeforcesRoutes from './routes/codeforcesRoutes';
import leetcodeRoutes from './routes/leetcodeRoutes';
import bookmarkRoutes from './routes/bookmarkRoutes';
import dashboardRoutes from './routes/dashboardRoutes';
import leaderboardRoutes from './routes/leaderboardRoutes';

const app = express();
const PORT = process.env.PORT || 5000;

connectDB();

app.use(express.json());
app.use(cors({ origin: process.env.CLIENT_URL || 'http://localhost:5173' }));

app.use('/api/users', userRoutes);
app.use('/api/codeforces', codeforcesRoutes);
app.use('/api/leetcode', leetcodeRoutes);
app.use('/api/bookmarks', bookmarkRoutes);
app.use('/api/dashboard', dashboardRoutes);
app.use('/api/leaderboard', leaderboardRoutes);

app.get('/', (_req, res) => {
  res.send('Server is running successfully!');
});

app.listen(PORT, () => {
  console.log(`Server is listening on port ${PORT}`);
});
