"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getCodeforcesStats = void 0;
exports.fetchCodeforcesStats = fetchCodeforcesStats;
const axios_1 = __importDefault(require("axios"));
const cache_1 = require("../utils/cache");
const leaderboard_1 = require("../utils/leaderboard");
async function fetchCodeforcesStats(handle, member) {
    return (0, cache_1.getOrSetCache)(`cf:stats:${handle}`, 300, async () => {
        const [infoRes, ratingRes] = await Promise.allSettled([
            axios_1.default.get(`https://codeforces.com/api/user.info?handles=${handle}`),
            axios_1.default.get(`https://codeforces.com/api/user.rating?handle=${handle}`),
        ]);
        if (infoRes.status !== 'fulfilled' || !infoRes.value.data?.result || infoRes.value.data.result.length === 0) {
            throw new Error('Codeforces user not found');
        }
        const cfData = infoRes.value.data.result[0];
        const rating = cfData.rating || 0;
        const rank = cfData.rank || 'Unrated';
        const maxRating = cfData.maxRating || 0;
        let formattedHistory = [];
        if (ratingRes.status === 'fulfilled' && ratingRes.value.data?.result) {
            const rawHistory = ratingRes.value.data.result;
            formattedHistory = rawHistory.slice(-15).map((contest) => ({
                contestName: contest.contestName,
                rating: contest.newRating,
            }));
        }
        const leaderboardMember = member || handle;
        if (leaderboardMember) {
            await (0, leaderboard_1.updateLeaderboardScore)('codeforces', leaderboardMember, rating);
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
const getCodeforcesStats = async (req, res) => {
    try {
        const handle = req.query.handle || req.user?.codeforcesHandle;
        if (!handle) {
            res.status(400).json({ message: 'No Codeforces Handle linked to this profile.' });
            return;
        }
        const member = (req.query.handle && req.query.handle !== req.user?.codeforcesHandle)
            ? req.query.handle
            : (req.user?.username || handle);
        const data = await fetchCodeforcesStats(handle, member);
        res.status(200).json(data);
    }
    catch (error) {
        res.status(500).json({ message: 'Failed to fetch Codeforces Data', error: error.message });
    }
};
exports.getCodeforcesStats = getCodeforcesStats;
