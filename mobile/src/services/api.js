import axios from 'axios';

// Change this to your server's IP/hostname when running on device
// For Android emulator, 10.0.2.2 maps to your PC's localhost
const BASE_URL = __DEV__
  ? 'http://10.0.2.2:3000/api'
  : 'https://your-production-server.com/api';

const client = axios.create({
  baseURL: BASE_URL,
  timeout: 15000,
  headers: { 'Content-Type': 'application/json' },
});

// ── Pokémon ──────────────────────────────────────────────────────────────────

export async function fetchPokemonList(limit = 151, offset = 0) {
  const { data } = await client.get('/pokemon', { params: { limit, offset } });
  return data;
}

export async function fetchPokemon(nameOrId) {
  const { data } = await client.get(`/pokemon/${nameOrId}`);
  return data;
}

export async function fetchPokemonWeaknesses(nameOrId) {
  const { data } = await client.get(`/pokemon/${nameOrId}/weaknesses`);
  return data;
}

// ── Moves ────────────────────────────────────────────────────────────────────

export async function fetchMove(nameOrId) {
  const { data } = await client.get(`/moves/${nameOrId}`);
  return data;
}

export async function fetchMoveTutors() {
  const { data } = await client.get('/moves/tutors');
  return data;
}

export async function fetchTmsHms() {
  const { data } = await client.get('/moves/tms');
  return data;
}

export async function fetchMoveCategories() {
  const { data } = await client.get('/moves/categories');
  return data;
}

// ── Team ─────────────────────────────────────────────────────────────────────

export async function analyseTeam(team) {
  const { data } = await client.post('/team/analyse', { team });
  return data;
}

// ── Egg Groups ───────────────────────────────────────────────────────────────

export async function fetchEggGroups() {
  const { data } = await client.get('/egg-groups');
  return data;
}

export async function fetchEggGroup(name) {
  const { data } = await client.get(`/egg-groups/${name}`);
  return data;
}
