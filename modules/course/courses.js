import express from 'express';
const router = express.Router();
import courseController from './courseController.js';
import examAdminController from '../exam/examAdminController.js';
import { isAuthenticated, isAdmin  } from '../../middlewares/auth.js';
import multer from 'multer';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

router.use(isAuthenticated, isAdmin);

const courseUpload = multer({
  storage: multer.diskStorage({
    destination: (req, file, cb) => {
      cb(null, path.join(__dirname, '..', '..', 'public', 'uploads', 'thumbnails'));
    },
    filename: (req, file, cb) => {
      const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
      cb(null, `${file.fieldname}-${uniqueSuffix}${path.extname(file.originalname)}`);
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

export default router;;

