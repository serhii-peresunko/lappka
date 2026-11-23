import DateTimePicker from '@react-native-community/datetimepicker';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useState } from 'react';
import { Alert, Platform, Pressable, StyleSheet, View } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { Button } from '@/components/ui/button';
import { SymbolIcon } from '@/components/ui/symbol-icon';
import { FormScreen } from '@/components/ui/form-screen';
import { TextField } from '@/components/ui/text-field';
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
  // The picker works with a real date; the form keeps the day as DD.MM.YYYY text.
  const pickedDate = new Date(`${date ?? todayIso()}T12:00:00`);
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

  const REPEATS: { value: RepeatMode; label: string }[] = [
    { value: 'none', label: t('repeat.none') },
    { value: 'biweekly', label: t('repeat.biweekly') },
    { value: 'monthly', label: t('repeat.monthly') },
    { value: 'yearly', label: t('repeat.yearly') },
    { value: 'custom', label: t('repeat.custom') },
  ];

  return (
    <FormScreen title={t(editing ? 'event.editTitle' : 'event.title')} sheet>
      <View style={styles.stack}>
        {/* Type: five equal icon tiles in one row; the open one is black and its name is written next to the label. */}
        <View style={styles.group}>
          <View style={styles.labelRow}>
            <ThemedText type="small" themeColor="textSecondary">
              {t('event.type')}
            </ThemedText>
            <ThemedText type="smallBold">{t(kindKey(kind))}</ThemedText>
          </View>
          <View style={styles.kinds}>
            {EVENT_KIND_ORDER.map((value) => {
              const selected = value === kind;
              return (
                <Pressable
                  key={value}
                  accessibilityRole="radio"
                  accessibilityLabel={t(kindKey(value))}
                  accessibilityState={{ checked: selected }}
                  onPress={() => setKind(value)}
                  style={[styles.kindTile, { backgroundColor: selected ? theme.text : theme.backgroundElement }]}>
                  <SymbolIcon {...KIND_ICONS[value]} color={selected ? theme.background : theme.text} size={22} />
                </Pressable>
              );
            })}
          </View>
        </View>

        {/* Date and time share one row. */}
        <View style={styles.group}>
          <View style={styles.dateTimeRow}>
            <View style={[styles.field, { flex: 1.5 }]}>
              <ThemedText type="small" themeColor="textSecondary">
                {t('event.date')}
              </ThemedText>
              <Pressable
                accessibilityRole="button"
                accessibilityLabel={t('event.date')}
                onPress={() => {
                  setPickingDate((open) => !open);
                  setPickingTime(false);
                }}
                style={[styles.pill, { backgroundColor: theme.backgroundElement }]}>
                <SymbolIcon ios="calendar" material="calendar_month" color={theme.textSecondary} size={18} />
                <ThemedText style={styles.pillText}>{dateText}</ThemedText>
              </Pressable>
            </View>
            <View style={[styles.field, { flex: 1 }]}>
              <ThemedText type="small" themeColor="textSecondary">
                {t('event.time')}
              </ThemedText>
              <Pressable
                accessibilityRole="button"
                accessibilityLabel={t('event.time')}
                onPress={() => {
                  if (!time) setTime('09:00');
                  setPickingTime((open) => !open);
                  setPickingDate(false);
                }}
                style={[styles.pill, { backgroundColor: theme.backgroundElement }]}>
                <SymbolIcon ios="clock" material="schedule" color={theme.textSecondary} size={18} />
                <ThemedText style={[styles.pillText, !time && { color: theme.textSecondary }]}>{time || '--:--'}</ThemedText>
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
            </View>
          </View>
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

        {/* Repeat: slim chips; all five (including "Custom") are visible, wrapping to a second line. */}
        <View style={styles.group}>
          <ThemedText type="small" themeColor="textSecondary">
            {t('event.repeat')}
          </ThemedText>
          <View style={styles.chips}>
            {REPEATS.map((item) => {
              const selected = item.value === repeatMode;
              return (
                <Pressable
                  key={item.value}
                  accessibilityRole="radio"
                  accessibilityState={{ checked: selected }}
                  onPress={() => setRepeatMode(item.value)}
                  style={[styles.chip, { backgroundColor: selected ? theme.text : theme.backgroundElement }]}>
                  <ThemedText type="small" style={{ color: selected ? theme.background : theme.text }}>
                    {item.label}
                  </ThemedText>
                </Pressable>
              );
            })}
          </View>
          {repeatMode === 'custom' ? (
            // The custom repeat sits in its own soft panel: "Every" with a roomy stepper, then the unit as one segmented control.
            <View style={[styles.customPanel, { backgroundColor: theme.backgroundElement }]}>
              <View style={styles.everyRow}>
                <ThemedText style={styles.everyLabel}>{t('repeat.every')}</ThemedText>
                <View style={styles.stepper}>
                  <Pressable
                    accessibilityRole="button"
                    accessibilityLabel="-"
                    hitSlop={6}
                    onPress={() => setCustom((c) => ({ ...c, every: Math.max(1, c.every - 1) }))}
                    style={styles.stepBtn}>
                    <SymbolIcon ios="minus" material="remove" color={theme.text} size={16} />
                  </Pressable>
                  <ThemedText style={styles.stepValue}>{custom.every}</ThemedText>
                  <Pressable
                    accessibilityRole="button"
                    accessibilityLabel="+"
                    hitSlop={6}
                    onPress={() => setCustom((c) => ({ ...c, every: Math.min(99, c.every + 1) }))}
                    style={styles.stepBtn}>
                    <SymbolIcon ios="plus" material="add" color={theme.text} size={16} />
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
                      style={[styles.seg, selected && { backgroundColor: theme.text }]}>
                      <ThemedText type="small" style={{ color: selected ? theme.background : theme.text, fontWeight: selected ? '600' : '500' }}>
                        {t(`repeat.${unit}` as const)}
                      </ThemedText>
                    </Pressable>
                  );
                })}
              </View>
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
      </View>

      {/* Inline, not pinned: in a sheet the keyboard would cover a pinned footer. */}
      <View style={styles.actions}>
        <Button title={t(editing ? 'event.saveChanges' : 'event.save')} onPress={save} />
        {editing ? (
          <Pressable accessibilityRole="button" onPress={askDelete} style={({ pressed }) => [styles.deleteBtn, pressed && { opacity: 0.7 }]}>
            <SymbolIcon ios="trash" material="delete" color="#C0392B" size={18} />
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
  kinds: { flexDirection: 'row', gap: 8 },
  kindTile: { flex: 1, height: 52, borderRadius: 14, alignItems: 'center', justifyContent: 'center' },
  dateTimeRow: { flexDirection: 'row', gap: 10 },
  field: { gap: 6 },
  pill: { height: 48, borderRadius: 14, paddingHorizontal: 12, flexDirection: 'row', alignItems: 'center', gap: 8 },
  pillText: { fontSize: 16, fontWeight: '500', flexShrink: 1 },
  clear: { marginLeft: 'auto', width: 22, height: 22, borderRadius: 11, alignItems: 'center', justifyContent: 'center' },
  chips: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  chip: { height: 40, paddingHorizontal: 16, borderRadius: 20, alignItems: 'center', justifyContent: 'center' },
  customPanel: { marginTop: 6, padding: 14, borderRadius: 18, gap: 14 },
  everyRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  everyLabel: { fontSize: 16, fontWeight: '500' },
  stepper: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  stepBtn: { width: 40, height: 40, borderRadius: 20, backgroundColor: '#FFFFFF', alignItems: 'center', justifyContent: 'center' },
  stepValue: { minWidth: 44, textAlign: 'center', fontSize: 22, lineHeight: 26, fontWeight: '600' },
  segTrack: { flexDirection: 'row', padding: 4, borderRadius: 14, backgroundColor: '#FFFFFF', gap: 4 },
  seg: { flex: 1, height: 36, borderRadius: 11, alignItems: 'center', justifyContent: 'center' },
  multiline: { minHeight: 64, paddingTop: 12, textAlignVertical: 'top' },
  deleteBtn: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, height: 48, borderRadius: 14, backgroundColor: 'rgba(192,57,43,0.08)' },
  deleteText: { color: '#C0392B', fontSize: 16, lineHeight: 20, fontWeight: '500' },
});
