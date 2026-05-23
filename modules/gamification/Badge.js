import { DataTypes  } from 'sequelize';
import sequelize from '../../config/database.js';

const Badge = sequelize.define('Badge', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  name: {
    type: DataTypes.STRING(100),
    allowNull: false,
    unique: true,
    validate: {
      notEmpty: { msg: 'Nome da medalha é obrigatório' },
    },
  },
  description: {
    type: DataTypes.TEXT,
    allowNull: true,
  },
  icon: {
    type: DataTypes.STRING(255),
    allowNull: true,
    comment: 'URL ou nome do ícone da medalha',
  },
  criteria: {
    type: DataTypes.STRING(255),
    allowNull: false,
    comment: 'Critério para obter a medalha, ex: first_lesson, perfect_exam',
    validate: {
      notEmpty: { msg: 'Critério é obrigatório' },
    },
  },
}, {
  tableName: 'badges',
});

export default Badge;;

