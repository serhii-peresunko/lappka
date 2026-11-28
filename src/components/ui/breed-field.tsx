import { SymbolView } from 'expo-symbols';
import { useMemo, useState } from 'react';
import { Modal, Pressable, ScrollView, StyleSheet, TextInput, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { BreedIcon } from '@/components/ui/breed-icon';
import { Spacing } from '@/constants/theme';
import { fontFamilyFor } from '@/constants/typography';
import { breedName, breedsFor } from '@/data/breeds';
import { useI18n } from '@/i18n';
import { useTheme } from '@/hooks/use-theme';
import type { PetType } from '@/providers/session';

type BreedFieldProps = {
  type: PetType;
  /** Selected breed, or '' when none. */
  value: string;
  onChange: (value: string) => void;
  error?: string;
};

/** A field that opens a searchable list of breeds, with "use what I typed" as a fallback. */
export function BreedField({ type, value, onChange, error }: BreedFieldProps) {
  const theme = useTheme();
  const { t, lang } = useI18n();
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState('');

  const all = useMemo(() => breedsFor(type), [type]);
  const needle = query.trim().toLowerCase();
  const matches = needle ? all.filter(
        (entry) =>
          entry.name.toLowerCase().includes(needle) || breedName(entry.name, lang).toLowerCase().includes(needle)
      ) : all;
  const exact = matches.some(
    (entry) => entry.name.toLowerCase() === needle || breedName(entry.name, lang).toLowerCase() === needle
  );

  function close() {
    setOpen(false);
    setQuery('');
  }

  function pick(name: string) {
    onChange(name);
    close();
  }

  return (
    <View style={styles.wrapper}>
      <ThemedText type="smallBold" style={styles.fieldLabel}>
        {t('pet.breed')}
      </ThemedText>
      <Pressable
        accessibilityRole="button"
        accessibilityLabel={`${t('pet.breed')}: ${value ? breedName(value, lang) : '—'}`}
        onPress={() => setOpen(true)}
        style={[
          styles.field,
          { backgroundColor: theme.surface, borderColor: error ? theme.danger : 'transparent' },
        ]}>
        {value ? <BreedIcon type={type} breed={value} size={32} /> : null}
        <ThemedText style={[styles.value, { color: value ? theme.text : theme.textSecondary }]} numberOfLines={1}>
          {value ? breedName(value, lang) : t('pet.chooseBreed')}
        </ThemedText>
        <SymbolView
          name={{ ios: 'chevron.down', android: 'expand_more', web: 'expand_more' }}
          tintColor={theme.textSecondary}
          size={16}
        />
      </Pressable>
      {error ? (
        <ThemedText type="small" style={{ color: theme.danger }}>
          {error}
        </ThemedText>
      ) : null}

      <Modal visible={open} animationType="slide" presentationStyle="pageSheet" onRequestClose={close}>
        <ThemedView style={styles.sheet}>
          <SafeAreaView style={styles.sheet} edges={['top', 'bottom']}>
            <View style={styles.bar}>
              <Pressable
                accessibilityRole="button"
                accessibilityLabel={t('close')}
                hitSlop={8}
                onPress={close}
                style={[styles.close, { backgroundColor: theme.backgroundSelected }]}>
                <SymbolView
                  name={{ ios: 'xmark', android: 'close', web: 'close' }}
                  tintColor={theme.text}
                  size={14}
                />
              </Pressable>
              <ThemedText type="smallBold" style={styles.title}>
                {t('pet.chooseBreed')}
              </ThemedText>
              <View style={styles.close} />
            </View>

            <View
              style={[styles.search, { backgroundColor: theme.surface, borderColor: 'transparent' }]}>
              <SymbolView
                name={{ ios: 'magnifyingglass', android: 'search', web: 'search' }}
                tintColor={theme.textSecondary}
                size={18}
              />
              <TextInput
                aria-label={t('pet.searchBreeds')}
                value={query}
                onChangeText={setQuery}
                placeholder={t('pet.searchBreeds')}
                placeholderTextColor={theme.textSecondary}
                autoCorrect={false}
                maxLength={80}
                style={[styles.input, { color: theme.text }]}
              />
            </View>

            <ScrollView
              keyboardShouldPersistTaps="handled"
              keyboardDismissMode="on-drag"
              contentContainerStyle={styles.list}>
              {needle && !exact ? (
                <Pressable
                  accessibilityRole="button"
                  onPress={() => pick(query.trim())}
                  style={[styles.row, { backgroundColor: theme.primarySoft }]}>
                  <SymbolView
                    name={{ ios: 'plus.circle.fill', android: 'add_circle', web: 'add_circle' }}
                    tintColor={theme.primary}
                    size={20}
                  />
                  <ThemedText type="smallBold" style={[styles.rowText, { color: theme.primaryText }]}>
                    {t('pet.useTyped', { name: query.trim() })}
                  </ThemedText>
                </Pressable>
              ) : null}
              {matches.map((entry) => {
                const item = entry.name;
                const selected = item === value;
                return (
                  <Pressable
                    key={item}
                    accessibilityRole="button"
                    accessibilityState={{ selected }}
                    onPress={() => pick(item)}
                    style={[
                      styles.row,
                      { backgroundColor: selected ? theme.primarySoft : theme.surface },
                    ]}>
                    <BreedIcon type={type} breed={item} size={40} />
                    <ThemedText
                      type={selected ? 'smallBold' : 'default'}
                      style={[styles.rowText, selected && { color: theme.primaryText }]}>
                      {breedName(item, lang)}
                    </ThemedText>
                    {selected && (
                      <SymbolView
                        name={{ ios: 'checkmark', android: 'check', web: 'check' }}
                        tintColor={theme.primary}
                        size={18}
                        weight="bold"
                      />
                    )}
                  </Pressable>
                );
              })}
            </ScrollView>
          </SafeAreaView>
        </ThemedView>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  fieldLabel: { paddingLeft: 4 },
  wrapper: {
    gap: Spacing.one + Spacing.half,
  },
  field: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.two,
    minHeight: 54,
    paddingHorizontal: Spacing.three,
    borderWidth: 1.5,
    borderRadius: 16,
  },
  value: {
    flex: 1,
    fontSize: 16,
  },
  sheet: {
    flex: 1,
  },
  bar: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: Spacing.three,
    paddingVertical: Spacing.three,
  },
  close: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: {
    flex: 1,
    textAlign: 'center',
    fontSize: 17,
  },
  search: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.two,
    marginHorizontal: Spacing.three,
    marginBottom: Spacing.two,
    paddingHorizontal: Spacing.three,
    borderWidth: 1,
    borderRadius: 8,
    minHeight: 52,
  },
  input: {
    flex: 1,
    fontSize: 16,
    fontFamily: fontFamilyFor(500),
    paddingVertical: Spacing.two,
    // The border already shows the field; drop the browser's extra outline on web.
    outlineWidth: 0,
  },
  list: {
    paddingHorizontal: Spacing.three,
    paddingBottom: Spacing.four,
    gap: Spacing.two,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.three,
    minHeight: 60,
    paddingHorizontal: Spacing.three - Spacing.one,
    borderRadius: 8,
  },
  rowText: {
    flex: 1,
  },
});
