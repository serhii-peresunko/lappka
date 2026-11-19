import { useState } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { BreedField } from '@/components/ui/breed-field';
import { Button } from '@/components/ui/button';
import { FormScreen } from '@/components/ui/form-screen';
import { PetArt } from '@/components/ui/pet-art';
import { TextField } from '@/components/ui/text-field';
import { Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';
import { breedLook } from '@/data/breeds';
import { parseInstagram } from '@/lib/instagram';
import { useSession, type PetSex } from '@/providers/session';

const MAX_YEARS = 30;
const MAX_BIO = 280;

/** "15022024" -> "15.02.2024": keeps only digits and inserts the dots while typing. */
function formatBirthDate(input: string) {
  const digits = input.replace(/\D/g, '').slice(0, 8);
  return [digits.slice(0, 2), digits.slice(2, 4), digits.slice(4, 8)].filter(Boolean).join('.');
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

/** Step 3: breed, name, birth date (or approximate age) and a few words about the pet. */
export default function PetDetailsScreen() {
  const theme = useTheme();
  const { draftPetType, setDraftPetType, savePet } = useSession();
  // The layout only shows this screen once a type is chosen.
  const type = draftPetType ?? 'dog';
  const noun = type === 'cat' ? 'cat' : 'dog';

  const [breed, setBreed] = useState('');
  const [name, setName] = useState('');
  const [sex, setSex] = useState<PetSex | null>(null);
  const [knowsBirthDate, setKnowsBirthDate] = useState(true);
  const [birth, setBirth] = useState('');
  const [years, setYears] = useState('');
  const [months, setMonths] = useState('');
  const [bio, setBio] = useState('');
  const [instagram, setInstagram] = useState('');
  const [submitted, setSubmitted] = useState(false);

  // The picture follows the chosen breed (coat color and ears).
  const look = breed ? breedLook(type, breed) : undefined;
  const birthDate = parseBirthDate(birth);
  const approxAgeMonths = Number(years || 0) * 12 + Number(months || 0);

  const instagramHandle = parseInstagram(instagram);

  const errors = {
    instagram: instagramHandle === undefined ? 'Enter a handle like @bublyk or a profile link' : undefined,
    breed: breed.trim() ? undefined : 'Choose a breed',
    name: name.trim() ? undefined : `Enter your ${noun}'s name`,
    sex: sex ? undefined : 'Choose male or female',
    age: knowsBirthDate
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
  };

  function finish() {
    setSubmitted(true);
    if (errors.breed || errors.name || errors.sex || errors.age || errors.instagram || !sex) return;
    savePet({
      type,
      name: name.trim(),
      sex,
      birthDate: knowsBirthDate ? birthDate : null,
      approxAgeMonths: knowsBirthDate ? null : approxAgeMonths,
      breed: breed.trim(),
      bio: bio.trim(),
      instagram: instagramHandle ?? null,
    });
  }

  return (
    <FormScreen
      eyebrow="Step 3 of 3"
      title={`About your ${noun}`}
      subtitle="Just the basics. You can change them later."
      onBack={() => setDraftPetType(null)}>
      <View style={styles.hero}>
        <View style={[styles.avatar, { backgroundColor: theme.primarySoft }]}>
          <PetArt
            type={type}
            size={84}
            color={theme.text}
            accent={theme.primary}
            bandana
            strokeWidth={4.6}
            fill={look?.coat}
            ears={look?.ears}
          />
        </View>
      </View>

      <BreedField type={type} value={breed} onChange={setBreed} error={submitted ? errors.breed : undefined} />

      <TextField
        label="Name"
        placeholder={type === 'cat' ? 'e.g. Mila' : 'e.g. Bublyk'}
        value={name}
        onChangeText={setName}
        error={submitted ? errors.name : undefined}
        autoCapitalize="words"
        returnKeyType="next"
      />

      <View style={styles.group}>
        <ThemedText type="smallBold">Sex</ThemedText>
        <View style={styles.row}>
          {(['male', 'female'] as const).map((option) => {
            const selected = sex === option;
            return (
              <Pressable
                key={option}
                accessibilityRole="radio"
                accessibilityState={{ checked: selected }}
                onPress={() => setSex(option)}
                style={[
                  styles.sex,
                  {
                    borderColor: submitted && errors.sex ? theme.danger : selected ? theme.primary : theme.border,
                    backgroundColor: selected ? theme.primarySoft : theme.backgroundElement,
                  },
                ]}>
                <ThemedText
                  type="smallBold"
                  style={{ color: selected ? theme.primaryText : theme.text, fontSize: 16 }}>
                  {option === 'male' ? 'Male' : 'Female'}
                </ThemedText>
              </Pressable>
            );
          })}
        </View>
        {submitted && errors.sex ? (
          <ThemedText type="small" style={{ color: theme.danger }}>
            {errors.sex}
          </ThemedText>
        ) : null}
      </View>

      <View style={styles.group}>
        {knowsBirthDate ? (
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
          <>
            <ThemedText type="smallBold">Approximate age</ThemedText>
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
            {submitted && errors.age ? (
              <ThemedText type="small" style={{ color: theme.danger }}>
                {errors.age}
              </ThemedText>
            ) : null}
          </>
        )}
        <Pressable
          accessibilityRole="button"
          onPress={() => setKnowsBirthDate((value) => !value)}
          style={styles.toggle}>
          <ThemedText type="smallBold" style={{ color: theme.primaryText }}>
            {knowsBirthDate ? "I don't know the exact date" : 'I know the birth date'}
          </ThemedText>
        </Pressable>
      </View>

      <TextField
        label="Info (optional)"
        placeholder={`Personality, favorite things, allergies, anything useful…`}
        value={bio}
        onChangeText={setBio}
        multiline
        maxLength={MAX_BIO}
        style={styles.bio}
        hint={`${bio.length}/${MAX_BIO}`}
      />

      <TextField
        label="Instagram (optional)"
        placeholder="@yourpet"
        value={instagram}
        onChangeText={setInstagram}
        error={submitted ? errors.instagram : undefined}
        autoCapitalize="none"
        autoCorrect={false}
        keyboardType="url"
      />

      {/* Inline, not pinned: a pinned button would leave almost no room above the keyboard. */}
      <Button title="Finish" onPress={finish} />
    </FormScreen>
  );
}

const styles = StyleSheet.create({
  hero: {
    alignItems: 'center',
  },
  avatar: {
    width: 112,
    height: 112,
    borderRadius: 56,
    alignItems: 'center',
    justifyContent: 'center',
  },
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
  sex: {
    flex: 1,
    minHeight: 52,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderRadius: 14,
  },
  toggle: {
    alignSelf: 'flex-start',
    minHeight: 44,
    justifyContent: 'center',
  },
  bio: {
    minHeight: 110,
    textAlignVertical: 'top',
  },
});
