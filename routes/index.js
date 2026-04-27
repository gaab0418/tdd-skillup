const express = require('express');
const router = express.Router();
const homeController = require('../controllers/homeController');

router.get('/', homeController.landing);
router.get('/browse', homeController.browse);

module.exports = router;
