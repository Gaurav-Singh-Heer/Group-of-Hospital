const User = require('../models/User');

// LOGIN
exports.login = async (req, res) => {
   const { email, password } = req.body;
   try {
      const user = await User.findOne({ email });

        if (!user || user.password !== password) {
            console.log("IDHAR ERROR AYA KYA??")
            return res.status(401).json({ error: 'Invalid credentials', redirect: '/signup' });
        
        }

        res.status(200).json({ message: 'Login successful', redirect: '/home' });
   } catch (err) {
      console.error('Login error:', err);
      res.status(500).json({ error: 'Server error' });
   }
};

// SIGNUP
exports.signup = async (req, res) => {
   const { name, email, password } = req.body;
   try {
      const existingUser = await User.findOne({ email });
      if (existingUser) {
         return res.status(400).json({ error: 'Email already registered' });
      }

      const newUser = new User({ name, email, password }); // Password is stored as-is
      await newUser.save();

      res.status(200).json({ message: 'User registered successfully', redirect: '/login' });
   } catch (error) {
      console.error('Signup error:', error);
      res.status(500).json({ error: 'Server error' });
   }
};
