const { Lesson, Topic, Progress, Comment, User } = require('../../models');

const lessonController = {
  /** GET /lessons/:id - Player da lição */
  player: async (req, res) => {
    try {
      const lesson = await Lesson.findByPk(req.params.id, {
        include: [
          { model: Topic, as: 'topic' },
          { model: User, as: 'author', attributes: ['id', 'name', 'avatar', 'bio'] },
          {
            model: Comment,
            as: 'comments',
            include: [{ model: User, as: 'user', attributes: ['id', 'name', 'avatar'] }],
            order: [['createdAt', 'DESC']],
          },
        ],
      });

      if (!lesson || lesson.status !== 'published') {
        req.flash('error', 'Lição não encontrada.');
        return res.redirect('/browse');
      }

      // Buscar todas as lições do mesmo tópico (currículo/sidebar)
      const curriculum = await Lesson.findAll({
        where: { topicId: lesson.topicId, status: 'published' },
        order: [['order', 'ASC']],
        attributes: ['id', 'title', 'duration', 'order'],
      });

      // Progresso do usuário
      let userProgress = null;
      let curriculumProgress = {};
      if (req.session.userId) {
        userProgress = await Progress.findOne({
          where: { userId: req.session.userId, lessonId: lesson.id },
        });

        const allProgress = await Progress.findAll({
          where: { userId: req.session.userId },
        });
        allProgress.forEach((p) => {
          curriculumProgress[p.lessonId] = p;
        });
      }

      const completedCount = Object.values(curriculumProgress).filter((p) => p.completed).length;

      res.render('pages/lessons/player', {
        title: `${lesson.title} - SkillUp`,
        layout: 'layouts/main',
        lesson,
        curriculum,
        userProgress,
        curriculumProgress,
        completedCount,
      });
    } catch (error) {
      console.error('Erro no player:', error);
      req.flash('error', 'Erro ao carregar lição.');
      res.redirect('/browse');
    }
  },

  /** POST /lessons/:id/progress - Atualizar progresso */
  updateProgress: async (req, res) => {
    try {
      const { completed, watchedMinutes } = req.body;
      const [progress] = await Progress.findOrCreate({
        where: { userId: req.session.userId, lessonId: req.params.id },
        defaults: { completed: false, watchedMinutes: 0 },
      });

      if (completed === 'true' || completed === true) {
        progress.completed = true;
        progress.completedAt = new Date();
      }
      if (watchedMinutes) {
        progress.watchedMinutes = parseInt(watchedMinutes);
      }

      await progress.save();
      res.json({ success: true, progress });
    } catch (error) {
      console.error('Erro ao atualizar progresso:', error);
      res.status(500).json({ success: false, error: 'Erro ao atualizar progresso' });
    }
  },

  /** POST /lessons/:id/comments - Adicionar comentário */
  addComment: async (req, res) => {
    try {
      const { content } = req.body;

      if (!content || content.trim() === '') {
        req.flash('error', 'O comentário não pode ser vazio.');
        return res.redirect(`/lessons/${req.params.id}`);
      }

      await Comment.create({
        content: content.trim(),
        userId: req.session.userId,
        lessonId: req.params.id,
      });

      req.flash('success', 'Comentário adicionado!');
      return res.redirect(`/lessons/${req.params.id}`);
    } catch (error) {
      console.error('Erro ao adicionar comentário:', error);
      req.flash('error', 'Erro ao adicionar comentário.');
      return res.redirect(`/lessons/${req.params.id}`);
    }
  },
};

module.exports = lessonController;

