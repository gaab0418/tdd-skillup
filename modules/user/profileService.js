import { User, Progress, Certificate, Lesson, Topic, Course, UserCourse, Exam } from '../../models/index.js';

class ProfileServiceError extends Error {
  constructor(message) {
    super(message);
    this.name = 'ProfileServiceError';
  }
}

const profileService = {
  async getProfileData(userId) {
    const user = await User.findByPk(userId, {
      attributes: { exclude: ['password'] },
    });

    const completedLessons = await Progress.count({
      where: { userId, completed: true },
    });

    const totalWatched = await Progress.sum('watchedMinutes', {
      where: { userId },
    }) || 0;

    const certificates = await Certificate.findAll({
      where: { userId },
      include: [
        { model: Topic, as: 'topic' },
        { model: Course, as: 'course' }
      ],
      order: [['issuedAt', 'DESC']],
    });

    const enrolledCourses = await Course.findAll({
      include: [
        { model: Topic, as: 'topic' },
        { model: Lesson, as: 'lessons', where: { status: 'published' }, required: false },
        {
          model: User,
          as: 'enrolledUsers',
          where: { id: userId },
          attributes: [],
          through: { attributes: [] },
        },
      ],
    });

    const allProgress = await Progress.findAll({
      where: { userId, completed: true },
      attributes: ['lessonId'],
    });
    const completedLessonIds = new Set(allProgress.map(p => p.lessonId));

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

    const recentProgress = await Progress.findAll({
      where: { userId, completed: true },
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

    return {
      user,
      completedLessons,
      totalWatched,
      certificates,
      coursesWithProgress,
      streak
    };
  },

  async getMyCourseData(userId, courseId) {
    const enrollment = await UserCourse.findOne({
      where: { userId, courseId },
    });

    if (!enrollment) {
      throw new ProfileServiceError('Você não está inscrito neste curso.');
    }

    const course = await Course.findByPk(courseId, {
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
      throw new ProfileServiceError('Curso não encontrado.');
    }

    const lessons = course.lessons ? course.lessons.sort((a, b) => a.order - b.order) : [];

    const progressList = await Progress.findAll({
      where: { userId },
    });
    const progressMap = {};
    progressList.forEach(p => {
      progressMap[p.lessonId] = p;
    });

    return { course, lessons, progressMap };
  },

  async getSettingsData(userId) {
    return await User.findByPk(userId, {
      attributes: { exclude: ['password'] },
    });
  },

  async updateProfileSettings(userId, data, file) {
    const user = await User.findByPk(userId);
    const { name, email, bio, currentPassword, newPassword } = data;

    if (name) user.name = name;
    if (email) user.email = email;
    if (bio !== undefined) user.bio = bio;

    if (file) {
      user.avatar = `/uploads/avatars/${file.filename}`;
    }

    if (newPassword && currentPassword) {
      const isValid = await user.comparePassword(currentPassword);
      if (!isValid) {
        throw new ProfileServiceError('Senha atual incorreta.');
      }
      user.password = newPassword;
    }

    await user.save();
    return user;
  }
};

export { profileService, ProfileServiceError };
