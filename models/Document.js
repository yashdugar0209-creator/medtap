// models/Document.js
const mongoose = require('mongoose');

const DocumentSchema = new mongoose.Schema({
  patient: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  uploadedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  filename: { type: String, required: true },
  path: { type: String, required: true },       // stored filename on disk
  mimetype: { type: String },
  size: { type: Number }
}, { timestamps: true });

module.exports = mongoose.model('Document', DocumentSchema);
