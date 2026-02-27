import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Colors } from '../theme/colors';

export default function TypeBadge({ type, small = false }) {
  const bg = Colors.types[type] || '#888';
  return (
    <View style={[styles.badge, { backgroundColor: bg }, small && styles.small]}>
      <Text style={[styles.text, small && styles.smallText]}>{type.toUpperCase()}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  badge: {
    borderRadius: 4,
    paddingHorizontal: 8,
    paddingVertical: 3,
    marginRight: 4,
    borderWidth: 1,
    borderColor: 'rgba(0,0,0,0.3)',
  },
  small: {
    paddingHorizontal: 5,
    paddingVertical: 2,
  },
  text: {
    fontFamily: 'PokemonGB',
    fontSize: 8,
    color: '#FFFFFF',
    fontWeight: 'bold',
    textShadowColor: 'rgba(0,0,0,0.4)',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 1,
  },
  smallText: {
    fontSize: 6,
  },
});
