// routes/patient.js
const express = require('express');
const router = express.Router();
const User = require('../models/User');
const Prescription = require('../models/Prescription');
const Document = require('../models/Document');
const auth = require('../middleware/auth');

// Get patient profile (protected)
router.get('/:id', auth, async (req, res) => {
  try {
    const u = await User.findById(req.params.id).select('-passwordHash');
    if (!u) return res.status(404).json({ error: 'Not found' });
    res.json(u);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});

// Patient prescriptions
router.get('/:id/prescriptions', auth, async (req, res) => {
  try {
    const list = await Prescription.find({ patient: req.params.id }).populate('doctor', 'name email');
    res.json(list);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});

// Patient documents
router.get('/:id/documents', auth, async (req, res) => {
  try {
    const docs = await Document.find({ patient: req.params.id });
    res.json(docs);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});

// Lookup patient by NFC token (public-ish or protected — here protected)
router.get('/by-token/:token', auth, async (req, res) => {
  try {
    const u = await User.findOne({ token: req.params.token, role: 'patient' }).select('-passwordHash');
    if (!u) return res.status(404).json({ error: 'Patient not found' });
    res.json(u);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});

module.exports = router;
