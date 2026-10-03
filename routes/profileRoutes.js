const express = require('express');
const router = express.Router();
const { showProfile, updateProfile } = require('../controllers/profileController');
const { requireAuth } = require('../middlewares/auth');

router.get('/profile', requireAuth, showProfile);
router.post('/profile', requireAuth, updateProfile);

module.exports = router;
