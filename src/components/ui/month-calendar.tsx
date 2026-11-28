import { useMemo, useState } from 'react';
import { PanResponder, Pressable, StyleSheet, View } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { IconButton } from '@/components/ui/icon-button';
import { Colors, Radius, Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';
import { useI18n } from '@/i18n';
import { monthGrid, todayIso } from '@/lib/dates';
import type { EventKind } from '@/providers/session';

const WEEKDAY_KEYS = ['cal.wd0', 'cal.wd1', 'cal.wd2', 'cal.wd3', 'cal.wd4', 'cal.wd5', 'cal.wd6'] as const;

type MonthCalendarProps = {
  /** Selected day, YYYY-MM-DD. */
  selected: string;
  onSelect: (iso: string) => void;
  /** Event kinds per day (YYYY-MM-DD); a day with any is filled yellow. */
  dotsByDay: Map<string, EventKind[]>;
};

/** A month grid with prev / next. Days with events are yellow, today is ringed, the chosen day is black. */
export function MonthCalendar({ selected, onSelect, dotsByDay }: MonthCalendarProps) {
  const theme = useTheme();
  const { t, locale } = useI18n();
  const [view, setView] = useState(() => {
    const [y, m] = selected.split('-').map(Number);
    return { year: y, month: m - 1 };
  });
  const today = todayIso();
  // A sixth week that belongs wholly to the next month is dropped, so the day's events sit higher.
  const grid = monthGrid(view.year, view.month);
  const cells = grid.slice(35).some((cell) => cell.inMonth) ? grid : grid.slice(0, 35);
  const rawMonth = new Date(view.year, view.month, 1).toLocaleDateString(locale, { month: 'long' });
  const monthName = rawMonth.charAt(0).toUpperCase() + rawMonth.slice(1);
  const now = new Date();
  const isCurrent = view.year === now.getFullYear() && view.month === now.getMonth();
  const goToday = () => {
    setView({ year: now.getFullYear(), month: now.getMonth() });
    onSelect(today);
  };

  const shift = (delta: number) => {
    const next = new Date(view.year, view.month + delta, 1);
    setView({ year: next.getFullYear(), month: next.getMonth() });
  };

  // A sideways swipe over the grid turns the month; taps and vertical scrolling pass through.
  const swipe = useMemo(
    () =>
      PanResponder.create({
        onMoveShouldSetPanResponder: (_, g) => Math.abs(g.dx) > 24 && Math.abs(g.dx) > Math.abs(g.dy) * 1.6,
        onPanResponderRelease: (_, g) => {
          if (Math.abs(g.dx) < 48) return;
          setView((current) => {
            const next = new Date(current.year, current.month + (g.dx < 0 ? 1 : -1), 1);
            return { year: next.getFullYear(), month: next.getMonth() };
          });
        },
      }),
    []
  );

  return (
    <View style={styles.root}>
      <View style={styles.header}>
        <View style={styles.titleWrap}>
          <ThemedText style={styles.month} numberOfLines={1} adjustsFontSizeToFit>
            {monthName}
          </ThemedText>
          <ThemedText style={styles.year}>{view.year}</ThemedText>
        </View>
        <View style={styles.controls}>
          {!isCurrent ? (
            <Pressable accessibilityRole="button" onPress={goToday} style={styles.todayBtn}>
              <ThemedText type="smallBold" style={styles.todayText}>
                {t('today')}
              </ThemedText>
            </Pressable>
          ) : null}
          <IconButton label={t('calendar.prev')} icon={{ ios: 'chevron.left', material: 'chevron_left' }} size={40} onPress={() => shift(-1)} />
          <IconButton label={t('calendar.next')} icon={{ ios: 'chevron.right', material: 'chevron_right' }} size={40} onPress={() => shift(1)} />
        </View>
      </View>

      <View style={styles.card} {...swipe.panHandlers}>
      <View style={styles.week}>
        {WEEKDAY_KEYS.map((key) => (
          <ThemedText key={key} type="small" themeColor="textSecondary" style={styles.weekday}>
            {t(key)}
          </ThemedText>
        ))}
      </View>

      <View style={styles.grid}>
        {cells.map((cell) => {
          const isSelected = cell.iso === selected;
          const isToday = cell.iso === today;
          const kinds = dotsByDay.get(cell.iso) ?? [];
          const dateLabel = new Date(`${cell.iso}T12:00:00`).toLocaleDateString(locale, {
            weekday: 'long',
            day: 'numeric',
            month: 'long',
            year: 'numeric',
          });
          return (
            <Pressable
              key={cell.iso}
              accessibilityRole="button"
              accessibilityLabel={dateLabel}
              accessibilityState={{ selected: isSelected }}
              onPress={() => onSelect(cell.iso)}
              style={({ pressed }) => [styles.cell, pressed && { opacity: 0.6 }]}>
              <View
                style={[styles.day, kinds.length > 0 && styles.dayMarked, isToday && styles.todayRing, isSelected && styles.daySelected]}>
                <ThemedText
                  type="small"
                  style={{
                    color: isSelected ? theme.onPrimary : cell.inMonth ? theme.text : theme.textTertiary,
                    fontWeight: isSelected || isToday ? 700 : 500,
                  }}>
                  {cell.day}
                </ThemedText>
              </View>
            </Pressable>
          );
        })}
      </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { gap: 14 },
  card: { gap: Spacing.two, backgroundColor: Colors.light.surface, borderRadius: Radius.card, paddingHorizontal: 8, paddingTop: 14, paddingBottom: 6 },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: 8 },
  titleWrap: { flex: 1, flexDirection: 'row', alignItems: 'baseline', gap: 6, paddingLeft: 4 },
  month: { flexShrink: 1, fontSize: 24, lineHeight: 30, fontWeight: '600', letterSpacing: -0.4 },
  year: { fontSize: 16, color: Colors.light.textSecondary, fontWeight: '500' },
  controls: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  todayBtn: { height: 40, paddingHorizontal: 14, borderRadius: Radius.pill, backgroundColor: Colors.light.primary, alignItems: 'center', justifyContent: 'center' },
  todayText: { color: Colors.light.onPrimary, fontSize: 13 },
  week: { flexDirection: 'row' },
  weekday: { flex: 1, textAlign: 'center', color: Colors.light.textSecondary, fontSize: 11, lineHeight: 16, fontWeight: '500' },
  grid: { flexDirection: 'row', flexWrap: 'wrap' },
  // Just under a seventh: an exact 100/7 can round up and push Sunday onto the next row.
  cell: { width: '14.28%', height: 44, alignItems: 'center', justifyContent: 'center' },
  day: { width: 36, height: 36, borderRadius: 18, alignItems: 'center', justifyContent: 'center' },
  dayMarked: { backgroundColor: Colors.light.accent },
  todayRing: { borderWidth: 1.5, borderColor: Colors.light.text },
  daySelected: { backgroundColor: Colors.light.primary },
});
