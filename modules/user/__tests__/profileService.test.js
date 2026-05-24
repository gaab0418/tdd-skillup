import { describe, it, expect, vi, beforeEach } from 'vitest';
import { profileService, ProfileServiceError } from '../profileService.js';
import { User, Progress, Certificate, Lesson, Topic, Course, UserCourse, Exam } from '../../../models/index.js';

vi.mock('../../../models/index.js', () => ({
  User: { findByPk: vi.fn() },
  Progress: { count: vi.fn(), sum: vi.fn(), findAll: vi.fn() },
  Certificate: { findAll: vi.fn() },
  Lesson: {},
  Topic: {},
  Course: { findAll: vi.fn(), findByPk: vi.fn() },
  UserCourse: { findOne: vi.fn() },
  Exam: {}
}));

describe('ProfileService', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('getProfileData', () => {
    it('deve retornar dados do perfil do usuário', async () => {
      User.findByPk.mockResolvedValue({ id: 1, name: 'User' });
      Progress.count.mockResolvedValue(5);
      Progress.sum.mockResolvedValue(120);
      Certificate.findAll.mockResolvedValue([{ id: 1, topicId: 1 }]);
      Course.findAll.mockResolvedValue([
        {
          id: 1, 
          toJSON: () => ({ id: 1 }), 
          lessons: [{ id: 10 }, { id: 11 }]
        }
      ]);
      Progress.findAll.mockResolvedValueOnce([{ lessonId: 10 }]); // allProgress
      Progress.findAll.mockResolvedValueOnce([
        { completedAt: new Date().toISOString() }
      ]); // recentProgress

      const result = await profileService.getProfileData(1);

      expect(result).toHaveProperty('user');
      expect(result).toHaveProperty('completedLessons', 5);
      expect(result).toHaveProperty('totalWatched', 120);
      expect(result).toHaveProperty('certificates');
      expect(result).toHaveProperty('coursesWithProgress');
      expect(result.coursesWithProgress[0].progressPercent).toBe(50);
      expect(result).toHaveProperty('streak');
    });
  });

  describe('getMyCourseData', () => {
    it('deve lançar erro se o usuário não estiver inscrito no curso', async () => {
      UserCourse.findOne.mockResolvedValue(null);
      
      await expect(profileService.getMyCourseData(1, 1))
        .rejects.toThrow(ProfileServiceError);
    });

    it('deve lançar erro se o curso não existir', async () => {
      UserCourse.findOne.mockResolvedValue({ userId: 1, courseId: 1 });
      Course.findByPk.mockResolvedValue(null);
      
      await expect(profileService.getMyCourseData(1, 1))
        .rejects.toThrow(ProfileServiceError);
    });

    it('deve retornar os dados do curso e progresso', async () => {
      UserCourse.findOne.mockResolvedValue({ userId: 1, courseId: 1 });
      Course.findByPk.mockResolvedValue({
        id: 1,
        lessons: [{ id: 1, order: 2 }, { id: 2, order: 1 }]
      });
      Progress.findAll.mockResolvedValue([{ lessonId: 2, completed: true }]);

      const result = await profileService.getMyCourseData(1, 1);

      expect(result).toHaveProperty('course');
      expect(result).toHaveProperty('lessons');
      expect(result.lessons[0].id).toBe(2);
      expect(result).toHaveProperty('progressMap');
    });
  });

  describe('getSettingsData', () => {
    it('deve retornar dados de configuração do usuário', async () => {
      User.findByPk.mockResolvedValue({ id: 1, name: 'User' });
      
      const result = await profileService.getSettingsData(1);
      
      expect(result.name).toBe('User');
      expect(User.findByPk).toHaveBeenCalledWith(1, expect.any(Object));
    });
  });

  describe('updateProfileSettings', () => {
    it('deve atualizar o perfil e salvar', async () => {
      const mockUser = {
        id: 1,
        name: 'Old',
        save: vi.fn().mockResolvedValue(true)
      };
      User.findByPk.mockResolvedValue(mockUser);

      const result = await profileService.updateProfileSettings(1, { name: 'New', bio: 'Bio' });

      expect(mockUser.name).toBe('New');
      expect(mockUser.bio).toBe('Bio');
      expect(mockUser.save).toHaveBeenCalled();
      expect(result).toBe(mockUser);
    });

    it('deve atualizar a senha se a atual estiver correta', async () => {
      const mockUser = {
        id: 1,
        comparePassword: vi.fn().mockResolvedValue(true),
        save: vi.fn().mockResolvedValue(true)
      };
      User.findByPk.mockResolvedValue(mockUser);

      await profileService.updateProfileSettings(1, { currentPassword: 'old', newPassword: 'new' });

      expect(mockUser.comparePassword).toHaveBeenCalledWith('old');
      expect(mockUser.password).toBe('new');
    });

    it('deve lançar erro se a senha atual estiver incorreta', async () => {
      const mockUser = {
        id: 1,
        comparePassword: vi.fn().mockResolvedValue(false)
      };
      User.findByPk.mockResolvedValue(mockUser);

      await expect(profileService.updateProfileSettings(1, { currentPassword: 'wrong', newPassword: 'new' }))
        .rejects.toThrow(ProfileServiceError);
    });

    it('deve atualizar o avatar se um arquivo for fornecido', async () => {
      const mockUser = { id: 1, save: vi.fn() };
      User.findByPk.mockResolvedValue(mockUser);

      await profileService.updateProfileSettings(1, {}, { filename: 'avatar.png' });

      expect(mockUser.avatar).toBe('/uploads/avatars/avatar.png');
    });
  });
});
