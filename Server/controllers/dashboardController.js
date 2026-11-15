const axios = require('axios');
const Bookmark = require('../models/bookmark');

const getDashboardSummary = async (req, res) => {
    try {
        const { codeforcesHandle, leetcodeHandle, _id, username, email } = req.user;
        const requests = []; 
        
        const bookmarkReq = Bookmark.find({ user: _id }).sort({ createdAt: -1 }).limit(5);
        requests.push(bookmarkReq);

        if (codeforcesHandle) {
            requests.push(axios.get(`https://codeforces.com/api/user.info?handles=${codeforcesHandle}`));
            requests.push(axios.get(`https://codeforces.com/api/user.rating?handle=${codeforcesHandle}`));
        } else {
            requests.push(Promise.resolve(null));
            requests.push(Promise.resolve(null)); 
        }

        if (leetcodeHandle) {
            const lcQuery = `
                query getUserData($username: String!) { 
                    matchedUser(username: $username) { 
                        submitStats: submitStatsGlobal { 
                            acSubmissionNum { difficulty count } 
                        } 
                    }
                    userContestRankingHistory(username: $username) {
                        attended
                        rating
                        contest {
                            title
                        }
                    }
                }
            `;
            requests.push(axios.post('https://leetcode.com/graphql', 
                { query: lcQuery, variables: { username: leetcodeHandle } },
                { headers: { 'Content-Type': 'application/json', 'User-Agent': 'Mozilla/5.0' } }
            ));
        } else {
            requests.push(Promise.resolve(null));
        }
        
        const [bookmarkRes, cfInfoRes, cfHistoryRes, lcRes] = await Promise.allSettled(requests);

        const dashboardData = {
            user: { username, email, codeforcesHandle, leetcodeHandle },
            recentBookmarks: bookmarkRes.status === 'fulfilled' ? bookmarkRes.value : [],
            codeforces: null,
            leetcode: null
        };
        
        if (codeforcesHandle && cfInfoRes.status === 'fulfilled' && cfInfoRes.value) {
            const cfData = cfInfoRes.value.data.result[0];
            
            let formattedHistory = [];
            if (cfHistoryRes.status === 'fulfilled' && cfHistoryRes.value) {
                const rawHistory = cfHistoryRes.value.data.result;
                formattedHistory = rawHistory.slice(-15).map(contest => ({
                    contestName: contest.contestName,
                    rating: contest.newRating
                }));
            }

            dashboardData.codeforces = {
                rating: cfData.rating || 0,
                rank: cfData.rank || "Unrated",
                maxRating: cfData.maxRating || 0,
                ratingHistory: formattedHistory 
            };
        }
        
        if (leetcodeHandle && lcRes.status === 'fulfilled' && lcRes.value) {
            const responseData = lcRes.value.data.data;
            const matchedUser = responseData.matchedUser;
            const contestHistory = responseData.userContestRankingHistory;

            if (matchedUser) {
                const stats = matchedUser.submitStats.acSubmissionNum;
                
                let formattedLcHistory = [];
                if (contestHistory) {
                    formattedLcHistory = contestHistory
                        .filter(contest => contest.attended)
                        .slice(-15)
                        .map(contest => ({
                            contestName: contest.contest.title,
                            rating: Math.round(contest.rating) 
                        }));
                }

                const getCount = (level) => stats.find(s => s.difficulty === level)?.count || 0;
                dashboardData.leetcode = {
                    totalSolved: getCount('All'),
                    easy: getCount('Easy'),
                    medium: getCount('Medium'),
                    hard: getCount('Hard'),
                    ratingHistory: formattedLcHistory
                };
            }
        }

        res.status(200).json(dashboardData);

    } catch (error) {
        res.status(500).json({ message: "Failed to aggregate dashboard data", error: error.message });
    }
};

module.exports = { getDashboardSummary };