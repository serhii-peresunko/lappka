/**
 * Google Sans Flex, one family name per weight (custom fonts on React Native are picked by
 * family name, not by fontWeight).
 */
export const FONT_FAMILIES = {
  400: 'GoogleSansFlex_400Regular',
  500: 'GoogleSansFlex_500Medium',
  600: 'GoogleSansFlex_600SemiBold',
  700: 'GoogleSansFlex_700Bold',
} as const;

type Weight = keyof typeof FONT_FAMILIES;

/** The font family for a style's fontWeight ("600", 600, "bold", undefined ...). */
export function fontFamilyFor(weight: string | number | undefined): string {
  const n = weight === 'bold' ? 700 : weight === 'normal' || weight === undefined ? 400 : Number(weight);
  const w = (n >= 650 ? 700 : n >= 550 ? 600 : n >= 450 ? 500 : 400) as Weight;
  return FONT_FAMILIES[w];
}
