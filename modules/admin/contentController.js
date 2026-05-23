import { Lesson, Topic, Course, User  } from '../../models/index.js';
import { Op  } from 'sequelize';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

let getVideoDurationInSeconds;
let ffprobe;
try {
  const gvd = await import('get-video-duration');
  getVideoDurationInSeconds = gvd.getVideoDurationInSeconds;
  const ff = await import('ffprobe-static');
  ffprobe = ff.default || ff;
} catch (err) {
  console.warn('Dependências de duração de vídeo não instaladas. A duração será fixa.');
}

const contentController = {
  /** GET /admin/content */
  index: async (req, res) => {
    try {
      const { search, topic, page = 1 } = req.query;
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

      res.render('pages/admin/content', {
        title: 'Gerenciador de Conteúdo - SkillUp Admin', layout: 'layouts/admin',
        lessons, topics, totalLessons, draftCount,
        currentPage: parseInt(page), totalPages: Math.ceil(count / limit),
        search: search || '', currentTopic: topic || '', activePage: 'content',
      });
    } catch (error) {
      console.error('Erro no content manager:', error);
      req.flash('error', 'Erro ao carregar conteudo.');
      res.redirect('/admin');
    }
  },

  /** GET /admin/content/create */
  create: async (req, res) => {
    const topics = await Topic.findAll({ order: [['name', 'ASC']] });
    const courses = await Course.findAll({ where: { status: 'published' }, order: [['title', 'ASC']] });
    res.render('pages/lessons/create', {
      title: 'Nova Licao - SkillUp', layout: 'layouts/admin',
      topics, courses, lesson: null, activePage: 'content',
    });
  },

  /** POST /admin/content/create */
  store: async (req, res) => {
    try {
      const { title, description, duration, level, status, courseId, order } = req.body;
      const lessonData = {
        title, description, duration: parseInt(duration) || 5,
        level: level || 'beginner', status: status || 'draft',
        courseId: courseId || null,
        authorId: req.session.userId, order: parseInt(order) || 0,
      };

      if (req.files) {
        if (req.files.video) {
          lessonData.videoUrl = `/uploads/videos/${req.files.video[0].filename}`;
          // Calcular a duração automaticamente se houver upload
          if (getVideoDurationInSeconds && ffprobe) {
            try {
              const videoPath = path.join(__dirname, '..', '..', 'public', 'uploads', 'videos', req.files.video[0].filename);
              const durationInSeconds = await getVideoDurationInSeconds(videoPath, ffprobe.path);
              lessonData.duration = Math.max(1, Math.ceil(durationInSeconds / 60)); // Salvar em minutos
            } catch (err) {
              console.error('Erro ao extrair duração do vídeo:', err);
            }
          }
        }
        if (req.files.thumbnail) {
          lessonData.thumbnail = `/uploads/thumbnails/${req.files.thumbnail[0].filename}`;
        }
      }

      await Lesson.create(lessonData);
      req.flash('success', 'Licao criada com sucesso!');
      return res.redirect('/admin/conteudo');
    } catch (error) {
      console.error('Erro ao criar licao:', error);
      req.flash('error', 'Erro ao criar licao.');
      return res.redirect('/admin/conteudo/create');
    }
  },

  /** GET /admin/content/:id/edit */
  edit: async (req, res) => {
    try {
      const lesson = await Lesson.findByPk(req.params.id, {
        include: [{ model: Course, as: 'course' }],
      });
      if (!lesson) { req.flash('error', 'Licao nao encontrada.'); return res.redirect('/admin/conteudo'); }
      const topics = await Topic.findAll({ order: [['name', 'ASC']] });
      const courses = await Course.findAll({ where: { status: 'published' }, order: [['title', 'ASC']] });
      res.render('pages/lessons/create', {
        title: 'Editar Licao - SkillUp', layout: 'layouts/admin',
        topics, courses, lesson, activePage: 'content',
      });
    } catch (error) {
      console.error('Erro ao editar licao:', error);
      req.flash('error', 'Erro ao carregar licao.');
      res.redirect('/admin/conteudo');
    }
  },

  /** POST /admin/content/:id/edit */
  update: async (req, res) => {
    try {
      const lesson = await Lesson.findByPk(req.params.id);
      if (!lesson) { req.flash('error', 'Licao nao encontrada.'); return res.redirect('/admin/conteudo'); }
      const { title, description, duration, level, status, courseId, order } = req.body;
      lesson.title = title; lesson.description = description;
      lesson.level = level || 'beginner';
      lesson.status = status || 'draft';
      lesson.courseId = courseId || null;
      lesson.order = parseInt(order) || 0;
      
      // Apenas atualizar a duração via input manual se for informada E não for feito um novo upload de vídeo
      if (duration) {
        lesson.duration = parseInt(duration);
      } else if (!lesson.duration) {
        lesson.duration = 5;
      }

      if (req.files) {
        if (req.files.video) {
          lesson.videoUrl = `/uploads/videos/${req.files.video[0].filename}`;
          // Atualizar duração automaticamente no novo upload
          if (getVideoDurationInSeconds && ffprobe) {
            try {
              const videoPath = path.join(__dirname, '..', '..', 'public', 'uploads', 'videos', req.files.video[0].filename);
              const durationInSeconds = await getVideoDurationInSeconds(videoPath, ffprobe.path);
              lesson.duration = Math.max(1, Math.ceil(durationInSeconds / 60)); // Salvar em minutos
            } catch (err) {
              console.error('Erro ao extrair duração do vídeo:', err);
            }
          }
        }
        if (req.files.thumbnail) {
          lesson.thumbnail = `/uploads/thumbnails/${req.files.thumbnail[0].filename}`;
        }
      }

      await lesson.save();
      req.flash('success', 'Licao atualizada!');
      return res.redirect('/admin/conteudo');
    } catch (error) {
      console.error('Erro ao atualizar licao:', error);
      req.flash('error', 'Erro ao atualizar licao.');
      return res.redirect(`/admin/conteudo/${req.params.id}/edit`);
    }
  },

  /** POST /admin/content/:id/delete */
  destroy: async (req, res) => {
    try {
      const lesson = await Lesson.findByPk(req.params.id);
      if (!lesson) { req.flash('error', 'Licao nao encontrada.'); return res.redirect('/admin/conteudo'); }
      await lesson.destroy();
      req.flash('success', 'Licao excluida!');
      return res.redirect('/admin/conteudo');
    } catch (error) {
      console.error('Erro ao excluir licao:', error);
      req.flash('error', 'Erro ao excluir licao.');
      return res.redirect('/admin/conteudo');
    }
  },
};

export default contentController;;
