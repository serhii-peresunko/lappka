import { useMemo, useState } from 'react';
import { ScrollView, StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { EventCard } from '@/components/ui/event-card';
import { MonthCalendar } from '@/components/ui/month-calendar';
import { Spacing, TAB_BAR_SPACE } from '@/constants/theme';
import { useI18n } from '@/i18n';
import { KIND_COLORS } from '@/lib/event-kinds';
import { todayIso } from '@/lib/dates';
import { useSession } from '@/providers/session';

/** Calendar tab: a month calendar and the events of the chosen day. Events are added from the middle tab button. */
export default function CalendarScreen() {
  const { events } = useSession();
  const { t, locale } = useI18n();
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

            <View style={styles.events}>
              <ThemedText type="smallBold" themeColor="textSecondary" style={styles.dayTitle}>
                {dayTitle}
              </ThemedText>
              {dayEvents.length === 0 ? (
                <ThemedText themeColor="textSecondary">{t('calendar.empty')}</ThemedText>
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
  scroll: { flexGrow: 1, paddingHorizontal: Spacing.four, paddingTop: Spacing.four, paddingBottom: TAB_BAR_SPACE },
  content: { width: '100%', maxWidth: 460, alignSelf: 'center', gap: Spacing.four },
  events: { gap: Spacing.three },
  dayTitle: { fontSize: 14 },
});
