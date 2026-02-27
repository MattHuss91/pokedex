const { getGen3Category } = require('./typeUtils');

/**
 * Transform raw PokéAPI Pokémon data into a clean FRLG-focused shape.
 */
function transformPokemon(raw, species) {
  const types = raw.types
    .sort((a, b) => a.slot - b.slot)
    .map(t => capitalise(t.type.name));

  const stats = {};
  for (const s of raw.stats) {
    stats[s.stat.name] = s.base_stat;
  }

  const moves = raw.moves
    .filter(m => {
      // Only show moves learnable in FRLG (version group: firered-leafgreen)
      return m.version_group_details.some(
        vg => vg.version_group.name === 'firered-leafgreen'
      );
    })
    .map(m => {
      const detail = m.version_group_details.find(
        vg => vg.version_group.name === 'firered-leafgreen'
      );
      return {
        name: m.move.name,
        learnMethod: detail.move_learn_method.name,
        levelLearnedAt: detail.level_learned_at,
      };
    })
    .sort((a, b) => {
      // Sort: level-up first (by level), then TM, then other
      if (a.learnMethod === 'level-up' && b.learnMethod !== 'level-up') return -1;
      if (b.learnMethod === 'level-up' && a.learnMethod !== 'level-up') return 1;
      if (a.learnMethod === 'level-up') return a.levelLearnedAt - b.levelLearnedAt;
      return a.name.localeCompare(b.name);
    });

  const eggGroups = species
    ? species.egg_groups.map(g => capitalise(g.name))
    : [];

  const flavorText = species
    ? (species.flavor_text_entries.find(
        e => e.language.name === 'en' &&
          (e.version.name === 'firered' || e.version.name === 'leafgreen')
      ) || species.flavor_text_entries.find(e => e.language.name === 'en'))?.flavor_text.replace(/\f/g, ' ')
    : null;

  const genus = species
    ? species.genera.find(g => g.language.name === 'en')?.genus
    : null;

  return {
    id: raw.id,
    name: raw.name,
    displayName: capitalise(raw.name),
    types,
    stats,
    height: raw.height,
    weight: raw.weight,
    sprite: raw.sprites.front_default,
    spriteShiny: raw.sprites.front_shiny,
    moves,
    eggGroups,
    flavorText,
    genus,
    baseExperience: raw.base_experience,
    abilities: raw.abilities.map(a => ({
      name: a.ability.name,
      isHidden: a.is_hidden,
    })),
  };
}

/**
 * Transform a PokéAPI move into FRLG-annotated shape with Gen 3 category.
 */
function transformMove(raw) {
  const type = capitalise(raw.type.name);
  const damageClass = raw.damage_class.name; // 'physical', 'special', 'status' in PokeAPI (Gen 4+ split)
  const isStatus = damageClass === 'status';
  const gen3Category = getGen3Category(type, isStatus);

  const flavorText = raw.flavor_text_entries
    ? raw.flavor_text_entries.find(
        e => e.language.name === 'en' &&
          (e.version_group.name === 'firered-leafgreen' || e.version_group.name === 'ruby-sapphire')
      )?.flavor_text || raw.flavor_text_entries.find(e => e.language.name === 'en')?.flavor_text
    : null;

  return {
    id: raw.id,
    name: raw.name,
    displayName: raw.name.split('-').map(capitalise).join(' '),
    type,
    gen3Category,   // <-- the FRLG category (type-based)
    gen4Category: capitalise(damageClass), // for reference — what it became in Gen 4+
    power: raw.power,
    accuracy: raw.accuracy,
    pp: raw.pp,
    priority: raw.priority,
    target: raw.target?.name,
    effect: raw.effect_entries?.find(e => e.language.name === 'en')?.short_effect,
    flavorText,
  };
}

function capitalise(str) {
  if (!str) return str;
  return str.charAt(0).toUpperCase() + str.slice(1);
}

module.exports = { transformPokemon, transformMove, capitalise };
