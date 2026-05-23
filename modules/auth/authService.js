import { User } from '../../models/index.js';

class AuthError extends Error {
  constructor(message) {
    super(message);
    this.name = 'AuthError';
  }
}

const authService = {
  async login(email, password) {
    if (!email || !password) {
      throw new AuthError('Preencha todos os campos.');
    }

    const user = await User.findOne({ where: { email } });
    if (!user) {
      throw new AuthError('E-mail ou senha inválidos.');
    }

    const isValid = await user.comparePassword(password);
    if (!isValid) {
      throw new AuthError('E-mail ou senha inválidos.');
    }

    return user;
  },

  async register(name, email, password, confirmPassword) {
    if (!name || !email || !password || !confirmPassword) {
      throw new AuthError('Preencha todos os campos.');
    }

    if (password !== confirmPassword) {
      throw new AuthError('As senhas não coincidem.');
    }

    if (password.length < 6) {
      throw new AuthError('A senha deve ter no mínimo 6 caracteres.');
    }

    const existingUser = await User.findOne({ where: { email } });
    if (existingUser) {
      throw new AuthError('Este e-mail já está cadastrado.');
    }

    const user = await User.create({ name, email, password });
    return user;
  }
};

export { authService, AuthError };
