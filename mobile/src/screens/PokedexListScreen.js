import React, { useState, useEffect, useCallback, useMemo } from 'react';
import {
  View, Text, FlatList, TextInput, TouchableOpacity,
  Image, StyleSheet, ActivityIndicator,
} from 'react-native';
import { Colors } from '../theme/colors';
import TypeBadge from '../components/TypeBadge';
import PokedexShell from '../components/PokedexShell';
import { fetchPokemonList, fetchPokemon } from '../services/api';

const PAGE_SIZE = 151;

export default function PokedexListScreen({ navigation }) {
  const [pokemonList, setPokemonList] = useState([]);
  const [loading,     setLoading]     = useState(true);
  const [error,       setError]       = useState(null);
  const [search,      setSearch]      = useState('');
  const [generation,  setGeneration]  = useState('kanto'); // kanto | national

  useEffect(() => {
    loadList();
  }, [generation]);

  async function loadList() {
    setLoading(true);
    setError(null);
    try {
      const limit  = generation === 'kanto' ? 151 : 251;
      const result = await fetchPokemonList(limit, 0);
      // Enrich with basic data (types + sprites) in batches
      const enriched = await enrichList(result.results);
      setPokemonList(enriched);
    } catch (e) {
      setError('Failed to load Pokédex. Is the API running?');
    } finally {
      setLoading(false);
    }
  }

  async function enrichList(list) {
    // Fetch all in parallel — API caches these so it's fast on second load
    const results = await Promise.allSettled(list.map(p => fetchPokemon(p.id || p.name)));
    return results
      .map((r, i) => r.status === 'fulfilled' ? r.value : { name: list[i].name, id: list[i].id })
      .filter(Boolean);
  }

  const filtered = useMemo(() => {
    if (!search.trim()) return pokemonList;
    const q = search.toLowerCase().trim();
    return pokemonList.filter(p =>
      p.name?.includes(q) ||
      String(p.id)?.includes(q)
    );
  }, [pokemonList, search]);

  const renderItem = useCallback(({ item }) => (
    <TouchableOpacity
      style={styles.card}
      onPress={() => navigation.navigate('PokemonDetail', { nameOrId: item.name, displayName: item.displayName })}
      activeOpacity={0.75}
    >
      <Text style={styles.idText}>#{String(item.id).padStart(3, '0')}</Text>
      {item.sprite ? (
        <Image source={{ uri: item.sprite }} style={styles.sprite} />
      ) : (
        <View style={styles.spritePlaceholder} />
      )}
      <View style={styles.info}>
        <Text style={styles.nameText}>{item.displayName || item.name}</Text>
        <View style={styles.types}>
          {(item.types || []).map(t => <TypeBadge key={t} type={t} small />)}
        </View>
      </View>
      <Text style={styles.arrow}>▶</Text>
    </TouchableOpacity>
  ), [navigation]);

  return (
    <PokedexShell title="POKÉDEX">
      {/* ── Search bar ─────────────────────────────────────────────────── */}
      <View style={styles.searchBar}>
        <Text style={styles.searchIcon}>🔍</Text>
        <TextInput
          style={styles.searchInput}
          placeholder="Search name or #..."
          placeholderTextColor="#666"
          value={search}
          onChangeText={setSearch}
          returnKeyType="search"
        />
      </View>

      {/* ── Generation tabs ─────────────────────────────────────────────── */}
      <View style={styles.tabs}>
        {[['kanto', 'KANTO #1–151'], ['national', 'NAT DEX #1–251']].map(([key, label]) => (
          <TouchableOpacity
            key={key}
            style={[styles.tab, generation === key && styles.tabActive]}
            onPress={() => setGeneration(key)}
          >
            <Text style={[styles.tabText, generation === key && styles.tabTextActive]}>
              {label}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* ── List ────────────────────────────────────────────────────────── */}
      {loading ? (
        <View style={styles.center}>
          <ActivityIndicator size="large" color={Colors.pokedexRed} />
          <Text style={styles.loadingText}>Loading Pokédex data...</Text>
        </View>
      ) : error ? (
        <View style={styles.center}>
          <Text style={styles.errorText}>{error}</Text>
          <TouchableOpacity style={styles.retryBtn} onPress={loadList}>
            <Text style={styles.retryText}>RETRY</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <FlatList
          data={filtered}
          keyExtractor={item => String(item.id)}
          renderItem={renderItem}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
          ListEmptyComponent={
            <Text style={styles.emptyText}>No Pokémon found</Text>
          }
        />
      )}
    </PokedexShell>
  );
}

const styles = StyleSheet.create({
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#1A1A1A',
    margin: 10,
    borderRadius: 6,
    paddingHorizontal: 10,
    borderWidth: 1,
    borderColor: '#333',
  },
  searchIcon: { fontSize: 14, marginRight: 6 },
  searchInput: {
    flex: 1,
    height: 38,
    fontFamily: 'PokemonGB',
    fontSize: 9,
    color: '#FFFFFF',
  },
  tabs: {
    flexDirection: 'row',
    marginHorizontal: 10,
    marginBottom: 6,
    gap: 6,
  },
  tab: {
    flex: 1,
    paddingVertical: 6,
    borderRadius: 4,
    backgroundColor: '#2A2A2A',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#444',
  },
  tabActive: {
    backgroundColor: Colors.pokedexRed,
    borderColor: Colors.pokedexRedLight,
  },
  tabText: {
    fontFamily: 'PokemonGB',
    fontSize: 6,
    color: '#888',
  },
  tabTextActive: { color: '#FFF' },
  listContent: { paddingHorizontal: 8, paddingBottom: 16 },
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#1C1C1C',
    borderRadius: 6,
    marginVertical: 3,
    paddingVertical: 6,
    paddingHorizontal: 10,
    borderWidth: 1,
    borderColor: '#2A2A2A',
  },
  idText: {
    fontFamily: 'PokemonGB',
    fontSize: 7,
    color: '#666',
    width: 30,
  },
  sprite: {
    width: 48,
    height: 48,
    resizeMode: 'contain',
  },
  spritePlaceholder: {
    width: 48,
    height: 48,
    backgroundColor: '#2A2A2A',
    borderRadius: 24,
  },
  info: { flex: 1, marginLeft: 8 },
  nameText: {
    fontFamily: 'PokemonGB',
    fontSize: 10,
    color: '#FFFFFF',
    marginBottom: 4,
  },
  types: { flexDirection: 'row' },
  arrow: {
    fontFamily: 'PokemonGB',
    fontSize: 10,
    color: Colors.pokedexRed,
  },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 20 },
  loadingText: {
    fontFamily: 'PokemonGB',
    fontSize: 8,
    color: '#888',
    marginTop: 12,
  },
  errorText: {
    fontFamily: 'PokemonGB',
    fontSize: 8,
    color: '#FF4444',
    textAlign: 'center',
    marginBottom: 16,
  },
  retryBtn: {
    backgroundColor: Colors.pokedexRed,
    paddingHorizontal: 20,
    paddingVertical: 8,
    borderRadius: 4,
  },
  retryText: {
    fontFamily: 'PokemonGB',
    fontSize: 9,
    color: '#FFF',
  },
  emptyText: {
    fontFamily: 'PokemonGB',
    fontSize: 9,
    color: '#666',
    textAlign: 'center',
    marginTop: 40,
  },
});
