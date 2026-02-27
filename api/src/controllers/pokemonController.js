const { getPokemon, getPokemonSpecies, getPokemonList } = require('../utils/pokeApiClient');
const { transformPokemon } = require('../utils/transformers');
const { calcDefensiveChart, categoriseWeaknesses } = require('../utils/typeUtils');

// GET /api/pokemon?limit=151&offset=0
async function listPokemon(req, res) {
  try {
    const limit  = Math.min(parseInt(req.query.limit)  || 151, 251);
    const offset = parseInt(req.query.offset) || 0;

    const list = await getPokemonList(limit, offset);
    res.json({
      count: list.count,
      results: list.results.map(p => ({
        name: p.name,
        url: p.url,
        id: extractIdFromUrl(p.url),
      })),
    });
  } catch (err) {
    handleError(res, err);
  }
}

// GET /api/pokemon/:nameOrId
async function getPokemonDetail(req, res) {
  try {
    const { nameOrId } = req.params;
    const [raw, species] = await Promise.allSettled([
      getPokemon(nameOrId),
      getPokemonSpecies(nameOrId),
    ]);

    if (raw.status === 'rejected') {
      return res.status(404).json({ error: `Pokémon "${nameOrId}" not found` });
    }

    const speciesData = species.status === 'fulfilled' ? species.value : null;
    const pokemon = transformPokemon(raw.value, speciesData);

    // Add type effectiveness
    const defChart = calcDefensiveChart(pokemon.types);
    pokemon.typeChart = defChart;
    pokemon.weaknesses = categoriseWeaknesses(defChart);

    res.json(pokemon);
  } catch (err) {
    handleError(res, err);
  }
}

// GET /api/pokemon/:nameOrId/weaknesses
async function getPokemonWeaknesses(req, res) {
  try {
    const { nameOrId } = req.params;
    const raw = await getPokemon(nameOrId);
    const types = raw.types.map(t => t.type.name);

    const chart = calcDefensiveChart(types);
    const summary = categoriseWeaknesses(chart);

    res.json({ name: raw.name, types, chart, summary });
  } catch (err) {
    handleError(res, err);
  }
}

function extractIdFromUrl(url) {
  const parts = url.split('/').filter(Boolean);
  return parseInt(parts[parts.length - 1]);
}

function handleError(res, err) {
  if (err.response?.status === 404) {
    return res.status(404).json({ error: 'Not found' });
  }
  console.error(err.message);
  res.status(500).json({ error: 'Internal server error' });
}

module.exports = { listPokemon, getPokemonDetail, getPokemonWeaknesses };
