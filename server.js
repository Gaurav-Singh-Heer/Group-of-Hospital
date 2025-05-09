require('dotenv').config(); // <-- Add this line at the top
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
mongoose.connect(process.env.MONGO_URI, {
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

// Session middleware
app.use(session({
  secret: process.env.SESSION_SECRET,
  resave: false,
  saveUninitialized: true,
  cookie: { secure: false }
}));

// Body parser
app.use(bodyParser.json());
app.use(express.urlencoded({ extended: true }));

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

// Error handler
app.use(errorHandler);

// Server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log("server is running on port");
  console.log(`http://localhost:${PORT}`);
});
