require('dotenv').config();

const express = require('express');
const path = require('path');
const morgan = require('morgan');
const cookieParser = require('cookie-parser');
const flash = require('connect-flash');
const expressLayouts = require('express-ejs-layouts');

const sessionConfig = require('./config/session');
const flashMiddleware = require('./middlewares/flash');
const { attachUser } = require('./middlewares/auth');

// Rotas
const indexRoutes = require('./modules/core/index');
const healthRoutes = require('./modules/core/health');
const authRoutes = require('./modules/auth/auth');
const lessonRoutes = require('./modules/lesson/lessons');
const profileRoutes = require('./modules/user/profile');
const userRoutes = require('./modules/user/users');
const adminRoutes = require('./modules/admin/admin');
const contentRoutes = require('./modules/admin/content');
const topicRoutes = require('./modules/topic/topics');
const courseRoutes = require('./modules/course/courses');

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

module.exports = app;
