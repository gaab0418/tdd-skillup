import { describe, it, expect, vi, beforeEach } from 'vitest';
import request from 'supertest';
import app from '../../../app.js';
import { courseService, CourseServiceError } from '../courseService.js';

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
  },
}));

// Mock do courseService
vi.mock('../courseService.js', () => ({
  courseService: {
    getAllCourses: vi.fn(),
    createCourse: vi.fn(),
    getCourseById: vi.fn(),
    updateCourse: vi.fn(),
    deleteCourse: vi.fn(),
  },
  CourseServiceError: class extends Error {
    constructor(message) {
      super(message);
      this.name = 'CourseServiceError';
    }
  },
}));

// Mock models
vi.mock('../../../models/index.js', () => {
  const db = {
    sequelize: { close: vi.fn() },
    User: { findByPk: vi.fn() },
    Course: { findAll: vi.fn(), findByPk: vi.fn() },
    Lesson: { findByPk: vi.fn() },
    Progress: {},
    Comment: {},
    UserCourse: {},
    Like: {},
    Topic: {},
    Certificate: {},
    Exam: {},
    ExamQuestion: {},
    ExamAttempt: {},
  };
  return { default: db, ...db };
});

describe('CourseController Integration Tests (Rotas /admin/cursos)', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  // =============================================
  // GET /admin/cursos (index)
  // =============================================
  describe('GET /admin/cursos', () => {
    it('deve retornar 200 e listar cursos', async () => {
      courseService.getAllCourses.mockResolvedValue([
        { id: 1, title: 'Node.js', status: 'published' },
      ]);

      const res = await request(app).get('/admin/cursos');

      expect(res.status).toBe(200);
      expect(courseService.getAllCourses).toHaveBeenCalled();
    });

    it('deve redirecionar para /admin em caso de erro', async () => {
      courseService.getAllCourses.mockRejectedValue(new Error('DB Error'));

      const res = await request(app).get('/admin/cursos');

      expect(res.status).toBe(302);
      expect(res.headers.location).toBe('/admin');
    });
  });

  // =============================================
  // GET /admin/cursos/criar (create form)
  // =============================================
  describe('GET /admin/cursos/criar', () => {
    it('deve retornar 200 e exibir formulário de criação', async () => {
      const res = await request(app).get('/admin/cursos/criar');

      expect(res.status).toBe(200);
    });
  });

  // =============================================
  // POST /admin/cursos/criar (store)
  // =============================================
  describe('POST /admin/cursos/criar', () => {
    it('deve redirecionar (302) para lista após criar curso com sucesso', async () => {
      courseService.createCourse.mockResolvedValue({ id: 1, title: 'Novo Curso' });

      const res = await request(app)
        .post('/admin/cursos/criar')
        .send({ title: 'Novo Curso', description: 'Desc' });

      expect(res.status).toBe(302);
      expect(res.headers.location).toBe('/admin/cursos');
      expect(courseService.createCourse).toHaveBeenCalled();
    });

    it('deve redirecionar para formulário de criação em caso de erro', async () => {
      courseService.createCourse.mockRejectedValue(new Error('Erro ao criar'));

      const res = await request(app)
        .post('/admin/cursos/criar')
        .send({ title: '' });

      expect(res.status).toBe(302);
      expect(res.headers.location).toBe('/admin/cursos/create');
    });
  });

  // =============================================
  // GET /admin/cursos/:id/editar (edit form)
  // =============================================
  describe('GET /admin/cursos/:id/editar', () => {
    it('deve retornar 200 ao carregar formulário de edição', async () => {
      courseService.getCourseById.mockResolvedValue({ id: 1, title: 'Curso Teste' });

      const res = await request(app).get('/admin/cursos/1/editar');

      expect(res.status).toBe(200);
      expect(courseService.getCourseById).toHaveBeenCalledWith('1');
    });

    it('deve redirecionar para lista com erro quando curso não existe', async () => {
      courseService.getCourseById.mockRejectedValue(
        new CourseServiceError('Curso nao encontrado.')
      );

      const res = await request(app).get('/admin/cursos/99/editar');

      expect(res.status).toBe(302);
      expect(res.headers.location).toBe('/admin/cursos');
    });
  });

  // =============================================
  // POST /admin/cursos/:id/editar (update)
  // =============================================
  describe('POST /admin/cursos/:id/editar', () => {
    it('deve redirecionar para lista após atualizar curso com sucesso', async () => {
      courseService.updateCourse.mockResolvedValue({ id: 1, title: 'Atualizado' });

      const res = await request(app)
        .post('/admin/cursos/1/editar')
        .send({ title: 'Atualizado', description: 'Nova desc', level: 'advanced', status: 'published' });

      expect(res.status).toBe(302);
      expect(res.headers.location).toBe('/admin/cursos');
      expect(courseService.updateCourse).toHaveBeenCalled();
    });

    it('deve redirecionar para edição com erro quando falha ao atualizar', async () => {
      courseService.updateCourse.mockRejectedValue(
        new CourseServiceError('Curso nao encontrado.')
      );

      const res = await request(app)
        .post('/admin/cursos/99/editar')
        .send({ title: 'X' });

      expect(res.status).toBe(302);
      expect(res.headers.location).toBe('/admin/cursos/99/edit');
    });
  });

  // =============================================
  // POST /admin/cursos/:id/excluir (destroy)
  // =============================================
  describe('POST /admin/cursos/:id/excluir', () => {
    it('deve redirecionar para lista após excluir curso com sucesso', async () => {
      courseService.deleteCourse.mockResolvedValue(true);

      const res = await request(app).post('/admin/cursos/1/excluir');

      expect(res.status).toBe(302);
      expect(res.headers.location).toBe('/admin/cursos');
      expect(courseService.deleteCourse).toHaveBeenCalledWith('1');
    });

    it('deve redirecionar para lista com erro quando curso não existe', async () => {
      courseService.deleteCourse.mockRejectedValue(
        new CourseServiceError('Curso nao encontrado.')
      );

      const res = await request(app).post('/admin/cursos/99/excluir');

      expect(res.status).toBe(302);
      expect(res.headers.location).toBe('/admin/cursos');
    });
  });
});
