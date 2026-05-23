import { Course, Topic, Lesson, User, UserCourse, Progress, Exam } from '../../models/index.js';
import { Op } from 'sequelize';

class HomeServiceError extends Error {
  constructor(message) {
    super(message);
    this.name = 'HomeServiceError';
  }
}

const homeService = {
  async getLandingData() {
    const lessonCount = await Lesson.count({ where: { status: 'published' } });
    const userCount = await User.count();
    return { lessonCount, userCount };
  },

  async getBrowseData(topic, search, page = 1, userId) {
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

    let enrolledCourseIds = [];
    if (userId) {
      const enrollments = await UserCourse.findAll({
        where: { userId },
        attributes: ['courseId'],
      });
      enrolledCourseIds = enrollments.map(e => e.courseId);
    }

    const totalPages = Math.ceil(count / limit);

    return {
      courses, topics, enrolledCourseIds,
      currentTopic: topic || null, search: search || '',
      currentPage: parseInt(page), totalPages
    };
  },

  async getCourseDetailData(courseId, userId) {
    const course = await Course.findByPk(courseId, {
      include: [
        { model: Topic, as: 'topic' },
        { model: Lesson, as: 'lessons', where: { status: 'published' }, required: false },
        { model: Exam, as: 'exam' }
      ],
    });

    if (!course || course.status !== 'published') {
      throw new HomeServiceError('Curso não encontrado.');
    }

    let isEnrolled = false;
    let userProgress = {};
    let isCourseCompleted = false;
    if (userId) {
      const enrollment = await UserCourse.findOne({
        where: { userId, courseId: course.id },
      });
      isEnrolled = !!enrollment;

      if (course.lessons && course.lessons.length > 0) {
        const lessonIds = course.lessons.map(l => l.id);
        const progressRecords = await Progress.findAll({
          where: { userId, lessonId: lessonIds, completed: true }
        });
        progressRecords.forEach(p => {
          userProgress[p.lessonId] = true;
        });
        
        if (progressRecords.length === course.lessons.length) {
          isCourseCompleted = true;
        }
      }
    }

    const sortedLessons = course.lessons ? course.lessons.sort((a, b) => a.order - b.order) : [];

    return {
      course, isEnrolled, lessonCount: sortedLessons.length,
      topicLessons: sortedLessons, userProgress, isCourseCompleted
    };
  },

  async enrollUser(courseId, userId) {
    const course = await Course.findByPk(courseId);
    if (!course || course.status !== 'published') {
      throw new HomeServiceError('Curso não encontrado.');
    }

    const [enrollment, created] = await UserCourse.findOrCreate({
      where: { userId, courseId: course.id },
      defaults: { assignedAt: new Date() },
    });

    return { course, created };
  },

  async unenrollUser(courseId, userId) {
    await UserCourse.destroy({
      where: { userId, courseId },
    });
    return true;
  }
};

export { homeService, HomeServiceError };
