import '@/global.css';

import { Platform } from 'react-native';

export const Colors = {
  light: {
    text: '#0B1220',
    textSecondary: '#5B6472',
    background: '#F4F6F9',
    backgroundElement: '#FFFFFF',
    backgroundSelected: '#E4EAF2',
    border: '#E1E6EE',
    primary: '#14365C',
    onPrimary: '#FFFFFF',
    accent: '#F28C28',
    success: '#1E8E5A',
    warning: '#B97A00',
    danger: '#C62828',
    info: '#2F6FED',
  },
  dark: {
    text: '#F3F5F8',
    textSecondary: '#A7B0BC',
    background: '#0B1220',
    backgroundElement: '#172033',
    backgroundSelected: '#223049',
    border: '#2A3650',
    primary: '#9DBBE3',
    onPrimary: '#0B1220',
    accent: '#F5A24F',
    success: '#4CC38A',
    warning: '#E2B23A',
    danger: '#F08080',
    info: '#7AA2F7',
  },
} as const;

export type ThemeColor = keyof typeof Colors.light & keyof typeof Colors.dark;

export const Fonts = Platform.select({
  ios: {
    sans: 'system-ui',
    serif: 'ui-serif',
    rounded: 'ui-rounded',
    mono: 'ui-monospace',
  },
  default: {
    sans: 'normal',
    serif: 'serif',
    rounded: 'normal',
    mono: 'monospace',
  },
  web: {
    sans: 'var(--font-display)',
    serif: 'var(--font-serif)',
    rounded: 'var(--font-rounded)',
    mono: 'var(--font-mono)',
  },
});

export const Spacing = {
  half: 2,
  one: 4,
  two: 8,
  three: 16,
  four: 24,
  five: 32,
  six: 64,
} as const;

export const Radius = {
  sm: 8,
  md: 14,
  lg: 20,
  pill: 999,
} as const;

export const BottomTabInset = Platform.select({ ios: 50, android: 80 }) ?? 0;
export const MaxContentWidth = 800;
