// Typography — use a pixel/retro font if available, fallback to monospace
// To use a genuine pixel font, add e.g. "Press Start 2P" via react-native-google-fonts
// or bundle PokemonGB.ttf as a custom font and load it with useFonts()

export const Fonts = {
  pixel:   'PokemonGB',        // custom bundled pixel font (see README for setup)
  mono:    'Courier New',      // fallback monospace
  regular: 'System',
};

export const TextStyles = {
  heading: {
    fontFamily: 'PokemonGB',
    fontSize: 14,
    color: '#FFFFFF',
    letterSpacing: 1,
  },
  subheading: {
    fontFamily: 'PokemonGB',
    fontSize: 10,
    color: '#CCCCCC',
  },
  body: {
    fontFamily: 'PokemonGB',
    fontSize: 8,
    color: '#FFFFFF',
    lineHeight: 16,
  },
  label: {
    fontFamily: 'PokemonGB',
    fontSize: 7,
    color: '#AAAAAA',
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  stat: {
    fontFamily: 'PokemonGB',
    fontSize: 10,
    color: '#FFFFFF',
  },
};
