import type { ReactNode } from 'react';
import { ActivityIndicator, Pressable, StyleSheet, View, type PressableProps } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';

type ButtonProps = Omit<PressableProps, 'children' | 'style'> & {
  title: string;
  variant?: 'primary' | 'outline' | 'dark';
  loading?: boolean;
  icon?: ReactNode;
};

export function Button({ title, variant = 'primary', loading, icon, disabled, ...rest }: ButtonProps) {
  const theme = useTheme();
  const off = disabled || loading;

  const colors = {
    primary: { background: theme.primary, text: theme.onPrimary, border: theme.primary },
    outline: { background: theme.background, text: theme.text, border: theme.border },
    // Apple asks for a black button on light backgrounds and a white one on dark.
    dark: { background: theme.text, text: theme.background, border: theme.text },
  }[variant];

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityState={{ disabled: !!off, busy: !!loading }}
      disabled={off}
      style={({ pressed }) => [
        styles.base,
        { backgroundColor: colors.background, borderColor: colors.border },
        pressed && { opacity: 0.85 },
        off && { opacity: 0.5 },
      ]}
      {...rest}>
      {loading ? (
        <ActivityIndicator color={colors.text} />
      ) : (
        <View style={styles.content}>
          {icon}
          <ThemedText type="smallBold" style={[styles.label, { color: colors.text }]}>
            {title}
          </ThemedText>
        </View>
      )}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  base: {
    minHeight: 52,
    borderRadius: 14,
    borderWidth: 1,
    paddingHorizontal: Spacing.three,
    alignItems: 'center',
    justifyContent: 'center',
  },
  content: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.two,
  },
  label: {
    fontSize: 16,
  },
});
