export const colors = {
  surface: '#050914',
  onSurface: '#FFF8E8',
  surfaceSecondary: '#0E1728',
  surfaceTertiary: '#1A263A',
  surfaceInverse: '#F8EDD2',
  onSurfaceInverse: '#09101D',
  brand: '#E9BC62',
  brandLight: '#FFE6A4',
  brandDark: '#8C5516',
  onBrand: '#171006',
  brandSecondary: '#79D2E4',
  brandTertiary: 'rgba(233,188,98,0.14)',
  onBrandTertiary: '#FFE3A0',
  success: '#57C399',
  warning: '#E9BC62',
  error: '#E06A68',
  errorSoft: 'rgba(224,106,104,0.18)',
  info: '#79D2E4',
  coral: '#F18C63',
  border: 'rgba(255,231,174,0.22)',
  borderStrong: 'rgba(255,226,153,0.52)',
  divider: 'rgba(255,255,255,0.10)',
  muted: '#B7B0A4',
  parchment: '#F0DFC0',
  midnight: '#050914',
  ink: '#07101C',
  glass: 'rgba(255,255,255,0.095)',
  glassStrong: 'rgba(7,13,27,0.78)',
  glassEdge: 'rgba(255,244,211,0.46)',
  bronze: '#A96C32',
  bronzeLight: '#D79A55',
  sandstone: '#9D6B3F',
  sandstoneLight: '#D9B27A',
  obsidian: '#262D3A',
  obsidianLight: '#596276',
};

export const spacing = { xs: 4, sm: 8, md: 12, lg: 16, xl: 24, xxl: 32, xxxl: 48 };
export const radii = { sm: 8, md: 14, lg: 22, xl: 30, pill: 999 };

export const typography = {
  eyebrow: { fontSize: 10, fontWeight: '900' as const, letterSpacing: 1.55 },
  title: { fontSize: 28, lineHeight: 34, fontWeight: '900' as const },
  display: { fontSize: 42, lineHeight: 44, fontWeight: '900' as const, letterSpacing: 1.8 },
  body: { fontSize: 14, lineHeight: 21 },
  label: { fontSize: 12, fontWeight: '900' as const, letterSpacing: 0.35 },
};

export const motion = {
  instant: 120,
  quick: 220,
  standard: 360,
  cinematic: 620,
  ambient: 11000,
  spring: { damping: 18, stiffness: 270, mass: 0.72 },
};

export const glass = {
  soft: 28,
  panel: 48,
  strong: 68,
  navigation: 76,
};

export const shadow = {
  card: {
    shadowColor: '#000000', shadowOpacity: 0.34, shadowRadius: 23,
    shadowOffset: { width: 0, height: 12 }, elevation: 12,
  },
  button: {
    shadowColor: '#000000', shadowOpacity: 0.42, shadowRadius: 13,
    shadowOffset: { width: 0, height: 8 }, elevation: 11,
  },
  glow: {
    shadowColor: '#E9BC62', shadowOpacity: 0.25, shadowRadius: 16,
    shadowOffset: { width: 0, height: 0 }, elevation: 8,
  },
};

export const AVATARS = ['🦁', '🕊️', '🔥', '🛡️', '🦅', '🐑', '🌟', '🦉', '🐳', '🦋'];
