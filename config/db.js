const mongoose = require('mongoose');

// Reusable MongoDB connection.
// Caches the connection so repeated calls (e.g. per request on a
// serverless platform like Vercel) reuse the same socket instead of
// opening a new one every time.
let cached = null;

async function connectDB() {
  if (cached) return cached;

  const uri = process.env.MONGO_URI;
  if (!uri) {
    throw new Error('MONGO_URI is not set. Create a .env file (see .env.example).');
  }

  mongoose.set('strictQuery', true);

  cached = mongoose
    .connect(uri)
    .then((conn) => {
      console.log('MongoDB connected');
      return conn;
    })
    .catch((err) => {
      cached = null; // allow a retry on the next call
      console.error('MongoDB connection error:', err.message);
      throw err;
    });

  return cached;
}

module.exports = connectDB;
