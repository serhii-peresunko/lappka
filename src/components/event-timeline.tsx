import { StyleSheet, View } from 'react-native';

import { ListRow } from '@/components/ui/list-row';
import { Colors, Radius } from '@/constants/theme';
import { useEventActions } from '@/hooks/use-event-actions';
import { useI18n } from '@/i18n';
import { KIND_COLORS, KIND_ICONS, KIND_SOFT, kindKey } from '@/lib/event-kinds';
import type { PetEvent } from '@/providers/session';

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
 * Events as separate white cards. A tap opens the event in the bottom sheet (change or delete).
 * `withDate` adds the day to each card, for lists that span several days.
 */
export function EventTimeline({ groups, withDate = false }: { groups: Group[]; withDate?: boolean }) {
  const { t, locale } = useI18n();
  const openEvent = useEventActions();

  return (
    <View style={styles.list}>
      {groups.flatMap((group) =>
        group.items.map((event) => {
          const day = new Date(`${event.date}T12:00:00`).toLocaleDateString(locale, { day: 'numeric', month: 'short' }).replace('.', '');
          const subtitle = [withDate ? day : '', event.time ?? t('event.allDay'), event.description].filter(Boolean).join(' · ');
          return (
            <View key={event.id} style={styles.card}>
              <ListRow
                title={t(kindKey(event.kind))}
                subtitle={subtitle}
                icon={{ ...KIND_ICONS[event.kind], color: KIND_COLORS[event.kind], tint: KIND_SOFT[event.kind] }}
                onPress={() => openEvent(event)}
              />
            </View>
          );
        })
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  list: { gap: 8 },
  card: { borderRadius: Radius.card, backgroundColor: Colors.light.surface },
});
