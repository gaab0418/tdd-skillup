const express = require('express');
const router = express.Router();
const userController = require('./userController');
const { isAuthenticated, isAdmin } = require('../../middlewares/auth');

router.use(isAuthenticated, isAdmin);

router.get('/', userController.index);
router.post('/', userController.store);
router.get('/novo', userController.create);
router.get('/:id/editar', userController.edit);
router.post('/:id', userController.update);
router.post('/:id/excluir', userController.destroy);

module.exports = router;

