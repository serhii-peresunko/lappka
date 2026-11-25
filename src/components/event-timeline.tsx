import { Pressable, StyleSheet, View } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { SymbolIcon } from '@/components/ui/symbol-icon';
import { useEventActions } from '@/hooks/use-event-actions';
import { useI18n } from '@/i18n';
import { todayIso } from '@/lib/dates';
import { KIND_ICONS, kindKey } from '@/lib/event-kinds';
import type { PetEvent } from '@/providers/session';

const DATE_COL = 70; // width of the date column
const CARD_HEIGHT = 48; // minimum height of an event card
const NODE_COL = 22; // width of the timeline column

type Group = { date: string; items: PetEvent[] };

/** Events in the order given, one group per day. */
export function groupByDay(events: PetEvent[]): Group[] {
  const list: Group[] = [];
  for (const event of events) {
    const last = list[list.length - 1];
    if (last && last.date === event.date) last.items.push(event);
    else list.push({ date: event.date, items: [event] });
  }
  return list;
}

/**
 * The events as a timetable: a DATE column on the left (a date chip per day), a thin timeline with a node per day,
 * and the day's event cards on the right. A tap on a card opens it in the bottom sheet (change or delete).
 * The first card can be drawn in black ("next up").
 */
export function EventTimeline({ groups, highlightFirst = false, showDate = true, bottomPad = 0 }: { groups: Group[]; highlightFirst?: boolean; showDate?: boolean; bottomPad?: number }) {
  const { t, locale } = useI18n();
  const openEvent = useEventActions();

  // Keep the day label compact while respecting the active locale.
  const weekdayName = (date: Date) => {
    const name = date.toLocaleDateString(locale, { weekday: 'short' });
    return `${name.charAt(0).toUpperCase()}${name.slice(1)}`;
  };

  return (
    <View style={styles.fill}>
      {/* Column labels, like a timetable: DATE on the left, EVENTS on the right. */}
      {showDate ? (
        <View style={styles.colLabels}>
          <ThemedText style={[styles.colLabel, { width: DATE_COL + NODE_COL }]}>{t('home.colDate')}</ThemedText>
          <ThemedText style={styles.colLabel}>{t('home.colEvents')}</ThemedText>
        </View>
      ) : null}
      <View style={[styles.fill, { paddingBottom: bottomPad }]}>
        {/* One thin vertical line through all the days, with a node on it for each day. */}
        {showDate ? <View pointerEvents="none" style={styles.timeline} /> : null}
        {groups.map((group, groupIndex) => {
          const date = new Date(`${group.date}T12:00:00`);
          const isToday = group.date === todayIso();
          return (
            <View key={group.date} style={styles.dayRow}>
              {showDate ? (
                <>
                  <View style={styles.dateCol}>
                    {/* The date in a rounded frame, like the selected day in the calendar; today is black and named. */}
                    <View style={[styles.dayChip, isToday && styles.dayChipToday]}>
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
                </>
              ) : null}
              <View style={styles.cards}>
                {group.items.map((event, itemIndex) => {
                  const next = highlightFirst && groupIndex === 0 && itemIndex === 0;
                  return (
                    <Pressable
                      key={event.id}
                      accessibilityRole="button"
                      onPress={() => openEvent(event)}
                      style={({ pressed }) => [styles.eventCard, next && styles.eventCardNext, pressed && { opacity: 0.85 }]}>
                      {/* The kind's icon in a round badge on the left. */}
                      <View style={[styles.kindBadge, next && styles.kindBadgeNext]}>
                        <SymbolIcon {...KIND_ICONS[event.kind]} color={next ? '#FFFFFF' : '#111111'} size={16} />
                      </View>
                      {/* The time sits small above the title, so the title has the whole width. */}
                      <View style={styles.whatText}>
                        <View style={styles.whatHeading}>
                          <ThemedText style={[styles.whatTitle, next && styles.onDark]} numberOfLines={1}>
                            {t(kindKey(event.kind))}
                          </ThemedText>
                          <View style={[styles.timeBadge, next && styles.timeBadgeNext]}>
                            <ThemedText style={[styles.cardTime, next && styles.onDark]} numberOfLines={1}>
                              {event.time ?? t('event.allDay')}
                            </ThemedText>
                          </View>
                        </View>
                        {event.description ? (
                          <ThemedText style={[styles.whatDesc, next && styles.onDarkSoft]} numberOfLines={1}>
                            {event.description}
                          </ThemedText>
                        ) : null}
                      </View>
                    </Pressable>
                  );
                })}
              </View>
            </View>
          );
        })}
      </View>

    </View>
  );
}

