import { Response } from 'express';
import { AuthRequest } from '../types';
import { getTopN, getUserRank } from '../utils/leaderboard';

export const getLeaderboard = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const platform = (req.query.platform as string) || 'codeforces';
    let limit = parseInt(req.query.limit as string, 10);
    if (isNaN(limit) || limit <= 0) {
      limit = 10;
    } else if (limit > 50) {
      limit = 50;
    }

    const leaderboard = await getTopN(platform, limit);
    res.status(200).json({ platform, leaderboard });
  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch leaderboard', error: (error as Error).message });
  }
};

export const getUserLeaderboardRank = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const platform = (req.query.platform as string) || 'codeforces';
    const member = (req.query.member as string) || req.user?.username;
    if (!member) {
      res.status(400).json({ message: 'Username/member is required' });
      return;
    }

    const rankData = await getUserRank(platform, member);
    res.status(200).json({ platform, member, ...rankData });
  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch user rank', error: (error as Error).message });
  }
};
