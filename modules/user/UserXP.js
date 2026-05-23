import { DataTypes  } from 'sequelize';
import sequelize from '../../config/database.js';

const UserXP = sequelize.define('UserXP', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  action: {
    type: DataTypes.ENUM('watch_video', 'post_comment', 'reply_comment', 'complete_lesson', 'pass_exam', 'rate_course'),
    allowNull: false,
    comment: 'Tipo de ação que gerou o XP',
  },
  points: {
    type: DataTypes.INTEGER,
    allowNull: false,
    defaultValue: 10,
    comment: 'Quantidade de XP concedido',
    validate: {
      min: { args: [1], msg: 'Pontos devem ser no mínimo 1' },
    },
  },
  earnedAt: {
    type: DataTypes.DATE,
    allowNull: false,
    defaultValue: DataTypes.NOW,
  },
}, {
  tableName: 'user_xp',
});

export default UserXP;;

