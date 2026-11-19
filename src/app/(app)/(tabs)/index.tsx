import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import { useMemo } from 'react';
import { Pressable, ScrollView, StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { AchievementBadge } from '@/components/ui/achievement-badge';
import { EventCard } from '@/components/ui/event-card';
import { PetArt } from '@/components/ui/pet-art';
import { SymbolIcon } from '@/components/ui/symbol-icon';
import { Spacing, TAB_BAR_SPACE } from '@/constants/theme';
import { breedLook, breedName } from '@/data/breeds';
import { useAchievements } from '@/hooks/use-achievements';
import { useTheme } from '@/hooks/use-theme';
import { useI18n } from '@/i18n';
import { todayIso } from '@/lib/dates';
import { kindKey } from '@/lib/event-kinds';
import { useSession, type PetEvent } from '@/providers/session';

const MORE = 4;

/** Home tab, laid out as a bento grid: the next event (dark), the pet (peach), achievements, then what is coming up. */
export default function HomeScreen() {
  const theme = useTheme();
  const router = useRouter();
  const { t, lang, locale } = useI18n();
  const { session, events } = useSession();
  const { list, unlockedCount } = useAchievements();
  const pet = session?.pet;
  const look = pet ? breedLook(pet.type, pet.breed) : undefined;

  const dayLabel = (iso: string) =>
    iso === todayIso()
      ? t('today')
      : new Date(`${iso}T12:00:00`).toLocaleDateString(locale, { weekday: 'short', day: 'numeric', month: 'short' });
  const whenLabel = (event: PetEvent) => `${dayLabel(event.date)}${event.time ? ` · ${event.time}` : ''}`;

  // "четвер, 19 листопада" -> "Четвер, 19 листопада"
  const todayRaw = new Date().toLocaleDateString(locale, { weekday: 'long', day: 'numeric', month: 'long' });
  const todayLabel = todayRaw.charAt(0).toUpperCase() + todayRaw.slice(1);

  const upcoming = useMemo(() => {
    const today = todayIso();
    return events
      .filter((event) => event.date >= today)
      .sort((a, b) => `${a.date} ${a.time ?? ''}`.localeCompare(`${b.date} ${b.time ?? ''}`));
  }, [events]);
  const next = upcoming[0];
  const rest = upcoming.slice(1, 1 + MORE);
  const pairs = Array.from({ length: Math.ceil(rest.length / 2) }, (_, i) => rest.slice(i * 2, i * 2 + 2));
  const shownBadges = list.filter((item) => item.unlocked).slice(0, 5);

  return (
    <ThemedView style={styles.root}>
      {/* A soft peach glow behind the header, fading into the page. */}
      <LinearGradient colors={['#FFE6D2', '#FFF6EE', '#FFFFFF']} style={styles.glow} pointerEvents="none" />
      <SafeAreaView style={styles.root} edges={['top']}>
        <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
          <View style={styles.content}>
            <View>
              <ThemedText type="subtitle">{t('home.hi', { name: session?.ownerName ?? '' })}</ThemedText>
              <ThemedText themeColor="textSecondary">
                {todayLabel}
              </ThemedText>
            </View>

            <View style={styles.bento}>
              <LinearGradient colors={['#34343A', '#0B0B0D']} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={styles.next}>
                <ThemedText type="small" style={styles.onDarkMuted}>
                  {t('home.nextUp')}
                </ThemedText>
                {next ? (
                  <>
                    <ThemedText style={styles.nextTitle} numberOfLines={3}>
                      {next.title}
                    </ThemedText>
                    <View>
                      <ThemedText type="small" style={styles.onDarkMuted}>
                        {t(kindKey(next.kind))}
                      </ThemedText>
                      <ThemedText type="smallBold" style={styles.onDark}>
                        {whenLabel(next)}
                      </ThemedText>
                    </View>
                  </>
                ) : (
                  <ThemedText style={styles.nextTitle}>{t('home.nothing')}</ThemedText>
                )}
              </LinearGradient>

              {pet ? (
                <LinearGradient colors={['#FFE9DA', '#FFCFAE']} style={styles.pet}>
                  <PetArt
                    type={pet.type}
                    size={78}
                    color="#1A1410"
                    accent={theme.primary}
                    bandana
                    strokeWidth={4.6}
                    fill={look?.coat}
                    ears={look?.ears}
                  />
                  <View style={styles.petText}>
                    <ThemedText style={styles.petName} numberOfLines={1}>
                      {pet.name}
                    </ThemedText>
                    <ThemedText type="small" style={styles.petBreed} numberOfLines={1}>
                      {breedName(pet.breed, lang)}
                    </ThemedText>
                  </View>
                </LinearGradient>
              ) : null}
            </View>

            <Pressable accessibilityRole="button" onPress={() => router.push('/achievements')}>
              <LinearGradient colors={['#FFF3CC', '#FFE3C2']} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={styles.achievements}>
                <View style={styles.achText}>
                  <ThemedText style={styles.achTitle}>{t('achievements.title')}</ThemedText>
                  <ThemedText type="small" style={styles.petBreed}>
                    {t('achievements.count', { n: unlockedCount, total: list.length })}
                  </ThemedText>
                </View>
                <View style={styles.badges}>
                  {shownBadges.map((item, index) => (
                    <View key={item.id} style={[styles.badgeWrap, index > 0 && { marginLeft: -10 }]}>
                      <AchievementBadge achievement={item} unlocked size={36} />
                    </View>
                  ))}
                </View>
                <SymbolIcon ios="chevron.right" material="chevron_right" color="#5B534D" size={14} />
              </LinearGradient>
            </Pressable>

            {rest.length > 0 ? (
              <View style={styles.section}>
                <ThemedText style={styles.sectionTitle}>{t('home.comingUp')}</ThemedText>
                {pairs.map((pair, index) => (
                  <View key={index} style={styles.pair}>
                    {pair.map((event) => (
                      <EventCard key={event.id} event={event} when={whenLabel(event)} variant="tile" />
                    ))}
                    {pair.length === 1 ? <View style={styles.pairFiller} /> : null}
                  </View>
                ))}
              </View>
            ) : null}
          </View>
        </ScrollView>
      </SafeAreaView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  glow: { position: 'absolute', top: 0, left: 0, right: 0, height: 340 },
  scroll: { flexGrow: 1, paddingHorizontal: Spacing.four, paddingTop: Spacing.four, paddingBottom: TAB_BAR_SPACE },
  content: { width: '100%', maxWidth: 460, alignSelf: 'center', gap: Spacing.four },
  bento: { flexDirection: 'row', gap: Spacing.three },
  next: { flex: 1.1, minHeight: 190, borderRadius: 28, padding: Spacing.three + 2, justifyContent: 'space-between' },
  nextTitle: { fontSize: 19, lineHeight: 25, fontWeight: '600', color: '#fff' },
  onDark: { color: '#fff' },
  onDarkMuted: { color: 'rgba(255,255,255,0.62)' },
  pet: { flex: 1, minHeight: 190, borderRadius: 28, padding: Spacing.three, alignItems: 'center', justifyContent: 'space-between' },
  petText: { alignItems: 'center' },
  petName: { fontSize: 20, lineHeight: 26, fontWeight: '700', color: '#2A211B' },
  petBreed: { color: '#5B534D' },
  achievements: { flexDirection: 'row', alignItems: 'center', gap: Spacing.three, borderRadius: 24, padding: Spacing.three },
  achText: { flex: 1 },
  achTitle: { fontSize: 17, fontWeight: '600', color: '#2A211B' },
  badges: { flexDirection: 'row', alignItems: 'center' },
  badgeWrap: { borderRadius: 20, borderWidth: 2, borderColor: '#FFEFD2' },
  section: { gap: Spacing.three },
  sectionTitle: { fontSize: 20, fontWeight: '600' },
  pair: { flexDirection: 'row', gap: Spacing.three },
  pairFiller: { flex: 1 },
});
