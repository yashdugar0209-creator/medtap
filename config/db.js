// config/db.js
const mongoose = require('mongoose');

async function connectDB(uri) {
  try {
    await mongoose.connect(uri);
    console.log("Connected to MongoDB Atlas");
  } catch (err) {
    console.error("DB ERROR:", err.message);
    process.exit(1);
  }
}

module.exports = connectDB;
