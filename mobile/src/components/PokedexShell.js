import React from 'react';
import { View, Text, StyleSheet, StatusBar } from 'react-native';
import { Colors } from '../theme/colors';

/**
 * The outer Pokédex shell — red body, camera eye, status lights, screen bezel.
 * Wrap each screen's content inside this component.
 */
export default function PokedexShell({ children, title }) {
  return (
    <View style={styles.shell}>
      <StatusBar backgroundColor={Colors.pokedexRedDark} barStyle="light-content" />

      {/* ── Top bar with camera and lights ─────────────────────────────── */}
      <View style={styles.topBar}>
        <View style={styles.camera}>
          <View style={styles.cameraInner} />
        </View>
        <View style={styles.lights}>
          <View style={[styles.light, styles.lightRed]}   />
          <View style={[styles.light, styles.lightYellow]}/>
          <View style={[styles.light, styles.lightGreen]} />
        </View>
        {title ? <Text style={styles.titleText}>{title}</Text> : null}
      </View>

      {/* ── Hinge line ─────────────────────────────────────────────────── */}
      <View style={styles.hinge} />

      {/* ── Main content (screen area) ─────────────────────────────────── */}
      <View style={styles.screenArea}>
        {children}
      </View>

      {/* ── Bottom panel ───────────────────────────────────────────────── */}
      <View style={styles.bottomPanel}>
        <View style={styles.dpad}>
          <View style={styles.dpadH} />
          <View style={styles.dpadV} />
        </View>
        <View style={styles.actionButtons}>
          <View style={[styles.actionBtn, { backgroundColor: '#3050F8' }]} />
          <View style={[styles.actionBtn, { backgroundColor: '#F85888', marginLeft: 8 }]} />
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  shell: {
    flex: 1,
    backgroundColor: Colors.pokedexRed,
  },
  topBar: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingTop: 8,
    paddingBottom: 8,
  },
  camera: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#99CCFF',
    borderWidth: 3,
    borderColor: '#223355',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 10,
  },
  cameraInner: {
    width: 14,
    height: 14,
    borderRadius: 7,
    backgroundColor: '#4477BB',
    borderWidth: 2,
    borderColor: '#223355',
  },
  lights: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 12,
  },
  light: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: 4,
    borderWidth: 1,
    borderColor: 'rgba(0,0,0,0.3)',
  },
  lightRed:    { backgroundColor: '#FF2222' },
  lightYellow: { backgroundColor: '#FFCC00' },
  lightGreen:  { backgroundColor: '#00DD44' },
  titleText: {
    fontFamily: 'PokemonGB',
    fontSize: 10,
    color: '#FFFFFF',
    textShadowColor: 'rgba(0,0,0,0.5)',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 2,
    flex: 1,
    textAlign: 'center',
    marginRight: 16,
  },
  hinge: {
    height: 6,
    backgroundColor: Colors.pokedexHinge,
    borderTopWidth: 1,
    borderBottomWidth: 1,
    borderColor: '#660000',
  },
  screenArea: {
    flex: 1,
    backgroundColor: Colors.screenDark,
    margin: 12,
    borderRadius: 8,
    borderWidth: 3,
    borderColor: '#1A1A2E',
    overflow: 'hidden',
  },
  bottomPanel: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 24,
    paddingVertical: 12,
  },
  dpad: {
    width: 48,
    height: 48,
    alignItems: 'center',
    justifyContent: 'center',
  },
  dpadH: {
    position: 'absolute',
    width: 48,
    height: 16,
    backgroundColor: Colors.panelDark,
    borderRadius: 4,
  },
  dpadV: {
    position: 'absolute',
    width: 16,
    height: 48,
    backgroundColor: Colors.panelDark,
    borderRadius: 4,
  },
  actionButtons: {
    flexDirection: 'row',
  },
  actionBtn: {
    width: 28,
    height: 28,
    borderRadius: 14,
    borderWidth: 2,
    borderColor: 'rgba(0,0,0,0.4)',
  },
});
