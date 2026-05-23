const { User, Course, UserCourse } = require('../../models');
const { Op } = require('sequelize');

const userController = {
  /** GET /admin/users */
  index: async (req, res) => {
    try {
      const { search, page = 1 } = req.query;
      const limit = 15;
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
      res.render('pages/admin/users', {
        title: 'Usuários - SkillUp Admin', layout: 'layouts/admin',
        users, currentPage: parseInt(page), totalPages: Math.ceil(count / limit),
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
      const allCourses = await Course.findAll({ where: { status: 'published' }, order: [['title', 'ASC']] });
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
      const { name, email, password, role, bio } = req.body;
      
      const existingUser = await User.findOne({ where: { email } });
      if (existingUser) {
        req.flash('error', 'Este email ja esta cadastrado.');
        return res.redirect('/admin/usuarios/novo');
      }

      const newUser = await User.create({ name, email, password, role, bio });

      // Atualizar cursos atribuidos
      const courseIds = req.body.courses ? (Array.isArray(req.body.courses) ? req.body.courses : [req.body.courses]) : [];
      if (courseIds.length > 0) {
        const records = courseIds.map(courseId => ({ userId: newUser.id, courseId: parseInt(courseId) }));
        await UserCourse.bulkCreate(records);
      }

      req.flash('success', 'Usuario criado com sucesso!');
      return res.redirect('/admin/usuarios');
    } catch (error) {
      console.error('Erro ao criar usuario:', error);
      req.flash('error', 'Erro ao criar usuario.');
      return res.redirect('/admin/usuarios/novo');
    }
  },

  /** GET /admin/users/:id/edit */
  edit: async (req, res) => {
    try {
      const editUser = await User.findByPk(req.params.id, {
        attributes: { exclude: ['password'] },
        include: [{ model: Course, as: 'enrolledCourses' }],
      });
      if (!editUser) { req.flash('error', 'Usuario nao encontrado.'); return res.redirect('/admin/usuarios'); }
      const allCourses = await Course.findAll({ where: { status: 'published' }, order: [['title', 'ASC']] });
      const enrolledIds = editUser.enrolledCourses.map(c => c.id);
      res.render('pages/admin/user-edit', {
        title: 'Editar Usuario - SkillUp', layout: 'layouts/admin',
        editUser, allCourses, enrolledIds, activePage: 'users',
      });
    } catch (error) {
      console.error('Erro ao editar usuario:', error);
      req.flash('error', 'Erro ao carregar usuario.');
      res.redirect('/admin/usuarios');
    }
  },

  /** POST /admin/users/:id */
  update: async (req, res) => {
    try {
      const editUser = await User.findByPk(req.params.id);
      if (!editUser) { req.flash('error', 'Usuario nao encontrado.'); return res.redirect('/admin/usuarios'); }
      const { name, email, role, bio } = req.body;
      editUser.name = name; editUser.email = email;
      editUser.role = role; editUser.bio = bio;
      await editUser.save();

      // Atualizar cursos atribuidos
      const courseIds = req.body.courses ? (Array.isArray(req.body.courses) ? req.body.courses : [req.body.courses]) : [];
      await UserCourse.destroy({ where: { userId: editUser.id } });
      if (courseIds.length > 0) {
        const records = courseIds.map(courseId => ({ userId: editUser.id, courseId: parseInt(courseId) }));
        await UserCourse.bulkCreate(records);
      }

      req.flash('success', 'Usuario atualizado!');
      return res.redirect('/admin/usuarios');
    } catch (error) {
      console.error('Erro ao atualizar usuario:', error);
      req.flash('error', 'Erro ao atualizar usuario.');
      return res.redirect(`/admin/usuarios/${req.params.id}/edit`);
    }
  },

  /** POST /admin/users/:id/delete */
  destroy: async (req, res) => {
    try {
      const editUser = await User.findByPk(req.params.id);
      if (!editUser) { req.flash('error', 'Usuario nao encontrado.'); return res.redirect('/admin/usuarios'); }
      if (editUser.id === req.session.userId) {
        req.flash('error', 'Voce nao pode excluir sua propria conta.');
        return res.redirect('/admin/usuarios');
      }
      await editUser.destroy();
      req.flash('success', 'Usuario excluido!');
      return res.redirect('/admin/usuarios');
    } catch (error) {
      console.error('Erro ao excluir usuario:', error);
      req.flash('error', 'Erro ao excluir usuario.');
      return res.redirect('/admin/usuarios');
    }
  },
};

module.exports = userController;

