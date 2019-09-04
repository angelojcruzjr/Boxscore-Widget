// Requirements
const express = require('express');
const router = express.Router();
const game_controller = require('../controllers/games.controller');

// Router gets work in the functions provided by our controller
router.get('/games/:league', game_controller.getSpecificGameStats);
router.get('/games/', game_controller.getAllGameStats)

module.exports = router;