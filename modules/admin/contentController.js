import { contentService, ContentServiceError } from './contentService.js';

const contentController = {
  /** GET /admin/content */
  index: async (req, res) => {
    try {
      const data = await contentService.getContentIndex(req.query.search, req.query.topic, req.query.page);

      res.render('pages/admin/content', {
        title: 'Gerenciador de Conteúdo - SkillUp Admin', layout: 'layouts/admin',
        lessons: data.lessons, topics: data.topics, totalLessons: data.totalLessons, draftCount: data.draftCount,
        currentPage: data.currentPage, totalPages: data.totalPages,
        search: data.search, currentTopic: data.currentTopic, activePage: 'content',
      });
    } catch (error) {
      console.error('Erro no content manager:', error);
      req.flash('error', 'Erro ao carregar conteudo.');
      res.redirect('/admin');
    }
  },

  /** GET /admin/content/create */
  create: async (req, res) => {
    try {
      const data = await contentService.getContentCreateData();
      res.render('pages/lessons/create', {
        title: 'Nova Licao - SkillUp', layout: 'layouts/admin',
        topics: data.topics, courses: data.courses, lesson: null, activePage: 'content',
      });
    } catch (error) {
      console.error('Erro ao carregar formulario de criação:', error);
      req.flash('error', 'Erro ao carregar formulário.');
      res.redirect('/admin/conteudo');
    }
  },

  /** POST /admin/content/create */
  store: async (req, res) => {
    try {
      await contentService.createContent(req.body, req.files, req.session.userId);
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
      const data = await contentService.getContentEditData(req.params.id);
      res.render('pages/lessons/create', {
        title: 'Editar Licao - SkillUp', layout: 'layouts/admin',
        topics: data.topics, courses: data.courses, lesson: data.lesson, activePage: 'content',
      });
    } catch (error) {
      if (error instanceof ContentServiceError) {
        req.flash('error', error.message);
      } else {
        console.error('Erro ao editar licao:', error);
        req.flash('error', 'Erro ao carregar licao.');
      }
      res.redirect('/admin/conteudo');
    }
  },

  /** POST /admin/content/:id/edit */
  update: async (req, res) => {
    try {
      await contentService.updateContent(req.params.id, req.body, req.files);
      req.flash('success', 'Licao atualizada!');
      return res.redirect('/admin/conteudo');
    } catch (error) {
      if (error instanceof ContentServiceError) {
        req.flash('error', error.message);
      } else {
        console.error('Erro ao atualizar licao:', error);
        req.flash('error', 'Erro ao atualizar licao.');
      }
      return res.redirect(`/admin/conteudo/${req.params.id}/edit`);
    }
  },

  /** POST /admin/content/:id/delete */
  destroy: async (req, res) => {
    try {
      await contentService.deleteContent(req.params.id);
      req.flash('success', 'Licao excluida!');
      return res.redirect('/admin/conteudo');
    } catch (error) {
      if (error instanceof ContentServiceError) {
        req.flash('error', error.message);
      } else {
        console.error('Erro ao excluir licao:', error);
        req.flash('error', 'Erro ao excluir licao.');
      }
      return res.redirect('/admin/conteudo');
    }
  },
};

export default contentController;
