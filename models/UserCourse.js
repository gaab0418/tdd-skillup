const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const UserCourse = sequelize.define('UserCourse', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  assignedAt: {
    type: DataTypes.DATE,
    allowNull: false,
    defaultValue: DataTypes.NOW,
  },
}, {
  tableName: 'user_courses',
  timestamps: true,
});

module.exports = UserCourse;
