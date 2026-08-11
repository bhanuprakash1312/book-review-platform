import express from 'express';
import bcrypt from 'bcryptjs'; // For password hashing
import jwt from 'jsonwebtoken'; // For JWT token
import dotenv from 'dotenv';
import prisma from '../lib/prisma.js';

dotenv.config();
const router = express.Router();

// Signup route
router.post('/signup', async (req, res) => {
  try {
    const { username, email, password } = req.body;
    if (!username || !email || !password)
      return res.status(400).json({ error: 'All fields are required' });

    const existing = await prisma.user.findUnique({ where: { email } });
    if (existing)
      return res.status(400).json({ error: 'Email already in use' });

    const hashed = await bcrypt.hash(password, 10);
    await prisma.user.create({ data: { username, email, password: hashed } });
    res.status(201).json({ message: 'Signup successful' });
  } catch (err) {
    res.status(500).json({ error: 'Signup failed' });
  }
});

// Login route
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password)
      return res.status(400).json({ error: 'All fields are required' });

    const user = await prisma.user.findUnique({ where: { email } });
    if (!user)
      return res.status(400).json({ error: 'Invalid credentials' });

    const match = await bcrypt.compare(password, user.password);
    if (!match)
      return res.status(400).json({ error: 'Invalid credentials' });

    // Create JWT token (optional, for auth)
    const token = jwt.sign({ id: user.id }, process.env.JWT_SECRET || 'secret', { expiresIn: '1hr' });

    res.json({
      user: {
        _id: user.id,
        username: user.username,
        email: user.email,
      },
      token,
    });
  } catch (err) {
    res.status(500).json({ error: 'Login failed' });
  }
});

router.get('/users/:id', async (req, res) => {
  try {
    const user = await prisma.user.findUnique({ where: { id: req.params.id } });
    if (!user) return res.status(404).json({ error: 'User not found' });
    res.json({ ...user, _id: user.id });
  } catch (err) {
    res.status(500).json({ error: 'Failed to get user' });
  }
});

// 7. Update user profile
router.put('/users/:id', async (req, res) => {
  try {
    const { username, email, bio } = req.body;
    const updated = await prisma.user.update({
      where: { id: req.params.id },
      data: { username, email, bio },
    });
    if (!updated) return res.status(404).json({ error: 'User not found' });
    res.json({ ...updated, _id: updated.id });
  } catch (err) {
    res.status(500).json({ error: 'Failed to update user' });
  }
});

export default router;