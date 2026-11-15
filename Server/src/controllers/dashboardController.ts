import { Response } from 'express';
import Bookmark from '../models/Bookmark';
import { AuthRequest } from '../types';
import { fetchCodeforcesStats } from './codeforcesController';
import { fetchLeetCodeStats } from './leetcodeController';

export const getDashboardSummary = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { codeforcesHandle, leetcodeHandle, _id, username, email } = req.user!;
    const requests: Promise<any>[] = [];

    const bookmarkReq = Bookmark.find({ user: _id }).sort({ createdAt: -1 }).limit(5);
    requests.push(bookmarkReq as any);

    if (codeforcesHandle) {
      requests.push(fetchCodeforcesStats(codeforcesHandle, username));
    } else {
      requests.push(Promise.resolve(null));
    }

    if (leetcodeHandle) {
      requests.push(fetchLeetCodeStats(leetcodeHandle, username));
    } else {
      requests.push(Promise.resolve(null));
    }

    const [bookmarkRes, cfRes, lcRes] = await Promise.allSettled(requests);

    const dashboardData: any = {
      user: { username, email, codeforcesHandle, leetcodeHandle },
      recentBookmarks: bookmarkRes.status === 'fulfilled' ? bookmarkRes.value : [],
      codeforces: null,
      leetcode: null,
    };

    if (codeforcesHandle && cfRes.status === 'fulfilled' && cfRes.value) {
      const cf = cfRes.value;
      dashboardData.codeforces = {
        rating: cf.rating,
        rank: cf.rank,
        maxRating: cf.maxRating,
        ratingHistory: cf.ratingHistory,
      };
    }

    if (leetcodeHandle && lcRes.status === 'fulfilled' && lcRes.value) {
      const lc = lcRes.value;
      dashboardData.leetcode = {
        totalSolved: lc.totalSolved,
        easy: lc.easy,
        medium: lc.medium,
        hard: lc.hard,
        ratingHistory: lc.ratingHistory,
      };
    }

    res.status(200).json(dashboardData);
  } catch (error) {
    res.status(500).json({ message: 'Failed to aggregate dashboard data', error: (error as Error).message });
  }
};
