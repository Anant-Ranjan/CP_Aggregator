export interface RatingHistoryEntry {
  contestName: string;
  rating: number;
}

export interface CodeforcesStats {
  platform: 'Codeforces';
  handle: string;
  rating: number;
  rank: string;
  maxRating: number;
  ratingHistory: RatingHistoryEntry[];
}

export interface LeetCodeStats {
  platform: 'LeetCode';
  handle: string;
  problemsSolved: {
    all: number;
    easy: number;
    medium: number;
    hard: number;
  };
  ratingHistory: RatingHistoryEntry[];
}

export interface BookmarkItem {
  _id: string;
  user: string;
  platform: 'Codeforces' | 'LeetCode' | 'Other';
  problemName: string;
  problemLink: string;
  difficulty?: string;
  status: 'To Do' | 'Attempted' | 'Solved';
  createdAt: string;
}

export interface UserProfile {
  username: string;
  email: string;
  codeforcesHandle: string;
  leetcodeHandle: string;
}

export interface DashboardResponse {
  user: UserProfile;
  codeforces: CodeforcesStats | null;
  leetcode: LeetCodeStats | null;
}

export interface LeaderboardEntry {
  member: string;
  score: number;
}

export interface LeaderboardResponse {
  platform: string;
  leaderboard: LeaderboardEntry[];
}
