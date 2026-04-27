const { Lesson, Topic, Progress, User } = require('../models');
const { Op } = require('sequelize');

const homeController = {
  /** GET / - Landing page */
  landing: async (req, res) => {
    try {
      const lessonCount = await Lesson.count({ where: { status: 'published' } });
      const userCount = await User.count();

      res.render('pages/home/landing', {
        title: 'SkillUp - Aprenda novas habilidades em minutos',
        layout: 'layouts/main',
        lessonCount,
        userCount,
      });
    } catch (error) {
      console.error('Erro na landing:', error);
      res.render('pages/home/landing', {
        title: 'SkillUp - Aprenda novas habilidades em minutos',
        layout: 'layouts/main',
        lessonCount: 0,
        userCount: 0,
      });
    }
  },

  /** GET /browse - Browse lessons */
  browse: async (req, res) => {
    try {
      const { topic, search, page = 1 } = req.query;
      const limit = 12;
      const offset = (page - 1) * limit;

      const where = { status: 'published' };
      if (topic) where.topicId = topic;
      if (search) {
        where.title = { [Op.like]: `%${search}%` };
      }

      const { rows: lessons, count } = await Lesson.findAndCountAll({
        where,
        include: [
          { model: Topic, as: 'topic' },
          { model: User, as: 'author', attributes: ['id', 'name', 'avatar'] },
        ],
        order: [['createdAt', 'DESC']],
        limit,
        offset,
      });

      const topics = await Topic.findAll({ order: [['name', 'ASC']] });

      // Se o usuário estiver logado, pegar progresso
      let progressMap = {};
      if (req.session.userId) {
        const progressList = await Progress.findAll({
          where: { userId: req.session.userId },
        });
        progressList.forEach((p) => {
          progressMap[p.lessonId] = p;
        });
      }

      const totalPages = Math.ceil(count / limit);

      res.render('pages/home/browse', {
        title: 'Explorar Lições - SkillUp',
        layout: 'layouts/main',
        lessons,
        topics,
        progressMap,
        currentTopic: topic || null,
        search: search || '',
        currentPage: parseInt(page),
        totalPages,
      });
    } catch (error) {
      console.error('Erro no browse:', error);
      req.flash('error', 'Erro ao carregar lições.');
      res.redirect('/');
    }
  },
};

module.exports = homeController;
