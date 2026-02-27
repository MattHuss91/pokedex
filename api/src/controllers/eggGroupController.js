const { getEggGroup } = require('../utils/pokeApiClient');
const { capitalise } = require('../utils/transformers');

const ALL_EGG_GROUPS = [
  'monster','water1','bug','flying','ground','fairy',
  'plant','humanshape','water3','mineral','indeterminate',
  'water2','ditto','dragon','no-eggs'
];

// GET /api/egg-groups — list all egg groups
async function listEggGroups(req, res) {
  res.json({ egg_groups: ALL_EGG_GROUPS.map(g => ({ name: g, displayName: formatEggGroup(g) })) });
}

// GET /api/egg-groups/:name
async function getEggGroupDetail(req, res) {
  try {
    const { name } = req.params;
    const data = await getEggGroup(name);

    // Filter to only Pokémon available in Gen 1-3 (ID ≤ 386)
    const pokemon = data.pokemon_species
      .map(p => ({
        name: p.name,
        id: extractId(p.url),
      }))
      .filter(p => p.id <= 386)
      .sort((a, b) => a.id - b.id);

    res.json({
      name: data.name,
      displayName: formatEggGroup(data.name),
      pokemon,
    });
  } catch (err) {
    if (err.response?.status === 404) {
      return res.status(404).json({ error: `Egg group "${req.params.name}" not found` });
    }
    console.error(err.message);
    res.status(500).json({ error: 'Internal server error' });
  }
}

function formatEggGroup(name) {
  const map = {
    'monster': 'Monster', 'water1': 'Water 1', 'bug': 'Bug',
    'flying': 'Flying', 'ground': 'Field', 'fairy': 'Fairy',
    'plant': 'Grass', 'humanshape': 'Human-Like', 'water3': 'Water 3',
    'mineral': 'Mineral', 'indeterminate': 'Amorphous', 'water2': 'Water 2',
    'ditto': 'Ditto', 'dragon': 'Dragon', 'no-eggs': 'Undiscovered',
  };
  return map[name] || capitalise(name);
}

function extractId(url) {
  const parts = url.split('/').filter(Boolean);
  return parseInt(parts[parts.length - 1]);
}

module.exports = { listEggGroups, getEggGroupDetail };
