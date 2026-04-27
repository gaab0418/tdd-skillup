const { User } = require('../models');

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

      if (!email || !password) {
        req.flash('error', 'Preencha todos os campos.');
        return res.redirect('/auth/login');
      }

      const user = await User.findOne({ where: { email } });
      if (!user) {
        req.flash('error', 'E-mail ou senha inválidos.');
        return res.redirect('/auth/login');
      }

      const isValid = await user.comparePassword(password);
      if (!isValid) {
        req.flash('error', 'E-mail ou senha inválidos.');
        return res.redirect('/auth/login');
      }

      req.session.userId = user.id;
      req.flash('success', `Bem-vindo de volta, ${user.name}!`);

      if (user.role === 'admin') {
        return res.redirect('/admin');
      }
      return res.redirect('/browse');
    } catch (error) {
      console.error('Erro no login:', error);
      req.flash('error', 'Erro interno. Tente novamente.');
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

      if (!name || !email || !password || !confirmPassword) {
        req.flash('error', 'Preencha todos os campos.');
        return res.redirect('/auth/register');
      }

      if (password !== confirmPassword) {
        req.flash('error', 'As senhas não coincidem.');
        return res.redirect('/auth/register');
      }

      if (password.length < 6) {
        req.flash('error', 'A senha deve ter no mínimo 6 caracteres.');
        return res.redirect('/auth/register');
      }

      const existingUser = await User.findOne({ where: { email } });
      if (existingUser) {
        req.flash('error', 'Este e-mail já está cadastrado.');
        return res.redirect('/auth/register');
      }

      await User.create({ name, email, password });

      req.flash('success', 'Conta criada com sucesso! Faça login.');
      return res.redirect('/auth/login');
    } catch (error) {
      console.error('Erro no registro:', error);
      if (error.name === 'SequelizeValidationError') {
        const messages = error.errors.map((e) => e.message);
        req.flash('error', messages.join(', '));
      } else {
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

module.exports = authController;
