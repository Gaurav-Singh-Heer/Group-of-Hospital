require('dotenv').config();

const app = require('./app');
const connectDB = require('./config/db');

// Kick off the DB connection. On Vercel (serverless) the exported app is
// invoked per request, so we connect here and let config/db.js cache it.
connectDB().catch((err) => {
  console.error('Failed to connect to MongoDB on startup:', err.message);
});

// Only start a long-running HTTP server when run directly (local dev).
// On Vercel the platform imports `app` and handles the HTTP layer itself.
if (require.main === module) {
  const PORT = process.env.PORT || 3000;
  app.listen(PORT, () => {
    console.log(`Server running at http://localhost:${PORT}`);
  });
}

module.exports = app;
