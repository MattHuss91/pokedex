import React, { useState, useEffect } from 'react';
import {
  View, Text, ScrollView, TouchableOpacity,
  StyleSheet, ActivityIndicator,
} from 'react-native';
import { Colors } from '../theme/colors';
import TypeBadge from '../components/TypeBadge';
import CategoryBadge from '../components/CategoryBadge';
import PokedexShell from '../components/PokedexShell';
import { fetchMoveTutors, fetchTmsHms } from '../services/api';

const TABS = ['TUTORS', 'TMs', 'HMs'];

export default function MoveTutorsScreen() {
  const [tab,     setTab]     = useState('TUTORS');
  const [tutors,  setTutors]  = useState(null);
  const [tmsHms,  setTmsHms]  = useState(null);
  const [loading, setLoading] = useState(true);
  const [error,   setError]   = useState(null);

  useEffect(() => { load(); }, []);

  async function load() {
    setLoading(true);
    try {
      const [t, th] = await Promise.all([fetchMoveTutors(), fetchTmsHms()]);
      setTutors(t);
      setTmsHms(th);
    } catch {
      setError('Failed to load move data.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <PokedexShell title="MOVES & TUTORS">
      <View style={styles.tabs}>
        {TABS.map(t => (
          <TouchableOpacity
            key={t}
            style={[styles.tab, tab === t && styles.tabActive]}
            onPress={() => setTab(t)}
          >
            <Text style={[styles.tabText, tab === t && styles.tabTextActive]}>{t}</Text>
          </TouchableOpacity>
        ))}
      </View>

      {loading ? (
        <View style={styles.center}>
          <ActivityIndicator color={Colors.pokedexRed} />
        </View>
      ) : error ? (
        <View style={styles.center}>
          <Text style={styles.errorText}>{error}</Text>
        </View>
      ) : (
        <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
          {tab === 'TUTORS' && tutors  && <TutorsTab tutors={tutors} />}
          {tab === 'TMs'    && tmsHms  && <MoveListTab moves={tmsHms.tms}  prefix="TM" />}
          {tab === 'HMs'    && tmsHms  && <MoveListTab moves={tmsHms.hms}  prefix="HM" />}
        </ScrollView>
      )}
    </PokedexShell>
  );
}

function TutorsTab({ tutors }) {
  const [expanded, setExpanded] = useState({});
  const toggle = id => setExpanded(p => ({ ...p, [id]: !p[id] }));

  return (
    <View>
      <View style={styles.gen3Note}>
        <Text style={styles.gen3NoteText}>
          ★ Category shown uses Gen 3 TYPE-based rules (FRLG)
        </Text>
      </View>
      {tutors.tutors.map(tutor => (
        <View key={tutor.id} style={styles.tutorGroup}>
          <TouchableOpacity style={styles.tutorHeader} onPress={() => toggle(tutor.id)}>
            <View style={styles.tutorHeaderText}>
              <Text style={styles.tutorLocation}>{tutor.location}</Text>
              <Text style={styles.tutorReq}>{tutor.requirement}</Text>
            </View>
            <Text style={styles.tutorToggle}>{expanded[tutor.id] ? '▲' : '▼'}</Text>
          </TouchableOpacity>

          {expanded[tutor.id] && (
            <View style={styles.tutorMoves}>
              {tutor.moves.map(move => (
                <MoveCard key={move.name} move={move} />
              ))}
            </View>
          )}
        </View>
      ))}
    </View>
  );
}

function MoveListTab({ moves, prefix }) {
  return (
    <View>
      <View style={styles.gen3Note}>
        <Text style={styles.gen3NoteText}>
          ★ Category shown uses Gen 3 TYPE-based rules (FRLG)
        </Text>
      </View>
      {/* Column headers */}
      <View style={styles.listHeader}>
        <Text style={[styles.listHeaderCell, { width: 36 }]}>{prefix}</Text>
        <Text style={[styles.listHeaderCell, { flex: 1 }]}>NAME</Text>
        <Text style={styles.listHeaderCell}>TYPE</Text>
        <Text style={styles.listHeaderCell}>CAT</Text>
        <Text style={styles.listHeaderCell}>PWR</Text>
        <Text style={styles.listHeaderCell}>ACC</Text>
        <Text style={styles.listHeaderCell}>PP</Text>
      </View>
      {moves.map(m => (
        <View key={m.number} style={styles.listRow}>
          <Text style={[styles.listCell, styles.listCellNum, { width: 36 }]}>
            {prefix}{String(m.number).padStart(2, '0')}
          </Text>
          <Text style={[styles.listCell, { flex: 1 }]} numberOfLines={1}>
            {m.name}
          </Text>
          <View style={{ width: 52 }}>
            <TypeBadge type={m.type} small />
          </View>
          <View style={{ width: 52 }}>
            <CategoryBadge category={m.category} />
          </View>
          <Text style={styles.listCell}>{m.power ?? '—'}</Text>
          <Text style={styles.listCell}>{m.accuracy ? `${m.accuracy}%` : '∞'}</Text>
          <Text style={styles.listCell}>{m.pp}</Text>
        </View>
      ))}
    </View>
  );
}

function MoveCard({ move }) {
  return (
    <View style={styles.moveCard}>
      <View style={styles.moveCardTop}>
        <Text style={styles.moveCardName}>{move.name}</Text>
        <TypeBadge type={move.type} small />
        <CategoryBadge category={move.category} />
      </View>
      <View style={styles.moveCardStats}>
        <Stat label="PWR" value={move.power ?? '—'} />
        <Stat label="ACC" value={move.accuracy ? `${move.accuracy}%` : '∞'} />
        <Stat label="PP"  value={move.pp} />
      </View>
      {move.note && <Text style={styles.moveCardNote}>{move.note}</Text>}
      {move.eligible?.length > 0 && (
        <Text style={styles.moveCardEligible}>
          Eligible: {move.eligible.join(', ')}
        </Text>
      )}
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

  content: { padding: 10 },
  center:  { flex: 1, alignItems: 'center', justifyContent: 'center' },
  errorText: { fontFamily: 'PokemonGB', fontSize: 8, color: '#FF4444', textAlign: 'center' },

  gen3Note: {
    backgroundColor: '#1A1A3A',
    borderRadius: 4,
    padding: 6,
    marginBottom: 10,
    borderLeftWidth: 3,
    borderLeftColor: '#4444AA',
  },
  gen3NoteText: { fontFamily: 'PokemonGB', fontSize: 6, color: '#8888CC' },

  tutorGroup: {
    backgroundColor: '#1C1C1C',
    borderRadius: 8,
    marginBottom: 8,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: '#333',
  },
  tutorHeader: {
    flexDirection: 'row',
    padding: 10,
    alignItems: 'center',
    backgroundColor: '#252525',
  },
  tutorHeaderText: { flex: 1 },
  tutorLocation: { fontFamily: 'PokemonGB', fontSize: 9, color: '#FFF', marginBottom: 2 },
  tutorReq:      { fontFamily: 'PokemonGB', fontSize: 6, color: '#888' },
  tutorToggle:   { fontFamily: 'PokemonGB', fontSize: 10, color: Colors.pokedexRed },
  tutorMoves:    { padding: 8 },

  moveCard: {
    backgroundColor: '#111',
    borderRadius: 6,
    padding: 8,
    marginBottom: 6,
    borderWidth: 1,
    borderColor: '#2A2A2A',
  },
  moveCardTop: { flexDirection: 'row', alignItems: 'center', marginBottom: 6, gap: 4 },
  moveCardName: { fontFamily: 'PokemonGB', fontSize: 9, color: '#FFF', flex: 1 },
  moveCardStats: { flexDirection: 'row', gap: 12, marginBottom: 4 },
  moveCardNote: { fontFamily: 'PokemonGB', fontSize: 6, color: '#888', marginTop: 2 },
  moveCardEligible: { fontFamily: 'PokemonGB', fontSize: 6, color: '#FFAA33', marginTop: 2 },

  statItem: { flexDirection: 'row', gap: 4 },
  statLabel: { fontFamily: 'PokemonGB', fontSize: 6, color: '#666' },
  statValue: { fontFamily: 'PokemonGB', fontSize: 6, color: '#FFF' },

  listHeader: {
    flexDirection: 'row',
    paddingVertical: 6,
    borderBottomWidth: 2,
    borderBottomColor: '#333',
    backgroundColor: '#111',
    alignItems: 'center',
  },
  listHeaderCell: {
    fontFamily: 'PokemonGB',
    fontSize: 6,
    color: '#666',
    width: 52,
    textAlign: 'center',
  },
  listRow: {
    flexDirection: 'row',
    paddingVertical: 5,
    borderBottomWidth: 1,
    borderBottomColor: '#1A1A1A',
    alignItems: 'center',
  },
  listCell: {
    fontFamily: 'PokemonGB',
    fontSize: 7,
    color: '#CCC',
    width: 52,
    textAlign: 'center',
  },
  listCellNum: { color: '#888' },
});
