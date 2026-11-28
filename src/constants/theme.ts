/**
 * Below are the colors that are used in the app. The app is light only.
 * There are many other ways to style your app. For example, [Nativewind](https://www.nativewind.dev/), [Tamagui](https://tamagui.dev/), [unistyles](https://unistyl.es/), etc.
 */

import '@/global.css';

import { Platform } from 'react-native';

/** From the owner's wireframe: a warm light grey page, flat grey cards with darker grey tiles inside, and black. */
export const Colors = {
  light: {
    text: '#000000',
    textSecondary: '#4A4A4A',
    textTertiary: '#8A8A8A',
    background: '#EBEAE6',
    /** Round header buttons and the tab bar. */
    control: '#E2E1DD',
    /** Cards, rows and fields. */
    surface: '#D9D9D9',
    /** Small pieces that sit on a surface. */
    raised: '#CFCFCF',
    backgroundElement: '#D9D9D9',
    backgroundSelected: '#C6C6C6',
    border: '#C9C9C9',
    primary: '#000000',
    primaryText: '#000000',
    onPrimary: '#FFFFFF',
    primarySoft: '#CFCFCF',
    hero: '#D9D9D9',
    accent: '#FFFFFF',
    gold: '#000000',
    blue: '#000000',
    blueSoft: '#CFCFCF',
    pink: '#000000',
    pinkSoft: '#CFCFCF',
    danger: '#A3281F',
    dangerSoft: '#D9D9D9',
  },
} as const;

/** One very soft shadow, for the few floating pieces (the tab bar, the add button). */
export const CARD_SHADOW = {
  shadowColor: '#000000',
  shadowOpacity: 0.08,
  shadowRadius: 16,
  shadowOffset: { width: 0, height: 6 },
  elevation: 3,
} as const;

/** Corner radii. */
export const Radius = { card: 20, tile: 12, control: 16, pill: 999 } as const;

/** Bottom space a scroll view needs so its last item clears the floating tab bar. */
export const TAB_BAR_SPACE = 120;

export type ThemeColor = keyof typeof Colors.light;

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

export const BottomTabInset = Platform.select({ ios: 50, android: 80 }) ?? 0;
export const MaxContentWidth = 800;
