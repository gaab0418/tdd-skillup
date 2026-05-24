import { userService, UserServiceError } from './userService.js';

const userController = {
  /** GET /admin/users */
  index: async (req, res) => {
    try {
      const { search, page = 1 } = req.query;
      const { users, count, totalPages } = await userService.listUsers(search, parseInt(page));
      res.render('pages/admin/users', {
        title: 'Usuários - SkillUp Admin', layout: 'layouts/admin',
        users, currentPage: parseInt(page), totalPages,
        search: search || '', totalUsers: count, activePage: 'users',
      });
    } catch (error) {
      console.error('Erro ao listar usuarios:', error);
      req.flash('error', 'Erro ao carregar usuarios.');
      res.redirect('/admin');
    }
  },

  /** GET /admin/users/new */
  create: async (req, res) => {
    try {
      const allCourses = await userService.getCoursesForAssignment();
      res.render('pages/admin/user-new', {
        title: 'Novo Usuario - SkillUp', layout: 'layouts/admin',
        allCourses, activePage: 'users',
      });
    } catch (error) {
      console.error('Erro ao abrir form de novo usuario:', error);
      req.flash('error', 'Erro ao carregar formulario.');
      res.redirect('/admin/usuarios');
    }
  },

  /** POST /admin/users */
  store: async (req, res) => {
    try {
      const courseIds = req.body.courses ? (Array.isArray(req.body.courses) ? req.body.courses : [req.body.courses]) : [];
      await userService.createUser(req.body, courseIds);

      req.flash('success', 'Usuario criado com sucesso!');
      return res.redirect('/admin/usuarios');
    } catch (error) {
      if (error instanceof UserServiceError) {
        req.flash('error', error.message);
      } else {
        console.error('Erro ao criar usuario:', error);
        req.flash('error', 'Erro ao criar usuario.');
      }
      return res.redirect('/admin/usuarios/novo');
    }
  },

  /** GET /admin/users/:id/edit */
  edit: async (req, res) => {
    try {
      const editUser = await userService.getUserById(req.params.id);
      const allCourses = await userService.getCoursesForAssignment();
      const enrolledIds = editUser.enrolledCourses.map(c => c.id);
      res.render('pages/admin/user-edit', {
        title: 'Editar Usuario - SkillUp', layout: 'layouts/admin',
        editUser, allCourses, enrolledIds, activePage: 'users',
      });
    } catch (error) {
      if (error instanceof UserServiceError) {
        req.flash('error', error.message);
      } else {
        console.error('Erro ao editar usuario:', error);
        req.flash('error', 'Erro ao carregar usuario.');
      }
      res.redirect('/admin/usuarios');
    }
  },

  /** POST /admin/users/:id */
  update: async (req, res) => {
    try {
      const courseIds = req.body.courses ? (Array.isArray(req.body.courses) ? req.body.courses : [req.body.courses]) : [];
      await userService.updateUser(req.params.id, req.body, courseIds);

      req.flash('success', 'Usuario atualizado!');
      return res.redirect('/admin/usuarios');
    } catch (error) {
      if (error instanceof UserServiceError) {
        req.flash('error', error.message);
      } else {
        console.error('Erro ao atualizar usuario:', error);
        req.flash('error', 'Erro ao atualizar usuario.');
      }
      return res.redirect(`/admin/usuarios/${req.params.id}/edit`);
    }
  },

  /** POST /admin/users/:id/delete */
  destroy: async (req, res) => {
    try {
      await userService.deleteUser(req.params.id, req.session.userId);
      req.flash('success', 'Usuario excluido!');
      return res.redirect('/admin/usuarios');
    } catch (error) {
      if (error instanceof UserServiceError) {
        req.flash('error', error.message);
      } else {
        console.error('Erro ao excluir usuario:', error);
        req.flash('error', 'Erro ao excluir usuario.');
      }
      return res.redirect('/admin/usuarios');
    }
  },

  /** GET /api/cep?cep=... */
  getCep: async (req, res) => {
    try {
      const data = await userService.buscarDadosPorCep(req.query.cep);
      res.json(data);
    } catch (error) {
      res.status(400).json({ erro: true, mensagem: error.message });
    }
  },

  /** GET /api/cep/buscar?uf=...&cidade=...&rua=... */
  searchCep: async (req, res) => {
    try {
      const { uf, cidade, rua } = req.query;
      const data = await userService.buscarCepPorEndereco(uf, cidade, rua);
      res.json(data);
    } catch (error) {
      res.status(400).json({ erro: true, mensagem: error.message });
    }
  },

  /** POST /usuario/cadastro-complementar */
  cadastroComplementar: async (req, res) => {
    try {
      await userService.salvarDadosComplementares(req.session.userId, req.body);
      req.flash('success', 'Dados complementares salvos com sucesso!');
      res.redirect('/profile/settings');
    } catch (error) {
      req.flash('error', error.message || 'Erro ao salvar dados.');
      res.redirect('/profile/settings');
    }
  },
};

export default userController;
