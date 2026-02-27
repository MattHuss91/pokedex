const router = require('express').Router();
const { analyseTeam } = require('../controllers/teamController');

router.post('/analyse', analyseTeam);

module.exports = router;
