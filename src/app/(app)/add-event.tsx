import DateTimePicker from '@react-native-community/datetimepicker';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useState } from 'react';
import { Alert, Platform, Pressable, StyleSheet, View } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { Button } from '@/components/ui/button';
import { SymbolIcon } from '@/components/ui/symbol-icon';
import { FormScreen } from '@/components/ui/form-screen';
import { TextField } from '@/components/ui/text-field';
import { Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';
import {
  isoToInput,
  parseDateInput,
  todayIso,
  toIso,
} from '@/lib/dates';
import { EVENT_KIND_ORDER, KIND_ICONS, kindKey } from '@/lib/event-kinds';
import { useI18n } from '@/i18n';
import { useSession, type EventKind, type Repeat } from '@/providers/session';
import { ChoiceChips } from '@/components/ui/choice';

const pad = (n: number) => String(n).padStart(2, '0');
const timeToDate = (hhmm: string) => {
  const [h, m] = hhmm.split(':').map(Number);
  const date = new Date();
  date.setHours(h, m, 0, 0);
  return date;
};
const dateToTime = (date: Date) => `${pad(date.getHours())}:${pad(date.getMinutes())}`;

type RepeatMode = 'none' | 'biweekly' | 'monthly' | 'yearly' | 'custom';

function repeatFor(mode: RepeatMode, custom: Repeat): Repeat | null {
  if (mode === 'biweekly') return { every: 2, unit: 'week' };
  if (mode === 'monthly') return { every: 1, unit: 'month' };
  if (mode === 'yearly') return { every: 1, unit: 'year' };
  if (mode === 'custom') return custom;
  return null;
}

/** Which repeat button an existing repeat matches (anything else is "custom"). */
function modeOf(repeat: Repeat | null | undefined): RepeatMode {
  if (!repeat) return 'none';
  if (repeat.every === 2 && repeat.unit === 'week') return 'biweekly';
  if (repeat.every === 1 && repeat.unit === 'month') return 'monthly';
  if (repeat.every === 1 && repeat.unit === 'year') return 'yearly';
  return 'custom';
}

const UNITS: Repeat['unit'][] = ['day', 'week', 'month', 'year'];

/** Add an event to the calendar: what, which kind, which day and (optionally) what time. */
export default function AddEventScreen() {
  const router = useRouter();
  const { date: dateParam, id } = useLocalSearchParams<{ date?: string; id?: string }>();
  const { addEvent, updateEvent, removeEvent, events } = useSession();
  // With an id the form edits that event; without one it creates a new one.
  const editing = id ? events.find((item) => item.id === id) : undefined;
  const { t, locale } = useI18n();
  const theme = useTheme();

  const [description, setDescription] = useState(editing?.description ?? '');
  const [kind, setKind] = useState<EventKind>(editing?.kind ?? 'vet');
  const [dateText, setDateText] = useState(isoToInput(editing?.date ?? dateParam ?? todayIso()));
  const [time, setTime] = useState(editing?.time ?? '');
  const [pickingTime, setPickingTime] = useState(false);
  const [pickingDate, setPickingDate] = useState(false);
  const [repeatMode, setRepeatMode] = useState<RepeatMode>(() => modeOf(editing?.repeat));
  const [custom, setCustom] = useState<Repeat>(editing?.repeat ?? { every: 2, unit: 'week' });

  const date = parseDateInput(dateText);
  // The picker works with a real date; the form keeps the ISO day. The label reads like the calendar's: "неділя, 6 грудня 2026".
  const pickedDate = new Date(`${date ?? todayIso()}T12:00:00`);
  const dateLabel = pickedDate.toLocaleDateString(locale, { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' });
  const errors = {
    date: date ? undefined : t('event.errDate'),
  };

  function save() {
    if (errors.date || !date) return;
    const fields = { description: description.trim(), kind, date, time: time || null, repeat: repeatFor(repeatMode, custom) };
    if (editing) updateEvent(editing.id, fields);
    else addEvent(fields);
    router.back();
  }

  function askDelete() {
    if (!editing) return;
    Alert.alert(t('event.deleteTitle'), editing.repeat ? t('event.deleteRepeating') : t('event.deleteMessage'), [
      { text: t('petMenu.cancel'), style: 'cancel' },
      {
        text: t('event.delete'),
        style: 'destructive',
        onPress: () => {
          removeEvent(editing.id);
          router.back();
        },
      },
    ]);
  }

  return (
    <FormScreen title={t(editing ? 'event.editTitle' : 'event.title')} sheet>
      <View style={{ gap: Spacing.two }}>
        <ThemedText type="small" themeColor="textSecondary">
          {t('event.type')}
        </ThemedText>
        <View style={styles.kinds}>
          {EVENT_KIND_ORDER.map((value) => {
            const selected = value === kind;
            const ink = selected ? theme.background : theme.text;
            return (
              <Pressable
                key={value}
                accessibilityRole="radio"
                accessibilityState={{ checked: selected }}
                onPress={() => setKind(value)}
                style={[
                  styles.kindCard,
                  { backgroundColor: selected ? theme.text : theme.backgroundElement },
                ]}>
                <View style={[styles.kindBadge, { backgroundColor: selected ? 'rgba(255,255,255,0.18)' : theme.background }]}>
                  <SymbolIcon {...KIND_ICONS[value]} color={ink} size={20} />
                </View>
                <ThemedText type="smallBold" style={{ color: ink }} numberOfLines={2}>
                  {t(kindKey(value))}
                </ThemedText>
              </Pressable>
            );
          })}
        </View>
      </View>

      <View style={{ gap: Spacing.two }}>
        <ThemedText type="small" themeColor="textSecondary">
          {t('event.date')}
        </ThemedText>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel={t('event.date')}
          onPress={() => setPickingDate((open) => !open)}
          style={[styles.timeField, { backgroundColor: theme.backgroundElement }]}>
          <SymbolIcon ios="calendar" material="calendar_month" color={theme.textSecondary} size={20} />
          <ThemedText style={styles.timeText}>{dateLabel}</ThemedText>
        </Pressable>
        {pickingDate ? (
          <DateTimePicker
            mode="date"
            locale={locale}
            accentColor="#111111"
            display={Platform.OS === 'ios' ? 'inline' : 'default'}
            value={pickedDate}
            onValueChange={(_, picked) => setDateText(isoToInput(toIso(picked)))}
            onDismiss={() => setPickingDate(false)}
          />
        ) : null}
      </View>

      <View style={{ gap: Spacing.two }}>
        <ThemedText type="small" themeColor="textSecondary">
          {t('event.time')}
        </ThemedText>
        <View style={styles.timeRow}>
          <Pressable
            accessibilityRole="button"
            accessibilityLabel={t('event.time')}
            onPress={() => {
              if (!time) setTime('09:00');
              setPickingTime((open) => !open);
            }}
            style={[styles.timeField, { backgroundColor: theme.backgroundElement }]}>
            <SymbolIcon ios="clock" material="schedule" color={theme.textSecondary} size={20} />
            <ThemedText style={[styles.timeText, !time && { color: theme.textSecondary }]}>{time || '--:--'}</ThemedText>
          </Pressable>
          {time ? (
            <Pressable
              accessibilityRole="button"
              accessibilityLabel={t('event.clearTime')}
              onPress={() => {
                setTime('');
                setPickingTime(false);
              }}
              style={[styles.timeClear, { backgroundColor: theme.backgroundElement }]}>
              <SymbolIcon ios="xmark" material="close" color={theme.text} size={16} />
            </Pressable>
          ) : null}
        </View>
        {pickingTime ? (
          <DateTimePicker
            mode="time"
            locale={locale}
            accentColor="#111111"
            is24Hour
            display={Platform.OS === 'ios' ? 'spinner' : 'default'}
            value={timeToDate(time || '09:00')}
            onValueChange={(_, picked) => setTime(dateToTime(picked))}
            onDismiss={() => setPickingTime(false)}
          />
        ) : null}
      </View>

      <View style={{ gap: Spacing.two }}>
        <ThemedText type="small" themeColor="textSecondary">
          {t('event.repeat')}
        </ThemedText>
        <ChoiceChips<RepeatMode>
          value={repeatMode}
          onChange={setRepeatMode}
          options={[
            { value: 'none', label: t('repeat.none') },
            { value: 'biweekly', label: t('repeat.biweekly') },
            { value: 'monthly', label: t('repeat.monthly') },
            { value: 'yearly', label: t('repeat.yearly') },
            { value: 'custom', label: t('repeat.custom') },
          ]}
        />
        {repeatMode === 'custom' ? (
          <View style={styles.customRow}>
            <ThemedText type="small" themeColor="textSecondary">
              {t('repeat.every')}
            </ThemedText>
            <View style={[styles.stepper, { backgroundColor: theme.backgroundElement }]}>
              <Pressable
                accessibilityRole="button"
                accessibilityLabel="-"
                onPress={() => setCustom((c) => ({ ...c, every: Math.max(1, c.every - 1) }))}
                style={styles.stepBtn}>
                <SymbolIcon ios="minus" material="remove" color={theme.text} size={16} />
              </Pressable>
              <ThemedText style={styles.stepValue}>{custom.every}</ThemedText>
              <Pressable
                accessibilityRole="button"
                accessibilityLabel="+"
                onPress={() => setCustom((c) => ({ ...c, every: Math.min(99, c.every + 1) }))}
                style={styles.stepBtn}>
                <SymbolIcon ios="plus" material="add" color={theme.text} size={16} />
              </Pressable>
            </View>
            <ChoiceChips<Repeat['unit']>
              value={custom.unit}
              onChange={(unit) => setCustom((c) => ({ ...c, unit }))}
              options={UNITS.map((unit) => ({ value: unit, label: t(`repeat.${unit}` as const) }))}
            />
          </View>
        ) : null}
      </View>

      <TextField
        label={t('event.descLabel')}
        placeholder={t('event.descPlaceholder')}
        value={description}
        onChangeText={setDescription}
        autoCapitalize="sentences"
        multiline
        style={styles.multiline}
      />

      {/* Inline, not pinned: in a sheet the keyboard would cover a pinned footer. */}
      <Button title={t(editing ? 'event.saveChanges' : 'event.save')} onPress={save} />
      {editing ? (
        <Pressable accessibilityRole="button" onPress={askDelete} style={({ pressed }) => [styles.deleteBtn, pressed && { opacity: 0.7 }]}>
          <SymbolIcon ios="trash" material="delete" color="#C0392B" size={18} />
          <ThemedText style={styles.deleteText}>{t('event.delete')}</ThemedText>
        </Pressable>
      ) : null}
    </FormScreen>
  );
}

const styles = StyleSheet.create({
  deleteBtn: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, height: 52, borderRadius: 16, backgroundColor: 'rgba(192,57,43,0.08)' },
  deleteText: { color: '#C0392B', fontSize: 16, lineHeight: 20, fontWeight: '500' },
  customRow: { gap: Spacing.two },
  stepper: { alignSelf: 'flex-start', flexDirection: 'row', alignItems: 'center', borderRadius: 16 },
  stepBtn: { width: 48, height: 48, alignItems: 'center', justifyContent: 'center' },
  stepValue: { minWidth: 36, textAlign: 'center', fontSize: 17, fontWeight: '600' },
  timeRow: { flexDirection: 'row', gap: Spacing.two },
  timeField: { flex: 1, height: 56, borderRadius: 16, paddingHorizontal: Spacing.three, flexDirection: 'row', alignItems: 'center', gap: Spacing.two },
  timeText: { fontSize: 17, fontWeight: '500' },
  timeClear: { width: 56, height: 56, borderRadius: 16, alignItems: 'center', justifyContent: 'center' },
  multiline: { minHeight: 84, paddingTop: Spacing.three, textAlignVertical: 'top' },
  kinds: { flexDirection: 'row', flexWrap: 'wrap', gap: Spacing.two },
  // Two cards per row; the last one (five kinds) stays half width.
  kindCard: { width: '48.5%', minHeight: 76, borderRadius: 20, padding: Spacing.three - 2, gap: Spacing.one, justifyContent: 'space-between' },
  kindBadge: { width: 32, height: 32, borderRadius: 16, alignItems: 'center', justifyContent: 'center' },
});
