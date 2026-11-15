"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const authMiddleware_1 = require("../middleware/authMiddleware");
const leetcodeController_1 = require("../controllers/leetcodeController");
const router = express_1.default.Router();
router.get('/stats', authMiddleware_1.protect, leetcodeController_1.getLeetCodeStats);
exports.default = router;
