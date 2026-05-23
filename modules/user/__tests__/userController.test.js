import { describe, it, expect, vi, beforeEach } from 'vitest';
import request from 'supertest';
import app from '../../../app.js';
import { userService, UserServiceError } from '../userService.js';

// Mock do middleware de autenticação
vi.mock('../../../middlewares/auth.js', () => ({
  isAuthenticated: (req, res, next) => {
    if (!req.session) req.session = {};
    req.session.userId = 1;
    next();
  },
  isAdmin: (req, res, next) => {
    res.locals.user = { id: 1, role: 'admin', name: 'Admin' };
    next();
  },
  attachUser: (req, res, next) => {
    if (!req.session) req.session = {};
    req.session.userId = 1;
    res.locals.user = { id: 1, role: 'admin', name: 'Admin' };
    next();
  }
}));

// Mock do userService para focar apenas nas rotas
vi.mock('../userService.js', () => ({
  userService: {
    listUsers: vi.fn(),
    getCoursesForAssignment: vi.fn(),
    createUser: vi.fn(),
    getUserById: vi.fn(),
    updateUser: vi.fn(),
    deleteUser: vi.fn(),
  },
  UserServiceError: class extends Error {
    constructor(message) { super(message); this.name = 'UserServiceError'; }
  }
}));

// Mock models para evitar acessos reais ao banco que possam vazar
vi.mock('../../../models/index.js', () => {
  const db = {
    User: { findByPk: vi.fn() },
    Course: { findAll: vi.fn() },
    UserCourse: { bulkCreate: vi.fn() }
  };
  return {
    default: db,
    User: db.User,
    Course: db.Course,
    UserCourse: db.UserCourse
  };
});

describe('UserController Integration Tests (Rotas /admin/usuarios)', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('GET /admin/usuarios deve retornar 200 e listar os usuários', async () => {
    userService.listUsers.mockResolvedValue({ users: [], count: 0, totalPages: 1 });
    const res = await request(app).get('/admin/usuarios');
    expect(res.status).toBe(200);
    expect(userService.listUsers).toHaveBeenCalled();
  });

  it('GET /admin/usuarios/novo deve retornar 200 e carregar formulário', async () => {
    userService.getCoursesForAssignment.mockResolvedValue([]);
    const res = await request(app).get('/admin/usuarios/novo');
    expect(res.status).toBe(200);
    expect(userService.getCoursesForAssignment).toHaveBeenCalled();
  });

  it('POST /admin/usuarios deve redirecionar (302) para lista após sucesso na criação', async () => {
    userService.createUser.mockResolvedValue({ id: 2, name: 'Teste' });
    const res = await request(app)
      .post('/admin/usuarios')
      .send({ name: 'Teste', email: 'teste@teste.com' });
      
    expect(res.status).toBe(302);
    expect(res.headers.location).toBe('/admin/usuarios');
    expect(userService.createUser).toHaveBeenCalled();
  });

  it('POST /admin/usuarios deve voltar para o formulário (302) em caso de erro', async () => {
    userService.createUser.mockRejectedValue(new UserServiceError('E-mail já existe'));
    const res = await request(app)
      .post('/admin/usuarios')
      .send({ email: 'duplicado@teste.com' });

    expect(res.status).toBe(302);
    expect(res.headers.location).toBe('/admin/usuarios/novo');
  });

  it('POST /admin/usuarios/:id/excluir deve chamar serviço de exclusão e redirecionar', async () => {
    userService.deleteUser.mockResolvedValue(true);
    const res = await request(app).post('/admin/usuarios/2/excluir');

    expect(res.status).toBe(302);
    expect(res.headers.location).toBe('/admin/usuarios');
    // Verifica se pegou o req.params.id e o req.session.userId (mockado como 1 no topo)
    expect(userService.deleteUser).toHaveBeenCalledWith('2', 1);
  });
});
