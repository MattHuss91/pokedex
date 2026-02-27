/**
 * api.js — direct PokéAPI calls with AsyncStorage caching.
 * No backend server required. Data is cached on-device for 7 days.
 */
import AsyncStorage from '@react-native-async-storage/async-storage';

import TYPE_CHART      from '../data/type-chart.json';
import GEN3_CATEGORIES from '../data/gen3-physical-special.json';
import MOVE_TUTORS     from '../data/frlg-move-tutors.json';
import TMS_HMS         from '../data/frlg-tms-hms.json';

const POKEAPI   = 'https://pokeapi.co/api/v2';
const CACHE_TTL = 7 * 24 * 60 * 60 * 1000; // 7 days

// ── Cache helpers ─────────────────────────────────────────────────────────────

async function getCached(key) {
  try {
    const raw = await AsyncStorage.getItem('@poke_' + key);
    if (!raw) return null;
    const { data, ts } = JSON.parse(raw);
    if (Date.now() - ts > CACHE_TTL) return null;
    return data;
  } catch {
    return null;
  }
}

async function setCached(key, data) {
  try {
    await AsyncStorage.setItem('@poke_' + key, JSON.stringify({ data, ts: Date.now() }));
  } catch { /* storage full — ignore */ }
}

// ── HTTP helper ───────────────────────────────────────────────────────────────

async function pokeGet(path) {
  const res = await fetch(POKEAPI + path);
  if (!res.ok) throw new Error('HTTP ' + res.status + ' — ' + path);
  return res.json();
}

// ── Type / category utilities ─────────────────────────────────────────────────

function capitalise(str) {
  if (!str) return str;
  return str.charAt(0).toUpperCase() + str.slice(1);
}

function getGen3Category(moveType, isStatus) {
  if (isStatus) return 'Status';
  const t = capitalise(moveType);
  if (GEN3_CATEGORIES.physical_types.includes(t)) return 'Physical';
  if (GEN3_CATEGORIES.special_types.includes(t))  return 'Special';
  return 'Unknown';
}

function calcDefensiveChart(defenderTypes) {
  const result = {};
  for (const atkType of TYPE_CHART.types) {
    let multiplier = 1;
    const atkChart = TYPE_CHART.effectiveness[atkType] || {};
    for (const defType of defenderTypes) {
      if (atkChart[defType] !== undefined) {
        multiplier *= atkChart[defType];
      }
    }
    result[atkType] = multiplier;
  }
  return result;
}

// ── Data transformers ─────────────────────────────────────────────────────────

function transformPokemon(raw, species) {
  const types = raw.types
    .sort((a, b) => a.slot - b.slot)
    .map(t => capitalise(t.type.name));

  const stats = {};
  for (const s of raw.stats) {
    stats[s.stat.name] = s.base_stat;
  }

  const moves = raw.moves
    .filter(m =>
      m.version_group_details.some(vg => vg.version_group.name === 'firered-leafgreen')
    )
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
      if (a.learnMethod === 'level-up' && b.learnMethod !== 'level-up') return -1;
      if (b.learnMethod === 'level-up' && a.learnMethod !== 'level-up') return  1;
      if (a.learnMethod === 'level-up') return a.levelLearnedAt - b.levelLearnedAt;
      return a.name.localeCompare(b.name);
    });

  const eggGroups = species
    ? species.egg_groups.map(g => capitalise(g.name))
    : [];

  const flavorText = species
    ? (
        species.flavor_text_entries.find(
          e => e.language.name === 'en' &&
            (e.version.name === 'firered' || e.version.name === 'leafgreen')
        ) ||
        species.flavor_text_entries.find(e => e.language.name === 'en')
      )?.flavor_text?.replace(/\f/g, ' ')
    : null;

  const genus = species
    ? species.genera.find(g => g.language.name === 'en')?.genus
    : null;

  return {
    id:           raw.id,
    name:         raw.name,
    displayName:  capitalise(raw.name),
    types,
    stats,
    height:       raw.height,
    weight:       raw.weight,
    sprite:       raw.sprites.front_default,
    spriteShiny:  raw.sprites.front_shiny,
    moves,
    eggGroups,
    flavorText,
    genus,
    abilities: raw.abilities.map(a => ({
      name:     a.ability.name,
      isHidden: a.is_hidden,
    })),
    typeChart: calcDefensiveChart(types),
  };
}

