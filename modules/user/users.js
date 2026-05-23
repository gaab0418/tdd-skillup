import express from 'express';
const router = express.Router();
import userController from './userController.js';
import { isAuthenticated, isAdmin  } from '../../middlewares/auth.js';

router.use(isAuthenticated, isAdmin);

router.get('/', userController.index);
router.post('/', userController.store);
router.get('/novo', userController.create);
router.get('/:id/editar', userController.edit);
router.post('/:id', userController.update);
router.post('/:id/excluir', userController.destroy);

export default router;;

