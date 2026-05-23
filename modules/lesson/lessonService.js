import { Lesson, Topic, Progress, Comment, User, UserCourse, Like } from '../../models/index.js';

class LessonServiceError extends Error {
  constructor(message) {
    super(message);
    this.name = 'LessonServiceError';
  }
}

const lessonService = {
  async getLessonPlayer(lessonId, userId) {
    const lesson = await Lesson.findByPk(lessonId, {
      include: [
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
      throw new LessonServiceError('Lição não encontrada.');
    }

    if (lesson.courseId && userId) {
      const enrollment = await UserCourse.findOne({
        where: { userId, courseId: lesson.courseId },
      });
      if (!enrollment) {
        const error = new LessonServiceError('Você precisa se inscrever no curso para assistir esta aula.');
        error.courseId = lesson.courseId;
        throw error;
      }
    }

    let curriculum = [];
    if (lesson.courseId) {
      curriculum = await Lesson.findAll({
        where: { courseId: lesson.courseId, status: 'published' },
        order: [['order', 'ASC']],
        attributes: ['id', 'title', 'duration', 'order'],
      });
    } else {
      curriculum = [lesson];
    }

    let userProgress = null;
    let curriculumProgress = {};
    if (userId) {
      userProgress = await Progress.findOne({
        where: { userId, lessonId: lesson.id },
      });

      const allProgress = await Progress.findAll({
        where: { userId },
      });
      allProgress.forEach((p) => {
        curriculumProgress[p.lessonId] = p;
      });
    }

    let userLikes = [];
    if (userId && lesson.comments) {
      const commentIds = lesson.comments.map(c => c.id);
      if (commentIds.length > 0) {
        const likes = await Like.findAll({
          where: {
            userId,
            targetType: 'comment',
            targetId: commentIds,
          },
        });
        userLikes = likes.map(l => l.targetId);
      }
    }

    const completedCount = Object.values(curriculumProgress).filter((p) => p.completed).length;

    return {
      lesson,
      curriculum,
      userProgress,
      curriculumProgress,
      completedCount,
      userLikes
    };
  },

  async updateProgress(lessonId, userId, data) {
    const { completed, watchedMinutes } = data;
    const [progress] = await Progress.findOrCreate({
      where: { userId, lessonId },
      defaults: { completed: false, watchedMinutes: 0 },
    });

    if (completed === 'true' || completed === true) {
      progress.completed = true;
      progress.completedAt = new Date();
    } else if (completed === 'false' || completed === false) {
      progress.completed = false;
      progress.completedAt = null;
    }
    
    if (watchedMinutes !== undefined && watchedMinutes !== null) {
      progress.watchedMinutes = parseInt(watchedMinutes);
    }

    await progress.save();
    return progress;
  },

  async addComment(lessonId, userId, content) {
    if (!content || content.trim() === '') {
      throw new LessonServiceError('O comentário não pode ser vazio.');
    }

    const comment = await Comment.create({
      content: content.trim(),
      userId,
      lessonId,
    });
    return comment;
  },

  async toggleLike(commentId, userId) {
    const comment = await Comment.findByPk(commentId);
    if (!comment) {
      throw new LessonServiceError('Comentário não encontrado');
    }

    const existingLike = await Like.findOne({
      where: { userId, targetType: 'comment', targetId: commentId },
    });

    let liked;
    if (existingLike) {
      await existingLike.destroy();
      comment.likes = Math.max(0, comment.likes - 1);
      liked = false;
    } else {
      await Like.create({ userId, targetType: 'comment', targetId: commentId });
      comment.likes = comment.likes + 1;
      liked = true;
    }

    await comment.save();
    return { liked, likeCount: comment.likes };
  }
};

export { lessonService, LessonServiceError };
