import { LinearGradient } from 'expo-linear-gradient';
import { useMemo } from 'react';
import { ScrollView, StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { PetIdCard } from '@/components/pet-id-card';
import { EventCard } from '@/components/ui/event-card';
import { Spacing, TAB_BAR_SPACE } from '@/constants/theme';
import { useI18n } from '@/i18n';
import { todayIso } from '@/lib/dates';
import { useSession, type PetEvent } from '@/providers/session';

const TILES = 12;

/** Home tab, laid out as a bento grid: the next event (dark), the pet (peach), achievements, then what is coming up. */
export default function HomeScreen() {
  const { t, locale } = useI18n();
  const { session, events } = useSession();
  const pet = session?.pet;

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
  const shown = upcoming.slice(0, TILES);

  return (
    <ThemedView style={styles.root}>
      {/* A soft peach glow behind the header, fading into the page. */}
      <LinearGradient colors={['#EDEDED', '#F7F7F7', '#FFFFFF']} style={styles.glow} pointerEvents="none" />
      <SafeAreaView style={styles.root} edges={['top']}>
        <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
          <View style={styles.content}>
            <View style={styles.header}>
              <View style={styles.flex}>
                <ThemedText type="subtitle">{t('home.hi', { name: session?.ownerName ?? '' })}</ThemedText>
                <ThemedText themeColor="textSecondary">
                  {todayLabel}
                </ThemedText>
              </View>
            </View>

            {pet ? <PetIdCard /> : null}

            {upcoming.length > 0 ? (
              <View style={styles.section}>
                <ThemedText style={styles.sectionTitle}>{t('home.comingUp')}</ThemedText>
                <ScrollView
                  horizontal
                  showsHorizontalScrollIndicator={false}
                  style={styles.rail}
                  contentContainerStyle={styles.railContent}>
                  {shown.map((event, index) => (
                    <View key={event.id} style={styles.railItem}>
                      <EventCard
                        event={event}
                        when={whenLabel(event)}
                        variant="tile"
                        highlightLabel={index === 0 ? t('home.nextUp') : undefined}
                      />
                    </View>
                  ))}
                </ScrollView>
              </View>
            ) : (
              <ThemedText themeColor="textSecondary">{t('home.nothing')}</ThemedText>
            )}
          </View>
        </ScrollView>
      </SafeAreaView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  flex: { flex: 1 },
  header: { flexDirection: 'row', alignItems: 'flex-end', gap: Spacing.three },
  glow: { position: 'absolute', top: 0, left: 0, right: 0, height: 340 },
  scroll: { flexGrow: 1, paddingHorizontal: Spacing.four, paddingTop: Spacing.four, paddingBottom: TAB_BAR_SPACE },
  content: { width: '100%', maxWidth: 460, alignSelf: 'center', gap: Spacing.four },
  section: { gap: Spacing.three },
  sectionTitle: { fontSize: 20, fontWeight: '600' },
  // One line that scrolls sideways, running to the screen edges while the first card lines up with the page.
  rail: { marginHorizontal: -Spacing.four, overflow: 'visible' },
  railContent: { paddingHorizontal: Spacing.four, paddingVertical: Spacing.two, gap: Spacing.three },
  railItem: { width: 176, flexDirection: 'row' },
});
