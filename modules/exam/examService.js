import { Course, Exam, ExamQuestion, ExamAttempt, Progress, Certificate, Lesson } from '../../models/index.js';

class ExamServiceError extends Error {
  constructor(message) {
    super(message);
    this.name = 'ExamServiceError';
  }
}

const examService = {
  async getExamForRender(courseId, userId) {
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
      throw new ExamServiceError('Prova não encontrada para este curso.');
    }

    // Verifica se o usuário concluiu 100% das aulas
    const lessons = await Lesson.findAll({ where: { courseId, status: 'published' } });
    if (lessons.length > 0) {
      const lessonIds = lessons.map(l => l.id);
      const progressCount = await Progress.count({
        where: { userId, lessonId: lessonIds, completed: true }
      });
      
      if (progressCount < lessons.length) {
        throw new ExamServiceError('Você precisa concluir todas as aulas antes de fazer a prova.');
      }
    } else {
      throw new ExamServiceError('O curso não possui aulas. Conclua as aulas para fazer a prova.');
    }

    // Verifica se o usuário já passou na prova
    const passedAttempt = await ExamAttempt.findOne({
      where: { userId, examId: course.exam.id, passed: true }
    });

    if (passedAttempt) {
      const error = new ExamServiceError('Você já foi aprovado nesta prova!');
      error.isPassed = true;
      throw error;
    }

    return { course, exam: course.exam };
  },

  async submitExamAnswers(courseId, userId, answers) {
    const course = await Course.findByPk(courseId, {
      include: [{
        model: Exam,
        as: 'exam',
        include: [{ model: ExamQuestion, as: 'questions' }]
      }]
    });

    if (!course || !course.exam) {
      throw new ExamServiceError('Prova não encontrada para este curso.');
    }

    // Verifica se o usuário concluiu 100% das aulas
    const lessons = await Lesson.findAll({ where: { courseId, status: 'published' } });
    if (lessons.length > 0) {
      const lessonIds = lessons.map(l => l.id);
      const progressCount = await Progress.count({
        where: { userId, lessonId: lessonIds, completed: true }
      });
      
      if (progressCount < lessons.length) {
        throw new ExamServiceError('Você precisa concluir todas as aulas antes de fazer a prova.');
      }
    } else {
      throw new ExamServiceError('O curso não possui aulas. Conclua as aulas para fazer a prova.');
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
      await Certificate.create({
        userId,
        courseId: course.id,
      });
    }

    return { course, exam, score, correctAnswers, totalQuestions, passed, passingScore: exam.passingScore };
  }
};

export { examService, ExamServiceError };
