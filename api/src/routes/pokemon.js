const router = require('express').Router();
const { listPokemon, getPokemonDetail, getPokemonWeaknesses } = require('../controllers/pokemonController');

router.get('/',              listPokemon);
router.get('/:nameOrId',     getPokemonDetail);
router.get('/:nameOrId/weaknesses', getPokemonWeaknesses);

module.exports = router;
