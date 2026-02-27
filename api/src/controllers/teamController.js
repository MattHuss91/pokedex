const { getPokemon } = require('../utils/pokeApiClient');
const { calcDefensiveChart, categoriseWeaknesses } = require('../utils/typeUtils');

/**
 * POST /api/team/analyse
 * Body: { "team": ["charizard", "blastoise", "venusaur", "pikachu", "snorlax", "gengar"] }
 *
 * Returns per-Pokémon weaknesses + combined team coverage gaps.
 */
async function analyseTeam(req, res) {
  try {
    const { team } = req.body;

    if (!Array.isArray(team) || team.length === 0) {
      return res.status(400).json({ error: 'Provide a "team" array of 1–6 Pokémon names or IDs' });
    }
    if (team.length > 6) {
      return res.status(400).json({ error: 'A team can have at most 6 Pokémon' });
    }

    // Fetch all Pokémon concurrently
    const results = await Promise.allSettled(team.map(p => getPokemon(p)));

    const members = [];
    const errors  = [];

    for (let i = 0; i < results.length; i++) {
      if (results[i].status === 'rejected') {
        errors.push({ slot: i + 1, name: team[i], error: 'Not found' });
        continue;
      }
      const raw = results[i].value;
      const types = raw.types.map(t => t.type.name);
      const chart = calcDefensiveChart(types);
      const summary = categoriseWeaknesses(chart);

      members.push({
        slot: i + 1,
        name: raw.name,
        types,
        sprite: raw.sprites.front_default,
        chart,
        summary,
      });
    }

    // Aggregate: count how many team members are weak to each attacking type
    const teamVulnerabilities = {};
    const attackingTypes = [
      'Normal','Fire','Water','Grass','Electric','Ice','Fighting','Poison',
      'Ground','Flying','Psychic','Bug','Rock','Ghost','Dragon','Dark','Steel'
    ];

    for (const type of attackingTypes) {
      let weakCount = 0;
      let immuneCount = 0;
      let resistCount = 0;

      for (const m of members) {
        const mult = m.chart[type];
        if (mult === 0) immuneCount++;
        else if (mult >= 2) weakCount++;
        else if (mult <= 0.5) resistCount++;
      }

      teamVulnerabilities[type] = { weakCount, immuneCount, resistCount };
    }

    // Identify coverage gaps: types where >=3 members are weak and none are immune
    const coverageGaps = attackingTypes.filter(t => {
      const v = teamVulnerabilities[t];
      return v.weakCount >= 3 && v.immuneCount === 0;
    });

    res.json({
      members,
      errors,
      teamVulnerabilities,
      coverageGaps,
    });
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ error: 'Internal server error' });
  }
}

module.exports = { analyseTeam };
