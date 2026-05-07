// backend/config/db.js
const mongoose = require('mongoose');

const connectDB = async () => {
  try {
    // Process.env grabs the secret string from your .env file
    const conn = await mongoose.connect(process.env.MONGO_URI);
    console.log(`[DATABASE] MongoDB Connected: ${conn.connection.host}`);
  } catch (error) {
    console.error(`[ERROR] MongoDB Connection Failed: ${error.message}`);
    process.exit(1); // Kills the server if the database fails to connect
  }
};

module.exports = connectDB;