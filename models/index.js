const sequelize = require('../config/database');
const User = require('./User');
const Topic = require('./Topic');
const Course = require('./Course');
const Lesson = require('./Lesson');
const Progress = require('./Progress');
const Certificate = require('./Certificate');
const Comment = require('./Comment');
const UserCourse = require('./UserCourse');

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

// Topic 1:N Lesson (mantido para filtro rapido)
Topic.hasMany(Lesson, { foreignKey: 'topicId', as: 'lessons' });
Lesson.belongsTo(Topic, { foreignKey: 'topicId', as: 'topic' });

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

// User N:M Course (via UserCourse)
User.belongsToMany(Course, { through: UserCourse, foreignKey: 'userId', as: 'enrolledCourses' });
Course.belongsToMany(User, { through: UserCourse, foreignKey: 'courseId', as: 'enrolledUsers' });

module.exports = {
  sequelize,
  User,
  Topic,
  Course,
  Lesson,
  Progress,
  Certificate,
  Comment,
  UserCourse,
};
