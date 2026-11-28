import { Pressable, StyleSheet, View } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { Colors, Radius } from '@/constants/theme';
import { useI18n } from '@/i18n';
import { todayIso, toIso } from '@/lib/dates';

type DayStripProps = {
  /** Days (YYYY-MM-DD) that have events: they get a dot. */
  marked: Set<string>;
  selected: string;
  onSelect: (date: string) => void;
};

/** This week as seven capsules, Monday first: the weekday's letter over the day number. */
export function DayStrip({ marked, selected, onSelect }: DayStripProps) {
  const { locale } = useI18n();
  const today = todayIso();
  const monday = new Date(`${today}T12:00:00`);
  monday.setDate(monday.getDate() - ((monday.getDay() + 6) % 7));
  const days = Array.from({ length: 7 }, (_, index) => {
    const date = new Date(monday);
    date.setDate(monday.getDate() + index);
    return date;
  });

  return (
    <View style={styles.row}>
      {days.map((date) => {
        const iso = toIso(date);
        const active = iso === selected;
        return (
          <Pressable
            key={iso}
            accessibilityRole="button"
            accessibilityLabel={date.toLocaleDateString(locale, { weekday: 'long', day: 'numeric', month: 'long' })}
            accessibilityState={{ selected: active }}
            onPress={() => onSelect(iso)}
            style={({ pressed }) => [styles.day, active && styles.dayActive, pressed && { opacity: 0.6 }]}>
            <ThemedText style={styles.letter}>{date.toLocaleDateString(locale, { weekday: 'short' }).slice(0, 2).toUpperCase()}</ThemedText>
            <ThemedText style={[styles.number, iso === today && styles.todayNumber]}>{date.getDate()}</ThemedText>
            <View style={[styles.dot, marked.has(iso) && styles.dotOn]} />
          </Pressable>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', gap: 6 },
  day: { flex: 1, height: 70, borderRadius: Radius.pill, alignItems: 'center', justifyContent: 'center', gap: 3, backgroundColor: 'rgba(255,255,255,0.55)' },
  dayActive: { backgroundColor: Colors.light.surface, borderWidth: 1.5, borderColor: Colors.light.text },
  letter: { color: Colors.light.textSecondary, fontSize: 11, lineHeight: 14, fontWeight: '500' },
  number: { fontSize: 16, lineHeight: 20, fontWeight: '600', fontVariant: ['tabular-nums'] },
  todayNumber: { fontWeight: '800' },
  dot: { width: 5, height: 5, borderRadius: 3 },
  dotOn: { backgroundColor: Colors.light.text },
});
