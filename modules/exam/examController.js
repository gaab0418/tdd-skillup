import { examService, ExamServiceError } from './examService.js';

const examController = {
  renderExam: async (req, res) => {
    try {
      const data = await examService.getExamForRender(req.params.id, req.session.userId);

      res.render('pages/course/exam', {
        title: `Prova: ${data.exam.title} - SkillUp`,
        layout: 'layouts/main',
        course: data.course,
        exam: data.exam
      });
    } catch (error) {
      if (error instanceof ExamServiceError) {
        if (error.isPassed) {
          req.flash('info', error.message);
          return res.redirect('/profile');
        } else {
          req.flash('error', error.message);
          return res.redirect(`/browse/${req.params.id}`);
        }
      }
      console.error(error);
      req.flash('error', 'Erro ao carregar prova.');
      res.redirect('/browse');
    }
  },

  submitExam: async (req, res) => {
    try {
      const result = await examService.submitExamAnswers(req.params.id, req.session.userId, req.body);

      res.render('pages/course/exam-result', {
        title: 'Resultado da Prova',
        layout: 'layouts/main',
        course: result.course,
        exam: result.exam,
        score: result.score,
        correctAnswers: result.correctAnswers,
        totalQuestions: result.totalQuestions,
        passed: result.passed,
        passingScore: result.passingScore
      });

    } catch (error) {
      if (error instanceof ExamServiceError) {
        req.flash('error', error.message);
        return res.redirect(`/browse/${req.params.id}`);
      }
      console.error(error);
      req.flash('error', 'Erro ao processar a prova.');
      res.redirect(`/browse/${req.params.id}`);
    }
  }
};

export default examController;
