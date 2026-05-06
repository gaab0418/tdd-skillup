require('dotenv').config();
const { execSync } = require('child_process');

const express = require('express');
const path = require('path');
const morgan = require('morgan');
const cookieParser = require('cookie-parser');
const flash = require('connect-flash');
const expressLayouts = require('express-ejs-layouts');

const sessionConfig = require('./config/session');
const flashMiddleware = require('./middlewares/flash');
const { attachUser } = require('./middlewares/auth');
const { sequelize } = require('./models');

// Rotas
const indexRoutes = require('./routes/index');
const authRoutes = require('./routes/auth');
const lessonRoutes = require('./routes/lessons');
const profileRoutes = require('./routes/profile');
const adminRoutes = require('./routes/admin');
const contentRoutes = require('./routes/content');
const topicRoutes = require('./routes/topics');
const userRoutes = require('./routes/users');
const healthRoutes = require('./routes/health');

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
app.use('/admin/content', contentRoutes);
app.use('/admin/topics', topicRoutes);
app.use('/admin/users', userRoutes);
app.use('/api/health', healthRoutes);

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

// ======================
// Start Server
// ======================
const startServer = async () => {
  try {
    // Rodar testes antes de iniciar o servidor
    console.log('Executando testes antes de iniciar...');
    try {
      execSync('npx vitest run', { stdio: 'inherit', cwd: __dirname });
      console.log('Todos os testes passaram!');
    } catch (testError) {
      console.error('Testes falharam! Servidor não será iniciado.');
      process.exit(1);
    }

    await sequelize.authenticate();
    console.log('Conexão com o banco de dados estabelecida.');

    await sequelize.sync({ alter: process.env.NODE_ENV === 'development' });
    console.log('Modelos sincronizados com o banco de dados.');

    app.listen(PORT, () => {
      console.log(`SkillUp rodando em http://localhost:${PORT}`);
    });
  } catch (error) {
    console.error('Erro ao iniciar servidor:', error);
    process.exit(1);
  }
};

startServer();

module.exports = app;
