import { Pressable, StyleSheet, View } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';

type Option<T extends string> = { value: T; label: string };

type ChoiceProps<T extends string> = {
  options: Option<T>[];
  value: T | null;
  onChange: (value: T) => void;
};

/** Wrapping pill options (single choice). Each pill is at least 44 px tall. */
export function ChoiceChips<T extends string>({ options, value, onChange }: ChoiceProps<T>) {
  const theme = useTheme();
  return (
    <View style={styles.wrap}>
      {options.map((option) => {
        const selected = option.value === value;
        return (
          <Pressable
            key={option.value}
            accessibilityRole="radio"
            accessibilityState={{ checked: selected }}
            onPress={() => onChange(option.value)}
            style={[
              styles.chip,
              {
                borderColor: selected ? theme.primary : theme.border,
                backgroundColor: selected ? theme.primarySoft : theme.backgroundElement,
              },
            ]}>
            <ThemedText
              type="small"
              style={{ color: selected ? theme.primaryText : theme.text, fontWeight: selected ? 700 : 500 }}>
              {option.label}
            </ThemedText>
          </Pressable>
        );
      })}
    </View>
  );
}

/** Full-width two-or-more option switch, e.g. "Sign in | Create account". */
export function Segmented<T extends string>({ options, value, onChange }: ChoiceProps<T>) {
  const theme = useTheme();
  return (
    <View style={[styles.segmented, { backgroundColor: theme.backgroundSelected }]}>
      {options.map((option) => {
        const selected = option.value === value;
        return (
          <Pressable
            key={option.value}
            accessibilityRole="tab"
            accessibilityState={{ selected }}
            onPress={() => onChange(option.value)}
            style={[styles.segment, selected && { backgroundColor: theme.background }]}>
            <ThemedText
              type="smallBold"
              style={{ color: selected ? theme.primaryText : theme.textSecondary, fontSize: 15 }}>
              {option.label}
            </ThemedText>
          </Pressable>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.two,
  },
  chip: {
    minHeight: 44,
    paddingHorizontal: Spacing.three,
    justifyContent: 'center',
    borderWidth: 1,
    borderRadius: 999,
  },
  segmented: {
    flexDirection: 'row',
    borderRadius: 14,
    padding: 4,
  },
  segment: {
    flex: 1,
    minHeight: 44,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 10,
  },
});