const styles = StyleSheet.create({
  fill: { flex: 1 },
  colLabels: { flexDirection: 'row', paddingBottom: 10 },
  colLabel: { color: '#9A9A9E', fontSize: 11, lineHeight: 14, fontWeight: '500', letterSpacing: 1.2 },
  timeline: { position: 'absolute', top: 0, bottom: 0, left: DATE_COL + NODE_COL / 2 - 0.75, width: 1.5, backgroundColor: '#DCDCDF' },
  dayRow: { flexDirection: 'row', alignItems: 'flex-start', marginBottom: 12 },
  dateCol: { width: DATE_COL },
  dayChip: { width: DATE_COL, height: CARD_HEIGHT, justifyContent: 'center', alignItems: 'center', paddingHorizontal: 4, borderRadius: 8, backgroundColor: '#EFEFF1' },
  dayChipToday: { backgroundColor: '#111111' },
  dayNumber: { color: '#333333', fontSize: 13, lineHeight: 17, fontWeight: '600' },
  dayNumberToday: { color: '#FFFFFF' },
  dayWeekday: { color: '#8A8A8E', fontSize: 10, lineHeight: 13, fontWeight: '500', marginBottom: 1 },
  dayToday: { color: '#FFFFFF', fontSize: 9, lineHeight: 12, fontWeight: '600', marginBottom: 1 },
  nodeCol: { width: NODE_COL, alignItems: 'center', paddingTop: (CARD_HEIGHT - 11) / 2 },
  node: { width: 11, height: 11, borderRadius: 6, backgroundColor: '#F7F7F7', borderWidth: 1.5, borderColor: '#A8A8AC' },
  nodeToday: { backgroundColor: '#111111', borderColor: '#111111' },
  cards: { flex: 1, gap: 4 },
  eventCard: { minHeight: CARD_HEIGHT, flexDirection: 'row', alignItems: 'center', gap: 8, paddingVertical: 5, paddingLeft: 8, paddingRight: 10, borderRadius: 8, backgroundColor: '#EFEFF1' },
  eventCardNext: { backgroundColor: '#111111' },
  kindBadge: { width: 30, height: 30, borderRadius: 15, backgroundColor: '#FFFFFF', alignItems: 'center', justifyContent: 'center' },
  kindBadgeNext: { backgroundColor: 'rgba(255,255,255,0.16)' },
  whatText: { flex: 1 },
  whatHeading: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  whatTitle: { flex: 1, color: '#2B2B2B', fontSize: 14, lineHeight: 18, fontWeight: '600' },
  whatDesc: { color: '#77777A', fontSize: 11, lineHeight: 14, fontWeight: '500' },
  timeBadge: { paddingHorizontal: 6, paddingVertical: 2, borderRadius: 6, backgroundColor: '#FFFFFF' },
  timeBadgeNext: { backgroundColor: 'rgba(255,255,255,0.16)' },
  cardTime: { color: '#555558', fontSize: 11, lineHeight: 14, fontWeight: '600' },
  onDark: { color: '#FFFFFF' },
  onDarkSoft: { color: 'rgba(255,255,255,0.65)' },
});
