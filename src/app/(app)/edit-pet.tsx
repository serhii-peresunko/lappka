import { useRouter } from 'expo-router';
import { useState } from 'react';
import { StyleSheet, View } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { ChipGroup } from '@/components/ui/chip';
import { FieldLabel, FormSheet } from '@/components/ui/form-sheet';
import { TextField } from '@/components/ui/text-field';
import { Toggle } from '@/components/ui/toggle';
import type { Pet } from '@/data/care';
import { Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';
import { useI18n } from '@/i18n/i18n-provider';
import { fromISODate, toISODate, today } from '@/lib/dates';
import { useCare } from '@/providers/care-provider';

function isValidDate(value: string) {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) return false;
  // Round-tripping rejects impossible days such as 2024-02-31.
  return toISODate(fromISODate(value)) === value && value <= today();
}

export default function EditPetScreen() {
  const theme = useTheme();
  const router = useRouter();
  const { pet, updatePet } = useCare();
  const { t } = useI18n();
  const sexOptions = [
    { value: 'Male' as const, label: t.pet.sexValue.Male },
    { value: 'Female' as const, label: t.pet.sexValue.Female },
  ];

  const [form, setForm] = useState<Pet>(pet);
  const [submitted, setSubmitted] = useState(false);

  const set = <K extends keyof Pet>(key: K) => (value: Pet[K]) => setForm((current) => ({ ...current, [key]: value }));
  const close = () => (router.canGoBack() ? router.back() : router.replace('/pet'));

  const validation = {
    name: form.name.trim() ? undefined : t.validation.petNameRequired,
    birthDate: isValidDate(form.birthDate) ? undefined : t.validation.birthDateInvalid,
    weightKg:
      !form.weightKg || Number.isFinite(Number(form.weightKg.replace(',', '.')))
        ? undefined
        : t.validation.weightInvalid,
  };
  const errors: Partial<typeof validation> = submitted ? validation : {};

  function save() {
    setSubmitted(true);
    if (Object.values(validation).some(Boolean)) return;

    updatePet({ ...form, name: form.name.trim(), weightKg: form.weightKg.replace(',', '.') });
    close();
  }

  return (
    <FormSheet title={t.editPet.title} onCancel={close} onSave={save}>
      <TextField label={t.editPet.name} value={form.name} onChangeText={set('name')} error={errors.name} />
      <TextField label={t.editPet.species} placeholder={t.editPet.speciesPlaceholder} value={form.species} onChangeText={set('species')} />
      <TextField label={t.editPet.breed} value={form.breed} onChangeText={set('breed')} />

      <View style={styles.group}>
        <FieldLabel>{t.editPet.sex}</FieldLabel>
        <ChipGroup options={sexOptions} value={form.sex} onChange={set('sex')} />
      </View>

      <View style={[styles.switchRow, { backgroundColor: theme.backgroundElement }]}>
        <ThemedText type="smallBold" style={styles.switchLabel}>
          {t.editPet.neutered}
        </ThemedText>
        <Toggle accessibilityLabel={t.editPet.neutered} value={form.neutered} onValueChange={set('neutered')} />
      </View>

      <View style={styles.row}>
        <View style={styles.half}>
          <TextField
            label={t.editPet.birthDate}
            placeholder={t.editPet.birthDatePlaceholder}
            value={form.birthDate}
            onChangeText={set('birthDate')}
            error={errors.birthDate}
            keyboardType="numbers-and-punctuation"
          />
        </View>
        <View style={styles.half}>
          <TextField
            label={t.editPet.weight}
            value={form.weightKg}
            onChangeText={set('weightKg')}
            error={errors.weightKg}
            keyboardType="decimal-pad"
          />
        </View>
      </View>

      <TextField label={t.editPet.color} value={form.color} onChangeText={set('color')} />
      <TextField
        label={t.editPet.microchip}
        value={form.microchip}
        onChangeText={set('microchip')}
        keyboardType="number-pad"
      />
      <TextField label={t.editPet.passport} value={form.passport} onChangeText={set('passport')} />
      <TextField label={t.editPet.allergies} placeholder={t.editPet.nonePlaceholder} value={form.allergies} onChangeText={set('allergies')} />
      <TextField
        label={t.editPet.conditions}
        placeholder={t.editPet.nonePlaceholder}
        value={form.conditions}
        onChangeText={set('conditions')}
      />
      <TextField label={t.editPet.vetClinic} value={form.vetClinic} onChangeText={set('vetClinic')} />
      <TextField label={t.editPet.vetPhone} value={form.vetPhone} onChangeText={set('vetPhone')} keyboardType="phone-pad" />
      <TextField label={t.editPet.ownerName} value={form.ownerName} onChangeText={set('ownerName')} />
      <TextField
        label={t.editPet.ownerPhone}
        value={form.ownerPhone}
        onChangeText={set('ownerPhone')}
        keyboardType="phone-pad"
      />
    </FormSheet>
  );
}

const styles = StyleSheet.create({
  group: {
    gap: Spacing.two,
  },
  row: {
    flexDirection: 'row',
    gap: Spacing.three,
  },
  half: {
    flex: 1,
  },
  switchRow: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: Spacing.three,
    borderRadius: 16,
  },
  switchLabel: {
    flex: 1,
  },
});
