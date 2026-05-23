import { DataTypes  } from 'sequelize';
import sequelize from '../../config/database.js';

const CourseCategory = sequelize.define('CourseCategory', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
}, {
  tableName: 'course_categories',
  timestamps: true,
});

export default CourseCategory;;

