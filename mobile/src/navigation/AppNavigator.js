import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { View, Text, StyleSheet } from 'react-native';
import { Colors } from '../theme/colors';

import PokedexListScreen   from '../screens/PokedexListScreen';
import PokemonDetailScreen from '../screens/PokemonDetailScreen';
import TeamPlannerScreen   from '../screens/TeamPlannerScreen';
import MoveTutorsScreen    from '../screens/MoveTutorsScreen';
import TMDetailScreen      from '../screens/TMDetailScreen';
import EggGroupScreen      from '../screens/EggGroupScreen';

const Stack = createNativeStackNavigator();
const Tab   = createBottomTabNavigator();

// ── Pokédex tab stack ────────────────────────────────────────────────────────

function PokedexStack() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="PokedexList"   component={PokedexListScreen} />
      <Stack.Screen name="PokemonDetail" component={PokemonDetailScreen} />
      <Stack.Screen name="EggGroup"      component={EggGroupScreen} />
    </Stack.Navigator>
  );
}

// ── Team tab stack ───────────────────────────────────────────────────────────

function TeamStack() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="TeamPlanner"   component={TeamPlannerScreen} />
      <Stack.Screen name="PokemonDetail" component={PokemonDetailScreen} />
    </Stack.Navigator>
  );
}

// ── Moves tab stack ──────────────────────────────────────────────────────────

function MovesStack() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="MoveTutors"    component={MoveTutorsScreen} />
      <Stack.Screen name="TMDetail"      component={TMDetailScreen} />
      <Stack.Screen name="PokemonDetail" component={PokemonDetailScreen} />
      <Stack.Screen name="EggGroup"      component={EggGroupScreen} />
    </Stack.Navigator>
  );
}

// ── Tab icon component ───────────────────────────────────────────────────────

function TabIcon({ label, emoji, focused }) {
  return (
    <View style={[tabIconStyles.wrapper, focused && tabIconStyles.wrapperActive]}>
      <Text style={tabIconStyles.emoji}>{emoji}</Text>
      <Text style={[tabIconStyles.label, focused && tabIconStyles.labelActive]}>{label}</Text>
    </View>
  );
}

const tabIconStyles = StyleSheet.create({
  wrapper: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingTop: 4,
  },
  wrapperActive: {},
  emoji: { fontSize: 18 },
  label: {
    fontFamily: 'PokemonGB',
    fontSize: 5,
    color: '#666',
    marginTop: 1,
  },
  labelActive: { color: Colors.pokedexRed },
});

// ── Root navigator ───────────────────────────────────────────────────────────

export default function AppNavigator() {
  return (
    <NavigationContainer>
      <Tab.Navigator
        screenOptions={{
          headerShown: false,
          tabBarStyle: {
            backgroundColor: Colors.pokedexRedDark,
            borderTopColor: Colors.pokedexHinge,
            borderTopWidth: 3,
            height: 62,
            paddingBottom: 6,
          },
          tabBarActiveTintColor:   Colors.accent,
          tabBarInactiveTintColor: '#888',
          tabBarShowLabel: false,
        }}
      >
        <Tab.Screen
          name="Dex"
          component={PokedexStack}
          options={{
            tabBarIcon: ({ focused }) => <TabIcon label="POKÉDEX" emoji="📕" focused={focused} />,
          }}
        />
        <Tab.Screen
          name="Team"
          component={TeamStack}
          options={{
            tabBarIcon: ({ focused }) => <TabIcon label="TEAM" emoji="⚔️" focused={focused} />,
          }}
        />
        <Tab.Screen
          name="Moves"
          component={MovesStack}
          options={{
            tabBarIcon: ({ focused }) => <TabIcon label="MOVES" emoji="💥" focused={focused} />,
          }}
        />
        <Tab.Screen
          name="Eggs"
          component={EggGroupScreen}
          options={{
            tabBarIcon: ({ focused }) => <TabIcon label="EGG GROUPS" emoji="🥚" focused={focused} />,
          }}
        />
      </Tab.Navigator>
    </NavigationContainer>
  );
}
