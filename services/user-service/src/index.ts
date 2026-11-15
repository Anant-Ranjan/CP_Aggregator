import 'dotenv/config';
import express from 'express';
import connectDB from './config/db';
import User from './models/User';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

const app = express();
app.use(express.json());
const PORT = process.env.PORT || 5001;
connectDB();

const generateToken = (id: string) => jwt.sign({ id }, process.env.JWT_SECRET as string, { expiresIn: '30d' });

// Public auth routes
app.post('/users/register', async (req, res) => {
  try {
    const { username, email, password } = req.body;
    if (!username || !email || !password) { res.status(400).json({ message: 'Please fill in all fields' }); return; }
    if (await User.findOne({ email })) { res.status(400).json({ message: 'User already exists' }); return; }
    const hashedPassword = await bcrypt.hash(password, await bcrypt.genSalt(10));
    const user = await User.create({ username, email, password: hashedPassword });
    res.status(201).json({ _id: user.id, username: user.username, email: user.email, message: 'User registered successfully!' });
  } catch (err: any) { res.status(500).json({ message: 'Server Error', error: err.message }); }
});

app.post('/users/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email });
    if (user && await bcrypt.compare(password, user.password)) {
      res.json({ _id: user.id, username: user.username, email: user.email, token: generateToken(user.id) });
    } else {
      res.status(401).json({ message: 'Invalid email or password' });
    }
  } catch (err: any) { res.status(500).json({ message: 'Server Error', error: err.message }); }
});

// Protected routes — trust x-user-id from gateway
app.get('/users/profile', async (req, res) => {
  try {
    const userId = req.headers['x-user-id'] as string;
    const user = await User.findById(userId).select('-password');
    if (!user) { res.status(404).json({ message: 'User not found' }); return; }
    res.json(user);
  } catch (err: any) { res.status(500).json({ message: 'Server Error', error: err.message }); }
});

app.put('/users/profile', async (req, res) => {
  try {
    const userId = req.headers['x-user-id'] as string;
    const user = await User.findById(userId);
    if (!user) { res.status(404).json({ message: 'User not found' }); return; }
    user.codeforcesHandle = req.body.codeforcesHandle || user.codeforcesHandle;
    user.leetcodeHandle = req.body.leetcodeHandle || user.leetcodeHandle;
    const updated = await user.save();
    res.json({ _id: updated._id, username: updated.username, email: updated.email, codeforcesHandle: updated.codeforcesHandle, leetcodeHandle: updated.leetcodeHandle });
  } catch (err: any) { res.status(500).json({ message: 'Server Error', error: err.message }); }
});

// Internal route — called by gateway; never expose to public
app.get('/internal/users/:id', async (req, res) => {
  try {
    const user = await User.findById(req.params.id).select('-password');
    if (!user) { res.status(404).json({ message: 'User not found' }); return; }
    res.json({ username: user.username, email: user.email, codeforcesHandle: user.codeforcesHandle, leetcodeHandle: user.leetcodeHandle });
  } catch (err: any) { res.status(500).json({ message: 'Server Error', error: err.message }); }
});

app.listen(PORT, () => console.log(`user-service on port ${PORT}`));
