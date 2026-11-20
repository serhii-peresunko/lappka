import { useRouter } from 'expo-router';
import { StyleSheet, View } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { FormScreen } from '@/components/ui/form-screen';
import { SymbolIcon } from '@/components/ui/symbol-icon';
import { Button } from '@/components/ui/button';
import { Segmented } from '@/components/ui/choice';
import { pickPetPhoto } from '@/lib/pick-photo';
import { Spacing } from '@/constants/theme';
import { useI18n, type Lang } from '@/i18n';
import { useTheme } from '@/hooks/use-theme';
import { useSession } from '@/providers/session';

/** Settings tab: who is signed in, and sign out. */
export default function SettingsScreen() {
  const theme = useTheme();
  const router = useRouter();
  const { session, signOut, setPetPhoto } = useSession();
  const { t, lang, setLang } = useI18n();

  const rows: { label: string; value: string; ios: string; material: string }[] = [
    { label: t('settings.name'), value: session?.ownerName ?? '', ios: 'person', material: 'person' },
    { label: t('settings.email'), value: session?.email ?? '', ios: 'envelope', material: 'mail' },
    { label: t('settings.signedInWith'), value: session ? t(`method.${session.method}` as const) : '', ios: 'key', material: 'key' },
  ];

  return (
    <FormScreen title={t('settings.title')} onBack={() => router.back()}>
      <View style={styles.section}>
        <ThemedText type="smallBold" themeColor="textSecondary" style={styles.sectionTitle}>
          {t('settings.account')}
        </ThemedText>
        <View>
          {rows.map(({ label, value, ios, material }, index) => (
            <View
              key={label}
              style={[styles.row, index > 0 && { borderTopWidth: StyleSheet.hairlineWidth, borderTopColor: theme.border }]}>
              <SymbolIcon ios={ios} material={material} color={theme.textSecondary} size={20} />
              <ThemedText themeColor="textSecondary" style={styles.label}>
                {label}
              </ThemedText>
              <ThemedText type="smallBold" style={styles.value} numberOfLines={1}>
                {value}
              </ThemedText>
            </View>
          ))}
        </View>
      </View>

      <View style={styles.section}>
        <ThemedText type="smallBold" themeColor="textSecondary" style={styles.sectionTitle}>
          {t('settings.language')}
        </ThemedText>
        <Segmented<Lang>
          value={lang}
          onChange={setLang}
          options={[
            { value: 'uk', label: t('lang.uk') },
            { value: 'en', label: t('lang.en') },
          ]}
        />
      </View>

      {session?.pet ? (
        <View style={styles.section}>
          <ThemedText type="smallBold" themeColor="textSecondary" style={styles.sectionTitle}>
            {t('settings.petPhoto')}
          </ThemedText>
          <Button
            variant="outline"
            title={t(session.pet.photo ? 'pet.changePhoto' : 'pet.addPhoto')}
            onPress={async () => {
              const uri = await pickPetPhoto();
              if (uri) setPetPhoto(uri);
            }}
          />
        </View>
      ) : null}

      <Button variant="outline" title={t('settings.signOut')} onPress={signOut} />
    </FormScreen>
  );
}

const styles = StyleSheet.create({
  section: { gap: Spacing.two },
  sectionTitle: { fontSize: 14 },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: Spacing.three,
    minHeight: 52,
  },
  label: { flex: 1 },
  value: { fontSize: 16, flexShrink: 1, textAlign: 'right', maxWidth: '60%' },
});
