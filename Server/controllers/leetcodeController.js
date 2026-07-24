const axios = require('axios');

const getLeetCodeStats = async (req, res) => {
    try {
        const handle = req.user.leetcodeHandle;
        
        if (!handle) {
            return res.status(400).json({ message: "No LeetCode handle linked to profile." });
        }

        const query = `
            query getUserProfile($username: String!) {
                matchedUser(username: $username) {
                    submitStats: submitStatsGlobal {
                        acSubmissionNum {
                            difficulty
                            count
                        }
                    }
                }    
            }
        `;
        
        const response = await axios.post('https://leetcode.com/graphql', 
            {
                query: query,
                variables: { username: handle }
            }, 
            {
                headers: {
                    'Content-Type': 'application/json',
                    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)' 
                }
            }
        );

        if (!response.data.data.matchedUser) {
            return res.status(404).json({ message: "LeetCode user not found. Check the handle." });
        }

        const stats = response.data.data.matchedUser.submitStats.acSubmissionNum;

        const getCount = (level) => stats.find(s => s.difficulty === level)?.count || 0;

        res.status(200).json({
            platform: "LeetCode",
            handle: handle,
            problemsSolved: {
                all: getCount('All'),
                easy: getCount('Easy'),
                medium: getCount('Medium'),
                hard: getCount('Hard')
            }
        });
        
    } catch (error) {
        res.status(500).json({ message: "Failed to fetch LeetCode data", error: error.message });
    }
};

module.exports = { getLeetCodeStats };