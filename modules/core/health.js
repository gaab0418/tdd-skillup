import express from 'express';
const router = express.Router();

/**
 * GET /health
 * Endpoint de verificação de saúde da aplicação
 */
router.get('/', (req, res) => {
  res.status(200).json({
    status: true,
    message: 'ok',
    timestamp: new Date().toISOString(),
  });
});

export default router;;

