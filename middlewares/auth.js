const { User } = require('../models');

/**
 * Middleware que verifica se o usuário está autenticado
 */
const isAuthenticated = (req, res, next) => {
  if (req.session && req.session.userId) {
    return next();
  }
  req.flash('error', 'Você precisa estar logado para acessar esta página.');
  return res.redirect('/auth/login');
};

/**
 * Middleware que verifica se o usuário é admin
 */
const isAdmin = (req, res, next) => {
  if (req.session && req.session.userId && res.locals.user && res.locals.user.role === 'admin') {
    return next();
  }
  req.flash('error', 'Acesso restrito a administradores.');
  return res.redirect('/');
};

/**
 * Middleware global que anexa o usuário logado em res.locals
 */
const attachUser = async (req, res, next) => {
  res.locals.user = null;
  if (req.session && req.session.userId) {
    try {
      const user = await User.findByPk(req.session.userId, {
        attributes: { exclude: ['password'] },
      });
      if (user) {
        res.locals.user = user;
      } else {
        req.session.destroy();
      }
    } catch (err) {
      console.error('Erro ao anexar usuário:', err);
    }
  }
  next();
};

module.exports = { isAuthenticated, isAdmin, attachUser };
