"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const authMiddleware_1 = require("../middleware/authMiddleware");
const bookmarkController_1 = require("../controllers/bookmarkController");
const router = express_1.default.Router();
router.post('/', authMiddleware_1.protect, bookmarkController_1.addBookmark);
router.get('/', authMiddleware_1.protect, bookmarkController_1.getBookmarks);
router.delete('/:id', authMiddleware_1.protect, bookmarkController_1.deleteBookmark);
exports.default = router;
