import React, { useState, useEffect } from 'react';
import {
  View, Text, FlatList, TouchableOpacity,
  StyleSheet, ActivityIndicator,
} from 'react-native';
import { Colors } from '../theme/colors';
import PokedexShell from '../components/PokedexShell';
import { fetchEggGroup, fetchEggGroups } from '../services/api';

export default function EggGroupScreen({ route, navigation }) {
  const initialName = route.params?.name || null;
  const [groups,   setGroups]   = useState(null);
  const [selected, setSelected] = useState(initialName);
  const [detail,   setDetail]   = useState(null);
  const [loading,  setLoading]  = useState(true);
  const [error,    setError]    = useState(null);

  useEffect(() => { loadGroups(); }, []);
  useEffect(() => { if (selected) loadDetail(selected); }, [selected]);

  async function loadGroups() {
    try {
      const data = await fetchEggGroups();
      setGroups(data.egg_groups);
      if (!selected && data.egg_groups.length > 0) setSelected(data.egg_groups[0].name);
    } catch { setError('Failed to load egg groups.'); }
  }

  async function loadDetail(name) {
    setLoading(true);
    setDetail(null);
    try {
      const data = await fetchEggGroup(name);
      setDetail(data);
    } catch { setDetail(null); }
    finally { setLoading(false); }
  }

  return (
    <PokedexShell title="EGG GROUPS">
      {error ? (
        <View style={styles.center}>
          <Text style={styles.errorText}>{error}</Text>
        </View>
      ) : (
        <View style={styles.container}>
          {/* Group selector (horizontal scroll) */}
          <FlatList
            data={groups || []}
            horizontal
            showsHorizontalScrollIndicator={false}
            keyExtractor={g => g.name}
            contentContainerStyle={styles.groupList}
            renderItem={({ item: g }) => (
              <TouchableOpacity
                style={[styles.groupBtn, selected === g.name && styles.groupBtnActive]}
                onPress={() => setSelected(g.name)}
              >
                <Text style={[styles.groupBtnText, selected === g.name && styles.groupBtnTextActive]}>
                  {g.displayName}
                </Text>
              </TouchableOpacity>
            )}
          />

          {/* Detail */}
          {loading ? (
            <View style={styles.center}>
              <ActivityIndicator color={Colors.pokedexRed} />
            </View>
          ) : detail ? (
            <View style={styles.detailContainer}>
              <Text style={styles.detailTitle}>{detail.displayName} Group</Text>
              <Text style={styles.detailSubtitle}>{detail.pokemon.length} Pokémon (Gen 1–3)</Text>
              <FlatList
                data={detail.pokemon}
                numColumns={3}
                keyExtractor={p => String(p.id)}
                contentContainerStyle={styles.pokemonGrid}
                renderItem={({ item: p }) => (
                  <TouchableOpacity
                    style={styles.pokemonCard}
                    onPress={() => navigation.navigate('PokemonDetail', { nameOrId: p.name })}
                  >
                    <Text style={styles.pokemonId}>#{String(p.id).padStart(3, '0')}</Text>
                    <Text style={styles.pokemonName} numberOfLines={1}>
                      {p.name.charAt(0).toUpperCase() + p.name.slice(1)}
                    </Text>
                  </TouchableOpacity>
                )}
              />
            </View>
          ) : (
            <View style={styles.center}>
              <Text style={styles.emptyText}>Select an egg group</Text>
            </View>
          )}
        </View>
      )}
    </PokedexShell>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  center:    { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 20 },
  errorText: { fontFamily: 'PokemonGB', fontSize: 8, color: '#FF4444', textAlign: 'center' },
  emptyText: { fontFamily: 'PokemonGB', fontSize: 8, color: '#666', textAlign: 'center' },

  groupList: { padding: 8 },
  groupBtn: {
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 4,
    backgroundColor: '#1C1C1C',
    marginRight: 6,
    borderWidth: 1,
    borderColor: '#333',
  },
  groupBtnActive: { backgroundColor: Colors.pokedexRed, borderColor: Colors.pokedexRedLight },
  groupBtnText:   { fontFamily: 'PokemonGB', fontSize: 7, color: '#888' },
  groupBtnTextActive: { color: '#FFF' },

  detailContainer: { flex: 1, paddingHorizontal: 12 },
  detailTitle: { fontFamily: 'PokemonGB', fontSize: 11, color: '#FFF', marginBottom: 2 },
  detailSubtitle: { fontFamily: 'PokemonGB', fontSize: 7, color: '#888', marginBottom: 10 },

  pokemonGrid: { paddingBottom: 16 },
  pokemonCard: {
    flex: 1 / 3,
    backgroundColor: '#1C1C1C',
    borderRadius: 6,
    padding: 8,
    margin: 3,
    borderWidth: 1,
    borderColor: '#2A2A2A',
    alignItems: 'center',
  },
  pokemonId:   { fontFamily: 'PokemonGB', fontSize: 6, color: '#666', marginBottom: 2 },
  pokemonName: { fontFamily: 'PokemonGB', fontSize: 7, color: '#FFF', textAlign: 'center' },
});
