import express from 'express';
const router = express.Router();
import homeController from './homeController.js';
import examController from '../exam/examController.js';
import { isAuthenticated  } from '../../middlewares/auth.js';

router.get('/', homeController.landing);
router.get('/browse', homeController.browse);
router.get('/browse/:id', homeController.courseDetail);
router.post('/browse/:id/enroll', isAuthenticated, homeController.enroll);
router.post('/browse/:id/unenroll', isAuthenticated, homeController.unenroll);

// Prova
router.get('/browse/:id/prova', isAuthenticated, examController.renderExam);
router.post('/browse/:id/prova', isAuthenticated, examController.submitExam);

export default router;;
