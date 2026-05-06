const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const ExamAttempt = sequelize.define('ExamAttempt', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  score: {
    type: DataTypes.INTEGER,
    allowNull: false,
    defaultValue: 0,
    comment: 'Pontuação obtida (porcentagem)',
    validate: {
      min: { args: [0], msg: 'Pontuação não pode ser negativa' },
      max: { args: [100], msg: 'Pontuação não pode ultrapassar 100' },
    },
  },
  totalCorrect: {
    type: DataTypes.INTEGER,
    allowNull: false,
    defaultValue: 0,
  },
  totalQuestions: {
    type: DataTypes.INTEGER,
    allowNull: false,
    defaultValue: 0,
  },
  passed: {
    type: DataTypes.BOOLEAN,
    allowNull: false,
    defaultValue: false,
  },
  attemptedAt: {
    type: DataTypes.DATE,
    allowNull: false,
    defaultValue: DataTypes.NOW,
  },
}, {
  tableName: 'exam_attempts',
});

module.exports = ExamAttempt;
