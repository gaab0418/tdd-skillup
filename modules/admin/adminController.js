import { adminService } from './adminService.js';

const adminController = {
  /** GET /admin - Dashboard */
  dashboard: async (req, res) => {
    try {
      const data = await adminService.getDashboardData(req.query.filter);

      res.render('pages/admin/dashboard', {
        title: 'Painel - SkillUp Admin', layout: 'layouts/admin',
        totalUsers: data.totalUsers, 
        totalLessons: data.totalLessons, 
        totalCourses: data.totalCourses, 
        totalCertificates: data.totalCertificates, 
        totalTopics: data.totalTopics,
        publishedLessons: data.publishedLessons, 
        draftLessons: data.draftLessons, 
        recentActivity: data.recentActivity,
        trendingLessons: data.trendingLessons, 
        completionRate: data.completionRate, 
        activePage: 'dashboard',
        growthLabels: data.growthLabels, 
        growthData: data.growthData, 
        topicStats: data.topicStats, 
        currentFilter: data.currentFilter
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
      const data = await adminService.getAnalyticsData();

      res.render('pages/admin/analytics', {
        title: 'Estatísticas - SkillUp Admin', layout: 'layouts/admin',
        totalUsers: data.totalUsers, 
        totalCourses: data.totalCourses, 
        totalLessons: data.totalLessons, 
        totalCertificates: data.totalCertificates,
        totalProgress: data.totalProgress, 
        completedProgress: data.completedProgress, 
        completionRate: data.completionRate,
        topicStats: data.topicStats, 
        activePage: 'analytics',
      });
    } catch (error) {
      console.error('Erro no analytics:', error);
      req.flash('error', 'Erro ao carregar analytics.');
      res.redirect('/admin');
    }
  },
};

export default adminController;
