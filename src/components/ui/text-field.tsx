import { useState, type Ref } from 'react';
import { StyleSheet, TextInput, View, type TextInputInstance, type TextInputProps } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { Spacing } from '@/constants/theme';
import { fontFamilyFor } from '@/constants/typography';
import { useTheme } from '@/hooks/use-theme';

export type TextFieldProps = Omit<TextInputProps, 'ref'> & {
  ref?: Ref<TextInputInstance>;
  label: string;
  error?: string;
  hint?: string;
};

export function TextField({ ref, label, error, hint, style, onFocus, onBlur, ...rest }: TextFieldProps) {
  const theme = useTheme();
  const [focused, setFocused] = useState(false);

  return (
    <View style={styles.wrapper}>
      <ThemedText style={styles.label}>
        {label}
      </ThemedText>
      <TextInput
        ref={ref}
        aria-label={label}
        placeholderTextColor={theme.textSecondary}
        style={[
          styles.input,
          {
            color: theme.text,
            backgroundColor: theme.surface,
            borderColor: error ? theme.danger : focused ? theme.text : 'transparent',
          },
          style,
        ]}
        onFocus={(event) => {
          setFocused(true);
          onFocus?.(event);
        }}
        onBlur={(event) => {
          setFocused(false);
          onBlur?.(event);
        }}
        {...rest}
      />
      {error ? (
        <ThemedText type="small" style={{ color: theme.danger }}>
          {error}
        </ThemedText>
      ) : hint ? (
        <ThemedText type="small" themeColor="textSecondary">
          {hint}
        </ThemedText>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  label: { color: '#6E6E73', fontSize: 13, lineHeight: 17, fontWeight: '600' },
  wrapper: {
    gap: Spacing.one + Spacing.half,
  },
  input: {
    minHeight: 52,
    borderWidth: 1.5,
    borderRadius: 16,
    paddingHorizontal: Spacing.three,
    paddingVertical: Spacing.two + Spacing.one,
    fontSize: 16,
    fontFamily: fontFamilyFor(500),
    // The border already shows focus; drop the browser's extra outline on web.
    outlineWidth: 0,
  },
});
