import { LinearGradient } from 'expo-linear-gradient';
import { useMemo } from 'react';
import { ScrollView, StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { SymbolIcon } from '@/components/ui/symbol-icon';
import { PetCardPager } from '@/components/pet-card-pager';
import { Spacing, TAB_BAR_SPACE } from '@/constants/theme';
import { useI18n } from '@/i18n';
import { todayIso } from '@/lib/dates';
import { KIND_ICONS, kindKey } from '@/lib/event-kinds';
import { expandEvents } from '@/lib/repeat';
import { useSession } from '@/providers/session';

const MAX_EVENTS = 60;
const DATE_COL = 78; // width of the date column
const CARD_HEIGHT = 76; // minimum height of an event card
const NODE_COL = 26; // width of the timeline column

/** Home tab, laid out as a bento grid: the next event (dark), the pet (peach), achievements, then what is coming up. */
export default function HomeScreen() {
  const { t, locale } = useI18n();
  const { session, events } = useSession();
  const pet = session?.pet;


  const upcoming = useMemo(() => {
    const today = todayIso();
    const year = new Date(`${today}T12:00:00`);
    year.setFullYear(year.getFullYear() + 1);
    return expandEvents(events, today, `${year.getFullYear()}-${String(year.getMonth() + 1).padStart(2, '0')}-${String(year.getDate()).padStart(2, '0')}`)
      .sort((a, b) => `${a.date} ${a.time ?? ''}`.localeCompare(`${b.date} ${b.time ?? ''}`));
  }, [events]);
  const shown = upcoming.slice(0, MAX_EVENTS);
  // The events grouped by day, in order: one date header, then that day's events under it.
  // The weekday in full, with a capital: "понеділок" -> "Понеділок".
  const weekdayName = (date: Date) => {
    const name = date.toLocaleDateString(locale, { weekday: 'long' });
    return `${name.charAt(0).toUpperCase()}${name.slice(1)}`;
  };
  const groups = useMemo(() => {
    const list: { date: string; items: typeof shown }[] = [];
    for (const event of shown) {
      const last = list[list.length - 1];
      if (last && last.date === event.date) last.items.push(event);
      else list.push({ date: event.date, items: [event] });
    }
    return list;
  }, [shown]);

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
                {/* A fixed-height box: the list scrolls inside it, the page itself stays put. */}
                <View style={styles.listBox}>
                  <ScrollView nestedScrollEnabled showsVerticalScrollIndicator={false} contentContainerStyle={styles.listContent}>
                    {/* Column labels, like a timetable: DATE on the left, EVENTS on the right. */}
                    <View style={styles.colLabels}>
                      <ThemedText style={[styles.colLabel, { width: DATE_COL + NODE_COL }]}>{t('home.colDate')}</ThemedText>
                      <ThemedText style={styles.colLabel}>{t('home.colEvents')}</ThemedText>
                    </View>
                    <View>
                      {/* One thin vertical line through all the days, with a node on it for each day. */}
                      <View pointerEvents="none" style={styles.timeline} />
                      {groups.map((group, groupIndex) => {
                        const date = new Date(`${group.date}T12:00:00`);
                        const isToday = group.date === todayIso();
                        return (
                          <View key={group.date} style={styles.dayRow}>
                            <View style={styles.dateCol}>
                              {/* The date in a rounded frame, like the selected day in the calendar; today is black and named. */}
                              <View style={[styles.dayChip, isToday && styles.dayChipToday]}>
                                {/* Above the date: "today" for today, otherwise the full weekday (Понеділок, Вівторок ...). */}
                                <ThemedText style={isToday ? styles.dayToday : styles.dayWeekday} numberOfLines={1} adjustsFontSizeToFit>
                                  {isToday ? t('today').toUpperCase() : weekdayName(date)}
                                </ThemedText>
                                <ThemedText style={[styles.dayNumber, isToday && styles.dayNumberToday]} numberOfLines={1}>
                                  {`${String(date.getDate()).padStart(2, '0')}.${String(date.getMonth() + 1).padStart(2, '0')}.${String(date.getFullYear()).slice(2)}`}
                                </ThemedText>
                              </View>
                            </View>
                            <View style={styles.nodeCol}>
                              <View style={[styles.node, isToday && styles.nodeToday]} />
                            </View>
                            <View style={styles.cards}>
                              {group.items.map((event, itemIndex) => {
                                const next = groupIndex === 0 && itemIndex === 0;
                                return (
                                  <View key={event.id} style={[styles.eventCard, next && styles.eventCardNext]}>
                                    {/* The kind's icon in a round badge on the left. */}
                                    <View style={[styles.kindBadge, next && styles.kindBadgeNext]}>
                                      <SymbolIcon {...KIND_ICONS[event.kind]} color={next ? '#FFFFFF' : '#111111'} size={20} />
                                    </View>
                                    {/* The time sits small above the title, so the title has the whole width. */}
                                    <View style={styles.whatText}>
                                      <ThemedText style={[styles.cardTime, next && styles.onDarkSoft]} numberOfLines={1}>
                                        {event.time ?? t('event.allDay')}
                                      </ThemedText>
                                      <ThemedText style={[styles.whatTitle, next && styles.onDark]} numberOfLines={1}>
                                        {t(kindKey(event.kind))}
                                      </ThemedText>
                                      {event.description ? (
                                        <ThemedText style={[styles.whatDesc, next && styles.onDarkSoft]} numberOfLines={1}>
                                          {event.description}
                                        </ThemedText>
                                      ) : null}
                                    </View>
                                  </View>
                                );
                              })}
                            </View>
                          </View>
                        );
                      })}
                    </View>
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
  // No frames or lines: just the rows, each with a calendar-style day chip (today in black) on the left.
  colLabels: { flexDirection: 'row', paddingBottom: 12 },
  colLabel: { color: '#9A9A9E', fontSize: 11, lineHeight: 14, fontWeight: '500', letterSpacing: 1.2 },
  timeline: { position: 'absolute', top: 0, bottom: 0, left: DATE_COL + NODE_COL / 2 - 0.75, width: 1.5, backgroundColor: '#DCDCDF' },
  dayRow: { flexDirection: 'row', alignItems: 'flex-start', marginBottom: 22 },
  // The date sits level with the node and the middle of the first card.
  dateCol: { width: DATE_COL },
  // As tall as the event card next to it.
  dayChip: { height: CARD_HEIGHT, justifyContent: 'center', alignItems: 'center', paddingHorizontal: 6, borderRadius: 8, backgroundColor: '#EFEFF1' },
  dayChipToday: { backgroundColor: '#111111' },
  dayNumber: { color: '#333333', fontSize: 15, lineHeight: 20, fontWeight: '600' },
  dayNumberToday: { color: '#FFFFFF' },
  dayWeekday: { color: '#8A8A8E', fontSize: 11, lineHeight: 14, fontWeight: '500', marginBottom: 1 },
  dayToday: { color: '#FFFFFF', fontSize: 9, lineHeight: 12, fontWeight: '600', letterSpacing: 0.6, marginBottom: 1 },
  // The node sits level with the middle of the day's first card: (card height - node size) / 2.
  nodeCol: { width: NODE_COL, alignItems: 'center', paddingTop: (CARD_HEIGHT - 11) / 2 },
  node: { width: 11, height: 11, borderRadius: 6, backgroundColor: '#F7F7F7', borderWidth: 1.5, borderColor: '#A8A8AC' },
  nodeToday: { backgroundColor: '#111111', borderColor: '#111111' },
  cards: { flex: 1, gap: 8 },
  eventCard: { minHeight: CARD_HEIGHT, flexDirection: 'row', alignItems: 'center', gap: 12, paddingVertical: 8, paddingLeft: 12, paddingRight: 14, borderRadius: 8, backgroundColor: '#EFEFF1' },
  kindBadge: { width: 44, height: 44, borderRadius: 22, backgroundColor: '#FFFFFF', alignItems: 'center', justifyContent: 'center' },
  kindBadgeNext: { backgroundColor: 'rgba(255,255,255,0.16)' },
  eventCardNext: { backgroundColor: '#111111' },
  whatText: { flex: 1 },
  whatTitle: { color: '#2B2B2B', fontSize: 16, lineHeight: 20, fontWeight: '500' },
  whatDesc: { color: '#8A8A8E', fontSize: 13, lineHeight: 16, fontWeight: '500' },
  cardTime: { color: '#8A8A8E', fontSize: 12, lineHeight: 15, fontWeight: '500' },
  onDark: { color: '#FFFFFF' },
  onDarkSoft: { color: 'rgba(255,255,255,0.65)' },
  listContent: { paddingBottom: Spacing.two },
  listBox: { height: 420, overflow: 'hidden' },
  sectionTitle: { fontSize: 20, fontWeight: '600' },
});
