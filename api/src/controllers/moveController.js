const { getMove } = require('../utils/pokeApiClient');
const { transformMove } = require('../utils/transformers');
const tutors = require('../data/frlg-move-tutors.json');
const tmsHms = require('../data/frlg-tms-hms.json');
const physSpec = require('../data/gen3-physical-special.json');

// GET /api/moves/:nameOrId
async function getMoveDetail(req, res) {
  try {
    const { nameOrId } = req.params;
    const raw = await getMove(nameOrId);
    res.json(transformMove(raw));
  } catch (err) {
    if (err.response?.status === 404) {
      return res.status(404).json({ error: `Move "${req.params.nameOrId}" not found` });
    }
    console.error(err.message);
    res.status(500).json({ error: 'Internal server error' });
  }
}

// GET /api/moves/tutors — all FRLG move tutors
async function getMoveTutors(req, res) {
  res.json(tutors);
}

// GET /api/moves/tms — all FRLG TMs and HMs
async function getTmsHms(req, res) {
  res.json(tmsHms);
}

// GET /api/moves/categories — Gen 3 physical/special type split
async function getCategories(req, res) {
  res.json(physSpec);
}

module.exports = { getMoveDetail, getMoveTutors, getTmsHms, getCategories };
