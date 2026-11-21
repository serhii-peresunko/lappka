import { LinearGradient } from 'expo-linear-gradient';
import { useMemo } from 'react';
import { ScrollView, StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { SymbolIcon } from '@/components/ui/symbol-icon';
import { PetCardPager } from '@/components/pet-card-pager';
import { EventCard } from '@/components/ui/event-card';
import { Spacing, TAB_BAR_SPACE } from '@/constants/theme';
import { useI18n } from '@/i18n';
import { todayIso } from '@/lib/dates';
import { expandEvents } from '@/lib/repeat';
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


  const upcoming = useMemo(() => {
    const today = todayIso();
    const year = new Date(`${today}T12:00:00`);
    year.setFullYear(year.getFullYear() + 1);
    return expandEvents(events, today, `${year.getFullYear()}-${String(year.getMonth() + 1).padStart(2, '0')}-${String(year.getDate()).padStart(2, '0')}`)
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
              {/* A round avatar with the owner's initial (there is no owner photo yet). */}
              <View style={styles.avatar} accessibilityLabel={t('petId.owner')}>
                <ThemedText style={styles.avatarText}>{(session?.ownerName ?? '').trim().charAt(0).toUpperCase()}</ThemedText>
              </View>
              <View style={styles.flex}>
                <ThemedText style={styles.ownerLabel}>{t('petId.owner')}</ThemedText>
                <ThemedText type="subtitle" style={styles.ownerName}>
                  {session?.ownerName ?? ''}
                </ThemedText>
              </View>
            </View>

            {pet ? <PetCardPager /> : null}

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
              <View style={styles.section}>
                <ThemedText style={styles.sectionTitle}>{t('home.comingUp')}</ThemedText>
                <View style={styles.empty}>
                  <View style={styles.emptyIcon}>
                    <SymbolIcon ios="calendar" material="calendar_month" color="#8A8A8A" size={26} />
                  </View>
                  <ThemedText style={styles.emptyText}>{t('home.nothing')}</ThemedText>
                </View>
              </View>
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
  // Same pair as the fields on the card: a small grey label over the value.
  avatar: { width: 52, height: 52, borderRadius: 26, backgroundColor: '#111111', alignItems: 'center', justifyContent: 'center' },
  avatarText: { color: '#FFFFFF', fontSize: 22, lineHeight: 28, fontWeight: '500' },
  // Fills what is left under the title and centres the message in it, both ways.
  empty: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: Spacing.two },
  emptyIcon: { width: 56, height: 56, borderRadius: 28, backgroundColor: '#F0F0F2', alignItems: 'center', justifyContent: 'center' },
  emptyText: { color: '#8A8A8A', fontSize: 15, lineHeight: 20, fontWeight: '500' },
  ownerLabel: { color: '#8A8A8A', fontSize: 12, lineHeight: 15, fontWeight: '500' },
  ownerName: { fontWeight: '500', marginTop: -6 },
  header: { flexDirection: 'row', alignItems: 'center', gap: Spacing.three },
  glow: { position: 'absolute', top: 0, left: 0, right: 0, height: 340 },
  scroll: { flexGrow: 1, paddingHorizontal: Spacing.four, paddingTop: Spacing.four, paddingBottom: TAB_BAR_SPACE },
  content: { flexGrow: 1, width: '100%', maxWidth: 460, alignSelf: 'center', gap: Spacing.four },
  section: { flexGrow: 1, gap: Spacing.three },
  sectionTitle: { fontSize: 20, fontWeight: '600' },
  // One line that scrolls sideways, running to the screen edges while the first card lines up with the page.
  rail: { marginHorizontal: -Spacing.four, overflow: 'visible' },
  railContent: { paddingHorizontal: Spacing.four, paddingVertical: Spacing.two, gap: Spacing.three },
  railItem: { width: 176, flexDirection: 'row' },
});
