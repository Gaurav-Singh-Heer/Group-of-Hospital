const express = require('express');
const router = express.Router();
const Appointment = require('../models/Appointment');
const { requireAuth } = require('../middlewares/auth');

// Render the empty-state page
router.get('/no-appointments', (req, res) => {
  res.render('no-appointments');
});

// List the logged-in user's appointments
router.get('/appointments', requireAuth, async (req, res) => {
  const sessionEmail = req.session.email;

  try {
    const appointments = await Appointment.find({ email: sessionEmail });

    if (appointments.length === 0) {
      return res.redirect('/no-appointments');
    }

    appointments.sort((a, b) => new Date(a.date) - new Date(b.date));
    return res.render('appointments', { appointments });
  } catch (err) {
    console.error('Error fetching appointments:', err);
    res.status(500).send('Server error');
  }
});

// Reschedule: update the date of an appointment the user owns
router.put('/appointments/:id', requireAuth, async (req, res) => {
  const { date } = req.body;
  if (!date) {
    return res.status(400).json({ error: 'A new date is required.' });
  }

  try {
    const appointment = await Appointment.findById(req.params.id);
    if (!appointment) {
      return res.status(404).json({ error: 'Appointment not found.' });
    }
    // Ownership check — users can only modify their own appointments.
    if (appointment.email !== req.session.email) {
      return res.status(403).json({ error: 'You can only modify your own appointments.' });
    }

    appointment.date = date;
    await appointment.save();
    res.json({ message: 'Appointment rescheduled successfully.' });
  } catch (err) {
    console.error('Error rescheduling appointment:', err);
    res.status(500).json({ error: 'Server error' });
  }
});

// Cancel: delete an appointment the user owns
router.delete('/appointments/:id', requireAuth, async (req, res) => {
  try {
    const appointment = await Appointment.findById(req.params.id);
    if (!appointment) {
      return res.status(404).json({ error: 'Appointment not found.' });
    }
    if (appointment.email !== req.session.email) {
      return res.status(403).json({ error: 'You can only cancel your own appointments.' });
    }

    await appointment.deleteOne();
    res.json({ message: 'Appointment cancelled successfully.' });
  } catch (err) {
    console.error('Error cancelling appointment:', err);
    res.status(500).json({ error: 'Server error' });
  }
});

module.exports = router;
