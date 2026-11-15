"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getDashboardSummary = void 0;
const Bookmark_1 = __importDefault(require("../models/Bookmark"));
const codeforcesController_1 = require("./codeforcesController");
const leetcodeController_1 = require("./leetcodeController");
const getDashboardSummary = async (req, res) => {
    try {
        const { codeforcesHandle, leetcodeHandle, _id, username, email } = req.user;
        const requests = [];
        const bookmarkReq = Bookmark_1.default.find({ user: _id }).sort({ createdAt: -1 }).limit(5);
        requests.push(bookmarkReq);
        if (codeforcesHandle) {
            requests.push((0, codeforcesController_1.fetchCodeforcesStats)(codeforcesHandle, username));
        }
        else {
            requests.push(Promise.resolve(null));
        }
        if (leetcodeHandle) {
            requests.push((0, leetcodeController_1.fetchLeetCodeStats)(leetcodeHandle, username));
        }
        else {
            requests.push(Promise.resolve(null));
        }
        const [bookmarkRes, cfRes, lcRes] = await Promise.allSettled(requests);
        const dashboardData = {
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
    }
    catch (error) {
        res.status(500).json({ message: 'Failed to aggregate dashboard data', error: error.message });
    }
};
exports.getDashboardSummary = getDashboardSummary;
