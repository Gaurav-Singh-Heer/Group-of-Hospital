// controllers/patientController.js
const Patient = require("../models/Patient");

exports.submitPatientData = async (req, res) => {
  const formData = req.body;
  console.log(formData);
  // Check if the session contains the email
  const sessionEmail = req.session.email;

  // If session email is available, use it, otherwise fall back to form data email
  const email = sessionEmail || formData.email;

  // Add the email to formData if not already present
  formData.email = email;
  try {
    const newPatient = new Patient(formData);
    await newPatient.save();
    console.log(email);
    if(!email){
      res.status(200).json({message: "Can't Book Appointment Login Again"});
    }else{
      res.status(200).json({ message: "Appointment Submitted Successfully" });
    }
  } catch (error) {
    console.error("MongoDB Save Error:", error);
    res.status(500).json({ error: "Error saving appointment data" });
  }
};
