const Appointment = require('../models/Appointment');
const User = require('../models/User');

// GET /admin — dashboard listing all appointments across hospitals, with
// optional search (name/email/department) and hospital filter.
exports.dashboard = async (req, res) => {
  const { q = '', hospital = '' } = req.query;

  try {
    const query = {};
    if (hospital) query.hospital = hospital;
    if (q) {
      const rx = new RegExp(q.trim(), 'i');
      query.$or = [{ name: rx }, { email: rx }, { department: rx }];
    }

    const [appointments, hospitals, totalAppointments, users] = await Promise.all([
      Appointment.find(query).sort({ date: -1 }).limit(500),
      Appointment.distinct('hospital'),
      Appointment.countDocuments(),
      User.find({}, 'name email role').sort({ role: 1, name: 1 }).lean()
    ]);

    res.render('admin', {
      appointments,
      hospitals: hospitals.filter(Boolean).sort(),
      totalAppointments,
      totalUsers: users.length,
      users,
      currentEmail: req.session.email,
      filters: { q, hospital }
    });
  } catch (err) {
    console.error('Admin dashboard error:', err);
    res.status(500).send('Server error');
  }
};

// PUT /admin/users/:id/role — promote or demote a user
exports.setUserRole = async (req, res) => {
  const { role } = req.body;
  if (!['user', 'admin'].includes(role)) {
    return res.status(400).json({ error: 'Role must be "user" or "admin".' });
  }

  try {
    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ error: 'User not found.' });

    // Safety guard: an admin cannot demote their own account — this prevents
    // accidentally removing the last/only admin and locking everyone out.
    if (user.email === req.session.email && role !== 'admin') {
      return res.status(400).json({ error: 'You cannot remove your own admin access.' });
    }

    user.role = role;
    await user.save();
    res.json({ message: `${user.email} is now a${role === 'admin' ? 'n admin' : ' regular user'}.` });
  } catch (err) {
    console.error('Set role error:', err);
    res.status(500).json({ error: 'Server error' });
  }
};

// DELETE /admin/appointments/:id — admins can remove any appointment
exports.deleteAppointment = async (req, res) => {
  try {
    const deleted = await Appointment.findByIdAndDelete(req.params.id);
    if (!deleted) return res.status(404).json({ error: 'Appointment not found.' });
    res.json({ message: 'Appointment deleted.' });
  } catch (err) {
    console.error('Admin delete error:', err);
    res.status(500).json({ error: 'Server error' });
  }
};
