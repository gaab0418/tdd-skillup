import { describe, it, expect, vi, beforeEach } from 'vitest';
import User from '../User.js';
import bcrypt from 'bcryptjs';

vi.spyOn(bcrypt, 'genSalt').mockResolvedValue('randomsalt');
vi.spyOn(bcrypt, 'hash').mockResolvedValue('hashedpassword123');

describe('UserModel Validações e Hooks', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('RF-01 e Limitações de Entidade', () => {
    it('[RF-01] deve lançar erro de validação se a senha for muito curta (< 6 caracteres)', async () => {
      const user = User.build({
        name: 'Teste',
        email: 'teste@teste.com',
        password: '123' // Senha inválida
      });

      await expect(user.validate()).rejects.toThrow('Senha deve ter no mínimo 6 caracteres');
    });

    it('[RF-01] deve lançar erro de validação se nome não for enviado', async () => {
      const user = User.build({
        email: 'teste@teste.com',
        password: 'password123'
      });

      await expect(user.validate()).rejects.toThrow('User.name cannot be null');
    });
  });

  describe('RNF-01 - Segurança (Criptografia)', () => {
    it('[RNF-01] deve realizar hash da senha usando bcryptjs no hook beforeCreate', async () => {
      const user = User.build({
        name: 'Teste',
        email: 'teste@teste.com',
        password: 'minhasenhaforte'
      });

      await User.runHooks('beforeCreate', user);

      expect(bcrypt.genSalt).toHaveBeenCalledWith(12);
      expect(bcrypt.hash).toHaveBeenCalledWith('minhasenhaforte', 'randomsalt');
      expect(user.password).toBe('hashedpassword123');
    });

    it('[RNF-01] deve realizar hash da senha no hook beforeUpdate caso a senha seja alterada', async () => {
      const user = User.build({
        name: 'Teste',
        email: 'teste@teste.com',
        password: 'senha'
      }, { isNewRecord: false });

      user.changed = vi.fn().mockImplementation((field) => field === 'password');

      await User.runHooks('beforeUpdate', user);

      expect(bcrypt.hash).toHaveBeenCalled();
      expect(user.password).toBe('hashedpassword123');
    });
  });
});
