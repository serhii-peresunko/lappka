import { useLocalSearchParams, useRouter } from 'expo-router';
import { useMemo, useState } from 'react';

import { RecordRow } from '@/components/care/record-row';
import { ChipGroup } from '@/components/ui/chip';
import { EmptyState, IconButton, Screen, SectionTitle } from '@/components/ui/screen';
import { CATEGORIES, CATEGORY_ORDER, isCategory, type CareCategory } from '@/data/care';
import { useI18n } from '@/i18n/i18n-provider';
import { today } from '@/lib/dates';
import { useCare } from '@/providers/care-provider';

type Filter = CareCategory | 'all';
type Mode = 'upcoming' | 'history';

export default function CareScreen() {
  const router = useRouter();
  const params = useLocalSearchParams<{ category?: string }>();
  const { records } = useCare();
  const { t } = useI18n();

  const filterOptions = [
    { value: 'all' as Filter, label: t.care.all },
    ...CATEGORY_ORDER.map((category) => ({
      value: category as Filter,
      label: t.categories[category].short,
      color: CATEGORIES[category].color,
    })),
  ];
  const viewOptions = [
    { value: 'upcoming' as Mode, label: t.care.planned },
    { value: 'history' as Mode, label: t.care.history },
  ];

  const [filter, setFilter] = useState<Filter>(isCategory(params.category) ? params.category : 'all');
  const [view, setView] = useState<Mode>('upcoming');

  // Follow "At a glance" taps on the Today tab, which arrive as a route param.
  const [lastParam, setLastParam] = useState(params.category);
  if (params.category !== lastParam) {
    setLastParam(params.category);
    if (isCategory(params.category)) setFilter(params.category);
  }

  const todayISO = today();
  const filtered = useMemo(
    () => (filter === 'all' ? records : records.filter((record) => record.category === filter)),
    [records, filter]
  );
  const overdue = filtered.filter((record) => !record.done && record.date < todayISO);
  const planned = filtered.filter((record) => !record.done && record.date >= todayISO);
  const history = filtered.filter((record) => record.done).reverse();

  return (
    <Screen
      title={t.care.title}
      subtitle={t.care.subtitle}
      action={
        <IconButton
          icon={{ ios: 'plus', android: 'add', web: 'add' }}
          label={t.care.add}
          onPress={() =>
            router.push({ pathname: '/record', params: filter === 'all' ? {} : { category: filter } })
          }
        />
      }>
      <ChipGroup options={filterOptions} value={filter} onChange={setFilter} scroll />
      <ChipGroup options={viewOptions} value={view} onChange={setView} />

      {view === 'upcoming' ? (
        <>
          {overdue.length > 0 && (
            <>
              <SectionTitle>{t.care.overdue}</SectionTitle>
              {overdue.map((record) => (
                <RecordRow key={record.id} record={record} />
              ))}
            </>
          )}
          <SectionTitle>{t.care.planned}</SectionTitle>
          {planned.length > 0 ? (
            planned.map((record) => <RecordRow key={record.id} record={record} />)
          ) : (
            <EmptyState title={t.care.noPlanned} hint={t.care.tapPlus} />
          )}
        </>
      ) : (
        <>
          <SectionTitle>{t.care.done}</SectionTitle>
          {history.length > 0 ? (
            history.map((record) => <RecordRow key={record.id} record={record} />)
          ) : (
            <EmptyState title={t.care.noHistory} hint={t.care.noHistoryHint} />
          )}
        </>
      )}
    </Screen>
  );
}
