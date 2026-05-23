import { DataTypes  } from 'sequelize';
import sequelize from '../../config/database.js';

const Exam = sequelize.define('Exam', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  title: {
    type: DataTypes.STRING(200),
    allowNull: false,
    validate: {
      notEmpty: { msg: 'Título da prova é obrigatório' },
    },
  },
  description: {
    type: DataTypes.TEXT,
    allowNull: true,
  },
  passingScore: {
    type: DataTypes.INTEGER,
    allowNull: false,
    defaultValue: 70,
    comment: 'Nota mínima para aprovação (porcentagem)',
    validate: {
      min: { args: [0], msg: 'Nota mínima não pode ser negativa' },
      max: { args: [100], msg: 'Nota mínima não pode ultrapassar 100' },
    },
  },
  totalQuestions: {
    type: DataTypes.INTEGER,
    allowNull: false,
    defaultValue: 10,
  },
}, {
  tableName: 'exams',
});

export default Exam;;

