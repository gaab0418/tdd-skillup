const express = require('express');
const router = express.Router();
const courseController = require('./courseController');
const examAdminController = require('../exam/examAdminController');
const { isAuthenticated, isAdmin } = require('../../middlewares/auth');
const multer = require('multer');

router.use(isAuthenticated, isAdmin);

const courseUpload = multer({
  storage: multer.diskStorage({
    destination: (req, file, cb) => {
      cb(null, require('path').join(__dirname, '..', '..', 'public', 'uploads', 'thumbnails'));
    },
    filename: (req, file, cb) => {
      const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
      cb(null, `${file.fieldname}-${uniqueSuffix}${require('path').extname(file.originalname)}`);
    },
  }),
}).fields([
  { name: 'thumbnail', maxCount: 1 },
]);

router.get('/', courseController.index);
router.get('/criar', courseController.create);
router.post('/criar', courseUpload, courseController.store);
router.get('/:id/editar', courseController.edit);
router.post('/:id/editar', courseUpload, courseController.update);
router.post('/:id/excluir', courseController.destroy);

router.get('/:id/prova', examAdminController.manageExam);
router.post('/:id/prova', examAdminController.saveExam);
router.post('/:id/prova/questao', examAdminController.addQuestion);
router.post('/:id/prova/questao/:questionId/excluir', examAdminController.deleteQuestion);

module.exports = router;

