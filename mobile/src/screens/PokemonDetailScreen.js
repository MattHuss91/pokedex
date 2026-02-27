import React, { useState, useEffect } from 'react';
import {
  View, Text, ScrollView, Image, TouchableOpacity,
  StyleSheet, ActivityIndicator, FlatList,
} from 'react-native';
import { Colors } from '../theme/colors';
import TypeBadge from '../components/TypeBadge';
import CategoryBadge from '../components/CategoryBadge';
import StatBar from '../components/StatBar';
import WeaknessGrid from '../components/WeaknessGrid';
import PokedexShell from '../components/PokedexShell';
import { fetchPokemon, fetchMove, fetchEvolutionChain, fetchEncounters } from '../services/api';

const TABS = ['INFO', 'MOVES', 'WEAKNESSES', 'EGG GRP', 'LOCATIONS'];

const LEARN_METHOD_LABELS = {
  'level-up': 'LV',
  'machine':  'TM/HM',
  'tutor':    'Tutor',
  'egg':      'Egg',
};

export default function PokemonDetailScreen({ route, navigation }) {
  const { nameOrId, displayName } = route.params;
  const [pokemon,    setPokemon]    = useState(null);
  const [tab,        setTab]        = useState('INFO');
  const [loading,    setLoading]    = useState(true);
  const [error,      setError]      = useState(null);
  const [moveCache,  setMoveCache]  = useState({});
  const [shiny,      setShiny]      = useState(false);
  const [evoChain,   setEvoChain]   = useState(null);
  const [encounters, setEncounters] = useState(null);

  useEffect(() => {
    load();
  }, [nameOrId]);

  async function load() {
    setLoading(true);
    setError(null);
    setEvoChain(null);
    setEncounters(null);
    try {
      const data = await fetchPokemon(nameOrId);
      setPokemon(data);
      // fetch evolution + encounters in background after main data is ready
      fetchEvolutionChain(nameOrId).then(setEvoChain).catch(() => setEvoChain([]));
      fetchEncounters(nameOrId).then(setEncounters).catch(() => setEncounters({ firered: [], leafgreen: [] }));
    } catch (e) {
      setError('Could not load Pokémon data.');
    } finally {
      setLoading(false);
    }
  }

  async function loadMove(moveName) {
    if (moveCache[moveName]) return moveCache[moveName];
    try {
      const m = await fetchMove(moveName);
      setMoveCache(prev => ({ ...prev, [moveName]: m }));
      return m;
    } catch { return null; }
  }

  if (loading) return (
    <PokedexShell title={displayName || '...'}>
      <View style={styles.center}>
        <ActivityIndicator color={Colors.pokedexRed} size="large" />
      </View>
    </PokedexShell>
  );

  if (error || !pokemon) return (
    <PokedexShell title="ERROR">
      <View style={styles.center}>
        <Text style={styles.errorText}>{error || 'Unknown error'}</Text>
      </View>
    </PokedexShell>
  );

  return (
    <PokedexShell title={`#${String(pokemon.id).padStart(3, '0')} ${pokemon.displayName}`}>
      <ScrollView showsVerticalScrollIndicator={false}>

        {/* ── Header ───────────────────────────────────────────────────── */}
        <View style={styles.header}>
          <TouchableOpacity onPress={() => setShiny(s => !s)} style={styles.spriteContainer}>
            <Image
              source={{ uri: shiny ? pokemon.spriteShiny : pokemon.sprite }}
              style={styles.sprite}
            />
            <Text style={styles.shinyHint}>{shiny ? '✨ Shiny' : 'Tap for shiny'}</Text>
          </TouchableOpacity>

          <View style={styles.headerInfo}>
            <Text style={styles.genus}>{pokemon.genus || ''}</Text>
            <View style={styles.types}>
              {pokemon.types.map(t => <TypeBadge key={t} type={t} />)}
            </View>
            {pokemon.flavorText ? (
              <Text style={styles.flavor}>{pokemon.flavorText}</Text>
            ) : null}
          </View>
        </View>

        {/* ── Tabs ─────────────────────────────────────────────────────── */}
        <View style={styles.tabs}>
          {TABS.map(t => (
            <TouchableOpacity
              key={t}
              style={[styles.tabBtn, tab === t && styles.tabBtnActive]}
              onPress={() => setTab(t)}
            >
              <Text style={[styles.tabText, tab === t && styles.tabTextActive]}>{t}</Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* ── Tab Content ──────────────────────────────────────────────── */}
        <View style={styles.tabContent}>
          {tab === 'INFO'       && <InfoTab pokemon={pokemon} evoChain={evoChain} />}
          {tab === 'MOVES'      && <MovesTab pokemon={pokemon} loadMove={loadMove} moveCache={moveCache} />}
          {tab === 'WEAKNESSES' && <WeaknessTab pokemon={pokemon} />}
          {tab === 'EGG GRP'   && <EggGroupTab pokemon={pokemon} navigation={navigation} />}
          {tab === 'LOCATIONS'  && <LocationsTab encounters={encounters} />}
        </View>

      </ScrollView>
    </PokedexShell>
  );
}

// ── INFO TAB ─────────────────────────────────────────────────────────────────

function InfoTab({ pokemon, evoChain }) {
  const { stats, height, weight, abilities } = pokemon;
  return (
    <View>
      <SectionHeader text="BASE STATS" />
      {Object.entries(stats).map(([k, v]) => <StatBar key={k} statName={k} value={v} />)}

      <SectionHeader text="PHYSICAL" />
      <Row label="Height" value={`${(height / 10).toFixed(1)} m`} />
      <Row label="Weight" value={`${(weight / 10).toFixed(1)} kg`} />

      <SectionHeader text="ABILITIES" />
      {abilities.map(a => (
        <Row key={a.name} label={a.isHidden ? 'Hidden' : 'Ability'} value={a.name} />
      ))}

      <SectionHeader text="EVOLUTION" />
      <EvolutionSection chain={evoChain} currentName={pokemon.displayName} />
    </View>
  );
}

// ── EVOLUTION SECTION ─────────────────────────────────────────────────────────

function EvolutionSection({ chain, currentName }) {
  if (chain === null) return (
    <ActivityIndicator size="small" color={Colors.pokedexRed} style={{ marginVertical: 8 }} />
  );
  if (chain.length === 0) return (
    <Text style={styles.emptyText}>Does not evolve</Text>
  );
  return (
    <View>
      {chain.map((step, i) => (
        <EvoStep key={i} step={step} currentName={currentName} />
      ))}
    </View>
  );
}

function EvoStep({ step, currentName }) {
  const fromHL = step.from === currentName;
  const toHL   = step.to   === currentName;
  const spriteBase = 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/';
  return (
    <View style={styles.evoRow}>
      <View style={styles.evoMon}>
        <Image source={{ uri: `${spriteBase}${step.fromId}.png` }} style={styles.evoSprite} />
        <Text style={[styles.evoName, fromHL && styles.evoNameHL]}>{step.from}</Text>
      </View>
      <View style={styles.evoMiddle}>
        <Text style={styles.evoCondition}>{step.condition}</Text>
        <Text style={styles.evoArrow}>▶</Text>
      </View>
      <View style={styles.evoMon}>
        <Image source={{ uri: `${spriteBase}${step.toId}.png` }} style={styles.evoSprite} />
        <Text style={[styles.evoName, toHL && styles.evoNameHL]}>{step.to}</Text>
      </View>
    </View>
  );
}

// ── MOVES TAB ────────────────────────────────────────────────────────────────

function MovesTab({ pokemon, loadMove, moveCache }) {
  const [filter, setFilter] = useState('level-up');
  const methods = ['level-up', 'machine', 'tutor', 'egg'];

  const filtered = pokemon.moves.filter(m => m.learnMethod === filter);

  return (
    <View>
      {/* Learn method filter */}
      <View style={styles.methodTabs}>
        {methods.map(m => (
          <TouchableOpacity
            key={m}
            style={[styles.methodTab, filter === m && styles.methodTabActive]}
            onPress={() => setFilter(m)}
          >
            <Text style={[styles.methodTabText, filter === m && styles.methodTabTextActive]}>
              {LEARN_METHOD_LABELS[m] || m}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* Gen 3 category reminder */}
      <View style={styles.gen3Note}>
        <Text style={styles.gen3NoteText}>
          ★ In FRLG, category is determined by TYPE (Gen 3 rule)
        </Text>
      </View>

      {filtered.length === 0 ? (
        <Text style={styles.emptyText}>No moves via this method in FRLG</Text>
      ) : (
        filtered.map((m, i) => (
          <MoveRow key={`${m.name}-${i}`} move={m} moveCache={moveCache} loadMove={loadMove} />
        ))
      )}
    </View>
  );
}

function MoveRow({ move, moveCache, loadMove }) {
  const [detail, setDetail] = useState(moveCache[move.name] || null);

  useEffect(() => {
    if (!detail) loadMove(move.name).then(d => d && setDetail(d));
  }, [move.name]);

  const label = LEARN_METHOD_LABELS[move.learnMethod] || move.learnMethod;
  const lvl   = move.learnMethod === 'level-up' && move.levelLearnedAt > 0
    ? `Lv.${move.levelLearnedAt}`
    : label;

  return (
    <View style={styles.moveRow}>
      <Text style={styles.moveLvl}>{lvl}</Text>
      <Text style={styles.moveName}>
        {move.name.split('-').map(w => w[0].toUpperCase() + w.slice(1)).join(' ')}
      </Text>
      {detail ? (
        <>
          <TypeBadge type={detail.type} small />
          <CategoryBadge category={detail.gen3Category} />
          <Text style={styles.movePower}>{detail.power ?? '—'}</Text>
          <Text style={styles.moveAcc}>{detail.accuracy ? `${detail.accuracy}%` : '∞'}</Text>
        </>
      ) : (
        <ActivityIndicator size="small" color="#666" />
      )}
    </View>
  );
}

// ── WEAKNESSES TAB ───────────────────────────────────────────────────────────

function WeaknessTab({ pokemon }) {
  return (
    <View>
      <View style={styles.typeRow}>
        {pokemon.types.map(t => <TypeBadge key={t} type={t} />)}
        <Text style={styles.defLabel}>  DEFENSIVE CHART</Text>
      </View>
      <WeaknessGrid chart={pokemon.typeChart} />
    </View>
  );
}

// ── EGG GROUP TAB ────────────────────────────────────────────────────────────

function EggGroupTab({ pokemon, navigation }) {
  return (
    <View>
      <SectionHeader text="EGG GROUPS" />
      {pokemon.eggGroups.length === 0 ? (
        <Text style={styles.emptyText}>No egg group data available</Text>
      ) : (
        pokemon.eggGroups.map(group => (
          <TouchableOpacity
            key={group}
            style={styles.eggGroupBtn}
            onPress={() => navigation.navigate('EggGroup', { name: group.toLowerCase(), displayName: group })}
          >
            <Text style={styles.eggGroupText}>{group}</Text>
            <Text style={styles.eggGroupArrow}>▶ View group</Text>
          </TouchableOpacity>
        ))
      )}

      <SectionHeader text="BREEDING" />
      <Row label="Gender Rate" value={pokemon.genus ? 'See species' : '—'} />
    </View>
  );
}

// ── LOCATIONS TAB ─────────────────────────────────────────────────────────────

function LocationsTab({ encounters }) {
  if (encounters === null) return (
    <ActivityIndicator size="small" color={Colors.pokedexRed} style={{ marginTop: 20 }} />
  );

  const hasFR = encounters.firered.length   > 0;
  const hasLG = encounters.leafgreen.length > 0;

  if (!hasFR && !hasLG) return (
    <View style={styles.noEncounterBox}>
      <Text style={styles.noEncounterText}>Not found in the wild in FRLG</Text>
      <Text style={styles.noEncounterSub}>(Obtain via trade, gift, or evolution)</Text>
    </View>
  );

  return (
    <View>
      <View style={styles.encVersionRow}>
        <View style={[styles.encVersionBadge, { backgroundColor: '#CC0000' }]}>
          <Text style={styles.encVersionLabel}>FIRE RED</Text>
        </View>
        {!hasFR && <Text style={styles.encNotAvail}>Version exclusive — not available</Text>}
      </View>
      {hasFR && encounters.firered.map((e, i) => <EncounterRow key={`fr${i}`} enc={e} />)}

      <View style={[styles.encVersionRow, { marginTop: 16 }]}>
        <View style={[styles.encVersionBadge, { backgroundColor: '#007700' }]}>
          <Text style={styles.encVersionLabel}>LEAF GREEN</Text>
        </View>
        {!hasLG && <Text style={styles.encNotAvail}>Version exclusive — not available</Text>}
      </View>
      {hasLG && encounters.leafgreen.map((e, i) => <EncounterRow key={`lg${i}`} enc={e} />)}
    </View>
  );
}

function EncounterRow({ enc }) {
  const lvl = enc.minLevel === enc.maxLevel
    ? `Lv. ${enc.minLevel}`
    : `Lv. ${enc.minLevel}–${enc.maxLevel}`;
  return (
    <View style={styles.encRow}>
      <View style={styles.encLeft}>
        <Text style={styles.encLocation}>{enc.location}</Text>
        <Text style={styles.encMethod}>{enc.method}</Text>
      </View>
      <Text style={styles.encLevel}>{lvl}</Text>
    </View>
  );
}

// ── Shared sub-components ────────────────────────────────────────────────────

function SectionHeader({ text }) {
  return (
    <View style={styles.sectionHeader}>
      <Text style={styles.sectionHeaderText}>{text}</Text>
    </View>
  );
}

function Row({ label, value }) {
  return (
    <View style={styles.row}>
      <Text style={styles.rowLabel}>{label}</Text>
      <Text style={styles.rowValue}>{value}</Text>
    </View>
  );
}

// ── Styles ───────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  center: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  errorText: { fontFamily: 'PokemonGB', fontSize: 9, color: '#FF4444', textAlign: 'center' },

  header: {
    flexDirection: 'row',
    padding: 12,
    alignItems: 'flex-start',
    borderBottomWidth: 1,
    borderBottomColor: '#222',
  },
  spriteContainer: { alignItems: 'center' },
  sprite: { width: 96, height: 96, resizeMode: 'contain' },
  shinyHint: { fontFamily: 'PokemonGB', fontSize: 6, color: '#666', marginTop: 2 },
  headerInfo: { flex: 1, marginLeft: 12, justifyContent: 'center' },
  genus: { fontFamily: 'PokemonGB', fontSize: 7, color: '#888', marginBottom: 6 },
  types: { flexDirection: 'row', marginBottom: 8 },
  flavor: {
    fontFamily: 'PokemonGB',
    fontSize: 7,
    color: '#AAAAAA',
    lineHeight: 13,
    marginTop: 4,
  },

  tabs: { flexDirection: 'row', backgroundColor: '#111' },
  tabBtn: {
    flex: 1,
    paddingVertical: 8,
    alignItems: 'center',
    borderBottomWidth: 2,
    borderBottomColor: 'transparent',
  },
  tabBtnActive: { borderBottomColor: Colors.pokedexRed },
  tabText: { fontFamily: 'PokemonGB', fontSize: 6, color: '#666' },
  tabTextActive: { color: '#FFFFFF' },
  tabContent: { padding: 12 },

  sectionHeader: {
    borderLeftWidth: 3,
    borderLeftColor: Colors.pokedexRed,
    paddingLeft: 8,
    marginTop: 12,
    marginBottom: 6,
  },
  sectionHeaderText: { fontFamily: 'PokemonGB', fontSize: 8, color: '#CCC' },

  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 4,
    borderBottomWidth: 1,
    borderBottomColor: '#1A1A1A',
  },
  rowLabel: { fontFamily: 'PokemonGB', fontSize: 8, color: '#888' },
  rowValue: { fontFamily: 'PokemonGB', fontSize: 8, color: '#FFF' },

  methodTabs: {
    flexDirection: 'row',
    gap: 4,
    marginBottom: 8,
  },
  methodTab: {
    flex: 1,
    paddingVertical: 5,
    backgroundColor: '#222',
    borderRadius: 4,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#333',
  },
  methodTabActive: { backgroundColor: Colors.pokedexRed, borderColor: Colors.pokedexRedLight },
  methodTabText: { fontFamily: 'PokemonGB', fontSize: 6, color: '#777' },
  methodTabTextActive: { color: '#FFF' },

  gen3Note: {
    backgroundColor: '#1A1A3A',
    borderRadius: 4,
    padding: 6,
    marginBottom: 8,
    borderLeftWidth: 3,
    borderLeftColor: '#4444AA',
  },
  gen3NoteText: { fontFamily: 'PokemonGB', fontSize: 6, color: '#8888CC' },

  moveRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 5,
    borderBottomWidth: 1,
    borderBottomColor: '#1A1A1A',
    gap: 4,
  },
  moveLvl:   { fontFamily: 'PokemonGB', fontSize: 7, color: '#888', width: 30 },
  moveName:  { fontFamily: 'PokemonGB', fontSize: 7, color: '#FFF', flex: 1 },
  movePower: { fontFamily: 'PokemonGB', fontSize: 7, color: '#FFF', width: 28, textAlign: 'right' },
  moveAcc:   { fontFamily: 'PokemonGB', fontSize: 7, color: '#888', width: 32, textAlign: 'right' },

  typeRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 12 },
  defLabel: { fontFamily: 'PokemonGB', fontSize: 7, color: '#888' },

  eggGroupBtn: {
    backgroundColor: '#1C1C1C',
    borderRadius: 6,
    padding: 12,
    marginVertical: 4,
    borderWidth: 1,
    borderColor: '#333',
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  eggGroupText:  { fontFamily: 'PokemonGB', fontSize: 10, color: '#FFF' },
  eggGroupArrow: { fontFamily: 'PokemonGB', fontSize: 7, color: Colors.pokedexRed },

  emptyText: { fontFamily: 'PokemonGB', fontSize: 8, color: '#666', textAlign: 'center', marginTop: 20 },

  // evolution
  evoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#1A1A1A',
  },
  evoMon: { flex: 1, alignItems: 'center' },
  evoSprite: { width: 48, height: 48, resizeMode: 'contain' },
  evoName: { fontFamily: 'PokemonGB', fontSize: 6, color: '#AAA', marginTop: 2, textAlign: 'center' },
  evoNameHL: { color: Colors.pokedexRed },
  evoMiddle: { alignItems: 'center', paddingHorizontal: 4 },
  evoCondition: { fontFamily: 'PokemonGB', fontSize: 6, color: '#888', textAlign: 'center', marginBottom: 2 },
  evoArrow: { fontFamily: 'PokemonGB', fontSize: 10, color: '#555' },

  // locations
  noEncounterBox: { alignItems: 'center', marginTop: 24 },
  noEncounterText: { fontFamily: 'PokemonGB', fontSize: 8, color: '#666', textAlign: 'center' },
  noEncounterSub: { fontFamily: 'PokemonGB', fontSize: 7, color: '#444', textAlign: 'center', marginTop: 6 },

  encVersionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
    gap: 8,
  },
  encVersionBadge: {
    borderRadius: 4,
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  encVersionLabel: { fontFamily: 'PokemonGB', fontSize: 7, color: '#FFF' },
  encNotAvail: { fontFamily: 'PokemonGB', fontSize: 6, color: '#555' },

  encRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 5,
    borderBottomWidth: 1,
    borderBottomColor: '#1A1A1A',
  },
  encLeft: { flex: 1 },
  encLocation: { fontFamily: 'PokemonGB', fontSize: 8, color: '#FFF' },
  encMethod: { fontFamily: 'PokemonGB', fontSize: 6, color: '#888', marginTop: 2 },
  encLevel: { fontFamily: 'PokemonGB', fontSize: 7, color: '#AAA', marginLeft: 8 },
});
