// routes/doctor.js
const express = require('express');
const router = express.Router();
const Prescription = require('../models/Prescription');
const User = require('../models/User');
const auth = require('../middleware/auth');

// Add prescription — only doctors
router.post('/prescription', auth, async (req, res) => {
  try {
    if (req.role !== 'doctor') return res.status(403).json({ error: 'Doctor only' });

    const { patientId, diagnosis, medications, notes, followUp } = req.body;
    const patient = await User.findById(patientId);
    if (!patient) return res.status(404).json({ error: 'Patient not found' });

    const pres = await Prescription.create({
      patient: patientId,
      doctor: req.userId,
      diagnosis,
      medications: medications || [],
      notes,
      followUp
    });

    res.json({ ok: true, pres });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});

module.exports = router;
