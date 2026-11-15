"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getUserLeaderboardRank = exports.getLeaderboard = void 0;
const leaderboard_1 = require("../utils/leaderboard");
const getLeaderboard = async (req, res) => {
    try {
        const platform = req.query.platform || 'codeforces';
        let limit = parseInt(req.query.limit, 10);
        if (isNaN(limit) || limit <= 0) {
            limit = 10;
        }
        else if (limit > 50) {
            limit = 50;
        }
        const leaderboard = await (0, leaderboard_1.getTopN)(platform, limit);
        res.status(200).json({ platform, leaderboard });
    }
    catch (error) {
        res.status(500).json({ message: 'Failed to fetch leaderboard', error: error.message });
    }
};
exports.getLeaderboard = getLeaderboard;
const getUserLeaderboardRank = async (req, res) => {
    try {
        const platform = req.query.platform || 'codeforces';
        const member = req.query.member || req.user?.username;
        if (!member) {
            res.status(400).json({ message: 'Username/member is required' });
            return;
        }
        const rankData = await (0, leaderboard_1.getUserRank)(platform, member);
        res.status(200).json({ platform, member, ...rankData });
    }
    catch (error) {
        res.status(500).json({ message: 'Failed to fetch user rank', error: error.message });
    }
};
exports.getUserLeaderboardRank = getUserLeaderboardRank;
