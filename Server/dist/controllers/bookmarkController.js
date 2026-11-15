"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteBookmark = exports.getBookmarks = exports.addBookmark = void 0;
const Bookmark_1 = __importDefault(require("../models/Bookmark"));
const addBookmark = async (req, res) => {
    try {
        const { platform, problemName, problemLink, difficulty, status } = req.body;
        if (!platform || !problemName || !problemLink) {
            res.status(400).json({ message: 'Platform, problem name and link are required.' });
            return;
        }
        const bookmark = await Bookmark_1.default.create({ user: req.user._id, platform, problemName, problemLink, difficulty, status });
        res.status(201).json(bookmark);
    }
    catch (error) {
        res.status(500).json({ message: 'Failed to add bookmark', error: error.message });
    }
};
exports.addBookmark = addBookmark;
const getBookmarks = async (req, res) => {
    try {
        const bookmarks = await Bookmark_1.default.find({ user: req.user._id }).sort({ createdAt: -1 });
        res.status(200).json(bookmarks);
    }
    catch (error) {
        res.status(500).json({ message: 'Failed to fetch bookmarks', error: error.message });
    }
};
exports.getBookmarks = getBookmarks;
const deleteBookmark = async (req, res) => {
    try {
        const { id } = req.params;
        const bookmark = await Bookmark_1.default.findOneAndDelete({ _id: id, user: req.user._id });
        if (!bookmark) {
            res.status(404).json({ message: 'Bookmark not found or unauthorized' });
            return;
        }
        res.status(200).json({ message: 'Bookmark deleted successfully' });
    }
    catch (error) {
        res.status(500).json({ message: 'Failed to delete bookmark', error: error.message });
    }
};
exports.deleteBookmark = deleteBookmark;
