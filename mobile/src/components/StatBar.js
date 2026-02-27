import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Colors } from '../theme/colors';

const STAT_LABELS = {
  hp:               'HP',
  attack:           'ATK',
  defense:          'DEF',
  'special-attack': 'SP.ATK',
  'special-defense':'SP.DEF',
  speed:            'SPD',
};

const MAX_STAT = 255;

function barColor(value) {
  if (value < 50)  return '#F84020';
  if (value < 80)  return '#F8A030';
  if (value < 110) return '#F8D030';
  if (value < 140) return '#78C850';
  return '#6890F0';
}

export default function StatBar({ statName, value }) {
  const label = STAT_LABELS[statName] || statName.toUpperCase();
  const pct   = Math.min((value / MAX_STAT) * 100, 100);
  const color = barColor(value);

  return (
    <View style={styles.row}>
      <Text style={styles.label}>{label}</Text>
      <Text style={styles.value}>{String(value).padStart(3, ' ')}</Text>
      <View style={styles.track}>
        <View style={[styles.fill, { width: `${pct}%`, backgroundColor: color }]} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 3,
  },
  label: {
    fontFamily: 'PokemonGB',
    fontSize: 7,
    color: '#AAAAAA',
    width: 52,
    textTransform: 'uppercase',
  },
  value: {
    fontFamily: 'PokemonGB',
    fontSize: 9,
    color: '#FFFFFF',
    width: 28,
    textAlign: 'right',
    marginRight: 8,
  },
  track: {
    flex: 1,
    height: 8,
    backgroundColor: '#333333',
    borderRadius: 4,
    overflow: 'hidden',
  },
  fill: {
    height: '100%',
    borderRadius: 4,
  },
});
