import 'dotenv/config.js';
import { sequelize,
  User,
  Topic,
  Course,
  Lesson,
  UserCourse,
 } from '../models/index.js';

const seed = async () => {
  try {
    console.log('[SEED] Iniciando seed...');
    await sequelize.authenticate();
    await sequelize.sync({ force: true });
    console.log('[OK] Banco limpo e sincronizado.');

    // ======= USERS =======
    const admin = await User.create({
      name: 'Admin SkillUp',
      email: 'admin@admin.com',
      password: 'admin123',
      role: 'admin',
      bio: 'Administrador da Plataforma',
    });

    const userDefault = await User.create({
      name: 'User SkillUp',
      email: 'user@user.com',
      password: 'user123',
      role: 'user',
      bio: 'Aluno regular',
    });

    console.log('[OK] Users created (admin@admin.com / admin123, user@user.com / user123)');

    // ======= TOPIC =======
    const techTopic = await Topic.create({
      name: 'Tecnologia',
      slug: 'tecnologia',
      color: '#0050cb',
      icon: 'code',
    });

    console.log('[OK] 1 Topic created.');

    // ======= COURSE =======
    const reactCourse = await Course.create({
      title: 'Fundamentos do React',
      description: 'Aprenda os conceitos principais do React.js do zero.',
      level: 'beginner',
      status: 'published',
      topicId: techTopic.id,
    });

    console.log('[OK] 1 Course created.');

    // ======= LESSON =======
    await Lesson.create({
      title: 'Introdução ao React',
      description: 'Aprenda o básico do React.js, incluindo componentes, JSX e o DOM virtual.',
      videoUrl: '/uploads/videos/sample.mp4',
      duration: 8,
      level: 'beginner',
      status: 'published',

      courseId: reactCourse.id,
      authorId: admin.id,
      order: 1,
    });

    console.log('[OK] 1 Lesson created.');

    // ======= ASSIGN COURSE TO USER =======
    await UserCourse.create({
      userId: userDefault.id,
      courseId: reactCourse.id,
    });

    console.log('[OK] Course assigned to user.');

    console.log('');
    console.log('[DONE] Seed completed successfully!');
    console.log('  Admin: admin@admin.com / admin123');
    console.log('  User:  user@user.com / user123');
    console.log('');

    process.exit(0);
  } catch (error) {
    console.error('[ERROR] Seed failed:', error);
    process.exit(1);
  }
};

seed();
