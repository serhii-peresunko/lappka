import { useRouter } from 'expo-router';
import { useMemo, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { EventTimeline, groupByDay } from '@/components/event-timeline';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { MonthCalendar } from '@/components/ui/month-calendar';
import { SymbolIcon } from '@/components/ui/symbol-icon';
import { Spacing, TAB_BAR_SPACE } from '@/constants/theme';
import { useI18n } from '@/i18n';
import { todayIso } from '@/lib/dates';
import { KIND_ICONS, kindKey } from '@/lib/event-kinds';
import { expandEvents } from '@/lib/repeat';
import { useSession, type EventKind } from '@/providers/session';

type CalendarFilter = 'all' | 'vet' | 'vaccine' | 'grooming' | 'medication';

/** Calendar tab: a month calendar and the events of the chosen day. Events are added from the middle tab button. */
export default function CalendarScreen() {
  const router = useRouter();
  const { events } = useSession();
  const { t, locale } = useI18n();
  const [selected, setSelected] = useState(todayIso);
  const [filter, setFilter] = useState<CalendarFilter>('all');

  // Repeating events are spread over a window around today (a year back, two ahead).
  const shown = useMemo(() => {
    const now = new Date();
    return expandEvents(events, `${now.getFullYear() - 1}-01-01`, `${now.getFullYear() + 2}-12-31`);
  }, [events]);
  const visibleEvents = useMemo(
    () => shown.filter((event) => filter === 'all' || event.kind === filter),
    [shown, filter]
  );
  const dotsByDay = useMemo(() => {
    const map = new Map<string, EventKind[]>();
    for (const event of visibleEvents) {
      const kinds = map.get(event.date) ?? [];
      if (!kinds.includes(event.kind)) map.set(event.date, [...kinds, event.kind]);
    }
    return map;
  }, [visibleEvents]);
  const dayEvents = useMemo(
    () =>
      visibleEvents
        .filter((event) => event.date === selected)
        .sort((a, b) => (a.time ?? '').localeCompare(b.time ?? '')),
    [visibleEvents, selected]
  );
  const dayRaw = new Date(`${selected}T12:00:00`).toLocaleDateString(locale, {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
  });
  const dayTitle = dayRaw.charAt(0).toUpperCase() + dayRaw.slice(1);
  // Filter cards: "All", then one card per kind (icon above the name).
  const filters: { value: CalendarFilter; label: string; icon: { ios: string; material: string } }[] = [
    { value: 'all', label: t('calendar.filterAll'), icon: { ios: 'square.grid.2x2.fill', material: 'apps' } },
    { value: 'vet', label: t(kindKey('vet')), icon: KIND_ICONS.vet },
    { value: 'vaccine', label: t(kindKey('vaccine')), icon: KIND_ICONS.vaccine },
    { value: 'grooming', label: t(kindKey('grooming')), icon: KIND_ICONS.grooming },
    { value: 'medication', label: t(kindKey('medication')), icon: KIND_ICONS.medication },
  ];

  return (
    <ThemedView style={styles.root}>
      <SafeAreaView style={styles.root} edges={['top']}>
        <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
          <View style={styles.content}>
            <ThemedText type="subtitle">{t('calendar.title')}</ThemedText>

            <MonthCalendar selected={selected} onSelect={setSelected} dotsByDay={dotsByDay} />

            <View style={styles.filters}>
              {filters.map((item) => {
                const active = filter === item.value;
                return (
                  <Pressable
                    key={item.value}
                    accessibilityRole="button"
                    accessibilityLabel={item.label}
                    accessibilityState={{ selected: active }}
                    onPress={() => setFilter(item.value)}
                    style={[styles.filterCard, active && styles.filterCardActive]}>
                    <SymbolIcon {...item.icon} color={active ? '#FFFFFF' : '#111111'} size={20} />
                  </Pressable>
                );
              })}
            </View>

            <View style={styles.events}>
              <View style={styles.dayHeader}>
                <View style={styles.flex}>
                  <ThemedText style={styles.dayTitle}>{dayTitle}</ThemedText>
                  {dayEvents.length === 0 ? (
                    <ThemedText type="small" themeColor="textSecondary">
                      {t(filter === 'all' ? 'calendar.empty' : 'calendar.filterEmpty')}
                    </ThemedText>
                  ) : null}
                </View>
                <Pressable accessibilityRole="button" accessibilityLabel={t('tab.add')} onPress={() => router.push('/add-event')} style={styles.newBtn}>
                  <SymbolIcon ios="plus" material="add" color="#FFFFFF" size={20} />
                </Pressable>
              </View>
              {dayEvents.length > 0 ? <EventTimeline groups={groupByDay(dayEvents)} showDate={false} /> : null}
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
  scroll: { flexGrow: 1, paddingHorizontal: Spacing.four, paddingTop: Spacing.three, paddingBottom: TAB_BAR_SPACE },
  content: { width: '100%', maxWidth: 460, alignSelf: 'center', gap: Spacing.three },
  events: { gap: Spacing.three },
  filters: { flexDirection: 'row', gap: 6 },
  filterCard: { flex: 1, height: 48, borderRadius: 12, alignItems: 'center', justifyContent: 'center', backgroundColor: '#EFEFF1' },
  filterCardActive: { backgroundColor: '#111111' },
  filterText: { color: '#2B2B2B', fontSize: 10, lineHeight: 12, fontWeight: '500' },
  filterTextActive: { color: '#FFFFFF' },
  dayHeader: { flexDirection: 'row', alignItems: 'center', gap: Spacing.three },
  dayTitle: { fontSize: 20, fontWeight: '600' },
  newBtn: { flexDirection: 'row', alignItems: 'center', gap: 6, width: 44, height: 44, justifyContent: 'center', borderRadius: 22, backgroundColor: '#111111' },
});
