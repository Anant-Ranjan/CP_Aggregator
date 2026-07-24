const axios = require('axios');
const Bookmark = require('../models/Bookmark');

const getDashboardSummary = async (req, res) => {
    try {
        const { codeforcesHandle, leetcodeHandle, _id, username, email } = req.user;
        const requests = []; 
        
        const bookmarkReq = Bookmark.find({ user: _id }).sort({ createdAt: -1 }).limit(5);
        requests.push(bookmarkReq);

        if (codeforcesHandle) {
            requests.push(axios.get(`https://codeforces.com/api/user.info?handles=${codeforcesHandle}`));
        } else {
            requests.push(Promise.resolve(null));
        }

        if (leetcodeHandle) {
            const lcQuery = `query getUserProfile($username: String!) { matchedUser(username: $username) { submitStats: submitStatsGlobal { acSubmissionNum { difficulty count } } } }`;
            requests.push(axios.post('https://leetcode.com/graphql', 
                { query: lcQuery, variables: { username: leetcodeHandle } },
                { headers: { 'Content-Type': 'application/json', 'User-Agent': 'Mozilla/5.0' } }
            ));
        } else {
            requests.push(Promise.resolve(null));
        }
        
        const [bookmarkRes, cfRes, lcRes] = await Promise.allSettled(requests);

        const dashboardData = {
            user: { username, email, codeforcesHandle, leetcodeHandle },
            recentBookmarks: bookmarkRes.status === 'fulfilled' ? bookmarkRes.value : [],
            codeforces: null,
            leetcode: null
        };
        
        if (codeforcesHandle && cfRes.status === 'fulfilled' && cfRes.value) {
            const cfData = cfRes.value.data.result[0];
            dashboardData.codeforces = {
                rating: cfData.rating || 0,
                rank: cfData.rank || "Unrated",
                maxRating: cfData.maxRating || 0
            };
        }
        
        if (leetcodeHandle && lcRes.status === 'fulfilled' && lcRes.value) {
            const matchedUser = lcRes.value.data.data.matchedUser;
            if (matchedUser) {
                const stats = matchedUser.submitStats.acSubmissionNum;
                dashboardData.leetcode = {
                    totalSolved: stats[0].count,
                    easy: stats[1].count,
                    medium: stats[2].count,
                    hard: stats[3].count
                };
            }
        }

        res.status(200).json(dashboardData);

    } catch (error) {
        res.status(500).json({ message: "Failed to aggregate dashboard data", error: error.message });
    }
};

module.exports = { getDashboardSummary };