const express = require('express');
const router = express.Router();
const adminController = require('./adminController');
const { isAuthenticated, isAdmin } = require('../../middlewares/auth');

router.use(isAuthenticated, isAdmin);

router.get('/', adminController.dashboard);
router.get('/analytics', adminController.analytics);

module.exports = router;

