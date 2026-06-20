import { describe, it, expect, vi, beforeEach } from 'vitest';
import { courseService, CourseServiceError } from '../courseService.js';
import { Course } from '../../../models/index.js';

vi.mock('../../../models/index.js', () => {
  return {
    Course: {
      findAll: vi.fn(),
      findByPk: vi.fn(),
      create: vi.fn(),
    },
  };
});

describe('CourseService', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  // =============================================
  // getAllCourses
  // =============================================
  describe('getAllCourses', () => {
    it('deve retornar todos os cursos ordenados por título', async () => {
      const mockCourses = [
        { id: 1, title: 'Angular' },
        { id: 2, title: 'React' },
      ];
      Course.findAll.mockResolvedValue(mockCourses);

      const result = await courseService.getAllCourses();

      expect(result).toHaveLength(2);
      expect(Course.findAll).toHaveBeenCalledWith(
        expect.objectContaining({ order: [['title', 'ASC']] })
      );
    });

    it('deve retornar array vazio quando não há cursos', async () => {
      Course.findAll.mockResolvedValue([]);

      const result = await courseService.getAllCourses();

      expect(result).toEqual([]);
    });
  });

  // =============================================
  // createCourse
  // =============================================
  describe('createCourse', () => {
    it('deve criar um curso com sucesso sem thumbnail', async () => {
      Course.create.mockResolvedValue({ id: 1, title: 'Node.js Básico', status: 'draft' });

      const result = await courseService.createCourse(
        { title: 'Node.js Básico', description: 'Intro', level: 'beginner', status: 'draft' },
        null
      );

      expect(result).toHaveProperty('id', 1);
      expect(Course.create).toHaveBeenCalledWith(
        expect.objectContaining({ title: 'Node.js Básico', thumbnail: null })
      );
    });

    it('deve criar um curso com thumbnail quando arquivo é enviado', async () => {
      Course.create.mockResolvedValue({ id: 2, title: 'React', thumbnail: '/uploads/thumbnails/thumb.png' });

      const result = await courseService.createCourse(
        { title: 'React', description: 'Frontend' },
        { thumbnail: [{ filename: 'thumb.png' }] }
      );

      expect(result).toHaveProperty('id', 2);
      expect(Course.create).toHaveBeenCalledWith(
        expect.objectContaining({ thumbnail: '/uploads/thumbnails/thumb.png' })
      );
    });

    it('deve usar valores padrão para level e status quando não informados', async () => {
      Course.create.mockResolvedValue({ id: 3, level: 'beginner', status: 'draft' });

      await courseService.createCourse({ title: 'Teste' }, null);

      expect(Course.create).toHaveBeenCalledWith(
        expect.objectContaining({ level: 'beginner', status: 'draft' })
      );
    });
  });

  // =============================================
  // getCourseById
  // =============================================
  describe('getCourseById', () => {
    it('deve retornar o curso quando encontrado', async () => {
      Course.findByPk.mockResolvedValue({ id: 1, title: 'Node.js' });

      const result = await courseService.getCourseById(1);

      expect(result).toHaveProperty('title', 'Node.js');
      expect(Course.findByPk).toHaveBeenCalledWith(1);
    });

    it('deve lançar CourseServiceError quando o curso não existe', async () => {
      Course.findByPk.mockResolvedValue(null);

      await expect(courseService.getCourseById(99))
        .rejects
        .toThrow('Curso nao encontrado.');
    });

    it('deve lançar instância de CourseServiceError', async () => {
      Course.findByPk.mockResolvedValue(null);

      await expect(courseService.getCourseById(99))
        .rejects
        .toThrow(CourseServiceError);
    });
  });

  // =============================================
  // updateCourse
  // =============================================
  describe('updateCourse', () => {
    it('deve atualizar os dados do curso com sucesso sem alterar thumbnail', async () => {
      const mockCourse = {
        id: 1, title: 'Antigo', description: '', level: 'beginner', status: 'draft',
        save: vi.fn().mockResolvedValue(true),
      };
      Course.findByPk.mockResolvedValue(mockCourse);

      const result = await courseService.updateCourse(1, {
        title: 'Novo', description: 'Desc', level: 'advanced', status: 'published',
      }, null);

      expect(result.title).toBe('Novo');
      expect(result.level).toBe('advanced');
      expect(result.status).toBe('published');
      expect(mockCourse.save).toHaveBeenCalled();
    });

    it('deve atualizar a thumbnail quando arquivo é enviado', async () => {
      const mockCourse = {
        id: 1, title: 'Curso', thumbnail: null,
        save: vi.fn().mockResolvedValue(true),
      };
      Course.findByPk.mockResolvedValue(mockCourse);

      await courseService.updateCourse(1, { title: 'Curso' }, { thumbnail: [{ filename: 'new.jpg' }] });

      expect(mockCourse.thumbnail).toBe('/uploads/thumbnails/new.jpg');
    });

    it('deve lançar CourseServiceError quando o curso não existe para atualização', async () => {
      Course.findByPk.mockResolvedValue(null);

      await expect(courseService.updateCourse(99, { title: 'X' }, null))
        .rejects
        .toThrow('Curso nao encontrado.');
    });
  });

  // =============================================
  // deleteCourse
  // =============================================
  describe('deleteCourse', () => {
    it('deve excluir o curso com sucesso', async () => {
      const mockCourse = {
        id: 1,
        destroy: vi.fn().mockResolvedValue(true),
      };
      Course.findByPk.mockResolvedValue(mockCourse);

      const result = await courseService.deleteCourse(1);

      expect(result).toBe(true);
      expect(mockCourse.destroy).toHaveBeenCalled();
    });

    it('deve lançar CourseServiceError quando o curso não existe para exclusão', async () => {
      Course.findByPk.mockResolvedValue(null);

      await expect(courseService.deleteCourse(99))
        .rejects
        .toThrow('Curso nao encontrado.');
    });
  });
});
