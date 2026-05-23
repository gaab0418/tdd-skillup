const express = require('express');
const router = express.Router();
const contentController = require('./contentController');
const { isAuthenticated, isAdmin } = require('../../middlewares/auth');
const multer = require('multer');
const { uploadVideo, uploadThumbnail } = require('../../middlewares/upload');

router.use(isAuthenticated, isAdmin);

// Upload fields para criação/edição de lição
const lessonUpload = multer({
  storage: multer.diskStorage({
    destination: (req, file, cb) => {
      const path = require('path');
      const folder = file.fieldname === 'video' ? 'videos' : 'thumbnails';
      cb(null, require('path').join(__dirname, '..', '..', 'public', 'uploads', folder));
    },
    filename: (req, file, cb) => {
      const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
      cb(null, `${file.fieldname}-${uniqueSuffix}${require('path').extname(file.originalname)}`);
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

module.exports = router;

