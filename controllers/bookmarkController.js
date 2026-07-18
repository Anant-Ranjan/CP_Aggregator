const Bookmark = require('../models/Bookmark');

const addBookmark = async (req, res) => {
    try {
        const { platform, problemName, problemLink, difficulty, status } = req.body;
        
        if (!platform || !problemName || !problemLink) {
            return res.status(400).json({ message: "Platform, problem name and link are required." });
        }

        const bookmark = await Bookmark.create({
            user: req.user._id,
            platform,
            problemName,
            problemLink,
            difficulty,
            status 
        });
        
        res.status(201).json(bookmark);
    } catch (error) {
        res.status(500).json({ message: "Failed to add bookmark", error: error.message });
    }
};

const getBookmarks = async (req, res) => {
    try{
        const bookmarks = await Bookmark.find({user: req.user._id}).sort({createdAt:-1});
        res.status(200).json(bookmarks);
    } catch(error){
        res.status(500).json({message: "Failed to fetch bookmarks", error:error.message});
    }
}

module.exports = {addBookmark, getBookmarks};