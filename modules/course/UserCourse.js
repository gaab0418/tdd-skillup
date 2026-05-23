import { DataTypes  } from 'sequelize';
import sequelize from '../../config/database.js';

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

export default UserCourse;;

