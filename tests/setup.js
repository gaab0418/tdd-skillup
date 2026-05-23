import { afterAll } from 'vitest';
import { sequelize  } from '../models/index.js';

afterAll(async () => {
  await sequelize.close();
});
