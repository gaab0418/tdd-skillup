const express = require('express');
const healthRoutes = require('../routes/health');

/**
 * Cria uma instância mínima do Express só com a rota de health
 * para testar isoladamente, sem depender de banco de dados ou sessão.
 */
function createApp() {
  const app = express();
  app.use('/api/health', healthRoutes);
  return app;
}

/**
 * Helper para fazer requisições sem precisar de lib externa.
 * Sobe o server em porta efêmera, faz o fetch e encerra.
 */
function request(app, path) {
  return new Promise((resolve, reject) => {
    const server = app.listen(0, async () => {
      const port = server.address().port;
      try {
        const response = await fetch(`http://localhost:${port}${path}`);
        const body = await response.json();
        resolve({ status: response.status, body });
      } catch (err) {
        reject(err);
      } finally {
        server.close();
      }
    });
  });
}

describe('GET /api/health', () => {
  it('deve retornar status 200', async () => {
    const app = createApp();
    const res = await request(app, '/api/health');
    expect(res.status).toBe(200);
  });

  it('deve retornar status "ok"', async () => {
    const app = createApp();
    const res = await request(app, '/api/health');
    expect(res.body.status).toBe('ok');
  });

  it('deve retornar um timestamp ISO válido', async () => {
    const app = createApp();
    const res = await request(app, '/api/health');

    expect(res.body).toHaveProperty('timestamp');
    const parsed = new Date(res.body.timestamp);
    expect(parsed.getTime()).not.toBeNaN();
  });

  it('deve retornar Content-Type application/json', async () => {
    const app = createApp();
    const server = app.listen(0);
    const port = server.address().port;

    try {
      const response = await fetch(`http://localhost:${port}/api/health`);
      expect(response.headers.get('content-type')).toMatch(/application\/json/);
    } finally {
      server.close();
    }
  });
});
