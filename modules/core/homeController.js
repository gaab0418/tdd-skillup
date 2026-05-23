const { Course, Topic, Lesson, User, UserCourse } = require('../../models');
const { Op } = require('sequelize');

const homeController = {
  /** GET / - Landing page */
  landing: async (req, res) => {
    try {
      const lessonCount = await Lesson.count({ where: { status: 'published' } });
      const userCount = await User.count();
      res.render('pages/home/landing', {
        title: 'SkillUp - Aprenda novas habilidades em minutos',
        layout: 'layouts/main',
        lessonCount, userCount,
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
      const { topic, search, page = 1 } = req.query;
      const limit = 12;
      const offset = (page - 1) * limit;

      const where = { status: 'published' };
      if (topic) where.topicId = topic;
      if (search) {
        where.title = { [Op.like]: `%${search}%` };
      }

      const { rows: courses, count } = await Course.findAndCountAll({
        where,
        include: [
          { model: Topic, as: 'topic' },
          { model: Lesson, as: 'lessons', attributes: ['id', 'duration'], where: { status: 'published' }, required: false },
        ],
        order: [['createdAt', 'DESC']],
        limit,
        offset,
        distinct: true,
      });

      const topics = await Topic.findAll({ order: [['name', 'ASC']] });

      // Get enrolled course IDs for the current user
      let enrolledCourseIds = [];
      if (req.session.userId) {
        const enrollments = await UserCourse.findAll({
          where: { userId: req.session.userId },
          attributes: ['courseId'],
        });
        enrolledCourseIds = enrollments.map(e => e.courseId);
      }

      const totalPages = Math.ceil(count / limit);

      res.render('pages/home/browse', {
        title: 'Explorar Cursos - SkillUp',
        layout: 'layouts/main',
        courses, topics, enrolledCourseIds,
        currentTopic: topic || null,
        search: search || '',
        currentPage: parseInt(page),
        totalPages,
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
      const course = await Course.findByPk(req.params.id, {
        include: [
          { model: Topic, as: 'topic' },
          { model: Lesson, as: 'lessons', where: { status: 'published' }, required: false },
          { model: require('../../models').Exam, as: 'exam' }
        ],
      });

      if (!course || course.status !== 'published') {
        req.flash('error', 'Curso não encontrado.');
        return res.redirect('/browse');
      }

      let isEnrolled = false;
      if (req.session.userId) {
        const enrollment = await UserCourse.findOne({
          where: { userId: req.session.userId, courseId: course.id },
        });
        isEnrolled = !!enrollment;
      }

      // Sort lessons by order
      const sortedLessons = course.lessons ? course.lessons.sort((a, b) => a.order - b.order) : [];

      res.render('pages/home/course-detail', {
        title: `${course.title} - SkillUp`,
        layout: 'layouts/main',
        course,
        isEnrolled,
        lessonCount: sortedLessons.length,
        topicLessons: sortedLessons,
      });
    } catch (error) {
      console.error('Erro no detalhe do curso:', error);
      req.flash('error', 'Erro ao carregar curso.');
      res.redirect('/browse');
    }
  },

  /** POST /browse/:id/enroll - Enroll in course */
  enroll: async (req, res) => {
    try {
      const course = await Course.findByPk(req.params.id);
      if (!course || course.status !== 'published') {
        req.flash('error', 'Curso não encontrado.');
        return res.redirect('/browse');
      }

      const [enrollment, created] = await UserCourse.findOrCreate({
        where: { userId: req.session.userId, courseId: course.id },
        defaults: { assignedAt: new Date() },
      });

      if (created) {
        req.flash('success', `Você se inscreveu no curso "${course.title}"!`);
      } else {
        req.flash('info', 'Você já está inscrito neste curso.');
      }

      return res.redirect(`/browse/${course.id}`);
    } catch (error) {
      console.error('Erro ao inscrever:', error);
      req.flash('error', 'Erro ao se inscrever no curso.');
      return res.redirect(`/browse/${req.params.id}`);
    }
  },

  /** POST /browse/:id/unenroll - Unenroll from course */
  unenroll: async (req, res) => {
    try {
      await UserCourse.destroy({
        where: { userId: req.session.userId, courseId: req.params.id },
      });

      req.flash('success', 'Inscrição cancelada.');
      return res.redirect(`/browse/${req.params.id}`);
    } catch (error) {
      console.error('Erro ao cancelar inscrição:', error);
      req.flash('error', 'Erro ao cancelar inscrição.');
      return res.redirect(`/browse/${req.params.id}`);
    }
  },
};

module.exports = homeController;
