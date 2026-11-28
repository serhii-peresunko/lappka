import type { ReactNode } from 'react';
import { ActivityIndicator, Pressable, StyleSheet, View, type PressableProps } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';

type ButtonProps = Omit<PressableProps, 'children' | 'style'> & {
  title: string;
  variant?: 'primary' | 'outline' | 'dark' | 'danger';
  loading?: boolean;
  icon?: ReactNode;
};

export function Button({ title, variant = 'primary', loading, icon, disabled, ...rest }: ButtonProps) {
  const theme = useTheme();
  const off = disabled || loading;

  const colors = {
    // The coral accent for the main action.
    primary: { background: theme.primary, text: theme.onPrimary, border: theme.primary },
    outline: { background: theme.surface, text: theme.text, border: theme.surface },
    danger: { background: theme.surface, text: theme.danger, border: theme.surface },
    // Apple asks for a black button on light backgrounds and a white one on dark.
    dark: { background: theme.primary, text: theme.onPrimary, border: theme.primary },
  }[variant];

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityState={{ disabled: !!off, busy: !!loading }}
      disabled={off}
      style={({ pressed }) => [
        styles.base,
        { backgroundColor: colors.background, borderColor: colors.border },
        pressed && { opacity: 0.85, transform: [{ scale: 0.98 }] },
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
    minHeight: 54,
    borderRadius: 999,
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
