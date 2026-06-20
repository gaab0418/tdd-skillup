import { describe, it, expect, vi, beforeEach } from 'vitest';
import request from 'supertest';
import app from '../../app.js';
import { lessonService, LessonServiceError } from '../../modules/lesson/lessonService.js';

// Mock do middleware de autenticação
vi.mock('../../middlewares/auth.js', () => ({
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
    res.locals.user = { id: 1, role: 'user', name: 'Aluno' };
    next();
  },
}));

// Mock do lessonService
vi.mock('../../modules/lesson/lessonService.js', () => ({
  lessonService: {
    getLessonPlayer: vi.fn(),
    updateProgress: vi.fn(),
    addComment: vi.fn(),
    toggleLike: vi.fn(),
  },
  LessonServiceError: class extends Error {
    constructor(message) {
      super(message);
      this.name = 'LessonServiceError';
    }
  },
}));

// Mock models para evitar acesso real ao banco
vi.mock('../../models/index.js', () => {
  const db = {
    sequelize: { close: vi.fn() },
    User: { findByPk: vi.fn() },
    Lesson: { findByPk: vi.fn() },
    Progress: {},
    Comment: {},
    UserCourse: {},
    Like: {},
    Course: { findAll: vi.fn() },
    Topic: {},
    Certificate: {},
    Exam: {},
    ExamQuestion: {},
    ExamAttempt: {},
  };
  return { default: db, ...db };
});

describe('Lesson Integration Tests (Rotas /lessons)', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  // =============================================
  // GET /lessons/:id (player)
  // =============================================
  describe('GET /lessons/:id', () => {
    it('deve retornar 200 ao carregar o player de uma lição válida', async () => {
      lessonService.getLessonPlayer.mockResolvedValue({
        lesson: { id: 1, title: 'Aula Teste', status: 'published' },
        curriculum: [{ id: 1, title: 'Aula Teste', duration: 10, order: 1 }],
        userProgress: null,
        curriculumProgress: {},
        completedCount: 0,
        userLikes: [],
      });

      const res = await request(app).get('/lessons/1');

      expect(res.status).toBe(200);
      expect(lessonService.getLessonPlayer).toHaveBeenCalledWith('1', 1);
    });

    it('deve redirecionar (302) para /browse quando a lição não é encontrada', async () => {
      lessonService.getLessonPlayer.mockRejectedValue(
        new LessonServiceError('Lição não encontrada.')
      );

      const res = await request(app).get('/lessons/99');

      expect(res.status).toBe(302);
      expect(res.headers.location).toBe('/browse');
    });

    it('deve redirecionar para a página do curso quando o usuário não está inscrito', async () => {
      const error = new LessonServiceError('Você precisa se inscrever no curso para assistir esta aula.');
      error.courseId = 5;
      lessonService.getLessonPlayer.mockRejectedValue(error);

      const res = await request(app).get('/lessons/1');

      expect(res.status).toBe(302);
      expect(res.headers.location).toBe('/browse/5');
    });

    it('deve redirecionar para /browse em caso de erro genérico (não LessonServiceError)', async () => {
      lessonService.getLessonPlayer.mockRejectedValue(new Error('Erro inesperado'));

      const res = await request(app).get('/lessons/1');

      expect(res.status).toBe(302);
      expect(res.headers.location).toBe('/browse');
    });
  });

  // =============================================
  // POST /lessons/:id/progress
  // =============================================
  describe('POST /lessons/:id/progress', () => {
    it('deve retornar 200 com JSON de sucesso ao atualizar progresso', async () => {
      lessonService.updateProgress.mockResolvedValue({
        completed: true, completedAt: new Date(), watchedMinutes: 10,
      });

      const res = await request(app)
        .post('/lessons/1/progress')
        .send({ completed: true, watchedMinutes: 10 });

      expect(res.status).toBe(200);
      expect(res.body).toHaveProperty('success', true);
      expect(res.body).toHaveProperty('progress');
      expect(lessonService.updateProgress).toHaveBeenCalledWith('1', 1, expect.any(Object));
    });

    it('deve retornar 500 em caso de erro ao atualizar progresso', async () => {
      lessonService.updateProgress.mockRejectedValue(new Error('Erro no banco'));

      const res = await request(app)
        .post('/lessons/1/progress')
        .send({ completed: true });

      expect(res.status).toBe(500);
      expect(res.body).toHaveProperty('success', false);
    });
  });

  // =============================================
  // POST /lessons/:id/comments
  // =============================================
  describe('POST /lessons/:id/comments', () => {
    it('deve redirecionar (302) para a lição após adicionar comentário com sucesso', async () => {
      lessonService.addComment.mockResolvedValue({ id: 1, content: 'Boa aula!' });

      const res = await request(app)
        .post('/lessons/5/comments')
        .send({ content: 'Boa aula!' });

      expect(res.status).toBe(302);
      expect(res.headers.location).toBe('/lessons/5');
      expect(lessonService.addComment).toHaveBeenCalledWith('5', 1, 'Boa aula!');
    });

    it('deve redirecionar (302) com mensagem de erro ao enviar comentário vazio', async () => {
      lessonService.addComment.mockRejectedValue(
        new LessonServiceError('O comentário não pode ser vazio.')
      );

      const res = await request(app)
        .post('/lessons/5/comments')
        .send({ content: '' });

      expect(res.status).toBe(302);
      expect(res.headers.location).toBe('/lessons/5');
    });
  });

  // =============================================
  // POST /lessons/:id/comments/:commentId/like
  // =============================================
  describe('POST /lessons/:id/comments/:commentId/like', () => {
    it('deve retornar 200 com JSON ao dar like com sucesso', async () => {
      lessonService.toggleLike.mockResolvedValue({ liked: true, likeCount: 5 });

      const res = await request(app)
        .post('/lessons/1/comments/10/like');

      expect(res.status).toBe(200);
      expect(res.body).toHaveProperty('success', true);
      expect(res.body).toHaveProperty('liked', true);
      expect(res.body).toHaveProperty('likeCount', 5);
    });

    it('deve retornar 404 quando o comentário não é encontrado', async () => {
      lessonService.toggleLike.mockRejectedValue(
        new LessonServiceError('Comentário não encontrado')
      );

      const res = await request(app)
        .post('/lessons/1/comments/99/like');

      expect(res.status).toBe(404);
      expect(res.body).toHaveProperty('success', false);
    });
  });
});
