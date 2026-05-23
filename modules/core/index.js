const express = require('express');
const router = express.Router();
const homeController = require('./homeController');
const examController = require('../exam/examController');
const { isAuthenticated } = require('../../middlewares/auth');

router.get('/', homeController.landing);
router.get('/browse', homeController.browse);
router.get('/browse/:id', homeController.courseDetail);
router.post('/browse/:id/enroll', isAuthenticated, homeController.enroll);
router.post('/browse/:id/unenroll', isAuthenticated, homeController.unenroll);

// Prova
router.get('/browse/:id/prova', isAuthenticated, examController.renderExam);
router.post('/browse/:id/prova', isAuthenticated, examController.submitExam);

module.exports = router;
