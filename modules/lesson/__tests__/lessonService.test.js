import { describe, it, expect, vi, beforeEach } from 'vitest';
import { lessonService, LessonServiceError } from '../lessonService.js';
import { Lesson, User, Comment, Progress, UserCourse, Like } from '../../../models/index.js';

// Mock de todos os models usados pelo Service
vi.mock('../../../models/index.js', () => {
  return {
    Lesson: {
      findByPk: vi.fn(),
      findAll: vi.fn(),
    },
    User: {},
    Topic: {},
    Comment: {
      create: vi.fn(),
      findByPk: vi.fn(),
    },
    Progress: {
      findOne: vi.fn(),
      findOrCreate: vi.fn(),
      findAll: vi.fn(),
    },
    UserCourse: {
      findOne: vi.fn(),
    },
    Like: {
      findAll: vi.fn(),
      findOne: vi.fn(),
      create: vi.fn(),
    },
  };
});

describe('LessonService', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  // =============================================
  // getLessonPlayer
  // =============================================
  describe('getLessonPlayer', () => {
    it('deve lançar LessonServiceError quando a lição não é encontrada', async () => {
      Lesson.findByPk.mockResolvedValue(null);

      await expect(lessonService.getLessonPlayer(99, 1))
        .rejects
        .toThrow(LessonServiceError);
    });

    it('deve lançar LessonServiceError quando a lição é draft (não publicada)', async () => {
      Lesson.findByPk.mockResolvedValue({ id: 1, status: 'draft', courseId: null });

      await expect(lessonService.getLessonPlayer(1, 1))
        .rejects
        .toThrow('Lição não encontrada.');
    });

    it('deve lançar LessonServiceError quando o usuário não está inscrito no curso', async () => {
      Lesson.findByPk.mockResolvedValue({
        id: 1, status: 'published', courseId: 5, comments: [],
      });
      UserCourse.findOne.mockResolvedValue(null);

      await expect(lessonService.getLessonPlayer(1, 1))
        .rejects
        .toThrow('Você precisa se inscrever no curso para assistir esta aula.');
    });

    it('deve retornar dados da lição com currículo quando pertence a um curso', async () => {
      const mockLesson = {
        id: 1, title: 'Lição 1', status: 'published', courseId: 5, comments: [],
      };
      Lesson.findByPk.mockResolvedValue(mockLesson);
      UserCourse.findOne.mockResolvedValue({ userId: 1, courseId: 5 });
      Lesson.findAll.mockResolvedValue([
        { id: 1, title: 'Lição 1', duration: 10, order: 1 },
        { id: 2, title: 'Lição 2', duration: 15, order: 2 },
      ]);
      Progress.findOne.mockResolvedValue(null);
      Progress.findAll.mockResolvedValue([]);

      const result = await lessonService.getLessonPlayer(1, 1);

      expect(result).toHaveProperty('lesson');
      expect(result).toHaveProperty('curriculum');
      expect(result.curriculum).toHaveLength(2);
      expect(Lesson.findAll).toHaveBeenCalled();
    });

    it('deve retornar a própria lição como currículo quando não pertence a um curso', async () => {
      const mockLesson = {
        id: 10, title: 'Avulsa', status: 'published', courseId: null, comments: [],
      };
      Lesson.findByPk.mockResolvedValue(mockLesson);
      Progress.findOne.mockResolvedValue(null);
      Progress.findAll.mockResolvedValue([]);

      const result = await lessonService.getLessonPlayer(10, 1);

      expect(result.curriculum).toHaveLength(1);
      expect(result.curriculum[0].id).toBe(10);
    });

    it('deve buscar likes do usuário nos comentários da lição', async () => {
      const mockLesson = {
        id: 1, status: 'published', courseId: null,
        comments: [{ id: 100 }, { id: 101 }],
      };
      Lesson.findByPk.mockResolvedValue(mockLesson);
      Progress.findOne.mockResolvedValue(null);
      Progress.findAll.mockResolvedValue([]);
      Like.findAll.mockResolvedValue([{ targetId: 100 }]);

      const result = await lessonService.getLessonPlayer(1, 1);

      expect(result.userLikes).toContain(100);
      expect(Like.findAll).toHaveBeenCalled();
    });
  });

  // =============================================
  // updateProgress
  // =============================================
  describe('updateProgress', () => {
    it('deve marcar a lição como concluída (completed=true)', async () => {
      const mockProgress = {
        completed: false,
        completedAt: null,
        watchedMinutes: 0,
        save: vi.fn().mockResolvedValue(true),
      };
      Progress.findOrCreate.mockResolvedValue([mockProgress]);

      const result = await lessonService.updateProgress(1, 1, { completed: true });

      expect(result.completed).toBe(true);
      expect(result.completedAt).toBeInstanceOf(Date);
      expect(mockProgress.save).toHaveBeenCalled();
    });

    it('deve desmarcar a lição como concluída (completed=false)', async () => {
      const mockProgress = {
        completed: true,
        completedAt: new Date(),
        watchedMinutes: 10,
        save: vi.fn().mockResolvedValue(true),
      };
      Progress.findOrCreate.mockResolvedValue([mockProgress]);

      const result = await lessonService.updateProgress(1, 1, { completed: false });

      expect(result.completed).toBe(false);
      expect(result.completedAt).toBeNull();
    });

    it('deve atualizar os minutos assistidos (watchedMinutes)', async () => {
      const mockProgress = {
        completed: false,
        completedAt: null,
        watchedMinutes: 0,
        save: vi.fn().mockResolvedValue(true),
      };
      Progress.findOrCreate.mockResolvedValue([mockProgress]);

      const result = await lessonService.updateProgress(1, 1, { watchedMinutes: 25 });

      expect(result.watchedMinutes).toBe(25);
      expect(mockProgress.save).toHaveBeenCalled();
    });
  });

  // =============================================
  // addComment
  // =============================================
  describe('addComment', () => {
    it('deve criar um comentário com sucesso', async () => {
      Comment.create.mockResolvedValue({ id: 1, content: 'Ótima aula!', userId: 1, lessonId: 1 });

      const result = await lessonService.addComment(1, 1, 'Ótima aula!');

      expect(result).toHaveProperty('id', 1);
      expect(result).toHaveProperty('content', 'Ótima aula!');
      expect(Comment.create).toHaveBeenCalledWith(expect.objectContaining({
        content: 'Ótima aula!',
        userId: 1,
        lessonId: 1,
      }));
    });

    it('deve lançar LessonServiceError quando o conteúdo é vazio', async () => {
      await expect(lessonService.addComment(1, 1, ''))
        .rejects
        .toThrow('O comentário não pode ser vazio.');
    });

    it('deve lançar LessonServiceError quando o conteúdo é apenas espaços', async () => {
      await expect(lessonService.addComment(1, 1, '   '))
        .rejects
        .toThrow(LessonServiceError);
    });
  });

  // =============================================
  // toggleLike
  // =============================================
  describe('toggleLike', () => {
    it('deve lançar LessonServiceError quando o comentário não existe', async () => {
      Comment.findByPk.mockResolvedValue(null);

      await expect(lessonService.toggleLike(99, 1))
        .rejects
        .toThrow('Comentário não encontrado');
    });

    it('deve adicionar like quando não existe like prévio', async () => {
      const mockComment = { id: 1, likes: 3, save: vi.fn().mockResolvedValue(true) };
      Comment.findByPk.mockResolvedValue(mockComment);
      Like.findOne.mockResolvedValue(null);
      Like.create.mockResolvedValue({});

      const result = await lessonService.toggleLike(1, 1);

      expect(result.liked).toBe(true);
      expect(result.likeCount).toBe(4);
      expect(Like.create).toHaveBeenCalled();
    });

    it('deve remover like quando já existe like prévio', async () => {
      const mockComment = { id: 1, likes: 5, save: vi.fn().mockResolvedValue(true) };
      const mockLike = { destroy: vi.fn().mockResolvedValue(true) };
      Comment.findByPk.mockResolvedValue(mockComment);
      Like.findOne.mockResolvedValue(mockLike);

      const result = await lessonService.toggleLike(1, 1);

      expect(result.liked).toBe(false);
      expect(result.likeCount).toBe(4);
      expect(mockLike.destroy).toHaveBeenCalled();
    });
  });
});
