import { Course, Exam, ExamQuestion } from '../../models/index.js';

class ExamAdminServiceError extends Error {
  constructor(message) {
    super(message);
    this.name = 'ExamAdminServiceError';
  }
}

const examAdminService = {
  async getExamByCourseId(courseId) {
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
      throw new ExamAdminServiceError('Curso não encontrado.');
    }

    return { course, exam: course.exam };
  },

  async saveExam(courseId, data) {
    const { title, description, passingScore } = data;

    const course = await Course.findByPk(courseId);
    if (!course) {
      throw new ExamAdminServiceError('Curso não encontrado.');
    }

    let exam = await Exam.findOne({ where: { courseId } });
    let isNew = false;
    if (exam) {
      await exam.update({ title, description, passingScore });
    } else {
      exam = await Exam.create({ courseId, title, description, passingScore });
      isNew = true;
    }

    return { exam, isNew };
  },

  async addQuestion(courseId, data) {
    const { question, optionA, optionB, optionC, optionD, correctOption } = data;

    const exam = await Exam.findOne({ where: { courseId } });
    if (!exam) {
      throw new ExamAdminServiceError('Crie a prova primeiro.');
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

    const totalQuestions = await ExamQuestion.count({ where: { examId: exam.id } });
    await exam.update({ totalQuestions });

    return true;
  },

  async deleteQuestion(questionId) {
    const question = await ExamQuestion.findByPk(questionId);
    if (question) {
      const examId = question.examId;
      await question.destroy();
      
      const exam = await Exam.findByPk(examId);
      const totalQuestions = await ExamQuestion.count({ where: { examId } });
      await exam.update({ totalQuestions });
      return true;
    } else {
      throw new ExamAdminServiceError('Questão não encontrada.');
    }
  }
};

export { examAdminService, ExamAdminServiceError };
