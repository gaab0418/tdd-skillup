const express = require('express');
const router = express.Router();

/**
 * GET /api/health
 * Endpoint de verificação de saúde da aplicação
 */
router.get('/', (req, res) => {
  res.status(200).json({
    status: 'ok',
    timestamp: new Date().toISOString(),
  });
});

module.exports = router;
