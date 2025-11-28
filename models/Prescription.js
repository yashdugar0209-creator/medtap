// models/Prescription.js
const mongoose = require('mongoose');

const MedicationSchema = new mongoose.Schema({
  name: { type: String, required: true },
  dosage: { type: String },
  notes: { type: String }
}, { _id: false });

const PrescriptionSchema = new mongoose.Schema({
  patient: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  doctor: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  diagnosis: { type: String },
  medications: { type: [MedicationSchema], default: [] },
  notes: { type: String },
  followUp: { type: Date }
}, { timestamps: true });

module.exports = mongoose.model('Prescription', PrescriptionSchema);
