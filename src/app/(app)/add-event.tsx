import DateTimePicker from '@react-native-community/datetimepicker';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useState } from 'react';
import { Alert, Platform, Pressable, StyleSheet, View } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { Button } from '@/components/ui/button';
import { SymbolIcon } from '@/components/ui/symbol-icon';
import { FormScreen } from '@/components/ui/form-screen';
import { TextField } from '@/components/ui/text-field';
import { Colors, Radius } from '@/constants/theme';
import { useTask } from '@/hooks/use-task';
import { useTheme } from '@/hooks/use-theme';
import {
  isoToInput,
  parseDateInput,
  todayIso,
  toIso,
} from '@/lib/dates';
import { EVENT_KIND_ORDER, KIND_COLORS, KIND_ICONS, KIND_SOFT, kindKey } from '@/lib/event-kinds';
import { useI18n } from '@/i18n';
import { useSession, type EventKind, type Repeat } from '@/providers/session';

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
  const { date: dateParam, id, kind: kindParam } = useLocalSearchParams<{ date?: string; id?: string; kind?: string }>();
  const { session, addEvent, updateEvent, removeEvent, events } = useSession();
  // With an id the form edits that event; without one it creates a new one.
  const editing = id ? events.find((item) => item.id === id) : undefined;
  const { t, locale } = useI18n();
  const theme = useTheme();

  const { pending, run } = useTask();
  const [description, setDescription] = useState(editing?.description ?? '');
  const [kind, setKind] = useState<EventKind>(editing?.kind ?? EVENT_KIND_ORDER.find((value) => value === kindParam) ?? 'vet');
  const [dateText, setDateText] = useState(isoToInput(editing?.date ?? dateParam ?? todayIso()));
  const [time, setTime] = useState(editing?.time ?? '');
  const [pickingTime, setPickingTime] = useState(false);
  const [pickingDate, setPickingDate] = useState(false);
  const [pickingRepeat, setPickingRepeat] = useState(false);
  const [repeatMode, setRepeatMode] = useState<RepeatMode>(() => modeOf(editing?.repeat));
  const [custom, setCustom] = useState<Repeat>(editing?.repeat ?? { every: 2, unit: 'week' });

  const date = parseDateInput(dateText);
  // The picker works with a real date; the form keeps the day as DD.MM.YYYY text.
  const pickedDate = new Date(`${date ?? todayIso()}T12:00:00`);
  const errors = {
    date: date ? undefined : t('event.errDate'),
  };

  async function save() {
    if (errors.date || !date) return;
    const fields = { description: description.trim(), kind, date, time: time || null, repeat: repeatFor(repeatMode, custom) };
    // The sheet closes only once the server has the event; on a failure the form stays filled.
    if (await run(() => (editing ? updateEvent(editing.id, fields) : addEvent(fields)))) router.back();
  }

  function askDelete() {
    if (!editing) return;
    Alert.alert(t('event.deleteTitle'), editing.repeat ? t('event.deleteRepeating') : t('event.deleteMessage'), [
      { text: t('petMenu.cancel'), style: 'cancel' },
      {
        text: t('event.delete'),
        style: 'destructive',
        onPress: async () => {
          if (await run(() => removeEvent(editing.id))) router.back();
        },
      },
    ]);
  }

  const REPEATS: { value: RepeatMode; label: string }[] = [
    { value: 'none', label: t('repeat.none') },
    { value: 'biweekly', label: t('repeat.biweekly') },
    { value: 'monthly', label: t('repeat.monthly') },
    { value: 'yearly', label: t('repeat.yearly') },
    { value: 'custom', label: t('repeat.custom') },
  ];

  // The row shows the chosen repeat; a custom one is spelled out ("Every 2 · Week").
  const repeatLabel =
    repeatMode === 'custom'
      ? `${t('repeat.every')} ${custom.every} · ${t(`repeat.${custom.unit}` as const)}`
      : (REPEATS.find((item) => item.value === repeatMode)?.label ?? '');

  return (
    <FormScreen title={t(editing ? 'event.editTitle' : 'event.title')} onClose={() => router.back()} sheet>
      <View style={styles.stack}>
        {/* The kind as pills with a pastel icon; the chosen one is black. */}
        <View style={styles.group}>
          <ThemedText type="small" themeColor="textSecondary">
            {t('event.what', { name: session?.pet?.name ?? '' })}
          </ThemedText>
          <View style={styles.kinds}>
            {EVENT_KIND_ORDER.map((value) => {
              const selected = value === kind;
              return (
                <Pressable
                  key={value}
                  accessibilityRole="radio"
                  accessibilityState={{ checked: selected }}
                  onPress={() => setKind(value)}
                  style={({ pressed }) => [styles.kindTile, selected && { backgroundColor: theme.primary }, pressed && { opacity: 0.75 }]}>
                  <View style={[styles.kindIcon, { backgroundColor: KIND_SOFT[value] }]}>
                    <SymbolIcon {...KIND_ICONS[value]} color={KIND_COLORS[value]} size={13} />
                  </View>
                  <ThemedText style={[styles.kindText, selected && { color: theme.onPrimary }]}>{t(kindKey(value))}</ThemedText>
                </Pressable>
              );
            })}
          </View>
        </View>

        {/* Date, time and repeat: three rows of one card, each with its value in a pill on the right. */}
        <View style={styles.card}>
          <Pressable
            accessibilityRole="button"
            accessibilityLabel={t('event.date')}
            onPress={() => {
              setPickingDate((open) => !open);
              setPickingTime(false);
              setPickingRepeat(false);
            }}
            style={styles.row}>
            <View style={styles.rowIcon}>
              <SymbolIcon ios="calendar" material="calendar_month" color={theme.primary} size={18} />
            </View>
            <ThemedText style={styles.rowLabel}>{t('event.date')}</ThemedText>
            <View style={[styles.value, pickingDate && styles.valueOpen]}>
              <ThemedText style={styles.valueText}>{dateText}</ThemedText>
            </View>
          </Pressable>
          <View style={styles.divider} />
          <Pressable
            accessibilityRole="button"
            accessibilityLabel={t('event.time')}
            onPress={() => {
              if (!time) setTime('09:00');
              setPickingTime((open) => !open);
              setPickingDate(false);
              setPickingRepeat(false);
            }}
            style={styles.row}>
            <View style={styles.rowIcon}>
              <SymbolIcon ios="clock" material="schedule" color={theme.primary} size={18} />
            </View>
            <ThemedText style={styles.rowLabel} numberOfLines={1}>
              {t('event.time')}
            </ThemedText>
            <View style={[styles.value, pickingTime && styles.valueOpen]}>
              <ThemedText style={[styles.valueText, !time && { color: theme.textSecondary }]}>{time || t('event.allDay')}</ThemedText>
            </View>
            {time ? (
              <Pressable
                accessibilityRole="button"
                accessibilityLabel={t('event.clearTime')}
                hitSlop={10}
                onPress={() => {
                  setTime('');
                  setPickingTime(false);
                }}
                style={styles.clear}>
                <SymbolIcon ios="xmark" material="close" color={theme.textSecondary} size={13} />
              </Pressable>
            ) : null}
          </Pressable>
          {pickingDate ? (
            <DateTimePicker
              mode="date"
              locale={locale}
              accentColor={theme.primary}
              display={Platform.OS === 'ios' ? 'inline' : 'default'}
              value={pickedDate}
              onValueChange={(_, picked) => setDateText(isoToInput(toIso(picked)))}
              onDismiss={() => setPickingDate(false)}
            />
          ) : null}
          {pickingTime ? (
            <DateTimePicker
              mode="time"
              locale={locale}
              accentColor={theme.primary}
              is24Hour
              display={Platform.OS === 'ios' ? 'spinner' : 'default'}
              value={timeToDate(time || '09:00')}
              onValueChange={(_, picked) => setTime(dateToTime(picked))}
              onDismiss={() => setPickingTime(false)}
            />
          ) : null}
          <View style={styles.divider} />
          {/* Repeat is one row; its choices open under it only when asked for. */}
          <Pressable
            accessibilityRole="button"
            accessibilityLabel={`${t('event.repeat')}: ${repeatLabel}`}
            accessibilityState={{ expanded: pickingRepeat }}
            onPress={() => {
              setPickingRepeat((open) => !open);
              setPickingDate(false);
              setPickingTime(false);
            }}
            style={styles.row}>
            <View style={styles.rowIcon}>
              <SymbolIcon ios="repeat" material="repeat" color={theme.primary} size={18} />
            </View>
            <ThemedText style={styles.rowLabel}>{t('event.repeat')}</ThemedText>
            <View style={[styles.value, pickingRepeat && styles.valueOpen]}>
              <ThemedText style={styles.valueText}>{repeatLabel}</ThemedText>
            </View>
          </Pressable>
          {pickingRepeat ? (
            <View style={styles.repeatBox}>
              <View style={styles.chips}>
                {REPEATS.map((item) => {
                  const selected = item.value === repeatMode;
                  return (
                    <Pressable
                      key={item.value}
                      accessibilityRole="radio"
                      accessibilityState={{ checked: selected }}
                      hitSlop={4}
                      onPress={() => {
                        setRepeatMode(item.value);
                        // "Custom" stays open for its settings; the ready-made ones close the list.
                        if (item.value !== 'custom') setPickingRepeat(false);
                      }}
                      style={[styles.chip, { backgroundColor: selected ? theme.primary : theme.raised }]}>
                      <ThemedText style={[styles.chipText, { color: selected ? theme.onPrimary : theme.text }]}>{item.label}</ThemedText>
                    </Pressable>
                  );
                })}
              </View>
              {repeatMode === 'custom' ? (
                // One slim line for "every N", and the unit as a segmented control under it.
                <View style={styles.custom}>
                  <View style={styles.everyRow}>
                    <ThemedText style={styles.everyLabel}>{t('repeat.every')}</ThemedText>
                    <View style={styles.stepper}>
                      <Pressable
                        accessibilityRole="button"
                        accessibilityLabel="-"
                        hitSlop={8}
                        onPress={() => setCustom((c) => ({ ...c, every: Math.max(1, c.every - 1) }))}
                        style={styles.stepBtn}>
                        <SymbolIcon ios="minus" material="remove" color={theme.primary} size={14} />
                      </Pressable>
                      <ThemedText style={styles.stepValue}>{custom.every}</ThemedText>
                      <Pressable
                        accessibilityRole="button"
                        accessibilityLabel="+"
                        hitSlop={8}
                        onPress={() => setCustom((c) => ({ ...c, every: Math.min(99, c.every + 1) }))}
                        style={styles.stepBtn}>
                        <SymbolIcon ios="plus" material="add" color={theme.primary} size={14} />
                      </Pressable>
                    </View>
                  </View>
                  <View style={styles.segTrack}>
                    {UNITS.map((unit) => {
                      const selected = unit === custom.unit;
                      return (
                        <Pressable
                          key={unit}
                          accessibilityRole="radio"
                          accessibilityState={{ checked: selected }}
                          onPress={() => setCustom((c) => ({ ...c, unit }))}
                          style={[styles.seg, selected && { backgroundColor: theme.primary }]}>
                          <ThemedText style={[styles.chipText, { color: selected ? theme.onPrimary : theme.text }]}>
                            {t(`repeat.${unit}` as const)}
                          </ThemedText>
                        </Pressable>
                      );
                    })}
                  </View>
                </View>
              ) : null}
            </View>
          ) : null}
        </View>

        <TextField
          label={t('event.descLabel')}
          placeholder={t('event.descPlaceholder')}
          value={description}
          onChangeText={setDescription}
          autoCapitalize="sentences"
          maxLength={500}
          multiline
          style={styles.multiline}
        />
      </View>

      {/* Inline, not pinned: in a sheet the keyboard would cover a pinned footer. */}
      <View style={styles.actions}>
        <Button title={t(editing ? 'event.saveChanges' : 'event.save')} loading={pending} onPress={save} />
        {editing ? (
          <Pressable accessibilityRole="button" disabled={pending} onPress={askDelete} style={({ pressed }) => [styles.deleteBtn, pressed && { opacity: 0.7 }]}>
            <SymbolIcon ios="trash" material="delete" color={theme.danger} size={18} />
            <ThemedText style={styles.deleteText}>{t('event.delete')}</ThemedText>
          </Pressable>
        ) : null}
      </View>
    </FormScreen>
  );
}

