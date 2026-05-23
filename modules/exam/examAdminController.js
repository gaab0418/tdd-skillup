import { examAdminService, ExamAdminServiceError } from './examAdminService.js';

const examAdminController = {
  manageExam: async (req, res) => {
    try {
      const data = await examAdminService.getExamByCourseId(req.params.id);

      res.render('pages/admin/exam-form', {
        title: `Gerenciar Prova - ${data.course.title}`,
        layout: 'layouts/admin',
        course: data.course,
        exam: data.exam,
        activePage: 'courses'
      });
    } catch (error) {
      if (error instanceof ExamAdminServiceError) {
        req.flash('error', error.message);
      } else {
        console.error(error);
        req.flash('error', 'Erro ao carregar a prova.');
      }
      res.redirect('/admin/cursos');
    }
  },

  saveExam: async (req, res) => {
    try {
      const { isNew } = await examAdminService.saveExam(req.params.id, req.body);
      
      if (isNew) {
        req.flash('success', 'Prova criada com sucesso. Agora adicione as questões.');
      } else {
        req.flash('success', 'Prova atualizada com sucesso.');
      }

      res.redirect(`/admin/cursos/${req.params.id}/prova`);
    } catch (error) {
      if (error instanceof ExamAdminServiceError) {
        req.flash('error', error.message);
        res.redirect('/admin/cursos');
      } else {
        console.error(error);
        req.flash('error', 'Erro ao salvar a prova.');
        res.redirect(`/admin/cursos/${req.params.id}/prova`);
      }
    }
  },

  addQuestion: async (req, res) => {
    try {
      await examAdminService.addQuestion(req.params.id, req.body);

      req.flash('success', 'Questão adicionada.');
      res.redirect(`/admin/cursos/${req.params.id}/prova`);
    } catch (error) {
      if (error instanceof ExamAdminServiceError) {
        req.flash('error', error.message);
      } else {
        console.error(error);
        req.flash('error', 'Erro ao adicionar a questão.');
      }
      res.redirect(`/admin/cursos/${req.params.id}/prova`);
    }
  },

  deleteQuestion: async (req, res) => {
    try {
      await examAdminService.deleteQuestion(req.params.questionId);
      req.flash('success', 'Questão removida.');
      res.redirect(`/admin/cursos/${req.params.id}/prova`);
    } catch (error) {
      if (error instanceof ExamAdminServiceError) {
        req.flash('error', error.message);
      } else {
        console.error(error);
        req.flash('error', 'Erro ao excluir a questão.');
      }
      res.redirect(`/admin/cursos/${req.params.id}/prova`);
    }
  }
};

export default examAdminController;
