const physicalSpecial = require('../data/gen3-physical-special.json');
const typeChart = require('../data/type-chart.json');

/**
 * Determine Gen 3 category for a move based on its type.
 * In FRLG, category is determined by move TYPE, not move itself.
 */
function getGen3Category(moveType, isStatusMove) {
  if (isStatusMove) return 'Status';
  const normalized = moveType.charAt(0).toUpperCase() + moveType.slice(1).toLowerCase();
  if (physicalSpecial.physical_types.includes(normalized)) return 'Physical';
  if (physicalSpecial.special_types.includes(normalized)) return 'Special';
  return 'Unknown';
}

/**
 * Calculate defensive type effectiveness for a Pokémon given its types.
 * Returns multiplier for each attacking type.
 */
function calcDefensiveChart(defenderTypes) {
  const result = {};
  const attackingTypes = typeChart.types;

  for (const atkType of attackingTypes) {
    let multiplier = 1;
    const atkChart = typeChart.effectiveness[atkType] || {};

    for (const defType of defenderTypes) {
      const normalized = defType.charAt(0).toUpperCase() + defType.slice(1).toLowerCase();
      if (atkChart[normalized] !== undefined) {
        multiplier *= atkChart[normalized];
      }
    }
    result[atkType] = multiplier;
  }

  return result;
}

/**
 * Summarise weakness chart into categories for display.
 */
function categoriseWeaknesses(chart) {
  const immune    = [];
  const quadWeak  = [];
  const weak      = [];
  const resistant = [];
  const quadRes   = [];

  for (const [type, mult] of Object.entries(chart)) {
    if (mult === 0)    immune.push(type);
    else if (mult === 4) quadWeak.push(type);
    else if (mult === 2) weak.push(type);
    else if (mult === 0.5) resistant.push(type);
    else if (mult === 0.25) quadRes.push(type);
  }

  return { immune, quadWeak, weak, resistant, quadRes };
}

module.exports = { getGen3Category, calcDefensiveChart, categoriseWeaknesses };
