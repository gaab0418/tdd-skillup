const express = require('express');
const router = express.Router();
const topicController = require('../controllers/topicController');
const { isAuthenticated, isAdmin } = require('../middlewares/auth');

router.use(isAuthenticated, isAdmin);

router.get('/', topicController.index);
router.get('/create', topicController.create);
router.post('/', topicController.store);
router.get('/:id/edit', topicController.edit);
router.post('/:id', topicController.update);
router.post('/:id/delete', topicController.destroy);

module.exports = router;
