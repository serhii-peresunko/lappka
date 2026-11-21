import { useRouter } from 'expo-router';
import { useMemo, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { SymbolIcon } from '@/components/ui/symbol-icon';
import { MonthCalendar } from '@/components/ui/month-calendar';
import { Spacing, TAB_BAR_SPACE } from '@/constants/theme';
import { useI18n } from '@/i18n';
import { EVENT_KIND_ORDER, KIND_COLORS, KIND_ICONS, kindKey } from '@/lib/event-kinds';
import { todayIso } from '@/lib/dates';
import { expandEvents } from '@/lib/repeat';
import { useSession, type EventKind } from '@/providers/session';

/** Calendar tab: a month calendar and the events of the chosen day. Events are added from the middle tab button. */
export default function CalendarScreen() {
  const router = useRouter();
  const { events } = useSession();
  const { t, locale } = useI18n();
  const [selected, setSelected] = useState(todayIso);

  // Repeating events are spread over a window around today (a year back, two ahead).
  const shown = useMemo(() => {
    const now = new Date();
    return expandEvents(events, `${now.getFullYear() - 1}-01-01`, `${now.getFullYear() + 2}-12-31`);
  }, [events]);
  const dotsByDay = useMemo(() => {
    const map = new Map<string, EventKind[]>();
    for (const event of shown) map.set(event.date, [...(map.get(event.date) ?? []), event.kind]);
    return map;
  }, [shown]);
  const dayEvents = useMemo(
    () =>
      shown
        .filter((event) => event.date === selected)
        .sort((a, b) => (a.time ?? '').localeCompare(b.time ?? '')),
    [shown, selected]
  );
  const dayRaw = new Date(`${selected}T12:00:00`).toLocaleDateString(locale, {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
  });
  const dayTitle = dayRaw.charAt(0).toUpperCase() + dayRaw.slice(1);

  return (
    <ThemedView style={styles.root}>
      <SafeAreaView style={styles.root} edges={['top']}>
        <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
          <View style={styles.content}>
            <ThemedText type="subtitle">{t('calendar.title')}</ThemedText>

            <MonthCalendar selected={selected} onSelect={setSelected} dotsByDay={dotsByDay} />

            <View style={styles.legend}>
              {EVENT_KIND_ORDER.map((kind) => (
                <View key={kind} style={styles.legendItem}>
                  <SymbolIcon {...KIND_ICONS[kind]} color={KIND_COLORS[kind]} size={15} />
                  <ThemedText type="small" themeColor="textSecondary">
                    {t(kindKey(kind))}
                  </ThemedText>
                </View>
              ))}
            </View>

            <View style={styles.events}>
              <View style={styles.dayHeader}>
                <View style={styles.flex}>
                  <ThemedText style={styles.dayTitle}>{dayTitle}</ThemedText>
                  {dayEvents.length === 0 ? (
                    <ThemedText type="small" themeColor="textSecondary">
                      {t('calendar.empty')}
                    </ThemedText>
                  ) : null}
                </View>
                <Pressable accessibilityRole="button" accessibilityLabel={t('tab.add')} onPress={() => router.push('/add-event')} style={styles.newBtn}>
                  <SymbolIcon ios="plus" material="add" color="#FFFFFF" size={16} />
                </Pressable>
              </View>
              {dayEvents.map((event) => (
                <View key={event.id} style={styles.row}>
                  <ThemedText type="smallBold" style={styles.time}>
                    {event.time ?? '—'}
                  </ThemedText>
                  <View style={[styles.badge, { backgroundColor: `${KIND_COLORS[event.kind]}26` }]}>
                    <SymbolIcon {...KIND_ICONS[event.kind]} color={KIND_COLORS[event.kind]} size={18} />
                  </View>
                  <View style={styles.flex}>
                    <ThemedText style={styles.eventTitle} numberOfLines={1}>
                      {t(kindKey(event.kind))}
                    </ThemedText>
                    {event.description ? (
                      <ThemedText type="small" themeColor="textSecondary" numberOfLines={2}>
                        {event.description}
                      </ThemedText>
                    ) : null}
                  </View>
                </View>
              ))}
            </View>
          </View>
        </ScrollView>

      </SafeAreaView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  flex: { flex: 1 },
  scroll: { flexGrow: 1, paddingHorizontal: Spacing.four, paddingTop: Spacing.four, paddingBottom: TAB_BAR_SPACE },
  content: { width: '100%', maxWidth: 460, alignSelf: 'center', gap: Spacing.four },
  events: { gap: Spacing.three },
  legend: { flexDirection: 'row', flexWrap: 'wrap', gap: Spacing.three },
  legendItem: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  dayHeader: { flexDirection: 'row', alignItems: 'center', gap: Spacing.three },
  dayTitle: { fontSize: 20, fontWeight: '600' },
  newBtn: { flexDirection: 'row', alignItems: 'center', gap: 6, width: 44, height: 44, justifyContent: 'center', borderRadius: 22, backgroundColor: '#111111' },
  row: { flexDirection: 'row', alignItems: 'center', gap: Spacing.three, paddingVertical: Spacing.two },
  time: { width: 48 },
  badge: { width: 40, height: 40, borderRadius: 20, alignItems: 'center', justifyContent: 'center' },
  eventTitle: { fontSize: 16, fontWeight: '600', lineHeight: 22 },
});
