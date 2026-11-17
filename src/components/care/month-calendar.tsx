import { SymbolView } from 'expo-symbols';
import { Pressable, StyleSheet, View } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { CATEGORIES, type CareCategory } from '@/data/care';
import { Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';
import { useI18n } from '@/i18n/i18n-provider';
import { fromISODate, monthGrid, today, type ISODate } from '@/lib/dates';

type MonthCalendarProps = {
  year: number;
  month: number;
  onChangeMonth: (year: number, month: number) => void;
  selected?: ISODate;
  onSelect: (date: ISODate) => void;
  /** Categories with something planned on each day, drawn as colored dots. */
  markers?: Record<ISODate, CareCategory[]>;
};

const MAX_DOTS = 3;

export function MonthCalendar({
  year,
  month,
  onChangeMonth,
  selected,
  onSelect,
  markers = {},
}: MonthCalendarProps) {
  const theme = useTheme();
  const { t, formatMonth, locale } = useI18n();
  const todayISO = today();
  const cells = monthGrid(year, month);

  function shift(delta: number) {
    const date = new Date(year, month + delta, 1);
    onChangeMonth(date.getFullYear(), date.getMonth());
  }

  return (
    <View style={styles.root}>
      <View style={styles.header}>
        <ThemedText type="smallBold" style={styles.monthLabel}>
          {formatMonth(year, month)}
        </ThemedText>
        <View style={styles.nav}>
          <NavButton label={t.calendar.prevMonth} direction="left" onPress={() => shift(-1)} />
          <NavButton label={t.calendar.nextMonth} direction="right" onPress={() => shift(1)} />
        </View>
      </View>

      <View style={styles.week}>
        {t.time.weekdaysShort.map((label) => (
          <ThemedText key={label} type="small" themeColor="textSecondary" style={styles.weekday}>
            {label}
          </ThemedText>
        ))}
      </View>

      <View style={styles.grid}>
        {cells.map((date, index) => {
          if (!date) return <View key={`empty-${index}`} style={styles.cell} />;

          const isSelected = date === selected;
          const isToday = date === todayISO;
          // One dot per event (two vaccines on one day = two dots), "+N" past the limit.
          const dayEvents = markers[date] ?? [];
          const dots = dayEvents.slice(0, MAX_DOTS);
          const extra = dayEvents.length - dots.length;

          return (
            <Pressable
              key={date}
              accessibilityRole="button"
              accessibilityState={{ selected: isSelected }}
              accessibilityLabel={fromISODate(date).toLocaleDateString(locale, { dateStyle: 'full' })}
              onPress={() => onSelect(date)}
              style={styles.cell}>
              <View
                style={[
                  styles.day,
                  isToday && { borderColor: theme.primary, borderWidth: 1.5 },
                  isSelected && { backgroundColor: theme.primary, borderColor: theme.primary },
                ]}>
                <ThemedText
                  type="small"
                  style={{
                    color: isSelected ? theme.onPrimary : theme.text,
                    fontWeight: isToday || isSelected ? 700 : 500,
                  }}>
                  {fromISODate(date).getDate()}
                </ThemedText>
              </View>
              <View style={styles.dots}>
                {dots.map((category, dotIndex) => (
                  <View
                    key={`${category}-${dotIndex}`}
                    style={[styles.dot, { backgroundColor: CATEGORIES[category].color }]}
                  />
                ))}
                {extra > 0 && (
                  <ThemedText themeColor="textSecondary" style={styles.more}>
                    +{extra}
                  </ThemedText>
                )}
              </View>
            </Pressable>
          );
        })}
      </View>
    </View>
  );
}

function NavButton({
  label,
  direction,
  onPress,
}: {
  label: string;
  direction: 'left' | 'right';
  onPress: () => void;
}) {
  const theme = useTheme();
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={label}
      hitSlop={8}
      onPress={onPress}
      style={({ pressed }) => [
        styles.navButton,
        { backgroundColor: theme.backgroundElement },
        pressed && { opacity: 0.7 },
      ]}>
      <SymbolView
        name={
          direction === 'left'
            ? { ios: 'chevron.left', android: 'chevron_left', web: 'chevron_left' }
            : { ios: 'chevron.right', android: 'chevron_right', web: 'chevron_right' }
        }
        tintColor={theme.text}
        size={16}
      />
    </Pressable>
  );
}

const styles = StyleSheet.create({
  root: {
    gap: Spacing.two,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  monthLabel: {
    fontSize: 17,
  },
  nav: {
    flexDirection: 'row',
    gap: Spacing.two,
  },
  navButton: {
    width: 34,
    height: 34,
    borderRadius: 17,
    alignItems: 'center',
    justifyContent: 'center',
  },
  week: {
    flexDirection: 'row',
  },
  weekday: {
    width: `${100 / 7}%`,
    textAlign: 'center',
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  cell: {
    width: `${100 / 7}%`,
    alignItems: 'center',
    paddingVertical: Spacing.one,
    gap: 3,
  },
  day: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1.5,
    borderColor: 'transparent',
  },
  dots: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
    height: 8,
  },
  more: {
    fontSize: 9,
    lineHeight: 10,
    fontWeight: 700,
  },
  dot: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
});
