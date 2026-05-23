import { Lesson, Topic, Course, User } from '../../models/index.js';
import { Op } from 'sequelize';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

let getVideoDurationInSeconds;
let ffprobe;
(async () => {
  try {
    const gvd = await import('get-video-duration');
    getVideoDurationInSeconds = gvd.getVideoDurationInSeconds;
    const ff = await import('ffprobe-static');
    ffprobe = ff.default || ff;
  } catch (err) {
    console.warn('Dependências de duração de vídeo não instaladas. A duração será fixa.');
  }
})();

class ContentServiceError extends Error {
  constructor(message) {
    super(message);
    this.name = 'ContentServiceError';
  }
}

const contentService = {
  async getContentIndex(search, topic, page = 1) {
    const limit = 10;
    const offset = (page - 1) * limit;
    const where = {};
    if (search) where.title = { [Op.like]: `%${search}%` };

    const { rows: lessons, count } = await Lesson.findAndCountAll({
      where,
      include: [
        { model: Course, as: 'course', attributes: ['id', 'title'] },
        { model: User, as: 'author', attributes: ['id', 'name', 'avatar'] },
      ],
      order: [['updatedAt', 'DESC']],
      limit, offset,
    });

    const topics = await Topic.findAll({ order: [['name', 'ASC']] });
    const totalLessons = await Lesson.count();
    const draftCount = await Lesson.count({ where: { status: 'draft' } });

    return {
      lessons, topics, totalLessons, draftCount,
      currentPage: parseInt(page), totalPages: Math.ceil(count / limit),
      search: search || '', currentTopic: topic || ''
    };
  },

  async getContentCreateData() {
    const topics = await Topic.findAll({ order: [['name', 'ASC']] });
    const courses = await Course.findAll({ where: { status: 'published' }, order: [['title', 'ASC']] });
    return { topics, courses };
  },

  async createContent(data, files, userId) {
    const { title, description, duration, level, status, courseId, order } = data;
    const lessonData = {
      title, description, duration: parseInt(duration) || 5,
      level: level || 'beginner', status: status || 'draft',
      courseId: courseId || null,
      authorId: userId, order: parseInt(order) || 0,
    };

    if (files) {
      if (files.video) {
        lessonData.videoUrl = `/uploads/videos/${files.video[0].filename}`;
        if (getVideoDurationInSeconds && ffprobe) {
          try {
            const videoPath = path.join(__dirname, '..', '..', 'public', 'uploads', 'videos', files.video[0].filename);
            const durationInSeconds = await getVideoDurationInSeconds(videoPath, ffprobe.path);
            lessonData.duration = Math.max(1, Math.ceil(durationInSeconds / 60));
          } catch (err) {
            console.error('Erro ao extrair duração do vídeo:', err);
          }
        }
      }
      if (files.thumbnail) {
        lessonData.thumbnail = `/uploads/thumbnails/${files.thumbnail[0].filename}`;
      }
    }

    return await Lesson.create(lessonData);
  },

  async getContentEditData(id) {
    const lesson = await Lesson.findByPk(id, {
      include: [{ model: Course, as: 'course' }],
    });
    if (!lesson) {
      throw new ContentServiceError('Licao nao encontrada.');
    }
    const topics = await Topic.findAll({ order: [['name', 'ASC']] });
    const courses = await Course.findAll({ where: { status: 'published' }, order: [['title', 'ASC']] });
    return { lesson, topics, courses };
  },

  async updateContent(id, data, files) {
    const lesson = await Lesson.findByPk(id);
    if (!lesson) {
      throw new ContentServiceError('Licao nao encontrada.');
    }
    const { title, description, duration, level, status, courseId, order } = data;
    lesson.title = title; lesson.description = description;
    lesson.level = level || 'beginner';
    lesson.status = status || 'draft';
    lesson.courseId = courseId || null;
    lesson.order = parseInt(order) || 0;
    
    if (duration) {
      lesson.duration = parseInt(duration);
    } else if (!lesson.duration) {
      lesson.duration = 5;
    }

    if (files) {
      if (files.video) {
        lesson.videoUrl = `/uploads/videos/${files.video[0].filename}`;
        if (getVideoDurationInSeconds && ffprobe) {
          try {
            const videoPath = path.join(__dirname, '..', '..', 'public', 'uploads', 'videos', files.video[0].filename);
            const durationInSeconds = await getVideoDurationInSeconds(videoPath, ffprobe.path);
            lesson.duration = Math.max(1, Math.ceil(durationInSeconds / 60));
          } catch (err) {
            console.error('Erro ao extrair duração do vídeo:', err);
          }
        }
      }
      if (files.thumbnail) {
        lesson.thumbnail = `/uploads/thumbnails/${files.thumbnail[0].filename}`;
      }
    }

    await lesson.save();
    return lesson;
  },

  async deleteContent(id) {
    const lesson = await Lesson.findByPk(id);
    if (!lesson) {
      throw new ContentServiceError('Licao nao encontrada.');
    }
    await lesson.destroy();
    return true;
  }
};

export { contentService, ContentServiceError };
