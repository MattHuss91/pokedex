# Pokédex FRLG — Fire Red & Leaf Green

A full-featured Pokédex app for Pokémon Fire Red and Leaf Green, with:
- **Express REST API** backend
- **React Native** Android app styled like the in-game Pokédex

---

## Features

| Feature | Details |
|---|---|
| Full Pokédex | Kanto (#1–151) + National (#1–251) |
| Move lists | Level-up, TM/HM, Tutor, Egg moves — filtered to FRLG |
| Physical/Special | Gen 3 **type-based** split (not Gen 4 move-based) |
| Move Tutors | All FRLG tutors: Cape Brink, One Island, Two Island |
| TMs & HMs | All 50 TMs and 7 HMs with category + stats |
| Egg Groups | All 15 groups, filtered to Gen 1–3 Pokémon |
| Weakness Chart | Per-Pokémon defensive type chart with multipliers |
| Team Planner | 6-slot team builder with weakness analysis & coverage gaps |
| Pokédex Style | Red shell, camera, status lights, dark LCD screen, pixel font |

---

## Gen 3 Physical/Special Split

In FRLG (Gen 3), **every move's category is determined by its TYPE** — not by the individual move.
This changes in Gen 4 (Diamond/Pearl).

| Category | Types |
|---|---|
| **Physical** | Normal, Fighting, Flying, Poison, Ground, Rock, Bug, Ghost, Steel |
| **Special** | Fire, Water, Grass, Electric, Ice, Psychic, Dragon, Dark |

Shadow Ball is **Physical** in FRLG (Ghost type). Thunderbolt is **Special** (Electric type). Etc.

---

## Project Structure

```
pokedex-frlg/
├── api/                         # Node.js / Express backend
│   └── src/
│       ├── server.js            # Entry point
│       ├── routes/              # Express routers
│       ├── controllers/         # Business logic
│       ├── data/                # FRLG-specific JSON data
│       │   ├── frlg-move-tutors.json
│       │   ├── frlg-tms-hms.json
│       │   ├── gen3-physical-special.json
│       │   └── type-chart.json
│       └── utils/
│           ├── pokeApiClient.js # PokéAPI wrapper (24hr cache)
│           ├── transformers.js  # Data shape + Gen 3 category injection
│           └── typeUtils.js     # Weakness calculator
│
└── mobile/                      # React Native Android app
    ├── App.js
    └── src/
        ├── navigation/          # Bottom tab + stack navigators
        ├── screens/
        │   ├── PokedexListScreen.js    # Searchable Pokédex list
        │   ├── PokemonDetailScreen.js  # Stats, moves, weaknesses, egg groups
        │   ├── TeamPlannerScreen.js    # Team builder + coverage analysis
        │   ├── MoveTutorsScreen.js     # Tutors, TMs, HMs
        │   └── EggGroupScreen.js       # Egg group browser
        ├── components/
        │   ├── PokedexShell.js  # Red Pokédex outer frame
        │   ├── TypeBadge.js     # Coloured type pill
        │   ├── CategoryBadge.js # Physical / Special / Status badge
        │   ├── StatBar.js       # Animated stat bar
        │   └── WeaknessGrid.js  # Type effectiveness grid
        ├── services/api.js      # Axios API client
        └── theme/
            ├── colors.js        # FRLG Pokédex colour palette + type colours
            └── typography.js    # PokemonGB pixel font config
```

---

## Setup

### 1. API

```bash
cd api
npm install
npm run dev        # starts on http://localhost:3000
```

Test it:
```
GET  http://localhost:3000/api
GET  http://localhost:3000/api/pokemon/charizard
GET  http://localhost:3000/api/moves/tutors
POST http://localhost:3000/api/team/analyse
     body: { "team": ["charizard", "blastoise", "venusaur"] }
```

### 2. Pixel Font (Recommended)

1. Download **"Pokemon GB.ttf"** (search online — it's a free fan-made font)
2. Copy it to: `mobile/android/app/src/main/assets/fonts/PokemonGB.ttf`
3. Run: `cd mobile && npx react-native-asset`
4. Rebuild Android: `npx react-native run-android`

Without the font the app still works — text falls back to system monospace.

### 3. Android App

```bash
cd mobile
npm install

# Start Metro bundler
npm start

# In another terminal (emulator or device):
npm run android
```

> **Android emulator note:** The API base URL uses `10.0.2.2:3000` by default.
> For a real device, change `BASE_URL` in `src/services/api.js` to your PC's LAN IP (e.g. `192.168.1.x:3000`).

---

## API Reference

| Method | Path | Description |
|---|---|---|
| GET | `/api/pokemon` | List Pokémon (`?limit=151&offset=0`) |
| GET | `/api/pokemon/:id` | Full Pokémon detail with Gen 3 moves |
| GET | `/api/pokemon/:id/weaknesses` | Defensive type chart |
| GET | `/api/moves/:name` | Single move (Gen 3 category annotated) |
| GET | `/api/moves/tutors` | All FRLG move tutors |
| GET | `/api/moves/tms` | All 50 TMs |
| GET | `/api/moves/categories` | Gen 3 physical/special type lists |
| GET | `/api/egg-groups` | All 15 egg groups |
| GET | `/api/egg-groups/:name` | Group detail with Pokémon list |
| POST | `/api/team/analyse` | Team weakness + coverage analysis |

---

## Screens

| Screen | What's on it |
|---|---|
| **Pokédex List** | Searchable list, Gen toggle (Kanto/National), type badges |
| **Pokémon Detail** | Sprite (+ shiny toggle), stats, Gen 3 move list, weakness chart, egg groups |
| **Team Planner** | 6 slots, per-member weakness, coverage gaps table |
| **Moves & Tutors** | All FRLG tutors expandable, TM/HM full table |
| **Egg Groups** | Group selector, Pokémon grid, tap to navigate to Pokédex |
