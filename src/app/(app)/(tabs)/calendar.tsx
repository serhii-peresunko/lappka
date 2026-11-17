import { useRouter } from 'expo-router';
import { useMemo, useState } from 'react';
import { StyleSheet, View } from 'react-native';

import { MonthCalendar } from '@/components/care/month-calendar';
import { RecordRow } from '@/components/care/record-row';
import { ThemedText } from '@/components/themed-text';
import { Button } from '@/components/ui/button';
import { ChipGroup } from '@/components/ui/chip';
import { EmptyState, IconButton, Screen, SectionTitle } from '@/components/ui/screen';
import { CATEGORIES, CATEGORY_ORDER, type CareCategory } from '@/data/care';
import { CardShadow, Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';
import { useI18n } from '@/i18n/i18n-provider';
import { fromISODate, today, type ISODate } from '@/lib/dates';
import { useCare } from '@/providers/care-provider';

type Filter = CareCategory | 'all';

export default function CalendarScreen() {
  const theme = useTheme();
  const router = useRouter();
  const { records } = useCare();
  const { t, formatDate } = useI18n();

  const filterOptions = [
    { value: 'all' as Filter, label: t.calendar.all },
    ...CATEGORY_ORDER.map((category) => ({
      value: category as Filter,
      label: t.categories[category].short,
      color: CATEGORIES[category].color,
    })),
  ];

  const initial = fromISODate(today());
  const [year, setYear] = useState(initial.getFullYear());
  const [month, setMonth] = useState(initial.getMonth());
  const [selected, setSelected] = useState<ISODate>(today());
  const [filter, setFilter] = useState<Filter>('all');

  const visible = useMemo(
    () => (filter === 'all' ? records : records.filter((record) => record.category === filter)),
    [records, filter]
  );

  const markers = useMemo(() => {
    const map: Record<ISODate, CareCategory[]> = {};
    for (const record of visible) {
      (map[record.date] ??= []).push(record.category);
    }
    return map;
  }, [visible]);

  const monthPrefix = `${year}-${String(month + 1).padStart(2, '0')}`;
  const onSelected = visible.filter((record) => record.date === selected);
  const restOfMonth = visible.filter(
    (record) => record.date.startsWith(monthPrefix) && record.date > selected && !record.done
  );

  return (
    <Screen
      title={t.calendar.title}
      action={
        <IconButton
          icon={{ ios: 'plus', android: 'add', web: 'add' }}
          label={t.calendar.add}
          onPress={() => router.push({ pathname: '/record', params: { date: selected } })}
        />
      }>
      <ChipGroup options={filterOptions} value={filter} onChange={setFilter} scroll />

      <View style={[styles.calendarCard, CardShadow, { backgroundColor: theme.backgroundElement }]}>
        <MonthCalendar
          year={year}
          month={month}
          onChangeMonth={(nextYear, nextMonth) => {
            setYear(nextYear);
            setMonth(nextMonth);
          }}
          selected={selected}
          onSelect={setSelected}
          markers={markers}
        />
      </View>

      <SectionTitle
        trailing={
          selected !== today() ? (
            <Button
              variant="ghost"
              title={t.calendar.jumpToday}
              onPress={() => {
                const now = fromISODate(today());
                setYear(now.getFullYear());
                setMonth(now.getMonth());
                setSelected(today());
              }}
            />
          ) : null
        }>
        {formatDate(selected, { weekday: 'long', month: 'long', year: undefined })}
      </SectionTitle>
      {onSelected.length > 0 ? (
        onSelected.map((record) => <RecordRow key={record.id} record={record} showDate={false} />)
      ) : (
        <EmptyState title={t.calendar.nothingOnDay} hint={t.calendar.tapPlus} />
      )}

      {restOfMonth.length > 0 && (
        <>
          <SectionTitle>{t.calendar.laterThisMonth}</SectionTitle>
          {restOfMonth.map((record) => (
            <RecordRow key={record.id} record={record} />
          ))}
        </>
      )}

      <View style={styles.legend}>
        {CATEGORY_ORDER.map((category) => (
          <View key={category} style={styles.legendItem}>
            <View style={[styles.legendDot, { backgroundColor: CATEGORIES[category].color }]} />
            <ThemedText type="small" themeColor="textSecondary">
              {t.categories[category].short}
            </ThemedText>
          </View>
        ))}
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  calendarCard: {
    borderRadius: 20,
    padding: Spacing.three,
  },
  legend: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.three,
    marginTop: Spacing.two,
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.one + Spacing.half,
  },
  legendDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
});
