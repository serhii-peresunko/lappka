import Constants from 'expo-constants';
import { useRouter } from 'expo-router';
import { SymbolView, type SymbolViewProps } from 'expo-symbols';
import { useState, type ReactNode } from 'react';
import { Pressable, ScrollView, StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { Button } from '@/components/ui/button';
import { LanguageSwitch } from '@/components/ui/language-switch';
import { SectionTitle } from '@/components/ui/screen';
import { Toggle } from '@/components/ui/toggle';
import { CardShadow, Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';
import { useI18n } from '@/i18n/i18n-provider';
import { useAuth } from '@/providers/auth-provider';

const PROVIDER_NAMES = { email: 'Email', google: 'Google', apple: 'Apple' } as const;

export default function SettingsScreen() {
  const theme = useTheme();
  const router = useRouter();
  const { t } = useI18n();
  const { session, signOut } = useAuth();
  // UI only: reminders are not wired to notifications yet.
  const [reminders, setReminders] = useState(true);

  const initial = (session?.name ?? '?').trim().charAt(0).toUpperCase();
  const close = () => (router.canGoBack() ? router.back() : router.replace('/'));

  return (
    <ThemedView style={styles.root}>
      <SafeAreaView style={styles.root} edges={['top', 'bottom']}>
        <View style={styles.header}>
          <Pressable
            accessibilityRole="button"
            accessibilityLabel={t.common.close}
            hitSlop={8}
            onPress={close}
            style={({ pressed }) => [
              styles.back,
              CardShadow,
              { backgroundColor: theme.backgroundElement },
              pressed && { opacity: 0.8 },
            ]}>
            <SymbolView
              name={{ ios: 'chevron.left', android: 'chevron_left', web: 'chevron_left' }}
              tintColor={theme.text}
              size={18}
            />
          </Pressable>
          <ThemedText type="smallBold" style={styles.headerTitle}>
            {t.settings.title}
          </ThemedText>
          <View style={styles.back} />
        </View>

        <ScrollView contentContainerStyle={styles.scroll}>
          <View style={styles.content}>
            <View style={[styles.card, styles.profile, CardShadow, { backgroundColor: theme.backgroundElement }]}>
              <View style={[styles.avatar, { backgroundColor: theme.primary }]}>
                <ThemedText type="smallBold" style={[styles.avatarText, { color: theme.onPrimary }]}>
                  {initial}
                </ThemedText>
              </View>
              <View style={styles.profileText}>
                <ThemedText type="smallBold" style={styles.name}>
                  {session?.name}
                </ThemedText>
                <ThemedText type="small" themeColor="textSecondary">
                  {session?.email}
                </ThemedText>
                {session ? (
                  <ThemedText type="small" themeColor="textSecondary">
                    {t.settings.signedInWith(PROVIDER_NAMES[session.provider])}
                  </ThemedText>
                ) : null}
              </View>
            </View>

            <SectionTitle>{t.settings.preferences}</SectionTitle>
            <View style={[styles.card, CardShadow, { backgroundColor: theme.backgroundElement }]}>
              <Row
                icon={{ ios: 'globe', android: 'language', web: 'language' }}
                label={t.settings.language}
                trailing={<LanguageSwitch />}
              />
              <View style={[styles.divider, { backgroundColor: theme.border }]} />
              <Row
                icon={{ ios: 'bell.fill', android: 'notifications', web: 'notifications' }}
                label={t.settings.reminders}
                hint={t.settings.remindersHint}
                trailing={
                  <Toggle
                    accessibilityLabel={t.settings.reminders}
                    value={reminders}
                    onValueChange={setReminders}
                  />
                }
              />
            </View>

            <SectionTitle>{t.settings.about}</SectionTitle>
            <View style={[styles.card, CardShadow, { backgroundColor: theme.backgroundElement }]}>
              <Row
                icon={{ ios: 'info.circle.fill', android: 'info', web: 'info' }}
                label={t.settings.version}
                trailing={
                  <ThemedText type="small" themeColor="textSecondary">
                    {Constants.expoConfig?.version ?? '1.0.0'}
                  </ThemedText>
                }
              />
            </View>

            <View style={styles.signOut}>
              <Button variant="outline" title={t.settings.signOut} onPress={signOut} />
            </View>
          </View>
        </ScrollView>
      </SafeAreaView>
    </ThemedView>
  );
}

function Row({
  icon,
  label,
  hint,
  trailing,
}: {
  icon: SymbolViewProps['name'];
  label: string;
  hint?: string;
  trailing: ReactNode;
}) {
  const theme = useTheme();
  return (
    <View style={styles.row}>
      <View style={[styles.rowIcon, { backgroundColor: theme.primarySoft }]}>
        <SymbolView name={icon} tintColor={theme.primary} size={18} />
      </View>
      <View style={styles.rowText}>
        <ThemedText type="smallBold">{label}</ThemedText>
        {hint ? (
          <ThemedText type="small" themeColor="textSecondary">
            {hint}
          </ThemedText>
        ) : null}
      </View>
      {trailing}
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: Spacing.three + Spacing.one,
    paddingVertical: Spacing.two,
  },
  back: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: {
    flex: 1,
    textAlign: 'center',
    fontSize: 18,
  },
  scroll: {
    padding: Spacing.three + Spacing.one,
    paddingBottom: Spacing.six,
  },
  content: {
    width: '100%',
    maxWidth: 560,
    alignSelf: 'center',
    gap: Spacing.three,
  },
  card: {
    borderRadius: 20,
    padding: Spacing.three,
  },
  profile: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.three,
  },
  avatar: {
    width: 56,
    height: 56,
    borderRadius: 28,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: {
    fontSize: 22,
    lineHeight: 26,
  },
  profileText: {
    flex: 1,
    gap: 2,
  },
  name: {
    fontSize: 18,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.three,
    paddingVertical: Spacing.one,
  },
  rowIcon: {
    width: 36,
    height: 36,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  rowText: {
    flex: 1,
    gap: 2,
  },
  divider: {
    height: StyleSheet.hairlineWidth,
    marginVertical: Spacing.two,
    marginLeft: 52,
  },
  signOut: {
    marginTop: Spacing.three,
  },
});
