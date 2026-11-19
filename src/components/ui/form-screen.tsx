import type { PropsWithChildren, ReactNode } from 'react';
import { SymbolView } from 'expo-symbols';
import { KeyboardAvoidingView, Platform, Pressable, ScrollView, StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';

type FormScreenProps = PropsWithChildren<{
  title: string;
  subtitle?: string;
  /** Small label above the title, e.g. "Step 2 of 3". */
  eyebrow?: string;
  footer?: ReactNode;
  /** Sit the content at the bottom of the screen, within thumb reach. */
  bottom?: boolean;
  /** Shows a back button at the top. */
  onBack?: () => void;
  /** Inside a bottom sheet: the scroll view pads itself for the keyboard instead of KeyboardAvoidingView. */
  sheet?: boolean;
}>;

/** One column of content: heading, scrollable form, pinned footer. Used by every screen here. */
export function FormScreen({ title, subtitle, eyebrow, footer, bottom, onBack, sheet, children }: FormScreenProps) {
  const theme = useTheme();
  return (
    <ThemedView style={styles.root}>
      <SafeAreaView style={styles.root} edges={['top', 'bottom']}>
        <KeyboardAvoidingView style={styles.root} behavior={Platform.OS === 'ios' && !sheet ? 'padding' : undefined}>
          <ScrollView
            contentContainerStyle={[styles.scroll, bottom && styles.bottom]}
            automaticallyAdjustKeyboardInsets={sheet}
            keyboardShouldPersistTaps="handled"
            keyboardDismissMode="on-drag"
            showsVerticalScrollIndicator={false}>
            <View style={styles.content}>
              {onBack ? (
                <Pressable
                  accessibilityRole="button"
                  accessibilityLabel="Back"
                  hitSlop={8}
                  onPress={onBack}
                  style={styles.back}>
                  <SymbolView
                    name={{ ios: 'chevron.left', android: 'chevron_left', web: 'chevron_left' }}
                    tintColor={theme.text}
                    size={20}
                  />
                </Pressable>
              ) : null}
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
  bottom: {
    justifyContent: 'flex-end',
  },
  content: {
    width: '100%',
    maxWidth: 460,
    alignSelf: 'center',
    gap: Spacing.four,
  },
  back: {
    width: 44,
    height: 44,
    marginLeft: -Spacing.two,
    alignItems: 'flex-start',
    justifyContent: 'center',
    paddingLeft: Spacing.two,
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
