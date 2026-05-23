import { Course, Exam, ExamQuestion, ExamAttempt, Progress, Certificate  } from '../../models/index.js';

const examController = {
  renderExam: async (req, res) => {
    try {
      const courseId = req.params.id;
      const course = await Course.findByPk(courseId, {
        include: [
          {
            model: Exam,
            as: 'exam',
            include: [{ model: ExamQuestion, as: 'questions' }]
          }
        ]
      });

      if (!course || !course.exam) {
        req.flash('error', 'Prova não encontrada para este curso.');
        return res.redirect(`/browse/${courseId}`);
      }

      // Verifica se o usuário já passou na prova
      const passedAttempt = await ExamAttempt.findOne({
        where: { userId: req.session.userId, examId: course.exam.id, passed: true }
      });

      if (passedAttempt) {
        req.flash('info', 'Você já foi aprovado nesta prova!');
        return res.redirect('/profile'); // ou outra página
      }

      res.render('pages/course/exam', {
        title: `Prova: ${course.exam.title} - SkillUp`,
        layout: 'layouts/main',
        course,
        exam: course.exam
      });
    } catch (error) {
      console.error(error);
      req.flash('error', 'Erro ao carregar prova.');
      res.redirect('/browse');
    }
  },

  submitExam: async (req, res) => {
    try {
      const courseId = req.params.id;
      const userId = req.session.userId;
      const answers = req.body; // { 'question_1': 'A', 'question_2': 'B' }

      const course = await Course.findByPk(courseId, {
        include: [{
          model: Exam,
          as: 'exam',
          include: [{ model: ExamQuestion, as: 'questions' }]
        }]
      });

      if (!course || !course.exam) {
        return res.redirect('/browse');
      }

      const exam = course.exam;
      let correctAnswers = 0;
      const totalQuestions = exam.questions.length;

      exam.questions.forEach(q => {
        if (answers[`question_${q.id}`] === q.correctOption) {
          correctAnswers++;
        }
      });

      const score = totalQuestions > 0 ? Math.round((correctAnswers / totalQuestions) * 100) : 0;
      const passed = score >= exam.passingScore;

      await ExamAttempt.create({
        userId,
        examId: exam.id,
        score,
        totalCorrect: correctAnswers,
        totalQuestions,
        passed
      });

      if (passed) {
        // Gerar o certificado no banco
        await Certificate.create({
          userId,
          courseId: course.id,
          // se quiser atrelar topicId também, pode pegar course.topicId se disponível
        });
      }

      res.render('pages/course/exam-result', {
        title: 'Resultado da Prova',
        layout: 'layouts/main',
        course,
        exam,
        score,
        correctAnswers,
        totalQuestions,
        passed,
        passingScore: exam.passingScore
      });

    } catch (error) {
      console.error(error);
      req.flash('error', 'Erro ao processar a prova.');
      res.redirect(`/browse/${req.params.id}`);
    }
  }
};

export default examController;;
