import { lessonService, LessonServiceError } from './lessonService.js';

const lessonController = {
  /** GET /lessons/:id - Player da lição */
  player: async (req, res) => {
    try {
      const data = await lessonService.getLessonPlayer(req.params.id, req.session.userId);

      res.render('pages/lessons/player', {
        title: `${data.lesson.title} - SkillUp`,
        layout: 'layouts/main',
        lesson: data.lesson,
        curriculum: data.curriculum,
        userProgress: data.userProgress,
        curriculumProgress: data.curriculumProgress,
        completedCount: data.completedCount,
        userLikes: data.userLikes,
      });
    } catch (error) {
      if (error instanceof LessonServiceError) {
        req.flash('error', error.message);
        if (error.courseId) {
          return res.redirect(`/browse/${error.courseId}`);
        }
      } else {
        console.error('Erro no player:', error);
        req.flash('error', 'Erro ao carregar lição.');
      }
      res.redirect('/browse');
    }
  },

  /** POST /lessons/:id/progress - Atualizar progresso */
  updateProgress: async (req, res) => {
    try {
      const progress = await lessonService.updateProgress(req.params.id, req.session.userId, req.body);
      res.json({ success: true, progress });
    } catch (error) {
      console.error('Erro ao atualizar progresso:', error);
      res.status(500).json({ success: false, error: 'Erro ao atualizar progresso' });
    }
  },

  /** POST /lessons/:id/comments - Adicionar comentário */
  addComment: async (req, res) => {
    try {
      await lessonService.addComment(req.params.id, req.session.userId, req.body.content);
      req.flash('success', 'Comentário adicionado!');
      return res.redirect(`/lessons/${req.params.id}`);
    } catch (error) {
      if (error instanceof LessonServiceError) {
        req.flash('error', error.message);
      } else {
        console.error('Erro ao adicionar comentário:', error);
        req.flash('error', 'Erro ao adicionar comentário.');
      }
      return res.redirect(`/lessons/${req.params.id}`);
    }
  },

  /** POST /lessons/:id/comments/:commentId/like - Toggle like */
  toggleLike: async (req, res) => {
    try {
      const result = await lessonService.toggleLike(req.params.commentId, req.session.userId);
      return res.json({ success: true, liked: result.liked, likeCount: result.likeCount });
    } catch (error) {
      if (error instanceof LessonServiceError) {
        return res.status(404).json({ success: false, error: error.message });
      }
      console.error('Erro ao curtir:', error);
      return res.status(500).json({ success: false, error: 'Erro ao curtir comentário' });
    }
  },
};

export default lessonController;
