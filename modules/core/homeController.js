import { homeService, HomeServiceError } from './homeService.js';

const homeController = {
  /** GET / - Landing page */
  landing: async (req, res) => {
    try {
      const data = await homeService.getLandingData();
      res.render('pages/home/landing', {
        title: 'SkillUp - Aprenda novas habilidades em minutos',
        layout: 'layouts/main',
        lessonCount: data.lessonCount, userCount: data.userCount,
      });
    } catch (error) {
      console.error('Erro na landing:', error);
      res.render('pages/home/landing', {
        title: 'SkillUp - Aprenda novas habilidades em minutos',
        layout: 'layouts/main',
        lessonCount: 0, userCount: 0,
      });
    }
  },

  /** GET /browse - Browse courses */
  browse: async (req, res) => {
    try {
      const data = await homeService.getBrowseData(req.query.topic, req.query.search, req.query.page, req.session.userId);

      res.render('pages/home/browse', {
        title: 'Explorar Cursos - SkillUp',
        layout: 'layouts/main',
        courses: data.courses, topics: data.topics, enrolledCourseIds: data.enrolledCourseIds,
        currentTopic: data.currentTopic,
        search: data.search,
        currentPage: data.currentPage,
        totalPages: data.totalPages,
      });
    } catch (error) {
      console.error('Erro no browse:', error);
      req.flash('error', 'Erro ao carregar cursos.');
      res.redirect('/');
    }
  },

  /** GET /browse/:id - Course detail */
  courseDetail: async (req, res) => {
    try {
      const data = await homeService.getCourseDetailData(req.params.id, req.session.userId);

      res.render('pages/home/course-detail', {
        title: `${data.course.title} - SkillUp`,
        layout: 'layouts/main',
        course: data.course,
        isEnrolled: data.isEnrolled,
        lessonCount: data.lessonCount,
        topicLessons: data.topicLessons,
        userProgress: data.userProgress,
        isCourseCompleted: data.isCourseCompleted,
      });
    } catch (error) {
      if (error instanceof HomeServiceError) {
        req.flash('error', error.message);
      } else {
        console.error('Erro no detalhe do curso:', error);
        req.flash('error', 'Erro ao carregar curso.');
      }
      res.redirect('/browse');
    }
  },

  /** POST /browse/:id/enroll - Enroll in course */
  enroll: async (req, res) => {
    try {
      const data = await homeService.enrollUser(req.params.id, req.session.userId);

      if (data.created) {
        req.flash('success', `Você se inscreveu no curso "${data.course.title}"!`);
      } else {
        req.flash('info', 'Você já está inscrito neste curso.');
      }

      return res.redirect(`/browse/${data.course.id}`);
    } catch (error) {
      if (error instanceof HomeServiceError) {
        req.flash('error', error.message);
        return res.redirect('/browse');
      }
      console.error('Erro ao inscrever:', error);
      req.flash('error', 'Erro ao se inscrever no curso.');
      return res.redirect(`/browse/${req.params.id}`);
    }
  },

  /** POST /browse/:id/unenroll - Unenroll from course */
  unenroll: async (req, res) => {
    try {
      await homeService.unenrollUser(req.params.id, req.session.userId);

      req.flash('success', 'Inscrição cancelada.');
      return res.redirect(`/browse/${req.params.id}`);
    } catch (error) {
      console.error('Erro ao cancelar inscrição:', error);
      req.flash('error', 'Erro ao cancelar inscrição.');
      return res.redirect(`/browse/${req.params.id}`);
    }
  },
};

export default homeController;
