const express = require('express');
const router = express.Router();
const topicController = require('../controllers/topicController');
const { isAuthenticated, isAdmin } = require('../middlewares/auth');

router.use(isAuthenticated, isAdmin);

router.get('/', topicController.index);
router.get('/criar', topicController.create);
router.post('/', topicController.store);
router.get('/:id/editar', topicController.edit);
router.post('/:id', topicController.update);
router.post('/:id/excluir', topicController.destroy);

module.exports = router;
