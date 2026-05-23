import { courseService, CourseServiceError } from './courseService.js';

const courseController = {
  /** GET /admin/courses */
  index: async (req, res) => {
    try {
      const courses = await courseService.getAllCourses();
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
      await courseService.createCourse(req.body, req.files);
      req.flash('success', 'Curso criado com sucesso!');
      return res.redirect('/admin/cursos');
    } catch (error) {
      console.error('Erro ao criar curso:', error);
      req.flash('error', 'Erro ao criar curso.');
      return res.redirect('/admin/cursos/create');
    }
  },

  /** GET /admin/courses/:id/edit */
  edit: async (req, res) => {
    try {
      const course = await courseService.getCourseById(req.params.id);
      res.render('pages/admin/course-form', {
        title: 'Editar Curso - SkillUp', layout: 'layouts/admin',
        course, activePage: 'courses',
      });
    } catch (error) {
      if (error instanceof CourseServiceError) {
        req.flash('error', error.message);
      } else {
        console.error('Erro ao editar curso:', error);
        req.flash('error', 'Erro ao carregar curso.');
      }
      res.redirect('/admin/cursos');
    }
  },

  /** POST /admin/courses/:id */
  update: async (req, res) => {
    try {
      await courseService.updateCourse(req.params.id, req.body, req.files);
      req.flash('success', 'Curso atualizado!');
      return res.redirect('/admin/cursos');
    } catch (error) {
      if (error instanceof CourseServiceError) {
        req.flash('error', error.message);
      } else {
        console.error('Erro ao atualizar curso:', error);
        req.flash('error', 'Erro ao atualizar curso.');
      }
      return res.redirect(`/admin/cursos/${req.params.id}/edit`);
    }
  },

  /** POST /admin/courses/:id/delete */
  destroy: async (req, res) => {
    try {
      await courseService.deleteCourse(req.params.id);
      req.flash('success', 'Curso excluido!');
      return res.redirect('/admin/cursos');
    } catch (error) {
      if (error instanceof CourseServiceError) {
        req.flash('error', error.message);
      } else {
        console.error('Erro ao excluir curso:', error);
        req.flash('error', 'Erro ao excluir curso.');
      }
      return res.redirect('/admin/cursos');
    }
  },
};

export default courseController;
