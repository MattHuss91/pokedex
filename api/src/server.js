const express = require('express');
const cors = require('cors');
const rateLimit = require('express-rate-limit');
const errorHandler = require('./middleware/errorHandler');

const pokemonRoutes  = require('./routes/pokemon');
const moveRoutes     = require('./routes/moves');
const teamRoutes     = require('./routes/team');
const eggGroupRoutes = require('./routes/eggGroups');

const app  = express();
const PORT = process.env.PORT || 3000;

// ── Middleware ────────────────────────────────────────────────────────────────
app.use(cors());
app.use(express.json());

// Rate limit: 100 requests per 15 minutes per IP
app.use(rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: 'Too many requests — please slow down' },
}));

// ── Routes ────────────────────────────────────────────────────────────────────
app.use('/api/pokemon',    pokemonRoutes);
app.use('/api/moves',      moveRoutes);
app.use('/api/team',       teamRoutes);
app.use('/api/egg-groups', eggGroupRoutes);

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', game: 'Fire Red / Leaf Green', version: '1.0.0' });
});

// API documentation index
app.get('/api', (req, res) => {
  res.json({
    name: 'Pokédex FRLG API',
    version: '1.0.0',
    endpoints: {
      pokemon: {
        list:      'GET  /api/pokemon?limit=151&offset=0',
        detail:    'GET  /api/pokemon/:nameOrId',
        weaknesses:'GET  /api/pokemon/:nameOrId/weaknesses',
      },
      moves: {
        detail:    'GET  /api/moves/:nameOrId',
        tutors:    'GET  /api/moves/tutors',
        tms:       'GET  /api/moves/tms',
        categories:'GET  /api/moves/categories',
      },
      team: {
        analyse: 'POST /api/team/analyse  — body: { "team": ["charizard","blastoise",...] }',
      },
      eggGroups: {
        list:   'GET  /api/egg-groups',
        detail: 'GET  /api/egg-groups/:name',
      },
    },
    notes: [
      'Physical/Special split uses Gen 3 TYPE-based rules, not Gen 4+ move-based rules',
      'Move lists filtered to Fire Red / Leaf Green version group',
      'Pokémon data sourced from PokéAPI with FRLG-specific supplements',
    ],
  });
});

app.use(errorHandler);

app.listen(PORT, () => {
  console.log(`🔴 Pokédex FRLG API running on http://localhost:${PORT}/api`);
});
