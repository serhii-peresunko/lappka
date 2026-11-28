import { useRouter } from 'expo-router';
import { useMemo, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { EventTimeline, groupByDay } from '@/components/event-timeline';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { MonthCalendar } from '@/components/ui/month-calendar';
import { IconButton } from '@/components/ui/icon-button';
import { SymbolIcon } from '@/components/ui/symbol-icon';
import { Colors, Radius, Spacing, TAB_BAR_SPACE } from '@/constants/theme';
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
                    style={({ pressed }) => [styles.filterCard, active && styles.filterCardActive, pressed && { opacity: 0.7 }]}>
                    <SymbolIcon {...item.icon} color={active ? Colors.light.onPrimary : Colors.light.text} size={18} />
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
                <IconButton label={t('tab.add')} icon={{ ios: 'plus', material: 'add' }} tone="accent" onPress={() => router.push({ pathname: '/add-event', params: filter === 'all' ? { date: selected } : { date: selected, kind: filter } })} />
              </View>
              {dayEvents.length > 0 ? <EventTimeline groups={groupByDay(dayEvents)} /> : null}
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
  scroll: { flexGrow: 1, paddingHorizontal: Spacing.three, paddingTop: Spacing.two, paddingBottom: TAB_BAR_SPACE },
  content: { width: '100%', maxWidth: 460, alignSelf: 'center', gap: 12 },
  events: { gap: 10, paddingTop: 4 },
  filters: { flexDirection: 'row', gap: 6 },
  filterCard: { flex: 1, height: 40, borderRadius: Radius.pill, alignItems: 'center', justifyContent: 'center', backgroundColor: Colors.light.surface },
  filterCardActive: { backgroundColor: Colors.light.primary },
  dayHeader: { flexDirection: 'row', alignItems: 'center', gap: Spacing.three, paddingLeft: 4 },
  dayTitle: { fontSize: 18, lineHeight: 24, fontWeight: '600', letterSpacing: -0.2 },
});
