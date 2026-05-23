import { describe, it, expect, vi, beforeEach } from 'vitest';
import { userService, UserServiceError } from '../userService.js';
import { User, Course, UserCourse } from '../../../models/index.js';
import { Op } from 'sequelize';

vi.mock('../../../models/index.js', () => {
  return {
    User: {
      findAndCountAll: vi.fn(),
      findOne: vi.fn(),
      create: vi.fn(),
      findByPk: vi.fn(),
      destroy: vi.fn(),
    },
    Course: {
      findAll: vi.fn(),
    },
    UserCourse: {
      bulkCreate: vi.fn(),
      destroy: vi.fn(),
    }
  };
});

describe('UserService', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('createUser', () => {
    it('deve lançar erro se o email já estiver cadastrado', async () => {
      User.findOne.mockResolvedValue({ id: 1, email: 'teste@teste.com' });

      await expect(userService.createUser({ email: 'teste@teste.com' }))
        .rejects
        .toThrow(UserServiceError);
      
      expect(User.findOne).toHaveBeenCalledTimes(1);
    });

    it('deve criar um usuário com sucesso sem cursos atrelados', async () => {
      User.findOne.mockResolvedValue(null);
      User.create.mockResolvedValue({ id: 1, name: 'João', email: 'joao@teste.com' });

      const result = await userService.createUser({ name: 'João', email: 'joao@teste.com' });
      
      expect(result).toHaveProperty('id', 1);
      expect(User.create).toHaveBeenCalledWith(expect.objectContaining({ name: 'João', email: 'joao@teste.com' }));
      expect(UserCourse.bulkCreate).not.toHaveBeenCalled();
    });

    it('deve criar um usuário e atrelar cursos usando bulkCreate', async () => {
      User.findOne.mockResolvedValue(null);
      User.create.mockResolvedValue({ id: 2, name: 'Maria' });

      await userService.createUser({ name: 'Maria' }, [1, 2]);

      expect(UserCourse.bulkCreate).toHaveBeenCalledWith([
        { userId: 2, courseId: 1 },
        { userId: 2, courseId: 2 }
      ]);
    });
  });

  describe('getUserById', () => {
    it('deve lançar erro quando usuário não for encontrado', async () => {
      User.findByPk.mockResolvedValue(null);

      await expect(userService.getUserById(99)).rejects.toThrow('Usuario nao encontrado.');
      expect(User.findByPk).toHaveBeenCalledWith(99, expect.any(Object));
    });

    it('deve retornar o usuário corretamente se ele existir', async () => {
      User.findByPk.mockResolvedValue({ id: 1, name: 'Admin' });

      const user = await userService.getUserById(1);

      expect(user.name).toBe('Admin');
    });
  });

  describe('updateUser', () => {
    it('deve lançar erro se o usuário não existir para atualização', async () => {
      User.findByPk.mockResolvedValue(null);

      await expect(userService.updateUser(99, {})).rejects.toThrow('Usuario nao encontrado.');
    });

    it('deve atualizar os dados do usuário com sucesso (sem cursos)', async () => {
      const mockUser = {
        id: 1,
        name: 'Antigo',
        save: vi.fn().mockResolvedValue(true)
      };
      User.findByPk.mockResolvedValue(mockUser);

      await userService.updateUser(1, { name: 'Novo', email: 'novo@teste.com' });

      expect(mockUser.name).toBe('Novo');
      expect(mockUser.email).toBe('novo@teste.com');
      expect(mockUser.save).toHaveBeenCalled();
      expect(UserCourse.bulkCreate).not.toHaveBeenCalled();
    });

    it('deve atualizar os cursos do usuário caso enviados', async () => {
      const mockUser = {
        id: 1,
        save: vi.fn().mockResolvedValue(true)
      };
      User.findByPk.mockResolvedValue(mockUser);

      await userService.updateUser(1, { name: 'João' }, [3, 4]);

      expect(UserCourse.destroy).toHaveBeenCalledWith({ where: { userId: 1 } });
      expect(UserCourse.bulkCreate).toHaveBeenCalledWith([
        { userId: 1, courseId: 3 },
        { userId: 1, courseId: 4 }
      ]);
    });
  });

  describe('deleteUser', () => {
    it('deve lançar erro se o usuário tentar deletar a própria conta', async () => {
      const mockUser = { id: 1 };
      User.findByPk.mockResolvedValue(mockUser);

      await expect(userService.deleteUser(1, 1)).rejects.toThrow('Voce nao pode excluir sua propria conta.');
    });

    it('deve lançar erro ao tentar deletar um usuário inexistente', async () => {
      User.findByPk.mockResolvedValue(null);

      await expect(userService.deleteUser(99, 1)).rejects.toThrow('Usuario nao encontrado.');
    });

    it('deve excluir o usuário com sucesso', async () => {
      const mockUser = {
        id: 2,
        destroy: vi.fn().mockResolvedValue(true)
      };
      User.findByPk.mockResolvedValue(mockUser);

      const result = await userService.deleteUser(2, 1);

      expect(result).toBe(true);
      expect(mockUser.destroy).toHaveBeenCalled();
    });
  });

  describe('listUsers', () => {
    it('deve listar usuários com paginação e filtros se houver search', async () => {
      User.findAndCountAll.mockResolvedValue({
        rows: [{ id: 1 }],
        count: 1
      });

      const result = await userService.listUsers('João', 1, 10);

      expect(result).toHaveProperty('totalPages', 1);
      expect(User.findAndCountAll).toHaveBeenCalledWith(expect.objectContaining({
        where: expect.any(Object),
        limit: 10,
        offset: 0
      }));
    });
  });

  describe('getCoursesForAssignment', () => {
    it('deve listar os cursos publicados', async () => {
      Course.findAll.mockResolvedValue([{ id: 1, title: 'Curso Teste' }]);

      const result = await userService.getCoursesForAssignment();

      expect(result.length).toBe(1);
      expect(Course.findAll).toHaveBeenCalledWith(expect.objectContaining({
        where: { status: 'published' }
      }));
    });
  });
});
