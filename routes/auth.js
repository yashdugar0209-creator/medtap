// routes/auth.js
const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/User');

// Register (generic)
router.post('/register', async (req, res) => {
  try {
    const { role, name, email, password, mobile, meta, token } = req.body;
    if (!role || !name || !email || !password) {
      return res.status(400).json({ error: 'Missing fields' });
    }

    const exists = await User.findOne({ email });
    if (exists) return res.status(400).json({ error: 'Email already registered' });

    const hash = await bcrypt.hash(password, 10);

    // if role is admin, auto-approve; others wait for approval
    const approved = role === 'admin' ? true : false;

    const user = await User.create({
      role,
      name,
      email,
      passwordHash: hash,
      mobile,
      meta: meta || {},
      token: token || null,
      approved
    });

    return res.json({ ok: true, message: 'Registration submitted (pending approval if applicable)' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});

// Login
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) return res.status(400).json({ error: 'Missing fields' });

    const user = await User.findOne({ email });
    if (!user) return res.status(401).json({ error: 'Invalid credentials' });

    if (!user.approved) return res.status(403).json({ error: 'Account pending admin approval' });

    const ok = await bcrypt.compare(password, user.passwordHash);
    if (!ok) return res.status(401).json({ error: 'Invalid credentials' });

    const token = jwt.sign({ id: user._id, role: user.role }, process.env.JWT_SECRET, { expiresIn: '12h' });

    res.json({
      token,
      user: { id: user._id, name: user.name, email: user.email, role: user.role }
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});

module.exports = router;
