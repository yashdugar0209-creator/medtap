// routes/upload.js
const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const Document = require('../models/Document');
const User = require('../models/User');

const UPLOAD_DIR = process.env.UPLOAD_DIR || 'uploads';
const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, UPLOAD_DIR),
  filename: (req, file, cb) => {
    const safe = Date.now() + '-' + file.originalname.replace(/\s+/g, '_');
    cb(null, safe);
  }
});
const upload = multer({ storage });

// upload document for patient
router.post('/patient/:patientId', upload.single('file'), async (req, res) => {
  try {
    const { patientId } = req.params;
    const patient = await User.findById(patientId);
    if (!patient) return res.status(404).json({ error: 'Patient not found' });

    const doc = await Document.create({
      patient: patientId,
      uploadedBy: req.body.uploader || null,
      filename: req.file.originalname,
      path: req.file.filename,
      mimetype: req.file.mimetype,
      size: req.file.size
    });

    res.json({ ok: true, doc });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Upload failed' });
  }
});

module.exports = router;
