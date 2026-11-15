"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getLeetCodeStats = void 0;
exports.fetchLeetCodeStats = fetchLeetCodeStats;
const axios_1 = __importDefault(require("axios"));
const cache_1 = require("../utils/cache");
const leaderboard_1 = require("../utils/leaderboard");
async function fetchLeetCodeStats(handle, member) {
    return (0, cache_1.getOrSetCache)(`lc:stats:${handle}`, 300, async () => {
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
        const response = await axios_1.default.post('https://leetcode.com/graphql', { query: lcQuery, variables: { username: handle } }, { headers: { 'Content-Type': 'application/json', 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)' } });
        const responseData = response.data?.data;
        if (!responseData?.matchedUser) {
            throw new Error('LeetCode user not found. Check the handle.');
        }
        const stats = responseData.matchedUser.submitStats?.acSubmissionNum || [];
        const getCount = (level) => stats.find((s) => s.difficulty === level)?.count || 0;
        const totalSolved = getCount('All');
        const easy = getCount('Easy');
        const medium = getCount('Medium');
        const hard = getCount('Hard');
        const contestHistory = responseData.userContestRankingHistory;
        let formattedLcHistory = [];
        if (Array.isArray(contestHistory)) {
            formattedLcHistory = contestHistory
                .filter((c) => c.attended)
                .slice(-15)
                .map((c) => ({
                contestName: c.contest?.title || 'Contest',
                rating: Math.round(c.rating),
            }));
        }
        const leaderboardMember = member || handle;
        if (leaderboardMember) {
            await (0, leaderboard_1.updateLeaderboardScore)('leetcode', leaderboardMember, totalSolved);
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
const getLeetCodeStats = async (req, res) => {
    try {
        const handle = req.query.handle || req.user?.leetcodeHandle;
        if (!handle) {
            res.status(400).json({ message: 'No LeetCode handle linked to profile.' });
            return;
        }
        const member = (req.query.handle && req.query.handle !== req.user?.leetcodeHandle)
            ? req.query.handle
            : (req.user?.username || handle);
        const data = await fetchLeetCodeStats(handle, member);
        res.status(200).json(data);
    }
    catch (error) {
        const message = error.message || '';
        if (message.includes('not found')) {
            res.status(404).json({ message: 'LeetCode user not found. Check the handle.' });
            return;
        }
        res.status(500).json({ message: 'Failed to fetch LeetCode data', error: message });
    }
};
exports.getLeetCodeStats = getLeetCodeStats;
