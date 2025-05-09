const express = require('express');
const bodyParser = require('body-parser');
const session = require('express-session');
const path = require('path');
const cookieParser = require('cookie-parser');
const mongoose = require('mongoose');

// Route imports
const pageRoutes = require('./routes/pageRoutes');
const authRoutes = require('./routes/authRoutes');
const patientRoutes = require('./routes/patientRoutes');
const sahayakRoutes = require('./routes/sahayakRoutes');
const appointmentRoutes = require('./routes/appointments');

// Middleware imports
const logger = require('./middlewares/logger');
const errorHandler = require('./middlewares/error_handler');

// MongoDB connection
mongoose.connect('mongodb://127.0.0.1:27017/Group_of_Hospital', {
  useNewUrlParser: true,
  useUnifiedTopology: true
}).then(() => {
  console.log('MongoDB connected');
}).catch(err => {
  console.error('MongoDB connection error:', err);
});

// Create Express app
const app = express();

// Logger middleware
app.use(logger);

// ✅ Setup express-session middleware
app.use(session({
  secret: 'your-secret-key', // Replace with a secure key in production
  resave: false,
  saveUninitialized: true,
  cookie: { secure: false } // Set to true only if using HTTPS
}));

// Body parser for JSON and URL-encoded form data
app.use(bodyParser.json());
app.use(express.urlencoded({ extended: true }));

// Static files
app.use(express.static(path.join(__dirname, 'public')));

// View engine setup
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

// Route handlers (order matters!)
app.use(authRoutes);
app.use(pageRoutes);
app.use(patientRoutes);
app.use(sahayakRoutes);
app.use(appointmentRoutes);

// Error handling middleware
app.use(errorHandler);

// Start server
const PORT = 3000;
app.listen(PORT, () => {
  console.log("server is running on port");
  console.log(`http://localhost:${PORT}`);
});
