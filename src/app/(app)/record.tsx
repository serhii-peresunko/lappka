import { useLocalSearchParams, useRouter } from 'expo-router';
import { useState } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';

import { MonthCalendar } from '@/components/care/month-calendar';
import { ThemedText } from '@/components/themed-text';
import { Button } from '@/components/ui/button';
import { ChipGroup } from '@/components/ui/chip';
import { FieldLabel, FormSheet } from '@/components/ui/form-sheet';
import { TextField } from '@/components/ui/text-field';
import { Toggle } from '@/components/ui/toggle';
import {
  CATEGORIES,
  CATEGORY_ORDER,
  isCategory,
  REPEAT_ORDER,
  type CareCategory,
  type Repeat,
} from '@/data/care';
import { Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';
import { confirmDestructive } from '@/lib/confirm';
import { useI18n } from '@/i18n/i18n-provider';
import { fromISODate, today, type ISODate } from '@/lib/dates';
import { useCare } from '@/providers/care-provider';

const ISO_PATTERN = /^\d{4}-\d{2}-\d{2}$/;

/** Add a new care entry, or edit / delete one when `id` is passed. */
export default function RecordScreen() {
  const theme = useTheme();
  const router = useRouter();
  const params = useLocalSearchParams<{ id?: string; date?: string; category?: string }>();
  const { getRecord, addRecord, updateRecord, deleteRecord } = useCare();
  const { t, formatDate } = useI18n();

  const categoryOptions = CATEGORY_ORDER.map((category) => ({
    value: category,
    label: t.categories[category].label,
    color: CATEGORIES[category].color,
  }));
  const repeatOptions = REPEAT_ORDER.map((repeat) => ({ value: repeat, label: t.repeat[repeat] }));

  const existing = params.id ? getRecord(params.id) : undefined;
  const initialCategory = existing?.category ?? (isCategory(params.category) ? params.category : 'vaccination');
  const initialDate =
    existing?.date ?? (params.date && ISO_PATTERN.test(params.date) ? params.date : today());

  const [category, setCategory] = useState<CareCategory>(initialCategory);
  const [title, setTitle] = useState(existing?.title ?? '');
  const [date, setDate] = useState<ISODate>(initialDate);
  const [repeat, setRepeat] = useState<Repeat>(existing?.repeat ?? CATEGORIES[initialCategory].defaultRepeat);
  const [details, setDetails] = useState(existing?.details ?? '');
  const [notes, setNotes] = useState(existing?.notes ?? '');
  const [done, setDone] = useState(existing?.done ?? false);
  const [titleMissing, setTitleMissing] = useState(false);
  const [pickingDate, setPickingDate] = useState(false);

  const shown = fromISODate(date);
  const [calendarYear, setCalendarYear] = useState(shown.getFullYear());
  const [calendarMonth, setCalendarMonth] = useState(shown.getMonth());

  const text = t.categories[category];
  const close = () => (router.canGoBack() ? router.back() : router.replace('/'));

  function changeCategory(next: CareCategory) {
    setCategory(next);
    // Only nudge the repeat for new entries; edits keep what the user chose.
    if (!existing) setRepeat(CATEGORIES[next].defaultRepeat);
  }

  function save() {
    if (!title.trim()) {
      setTitleMissing(true);
      return;
    }
    const input = {
      category,
      title: title.trim(),
      date,
      repeat,
      details: details.trim() || undefined,
      notes: notes.trim() || undefined,
      done,
    };
    if (existing) {
      updateRecord(existing.id, input);
    } else {
      addRecord(input);
    }
    close();
  }

  async function remove() {
    if (!existing) return;
    const ok = await confirmDestructive({
      title: t.record.deleteTitle,
      message: t.record.deleteMessage(existing.title),
      confirmLabel: t.common.delete,
      cancelLabel: t.common.cancel,
    });
    if (ok) {
      deleteRecord(existing.id);
      close();
    }
  }

  if (params.id && !existing) {
    return (
      <FormSheet title={t.record.notFound} onCancel={close} onSave={close} saveLabel={t.common.close}>
        <ThemedText themeColor="textSecondary">{t.record.notFoundText}</ThemedText>
      </FormSheet>
    );
  }

  return (
    <FormSheet title={existing ? t.record.editTitle : t.record.newTitle} onCancel={close} onSave={save}>
      <View style={styles.group}>
        <FieldLabel>{t.record.type}</FieldLabel>
        <ChipGroup options={categoryOptions} value={category} onChange={changeCategory} />
      </View>

      <TextField
        label={t.record.name}
        placeholder={text.titlePlaceholder}
        value={title}
        onChangeText={(value) => {
          setTitle(value);
          if (titleMissing) setTitleMissing(false);
        }}
        error={titleMissing ? t.validation.titleRequired : undefined}
        autoCapitalize="sentences"
        autoFocus={!existing}
        returnKeyType="next"
      />

      <View style={styles.group}>
        <FieldLabel>{t.record.date}</FieldLabel>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel={t.record.dateA11y(formatDate(date))}
          onPress={() => setPickingDate((value) => !value)}
          style={[
            styles.dateButton,
            {
              backgroundColor: theme.backgroundElement,
              borderColor: pickingDate ? theme.primary : theme.border,
            },
          ]}>
          <ThemedText>{formatDate(date, { weekday: 'short' })}</ThemedText>
          <ThemedText type="smallBold" themeColor="primary">
            {pickingDate ? t.record.doneChoosing : t.record.change}
          </ThemedText>
        </Pressable>
        {pickingDate && (
          <View style={[styles.calendar, { backgroundColor: theme.backgroundElement }]}>
            <MonthCalendar
              year={calendarYear}
              month={calendarMonth}
              onChangeMonth={(year, month) => {
                setCalendarYear(year);
                setCalendarMonth(month);
              }}
              selected={date}
              onSelect={(value) => {
                setDate(value);
                setPickingDate(false);
              }}
            />
          </View>
        )}
      </View>

      <View style={styles.group}>
        <FieldLabel>{t.record.repeat}</FieldLabel>
        <ChipGroup options={repeatOptions} value={repeat} onChange={setRepeat} />
        {repeat !== 'none' && (
          <ThemedText type="small" themeColor="textSecondary">
            {t.record.repeatHint}
          </ThemedText>
        )}
      </View>

      <TextField
        label={text.detailsLabel}
        placeholder={text.detailsPlaceholder}
        value={details}
        onChangeText={setDetails}
      />

      <TextField
        label={t.record.notes}
        placeholder={t.record.notesPlaceholder}
        value={notes}
        onChangeText={setNotes}
        multiline
        style={styles.notes}
      />

      <View style={[styles.switchRow, { backgroundColor: theme.backgroundElement }]}>
        <View style={styles.switchText}>
          <ThemedText type="smallBold">{t.record.done}</ThemedText>
          <ThemedText type="small" themeColor="textSecondary">
            {t.record.doneHint}
          </ThemedText>
        </View>
        <Toggle accessibilityLabel={t.record.done} value={done} onValueChange={setDone} />
      </View>

      <Button title={existing ? t.record.saveChanges : t.record.add} onPress={save} />
      {existing && <Button variant="ghost" title={t.record.delete} onPress={remove} />}
    </FormSheet>
  );
}

const styles = StyleSheet.create({
  group: {
    gap: Spacing.two,
  },
  dateButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    minHeight: 52,
    borderRadius: 14,
    borderWidth: 1,
    paddingHorizontal: Spacing.three,
  },
  calendar: {
    borderRadius: 16,
    padding: Spacing.three,
  },
  notes: {
    minHeight: 96,
    textAlignVertical: 'top',
  },
  switchRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.three,
    padding: Spacing.three,
    borderRadius: 16,
  },
  switchText: {
    flex: 1,
    gap: 2,
  },
});
