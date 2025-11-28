const mongoose = require('mongoose');

const UserSchema = new mongoose.Schema({
  role: { type: String, enum: ['patient','doctor','admin'], required: true },
  name: { type: String, required: true },
  email: { type: String, required: true, lowercase: true, unique: true },
  passwordHash: { type: String, required: true },
  createdAt: { type: Date, default: Date.now },
  extra: { type: mongoose.Schema.Types.Mixed }
});

module.exports = mongoose.model('User', UserSchema);
