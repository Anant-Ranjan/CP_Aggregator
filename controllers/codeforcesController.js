const axios = require('axios');

const getCodeforcesStats = async (req, res) =>{
    try{
        const handle = req.user.codeforcesHandle;

        if(!handle){
            return res.status(400).json({message: "No Codeforces Handle linked to this profile."});
        }

        const response = await axios.get(`https://codeforces.com/api/user.info?handles=${handle}`);

        const cfData = response.data.result[0];
        res.status(200).json({
            platform:"Codeforces",
            handle: cfData.handle,
            rating: cfData.rating || 0,
            rank: cfData.rank || "Unrated"
        });
    } catch(error){
        res.status(500).json({message: "Failed to fetch Codeforces Data", error:error.message});
    }
}
module.exports = {getCodeforcesStats};