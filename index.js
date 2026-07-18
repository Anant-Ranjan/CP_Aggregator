require('dotenv').config();

const express = require('express');
const connectDB = require('./config/db');

const userRoutes = require('./routes/userRoutes');
const codeforcesRoutes = require('./routes/codeforcesRoutes');
const leetcodeRoutes = require('./routes/leetcodeRoute');

const app = express();
const PORT = 5000;

connectDB();

app.use(express.json());

app.use('/api/users', userRoutes);
app.use('/api/codeforces', codeforcesRoutes);
app.use('/api/leetcode', leetcodeRoutes);

app.get('/', (req, res) => {
    res.send('Server is running successfully!');
});

app.listen(PORT, () => {
    console.log(`Server is listening on port ${PORT}`);
});