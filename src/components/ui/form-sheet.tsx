import type { PropsWithChildren } from 'react';
import { KeyboardAvoidingView, Platform, Pressable, ScrollView, StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';
import { useI18n } from '@/i18n/i18n-provider';

type FormSheetProps = PropsWithChildren<{
  title: string;
  onCancel: () => void;
  onSave: () => void;
  saveLabel?: string;
}>;

/** Modal form layout with Cancel / title / Save in a top bar. */
export function FormSheet({ title, onCancel, onSave, saveLabel, children }: FormSheetProps) {
  const theme = useTheme();
  const { t } = useI18n();
  return (
    <ThemedView style={styles.root}>
      <SafeAreaView style={styles.root} edges={Platform.OS === 'ios' ? ['bottom'] : ['top', 'bottom']}>
        <View style={[styles.bar, { borderBottomColor: theme.border }]}>
          <Pressable accessibilityRole="button" hitSlop={8} onPress={onCancel} style={styles.barButton}>
            <ThemedText themeColor="textSecondary">{t.common.cancel}</ThemedText>
          </Pressable>
          <ThemedText type="smallBold" style={styles.barTitle} numberOfLines={1}>
            {title}
          </ThemedText>
          <Pressable
            accessibilityRole="button"
            hitSlop={8}
            onPress={onSave}
            style={[styles.barButton, styles.barButtonRight]}>
            <ThemedText type="smallBold" style={{ color: theme.primary, fontSize: 16 }}>
              {saveLabel ?? t.common.save}
            </ThemedText>
          </Pressable>
        </View>
        <KeyboardAvoidingView
          style={styles.root}
          behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
          <ScrollView contentContainerStyle={styles.scroll} keyboardShouldPersistTaps="handled">
            <View style={styles.content}>{children}</View>
          </ScrollView>
        </KeyboardAvoidingView>
      </SafeAreaView>
    </ThemedView>
  );
}

export function FieldLabel({ children }: PropsWithChildren) {
  return <ThemedText type="smallBold">{children}</ThemedText>;
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
  },
  bar: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: Spacing.three,
    paddingVertical: Spacing.three,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  barButton: {
    minWidth: 64,
  },
  barButtonRight: {
    alignItems: 'flex-end',
  },
  barTitle: {
    flex: 1,
    textAlign: 'center',
    fontSize: 17,
  },
  scroll: {
    padding: Spacing.three + Spacing.one,
    paddingBottom: Spacing.six,
  },
  content: {
    width: '100%',
    maxWidth: 560,
    alignSelf: 'center',
    gap: Spacing.three + Spacing.one,
  },
});
