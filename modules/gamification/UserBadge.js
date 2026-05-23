import { DataTypes  } from 'sequelize';
import sequelize from '../../config/database.js';

const UserBadge = sequelize.define('UserBadge', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  earnedAt: {
    type: DataTypes.DATE,
    allowNull: false,
    defaultValue: DataTypes.NOW,
  },
}, {
  tableName: 'user_badges',
  indexes: [
    {
      unique: true,
      fields: ['userId', 'badgeId'],
      name: 'unique_user_badge',
    },
  ],
});

export default UserBadge;;

