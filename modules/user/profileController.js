import { profileService, ProfileServiceError } from './profileService.js';
import { uploadAvatar } from '../../middlewares/upload.js';

const profileController = {
  /** GET /profile - Perfil + Cursos Inscritos + Certificados */
  index: async (req, res) => {
    try {
      const data = await profileService.getProfileData(req.session.userId);

      res.render('pages/profile/index', {
        title: 'Meu Perfil - SkillUp',
        layout: 'layouts/main',
        profileUser: data.user,
        completedLessons: data.completedLessons,
        totalWatched: data.totalWatched,
        certificates: data.certificates,
        streak: data.streak,
        enrolledCourses: data.coursesWithProgress,
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
      const data = await profileService.getMyCourseData(req.session.userId, req.params.id);

      res.render('pages/profile/my-course', {
        title: `${data.course.title} - Trilha - SkillUp`,
        layout: 'layouts/main',
        course: data.course,
        lessons: data.lessons,
        progressMap: data.progressMap,
      });
    } catch (error) {
      if (error instanceof ProfileServiceError) {
        req.flash('error', error.message);
        return res.redirect('/browse');
      }
      console.error('Erro na trilha do curso:', error);
      req.flash('error', 'Erro ao carregar trilha.');
      res.redirect('/profile');
    }
  },

  /** GET /profile/settings */
  settings: async (req, res) => {
    try {
      const user = await profileService.getSettingsData(req.session.userId);

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
      await profileService.updateProfileSettings(req.session.userId, req.body, req.file);

      req.flash('success', 'Perfil atualizado com sucesso!');
      return res.redirect('/profile/settings');
    } catch (error) {
      if (error instanceof ProfileServiceError) {
        req.flash('error', error.message);
      } else {
        console.error('Erro ao atualizar perfil:', error);
        req.flash('error', 'Erro ao atualizar perfil.');
      }
      return res.redirect('/profile/settings');
    }
  },
};

export default profileController;
