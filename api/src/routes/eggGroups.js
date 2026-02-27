const router = require('express').Router();
const { listEggGroups, getEggGroupDetail } = require('../controllers/eggGroupController');

router.get('/',      listEggGroups);
router.get('/:name', getEggGroupDetail);

module.exports = router;
