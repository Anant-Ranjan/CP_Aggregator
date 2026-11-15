"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const authMiddleware_1 = require("../middleware/authMiddleware");
const leaderboardController_1 = require("../controllers/leaderboardController");
const router = express_1.default.Router();
router.get('/', authMiddleware_1.protect, leaderboardController_1.getLeaderboard);
router.get('/rank', authMiddleware_1.protect, leaderboardController_1.getUserLeaderboardRank);
exports.default = router;
