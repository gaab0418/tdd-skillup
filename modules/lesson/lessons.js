import express from 'express';
const router = express.Router();
import lessonController from './lessonController.js';
import { isAuthenticated  } from '../../middlewares/auth.js';

router.get('/:id', isAuthenticated, lessonController.player);
router.post('/:id/progress', isAuthenticated, lessonController.updateProgress);
router.post('/:id/comments', isAuthenticated, lessonController.addComment);
router.post('/:id/comments/:commentId/like', isAuthenticated, lessonController.toggleLike);

export default router;;
