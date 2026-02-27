const axios = require('axios');
const NodeCache = require('node-cache');

const BASE = 'https://pokeapi.co/api/v2';
// Cache for 24 hours — PokéAPI data doesn't change
const cache = new NodeCache({ stdTTL: 86400, checkperiod: 3600 });

async function get(path) {
  const cached = cache.get(path);
  if (cached) return cached;

  const { data } = await axios.get(`${BASE}${path}`, { timeout: 10000 });
  cache.set(path, data);
  return data;
}

// Fetch Pokémon by name or ID
async function getPokemon(nameOrId) {
  return get(`/pokemon/${nameOrId}`);
}

// Fetch Pokémon species (egg groups, flavour text, evolution chain)
async function getPokemonSpecies(nameOrId) {
  return get(`/pokemon-species/${nameOrId}`);
}

// Fetch a single move
async function getMove(nameOrId) {
  return get(`/move/${nameOrId}`);
}

// Fetch a list of Pokémon (paginated)
async function getPokemonList(limit = 151, offset = 0) {
  return get(`/pokemon?limit=${limit}&offset=${offset}`);
}

// Fetch egg group data
async function getEggGroup(name) {
  return get(`/egg-group/${name}`);
}

// Fetch type data (all Pokémon of a type, type relations)
async function getType(name) {
  return get(`/type/${name}`);
}

module.exports = { getPokemon, getPokemonSpecies, getMove, getPokemonList, getEggGroup, getType };
