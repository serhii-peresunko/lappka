import type { PropsWithChildren, ReactNode } from 'react';
import { KeyboardAvoidingView, Platform, ScrollView, StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { Spacing } from '@/constants/theme';

type FormScreenProps = PropsWithChildren<{
  title: string;
  subtitle?: string;
  /** Small label above the title, e.g. "Step 2 of 3". */
  eyebrow?: string;
  footer?: ReactNode;
}>;

/** One column of content: heading, scrollable form, pinned footer. Used by every screen here. */
export function FormScreen({ title, subtitle, eyebrow, footer, children }: FormScreenProps) {
  return (
    <ThemedView style={styles.root}>
      <SafeAreaView style={styles.root} edges={['top', 'bottom']}>
        <KeyboardAvoidingView style={styles.root} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
          <ScrollView
            contentContainerStyle={styles.scroll}
            keyboardShouldPersistTaps="handled"
            keyboardDismissMode="on-drag"
            showsVerticalScrollIndicator={false}>
            <View style={styles.content}>
              <View style={styles.heading}>
                {eyebrow ? (
                  <ThemedText type="small" themeColor="textSecondary">
                    {eyebrow}
                  </ThemedText>
                ) : null}
                <ThemedText type="subtitle">{title}</ThemedText>
                {subtitle ? <ThemedText themeColor="textSecondary">{subtitle}</ThemedText> : null}
              </View>
              {children}
            </View>
          </ScrollView>
          {footer ? (
            <View style={styles.footer}>
              <View style={styles.footerInner}>{footer}</View>
            </View>
          ) : null}
        </KeyboardAvoidingView>
      </SafeAreaView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
  },
  scroll: {
    flexGrow: 1,
    paddingHorizontal: Spacing.four,
    paddingVertical: Spacing.four,
  },
  content: {
    width: '100%',
    maxWidth: 460,
    alignSelf: 'center',
    gap: Spacing.four,
  },
  heading: {
    gap: Spacing.two,
  },
  footer: {
    paddingHorizontal: Spacing.four,
    paddingBottom: Spacing.three,
    paddingTop: Spacing.two,
  },
  footerInner: {
    width: '100%',
    maxWidth: 460,
    alignSelf: 'center',
    gap: Spacing.two,
  },
});
