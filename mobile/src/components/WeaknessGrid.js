import React from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { Colors } from '../theme/colors';

const TYPES = [
  'Normal','Fire','Water','Grass','Electric','Ice','Fighting','Poison',
  'Ground','Flying','Psychic','Bug','Rock','Ghost','Dragon','Dark','Steel',
];

function MultiplierCell({ type, multiplier }) {
  if (multiplier === 1) return null; // Only show non-neutral

  let bg, label;
  if (multiplier === 0)    { bg = '#555555'; label = '0×'; }
  else if (multiplier === 0.25) { bg = '#1A6B1A'; label = '¼×'; }
  else if (multiplier === 0.5)  { bg = '#2E8B2E'; label = '½×'; }
  else if (multiplier === 2)    { bg = '#CC3300'; label = '2×'; }
  else if (multiplier === 4)    { bg = '#FF0000'; label = '4×'; }
  else { return null; }

  return (
    <View style={styles.cell}>
      <View style={[styles.typeBar, { backgroundColor: Colors.types[type] || '#888' }]}>
        <Text style={styles.typeText}>{type.substring(0, 3).toUpperCase()}</Text>
      </View>
      <View style={[styles.multBar, { backgroundColor: bg }]}>
        <Text style={styles.multText}>{label}</Text>
      </View>
    </View>
  );
}

export default function WeaknessGrid({ chart }) {
  if (!chart) return null;

  const weaknesses  = TYPES.filter(t => (chart[t] || 1) > 1);
  const resistances = TYPES.filter(t => (chart[t] || 1) < 1);
  const immunities  = TYPES.filter(t => chart[t] === 0);

  return (
    <View style={styles.container}>
      <Section title="Weak To" color="#CC3300" types={weaknesses} chart={chart} />
      <Section title="Resists"  color="#2E8B2E" types={resistances} chart={chart} />
      {immunities.length > 0 && (
        <Section title="Immune"  color="#555555" types={immunities} chart={chart} />
      )}
    </View>
  );
}

function Section({ title, color, types, chart }) {
  if (types.length === 0) return null;
  return (
    <View style={styles.section}>
      <Text style={[styles.sectionTitle, { color }]}>{title}</Text>
      <View style={styles.grid}>
        {types.map(t => (
          <MultiplierCell key={t} type={t} multiplier={chart[t]} />
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { marginVertical: 8 },
  section:   { marginBottom: 10 },
  sectionTitle: {
    fontFamily: 'PokemonGB',
    fontSize: 9,
    marginBottom: 6,
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 4,
  },
  cell: {
    width: 44,
    borderRadius: 4,
    overflow: 'hidden',
    marginRight: 4,
    marginBottom: 4,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.15)',
  },
  typeBar: {
    paddingVertical: 2,
    alignItems: 'center',
  },
  typeText: {
    fontFamily: 'PokemonGB',
    fontSize: 6,
    color: '#FFFFFF',
    fontWeight: 'bold',
  },
  multBar: {
    paddingVertical: 2,
    alignItems: 'center',
  },
  multText: {
    fontFamily: 'PokemonGB',
    fontSize: 8,
    color: '#FFFFFF',
    fontWeight: 'bold',
  },
});
