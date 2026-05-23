const { User, Lesson, Topic, Course, Progress, Comment, Certificate } = require('../../models');
const { Op } = require('sequelize');

const adminController = {
  /** GET /admin - Dashboard */
  dashboard: async (req, res) => {
    try {
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
            include: [{ model: Topic, as: 'topic', attributes: ['name'] }] },
        ],
        order: [['completedAt', 'DESC']],
        limit: 10,
      });

      const trendingLessons = await Lesson.findAll({
        where: { status: 'published' },
        include: [{ model: Topic, as: 'topic' }, { model: Progress, as: 'progress' }],
        limit: 5,
      });

      const totalProgress = await Progress.count();
      const completedProgress = await Progress.count({ where: { completed: true } });
      const completionRate = totalProgress > 0 ? ((completedProgress / totalProgress) * 100).toFixed(1) : 0;

      res.render('pages/admin/dashboard', {
        title: 'Painel - SkillUp Admin', layout: 'layouts/admin',
        totalUsers, totalLessons, totalCourses, totalCertificates, totalTopics,
        publishedLessons, draftLessons, recentActivity,
        trendingLessons, completionRate, activePage: 'dashboard',
      });
    } catch (error) {
      console.error('Erro no dashboard:', error);
      req.flash('error', 'Erro ao carregar dashboard.');
      res.redirect('/');
    }
  },

  /** GET /admin/analytics */
  analytics: async (req, res) => {
    try {
      const totalUsers = await User.count();
      const totalCourses = await Course.count();
      const totalLessons = await Lesson.count();
      const totalCertificates = await Certificate.count();
      const totalProgress = await Progress.count();
      const completedProgress = await Progress.count({ where: { completed: true } });
      const completionRate = totalProgress > 0 ? ((completedProgress / totalProgress) * 100).toFixed(1) : 0;

      const topics = await Topic.findAll({
        include: [{ model: Lesson, as: 'lessons', attributes: ['id'] }],
        order: [['name', 'ASC']],
      });

      const maxLessons = Math.max(...topics.map(t => t.lessons.length), 1);
      const topicStats = topics.map(t => ({
        name: t.name,
        color: t.color,
        icon: t.icon,
        lessonCount: t.lessons.length,
        percentage: Math.round((t.lessons.length / maxLessons) * 100),
      }));

      res.render('pages/admin/analytics', {
        title: 'Estatísticas - SkillUp Admin', layout: 'layouts/admin',
        totalUsers, totalCourses, totalLessons, totalCertificates,
        totalProgress, completedProgress, completionRate,
        topicStats, activePage: 'analytics',
      });
    } catch (error) {
      console.error('Erro no analytics:', error);
      req.flash('error', 'Erro ao carregar analytics.');
      res.redirect('/admin');
    }
  },
};

module.exports = adminController;

