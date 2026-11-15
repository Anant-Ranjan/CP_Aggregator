"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
require("dotenv/config");
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const db_1 = __importDefault(require("./config/db"));
const userRoutes_1 = __importDefault(require("./routes/userRoutes"));
const codeforcesRoutes_1 = __importDefault(require("./routes/codeforcesRoutes"));
const leetcodeRoutes_1 = __importDefault(require("./routes/leetcodeRoutes"));
const bookmarkRoutes_1 = __importDefault(require("./routes/bookmarkRoutes"));
const dashboardRoutes_1 = __importDefault(require("./routes/dashboardRoutes"));
const leaderboardRoutes_1 = __importDefault(require("./routes/leaderboardRoutes"));
const app = (0, express_1.default)();
const PORT = process.env.PORT || 5000;
(0, db_1.default)();
app.use(express_1.default.json());
app.use((0, cors_1.default)({ origin: process.env.CLIENT_URL || 'http://localhost:5173' }));
app.use('/api/users', userRoutes_1.default);
app.use('/api/codeforces', codeforcesRoutes_1.default);
app.use('/api/leetcode', leetcodeRoutes_1.default);
app.use('/api/bookmarks', bookmarkRoutes_1.default);
app.use('/api/dashboard', dashboardRoutes_1.default);
app.use('/api/leaderboard', leaderboardRoutes_1.default);
app.get('/', (_req, res) => {
    res.send('Server is running successfully!');
});
app.listen(PORT, () => {
    console.log(`Server is listening on port ${PORT}`);
});
