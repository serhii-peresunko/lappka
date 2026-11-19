import { useRouter } from 'expo-router';
import { useMemo, useState } from 'react';
import { ScrollView, StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { Button } from '@/components/ui/button';
import { MonthCalendar } from '@/components/ui/month-calendar';
import { Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';
import { KIND_COLORS, kindLabel } from '@/lib/event-kinds';
import { todayIso } from '@/lib/dates';
import { useSession } from '@/providers/session';

/** Calendar tab: a month calendar, the events of the chosen day and the Add event button. */
export default function CalendarScreen() {
  const theme = useTheme();
  const router = useRouter();
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
              <ThemedText type="smallBold" style={styles.dayTitle}>
                {dayTitle}
              </ThemedText>
              {dayEvents.length === 0 ? (
                <ThemedText themeColor="textSecondary">Nothing planned for this day.</ThemedText>
              ) : (
                dayEvents.map((event) => (
                  <View
                    key={event.id}
                    style={[styles.event, { backgroundColor: theme.backgroundElement, borderColor: theme.border }]}>
                    <View style={[styles.accent, { backgroundColor: KIND_COLORS[event.kind] }]} />
                    <View style={styles.flex}>
                      <ThemedText type="smallBold" style={styles.eventTitle}>
                        {event.title}
                      </ThemedText>
                      <ThemedText type="small" themeColor="textSecondary">
                        {kindLabel(event.kind)}
                        {event.time ? ` · ${event.time}` : ''}
                      </ThemedText>
                    </View>
                  </View>
                ))
              )}
            </View>
          </View>
        </ScrollView>

        <View style={styles.footer}>
          <View style={styles.footerInner}>
            <Button
              title="Add event"
              onPress={() => router.push({ pathname: '/add-event', params: { date: selected } })}
            />
          </View>
        </View>
      </SafeAreaView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  flex: { flex: 1 },
  scroll: { flexGrow: 1, paddingHorizontal: Spacing.four, paddingVertical: Spacing.four },
  content: { width: '100%', maxWidth: 460, alignSelf: 'center', gap: Spacing.four },
  events: { gap: Spacing.two },
  dayTitle: { fontSize: 17 },
  event: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.three,
    borderWidth: 1,
    borderRadius: 14,
    padding: Spacing.three,
  },
  accent: { width: 4, alignSelf: 'stretch', borderRadius: 2 },
  eventTitle: { fontSize: 16 },
  footer: { paddingHorizontal: Spacing.four, paddingBottom: Spacing.three, paddingTop: Spacing.two },
  footerInner: { width: '100%', maxWidth: 460, alignSelf: 'center' },
});
