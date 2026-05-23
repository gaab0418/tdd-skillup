import { DataTypes  } from 'sequelize';
import sequelize from '../../config/database.js';

const Topic = sequelize.define('Topic', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  name: {
    type: DataTypes.STRING(100),
    allowNull: false,
    validate: {
      notEmpty: { msg: 'Nome do tópico é obrigatório' },
    },
  },
  slug: {
    type: DataTypes.STRING(100),
    allowNull: false,
    unique: true,
  },
  color: {
    type: DataTypes.STRING(7),
    allowNull: false,
    defaultValue: '#0050cb',
    validate: {
      is: { args: /^#[0-9A-Fa-f]{6}$/, msg: 'Cor deve ser em formato hexadecimal' },
    },
  },
  icon: {
    type: DataTypes.STRING(50),
    allowNull: false,
    defaultValue: 'school',
  },
}, {
  tableName: 'topics',
});

export default Topic;;

