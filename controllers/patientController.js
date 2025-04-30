// controllers/patientController.js
const Patient = require("../models/Patient");

exports.submitPatientData = async (req, res) => {
  const formData = req.body;

  try {
    const newPatient = new Patient(formData);
    await newPatient.save();

    res.status(200).json({ message: "Appointment Submitted Successfully" });
  } catch (error) {
    console.error("MongoDB Save Error:", error);
    res.status(500).json({ error: "Error saving appointment data" });
  }
};
