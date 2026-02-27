import React, { useState, useEffect } from 'react';
import {
  View, Text, ScrollView, TextInput, TouchableOpacity,
  Image, StyleSheet, ActivityIndicator, Alert,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Colors } from '../theme/colors';
import TypeBadge from '../components/TypeBadge';
import WeaknessGrid from '../components/WeaknessGrid';
import PokedexShell from '../components/PokedexShell';
import { analyseTeam } from '../services/api';

const MAX_SLOTS = 6;
const TEAM_STORAGE_KEY = '@frlg_saved_team';
const ATTACKING_TYPES = [
  'Normal','Fire','Water','Grass','Electric','Ice','Fighting','Poison',
  'Ground','Flying','Psychic','Bug','Rock','Ghost','Dragon','Dark','Steel',
];

export default function TeamPlannerScreen({ navigation }) {
  const [slots,     setSlots]     = useState(Array(MAX_SLOTS).fill(''));
  const [result,    setResult]    = useState(null);
  const [loading,   setLoading]   = useState(false);
  const [activeTab, setActiveTab] = useState('TEAM');

  // Load saved team from device on mount
  useEffect(() => {
    AsyncStorage.getItem(TEAM_STORAGE_KEY).then(saved => {
      if (saved) {
        try { setSlots(JSON.parse(saved)); } catch { /* ignore corrupt data */ }
      }
    });
  }, []);

  function updateSlot(index, value) {
    const next = [...slots];
    next[index] = value.toLowerCase().trim();
    setSlots(next);
    // Auto-save to device storage on every change
    AsyncStorage.setItem(TEAM_STORAGE_KEY, JSON.stringify(next)).catch(() => {});
  }

  async function runAnalysis() {
    const team = slots.filter(s => s.trim() !== '');
    if (team.length < 1) {
      Alert.alert('Empty Team', 'Add at least 1 Pokémon to your team.');
      return;
    }
    setLoading(true);
    setResult(null);
    try {
      const data = await analyseTeam(team);
      setResult(data);
      setActiveTab('ANALYSIS');
    } catch (e) {
      Alert.alert('Error', 'Failed to analyse team. Check your internet connection.');
    } finally {
      setLoading(false);
    }
  }

  function clearTeam() {
    const empty = Array(MAX_SLOTS).fill('');
    setSlots(empty);
    setResult(null);
    setActiveTab('TEAM');
    AsyncStorage.setItem(TEAM_STORAGE_KEY, JSON.stringify(empty)).catch(() => {});
  }

  return (
    <PokedexShell title="TEAM PLANNER">
      <View style={styles.tabs}>
        {['TEAM', 'ANALYSIS', 'COVERAGE'].map(t => (
          <TouchableOpacity
            key={t}
            style={[styles.tab, activeTab === t && styles.tabActive]}
            onPress={() => setActiveTab(t)}
          >
            <Text style={[styles.tabText, activeTab === t && styles.tabTextActive]}>{t}</Text>
          </TouchableOpacity>
        ))}
      </View>

      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>

        {activeTab === 'TEAM' && (
          <View>
            <Text style={styles.instruction}>
              Enter Pokémon names (e.g. charizard, pikachu)
            </Text>
            {Array.from({ length: MAX_SLOTS }, (_, i) => (
              <View key={i} style={styles.slotRow}>
                <View style={styles.slotBadge}>
                  <Text style={styles.slotNum}>{i + 1}</Text>
                </View>
                <TextInput
                  style={styles.slotInput}
                  placeholder={`Slot ${i + 1}...`}
                  placeholderTextColor="#555"
                  value={slots[i]}
                  onChangeText={v => updateSlot(i, v)}
                  autoCapitalize="none"
                  autoCorrect={false}
                  returnKeyType="next"
                />
              </View>
            ))}

            <View style={styles.buttonRow}>
              <TouchableOpacity style={styles.analyseBtn} onPress={runAnalysis} disabled={loading}>
                {loading
                  ? <ActivityIndicator color="#FFF" />
                  : <Text style={styles.analyseBtnText}>▶ ANALYSE TEAM</Text>
                }
              </TouchableOpacity>
              <TouchableOpacity style={styles.clearBtn} onPress={clearTeam}>
                <Text style={styles.clearBtnText}>CLEAR</Text>
              </TouchableOpacity>
            </View>
          </View>
        )}

        {activeTab === 'ANALYSIS' && result && (
          <AnalysisTab result={result} navigation={navigation} />
        )}

        {activeTab === 'ANALYSIS' && !result && (
          <Text style={styles.noResult}>Analyse your team first</Text>
        )}

        {activeTab === 'COVERAGE' && result && (
          <CoverageTab result={result} />
        )}

        {activeTab === 'COVERAGE' && !result && (
          <Text style={styles.noResult}>Analyse your team first</Text>
        )}

      </ScrollView>
    </PokedexShell>
  );
}

// ── ANALYSIS TAB ──────────────────────────────────────────────────────────────

