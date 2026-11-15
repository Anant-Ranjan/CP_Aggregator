"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.updateLeaderboardScore = updateLeaderboardScore;
exports.getTopN = getTopN;
exports.getUserRank = getUserRank;
const redisClient_1 = __importDefault(require("../config/redisClient"));
async function updateLeaderboardScore(platform, member, score) {
    try {
        await redisClient_1.default.zadd(`leaderboard:${platform}`, score, member);
    }
    catch (err) {
        console.warn(`Redis zadd failed for leaderboard:${platform}:`, err.message);
    }
}
async function getTopN(platform, n = 10) {
    try {
        const raw = await redisClient_1.default.zrevrange(`leaderboard:${platform}`, 0, n - 1, 'WITHSCORES');
        const result = [];
        for (let i = 0; i < raw.length; i += 2) {
            result.push({
                member: raw[i],
                score: parseFloat(raw[i + 1]),
            });
        }
        return result;
    }
    catch (err) {
        console.warn(`Redis zrevrange failed for leaderboard:${platform}:`, err.message);
        return [];
    }
}
async function getUserRank(platform, member) {
    try {
        const rank = await redisClient_1.default.zrevrank(`leaderboard:${platform}`, member);
        const score = await redisClient_1.default.zscore(`leaderboard:${platform}`, member);
        return {
            rank: rank !== null ? rank + 1 : null,
            score: score !== null ? parseFloat(score) : null,
        };
    }
    catch (err) {
        console.warn(`Redis rank/score failed for leaderboard:${platform}:`, err.message);
        return { rank: null, score: null };
    }
}
