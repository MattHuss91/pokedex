const router = require('express').Router();
const { getMoveDetail, getMoveTutors, getTmsHms, getCategories } = require('../controllers/moveController');

// Static routes first — must come before /:nameOrId
router.get('/tutors',     getMoveTutors);
router.get('/tms',        getTmsHms);
router.get('/categories', getCategories);
router.get('/:nameOrId',  getMoveDetail);

module.exports = router;