const styles = StyleSheet.create({
  // Save and delete sit close together, not a full page-gap apart.
  actions: { gap: 10 },
  stack: { gap: 14 },
  group: { gap: 6 },
  labelRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  kinds: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  kindTile: { flexDirection: 'row', alignItems: 'center', gap: 8, height: 40, paddingLeft: 7, paddingRight: 14, borderRadius: Radius.pill, backgroundColor: Colors.light.surface },
  kindIcon: { width: 26, height: 26, borderRadius: 13, alignItems: 'center', justifyContent: 'center' },
  kindText: { fontSize: 13, lineHeight: 17, fontWeight: '500' },
  // The picker opens inside the card, under the rows.
  card: { backgroundColor: Colors.light.surface, borderRadius: Radius.card, paddingHorizontal: 14, paddingVertical: 2 },
  row: { flexDirection: 'row', alignItems: 'center', gap: 12, minHeight: 56 },
  rowIcon: { width: 32, height: 32, borderRadius: 10, backgroundColor: Colors.light.raised, alignItems: 'center', justifyContent: 'center' },
  rowLabel: { flex: 1, fontSize: 15, lineHeight: 20, fontWeight: '500' },
  value: { paddingHorizontal: 10, height: 32, justifyContent: 'center', borderRadius: 10, backgroundColor: Colors.light.surface },
  valueOpen: { backgroundColor: Colors.light.raised },
  valueText: { fontSize: 14, lineHeight: 18, fontWeight: '600' },
  divider: { height: 1, marginLeft: 44, backgroundColor: Colors.light.border },
  clear: { width: 22, height: 22, borderRadius: 11, alignItems: 'center', justifyContent: 'center' },
  repeatBox: { gap: 8, paddingTop: 2, paddingBottom: 12 },
  chips: { flexDirection: 'row', flexWrap: 'wrap', gap: 6 },
  chip: { height: 32, paddingHorizontal: 12, borderRadius: 999, alignItems: 'center', justifyContent: 'center' },
  chipText: { fontSize: 13, lineHeight: 17, fontWeight: '600' },
  custom: { gap: 8 },
  everyRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  everyLabel: { fontSize: 14, lineHeight: 18, fontWeight: '600' },
  stepper: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  stepBtn: { width: 32, height: 32, borderRadius: 16, backgroundColor: Colors.light.raised, alignItems: 'center', justifyContent: 'center' },
  stepValue: { minWidth: 36, textAlign: 'center', fontSize: 17, lineHeight: 22, fontWeight: '700' },
  segTrack: { flexDirection: 'row', padding: 3, borderRadius: Radius.control, backgroundColor: Colors.light.raised, gap: 3 },
  seg: { flex: 1, height: 30, borderRadius: 6, alignItems: 'center', justifyContent: 'center' },
  multiline: { minHeight: 64, paddingTop: 12, textAlignVertical: 'top' },
  deleteBtn: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, height: 54, borderRadius: 999, backgroundColor: Colors.light.surface },
  deleteText: { color: Colors.light.danger, fontSize: 16, lineHeight: 20, fontWeight: '500' },
});
