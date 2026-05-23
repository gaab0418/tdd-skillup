const { Course, Topic, Lesson } = require('../models');
const { Op } = require('sequelize');

const courseController = {
  /** GET /admin/courses */
  index: async (req, res) => {
    try {
      const courses = await Course.findAll({
        order: [['title', 'ASC']],
      });
      res.render('pages/admin/courses', {
        title: 'Cursos - SkillUp Admin', layout: 'layouts/admin',
        courses, activePage: 'courses',
      });
    } catch (error) {
      console.error('Erro ao listar cursos:', error);
      req.flash('error', 'Erro ao carregar cursos.');
      res.redirect('/admin');
    }
  },

  /** GET /admin/courses/create */
  create: (req, res) => {
    res.render('pages/admin/course-form', {
      title: 'Novo Curso - SkillUp', layout: 'layouts/admin',
      course: null, activePage: 'courses',
    });
  },

  /** POST /admin/courses */
  store: async (req, res) => {
    try {
      const { title, description, level, status } = req.body;
      const thumbnail = req.files && req.files.thumbnail ? `/uploads/thumbnails/${req.files.thumbnail[0].filename}` : null;
      
      await Course.create({ title, description, level: level || 'beginner', status: status || 'draft', thumbnail });
      req.flash('success', 'Curso criado com sucesso!');
      return res.redirect('/admin/courses');
    } catch (error) {
      console.error('Erro ao criar curso:', error);
      req.flash('error', 'Erro ao criar curso.');
      return res.redirect('/admin/courses/create');
    }
  },

  /** GET /admin/courses/:id/edit */
  edit: async (req, res) => {
    try {
      const course = await Course.findByPk(req.params.id);
      if (!course) { req.flash('error', 'Curso nao encontrado.'); return res.redirect('/admin/courses'); }
      res.render('pages/admin/course-form', {
        title: 'Editar Curso - SkillUp', layout: 'layouts/admin',
        course, activePage: 'courses',
      });
    } catch (error) {
      console.error('Erro ao editar curso:', error);
      req.flash('error', 'Erro ao carregar curso.');
      res.redirect('/admin/courses');
    }
  },

  /** POST /admin/courses/:id */
  update: async (req, res) => {
    try {
      const course = await Course.findByPk(req.params.id);
      if (!course) { req.flash('error', 'Curso nao encontrado.'); return res.redirect('/admin/courses'); }
      
      const { title, description, level, status } = req.body;
      course.title = title; course.description = description; 
      course.level = level; course.status = status;
      
      if (req.files && req.files.thumbnail) {
        course.thumbnail = `/uploads/thumbnails/${req.files.thumbnail[0].filename}`;
      }
      
      await course.save();
      req.flash('success', 'Curso atualizado!');
      return res.redirect('/admin/courses');
    } catch (error) {
      console.error('Erro ao atualizar curso:', error);
      req.flash('error', 'Erro ao atualizar curso.');
      return res.redirect(`/admin/courses/${req.params.id}/edit`);
    }
  },

  /** POST /admin/courses/:id/delete */
  destroy: async (req, res) => {
    try {
      const course = await Course.findByPk(req.params.id);
      if (!course) { req.flash('error', 'Curso nao encontrado.'); return res.redirect('/admin/courses'); }
      
      await course.destroy();
      req.flash('success', 'Curso excluido!');
      return res.redirect('/admin/courses');
    } catch (error) {
      console.error('Erro ao excluir curso:', error);
      req.flash('error', 'Erro ao excluir curso.');
      return res.redirect('/admin/courses');
    }
  },
};

module.exports = courseController;
