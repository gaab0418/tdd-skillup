import { describe, it, expect, vi, beforeEach } from 'vitest';
import { adminService, AdminServiceError } from '../adminService.js';
import { User, Lesson, Topic, Course, Progress, Certificate } from '../../../models/index.js';

vi.mock('../../../models/index.js', () => ({
  User: { count: vi.fn(), findAll: vi.fn() },
  Lesson: { count: vi.fn(), findAll: vi.fn() },
  Topic: { count: vi.fn(), findAll: vi.fn() },
  Course: { count: vi.fn() },
  Progress: { count: vi.fn(), findAll: vi.fn() },
  Certificate: { count: vi.fn() },
}));

describe('AdminService', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('getDashboardData', () => {
    it('deve retornar dados do dashboard corretamente com filtro padrao', async () => {
      User.count.mockResolvedValue(10);
      Lesson.count.mockResolvedValue(20);
      Course.count.mockResolvedValue(5);
      Certificate.count.mockResolvedValue(2);
      Topic.count.mockResolvedValue(3);
      
      Progress.findAll.mockResolvedValue([{ completed: true, user: {}, lesson: {} }]);
      Lesson.findAll.mockResolvedValue([{ title: 'A', course: {} }]);
      Progress.count.mockResolvedValueOnce(50); // totalProgress
      Progress.count.mockResolvedValueOnce(25); // completedProgress

      User.findAll.mockResolvedValue([{ createdAt: new Date() }]);
      Topic.findAll.mockResolvedValue([
        { name: 'T1', courses: [{ lessons: [{id: 1}] }] }
      ]);

      const data = await adminService.getDashboardData();

      expect(data).toHaveProperty('totalUsers', 10);
      expect(data).toHaveProperty('totalLessons', 20);
      expect(data).toHaveProperty('completionRate', '50.0');
      expect(data).toHaveProperty('growthLabels');
      expect(data).toHaveProperty('growthData');
      expect(data).toHaveProperty('topicStats');
    });

    const filters = ['12h', '1d', '7d', '30d', '1a'];
    for (const filter of filters) {
      it(`deve processar o filtro de crescimento ${filter}`, async () => {
        User.count.mockResolvedValue(0);
        Lesson.count.mockResolvedValue(0);
        Course.count.mockResolvedValue(0);
        Certificate.count.mockResolvedValue(0);
        Topic.count.mockResolvedValue(0);
        Progress.findAll.mockResolvedValue([]);
        Lesson.findAll.mockResolvedValue([]);
        Progress.count.mockResolvedValue(0);
        Topic.findAll.mockResolvedValue([]);
        
        const testDate = new Date();
        User.findAll.mockResolvedValue([{ createdAt: testDate }]);

        const data = await adminService.getDashboardData(filter);
        expect(data.growthData.length).toBeGreaterThan(0);
      });
    }
  });

  describe('getAnalyticsData', () => {
    it('deve retornar dados de analytics corretamente', async () => {
      User.count.mockResolvedValue(10);
      Course.count.mockResolvedValue(5);
      Lesson.count.mockResolvedValue(20);
      Certificate.count.mockResolvedValue(2);
      Progress.count.mockResolvedValueOnce(100);
      Progress.count.mockResolvedValueOnce(75);

      Topic.findAll.mockResolvedValue([
        { name: 'T1', courses: [{ lessons: [{id: 1}, {id: 2}] }] },
        { name: 'T2', courses: [] }
      ]);

      const data = await adminService.getAnalyticsData();

      expect(data).toHaveProperty('totalUsers', 10);
      expect(data).toHaveProperty('completionRate', '75.0');
      expect(data.topicStats).toHaveLength(2);
      expect(data.topicStats[0].lessonCount).toBe(2);
      expect(data.topicStats[1].lessonCount).toBe(0);
    });
  });
});
