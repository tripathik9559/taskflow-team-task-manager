// routes/dashboard.js
const express = require('express');
const router = express.Router();
const { verifyToken, adminOnly } = require('../middleware/auth');
const { getDashboard, getAllUsers, getActivityLog } = require('../controllers/dashboardController');

router.get('/', verifyToken, getDashboard);
router.get('/users', verifyToken, adminOnly, getAllUsers);
router.get('/activity', verifyToken, getActivityLog);

module.exports = router;
