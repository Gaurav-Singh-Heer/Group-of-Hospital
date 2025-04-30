const express = require('express');
const router = express.Router();

// GET routes to render EJS views
router.get('/', (req, res) => {
    res.render('index');
});

router.get('/home', (req, res) => {
    res.render('home', {
        features: [
            { title: "Top Facilities", description: "We partner with hospitals equipped with cutting-edge technology for the best care." },
            { title: "Expert Doctors", description: "Our network includes experienced specialists across various medical fields." },
            { title: "24/7 Support", description: "We're here to assist you anytime, ensuring smooth and quick responses to your needs." },
            { title: "Map Assistance", description: "Helping you find and navigate to your nearest hospital effortlessly." },
            { title: "Appointment booking", description: "We're here to assist you anytime, ensuring smooth and quick responses to your needs." }
        ],
        hospitals: [
            { name: "GMCH-32", description: "Providing exceptional care with state-of-the-art facilities.", link: "/home/gmch" },
            { name: "PGIMER", description: "Expert doctors and 24/7 emergency services.", link: "/home/pgimer" },
            { name: "Max Healthcare", description: "Focused on delivering patient-centered healthcare.", link: "/home/max" }
        ]
    });
});

router.get('/login', (req, res) => {
    res.render('login');
});

router.get('/register', (req, res) => {
    res.render('signup');
});

router.get('/home/gmch', (req, res) => {
    res.render('hospital/gmch', { title: 'GMCH Hospital' });
});

router.get('/home/pgimer', (req, res) => {
    res.render('hospital/pgimer', { title: 'PGI Hospital' });
});

router.get('/home/max', (req, res) => {
    res.render('hospital/max', { title: 'MAX Hospital' });
});

router.get('/home/contact', (req, res) => {
    res.render('contact');
});

// router.get('/home/about', (req, res) => {
//     res.render('about');
// });
router.get('/home/about', (req, res) => {
    res.render('about', {
        services: [
            { icon: '🩺', title: 'Emergency Care', description: '24/7 emergency services to handle critical situations with expertise.' },
            { icon: '🏥', title: 'Inpatient Services', description: 'Comprehensive care for patients who require overnight stays or extended treatment.' },
            { icon: '⚕️', title: 'Surgery & Critical Care', description: 'Highly trained surgical team providing advanced surgeries and critical care.' }
        ],  
        doctors: [
            { name: "Dr. Aarav Mehta", specialization: "Cardiologist", image: "/assets/doctors/doctor1.jpeg" },
            { name: "Dr. Kavya Iyer", specialization: "Neurologist", image: "/assets/doctors/doctor4.jpeg" },
            { name: "Dr. Emily Brown", specialization: "Neurologist", image: "/assets/doctors/doctor5.jpeg" },
            { name: "Dr. Rohan Sharma", specialization: "Orthopedic Surgeon", image: "/assets/doctors/doctor2.jpeg" },
            { name: "Dr. Ananya Verma", specialization: "Pediatrician", image: "/assets/doctors/doctor6.jpeg" },
            { name: "Dr. Devansh Patel", specialization: "General Physician", image: "/assets/doctors/doctor3.jpeg" },
            { name: "Dr. Sunil Nair", specialization: "Gynecologist", image: "/assets/doctors/doctor7.jpeg" },
            { name: "Dr. Arjun Reddy", specialization: "Oncologist", image: "/assets/doctors/doctor9.jpeg" },
            { name: "Dr. Ishita Desai", specialization: "Dermatologist", image: "/assets/doctors/doctor8.jpeg" },
            { name: "Dr. Vikram Khanna", specialization: "Gastroenterologist", image: "/assets/doctors/doctor10.jpeg" },
            { name: "Dr. Tanya Bhatia", specialization: "Endocrinologist", image: "/assets/doctors/doctor11.jpeg" },
            { name: "Dr. Siddharth Malhotra", specialization: "Urologist", image: "/assets/doctors/doctor12.jpeg" },
            { name: "Dr. Riya Kapoor", specialization: "Ophthalmologist", image: "/assets/doctors/doctor13.jpeg" },
            { name: "Dr. Pranav Joshi", specialization: "Pulmonologist", image: "/assets/doctors/doctor14.jpeg" }
        ],
        testimonials: [
            { text: "The doctors and nurses were amazing. I received the best care possible. Highly recommend!", author: "Patient A" },
            { text: "Great experience. The hospital is clean, and the staff is highly professional. Thank you!", author: "Patient B" },
            { text: "A wonderful facility with caring professionals. I felt truly supported during my recovery.", author: "Patient C" }
        ]
    });
});
  

// POST route for contact form
router.post('/home/contact', (req, res) => {
    console.log("Contact form data:", req.body);
    res.render('contact');
});

module.exports = router;
