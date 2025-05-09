const express = require('express');
const User = require('../models/User');
const router = express.Router();


// GET routes to render EJS views
router.get('/', (req, res) => {
    res.render('index');
});

router.get('/logout', (req, res) => {
    req.session.destroy(err => {
        if (err) {
            console.error('Logout error:', err);
            return res.status(500).send("Logout failed");
        }
        // res.status(200).json({message: "Login Again"});
        res.clearCookie('connect.sid'); // Default session cookie name
        res.redirect('/login'); // Redirect to login or homepage
    });
});


router.get('/home', async (req, res) => {
    const email = req.session?.email || null;
    let user = null;

    if (!email) {
        return res.redirect('/login');
    }
    
    if (email) {
        try {
            user = await User.findOne({ email });
        } catch (err) {
            console.error("Error fetching user:", err);
        }
    }
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
        ],
        user:user
    });
});

router.get('/login', (req, res) => {
    res.render('login');
});



router.get('/register', (req, res) => {
    let name = req.query.name;  // Use req.query for GET parameters
    console.log("This is req name: " + name);
    res.render('signup');
});


router.get('/home/gmch', async (req, res) => {
    const email = req.session?.email || null;

    if (!email) {
        res.redirect('/login');
    }

    try {
        const user = await User.findOne({ email });
        if (!user) {
            alert("Login again");
            res.redirect('/login');
        }

        res.render('hospital/gmch', {
            title: 'GMCH Hospital',
            user: user
        });
    } catch (err) {
        console.error("Error fetching user:", err);
        res.render('login', {
            title: 'Login',
            message: 'An error occurred. Please login again.'
        });
    }
});




router.get('/home/pgimer', async (req, res) => {
    const email = req.session?.email || null;

    if (!email) {
        return res.redirect('/login');
    }

    try {
        const user = await User.findOne({ email });
        if (!user) {
            return res.redirect('/login');
        }

        res.render('hospital/pgimer', {
            title: 'PGIMER Hospital',
            user: user
        });
    } catch (err) {
        console.error("Error fetching user:", err);
        res.render('login', {
            title: 'Login',
            message: 'An error occurred. Please login again.'
        });
    }
});


router.get('/home/max', async (req, res) => {
    const email = req.session?.email || null;

    if (!email) {
        return res.redirect('/login');
    }

    try {
        const user = await User.findOne({ email });
        if (!user) {
            return res.redirect('/login');
        }

        res.render('hospital/max', {
            title: 'MAX Hospital',
            user: user
        });
    } catch (err) {
        console.error("Error fetching user:", err);
        res.render('login', {
            title: 'Login',
            message: 'An error occurred. Please login again.'
        });
    }
});



router.get('/home/contact', (req, res) => {
    const email = req.session?.email || null;
    let user = null;
    res.render('contact',{user: user});
});

// router.get('/home/about', (req, res) => {
//     res.render('about');
// });
router.get('/home/about', (req, res) => {
    const email = req.session?.email || null;
    let user = null;
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
        ],
        user: user
    });
});
  

// POST route for contact form
router.post('/home/contact', (req, res) => {
    console.log("Contact form data:", req.body);
    res.render('contact');
});

module.exports = router;