function AnalysisTab({ result, navigation }) {
  const [selected, setSelected] = useState(0);
  const { members, errors } = result;

  if (members.length === 0) {
    return <Text style={styles.noResult}>No valid Pokémon found in team.</Text>;
  }

  const current = members[selected];

  return (
    <View>
      {/* Member selector */}
      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.memberScroll}>
        {members.map((m, i) => (
          <TouchableOpacity
            key={m.name}
            style={[styles.memberBtn, selected === i && styles.memberBtnActive]}
            onPress={() => setSelected(i)}
          >
            {m.sprite
              ? <Image source={{ uri: m.sprite }} style={styles.memberSprite} />
              : <View style={styles.memberSpritePlaceholder} />
            }
            <Text style={styles.memberName}>{m.name}</Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      {errors.length > 0 && (
        <View style={styles.errorsBox}>
          <Text style={styles.errorsTitle}>Not found:</Text>
          {errors.map(e => (
            <Text key={e.name} style={styles.errorsItem}>• {e.name}</Text>
          ))}
        </View>
      )}

      {/* Selected Pokémon weakness chart */}
      <View style={styles.memberDetail}>
        <Text style={styles.memberDetailName}>{current.name.toUpperCase()}</Text>
        <View style={styles.memberTypes}>
          {current.types.map(t => <TypeBadge key={t} type={t} />)}
        </View>
        <WeaknessGrid chart={current.chart} />
      </View>

      <TouchableOpacity
        style={styles.viewDexBtn}
        onPress={() => navigation.navigate('PokemonDetail', { nameOrId: current.name })}
      >
        <Text style={styles.viewDexText}>VIEW IN POKÉDEX ▶</Text>
      </TouchableOpacity>
    </View>
  );
}

// ── COVERAGE TAB ──────────────────────────────────────────────────────────────

function CoverageTab({ result }) {
  const { teamVulnerabilities, coverageGaps, members } = result;

  return (
    <View>
      <Text style={styles.coverageTitle}>TEAM VULNERABILITY OVERVIEW</Text>
      <Text style={styles.coverageSubtitle}>
        {members.length} Pokémon — {coverageGaps.length} coverage gap{coverageGaps.length !== 1 ? 's' : ''} detected
      </Text>

      {coverageGaps.length > 0 && (
        <View style={styles.gapBox}>
          <Text style={styles.gapTitle}>⚠ COVERAGE GAPS (3+ members weak, none immune)</Text>
          <View style={styles.gapTypes}>
            {coverageGaps.map(t => (
              <View key={t} style={[styles.gapBadge, { backgroundColor: Colors.types[t] || '#888' }]}>
                <Text style={styles.gapBadgeText}>{t.toUpperCase()}</Text>
              </View>
            ))}
          </View>
        </View>
      )}

      <Text style={styles.tableHeader}>TYPE BREAKDOWN</Text>
      <View style={styles.tableHead}>
        <Text style={[styles.tableCell, styles.tableCellType]}>TYPE</Text>
        <Text style={styles.tableCell}>WEAK</Text>
        <Text style={styles.tableCell}>RESIST</Text>
        <Text style={styles.tableCell}>IMMUNE</Text>
      </View>
      {ATTACKING_TYPES.map(type => {
        const v = teamVulnerabilities[type] || {};
        const isGap = coverageGaps.includes(type);
        return (
          <View key={type} style={[styles.tableRow, isGap && styles.tableRowGap]}>
            <View style={[styles.tableCellType, { justifyContent: 'flex-start', flexDirection: 'row', alignItems: 'center' }]}>
              <View style={[styles.typeIndicator, { backgroundColor: Colors.types[type] || '#888' }]} />
              <Text style={styles.tableCellTypeText}>{type}</Text>
            </View>
            <WeakCount count={v.weakCount || 0} total={members.length} />
            <WeakCount count={v.resistCount || 0} total={members.length} positive />
            <WeakCount count={v.immuneCount || 0} total={members.length} positive />
          </View>
        );
      })}
    </View>
  );
}

function WeakCount({ count, total, positive = false }) {
  const color = count === 0 ? '#555'
    : positive ? '#2E8B2E'
    : count >= 3 ? '#FF4444'
    : count >= 2 ? '#FF8800'
    : '#CCCC44';

  return (
    <Text style={[styles.tableCell, { color }]}>
      {count}/{total}
    </Text>
  );
}

// ── Styles ───────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  tabs: { flexDirection: 'row', backgroundColor: '#111' },
  tab: {
    flex: 1,
    paddingVertical: 8,
    alignItems: 'center',
    borderBottomWidth: 2,
    borderBottomColor: 'transparent',
  },
  tabActive:     { borderBottomColor: Colors.pokedexRed },
  tabText:       { fontFamily: 'PokemonGB', fontSize: 6, color: '#666' },
  tabTextActive: { color: '#FFF' },

  content: { padding: 12 },

  instruction: {
    fontFamily: 'PokemonGB',
    fontSize: 8,
    color: '#888',
    marginBottom: 12,
  },

  slotRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  slotBadge: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: Colors.pokedexRed,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 8,
  },
  slotNum: { fontFamily: 'PokemonGB', fontSize: 10, color: '#FFF', fontWeight: 'bold' },
  slotInput: {
    flex: 1,
    height: 38,
    backgroundColor: '#1C1C1C',
    borderRadius: 6,
    paddingHorizontal: 10,
    fontFamily: 'PokemonGB',
    fontSize: 9,
    color: '#FFF',
    borderWidth: 1,
    borderColor: '#333',
  },

  buttonRow: { flexDirection: 'row', gap: 8, marginTop: 12 },
  analyseBtn: {
    flex: 1,
    backgroundColor: Colors.pokedexRed,
    borderRadius: 6,
    paddingVertical: 12,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: Colors.pokedexRedLight,
  },
  analyseBtnText: { fontFamily: 'PokemonGB', fontSize: 9, color: '#FFF' },
  clearBtn: {
    backgroundColor: '#333',
    borderRadius: 6,
    paddingVertical: 12,
    paddingHorizontal: 16,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#555',
  },
  clearBtnText: { fontFamily: 'PokemonGB', fontSize: 9, color: '#AAA' },

  noResult: {
    fontFamily: 'PokemonGB',
    fontSize: 8,
    color: '#666',
    textAlign: 'center',
    marginTop: 40,
  },

  memberScroll: { marginBottom: 12 },
  memberBtn: {
    alignItems: 'center',
    marginRight: 8,
    padding: 6,
    borderRadius: 8,
    borderWidth: 2,
    borderColor: '#333',
    backgroundColor: '#1C1C1C',
  },
  memberBtnActive: { borderColor: Colors.pokedexRed, backgroundColor: '#2A1010' },
  memberSprite: { width: 52, height: 52, resizeMode: 'contain' },
  memberSpritePlaceholder: { width: 52, height: 52, backgroundColor: '#333', borderRadius: 26 },
  memberName: { fontFamily: 'PokemonGB', fontSize: 6, color: '#AAA', marginTop: 2 },

  errorsBox: {
    backgroundColor: '#2A1010',
    borderRadius: 6,
    padding: 8,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: '#CC3300',
  },
  errorsTitle: { fontFamily: 'PokemonGB', fontSize: 7, color: '#FF4444', marginBottom: 4 },
  errorsItem:  { fontFamily: 'PokemonGB', fontSize: 7, color: '#FF8888' },

  memberDetail: { backgroundColor: '#1C1C1C', borderRadius: 8, padding: 12, marginBottom: 8 },
  memberDetailName: { fontFamily: 'PokemonGB', fontSize: 12, color: '#FFF', marginBottom: 8 },
  memberTypes: { flexDirection: 'row', marginBottom: 10 },

  viewDexBtn: {
    backgroundColor: '#1A1A3A',
    borderRadius: 6,
    padding: 10,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#333366',
    marginBottom: 16,
  },
  viewDexText: { fontFamily: 'PokemonGB', fontSize: 8, color: '#8888CC' },

  coverageTitle: { fontFamily: 'PokemonGB', fontSize: 10, color: '#FFF', marginBottom: 4 },
  coverageSubtitle: { fontFamily: 'PokemonGB', fontSize: 7, color: '#888', marginBottom: 12 },

  gapBox: {
    backgroundColor: '#2A1A00',
    borderRadius: 8,
    padding: 10,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#CC6600',
  },
  gapTitle: { fontFamily: 'PokemonGB', fontSize: 7, color: '#FF8800', marginBottom: 8 },
  gapTypes: { flexDirection: 'row', flexWrap: 'wrap', gap: 4 },
  gapBadge: {
    borderRadius: 4,
    paddingHorizontal: 7,
    paddingVertical: 3,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.2)',
  },
  gapBadgeText: { fontFamily: 'PokemonGB', fontSize: 7, color: '#FFF', fontWeight: 'bold' },

  tableHeader: { fontFamily: 'PokemonGB', fontSize: 8, color: '#888', marginTop: 12, marginBottom: 4 },
  tableHead: {
    flexDirection: 'row',
    paddingVertical: 6,
    borderBottomWidth: 2,
    borderBottomColor: '#333',
    backgroundColor: '#111',
  },
  tableRow: {
    flexDirection: 'row',
    paddingVertical: 5,
    borderBottomWidth: 1,
    borderBottomColor: '#1A1A1A',
    alignItems: 'center',
  },
  tableRowGap: { backgroundColor: '#1A0A00' },
  tableCell: {
    flex: 1,
    fontFamily: 'PokemonGB',
    fontSize: 7,
    color: '#AAA',
    textAlign: 'center',
  },
  tableCellType: {
    flex: 1.8,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 4,
  },
  tableCellTypeText: { fontFamily: 'PokemonGB', fontSize: 7, color: '#CCC' },
  typeIndicator: { width: 8, height: 8, borderRadius: 4, marginRight: 4 },
});
