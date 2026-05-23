import { afterAll } from 'vitest';
const { sequelize } = require('../models/index.js');

afterAll(async () => {
  await sequelize.close();
});
