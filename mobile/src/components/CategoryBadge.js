import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Colors } from '../theme/colors';

// Shows Physical / Special / Status category — critical for Gen 3 FRLG
export default function CategoryBadge({ category }) {
  const bg = Colors[category] || Colors.Status;
  return (
    <View style={[styles.badge, { backgroundColor: bg }]}>
      <Text style={styles.text}>{(category || '—').toUpperCase()}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  badge: {
    borderRadius: 4,
    paddingHorizontal: 7,
    paddingVertical: 3,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.2)',
  },
  text: {
    fontFamily: 'PokemonGB',
    fontSize: 7,
    color: '#FFFFFF',
    fontWeight: 'bold',
  },
});
