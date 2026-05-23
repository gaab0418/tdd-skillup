import express from 'express';
const router = express.Router();
import contentController from './contentController.js';
import { isAuthenticated, isAdmin  } from '../../middlewares/auth.js';
import multer from 'multer';
import { uploadVideo, uploadThumbnail } from '../../middlewares/upload.js';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

router.use(isAuthenticated, isAdmin);

// Upload fields para criação/edição de lição
const lessonUpload = multer({
  storage: multer.diskStorage({
    destination: (req, file, cb) => {
      const folder = file.fieldname === 'video' ? 'videos' : 'thumbnails';
      cb(null, path.join(__dirname, '..', '..', 'public', 'uploads', folder));
    },
    filename: (req, file, cb) => {
      const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
      cb(null, `${file.fieldname}-${uniqueSuffix}${path.extname(file.originalname)}`);
    },
  }),
}).fields([
  { name: 'video', maxCount: 1 },
  { name: 'thumbnail', maxCount: 1 },
]);

router.get('/', contentController.index);
router.get('/criar', contentController.create);
router.post('/criar', lessonUpload, contentController.store);
router.get('/:id/editar', contentController.edit);
router.post('/:id/editar', lessonUpload, contentController.update);
router.post('/:id/excluir', contentController.destroy);

export default router;;

