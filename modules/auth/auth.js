import express from 'express';
const router = express.Router();
import authController from './authController.js';

router.get('/login', authController.loginPage);
router.post('/login', authController.login);
router.get('/register', authController.registerPage);
router.post('/register', authController.register);
router.get('/logout', authController.logout);

export default router;;

