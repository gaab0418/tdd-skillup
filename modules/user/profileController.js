import { User, Progress, Certificate, Lesson, Topic, Course, UserCourse, Exam } from '../../models/index.js';
import { uploadAvatar  } from '../../middlewares/upload.js';

const profileController = {
  /** GET /profile - Perfil + Cursos Inscritos + Certificados */
  index: async (req, res) => {
    try {
      const user = await User.findByPk(req.session.userId, {
        attributes: { exclude: ['password'] },
      });

      const completedLessons = await Progress.count({
        where: { userId: req.session.userId, completed: true },
      });

      const totalWatched = await Progress.sum('watchedMinutes', {
        where: { userId: req.session.userId },
      }) || 0;

      const certificates = await Certificate.findAll({
        where: { userId: req.session.userId },
        include: [
          { model: Topic, as: 'topic' },
          { model: Course, as: 'course' }
        ],
        order: [['issuedAt', 'DESC']],
      });

      // Buscar cursos inscritos
      const enrolledCourses = await Course.findAll({
        include: [
          { model: Topic, as: 'topic' },
          { model: Lesson, as: 'lessons', where: { status: 'published' }, required: false },
          {
            model: User,
            as: 'enrolledUsers',
            where: { id: req.session.userId },
            attributes: [],
            through: { attributes: [] },
          },
        ],
      });

      // Buscar progresso do usuário para calcular por curso
      const allProgress = await Progress.findAll({
        where: { userId: req.session.userId, completed: true },
        attributes: ['lessonId'],
      });
      const completedLessonIds = new Set(allProgress.map(p => p.lessonId));

      // Adicionar progresso a cada curso
      const coursesWithProgress = enrolledCourses.map(course => {
        const totalLessons = course.lessons ? course.lessons.length : 0;
        const completedInCourse = course.lessons
          ? course.lessons.filter(l => completedLessonIds.has(l.id)).length
          : 0;
        return {
          ...course.toJSON(),
          totalLessons,
          completedInCourse,
          progressPercent: totalLessons > 0 ? Math.round((completedInCourse / totalLessons) * 100) : 0,
        };
      });

      // Calcular streak
      const recentProgress = await Progress.findAll({
        where: { userId: req.session.userId, completed: true },
        order: [['completedAt', 'DESC']],
        limit: 30,
      });

      let streak = 0;
      if (recentProgress.length > 0) {
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        let checkDate = new Date(today);

        for (const p of recentProgress) {
          if (!p.completedAt) continue;
          const pDate = new Date(p.completedAt);
          pDate.setHours(0, 0, 0, 0);

          if (pDate.getTime() === checkDate.getTime()) {
            streak++;
            checkDate.setDate(checkDate.getDate() - 1);
          } else if (pDate.getTime() < checkDate.getTime()) {
            break;
          }
        }
      }

      res.render('pages/profile/index', {
        title: 'Meu Perfil - SkillUp',
        layout: 'layouts/main',
        profileUser: user,
        completedLessons,
        totalWatched,
        certificates,
        streak,
        enrolledCourses: coursesWithProgress,
        activePage: 'certificates',
      });
    } catch (error) {
      console.error('Erro no perfil:', error);
      req.flash('error', 'Erro ao carregar perfil.');
      res.redirect('/');
    }
  },

  /** GET /profile/course/:id - Trilha de Aprendizado do curso */
  myCourse: async (req, res) => {
    try {
      // Verificar inscrição
      const enrollment = await UserCourse.findOne({
        where: { userId: req.session.userId, courseId: req.params.id },
      });

      if (!enrollment) {
        req.flash('error', 'Você não está inscrito neste curso.');
        return res.redirect('/browse');
      }

      const course = await Course.findByPk(req.params.id, {
        include: [
          { model: Topic, as: 'topic' },
          {
            model: Lesson,
            as: 'lessons',
            where: { status: 'published' },
            required: false,
          },
          { model: Exam, as: 'exam' }
        ],
      });

      if (!course) {
        req.flash('error', 'Curso não encontrado.');
        return res.redirect('/profile');
      }

      // Ordenar lições
      const lessons = course.lessons ? course.lessons.sort((a, b) => a.order - b.order) : [];

      // Progresso do usuário
      const progressList = await Progress.findAll({
        where: { userId: req.session.userId },
      });
      const progressMap = {};
      progressList.forEach(p => {
        progressMap[p.lessonId] = p;
      });

      res.render('pages/profile/my-course', {
        title: `${course.title} - Trilha - SkillUp`,
        layout: 'layouts/main',
        course,
        lessons,
        progressMap,
      });
    } catch (error) {
      console.error('Erro na trilha do curso:', error);
      req.flash('error', 'Erro ao carregar trilha.');
      res.redirect('/profile');
    }
  },

  /** GET /profile/settings */
  settings: async (req, res) => {
    try {
      const user = await User.findByPk(req.session.userId, {
        attributes: { exclude: ['password'] },
      });

      res.render('pages/profile/settings', {
        title: 'Configurações - SkillUp',
        layout: 'layouts/main',
        profileUser: user,
        activePage: 'settings',
      });
    } catch (error) {
      console.error('Erro nas configurações:', error);
      req.flash('error', 'Erro ao carregar configurações.');
      res.redirect('/profile');
    }
  },

  /** POST /profile/settings */
  updateSettings: async (req, res) => {
    try {
      const user = await User.findByPk(req.session.userId);
      const { name, email, bio, currentPassword, newPassword } = req.body;

      if (name) user.name = name;
      if (email) user.email = email;
      if (bio !== undefined) user.bio = bio;

      // Se enviou avatar via multer
      if (req.file) {
        user.avatar = `/uploads/avatars/${req.file.filename}`;
      }

      // Alterar senha
      if (newPassword && currentPassword) {
        const isValid = await user.comparePassword(currentPassword);
        if (!isValid) {
          req.flash('error', 'Senha atual incorreta.');
          return res.redirect('/profile/settings');
        }
        user.password = newPassword; // Hook beforeUpdate faz o hash
      }

      await user.save();
      req.flash('success', 'Perfil atualizado com sucesso!');
      return res.redirect('/profile/settings');
    } catch (error) {
      console.error('Erro ao atualizar perfil:', error);
      req.flash('error', 'Erro ao atualizar perfil.');
      return res.redirect('/profile/settings');
    }
  },
};

export default profileController;;
