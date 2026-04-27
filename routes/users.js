const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');
const { isAuthenticated, isAdmin } = require('../middlewares/auth');

router.use(isAuthenticated, isAdmin);

router.get('/', userController.index);
router.get('/:id/edit', userController.edit);
router.post('/:id', userController.update);
router.post('/:id/delete', userController.destroy);

module.exports = router;
