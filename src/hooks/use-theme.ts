import { Colors } from '@/constants/theme';

/** The app is light only, so this is a constant; kept as a hook so screens do not change if a theme comes back. */
export function useTheme() {
  return Colors.light;
}
