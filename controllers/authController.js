const bcrypt = require('bcryptjs');
const User = require('../models/User');

const SALT_ROUNDS = 10;

// A bcrypt hash always starts with $2a$, $2b$, or $2y$. Used to detect
// legacy plain-text passwords stored before hashing was introduced.
const isHashed = (pwd) => typeof pwd === 'string' && /^\$2[aby]\$/.test(pwd);

// LOGIN
exports.login = async (req, res) => {
   const { email, password } = req.body;

   try {
      const user = await User.findOne({ email });
      if (!user) {
         return res.status(401).json({ error: 'Invalid credentials' });
      }

      let passwordMatches;
      if (isHashed(user.password)) {
         passwordMatches = await bcrypt.compare(password, user.password);
      } else {
         // Legacy plain-text password: compare directly, then upgrade to a hash.
         passwordMatches = user.password === password;
         if (passwordMatches) {
            user.password = await bcrypt.hash(password, SALT_ROUNDS);
            await user.save();
         }
      }

      if (!passwordMatches) {
         return res.status(401).json({ error: 'Invalid credentials' });
      }

      req.session.email = user.email;
      req.session.role = user.role;

      const redirect = user.role === 'admin' ? '/admin' : '/home';
      res.status(200).json({ message: 'Login successful', redirect });

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

      const hashedPassword = await bcrypt.hash(password, SALT_ROUNDS);
      const newUser = new User({ name, email, password: hashedPassword });
      await newUser.save();

      res.status(200).json({ message: 'User registered successfully', redirect: '/login' });
   } catch (error) {
      console.error('Signup error:', error);
      res.status(500).json({ error: 'Server error' });
   }
};
