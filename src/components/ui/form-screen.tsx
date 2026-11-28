import type { PropsWithChildren, ReactNode } from 'react';
import { KeyboardAvoidingView, Platform, ScrollView, StyleSheet, View } from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { IconButton } from '@/components/ui/icon-button';
import { Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';
import { useI18n } from '@/i18n';

type FormScreenProps = PropsWithChildren<{
  title: string;
  subtitle?: string;
  /** Small label above the title, e.g. "Step 2 of 3". */
  eyebrow?: string;
  /** Onboarding step (1 to 3): draws the progress bar above the heading. */
  step?: number;
  footer?: ReactNode;
  /** Sit the content at the bottom of the screen, within thumb reach. */
  bottom?: boolean;
  /** Shows a back button at the top. */
  onBack?: () => void;
  /** Shows a close button beside the title (for sheets). */
  onClose?: () => void;
  /** Inside a bottom sheet: the scroll view pads itself for the keyboard instead of KeyboardAvoidingView. */
  sheet?: boolean;
}>;

/** One column of content: heading, scrollable form, pinned footer. Used by every screen here. */
export function FormScreen({ title, subtitle, eyebrow, step, footer, bottom, onBack, onClose, sheet, children }: FormScreenProps) {
  const theme = useTheme();
  const { t } = useI18n();
  const insets = useSafeAreaInsets();
  // Only the top is protected by the safe area; the scroll runs to the very bottom edge and pads itself by the
  // home-indicator height, so content scrolls off the screen instead of being cut off above it.
  return (
    <ThemedView style={styles.root}>
      <SafeAreaView style={styles.root} edges={['top']}>
        <KeyboardAvoidingView style={styles.root} behavior={Platform.OS === 'ios' && !sheet ? 'padding' : undefined}>
          <ScrollView
            contentContainerStyle={[styles.scroll, { paddingBottom: Spacing.four + (footer ? 0 : insets.bottom) }, bottom && styles.bottom]}
            automaticallyAdjustKeyboardInsets={sheet}
            keyboardShouldPersistTaps="handled"
            keyboardDismissMode="on-drag"
            showsVerticalScrollIndicator={false}>
            <View style={styles.content}>
              {step ? (
                <View style={styles.stepRow}>
                  {onBack ? <IconButton label={t('back')} icon={{ ios: 'chevron.left', material: 'chevron_left' }} size={40} onPress={onBack} /> : null}
                  <View style={styles.stepTrack}>
                    <View style={[styles.stepFill, { width: `${(step / 3) * 100}%`, backgroundColor: theme.primary }]} />
                  </View>
                </View>
              ) : onBack ? (
                <IconButton label={t('back')} icon={{ ios: 'chevron.left', material: 'chevron_left' }} size={40} onPress={onBack} />
              ) : null}
              <View style={styles.heading}>
                {eyebrow ? (
                  <ThemedText type="smallBold" style={{ color: theme.primaryText }}>
                    {eyebrow}
                  </ThemedText>
                ) : null}
                <View style={styles.titleRow}>
                  <ThemedText type="subtitle" style={styles.title}>
                    {title}
                  </ThemedText>
                  {onClose ? <IconButton label={t('close')} icon={{ ios: 'xmark', material: 'close' }} size={44} onPress={onClose} /> : null}
                </View>
                {subtitle ? <ThemedText themeColor="textSecondary">{subtitle}</ThemedText> : null}
              </View>
              {children}
            </View>
          </ScrollView>
          {footer ? (
            <View style={[styles.footer, { paddingBottom: Spacing.three + insets.bottom }]}>
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
    paddingHorizontal: Spacing.three,
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
  titleRow: { flexDirection: 'row', alignItems: 'center', gap: Spacing.three },
  title: { flex: 1 },
  stepRow: { flexDirection: 'row', alignItems: 'center', gap: 12, minHeight: 40 },
  stepTrack: { flex: 1, height: 5, borderRadius: 3, overflow: 'hidden', backgroundColor: '#E0E1E5' },
  stepFill: { height: 5, borderRadius: 3 },
  heading: {
    gap: Spacing.two,
  },
  footer: {
    paddingHorizontal: Spacing.three,
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
