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
    buscarDadosPorCep: vi.fn(),
    buscarCepPorEndereco: vi.fn(),
    salvarDadosComplementares: vi.fn(),
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

  // ============================================================
  // CRUD de Usuários (Nota 8 — Integração com Supertest)
  // ============================================================
  it('[RF-12] GET /admin/usuarios deve retornar 200 e listar os usuários', async () => {
    userService.listUsers.mockResolvedValue({ users: [], count: 0, totalPages: 1 });
    const res = await request(app).get('/admin/usuarios');
    expect(res.status).toBe(200);
    expect(userService.listUsers).toHaveBeenCalled();
  });

  it('[RF-01] GET /admin/usuarios/novo deve retornar 200 e carregar formulário', async () => {
    userService.getCoursesForAssignment.mockResolvedValue([]);
    const res = await request(app).get('/admin/usuarios/novo');
    expect(res.status).toBe(200);
    expect(userService.getCoursesForAssignment).toHaveBeenCalled();
  });

  it('[RF-01] POST /admin/usuarios deve redirecionar (302) para lista após sucesso na criação', async () => {
    userService.createUser.mockResolvedValue({ id: 2, name: 'Teste' });
    const res = await request(app)
      .post('/admin/usuarios')
      .send({ name: 'Teste', email: 'teste@teste.com' });
      
    expect(res.status).toBe(302);
    expect(res.headers.location).toBe('/admin/usuarios');
    expect(userService.createUser).toHaveBeenCalled();
  });

  it('[RF-01] POST /admin/usuarios deve voltar para o formulário (302) em caso de erro', async () => {
    userService.createUser.mockRejectedValue(new UserServiceError('E-mail já existe'));
    const res = await request(app)
      .post('/admin/usuarios')
      .send({ email: 'duplicado@teste.com' });

    expect(res.status).toBe(302);
    expect(res.headers.location).toBe('/admin/usuarios/novo');
  });

  it('[RF-12] POST /admin/usuarios/:id/excluir deve chamar serviço de exclusão e redirecionar', async () => {
    userService.deleteUser.mockResolvedValue(true);
    const res = await request(app).post('/admin/usuarios/2/excluir');

    expect(res.status).toBe(302);
    expect(res.headers.location).toBe('/admin/usuarios');
    expect(userService.deleteUser).toHaveBeenCalledWith('2', 1);
  });

  it('[RF-12] POST /admin/usuarios/:id/excluir deve redirecionar com erro ao tentar excluir a si mesmo', async () => {
    userService.deleteUser.mockRejectedValue(new UserServiceError('Voce nao pode excluir sua propria conta.'));
    const res = await request(app).post('/admin/usuarios/1/excluir');

    expect(res.status).toBe(302);
    expect(res.headers.location).toBe('/admin/usuarios');
  });

  it('[RF-12] POST /admin/usuarios/:id deve redirecionar após atualização bem-sucedida', async () => {
    userService.updateUser.mockResolvedValue({ id: 3, name: 'Atualizado' });
    const res = await request(app)
      .post('/admin/usuarios/3')
      .send({ name: 'Atualizado', email: 'atualizado@teste.com', role: 'user' });

    expect(res.status).toBe(302);
    expect(res.headers.location).toBe('/admin/usuarios');
    expect(userService.updateUser).toHaveBeenCalled();
  });

  it('[RF-12] POST /admin/usuarios/:id deve redirecionar para edição em caso de erro na atualização', async () => {
    userService.updateUser.mockRejectedValue(new UserServiceError('Usuario nao encontrado.'));
    const res = await request(app)
      .post('/admin/usuarios/99')
      .send({ name: 'Fantasma' });

    expect(res.status).toBe(302);
    expect(res.headers.location).toContain('/admin/usuarios/99');
  });
});

// ============================================================
// Rotas da API do ViaCEP (Nota 9 — Integração com Supertest)
// ============================================================
describe('Rotas de API ViaCEP (Nota 9)', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('[Nota 9] GET /profile/api/cep deve retornar JSON do endereço quando CEP é válido', async () => {
    userService.buscarDadosPorCep.mockResolvedValue({
      cep: '89231-630', logradouro: 'Rua General', bairro: 'Paranaguamirim', localidade: 'Joinville', uf: 'SC'
    });

    const res = await request(app).get('/profile/api/cep?cep=89231630');

    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty('localidade', 'Joinville');
    expect(userService.buscarDadosPorCep).toHaveBeenCalledWith('89231630');
  });

  it('[Nota 9] GET /profile/api/cep deve retornar 400 com mensagem de erro quando CEP é inválido', async () => {
    userService.buscarDadosPorCep.mockRejectedValue(new UserServiceError('CEP inválido.'));

    const res = await request(app).get('/profile/api/cep?cep=123');

    expect(res.status).toBe(400);
    expect(res.body).toHaveProperty('erro', true);
    expect(res.body).toHaveProperty('mensagem', 'CEP inválido.');
  });

  it('[Nota 9] GET /profile/api/cep/buscar deve retornar array de endereços por texto', async () => {
    userService.buscarCepPorEndereco.mockResolvedValue([
      { cep: '89201-010', logradouro: 'Rua Quinze de Novembro', localidade: 'Joinville', uf: 'SC' }
    ]);

    const res = await request(app).get('/profile/api/cep/buscar?uf=SC&cidade=Joinville&rua=Novembro');

    expect(res.status).toBe(200);
    expect(res.body).toHaveLength(1);
    expect(res.body[0]).toHaveProperty('cep', '89201-010');
    expect(userService.buscarCepPorEndereco).toHaveBeenCalledWith('SC', 'Joinville', 'Novembro');
  });

  it('[Nota 9] GET /profile/api/cep/buscar deve retornar 400 quando parâmetros estão faltando', async () => {
    userService.buscarCepPorEndereco.mockRejectedValue(new UserServiceError('UF, Cidade e Rua são obrigatórios.'));

    const res = await request(app).get('/profile/api/cep/buscar?uf=SC&cidade=&rua=');

    expect(res.status).toBe(400);
    expect(res.body).toHaveProperty('erro', true);
  });

  it('[Nota 9] POST /profile/cadastro-complementar deve salvar e redirecionar para settings', async () => {
    userService.salvarDadosComplementares.mockResolvedValue({ id: 1 });

    const res = await request(app)
      .post('/profile/cadastro-complementar')
      .send({
        telefone: '(47) 99921-2614',
        genero: 'Masculino',
        cep: '89231-630',
        rua: 'Rua General',
        bairro: 'Paranaguamirim',
        cidade: 'Joinville',
        estado: 'SC',
        complemento: ''
      });

    expect(res.status).toBe(302);
    expect(res.headers.location).toBe('/profile/settings');
    expect(userService.salvarDadosComplementares).toHaveBeenCalledWith(1, expect.objectContaining({
      telefone: '(47) 99921-2614',
      cep: '89231-630'
    }));
  });

  it('[Nota 9] POST /profile/cadastro-complementar deve redirecionar com erro quando falha', async () => {
    userService.salvarDadosComplementares.mockRejectedValue(new UserServiceError('Usuário não encontrado.'));

    const res = await request(app)
      .post('/profile/cadastro-complementar')
      .send({ telefone: '123' });

    expect(res.status).toBe(302);
    expect(res.headers.location).toBe('/profile/settings');
  });
});
