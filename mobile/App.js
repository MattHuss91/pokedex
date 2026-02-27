import React from 'react';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import AppNavigator from './src/navigation/AppNavigator';

/**
 * Root component.
 *
 * Font setup:
 *   1. Download "Pokemon GB.ttf" (free / fan-made pixel font)
 *   2. Place it in: android/app/src/main/assets/fonts/PokemonGB.ttf
 *   3. Run: npx react-native-asset   (links fonts automatically)
 *   4. Rebuild the app
 *
 *   If you skip the font step, add { fontFamily: undefined } overrides
 *   in theme/typography.js and remove fontFamily from all styles.
 */
export default function App() {
  return (
    <SafeAreaProvider>
      <AppNavigator />
    </SafeAreaProvider>
  );
}
