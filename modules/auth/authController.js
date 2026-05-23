import { authService, AuthError } from './authService.js';

const authController = {
  /** GET /auth/login */
  loginPage: (req, res) => {
    res.render('pages/auth/login', {
      title: 'Login - SkillUp',
      layout: 'layouts/auth',
    });
  },

  /** POST /auth/login */
  login: async (req, res) => {
    try {
      const { email, password } = req.body;
      const user = await authService.login(email, password);

      req.session.userId = user.id;
      req.flash('success', `Bem-vindo de volta, ${user.name}!`);

      if (user.role === 'admin') {
        return res.redirect('/admin');
      }
      return res.redirect('/browse');
    } catch (error) {
      if (error instanceof AuthError) {
        req.flash('error', error.message);
      } else {
        console.error('Erro no login:', error);
        req.flash('error', 'Erro interno. Tente novamente.');
      }
      return res.redirect('/auth/login');
    }
  },

  /** GET /auth/register */
  registerPage: (req, res) => {
    res.render('pages/auth/register', {
      title: 'Cadastro - SkillUp',
      layout: 'layouts/auth',
    });
  },

  /** POST /auth/register */
  register: async (req, res) => {
    try {
      const { name, email, password, confirmPassword } = req.body;
      await authService.register(name, email, password, confirmPassword);

      req.flash('success', 'Conta criada com sucesso! Faça login.');
      return res.redirect('/auth/login');
    } catch (error) {
      if (error instanceof AuthError) {
        req.flash('error', error.message);
      } else if (error.name === 'SequelizeValidationError') {
        const messages = error.errors.map((e) => e.message);
        req.flash('error', messages.join(', '));
      } else {
        console.error('Erro no registro:', error);
        req.flash('error', 'Erro interno. Tente novamente.');
      }
      return res.redirect('/auth/register');
    }
  },

  /** GET /auth/logout */
  logout: (req, res) => {
    req.session.destroy((err) => {
      if (err) console.error('Erro ao destruir sessão:', err);
      res.redirect('/');
    });
  },
};

export default authController;
