import { Link, useRouter } from 'expo-router';
import { SymbolView, type SymbolViewProps } from 'expo-symbols';
import { StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { Button } from '@/components/ui/button';
import { LanguageSwitch } from '@/components/ui/language-switch';
import { PawDecor } from '@/components/ui/paw-decor';
import { CardShadow, Spacing } from '@/constants/theme';
import { CATEGORIES } from '@/data/care';
import { useTheme } from '@/hooks/use-theme';
import { useI18n } from '@/i18n/i18n-provider';

export default function WelcomeScreen() {
  const theme = useTheme();
  const router = useRouter();
  const { t } = useI18n();

  return (
    <ThemedView style={styles.root}>
      <PawDecor
        color={theme.primary}
        opacity={0.18}
        paws={[
          { top: 90, right: 36, size: 44, rotate: 20 },
          { top: '52%', left: 18, size: 30, rotate: -25 },
          { bottom: 170, right: 24, size: 26, rotate: 35 },
        ]}
      />
      <SafeAreaView style={styles.root} edges={['top', 'bottom']}>
        <View style={styles.topBar}>
          <LanguageSwitch />
        </View>

        <View style={styles.content}>
          <View style={styles.headline}>
            <ThemedText type="title" style={styles.title}>
              {t.welcome.titleLine}
            </ThemedText>
            <View style={styles.accentRow}>
              <ThemedText type="title" style={[styles.title, { color: theme.primary }]}>
                {t.welcome.titleAccent}
              </ThemedText>
              <SymbolView
                name={{ ios: 'heart', android: 'favorite', web: 'favorite' }}
                tintColor={theme.primary}
                size={32}
              />
            </View>
            <ThemedText themeColor="textSecondary" style={styles.subtitle}>
              {t.welcome.subtitle}
            </ThemedText>
          </View>

          <View style={styles.hero}>
            <View style={[styles.blob, { backgroundColor: theme.primarySoft }]} />
            <View style={[styles.circle, { backgroundColor: theme.primary }]}>
              <SymbolView
                name={{ ios: 'pawprint.fill', android: 'pets', web: 'pets' }}
                tintColor={theme.onPrimary}
                size={96}
              />
            </View>
            <Badge style={styles.badgeTopLeft} icon={CATEGORIES.vaccination.icon} color={CATEGORIES.vaccination.color} />
            <Badge style={styles.badgeTopRight} icon={CATEGORIES.grooming.icon} color={CATEGORIES.grooming.color} />
            <Badge style={styles.badgeBottomLeft} icon={CATEGORIES.medication.icon} color={CATEGORIES.medication.color} />
            <Badge
              style={styles.badgeBottomRight}
              icon={{ ios: 'calendar', android: 'calendar_month', web: 'calendar_month' }}
              color={theme.primary}
            />
          </View>
        </View>

        <View style={styles.actions}>
          <Button
            title={t.welcome.start}
            icon={
              <SymbolView
                name={{ ios: 'pawprint.fill', android: 'pets', web: 'pets' }}
                tintColor={theme.onPrimary}
                size={20}
              />
            }
            onPress={() => router.push('/sign-up')}
          />
          <View style={styles.footer}>
            <ThemedText type="small" themeColor="textSecondary">
              {t.welcome.haveAccount}{' '}
            </ThemedText>
            <Link href="/sign-in">
              <ThemedText type="smallBold" themeColor="primary">
                {t.welcome.signIn}
              </ThemedText>
            </Link>
          </View>
        </View>
      </SafeAreaView>
    </ThemedView>
  );
}

function Badge({ icon, color, style }: { icon: SymbolViewProps['name']; color: string; style: object }) {
  const theme = useTheme();
  return (
    <View style={[styles.badge, CardShadow, { backgroundColor: theme.backgroundElement }, style]}>
      <SymbolView name={icon} tintColor={color} size={24} />
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
  },
  topBar: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    paddingHorizontal: Spacing.three,
    paddingTop: Spacing.two,
  },
  content: {
    flex: 1,
    width: '100%',
    maxWidth: 480,
    alignSelf: 'center',
    paddingHorizontal: Spacing.four,
    gap: Spacing.four,
  },
  headline: {
    gap: Spacing.one,
    marginTop: Spacing.three,
  },
  title: {
    fontSize: 36,
    lineHeight: 42,
    fontWeight: 800,
  },
  accentRow: {
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: Spacing.two,
  },
  subtitle: {
    fontSize: 17,
    lineHeight: 25,
    marginTop: Spacing.two,
  },
  hero: {
    flex: 1,
    minHeight: 240,
    alignItems: 'center',
    justifyContent: 'center',
  },
  blob: {
    position: 'absolute',
    width: 280,
    height: 250,
    borderTopLeftRadius: 140,
    borderTopRightRadius: 110,
    borderBottomLeftRadius: 120,
    borderBottomRightRadius: 150,
    transform: [{ rotate: '-8deg' }],
  },
  circle: {
    width: 176,
    height: 176,
    borderRadius: 88,
    alignItems: 'center',
    justifyContent: 'center',
  },
  badge: {
    position: 'absolute',
    width: 54,
    height: 54,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
  },
  badgeTopLeft: { top: '14%', left: '8%', transform: [{ rotate: '-8deg' }] },
  badgeTopRight: { top: '8%', right: '10%', transform: [{ rotate: '10deg' }] },
  badgeBottomLeft: { bottom: '10%', left: '12%', transform: [{ rotate: '6deg' }] },
  badgeBottomRight: { bottom: '16%', right: '6%', transform: [{ rotate: '-10deg' }] },
  actions: {
    width: '100%',
    maxWidth: 480,
    alignSelf: 'center',
    paddingHorizontal: Spacing.four,
    paddingBottom: Spacing.three,
    gap: Spacing.three,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'center',
    flexWrap: 'wrap',
  },
});
