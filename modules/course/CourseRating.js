import { DataTypes  } from 'sequelize';
import sequelize from '../../config/database.js';

const CourseRating = sequelize.define('CourseRating', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  rating: {
    type: DataTypes.INTEGER,
    allowNull: false,
    validate: {
      min: { args: [1], msg: 'Nota mínima é 1' },
      max: { args: [5], msg: 'Nota máxima é 5' },
    },
    comment: 'Nota de 1 a 5 estrelas',
  },
  feedback: {
    type: DataTypes.TEXT,
    allowNull: true,
    comment: 'Feedback textual opcional sobre a qualidade do curso',
  },
}, {
  tableName: 'course_ratings',
  indexes: [
    {
      unique: true,
      fields: ['userId', 'courseId'],
      name: 'unique_user_course_rating',
    },
  ],
});

export default CourseRating;;

