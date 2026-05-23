const { Topic, Course, Lesson } = require('../../models');
const { Op } = require('sequelize');

const topicController = {
  /** GET /admin/topics */
  index: async (req, res) => {
    try {
      const topics = await Topic.findAll({
        include: [
          { model: Course, as: 'courses', attributes: ['id'] },
          { model: Lesson, as: 'lessons', attributes: ['id'] },
        ],
        order: [['name', 'ASC']],
      });
      res.render('pages/admin/topics', {
        title: 'Tópicos - SkillUp Admin', layout: 'layouts/admin',
        topics, activePage: 'topics',
      });
    } catch (error) {
      console.error('Erro ao listar topicos:', error);
      req.flash('error', 'Erro ao carregar topicos.');
      res.redirect('/admin');
    }
  },

  /** GET /admin/topics/create */
  create: (req, res) => {
    res.render('pages/admin/topic-form', {
      title: 'Novo Topico - SkillUp', layout: 'layouts/admin',
      topic: null, activePage: 'topics',
    });
  },

  /** POST /admin/topics */
  store: async (req, res) => {
    try {
      const { name, slug, color, icon } = req.body;
      await Topic.create({ name, slug: slug || name.toLowerCase().replace(/\s+/g, '-'), color: color || '#0050cb', icon: icon || 'school' });
      req.flash('success', 'Topico criado com sucesso!');
      return res.redirect('/admin/topics');
    } catch (error) {
      console.error('Erro ao criar topico:', error);
      req.flash('error', 'Erro ao criar topico.');
      return res.redirect('/admin/topics/create');
    }
  },

  /** GET /admin/topics/:id/edit */
  edit: async (req, res) => {
    try {
      const topic = await Topic.findByPk(req.params.id);
      if (!topic) { req.flash('error', 'Topico nao encontrado.'); return res.redirect('/admin/topics'); }
      res.render('pages/admin/topic-form', {
        title: 'Editar Topico - SkillUp', layout: 'layouts/admin',
        topic, activePage: 'topics',
      });
    } catch (error) {
      console.error('Erro ao editar topico:', error);
      req.flash('error', 'Erro ao carregar topico.');
      res.redirect('/admin/topics');
    }
  },

  /** POST /admin/topics/:id */
  update: async (req, res) => {
    try {
      const topic = await Topic.findByPk(req.params.id);
      if (!topic) { req.flash('error', 'Topico nao encontrado.'); return res.redirect('/admin/topics'); }
      const { name, slug, color, icon } = req.body;
      topic.name = name; topic.slug = slug; topic.color = color; topic.icon = icon;
      await topic.save();
      req.flash('success', 'Topico atualizado!');
      return res.redirect('/admin/topics');
    } catch (error) {
      console.error('Erro ao atualizar topico:', error);
      req.flash('error', 'Erro ao atualizar topico.');
      return res.redirect(`/admin/topics/${req.params.id}/edit`);
    }
  },

  /** POST /admin/topics/:id/delete */
  destroy: async (req, res) => {
    try {
      const topic = await Topic.findByPk(req.params.id, {
        include: [{ model: Lesson, as: 'lessons', attributes: ['id'] }],
      });
      if (!topic) { req.flash('error', 'Topico nao encontrado.'); return res.redirect('/admin/topics'); }
      if (topic.lessons && topic.lessons.length > 0) {
        req.flash('error', 'Nao e possivel excluir topico com licoes vinculadas.');
        return res.redirect('/admin/topics');
      }
      await topic.destroy();
      req.flash('success', 'Topico excluido!');
      return res.redirect('/admin/topics');
    } catch (error) {
      console.error('Erro ao excluir topico:', error);
      req.flash('error', 'Erro ao excluir topico.');
      return res.redirect('/admin/topics');
    }
  },
};

module.exports = topicController;

