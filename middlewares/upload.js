import multer from 'multer';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const createStorage = (subfolder) => {
  const uploadPath = path.join(__dirname, '..', 'public', 'uploads', subfolder);
  if (!fs.existsSync(uploadPath)) {
    fs.mkdirSync(uploadPath, { recursive: true });
  }

  return multer.diskStorage({
    destination: (req, file, cb) => cb(null, uploadPath),
    filename: (req, file, cb) => {
      const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
      const ext = path.extname(file.originalname);
      cb(null, `${subfolder}-${uniqueSuffix}${ext}`);
    },
  });
};

const fileFilter = (allowedTypes) => (req, file, cb) => {
  if (allowedTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error(`Tipo de arquivo não permitido. Permitidos: ${allowedTypes.join(', ')}`), false);
  }
};

const maxSize = parseInt(process.env.UPLOAD_MAX_SIZE) || 52428800; // 50MB

export const uploadVideo = multer({
  storage: createStorage('videos'),
  fileFilter: fileFilter(['video/mp4', 'video/webm', 'video/ogg']),
  limits: { fileSize: maxSize },
});

export const uploadThumbnail = multer({
  storage: createStorage('thumbnails'),
  fileFilter: fileFilter(['image/jpeg', 'image/png', 'image/webp']),
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB
});

export const uploadAvatar = multer({
  storage: createStorage('avatars'),
  fileFilter: fileFilter(['image/jpeg', 'image/png', 'image/webp']),
  limits: { fileSize: 2 * 1024 * 1024 }, // 2MB
});


