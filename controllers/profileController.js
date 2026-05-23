const { User, Progress, Certificate, Lesson, Topic } = require('../models');
const { uploadAvatar } = require('../middlewares/upload');

const profileController = {
  /** GET /profile - Perfil + Certificados */
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
        include: [{ model: Topic, as: 'topic' }],
        order: [['issuedAt', 'DESC']],
      });

      // Calcular streak (simplificado: dias consecutivos com progresso)
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
        activePage: 'certificates',
      });
    } catch (error) {
      console.error('Erro no perfil:', error);
      req.flash('error', 'Erro ao carregar perfil.');
      res.redirect('/');
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

module.exports = profileController;
