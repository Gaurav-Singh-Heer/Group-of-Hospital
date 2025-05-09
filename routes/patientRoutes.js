const express = require('express');
const { submitPatientData } = require('../controllers/patientController');

const router = express.Router();

// Define route for submitting patient data
router.post('/home', submitPatientData);
// router.post('/submit-appointment', submitPatientData);

module.exports = router; 