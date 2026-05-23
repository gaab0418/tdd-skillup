const { Course, Exam, ExamQuestion } = require('../../models');

exports.manageExam = async (req, res) => {
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

    if (!course) {
      req.flash('error', 'Curso não encontrado.');
      return res.redirect('/admin/cursos');
    }

    res.render('pages/admin/exam-form', {
      title: `Gerenciar Prova - ${course.title}`,
      layout: 'layouts/admin',
      course,
      exam: course.exam,
      activePage: 'courses'
    });
  } catch (error) {
    console.error(error);
    req.flash('error', 'Erro ao carregar a prova.');
    res.redirect('/admin/cursos');
  }
};

exports.saveExam = async (req, res) => {
  try {
    const courseId = req.params.id;
    const { title, description, passingScore } = req.body;

    const course = await Course.findByPk(courseId);
    if (!course) {
      req.flash('error', 'Curso não encontrado.');
      return res.redirect('/admin/cursos');
    }

    let exam = await Exam.findOne({ where: { courseId } });
    if (exam) {
      await exam.update({ title, description, passingScore });
      req.flash('success', 'Prova atualizada com sucesso.');
    } else {
      exam = await Exam.create({ courseId, title, description, passingScore });
      req.flash('success', 'Prova criada com sucesso. Agora adicione as questões.');
    }

    res.redirect(`/admin/cursos/${courseId}/prova`);
  } catch (error) {
    console.error(error);
    req.flash('error', 'Erro ao salvar a prova.');
    res.redirect(`/admin/cursos/${req.params.id}/prova`);
  }
};

exports.addQuestion = async (req, res) => {
  try {
    const courseId = req.params.id;
    const { question, optionA, optionB, optionC, optionD, correctOption } = req.body;

    const exam = await Exam.findOne({ where: { courseId } });
    if (!exam) {
      req.flash('error', 'Crie a prova primeiro.');
      return res.redirect(`/admin/cursos/${courseId}/prova`);
    }

    await ExamQuestion.create({
      examId: exam.id,
      question,
      optionA,
      optionB,
      optionC,
      optionD,
      correctOption
    });

    // Update totalQuestions count
    const totalQuestions = await ExamQuestion.count({ where: { examId: exam.id } });
    await exam.update({ totalQuestions });

    req.flash('success', 'Questão adicionada.');
    res.redirect(`/admin/cursos/${courseId}/prova`);
  } catch (error) {
    console.error(error);
    req.flash('error', 'Erro ao adicionar a questão.');
    res.redirect(`/admin/cursos/${req.params.id}/prova`);
  }
};

exports.deleteQuestion = async (req, res) => {
  try {
    const courseId = req.params.id;
    const questionId = req.params.questionId;

    const question = await ExamQuestion.findByPk(questionId);
    if (question) {
      const examId = question.examId;
      await question.destroy();
      
      const exam = await Exam.findByPk(examId);
      const totalQuestions = await ExamQuestion.count({ where: { examId } });
      await exam.update({ totalQuestions });

      req.flash('success', 'Questão removida.');
    } else {
      req.flash('error', 'Questão não encontrada.');
    }

    res.redirect(`/admin/cursos/${courseId}/prova`);
  } catch (error) {
    console.error(error);
    req.flash('error', 'Erro ao excluir a questão.');
    res.redirect(`/admin/cursos/${req.params.id}/prova`);
  }
};
