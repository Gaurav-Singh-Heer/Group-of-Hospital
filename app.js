require('dotenv').config();

const express = require('express');
const path = require('path');
const session = require('express-session');
// connect-mongo v6 is ESM-first; under CommonJS the class lives on `.default`.
const MongoStore = require('connect-mongo').default || require('connect-mongo');
const cookieParser = require('cookie-parser');
const helmet = require('helmet');
const compression = require('compression');
const morgan = require('morgan');
const cors = require('cors');

// Route imports
const pageRoutes = require('./routes/pageRoutes');
const authRoutes = require('./routes/authRoutes');
const patientRoutes = require('./routes/patientRoutes');
const sahayakRoutes = require('./routes/sahayakRoutes');
const appointmentRoutes = require('./routes/appointments');
const profileRoutes = require('./routes/profileRoutes');
const adminRoutes = require('./routes/adminRoutes');

// Middleware imports
const logger = require('./middlewares/logger');
const errorHandler = require('./middlewares/error_handler');

const app = express();

// Trust the platform proxy (Vercel/Heroku) so secure cookies work over HTTPS.
app.set('trust proxy', 1);

// Security & performance middleware.
// contentSecurityPolicy is disabled because the EJS views load inline
// scripts/styles and external avatars; enabling the default CSP would
// break the existing pages.
app.use(helmet({ contentSecurityPolicy: false }));
app.use(compression());
app.use(cors());
app.use(morgan(process.env.NODE_ENV === 'production' ? 'combined' : 'dev'));

// Request logger
app.use(logger);

// Body parsing (built into Express 4.16+ — no body-parser dependency needed)
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

// Session middleware.
// Sessions are stored in MongoDB (connect-mongo) so they persist across restarts
// and across serverless invocations on Vercel — the default in-memory store would
// lose logins between requests in a serverless environment.
const sessionConfig = {
  secret: process.env.SESSION_SECRET || 'change-me-in-production',
  resave: false,
  saveUninitialized: false,
  cookie: {
    secure: process.env.NODE_ENV === 'production',
    maxAge: 1000 * 60 * 60 * 24 * 7 // 7 days
  }
};
if (process.env.MONGO_URI) {
  sessionConfig.store = MongoStore.create({
    mongoUrl: process.env.MONGO_URI,
    collectionName: 'sessions',
    ttl: 60 * 60 * 24 * 7 // 7 days
  });
}
app.use(session(sessionConfig));

// Static files
app.use(express.static(path.join(__dirname, 'public')));

// View engine
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

// Routes
app.use(authRoutes);
app.use(pageRoutes);
app.use(patientRoutes);
app.use(sahayakRoutes);
app.use(appointmentRoutes);
app.use(profileRoutes);
app.use(adminRoutes);

// 404 handler — forwards to the error handler with a 404 status
app.use((req, res, next) => {
  const err = new Error(`Not Found: ${req.originalUrl}`);
  err.status = 404;
  next(err);
});

// Error handler (must be last)
app.use(errorHandler);

module.exports = app;
