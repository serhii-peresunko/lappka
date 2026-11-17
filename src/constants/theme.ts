/**
 * Below are the colors that are used in the app. The colors are defined in the light and dark mode.
 * There are many other ways to style your app. For example, [Nativewind](https://www.nativewind.dev/), [Tamagui](https://tamagui.dev/), [unistyles](https://unistyl.es/), etc.
 */

import '@/global.css';

import { Platform } from 'react-native';

export const Colors = {
  // Warm cream background, white cards and an orange accent.
  light: {
    text: '#1F1A17',
    background: '#FBF4EC',
    backgroundElement: '#FFFFFF',
    backgroundSelected: '#F6E9DC',
    textSecondary: '#7A6E64',
    border: '#EEE1D3',
    primary: '#E8700F',
    onPrimary: '#FFFFFF',
    primarySoft: '#FDE7D3',
    danger: '#D63A2B',
    success: '#2E9A57',
    successSoft: '#E3F4E8',
  },
  dark: {
    text: '#F7F1EB',
    background: '#17120E',
    backgroundElement: '#241D18',
    backgroundSelected: '#30271F',
    textSecondary: '#B8AB9F',
    border: '#3A2F27',
    primary: '#FF8E3C',
    onPrimary: '#1F1A17',
    primarySoft: '#3D2616',
    danger: '#FF6B5E',
    success: '#5BC987',
    successSoft: '#1E3A29',
  },
} as const;

/** Soft, warm drop shadow for white cards on the cream background. */
export const CardShadow = {
  boxShadow: '0px 6px 18px rgba(150, 95, 40, 0.10)',
} as const;

export type ThemeColor = keyof typeof Colors.light & keyof typeof Colors.dark;

export const Fonts = Platform.select({
  ios: {
    /** iOS `UIFontDescriptorSystemDesignDefault` */
    sans: 'system-ui',
    /** iOS `UIFontDescriptorSystemDesignSerif` */
    serif: 'ui-serif',
    /** iOS `UIFontDescriptorSystemDesignRounded` */
    rounded: 'ui-rounded',
    /** iOS `UIFontDescriptorSystemDesignMonospaced` */
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

/** Space to leave under scrolling content so it clears the floating tab bar. */
export const BottomTabInset = 120;
export const MaxContentWidth = 800;
