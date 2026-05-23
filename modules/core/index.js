const express = require('express');
const router = express.Router();
const homeController = require('./homeController');

router.get('/', homeController.landing);
router.get('/browse', homeController.browse);

module.exports = router;

