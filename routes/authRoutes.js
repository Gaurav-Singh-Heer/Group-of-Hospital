const express = require('express');
const { login, signup } = require('../controllers/authController');

const router = express.Router();

// Define login route
// router.post('/login', login);
router.post('/login', (req, res, next) => {
    console.log("POST /login hit");
    next();
}, login);


// Handle signup form submission
router.post('/register', signup);

module.exports = router; 