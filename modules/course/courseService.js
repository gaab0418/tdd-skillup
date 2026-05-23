import { Course } from '../../models/index.js';

class CourseServiceError extends Error {
  constructor(message) {
    super(message);
    this.name = 'CourseServiceError';
  }
}

const courseService = {
  async getAllCourses() {
    return await Course.findAll({
      order: [['title', 'ASC']],
    });
  },

  async createCourse(data, file) {
    const { title, description, level, status } = data;
    const thumbnail = file && file.thumbnail ? `/uploads/thumbnails/${file.thumbnail[0].filename}` : null;
    
    return await Course.create({ 
      title, 
      description, 
      level: level || 'beginner', 
      status: status || 'draft', 
      thumbnail 
    });
  },

  async getCourseById(id) {
    const course = await Course.findByPk(id);
    if (!course) {
      throw new CourseServiceError('Curso nao encontrado.');
    }
    return course;
  },

  async updateCourse(id, data, file) {
    const course = await Course.findByPk(id);
    if (!course) {
      throw new CourseServiceError('Curso nao encontrado.');
    }
    
    const { title, description, level, status } = data;
    course.title = title; 
    course.description = description; 
    course.level = level; 
    course.status = status;
    
    if (file && file.thumbnail) {
      course.thumbnail = `/uploads/thumbnails/${file.thumbnail[0].filename}`;
    }
    
    await course.save();
    return course;
  },

  async deleteCourse(id) {
    const course = await Course.findByPk(id);
    if (!course) {
      throw new CourseServiceError('Curso nao encontrado.');
    }
    
    await course.destroy();
    return true;
  }
};

export { courseService, CourseServiceError };
