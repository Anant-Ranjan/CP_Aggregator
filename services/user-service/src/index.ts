import 'dotenv/config';
import express from 'express';
import mongoose from 'mongoose';
import connectDB from './config/db';
import User from './models/User';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

const app = express();
app.use(express.json());
const PORT = process.env.PORT || 5001;
connectDB();

const generateToken = (id: string) => jwt.sign({ id }, process.env.JWT_SECRET as string, { expiresIn: '30d' });

interface InMemoryUser {
  _id: string;
  username: string;
  email: string;
  password: string;
  codeforcesHandle: string;
  leetcodeHandle: string;
}

const memoryUsers: InMemoryUser[] = [
  {
    _id: '650c1f1e1f1e1f1e1f1e1f1e',
    username: 'demo_coder',
    email: 'demo@cpaggregator.com',
    password: '',
    codeforcesHandle: 'tourist',
    leetcodeHandle: 'neal_wu',
  },
];

(async () => {
  const salt = await bcrypt.genSalt(10);
  memoryUsers[0].password = await bcrypt.hash('password123', salt);
})();

const isMongoConnected = () => mongoose.connection.readyState === 1;

// Public auth routes
app.post('/users/register', async (req, res) => {
  try {
    const { username, email, password } = req.body;
    if (!username || !email || !password) {
      res.status(400).json({ message: 'Please fill in all fields' });
      return;
    }

    if (isMongoConnected()) {
      if (await User.findOne({ email })) {
        res.status(400).json({ message: 'User already exists' });
        return;
      }
      const hashedPassword = await bcrypt.hash(password, await bcrypt.genSalt(10));
      const user = await User.create({ username, email, password: hashedPassword });
      res.status(201).json({
        _id: user.id,
        username: user.username,
        email: user.email,
        message: 'User registered successfully!',
      });
      return;
    }

    // Fallback: in-memory store
    if (memoryUsers.find((u) => u.email.toLowerCase() === email.toLowerCase() || u.username.toLowerCase() === username.toLowerCase())) {
      res.status(400).json({ message: 'User already exists' });
      return;
    }
    const hashedPassword = await bcrypt.hash(password, await bcrypt.genSalt(10));
    const newId = new mongoose.Types.ObjectId().toString();
    const newUser: InMemoryUser = {
      _id: newId,
      username,
      email,
      password: hashedPassword,
      codeforcesHandle: '',
      leetcodeHandle: '',
    };
    memoryUsers.push(newUser);
    res.status(201).json({
      _id: newUser._id,
      username: newUser.username,
      email: newUser.email,
      message: 'User registered successfully!',
    });
  } catch (err: any) {
    res.status(500).json({ message: 'Server Error', error: err.message });
  }
});

app.post('/users/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      res.status(400).json({ message: 'Please provide email and password' });
      return;
    }

    if (isMongoConnected()) {
      const user = await User.findOne({ email });
      if (user && (await bcrypt.compare(password, user.password))) {
        res.json({
          _id: user.id,
          username: user.username,
          email: user.email,
          token: generateToken(user.id),
        });
        return;
      }
    }

    // Check memory store (allows demo user or in-memory registered users)
    const memUser = memoryUsers.find((u) => u.email.toLowerCase() === email.toLowerCase());
    if (memUser && (await bcrypt.compare(password, memUser.password))) {
      res.json({
        _id: memUser._id,
        username: memUser.username,
        email: memUser.email,
        token: generateToken(memUser._id),
      });
      return;
    }

    res.status(401).json({ message: 'Invalid email or password' });
  } catch (err: any) {
    res.status(500).json({ message: 'Server Error', error: err.message });
  }
});

// Protected routes — trust x-user-id from gateway
app.get('/users/profile', async (req, res) => {
  try {
    const userId = req.headers['x-user-id'] as string;
    if (isMongoConnected()) {
      const user = await User.findById(userId).select('-password');
      if (user) {
        res.json(user);
        return;
      }
    }

    const memUser = memoryUsers.find((u) => u._id === userId);
    if (!memUser) {
      res.status(404).json({ message: 'User not found' });
      return;
    }
    const { password: _, ...profile } = memUser;
    res.json(profile);
  } catch (err: any) {
    res.status(500).json({ message: 'Server Error', error: err.message });
  }
});

app.put('/users/profile', async (req, res) => {
  try {
    const userId = req.headers['x-user-id'] as string;
    if (isMongoConnected()) {
      const user = await User.findById(userId);
      if (user) {
        user.codeforcesHandle = req.body.codeforcesHandle ?? user.codeforcesHandle;
        user.leetcodeHandle = req.body.leetcodeHandle ?? user.leetcodeHandle;
        const updated = await user.save();
        res.json({
          _id: updated._id,
          username: updated.username,
          email: updated.email,
          codeforcesHandle: updated.codeforcesHandle,
          leetcodeHandle: updated.leetcodeHandle,
        });
        return;
      }
    }

    const memUser = memoryUsers.find((u) => u._id === userId);
    if (!memUser) {
      res.status(404).json({ message: 'User not found' });
      return;
    }
    memUser.codeforcesHandle = req.body.codeforcesHandle ?? memUser.codeforcesHandle;
    memUser.leetcodeHandle = req.body.leetcodeHandle ?? memUser.leetcodeHandle;
    const { password: _, ...updated } = memUser;
    res.json(updated);
  } catch (err: any) {
    res.status(500).json({ message: 'Server Error', error: err.message });
  }
});

// Internal route — called by gateway; never expose to public
app.get('/internal/users/:id', async (req, res) => {
  try {
    if (isMongoConnected()) {
      const user = await User.findById(req.params.id).select('-password');
      if (user) {
        res.json({
          username: user.username,
          email: user.email,
          codeforcesHandle: user.codeforcesHandle,
          leetcodeHandle: user.leetcodeHandle,
        });
        return;
      }
    }

    const memUser = memoryUsers.find((u) => u._id === req.params.id);
    if (!memUser) {
      res.status(404).json({ message: 'User not found' });
      return;
    }
    res.json({
      username: memUser.username,
      email: memUser.email,
      codeforcesHandle: memUser.codeforcesHandle,
      leetcodeHandle: memUser.leetcodeHandle,
    });
  } catch (err: any) {
    res.status(500).json({ message: 'Server Error', error: err.message });
  }
});

app.listen(PORT, () => console.log(`user-service on port ${PORT}`));
