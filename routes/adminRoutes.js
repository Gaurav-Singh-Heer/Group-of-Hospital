const express = require('express');
const router = express.Router();
const { dashboard, deleteAppointment, setUserRole } = require('../controllers/adminController');
const { requireAuth, requireAdmin } = require('../middlewares/auth');

router.get('/admin', requireAuth, requireAdmin, dashboard);
router.delete('/admin/appointments/:id', requireAuth, requireAdmin, deleteAppointment);
router.put('/admin/users/:id/role', requireAuth, requireAdmin, setUserRole);

module.exports = router;
