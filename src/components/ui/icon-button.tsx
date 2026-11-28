import { Pressable, StyleSheet, type PressableProps } from 'react-native';

import { SymbolIcon } from '@/components/ui/symbol-icon';
import { Colors, Radius } from '@/constants/theme';

type IconButtonProps = Omit<PressableProps, 'style' | 'children'> & {
  icon: { ios: string; material: string };
  /** The button's spoken name; it has no visible text. */
  label: string;
  size?: number;
  /** "accent" is the black one, for the main action of a screen; "yellow" for the photo button. */
  tone?: 'surface' | 'accent' | 'yellow';
};

/** The round icon button. */
export function IconButton({ icon, label, size = 44, tone = 'surface', ...rest }: IconButtonProps) {
  const fill = tone === 'accent' ? Colors.light.primary : tone === 'yellow' ? Colors.light.accent : Colors.light.control;
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={label}
      style={({ pressed }) => [styles.base, { width: size, height: size, backgroundColor: fill }, pressed && styles.pressed]}
      {...rest}>
      <SymbolIcon {...icon} color={tone === 'accent' ? Colors.light.onPrimary : Colors.light.text} size={18} />
    </Pressable>
  );
}

const styles = StyleSheet.create({
  base: { borderRadius: Radius.pill, alignItems: 'center', justifyContent: 'center' },
  pressed: { opacity: 0.75, transform: [{ scale: 0.96 }] },
});
