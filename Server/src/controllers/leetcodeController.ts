import { Response } from 'express';
import axios from 'axios';
import { AuthRequest } from '../types';
import { getOrSetCache } from '../utils/cache';
import { updateLeaderboardScore } from '../utils/leaderboard';

export interface LeetCodeStatsData {
  platform: string;
  handle: string;
  totalSolved: number;
  easy: number;
  medium: number;
  hard: number;
  problemsSolved: {
    all: number;
    easy: number;
    medium: number;
    hard: number;
  };
  ratingHistory: { contestName: string; rating: number }[];
}

export async function fetchLeetCodeStats(handle: string, member?: string): Promise<LeetCodeStatsData> {
  return getOrSetCache<LeetCodeStatsData>(`lc:stats:${handle}`, 300, async () => {
    const lcQuery = `
      query getUserData($username: String!) {
        matchedUser(username: $username) {
          submitStats: submitStatsGlobal {
            acSubmissionNum { difficulty count }
          }
        }
        userContestRankingHistory(username: $username) {
          attended rating contest { title }
        }
      }
    `;

    const response = await axios.post(
      'https://leetcode.com/graphql',
      { query: lcQuery, variables: { username: handle } },
      { headers: { 'Content-Type': 'application/json', 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)' } }
    );

    const responseData = response.data?.data;
    if (!responseData?.matchedUser) {
      throw new Error('LeetCode user not found. Check the handle.');
    }

    const stats = responseData.matchedUser.submitStats?.acSubmissionNum || [];
    const getCount = (level: string): number => stats.find((s: any) => s.difficulty === level)?.count || 0;

    const totalSolved = getCount('All');
    const easy = getCount('Easy');
    const medium = getCount('Medium');
    const hard = getCount('Hard');

    const contestHistory = responseData.userContestRankingHistory;
    let formattedLcHistory: { contestName: string; rating: number }[] = [];
    if (Array.isArray(contestHistory)) {
      formattedLcHistory = contestHistory
        .filter((c: any) => c.attended)
        .slice(-15)
        .map((c: any) => ({
          contestName: c.contest?.title || 'Contest',
          rating: Math.round(c.rating),
        }));
    }

    const leaderboardMember = member || handle;
    if (leaderboardMember) {
      await updateLeaderboardScore('leetcode', leaderboardMember, totalSolved);
    }

    return {
      platform: 'LeetCode',
      handle,
      totalSolved,
      easy,
      medium,
      hard,
      problemsSolved: {
        all: totalSolved,
        easy,
        medium,
        hard,
      },
      ratingHistory: formattedLcHistory,
    };
  });
}

export const getLeetCodeStats = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const handle = (req.query.handle as string) || req.user?.leetcodeHandle;
    if (!handle) {
      res.status(400).json({ message: 'No LeetCode handle linked to profile.' });
      return;
    }
    const member = (req.query.handle && req.query.handle !== req.user?.leetcodeHandle)
      ? (req.query.handle as string)
      : (req.user?.username || handle);

    const data = await fetchLeetCodeStats(handle, member);
    res.status(200).json(data);
  } catch (error) {
    const message = (error as Error).message || '';
    if (message.includes('not found')) {
      res.status(404).json({ message: 'LeetCode user not found. Check the handle.' });
      return;
    }
    res.status(500).json({ message: 'Failed to fetch LeetCode data', error: message });
  }
};
