import { DataTypes  } from 'sequelize';
import sequelize from '../../config/database.js';

const Like = sequelize.define('Like', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  targetType: {
    type: DataTypes.ENUM('comment', 'lesson'),
    allowNull: false,
    comment: 'Tipo do alvo da curtida: comment ou lesson',
  },
  targetId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    comment: 'ID do comentário ou lição curtido',
  },
}, {
  tableName: 'likes',
  indexes: [
    {
      unique: true,
      fields: ['userId', 'targetType', 'targetId'],
      name: 'unique_user_like',
    },
  ],
});

export default Like;;

