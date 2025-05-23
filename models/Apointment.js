const mongoose = require('mongoose');

const appointmentSchema = new mongoose.Schema({
  name: { type: String, required: true },
  age: { type: Number, required: true },
  gender: { type: String, required: true },
  email: { type: String, required: true },
  department: { type: String, required: true },
  date: { type: String, required: true }
});

module.exports = mongoose.model('Appointment', appointmentSchema);
