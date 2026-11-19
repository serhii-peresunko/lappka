import { useState } from 'react';
import { StyleSheet, View } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { Button } from '@/components/ui/button';
import { ChoiceChips, Segmented } from '@/components/ui/choice';
import { FormScreen } from '@/components/ui/form-screen';
import { TextField } from '@/components/ui/text-field';
import { Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';
import { useSession } from '@/providers/session';

type AgeMode = 'birth' | 'age';

const OTHER = 'Other';
const BREEDS = [
  'Cocker Spaniel',
  'Labrador Retriever',
  'Golden Retriever',
  'German Shepherd',
  'Corgi',
  'Poodle',
  'Mixed breed',
  OTHER,
];

const MAX_YEARS = 30;
const MAX_BIO = 280;

/** "15022024" -> "15.02.2024": keeps only digits and inserts the dots while typing. */
function formatBirthDate(input: string) {
  const digits = input.replace(/\D/g, '').slice(0, 8);
  const parts = [digits.slice(0, 2), digits.slice(2, 4), digits.slice(4, 8)].filter(Boolean);
  return parts.join('.');
}

/** "15.02.2024" -> "2024-02-15", or null when it is not a real date or lies in the future. */
function parseBirthDate(text: string): string | null {
  const match = /^(\d{2})\.(\d{2})\.(\d{4})$/.exec(text);
  if (!match) return null;
  const [, dd, mm, yyyy] = match;
  const date = new Date(Number(yyyy), Number(mm) - 1, Number(dd));
  const real =
    date.getFullYear() === Number(yyyy) && date.getMonth() === Number(mm) - 1 && date.getDate() === Number(dd);
  if (!real || date > new Date() || Number(yyyy) < 1990) return null;
  return `${yyyy}-${mm}-${dd}`;
}

const digitsOnly = (text: string) => text.replace(/\D/g, '').slice(0, 2);

/** Step 2 for new users: the pet. Dogs only for now. */
export default function PetScreen() {
  const theme = useTheme();
  const { savePet } = useSession();

  const [name, setName] = useState('');
  const [ageMode, setAgeMode] = useState<AgeMode>('birth');
  const [birth, setBirth] = useState('');
  const [years, setYears] = useState('');
  const [months, setMonths] = useState('');
  const [breed, setBreed] = useState<string | null>(null);
  const [customBreed, setCustomBreed] = useState('');
  const [bio, setBio] = useState('');
  const [submitted, setSubmitted] = useState(false);

  const birthDate = parseBirthDate(birth);
  const approxAgeMonths = Number(years || 0) * 12 + Number(months || 0);

  const errors = {
    name: name.trim() ? undefined : "Enter your dog's name",
    age:
      ageMode === 'birth'
        ? birthDate
          ? undefined
          : 'Enter a real date as DD.MM.YYYY, not in the future'
        : !years && !months
          ? 'Enter years or months'
          : Number(years || 0) > MAX_YEARS || Number(months || 0) > 11
            ? `Years up to ${MAX_YEARS}, months up to 11`
            : approxAgeMonths === 0
              ? 'Enter an age above 0'
              : undefined,
    breed: !breed
      ? 'Choose a breed'
      : breed === OTHER && !customBreed.trim()
        ? 'Type the breed'
        : undefined,
  };
  const valid = !errors.name && !errors.age && !errors.breed;

  function finish() {
    setSubmitted(true);
    if (!valid || !breed) return;
    savePet({
      type: 'dog',
      name: name.trim(),
      birthDate: ageMode === 'birth' ? birthDate : null,
      approxAgeMonths: ageMode === 'age' ? approxAgeMonths : null,
      breed: breed === OTHER ? customBreed.trim() : breed,
      bio: bio.trim(),
    });
  }

  return (
    <FormScreen
      eyebrow="Step 2 of 2"
      title="Add your dog"
      subtitle="Tell us a little about them.">
      <View style={styles.group}>
        <ThemedText type="smallBold">Pet type</ThemedText>
        <View style={[styles.type, { borderColor: theme.primary, backgroundColor: theme.primarySoft }]}>
          <ThemedText type="smallBold" style={{ color: theme.primaryText }}>
            Dog
          </ThemedText>
        </View>
        <ThemedText type="small" themeColor="textSecondary">
          Lappka is for dogs for now. More pet types are coming soon.
        </ThemedText>
      </View>

      <TextField
        label="Name"
        placeholder="e.g. Bublyk"
        value={name}
        onChangeText={setName}
        error={submitted ? errors.name : undefined}
        autoCapitalize="words"
        returnKeyType="next"
      />

      <View style={styles.group}>
        <ThemedText type="smallBold">Age</ThemedText>
        <Segmented
          value={ageMode}
          onChange={setAgeMode}
          options={[
            { value: 'birth', label: 'Birth date' },
            { value: 'age', label: "Don't know it" },
          ]}
        />
        {ageMode === 'birth' ? (
          <TextField
            label="Date of birth"
            placeholder="DD.MM.YYYY"
            value={birth}
            onChangeText={(text) => setBirth(formatBirthDate(text))}
            error={submitted ? errors.age : undefined}
            keyboardType="number-pad"
            maxLength={10}
          />
        ) : (
          <View style={styles.row}>
            <View style={styles.half}>
              <TextField
                label="Years"
                placeholder="0"
                value={years}
                onChangeText={(text) => setYears(digitsOnly(text))}
                keyboardType="number-pad"
                maxLength={2}
              />
            </View>
            <View style={styles.half}>
              <TextField
                label="Months"
                placeholder="0"
                value={months}
                onChangeText={(text) => setMonths(digitsOnly(text))}
                keyboardType="number-pad"
                maxLength={2}
              />
            </View>
          </View>
        )}
        {ageMode === 'age' && submitted && errors.age ? (
          <ThemedText type="small" style={{ color: theme.danger }}>
            {errors.age}
          </ThemedText>
        ) : null}
      </View>

      <View style={styles.group}>
        <ThemedText type="smallBold">Breed</ThemedText>
        <ChoiceChips
          value={breed}
          onChange={setBreed}
          options={BREEDS.map((item) => ({ value: item, label: item }))}
        />
        {breed === OTHER && (
          <TextField
            label="Which breed?"
            placeholder="Type the breed"
            value={customBreed}
            onChangeText={setCustomBreed}
            autoCapitalize="words"
          />
        )}
        {submitted && errors.breed ? (
          <ThemedText type="small" style={{ color: theme.danger }}>
            {errors.breed}
          </ThemedText>
        ) : null}
      </View>

      <TextField
        label="Bio or additional information (optional)"
        placeholder="Personality, favorite things, allergies, anything useful…"
        value={bio}
        onChangeText={setBio}
        multiline
        maxLength={MAX_BIO}
        style={styles.bio}
        hint={`${bio.length}/${MAX_BIO}`}
      />

      {/* Inline, not pinned: a pinned button would leave almost no room above the keyboard. */}
      <Button title="Finish" onPress={finish} />
    </FormScreen>
  );
}

const styles = StyleSheet.create({
  group: {
    gap: Spacing.two,
  },
  type: {
    alignSelf: 'flex-start',
    minHeight: 44,
    paddingHorizontal: Spacing.four,
    justifyContent: 'center',
    borderWidth: 1,
    borderRadius: 999,
  },
  row: {
    flexDirection: 'row',
    gap: Spacing.three,
  },
  half: {
    flex: 1,
  },
  bio: {
    minHeight: 110,
    textAlignVertical: 'top',
  },
});
