import express from 'express';
const router = express.Router();
import profileController from './profileController.js';
import certificateController from '../gamification/certificateController.js';
import { isAuthenticated  } from '../../middlewares/auth.js';
import { uploadAvatar  } from '../../middlewares/upload.js';

router.use(isAuthenticated);

router.get('/', profileController.index);
router.get('/course/:id', profileController.myCourse);
router.get('/certificados/:id/download', certificateController.downloadCertificate);
router.get('/settings', profileController.settings);
router.post('/settings', (req, res, next) => {
  uploadAvatar.single('avatar')(req, res, (err) => {
    if (err) {
      req.flash('error', err.message);
      return res.redirect('/profile/settings');
    }
    next();
  });
}, profileController.updateSettings);

export default router;;
