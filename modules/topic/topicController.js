import { topicService, TopicServiceError } from './topicService.js';

const topicController = {
  /** GET /admin/topics */
  index: async (req, res) => {
    try {
      const topics = await topicService.getAllTopics();
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
      await topicService.createTopic(req.body);
      req.flash('success', 'Topico criado com sucesso!');
      return res.redirect('/admin/topicos');
    } catch (error) {
      console.error('Erro ao criar topico:', error);
      req.flash('error', 'Erro ao criar topico.');
      return res.redirect('/admin/topicos/create');
    }
  },

  /** GET /admin/topics/:id/edit */
  edit: async (req, res) => {
    try {
      const topic = await topicService.getTopicById(req.params.id);
      res.render('pages/admin/topic-form', {
        title: 'Editar Topico - SkillUp', layout: 'layouts/admin',
        topic, activePage: 'topics',
      });
    } catch (error) {
      if (error instanceof TopicServiceError) {
        req.flash('error', error.message);
      } else {
        console.error('Erro ao editar topico:', error);
        req.flash('error', 'Erro ao carregar topico.');
      }
      res.redirect('/admin/topicos');
    }
  },

  /** POST /admin/topics/:id */
  update: async (req, res) => {
    try {
      await topicService.updateTopic(req.params.id, req.body);
      req.flash('success', 'Topico atualizado!');
      return res.redirect('/admin/topicos');
    } catch (error) {
      if (error instanceof TopicServiceError) {
        req.flash('error', error.message);
      } else {
        console.error('Erro ao atualizar topico:', error);
        req.flash('error', 'Erro ao atualizar topico.');
      }
      return res.redirect(`/admin/topicos/${req.params.id}/edit`);
    }
  },

  /** POST /admin/topics/:id/delete */
  destroy: async (req, res) => {
    try {
      await topicService.deleteTopic(req.params.id);
      req.flash('success', 'Topico excluido!');
      return res.redirect('/admin/topicos');
    } catch (error) {
      if (error instanceof TopicServiceError) {
        req.flash('error', error.message);
      } else {
        console.error('Erro ao excluir topico:', error);
        req.flash('error', 'Erro ao excluir topico.');
      }
      return res.redirect('/admin/topicos');
    }
  },
};

export default topicController;