// ── Public API ────────────────────────────────────────────────────────────────

export async function fetchPokemonList(limit = 151, offset = 0) {
  const key = `list_${limit}_${offset}`;
  const cached = await getCached(key);
  if (cached) return cached;

  const data = await pokeGet(`/pokemon?limit=${limit}&offset=${offset}`);
  const result = {
    results: data.results.map((p, i) => ({
      name: p.name,
      id:   offset + i + 1,
    })),
  };

  await setCached(key, result);
  return result;
}

export async function fetchPokemon(nameOrId) {
  const key = `pokemon_${nameOrId}`;
  const cached = await getCached(key);
  if (cached) return cached;

  const [raw, species] = await Promise.all([
    pokeGet(`/pokemon/${nameOrId}`),
    pokeGet(`/pokemon-species/${nameOrId}`).catch(() => null),
  ]);

  const result = transformPokemon(raw, species);
  await setCached(key, result);
  return result;
}

export async function fetchPokemonWeaknesses(nameOrId) {
  const pokemon = await fetchPokemon(nameOrId);
  return pokemon.typeChart;
}

export async function fetchMove(nameOrId) {
  const key = `move_${nameOrId}`;
  const cached = await getCached(key);
  if (cached) return cached;

  const raw = await pokeGet(`/move/${nameOrId}`);
  const type     = capitalise(raw.type.name);
  const isStatus = raw.damage_class.name === 'status';

  const result = {
    type,
    gen3Category: getGen3Category(type, isStatus),
    power:        raw.power,
    accuracy:     raw.accuracy,
    pp:           raw.pp,
  };

  await setCached(key, result);
  return result;
}

export async function fetchMoveTutors() {
  return MOVE_TUTORS;
}

export async function fetchTmsHms() {
  return TMS_HMS;
}

export async function fetchMoveCategories() {
  return GEN3_CATEGORIES;
}

export async function analyseTeam(team) {
  const results = await Promise.allSettled(team.map(name => fetchPokemon(name)));

  const members = [];
  const errors  = [];

  for (let i = 0; i < team.length; i++) {
    if (results[i].status === 'fulfilled') {
      const p = results[i].value;
      members.push({
        name:   p.name,
        sprite: p.sprite,
        types:  p.types,
        chart:  p.typeChart,
      });
    } else {
      errors.push({ name: team[i] });
    }
  }

  // Compute team-wide vulnerability summary
  const teamVulnerabilities = {};
  const coverageGaps = [];

  for (const atkType of TYPE_CHART.types) {
    let weakCount = 0, resistCount = 0, immuneCount = 0;
    for (const member of members) {
      const mult = member.chart[atkType] ?? 1;
      if (mult === 0)      immuneCount++;
      else if (mult > 1)   weakCount++;
      else if (mult < 1)   resistCount++;
    }
    teamVulnerabilities[atkType] = { weakCount, resistCount, immuneCount };
    if (weakCount >= 3 && immuneCount === 0) coverageGaps.push(atkType);
  }

  return { members, errors, teamVulnerabilities, coverageGaps };
}

export async function fetchEggGroups() {
  const key = 'egg_groups_list';
  const cached = await getCached(key);
  if (cached) return cached;

  const data = await pokeGet('/egg-group?limit=20');
  const result = {
    egg_groups: data.results.map(g => ({
      name:        g.name,
      displayName: g.name.split('-').map(capitalise).join(' '),
    })),
  };

  await setCached(key, result);
  return result;
}

export async function fetchEggGroup(name) {
  const key = `egg_group_${name}`;
  const cached = await getCached(key);
  if (cached) return cached;

  const data = await pokeGet(`/egg-group/${name}`);
  const result = {
    name:        data.name,
    displayName: data.name.split('-').map(capitalise).join(' '),
    pokemon: data.pokemon_species
      .map(p => ({
        name: p.name,
        id:   parseInt(p.url.split('/').filter(Boolean).pop(), 10),
      }))
      .filter(p => p.id >= 1 && p.id <= 386)
      .sort((a, b) => a.id - b.id),
  };

  await setCached(key, result);
  return result;
}
