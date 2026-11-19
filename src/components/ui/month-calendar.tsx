import { SymbolView } from 'expo-symbols';
import { useState } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';
import { useI18n } from '@/i18n';
import { monthGrid, todayIso } from '@/lib/dates';

const DOTS_PER_ROW = 4;
const MAX_DOTS = DOTS_PER_ROW * 2;
const WEEKDAY_KEYS = ['cal.wd0', 'cal.wd1', 'cal.wd2', 'cal.wd3', 'cal.wd4', 'cal.wd5', 'cal.wd6'] as const;

type MonthCalendarProps = {
  /** Selected day, YYYY-MM-DD. */
  selected: string;
  onSelect: (iso: string) => void;
  /** Dot colors per day (YYYY-MM-DD), one per event; drawn 4 per row, up to 2 rows. */
  dotsByDay: Map<string, string[]>;
};

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
  const title = new Date(view.year, view.month, 1).toLocaleDateString(locale, { month: 'long', year: 'numeric' });

  const shift = (delta: number) => {
    const next = new Date(view.year, view.month + delta, 1);
    setView({ year: next.getFullYear(), month: next.getMonth() });
  };

  return (
    <View style={styles.root}>
      <View style={styles.header}>
        <Pressable accessibilityRole="button" accessibilityLabel={t('calendar.prev')} onPress={() => shift(-1)} style={styles.nav}>
          <SymbolView name={{ ios: 'chevron.left', android: 'chevron_left', web: 'chevron_left' }} tintColor={theme.text} size={18} />
        </Pressable>
        <ThemedText type="smallBold" style={styles.title}>
          {title}
        </ThemedText>
        <Pressable accessibilityRole="button" accessibilityLabel={t('calendar.next')} onPress={() => shift(1)} style={styles.nav}>
          <SymbolView name={{ ios: 'chevron.right', android: 'chevron_right', web: 'chevron_right' }} tintColor={theme.text} size={18} />
        </Pressable>
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
                  !isSelected && isToday && { borderColor: theme.text, borderWidth: 1.5 },
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
              <View style={[styles.dots, dots.length > DOTS_PER_ROW && styles.dotsWrapped]}>
                {dots.slice(0, MAX_DOTS).map((color, index) => (
                  <View key={index} style={[styles.dot, { backgroundColor: color }]} />
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
  root: { gap: Spacing.two },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  nav: { width: 44, height: 44, alignItems: 'center', justifyContent: 'center' },
  title: { fontSize: 17 },
  week: { flexDirection: 'row' },
  weekday: { flex: 1, textAlign: 'center' },
  grid: { flexDirection: 'row', flexWrap: 'wrap' },
  cell: { width: `${100 / 7}%`, height: 54, alignItems: 'center', justifyContent: 'flex-start', paddingTop: 2, gap: 2 },
  day: { width: 36, height: 36, borderRadius: 18, alignItems: 'center', justifyContent: 'center' },
  // A single row stays centered under the number; once it wraps, rows start at the left edge.
  dotsWrapped: { justifyContent: 'flex-start' },
  dots: {
    width: DOTS_PER_ROW * 5 + (DOTS_PER_ROW - 1) * 2,
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    gap: 2,
  },
  dot: { width: 5, height: 5, borderRadius: 3 },
});
