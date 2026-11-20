import DateTimePicker from '@react-native-community/datetimepicker';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useState } from 'react';
import { Platform, Pressable, StyleSheet, View } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { Button } from '@/components/ui/button';
import { SymbolIcon } from '@/components/ui/symbol-icon';
import { FormScreen } from '@/components/ui/form-screen';
import { TextField } from '@/components/ui/text-field';
import { Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';
import {
  formatDateInput,
  isoToInput,
  parseDateInput,
  todayIso,
} from '@/lib/dates';
import { EVENT_KIND_ORDER, KIND_ICONS, kindKey } from '@/lib/event-kinds';
import { useI18n } from '@/i18n';
import { useSession, type EventKind } from '@/providers/session';

const pad = (n: number) => String(n).padStart(2, '0');
const timeToDate = (hhmm: string) => {
  const [h, m] = hhmm.split(':').map(Number);
  const date = new Date();
  date.setHours(h, m, 0, 0);
  return date;
};
const dateToTime = (date: Date) => `${pad(date.getHours())}:${pad(date.getMinutes())}`;

/** Add an event to the calendar: what, which kind, which day and (optionally) what time. */
export default function AddEventScreen() {
  const router = useRouter();
  const { date: dateParam } = useLocalSearchParams<{ date?: string }>();
  const { addEvent } = useSession();
  const { t } = useI18n();
  const theme = useTheme();

  const [description, setDescription] = useState('');
  const [kind, setKind] = useState<EventKind>('vet');
  const [dateText, setDateText] = useState(isoToInput(dateParam ?? todayIso()));
  const [time, setTime] = useState('');
  const [pickingTime, setPickingTime] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const date = parseDateInput(dateText);
  const errors = {
    date: date ? undefined : t('event.errDate'),
  };

  function save() {
    setSubmitted(true);
    if (errors.date || !date) return;
    addEvent({ description: description.trim(), kind, date, time: time || null });
    router.back();
  }

  return (
    <FormScreen title={t('event.title')} sheet>
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

      <TextField
        label={t('event.date')}
        placeholder={t('datePlaceholder')}
        value={dateText}
        onChangeText={(text) => setDateText(formatDateInput(text))}
        error={submitted ? errors.date : undefined}
        keyboardType="number-pad"
        maxLength={10}
      />

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
            is24Hour
            display={Platform.OS === 'ios' ? 'spinner' : 'default'}
            value={timeToDate(time || '09:00')}
            onValueChange={(_, picked) => setTime(dateToTime(picked))}
            onDismiss={() => setPickingTime(false)}
          />
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
      <Button title={t('event.save')} onPress={save} />
    </FormScreen>
  );
}

const styles = StyleSheet.create({
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
