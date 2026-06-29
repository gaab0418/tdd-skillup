#!/usr/bin/env node
/**
 * Servidor para testes E2E (sem executar vitest antes de iniciar).
 */
import 'dotenv/config.js';
import app from '../app.js';
import http from 'http';
import db from '../models/index.js';

const { sequelize } = db;
const port = process.env.APP_PORT || 3000;
app.set('port', port);

const server = http.createServer(app);

const startServer = async () => {
  try {
    await sequelize.authenticate();
    await sequelize.sync({ alter: true });
    server.listen(port, () => {
      console.log(`SkillUp E2E rodando em http://localhost:${port}`);
    });
  } catch (error) {
    console.error('Erro ao iniciar servidor E2E:', error);
    process.exit(1);
  }
};

startServer();
