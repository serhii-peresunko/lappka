import { useLocalSearchParams, useRouter } from 'expo-router';
import { useState } from 'react';
import { View } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { Button } from '@/components/ui/button';
import { ChoiceChips } from '@/components/ui/choice';
import { SymbolIcon } from '@/components/ui/symbol-icon';
import { FormScreen } from '@/components/ui/form-screen';
import { TextField } from '@/components/ui/text-field';
import { Spacing } from '@/constants/theme';
import {
  formatDateInput,
  formatTimeInput,
  isoToInput,
  isValidTime,
  parseDateInput,
  todayIso,
} from '@/lib/dates';
import { EVENT_KINDS, KIND_ICONS } from '@/lib/event-kinds';
import { useSession, type EventKind } from '@/providers/session';

/** Add an event to the calendar: what, which kind, which day and (optionally) what time. */
export default function AddEventScreen() {
  const router = useRouter();
  const { date: dateParam } = useLocalSearchParams<{ date?: string }>();
  const { addEvent } = useSession();

  const [title, setTitle] = useState('');
  const [kind, setKind] = useState<EventKind>('vet');
  const [dateText, setDateText] = useState(isoToInput(dateParam ?? todayIso()));
  const [time, setTime] = useState('');
  const [submitted, setSubmitted] = useState(false);

  const date = parseDateInput(dateText);
  const errors = {
    title: title.trim() ? undefined : 'Enter a title',
    date: date ? undefined : 'Enter a real date as DD.MM.YYYY',
    time: !time || isValidTime(time) ? undefined : 'Use 24-hour time, e.g. 09:30',
  };

  function save() {
    setSubmitted(true);
    if (errors.title || errors.date || errors.time || !date) return;
    addEvent({ title: title.trim(), kind, date, time: time || null });
    router.back();
  }

  return (
    <FormScreen title="New event" sheet>
      <TextField
        label="Title"
        placeholder="e.g. Annual check-up"
        value={title}
        onChangeText={setTitle}
        error={submitted ? errors.title : undefined}
        autoCapitalize="sentences"
      />

      <View style={{ gap: Spacing.two }}>
        <ThemedText type="smallBold">Type</ThemedText>
        <ChoiceChips
          options={EVENT_KINDS.map((item) => ({
            ...item,
            icon: (color) => <SymbolIcon {...KIND_ICONS[item.value]} color={color} size={16} />,
          }))}
          value={kind}
          onChange={setKind}
        />
      </View>

      <TextField
        label="Date"
        placeholder="DD.MM.YYYY"
        value={dateText}
        onChangeText={(text) => setDateText(formatDateInput(text))}
        error={submitted ? errors.date : undefined}
        keyboardType="number-pad"
        maxLength={10}
      />

      <TextField
        label="Time (optional)"
        placeholder="HH:MM"
        value={time}
        onChangeText={(text) => setTime(formatTimeInput(text))}
        error={submitted ? errors.time : undefined}
        keyboardType="number-pad"
        maxLength={5}
      />

      {/* Inline, not pinned: in a sheet the keyboard would cover a pinned footer. */}
      <Button title="Save event" onPress={save} />
    </FormScreen>
  );
}
