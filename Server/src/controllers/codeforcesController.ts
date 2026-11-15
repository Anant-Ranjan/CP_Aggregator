import { Response } from 'express';
import axios from 'axios';
import { AuthRequest } from '../types';
import { getOrSetCache } from '../utils/cache';
import { updateLeaderboardScore } from '../utils/leaderboard';

export interface CodeforcesStatsData {
  platform: string;
  handle: string;
  rating: number;
  rank: string;
  maxRating: number;
  ratingHistory: { contestName: string; rating: number }[];
}

export async function fetchCodeforcesStats(handle: string, member?: string): Promise<CodeforcesStatsData> {
  return getOrSetCache<CodeforcesStatsData>(`cf:stats:${handle}`, 300, async () => {
    const [infoRes, ratingRes] = await Promise.allSettled([
      axios.get(`https://codeforces.com/api/user.info?handles=${handle}`),
      axios.get(`https://codeforces.com/api/user.rating?handle=${handle}`),
    ]);

    if (infoRes.status !== 'fulfilled' || !infoRes.value.data?.result || infoRes.value.data.result.length === 0) {
      throw new Error('Codeforces user not found');
    }

    const cfData = infoRes.value.data.result[0];
    const rating = cfData.rating || 0;
    const rank = cfData.rank || 'Unrated';
    const maxRating = cfData.maxRating || 0;

    let formattedHistory: { contestName: string; rating: number }[] = [];
    if (ratingRes.status === 'fulfilled' && ratingRes.value.data?.result) {
      const rawHistory = ratingRes.value.data.result;
      formattedHistory = rawHistory.slice(-15).map((contest: any) => ({
        contestName: contest.contestName,
        rating: contest.newRating,
      }));
    }

    const leaderboardMember = member || handle;
    if (leaderboardMember) {
      await updateLeaderboardScore('codeforces', leaderboardMember, rating);
    }

    return {
      platform: 'Codeforces',
      handle: cfData.handle,
      rating,
      rank,
      maxRating,
      ratingHistory: formattedHistory,
    };
  });
}

export const getCodeforcesStats = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const handle = (req.query.handle as string) || req.user?.codeforcesHandle;
    if (!handle) {
      res.status(400).json({ message: 'No Codeforces Handle linked to this profile.' });
      return;
    }
    const member = (req.query.handle && req.query.handle !== req.user?.codeforcesHandle)
      ? (req.query.handle as string)
      : (req.user?.username || handle);

    const data = await fetchCodeforcesStats(handle, member);
    res.status(200).json(data);
  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch Codeforces Data', error: (error as Error).message });
  }
};
