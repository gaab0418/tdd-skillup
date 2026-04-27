const { Lesson, Topic, Course, User } = require('../models');
const { Op } = require('sequelize');

const contentController = {
  /** GET /admin/content */
  index: async (req, res) => {
    try {
      const { search, topic, page = 1 } = req.query;
      const limit = 10;
      const offset = (page - 1) * limit;
      const where = {};
      if (search) where.title = { [Op.like]: `%${search}%` };
      if (topic) where.topicId = topic;

      const { rows: lessons, count } = await Lesson.findAndCountAll({
        where,
        include: [
          { model: Topic, as: 'topic' },
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
      const { title, description, duration, level, status, topicId, courseId, order } = req.body;
      const lessonData = {
        title, description, duration: parseInt(duration) || 5,
        level: level || 'beginner', status: status || 'draft',
        topicId, courseId: courseId || null,
        authorId: req.session.userId, order: parseInt(order) || 0,
      };
      if (req.files) {
        if (req.files.video) lessonData.videoUrl = `/uploads/videos/${req.files.video[0].filename}`;
        if (req.files.thumbnail) lessonData.thumbnail = `/uploads/thumbnails/${req.files.thumbnail[0].filename}`;
      }
      await Lesson.create(lessonData);
      req.flash('success', 'Licao criada com sucesso!');
      return res.redirect('/admin/content');
    } catch (error) {
      console.error('Erro ao criar licao:', error);
      req.flash('error', 'Erro ao criar licao.');
      return res.redirect('/admin/content/create');
    }
  },

  /** GET /admin/content/:id/edit */
  edit: async (req, res) => {
    try {
      const lesson = await Lesson.findByPk(req.params.id, {
        include: [{ model: Topic, as: 'topic' }, { model: Course, as: 'course' }],
      });
      if (!lesson) { req.flash('error', 'Licao nao encontrada.'); return res.redirect('/admin/content'); }
      const topics = await Topic.findAll({ order: [['name', 'ASC']] });
      const courses = await Course.findAll({ where: { status: 'published' }, order: [['title', 'ASC']] });
      res.render('pages/lessons/create', {
        title: 'Editar Licao - SkillUp', layout: 'layouts/admin',
        topics, courses, lesson, activePage: 'content',
      });
    } catch (error) {
      console.error('Erro ao editar licao:', error);
      req.flash('error', 'Erro ao carregar licao.');
      res.redirect('/admin/content');
    }
  },

  /** POST /admin/content/:id/edit */
  update: async (req, res) => {
    try {
      const lesson = await Lesson.findByPk(req.params.id);
      if (!lesson) { req.flash('error', 'Licao nao encontrada.'); return res.redirect('/admin/content'); }
      const { title, description, duration, level, status, topicId, courseId, order } = req.body;
      lesson.title = title; lesson.description = description;
      lesson.duration = parseInt(duration) || 5; lesson.level = level || 'beginner';
      lesson.status = status || 'draft'; lesson.topicId = topicId;
      lesson.courseId = courseId || null;
      lesson.order = parseInt(order) || 0;
      if (req.files) {
        if (req.files.video) lesson.videoUrl = `/uploads/videos/${req.files.video[0].filename}`;
        if (req.files.thumbnail) lesson.thumbnail = `/uploads/thumbnails/${req.files.thumbnail[0].filename}`;
      }
      await lesson.save();
      req.flash('success', 'Licao atualizada!');
      return res.redirect('/admin/content');
    } catch (error) {
      console.error('Erro ao atualizar licao:', error);
      req.flash('error', 'Erro ao atualizar licao.');
      return res.redirect(`/admin/content/${req.params.id}/edit`);
    }
  },

  /** POST /admin/content/:id/delete */
  destroy: async (req, res) => {
    try {
      const lesson = await Lesson.findByPk(req.params.id);
      if (!lesson) { req.flash('error', 'Licao nao encontrada.'); return res.redirect('/admin/content'); }
      await lesson.destroy();
      req.flash('success', 'Licao excluida!');
      return res.redirect('/admin/content');
    } catch (error) {
      console.error('Erro ao excluir licao:', error);
      req.flash('error', 'Erro ao excluir licao.');
      return res.redirect('/admin/content');
    }
  },
};

module.exports = contentController;
