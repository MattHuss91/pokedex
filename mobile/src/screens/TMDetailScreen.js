import React, { useState, useEffect } from 'react';
import {
  View, Text, ScrollView, StyleSheet,
  ActivityIndicator, TouchableOpacity,
} from 'react-native';
import PokedexShell from '../components/PokedexShell';
import TypeBadge from '../components/TypeBadge';
import CategoryBadge from '../components/CategoryBadge';
import { Colors } from '../theme/colors';
import TM_LOCATIONS from '../data/frlg-tm-locations.json';

const POKEAPI = 'https://pokeapi.co/api/v2';

// "SolarBeam" → "solar-beam", "Focus Punch" → "focus-punch"
function nameToSlug(name) {
  return name
    .replace(/([a-z])([A-Z])/g, '$1-$2')
    .toLowerCase()
    .replace(/\s+/g, '-')
    .replace(/[.']/g, '');
}

// "focus-punch" or "Focus Punch" → "Focus Punch"
function toDisplayName(name) {
  return name
    .replace(/-/g, ' ')
    .replace(/\w\S*/g, w => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase());
}

export default function TMDetailScreen({ route, navigation }) {
  const { move, prefix } = route.params;

  const [learners, setLearners] = useState(null);
  const [loading,  setLoading]  = useState(true);
  const [error,    setError]    = useState(null);

  const displayNum = `${prefix}${String(move.number).padStart(2, '0')}`;
  const locationKey = `${prefix}${String(move.number).padStart(2, '0')}`;
  const locationData = TM_LOCATIONS[locationKey] || null;
  const slug = nameToSlug(move.name);

  useEffect(() => { loadLearners(); }, []);

  async function loadLearners() {
    try {
      const res = await fetch(`${POKEAPI}/move/${slug}`);
      if (!res.ok) throw new Error('Not found');
      const data = await res.json();

      const filtered = (data.learned_by_pokemon || [])
        .map(p => ({
          name: p.name,
          id:   parseInt(p.url.split('/').filter(Boolean).pop(), 10),
        }))
        .filter(p => p.id >= 1 && p.id <= 251)
        .sort((a, b) => a.id - b.id);

      setLearners(filtered);
    } catch {
      setError('Could not load compatible Pokémon.');
      setLearners([]);
    } finally {
      setLoading(false);
    }
  }

  return (
    <PokedexShell title={displayNum}>
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>

        {/* Back */}
        <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()}>
          <Text style={styles.backText}>◀ BACK</Text>
        </TouchableOpacity>

        {/* ── Move header ──────────────────────────────────────────────── */}
        <View style={styles.moveCard}>
          <Text style={styles.moveNum}>{displayNum}</Text>
          <Text style={styles.moveName}>{toDisplayName(move.name)}</Text>
          <View style={styles.moveBadges}>
            <TypeBadge type={move.type} />
            <CategoryBadge category={move.category} />
          </View>
          <View style={styles.statsRow}>
            <Stat label="POWER"    value={move.power    ?? '—'} />
            <Stat label="ACCURACY" value={move.accuracy ? `${move.accuracy}%` : '∞'} />
            <Stat label="PP"       value={move.pp} />
          </View>
        </View>

        {/* ── Location ─────────────────────────────────────────────────── */}
        <SectionHeader text="WHERE TO GET IT" />
        {locationData ? (
          <View style={styles.locationBox}>
            <Text style={styles.locationText}>{locationData.location}</Text>
            {locationData.note ? (
              <Text style={styles.locationNote}>{locationData.note}</Text>
            ) : null}
          </View>
        ) : (
          <Text style={styles.unknownText}>Location data not available</Text>
        )}

        {/* ── Compatible Pokémon ───────────────────────────────────────── */}
        <SectionHeader
          text={`COMPATIBLE POKÉMON${learners ? ` (${learners.length})` : ''}`}
        />
        <Text style={styles.subNote}>Gen I–II only · tap to open Pokédex entry</Text>

        {loading ? (
          <View style={styles.center}>
            <ActivityIndicator color={Colors.pokedexRed} />
          </View>
        ) : error ? (
          <Text style={styles.unknownText}>{error}</Text>
        ) : learners.length === 0 ? (
          <Text style={styles.unknownText}>No Gen I–II Pokémon found</Text>
        ) : (
          <View style={styles.grid}>
            {learners.map(p => (
              <TouchableOpacity
                key={p.id}
                style={styles.pokemonCard}
                onPress={() => navigation.navigate('PokemonDetail', { nameOrId: p.name })}
                activeOpacity={0.7}
              >
                <Text style={styles.pokemonId}>#{String(p.id).padStart(3, '0')}</Text>
                <Text style={styles.pokemonName} numberOfLines={2}>
                  {toDisplayName(p.name)}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        )}

      </ScrollView>
    </PokedexShell>
  );
}

function SectionHeader({ text }) {
  return (
    <View style={styles.sectionHeader}>
      <Text style={styles.sectionHeaderText}>{text}</Text>
    </View>
  );
}

function Stat({ label, value }) {
  return (
    <View style={styles.statItem}>
      <Text style={styles.statLabel}>{label}</Text>
      <Text style={styles.statValue}>{String(value)}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  content: { padding: 12 },

  backBtn:  { marginBottom: 12 },
  backText: { fontFamily: 'PokemonGB', fontSize: 8, color: Colors.pokedexRed },

  moveCard: {
    backgroundColor: '#1C1C1C',
    borderRadius: 8,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#333',
  },
  moveNum: {
    fontFamily: 'PokemonGB',
    fontSize: 9,
    color: '#666',
    marginBottom: 6,
  },
  moveName: {
    fontFamily: 'PokemonGB',
    fontSize: 16,
    color: '#FFFFFF',
    marginBottom: 12,
    lineHeight: 26,
  },
  moveBadges: {
    flexDirection: 'row',
    gap: 6,
    marginBottom: 12,
  },
  statsRow: {
    flexDirection: 'row',
    gap: 24,
  },
  statItem: { alignItems: 'center' },
  statLabel: {
    fontFamily: 'PokemonGB',
    fontSize: 6,
    color: '#666',
    marginBottom: 3,
  },
  statValue: {
    fontFamily: 'PokemonGB',
    fontSize: 11,
    color: '#FFF',
  },

  sectionHeader: {
    borderLeftWidth: 3,
    borderLeftColor: Colors.pokedexRed,
    paddingLeft: 8,
    marginBottom: 8,
    marginTop: 4,
  },
  sectionHeaderText: {
    fontFamily: 'PokemonGB',
    fontSize: 8,
    color: '#CCC',
  },

  locationBox: {
    backgroundColor: '#0F1F0F',
    borderRadius: 6,
    padding: 14,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#1A3A1A',
    borderLeftWidth: 3,
    borderLeftColor: '#3A8A3A',
  },
  locationText: {
    fontFamily: 'PokemonGB',
    fontSize: 9,
    color: '#88EE88',
    lineHeight: 18,
  },
  locationNote: {
    fontFamily: 'PokemonGB',
    fontSize: 7,
    color: '#668866',
    marginTop: 8,
    lineHeight: 14,
  },

  subNote: {
    fontFamily: 'PokemonGB',
    fontSize: 6,
    color: '#555',
    marginBottom: 10,
  },

  unknownText: {
    fontFamily: 'PokemonGB',
    fontSize: 8,
    color: '#555',
    marginBottom: 16,
  },

  center: { padding: 20, alignItems: 'center' },

  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 5,
    paddingBottom: 16,
  },
  pokemonCard: {
    width: '30%',
    backgroundColor: '#1C1C1C',
    borderRadius: 6,
    padding: 7,
    borderWidth: 1,
    borderColor: '#2A2A2A',
    alignItems: 'center',
  },
  pokemonId: {
    fontFamily: 'PokemonGB',
    fontSize: 6,
    color: '#666',
    marginBottom: 3,
  },
  pokemonName: {
    fontFamily: 'PokemonGB',
    fontSize: 6,
    color: '#FFF',
    textAlign: 'center',
    lineHeight: 11,
  },
});
