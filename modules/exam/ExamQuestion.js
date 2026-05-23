import { DataTypes  } from 'sequelize';
import sequelize from '../../config/database.js';

const ExamQuestion = sequelize.define('ExamQuestion', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  question: {
    type: DataTypes.TEXT,
    allowNull: false,
    validate: {
      notEmpty: { msg: 'Enunciado da questão é obrigatório' },
    },
  },
  optionA: {
    type: DataTypes.STRING(255),
    allowNull: false,
    validate: {
      notEmpty: { msg: 'Alternativa A é obrigatória' },
    },
  },
  optionB: {
    type: DataTypes.STRING(255),
    allowNull: false,
    validate: {
      notEmpty: { msg: 'Alternativa B é obrigatória' },
    },
  },
  optionC: {
    type: DataTypes.STRING(255),
    allowNull: false,
    validate: {
      notEmpty: { msg: 'Alternativa C é obrigatória' },
    },
  },
  optionD: {
    type: DataTypes.STRING(255),
    allowNull: false,
    validate: {
      notEmpty: { msg: 'Alternativa D é obrigatória' },
    },
  },
  correctOption: {
    type: DataTypes.ENUM('A', 'B', 'C', 'D'),
    allowNull: false,
    validate: {
      isIn: { args: [['A', 'B', 'C', 'D']], msg: 'Alternativa correta deve ser A, B, C ou D' },
    },
  },
  order: {
    type: DataTypes.INTEGER,
    allowNull: false,
    defaultValue: 0,
  },
}, {
  tableName: 'exam_questions',
});

export default ExamQuestion;;

