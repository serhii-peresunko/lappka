import { Pressable, ScrollView, StyleSheet, View } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';

type ChipProps = {
  label: string;
  selected?: boolean;
  /** Optional accent (e.g. a category color) used for the dot and selected state. */
  color?: string;
  onPress?: () => void;
};

export function Chip({ label, selected, color, onPress }: ChipProps) {
  const theme = useTheme();
  const accent = color ?? theme.primary;

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityState={{ selected: !!selected }}
      onPress={onPress}
      style={({ pressed }) => [
        styles.chip,
        {
          borderColor: selected ? accent : theme.border,
          backgroundColor: selected ? `${accent}1F` : theme.backgroundElement,
        },
        pressed && styles.pressed,
      ]}>
      {color ? <View style={[styles.dot, { backgroundColor: color }]} /> : null}
      <ThemedText type="small" style={{ color: selected ? theme.text : theme.textSecondary }}>
        {label}
      </ThemedText>
    </Pressable>
  );
}

type ChipOption<T extends string> = { value: T; label: string; color?: string };

type ChipGroupProps<T extends string> = {
  options: ChipOption<T>[];
  value: T;
  onChange: (value: T) => void;
  /** Scroll horizontally instead of wrapping onto new lines. */
  scroll?: boolean;
};

export function ChipGroup<T extends string>({ options, value, onChange, scroll }: ChipGroupProps<T>) {
  const chips = options.map((option) => (
    <Chip
      key={option.value}
      label={option.label}
      color={option.color}
      selected={option.value === value}
      onPress={() => onChange(option.value)}
    />
  ));

  if (scroll) {
    return (
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.row}
        style={styles.scroll}>
        {chips}
      </ScrollView>
    );
  }
  return <View style={[styles.row, styles.wrap]}>{chips}</View>;
}

const styles = StyleSheet.create({
  chip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.one + Spacing.half,
    paddingHorizontal: Spacing.three - Spacing.one,
    paddingVertical: Spacing.one + Spacing.half,
    borderRadius: 999,
    borderWidth: 1,
  },
  pressed: {
    opacity: 0.75,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  row: {
    flexDirection: 'row',
    gap: Spacing.two,
  },
  wrap: {
    flexWrap: 'wrap',
  },
  scroll: {
    flexGrow: 0,
  },
});
