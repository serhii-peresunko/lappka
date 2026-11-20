import { SymbolView } from 'expo-symbols';
import { useState } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';
import { SymbolIcon } from '@/components/ui/symbol-icon';
import { useI18n } from '@/i18n';
import { KIND_COLORS, KIND_ICONS } from '@/lib/event-kinds';
import type { EventKind } from '@/providers/session';
import { monthGrid, todayIso } from '@/lib/dates';

const DOTS_PER_ROW = 2;
const ICON = 14;
const MAX_DOTS = DOTS_PER_ROW * 2;
const WEEKDAY_KEYS = ['cal.wd0', 'cal.wd1', 'cal.wd2', 'cal.wd3', 'cal.wd4', 'cal.wd5', 'cal.wd6'] as const;

type MonthCalendarProps = {
  /** Selected day, YYYY-MM-DD. */
  selected: string;
  onSelect: (iso: string) => void;
  /** Event kinds per day (YYYY-MM-DD), one small icon per event; drawn 4 per row, up to 2 rows. */
  dotsByDay: Map<string, EventKind[]>;
};

/** Lays items out in at most two lines of two: 1 -> [1], 2 -> [2], 3 -> [2,1], 4 -> [2,2]. */
function splitInTwo<T>(items: T[]): T[][] {
  if (items.length === 0) return [];
  return [items.slice(0, DOTS_PER_ROW), items.slice(DOTS_PER_ROW)].filter((row) => row.length > 0);
}

/** A month grid with prev / next, a highlighted today and a dot under days with events. */
export function MonthCalendar({ selected, onSelect, dotsByDay }: MonthCalendarProps) {
  const theme = useTheme();
  const { t, locale } = useI18n();
  const [view, setView] = useState(() => {
    const [y, m] = selected.split('-').map(Number);
    return { year: y, month: m - 1 };
  });
  const today = todayIso();
  const cells = monthGrid(view.year, view.month);
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

  return (
    <View style={styles.root}>
      <View style={styles.header}>
        <View style={styles.titleWrap}>
          <ThemedText style={styles.month}>{monthName}</ThemedText>
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
          <Pressable accessibilityRole="button" accessibilityLabel={t('calendar.prev')} onPress={() => shift(-1)} style={styles.nav}>
            <SymbolView name={{ ios: 'chevron.left', android: 'chevron_left', web: 'chevron_left' }} tintColor={theme.text} size={14} />
          </Pressable>
          <Pressable accessibilityRole="button" accessibilityLabel={t('calendar.next')} onPress={() => shift(1)} style={styles.nav}>
            <SymbolView name={{ ios: 'chevron.right', android: 'chevron_right', web: 'chevron_right' }} tintColor={theme.text} size={14} />
          </Pressable>
        </View>
      </View>

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
          const dots = dotsByDay.get(cell.iso) ?? [];
          return (
            <Pressable
              key={cell.iso}
              accessibilityRole="button"
              accessibilityLabel={cell.iso}
              accessibilityState={{ selected: isSelected }}
              onPress={() => onSelect(cell.iso)}
              style={styles.cell}>
              <View
                style={[
                  styles.day,
                  isSelected && { backgroundColor: theme.text },
                  !isSelected && isToday && { backgroundColor: '#EFEFEF' },
                ]}>
                <ThemedText
                  type="small"
                  style={{
                    color: isSelected ? theme.background : cell.inMonth ? theme.text : theme.textSecondary,
                    opacity: cell.inMonth || isSelected ? 1 : 0.5,
                    fontWeight: isSelected || isToday ? 700 : 500,
                  }}>
                  {cell.day}
                </ThemedText>
              </View>
              <View style={styles.dots}>
                {splitInTwo(dots.slice(0, MAX_DOTS)).map((row, rowIndex) => (
                  <View key={rowIndex} style={styles.dotRow}>
                    {row.map((kind, index) => (
                      <SymbolIcon key={index} {...KIND_ICONS[kind]} color={KIND_COLORS[kind]} size={ICON} />
                    ))}
                  </View>
                ))}
              </View>
            </Pressable>
          );
        })}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { gap: Spacing.two, backgroundColor: '#FFFFFF' },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingBottom: Spacing.two },
  titleWrap: { flexDirection: 'row', alignItems: 'baseline', gap: 6 },
  month: { fontSize: 17, lineHeight: 24, fontWeight: '700' },
  year: { fontSize: 17, color: '#8A8A8A', fontWeight: '500' },
  controls: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  nav: { width: 30, height: 30, borderRadius: 15, backgroundColor: '#FFFFFF', borderWidth: StyleSheet.hairlineWidth, borderColor: '#D8D8D8', alignItems: 'center', justifyContent: 'center' },
  todayBtn: { height: 30, paddingHorizontal: 12, borderRadius: 15, backgroundColor: '#111111', alignItems: 'center', justifyContent: 'center' },
  todayText: { color: '#FFFFFF', fontSize: 13 },
  week: { flexDirection: 'row' },
  weekday: { flex: 1, textAlign: 'center' },
  grid: { flexDirection: 'row', flexWrap: 'wrap' },
  cell: { width: `${100 / 7}%`, minHeight: 48, alignItems: 'center', justifyContent: 'flex-start', paddingVertical: 2, gap: 2 },
  day: { width: 36, height: 36, borderRadius: 13, alignItems: 'center', justifyContent: 'center' },
  // A single row stays centered under the number; once it wraps, rows start at the left edge.
  dots: { alignItems: 'center', gap: 2 },
  dotRow: { flexDirection: 'row', gap: 2 },
});
