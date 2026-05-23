import sequelize from '../config/database.js';
import User from '../modules/user/User.js';
import Topic from '../modules/topic/Topic.js';
import Course from '../modules/course/Course.js';
import Lesson from '../modules/lesson/Lesson.js';
import Progress from '../modules/exam/Progress.js';
import Certificate from '../modules/gamification/Certificate.js';
import Comment from '../modules/interaction/Comment.js';
import UserCourse from '../modules/course/UserCourse.js';
import Like from '../modules/interaction/Like.js';

import Exam from '../modules/exam/Exam.js';
import ExamQuestion from '../modules/exam/ExamQuestion.js';
import ExamAttempt from '../modules/exam/ExamAttempt.js';

// =============================================
// Associacoes
// =============================================

// User 1:N Lesson (autor)
User.hasMany(Lesson, { foreignKey: 'authorId', as: 'lessons' });
Lesson.belongsTo(User, { foreignKey: 'authorId', as: 'author' });

// Topic 1:N Course
Topic.hasMany(Course, { foreignKey: 'topicId', as: 'courses' });
Course.belongsTo(Topic, { foreignKey: 'topicId', as: 'topic' });

// Course 1:N Lesson
Course.hasMany(Lesson, { foreignKey: 'courseId', as: 'lessons' });
Lesson.belongsTo(Course, { foreignKey: 'courseId', as: 'course' });

// Relacionamento Topic e Lesson removido a pedido

// User 1:N Progress
User.hasMany(Progress, { foreignKey: 'userId', as: 'progress' });
Progress.belongsTo(User, { foreignKey: 'userId', as: 'user' });

// Lesson 1:N Progress
Lesson.hasMany(Progress, { foreignKey: 'lessonId', as: 'progress' });
Progress.belongsTo(Lesson, { foreignKey: 'lessonId', as: 'lesson' });

// User 1:N Certificate
User.hasMany(Certificate, { foreignKey: 'userId', as: 'certificates' });
Certificate.belongsTo(User, { foreignKey: 'userId', as: 'user' });

// Topic 1:N Certificate
Topic.hasMany(Certificate, { foreignKey: 'topicId', as: 'certificates' });
Certificate.belongsTo(Topic, { foreignKey: 'topicId', as: 'topic' });

// User 1:N Comment
User.hasMany(Comment, { foreignKey: 'userId', as: 'comments' });
Comment.belongsTo(User, { foreignKey: 'userId', as: 'user' });

// Lesson 1:N Comment
Lesson.hasMany(Comment, { foreignKey: 'lessonId', as: 'comments' });
Comment.belongsTo(Lesson, { foreignKey: 'lessonId', as: 'lesson' });

// User 1:N Like
User.hasMany(Like, { foreignKey: 'userId', as: 'likes' });
Like.belongsTo(User, { foreignKey: 'userId', as: 'user' });

// User N:M Course (via UserCourse)
User.belongsToMany(Course, { through: UserCourse, foreignKey: 'userId', as: 'enrolledCourses' });
Course.belongsToMany(User, { through: UserCourse, foreignKey: 'courseId', as: 'enrolledUsers' });

// Course 1:1 Exam
Course.hasOne(Exam, { foreignKey: 'courseId', as: 'exam' });
Exam.belongsTo(Course, { foreignKey: 'courseId', as: 'course' });

// Exam 1:N ExamQuestion
Exam.hasMany(ExamQuestion, { foreignKey: 'examId', as: 'questions' });
ExamQuestion.belongsTo(Exam, { foreignKey: 'examId', as: 'exam' });

// User 1:N ExamAttempt
User.hasMany(ExamAttempt, { foreignKey: 'userId', as: 'examAttempts' });
ExamAttempt.belongsTo(User, { foreignKey: 'userId', as: 'user' });

// Exam 1:N ExamAttempt
Exam.hasMany(ExamAttempt, { foreignKey: 'examId', as: 'attempts' });
ExamAttempt.belongsTo(Exam, { foreignKey: 'examId', as: 'exam' });

// Course 1:N Certificate
Course.hasMany(Certificate, { foreignKey: 'courseId', as: 'courseCertificates' });
Certificate.belongsTo(Course, { foreignKey: 'courseId', as: 'course' });

export {
  sequelize,
  User,
  Topic,
  Course,
  Lesson,
  Progress,
  Certificate,
  Comment,
  UserCourse,
  Like,
  Exam,
  ExamQuestion,
  ExamAttempt,
};

export default {
  sequelize,
  User,
  Topic,
  Course,
  Lesson,
  Progress,
  Certificate,
  Comment,
  UserCourse,
  Like,
  Exam,
  ExamQuestion,
  ExamAttempt,
};
