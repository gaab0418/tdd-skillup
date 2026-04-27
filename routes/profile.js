const express = require('express');
const router = express.Router();
const profileController = require('../controllers/profileController');
const { isAuthenticated } = require('../middlewares/auth');
const { uploadAvatar } = require('../middlewares/upload');

router.use(isAuthenticated);

router.get('/', profileController.index);
router.get('/settings', profileController.settings);
router.post('/settings', uploadAvatar.single('avatar'), profileController.updateSettings);

module.exports = router;
