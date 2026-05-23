import { User, Course, UserCourse } from '../../models/index.js';
import { Op } from 'sequelize';

class UserServiceError extends Error {
  constructor(message) {
    super(message);
    this.name = 'UserServiceError';
  }
}

const userService = {
  async listUsers(search, page = 1, limit = 15) {
    const offset = (page - 1) * limit;
    const where = {};
    if (search) {
      where[Op.or] = [
        { name: { [Op.like]: `%${search}%` } },
        { email: { [Op.like]: `%${search}%` } },
      ];
    }
    const { rows: users, count } = await User.findAndCountAll({
      where, order: [['createdAt', 'DESC']],
      limit, offset,
      attributes: { exclude: ['password'] },
    });
    return { users, count, totalPages: Math.ceil(count / limit) };
  },

  async getCoursesForAssignment() {
    return await Course.findAll({ where: { status: 'published' }, order: [['title', 'ASC']] });
  },

  async createUser(data, courseIds = []) {
    const { name, email, password, role, bio } = data;
    
    const existingUser = await User.findOne({ where: { email } });
    if (existingUser) {
      throw new UserServiceError('Este email ja esta cadastrado.');
    }

    const newUser = await User.create({ name, email, password, role, bio });

    if (courseIds && courseIds.length > 0) {
      const records = courseIds.map(courseId => ({ userId: newUser.id, courseId: parseInt(courseId) }));
      await UserCourse.bulkCreate(records);
    }
    return newUser;
  },

  async getUserById(id) {
    const user = await User.findByPk(id, {
      attributes: { exclude: ['password'] },
      include: [{ model: Course, as: 'enrolledCourses' }],
    });
    if (!user) throw new UserServiceError('Usuario nao encontrado.');
    return user;
  },

  async updateUser(id, data, courseIds = []) {
    const editUser = await User.findByPk(id);
    if (!editUser) throw new UserServiceError('Usuario nao encontrado.');
    
    const { name, email, role, bio } = data;
    editUser.name = name; 
    editUser.email = email;
    editUser.role = role; 
    editUser.bio = bio;
    await editUser.save();

    await UserCourse.destroy({ where: { userId: editUser.id } });
    if (courseIds && courseIds.length > 0) {
      const records = courseIds.map(courseId => ({ userId: editUser.id, courseId: parseInt(courseId) }));
      await UserCourse.bulkCreate(records);
    }
    return editUser;
  },

  async deleteUser(id, currentUserId) {
    const editUser = await User.findByPk(id);
    if (!editUser) throw new UserServiceError('Usuario nao encontrado.');
    if (editUser.id === currentUserId) {
      throw new UserServiceError('Voce nao pode excluir sua propria conta.');
    }
    await editUser.destroy();
    return true;
  }
};

export { userService, UserServiceError };
