import dotenv from 'dotenv';
dotenv.config();

import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import morgan from 'morgan';
import cookieParser from 'cookie-parser';
import flash from 'connect-flash';
import expressLayouts from 'express-ejs-layouts';

import sessionConfig from './config/session.js';
import flashMiddleware from './middlewares/flash.js';
import { attachUser } from './middlewares/auth.js';

// Rotas
import indexRoutes from './modules/core/index.js';
import healthRoutes from './modules/core/health.js';
import authRoutes from './modules/auth/auth.js';
import lessonRoutes from './modules/lesson/lessons.js';
import profileRoutes from './modules/user/profile.js';
import userRoutes from './modules/user/users.js';
import adminRoutes from './modules/admin/admin.js';
import contentRoutes from './modules/admin/content.js';
import topicRoutes from './modules/topic/topics.js';
import courseRoutes from './modules/course/courses.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.APP_PORT || 3000;

// ======================
// View Engine
// ======================
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));
app.use(expressLayouts);
app.set('layout', 'layouts/main');

// ======================
// Middlewares
// ======================
app.use(morgan('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

// Session & Flash
app.use(sessionConfig);
app.use(flash());
app.use(flashMiddleware);

// Anexar usuário logado em todas as requests
app.use(attachUser);

// Variáveis globais para views
app.use((req, res, next) => {
  res.locals.currentPath = req.path;
  res.locals.query = req.query;
  next();
});

// ======================
// Rotas
// ======================
app.use('/', indexRoutes);
app.use('/auth', authRoutes);
app.use('/lessons', lessonRoutes);
app.use('/profile', profileRoutes);
app.use('/admin', adminRoutes);
app.use('/admin/cursos', courseRoutes);
app.use('/admin/conteudo', contentRoutes);
app.use('/admin/topicos', topicRoutes);
app.use('/admin/usuarios', userRoutes);
app.use('/health', healthRoutes);

// ======================
// Error Handling
// ======================
app.use((req, res) => {
  res.status(404).render('pages/home/landing', {
    title: '404 - Página não encontrada',
    layout: 'layouts/main',
    lessonCount: 0,
    userCount: 0,
  });
});

app.use((err, req, res, next) => {
  console.error('Erro:', err);
  res.status(500).send('Erro interno do servidor');
});

export default app;
