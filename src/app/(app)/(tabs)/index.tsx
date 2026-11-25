import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import { useMemo } from 'react';
import { Pressable, ScrollView, StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { SymbolIcon } from '@/components/ui/symbol-icon';
import { EventTimeline, groupByDay } from '@/components/event-timeline';
import { PetCardPager } from '@/components/pet-card-pager';
import { Spacing, TAB_BAR_SPACE } from '@/constants/theme';
import { useI18n } from '@/i18n';
import { upcomingEvents } from '@/lib/repeat';
import { useSession } from '@/providers/session';

const MAX_EVENTS = 60;

/** Home tab, laid out as a bento grid: the next event (dark), the pet (peach), achievements, then what is coming up. */
export default function HomeScreen() {
  const { t } = useI18n();
  const router = useRouter();
  const { session, events } = useSession();
  const pet = session?.pet;


  const upcoming = useMemo(() => upcomingEvents(events), [events]);
  const shown = upcoming.slice(0, MAX_EVENTS);
  const groups = useMemo(() => groupByDay(shown), [shown]);

  return (
    <ThemedView style={styles.root}>
      {/* A soft peach glow behind the header, fading into the page. */}
      <LinearGradient colors={['#EDEDED', '#F7F7F7', '#FFFFFF']} style={styles.glow} pointerEvents="none" />
      <SafeAreaView style={styles.root} edges={['top']}>
        {/* The page does not scroll: it is laid out to the screen, and only the events list scrolls inside its box. */}
        <View style={styles.scroll}>
          <View style={styles.content}>
            <View style={styles.header}>
              {/* A round avatar with the owner's initial (there is no owner photo yet). */}
              <View style={styles.avatar} accessibilityLabel={t('petId.owner')}>
                <ThemedText style={styles.avatarText}>{(session?.ownerName ?? '').trim().charAt(0).toUpperCase()}</ThemedText>
              </View>
              {/* The two lines sit exactly in the middle of the avatar's height. */}
              <View style={styles.ownerText}>
                <ThemedText style={styles.ownerLabel}>{t('petId.owner')}</ThemedText>
                <ThemedText style={styles.ownerName} numberOfLines={1}>
                  {session?.ownerName ?? ''}
                </ThemedText>
              </View>
              <Pressable
                accessibilityRole="button"
                accessibilityLabel={t('settings.title')}
                onPress={() => router.push('/settings')}
                style={({ pressed }) => [styles.gear, pressed && { opacity: 0.8 }]}>
                <SymbolIcon ios="gearshape" material="settings" color="#111111" size={20} />
              </Pressable>
            </View>

            {pet ? <PetCardPager /> : null}

            {upcoming.length > 0 ? (
              <View style={styles.section}>
                <ThemedText style={styles.sectionTitle}>{t('home.comingUp')}</ThemedText>
                {/* The box takes the space that is left; the list scrolls inside it. */}
                <View style={styles.listBox}>
                  <ScrollView nestedScrollEnabled showsVerticalScrollIndicator={false} contentContainerStyle={styles.listContent}>
                    <EventTimeline groups={groups} highlightFirst bottomPad={TAB_BAR_SPACE} />
                  </ScrollView>
                </View>
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
        </View>
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
  empty: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: Spacing.two, paddingBottom: TAB_BAR_SPACE },
  emptyIcon: { width: 56, height: 56, borderRadius: 28, backgroundColor: '#F0F0F2', alignItems: 'center', justifyContent: 'center' },
  emptyText: { color: '#8A8A8A', fontSize: 15, lineHeight: 20, fontWeight: '500' },
  ownerText: { flex: 1, justifyContent: 'center', paddingTop: 3 },
  ownerLabel: { color: '#8A8A8A', fontSize: 12, lineHeight: 15, fontWeight: '500' },
  ownerName: { color: '#111111', fontSize: 28, lineHeight: 33, fontWeight: '500' },
  gear: { width: 44, height: 44, borderRadius: 22, backgroundColor: '#FFFFFF', alignItems: 'center', justifyContent: 'center', borderWidth: StyleSheet.hairlineWidth, borderColor: '#DDDDDF' },
  header: { flexDirection: 'row', alignItems: 'center', gap: Spacing.three },
  glow: { position: 'absolute', top: 0, left: 0, right: 0, height: 340 },
  scroll: { flex: 1, paddingHorizontal: Spacing.four, paddingTop: Spacing.three },
  content: { flex: 1, width: '100%', maxWidth: 460, alignSelf: 'center', gap: Spacing.four },
  section: { flex: 1, gap: Spacing.three, minHeight: 0 },
  // No frames or lines: just the rows, each with a calendar-style day chip (today in black) on the left.
  // The date sits level with the node and the middle of the first card.
  // As tall as the event card next to it.
  // The node sits level with the middle of the day's first card: (card height - node size) / 2.
  // The list runs to the bottom edge, under the menu; its last row can still be scrolled clear of it.
  listContent: { flexGrow: 1 },
  listBox: { flex: 1, overflow: 'hidden' },
  sectionTitle: { fontSize: 20, fontWeight: '600' },
});
