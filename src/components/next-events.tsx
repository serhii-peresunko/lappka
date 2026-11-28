import { useRouter } from 'expo-router';
import { useMemo } from 'react';
import { Pressable, ScrollView, StyleSheet, View } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { Button } from '@/components/ui/button';
import { SymbolIcon } from '@/components/ui/symbol-icon';
import { Colors, Spacing } from '@/constants/theme';
import { useEventActions } from '@/hooks/use-event-actions';
import { useI18n } from '@/i18n';
import { todayIso } from '@/lib/dates';
import { KIND_ICONS, kindKey } from '@/lib/event-kinds';
import { upcomingEvents } from '@/lib/repeat';
import { useSession } from '@/providers/session';

const MAX_CARDS = 20;
const CARD_WIDTH = 177;
// A square with 16 on every side: one block at the top, one at the bottom.
const CARD_HEIGHT = CARD_WIDTH;
const GAP = 8;

/**
 * The next events as square cards in a sideways row: the kind's name at the top; at the bottom the
 * date and time on the left and the kind's icon on the right. A tap opens the event.
 */
export function NextEvents() {
  const { t, locale } = useI18n();
  const router = useRouter();
  const { events } = useSession();
  const openEvent = useEventActions();
  const upcoming = useMemo(() => upcomingEvents(events).slice(0, MAX_CARDS), [events]);

  const today = todayIso();

  if (upcoming.length === 0) {
    return (
      <View style={styles.empty}>
        <ThemedText style={styles.emptyText}>{t('home.nothing')}</ThemedText>
        <Button title={t('home.addEvent')} onPress={() => router.push('/add-event')} />
      </View>
    );
  }

  return (
    <ScrollView
      horizontal
      // Responds to a swipe even when there are too few cards to move.
      alwaysBounceHorizontal
      showsHorizontalScrollIndicator={false}
      decelerationRate="fast"
      snapToInterval={CARD_WIDTH + GAP}
      style={styles.scroll}
      contentContainerStyle={styles.row}>
      {upcoming.map((event) => {
        const date = new Date(`${event.date}T12:00:00`);
        const shortDay = date.toLocaleDateString(locale, { weekday: 'short' }).replace('.', '');
        const weekday = shortDay.charAt(0).toUpperCase() + shortDay.slice(1).toLowerCase();
        const dayMonth = date.toLocaleDateString(locale, { day: 'numeric', month: 'short' }).replace('.', '');
        return (
          <Pressable
            key={event.id}
            accessibilityRole="button"
            onPress={() => openEvent(event)}
            style={({ pressed }) => [styles.card, pressed && { opacity: 0.7 }]}>
            {/* Top: what it is. The owner's note is shown when the event is opened. */}
            <ThemedText style={styles.title} numberOfLines={2}>
              {t(kindKey(event.kind))}
            </ThemedText>
            {/* Bottom: the date (or "Today") over the time on the left, the kind's icon on the right. */}
            <View style={styles.bottom}>
              <View style={styles.when}>
                <ThemedText style={styles.date} numberOfLines={1}>
                  {/* Today is named; every other day shows its short weekday and date: "Нд, 29 лист". */}
                  {event.date === today ? t('today') : `${weekday}, ${dayMonth}`}
                </ThemedText>
                <ThemedText style={event.time ? styles.time : styles.allDay} numberOfLines={1}>
                  {event.time ?? t('event.allDay')}
                </ThemedText>
              </View>
              <View style={styles.kindCircle}>
                <SymbolIcon {...KIND_ICONS[event.kind]} color={Colors.light.text} size={20} />
              </View>
            </View>
          </Pressable>
        );
      })}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  // The row runs to the screen edges, so the next card peeks in.
  scroll: { marginHorizontal: -Spacing.three, flexGrow: 0 },
  row: { gap: GAP, paddingHorizontal: Spacing.three },
  card: { width: CARD_WIDTH, height: CARD_HEIGHT, padding: 16, justifyContent: 'space-between', borderRadius: 12, backgroundColor: Colors.light.surface },
  bottom: { flexDirection: 'row', alignItems: 'flex-end', gap: 8 },
  // As tall as the icon circle beside it.
  when: { flex: 1, height: 48, justifyContent: 'center' },
  kindCircle: { width: 48, height: 48, borderRadius: 24, alignItems: 'center', justifyContent: 'center', backgroundColor: Colors.light.raised },
  time: { fontSize: 28, lineHeight: 32, fontWeight: '600', letterSpacing: -0.8, fontVariant: ['tabular-nums'] },
  // Words are wider than digits, so "All day" is set smaller, on the same line height.
  allDay: { fontSize: 15, lineHeight: 32, fontWeight: '600' },
  date: { color: Colors.light.textSecondary, fontSize: 12, lineHeight: 15, fontWeight: '500' },
  title: { fontSize: 17, lineHeight: 20, fontWeight: '700', letterSpacing: -0.4 },
  empty: { gap: 12, padding: 16, borderRadius: 12, backgroundColor: Colors.light.surface },
  emptyText: { color: Colors.light.textSecondary, fontSize: 14, lineHeight: 20, textAlign: 'center' },
});
