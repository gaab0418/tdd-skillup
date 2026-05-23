const express = require('express');
const router = express.Router();
const lessonController = require('./lessonController');
const { isAuthenticated } = require('../../middlewares/auth');

router.get('/:id', isAuthenticated, lessonController.player);
router.post('/:id/progress', isAuthenticated, lessonController.updateProgress);
router.post('/:id/comments', isAuthenticated, lessonController.addComment);

module.exports = router;

