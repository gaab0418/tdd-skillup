const { DataTypes } = require('sequelize');
const sequelize = require('../../config/database');

const CourseCategory = sequelize.define('CourseCategory', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
}, {
  tableName: 'course_categories',
  timestamps: true,
});

module.exports = CourseCategory;

