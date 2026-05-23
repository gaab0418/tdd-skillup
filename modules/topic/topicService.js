import { Topic, Course, Lesson } from '../../models/index.js';

class TopicServiceError extends Error {
  constructor(message) {
    super(message);
    this.name = 'TopicServiceError';
  }
}

const topicService = {
  async getAllTopics() {
    return await Topic.findAll({
      include: [
        { model: Course, as: 'courses', include: [{ model: Lesson, as: 'lessons', attributes: ['id'] }] },
      ],
      order: [['name', 'ASC']],
    });
  },

  async createTopic(data) {
    const { name, slug, color, icon } = data;
    return await Topic.create({ 
      name, 
      slug: slug || name.toLowerCase().replace(/\s+/g, '-'), 
      color: color || '#0050cb', 
      icon: icon || 'school' 
    });
  },

  async getTopicById(id) {
    const topic = await Topic.findByPk(id);
    if (!topic) {
      throw new TopicServiceError('Topico nao encontrado.');
    }
    return topic;
  },

  async updateTopic(id, data) {
    const topic = await Topic.findByPk(id);
    if (!topic) {
      throw new TopicServiceError('Topico nao encontrado.');
    }
    const { name, slug, color, icon } = data;
    topic.name = name; 
    topic.slug = slug; 
    topic.color = color; 
    topic.icon = icon;
    await topic.save();
    return topic;
  },

  async deleteTopic(id) {
    const topic = await Topic.findByPk(id, {
      include: [{ model: Course, as: 'courses', attributes: ['id'] }],
    });
    if (!topic) {
      throw new TopicServiceError('Topico nao encontrado.');
    }
    if (topic.courses && topic.courses.length > 0) {
      throw new TopicServiceError('Nao e possivel excluir topico com cursos vinculados.');
    }
    await topic.destroy();
    return true;
  }
};

export { topicService, TopicServiceError };
