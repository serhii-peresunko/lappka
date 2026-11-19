import { useMemo, useState } from 'react';
import { ScrollView, StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { EventCard } from '@/components/ui/event-card';
import { MonthCalendar } from '@/components/ui/month-calendar';
import { Spacing } from '@/constants/theme';
import { KIND_COLORS } from '@/lib/event-kinds';
import { todayIso } from '@/lib/dates';
import { useSession } from '@/providers/session';

/** Calendar tab: a month calendar and the events of the chosen day. Events are added from the middle tab button. */
export default function CalendarScreen() {
  const { events } = useSession();
  const [selected, setSelected] = useState(todayIso);

  const dotsByDay = useMemo(() => {
    const map = new Map<string, string[]>();
    for (const event of events) map.set(event.date, [...(map.get(event.date) ?? []), KIND_COLORS[event.kind]]);
    return map;
  }, [events]);
  const dayEvents = useMemo(
    () =>
      events
        .filter((event) => event.date === selected)
        .sort((a, b) => (a.time ?? '').localeCompare(b.time ?? '')),
    [events, selected]
  );
  const dayTitle = new Date(`${selected}T12:00:00`).toLocaleDateString('en-US', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
  });

  return (
    <ThemedView style={styles.root}>
      <SafeAreaView style={styles.root} edges={['top']}>
        <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
          <View style={styles.content}>
            <ThemedText type="subtitle">Calendar</ThemedText>

            <MonthCalendar selected={selected} onSelect={setSelected} dotsByDay={dotsByDay} />

            <View style={styles.events}>
              <ThemedText type="smallBold" themeColor="textSecondary" style={styles.dayTitle}>
                {dayTitle}
              </ThemedText>
              {dayEvents.length === 0 ? (
                <ThemedText themeColor="textSecondary">Nothing planned for this day.</ThemedText>
              ) : (
                dayEvents.map((event) => (
                  <EventCard key={event.id} event={event} when={event.time ?? undefined} />
                ))
              )}
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
  scroll: { flexGrow: 1, paddingHorizontal: Spacing.four, paddingVertical: Spacing.four },
  content: { width: '100%', maxWidth: 460, alignSelf: 'center', gap: Spacing.four },
  events: { gap: Spacing.three },
  dayTitle: { fontSize: 14 },
});
