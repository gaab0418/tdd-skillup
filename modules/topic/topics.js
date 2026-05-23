import express from 'express';
const router = express.Router();
import topicController from './topicController.js';
import { isAuthenticated, isAdmin  } from '../../middlewares/auth.js';

router.use(isAuthenticated, isAdmin);

router.get('/', topicController.index);
router.get('/criar', topicController.create);
router.post('/', topicController.store);
router.get('/:id/editar', topicController.edit);
router.post('/:id', topicController.update);
router.post('/:id/excluir', topicController.destroy);

export default router;;

