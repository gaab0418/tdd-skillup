import express from 'express';
const router = express.Router();
import adminController from './adminController.js';
import { isAuthenticated, isAdmin  } from '../../middlewares/auth.js';

router.use(isAuthenticated, isAdmin);

router.get('/', adminController.dashboard);
router.get('/analytics', adminController.analytics);

export default router;;

