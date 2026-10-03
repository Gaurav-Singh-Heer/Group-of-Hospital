const bcrypt = require('bcryptjs');
const User = require('../models/User');
const Appointment = require('../models/Appointment');

const SALT_ROUNDS = 10;
const isHashed = (pwd) => typeof pwd === 'string' && /^\$2[aby]\$/.test(pwd);

// GET /profile — show account details + a quick appointment count
exports.showProfile = async (req, res) => {
  try {
    const user = await User.findOne({ email: req.session.email });
    if (!user) return res.redirect('/login');

    const appointmentCount = await Appointment.countDocuments({ email: user.email });
    res.render('profile', { user, appointmentCount, message: null, error: null });
  } catch (err) {
    console.error('Profile load error:', err);
    res.status(500).send('Server error');
  }
};

// POST /profile — update name and/or password
exports.updateProfile = async (req, res) => {
  const { name, currentPassword, newPassword } = req.body;

  try {
    const user = await User.findOne({ email: req.session.email });
    if (!user) return res.redirect('/login');

    const render = (opts) =>
      Appointment.countDocuments({ email: user.email }).then((appointmentCount) =>
        res.render('profile', Object.assign({ user, appointmentCount, message: null, error: null }, opts))
      );

    // Update display name
    if (name && name.trim()) {
      user.name = name.trim();
    }

    // Optional password change — requires the correct current password
    if (newPassword) {
      let currentOk;
      if (isHashed(user.password)) {
        currentOk = await bcrypt.compare(currentPassword || '', user.password);
      } else {
        currentOk = user.password === (currentPassword || '');
      }
      if (!currentOk) {
        return render({ error: 'Current password is incorrect.' });
      }
      if (newPassword.length < 8) {
        return render({ error: 'New password must be at least 8 characters.' });
      }
      user.password = await bcrypt.hash(newPassword, SALT_ROUNDS);
    }

    await user.save();
    return render({ message: 'Profile updated successfully.' });
  } catch (err) {
    console.error('Profile update error:', err);
    res.status(500).send('Server error');
  }
};
