import { User, Lesson, Topic, Course, Progress, Certificate } from '../../models/index.js';
import { Op } from 'sequelize';

class AdminServiceError extends Error {
  constructor(message) {
    super(message);
    this.name = 'AdminServiceError';
  }
}

const adminService = {
  async getDashboardData(filterQuery) {
    const totalUsers = await User.count();
    const totalLessons = await Lesson.count();
    const totalCourses = await Course.count();
    const totalCertificates = await Certificate.count();
    const totalTopics = await Topic.count();
    const publishedLessons = await Lesson.count({ where: { status: 'published' } });
    const draftLessons = await Lesson.count({ where: { status: 'draft' } });

    const recentActivity = await Progress.findAll({
      where: { completed: true },
      include: [
        { model: User, as: 'user', attributes: ['id', 'name', 'avatar'] },
        { model: Lesson, as: 'lesson', attributes: ['id', 'title'],
          include: [{ model: Course, as: 'course', include: [{ model: Topic, as: 'topic', attributes: ['name'] }] }] },
      ],
      order: [['completedAt', 'DESC']],
      limit: 10,
    });

    const trendingLessons = await Lesson.findAll({
      where: { status: 'published' },
      include: [{ model: Course, as: 'course', include: [{ model: Topic, as: 'topic' }] }, { model: Progress, as: 'progress' }],
      limit: 5,
    });

    const totalProgress = await Progress.count();
    const completedProgress = await Progress.count({ where: { completed: true } });
    const completionRate = totalProgress > 0 ? ((completedProgress / totalProgress) * 100).toFixed(1) : 0;

    // --- Dados para o Grafico de Crescimento ---
    const filter = filterQuery || '6m';
    const now = new Date();
    let startDate = new Date();
    let growthCounts = {};

    const formatLabel = (date, type) => {
      if (type === 'hour') return `${date.getHours()}h`;
      if (type === 'day') return `${date.getDate()}/${date.getMonth() + 1}`;
      const months = ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez'];
      return months[date.getMonth()];
    };

    if (filter === '12h') {
      startDate.setHours(now.getHours() - 11);
      for (let i = 11; i >= 0; i--) {
        const d = new Date(); d.setHours(now.getHours() - i);
        growthCounts[formatLabel(d, 'hour')] = 0;
      }
    } else if (filter === '1d') {
      startDate.setHours(now.getHours() - 23);
      for (let i = 23; i >= 0; i -= 2) { // Cada 2 horas para nao poluir
        const d = new Date(); d.setHours(now.getHours() - i);
        growthCounts[formatLabel(d, 'hour')] = 0;
      }
    } else if (filter === '7d') {
      startDate.setDate(now.getDate() - 6);
      for (let i = 6; i >= 0; i--) {
        const d = new Date(); d.setDate(now.getDate() - i);
        growthCounts[formatLabel(d, 'day')] = 0;
      }
    } else if (filter === '30d' || filter === '1m') {
      startDate.setDate(now.getDate() - 29);
      for (let i = 29; i >= 0; i--) {
        const d = new Date(); d.setDate(now.getDate() - i);
        growthCounts[formatLabel(d, 'day')] = 0;
      }
    } else if (filter === '1a') {
      startDate.setMonth(now.getMonth() - 11);
      startDate.setDate(1);
      for (let i = 11; i >= 0; i--) {
        const d = new Date(); d.setMonth(now.getMonth() - i);
        growthCounts[formatLabel(d, 'month')] = 0;
      }
    } else {
      // default 6m
      startDate.setMonth(now.getMonth() - 5);
      startDate.setDate(1);
      for (let i = 5; i >= 0; i--) {
        const d = new Date(); d.setMonth(now.getMonth() - i);
        growthCounts[formatLabel(d, 'month')] = 0;
      }
    }

    const recentUsers = await User.findAll({
      where: { createdAt: { [Op.gte]: startDate } },
      attributes: ['createdAt']
    });

    recentUsers.forEach(u => {
      const uDate = new Date(u.createdAt);
      let type = 'month';
      if (filter === '12h' || filter === '1d') type = 'hour';
      if (filter === '7d' || filter === '30d' || filter === '1m') type = 'day';
      
      let label = formatLabel(uDate, type);
      
      if (filter === '1d' && growthCounts[label] === undefined) {
        const adjustedDate = new Date(uDate);
        adjustedDate.setHours(uDate.getHours() - 1);
        label = formatLabel(adjustedDate, 'hour');
      }

      if (growthCounts[label] !== undefined) {
        growthCounts[label]++;
      }
    });

    const growthLabels = Object.keys(growthCounts);
    const growthData = Object.values(growthCounts);

    // --- Dados para o Grafico de Distribuicao de Topicos ---
    const topics = await Topic.findAll({
      include: [
        { 
          model: Course, 
          as: 'courses', 
          include: [{ model: Lesson, as: 'lessons', attributes: ['id'] }] 
        }
      ],
      order: [['name', 'ASC']],
    });
    const topicStatsData = topics.map(t => {
      let lessonCount = 0;
      if (t.courses) {
         t.courses.forEach(c => {
           if (c.lessons) lessonCount += c.lessons.length;
         });
      }
      return {
        name: t.name,
        color: t.color,
        icon: t.icon,
        lessonCount,
      };
    });
    const maxLessons = Math.max(...topicStatsData.map(t => t.lessonCount), 1);
    const topicStats = topicStatsData.map(t => ({
      ...t,
      percentage: Math.round((t.lessonCount / maxLessons) * 100),
    }));

    return {
      totalUsers, totalLessons, totalCourses, totalCertificates, totalTopics,
      publishedLessons, draftLessons, recentActivity,
      trendingLessons, completionRate,
      growthLabels, growthData, topicStats, currentFilter: filter
    };
  },

  async getAnalyticsData() {
    const totalUsers = await User.count();
    const totalCourses = await Course.count();
    const totalLessons = await Lesson.count();
    const totalCertificates = await Certificate.count();
    const totalProgress = await Progress.count();
    const completedProgress = await Progress.count({ where: { completed: true } });
    const completionRate = totalProgress > 0 ? ((completedProgress / totalProgress) * 100).toFixed(1) : 0;

    const topics = await Topic.findAll({
      include: [
        { 
          model: Course, 
          as: 'courses', 
          include: [{ model: Lesson, as: 'lessons', attributes: ['id'] }] 
        }
      ],
      order: [['name', 'ASC']],
    });

    const topicStatsData = topics.map(t => {
      let lessonCount = 0;
      if (t.courses) {
         t.courses.forEach(c => {
           if (c.lessons) lessonCount += c.lessons.length;
         });
      }
      return {
        name: t.name,
        color: t.color,
        icon: t.icon,
        lessonCount,
      };
    });
    const maxLessons = Math.max(...topicStatsData.map(t => t.lessonCount), 1);
    const topicStats = topicStatsData.map(t => ({
      ...t,
      percentage: Math.round((t.lessonCount / maxLessons) * 100),
    }));

    return {
      totalUsers, totalCourses, totalLessons, totalCertificates,
      totalProgress, completedProgress, completionRate,
      topicStats
    };
  }
};

export { adminService, AdminServiceError };
