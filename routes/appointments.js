const express = require('express');
const router = express.Router();
const Appointment = require('../models/appointment');

// Render EJS page with appointment data
router.get('/no-appointments', (req, res) => {
  res.render('no-appointments');
});

router.get('/appointments', async (req, res) => {
  const sessionEmail = req.session.email;
  console.log("Logged in email:", sessionEmail);

  try {
    let appointments;

    if (sessionEmail) {
      // Find appointments matching the logged-in user's email
      appointments = await Appointment.find({ email: sessionEmail });
    } else {
      // If no email is in session, fetch all appointments (or handle unauthorized access)
      appointments = await Appointment.find();
    }

    console.log("Session email:", sessionEmail);

    if (sessionEmail == null) {
      console.log("Session email is null:", sessionEmail);
      return res.redirect('/login'); // return here
    }

    if (appointments.length === 0) {
      console.log("No appointments");
      return res.redirect('/no-appointments'); // return here
    }

    console.log("Yes appointments");
    // sort the appointments ww.r.t the dates
    appointments.sort((a, b) => new Date(a.date) - new Date(b.date));
    return res.render('appointments', { appointments }); // return here

  } catch (err) {
    console.error('Error fetching appointments:', err);
    res.status(500).send('Server error');
  }
});

module.exports = router;
