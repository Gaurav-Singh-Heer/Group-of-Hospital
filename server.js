const express = require('express');
const bodyParser = require('body-parser');
const fs = require('fs');
const path = require('path');
const morgan = require('morgan');
const helmet = require('helmet');
const cors = require('cors');
const compression = require('compression');
const cookieParser = require('cookie-parser');
const pageRoutes = require('./routes/pageRoutes');
const authRoutes = require('./routes/authRoutes');
const patientRoutes = require('./routes/patientRoutes');
const sahayakRoutes = require('./routes/sahayakRoutes');
const logger = require('./middlewares/logger');
const errorHandler = require('./middlewares/error_handler');
const mongoose = require('mongoose');

mongoose.connect('mongodb://localhost:27017/Group_of_Hospital', {
  useNewUrlParser: true,
  useUnifiedTopology: true
}).then(() => {
  console.log('MongoDB connected');
}).catch(err => {
  console.error('MongoDB connection error:', err);
});


// Server port
const PORT = 3000;

// Create an Express app
const app = express(); 
app.use(logger);

// Use morgan for logging requests
app.use(morgan('combined')); // middleware        // To Log HTTP requests
app.use(morgan('dev')); // middleware             // To Give Colour To Status Code

// Use body-parser middleware to parse JSON requests
app.use(bodyParser.json()); //middleware 

// Set EJS as the view engine
app.use(express.static(path.join(__dirname, 'public')));
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

app.use(express.urlencoded({ extended: true }));

// Use authentication routes
app.use(authRoutes);

// Use page routes
app.use(pageRoutes);

// Use patient data routes
app.use(patientRoutes);

// Use sahayak routes
app.use(sahayakRoutes);

app.use(errorHandler);

// Error-handling middleware
// app.use((err, req, res, next) => {
//     console.error(err.stack); // Log the error stack
//     res.status(500).json({ error: 'Something went wrong!' });
// });

app.use((req, res, next) => {
    next(err); // Pass to errorHandler
});

app.use(errorHandler);

// Start the server
app.listen(PORT, () => {
    console.log("server is running on port");
    console.log(`http://localhost:${PORT}`)
});
