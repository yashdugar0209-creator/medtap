// routes/admin.js
const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const User = require('../models/User');

// middleware to validate admin via Bearer token
function requireAdmin(req, res, next) {
  const header = req.headers.authorization;
  if (!header) return res.status(401).json({ error: 'Missing auth header' });
  const token = header.split(' ')[1];
  try {
    const payload = jwt.verify(token, process.env.JWT_SECRET);
    if (payload.role !== 'admin') return res.status(403).json({ error: 'Admin only' });
    req.adminId = payload.id;
    next();
  } catch (err) {
    return res.status(401).json({ error: 'Invalid token' });
  }
}

// List pending users (approved === false)
router.get('/pending', requireAdmin, async (req, res) => {
  try {
    const pending = await User.find({ approved: false }).select('-passwordHash');
    res.json(pending);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});

// Approve a user
router.post('/approve/:id', requireAdmin, async (req, res) => {
  try {
    const id = req.params.id;
    const u = await User.findById(id);
    if (!u) return res.status(404).json({ error: 'User not found' });
    u.approved = true;
    await u.save();
    res.json({ ok: true });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});

// Reject (delete) a user request
router.delete('/reject/:id', requireAdmin, async (req, res) => {
  try {
    await User.findByIdAndDelete(req.params.id);
    res.json({ ok: true });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});

module.exports = router;
