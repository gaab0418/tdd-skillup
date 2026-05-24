import { describe, it, expect, vi, beforeEach } from 'vitest';
import { contentService, ContentServiceError } from '../contentService.js';
import { Lesson, Topic, Course, User } from '../../../models/index.js';

vi.mock('../../../models/index.js', () => ({
  Lesson: { findAndCountAll: vi.fn(), count: vi.fn(), create: vi.fn(), findByPk: vi.fn() },
  Topic: { findAll: vi.fn() },
  Course: { findAll: vi.fn() },
  User: {}
}));

describe('ContentService', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('getContentIndex', () => {
    it('deve retornar lista paginada com busca e topicos', async () => {
      Lesson.findAndCountAll.mockResolvedValue({ rows: [{ id: 1 }], count: 1 });
      Topic.findAll.mockResolvedValue([{ id: 1 }]);
      Lesson.count.mockResolvedValueOnce(10); // total
      Lesson.count.mockResolvedValueOnce(2); // draft

      const result = await contentService.getContentIndex('busca', 'topico1', 1);

      expect(result.lessons).toHaveLength(1);
      expect(result.totalPages).toBe(1);
      expect(result.totalLessons).toBe(10);
      expect(result.draftCount).toBe(2);
      expect(Lesson.findAndCountAll).toHaveBeenCalled();
    });
  });

  describe('getContentCreateData', () => {
    it('deve retornar topicos e cursos', async () => {
      Topic.findAll.mockResolvedValue([{ id: 1 }]);
      Course.findAll.mockResolvedValue([{ id: 2 }]);

      const result = await contentService.getContentCreateData();
      expect(result.topics).toHaveLength(1);
      expect(result.courses).toHaveLength(1);
    });
  });

  describe('createContent', () => {
    it('deve criar uma licao sem arquivos', async () => {
      Lesson.create.mockResolvedValue({ id: 1, title: 'Nova' });

      const data = { title: 'Nova', duration: '10' };
      const result = await contentService.createContent(data, null, 1);

      expect(result.id).toBe(1);
      expect(Lesson.create).toHaveBeenCalledWith(expect.objectContaining({
        title: 'Nova',
        duration: 10,
        authorId: 1
      }));
    });

    it('deve criar licao com arquivos (video e thumbnail)', async () => {
      Lesson.create.mockResolvedValue({ id: 2 });
      
      const files = {
        video: [{ filename: 'vid.mp4' }],
        thumbnail: [{ filename: 'thumb.png' }]
      };

      await contentService.createContent({ title: 'Test' }, files, 1);
      
      expect(Lesson.create).toHaveBeenCalledWith(expect.objectContaining({
        videoUrl: '/uploads/videos/vid.mp4',
        thumbnail: '/uploads/thumbnails/thumb.png'
      }));
    });
  });

  describe('getContentEditData', () => {
    it('deve lancar erro se licao nao existir', async () => {
      Lesson.findByPk.mockResolvedValue(null);
      await expect(contentService.getContentEditData(1)).rejects.toThrow(ContentServiceError);
    });

    it('deve retornar licao, topicos e cursos', async () => {
      Lesson.findByPk.mockResolvedValue({ id: 1 });
      Topic.findAll.mockResolvedValue([]);
      Course.findAll.mockResolvedValue([]);

      const result = await contentService.getContentEditData(1);
      expect(result.lesson.id).toBe(1);
    });
  });

  describe('updateContent', () => {
    it('deve lancar erro se licao nao existir', async () => {
      Lesson.findByPk.mockResolvedValue(null);
      await expect(contentService.updateContent(1, {})).rejects.toThrow(ContentServiceError);
    });

    it('deve atualizar licao existente', async () => {
      const mockLesson = { id: 1, save: vi.fn() };
      Lesson.findByPk.mockResolvedValue(mockLesson);

      await contentService.updateContent(1, { title: 'Modificada', duration: '15' }, { thumbnail: [{ filename: 'new.png' }] });

      expect(mockLesson.title).toBe('Modificada');
      expect(mockLesson.duration).toBe(15);
      expect(mockLesson.thumbnail).toBe('/uploads/thumbnails/new.png');
      expect(mockLesson.save).toHaveBeenCalled();
    });
  });

  describe('deleteContent', () => {
    it('deve lancar erro se licao nao existir', async () => {
      Lesson.findByPk.mockResolvedValue(null);
      await expect(contentService.deleteContent(1)).rejects.toThrow(ContentServiceError);
    });

    it('deve deletar licao existente', async () => {
      const mockLesson = { destroy: vi.fn() };
      Lesson.findByPk.mockResolvedValue(mockLesson);

      const result = await contentService.deleteContent(1);
      expect(result).toBe(true);
      expect(mockLesson.destroy).toHaveBeenCalled();
    });
  });
});
