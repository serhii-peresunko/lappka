import { useRouter } from 'expo-router';
import { Alert, Image, ScrollView, StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { ProgressRing } from '@/components/progress-ring';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { Button } from '@/components/ui/button';
import { Segmented } from '@/components/ui/choice';
import { IconButton } from '@/components/ui/icon-button';
import { ListRow } from '@/components/ui/list-row';
import { SymbolIcon } from '@/components/ui/symbol-icon';
import { Colors, Radius, Spacing } from '@/constants/theme';
import { breedName } from '@/data/breeds';
import { useAchievements } from '@/hooks/use-achievements';
import { useI18n, type Lang } from '@/i18n';
import { ageText } from '@/lib/dates';
import { useSession } from '@/providers/session';

/** The profile screen: the owner, the achievements, the pet, and the settings. */
export default function ProfileScreen() {
  const router = useRouter();
  const { session, signOut } = useSession();
  const { t, lang, setLang } = useI18n();
  const { list, unlockedCount } = useAchievements();
  const pet = session?.pet;

  return (
    <ThemedView style={styles.root}>
      <SafeAreaView style={styles.root} edges={['top']}>
        <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scroll}>
          <IconButton label={t('back')} icon={{ ios: 'chevron.left', material: 'chevron_left' }} size={40} onPress={() => router.back()} />
          <ThemedText type="subtitle">{t('profile.title')}</ThemedText>

          <View style={styles.card}>
            <ListRow
              title={session?.ownerName ?? ''}
              subtitle={session?.email ?? ''}
              leading={
                <View style={styles.avatar}>
                  <ThemedText style={styles.avatarText}>{(session?.ownerName ?? '').trim().charAt(0).toUpperCase()}</ThemedText>
                </View>
              }
            />
          </View>

          <View style={styles.card}>
            <ListRow
              title={t('petId.achievements')}
              subtitle={t('achievements.progress', { n: unlockedCount, total: list.length })}
              leading={<ProgressRing size={40} value={unlockedCount / Math.max(1, list.length)} label={String(unlockedCount)} />}
              onPress={() => router.push('/achievements')}
            />
          </View>

          {pet ? (
            <View style={styles.section}>
              <ThemedText style={styles.sectionLabel}>{t('profile.myPet')}</ThemedText>
              <View style={styles.card}>
                <ListRow
                  title={pet.name}
                  subtitle={`${breedName(pet.breed, lang)} · ${ageText(pet.birthDate, pet.approxAgeMonths, lang, true)}`}
                  leading={
                    <View style={styles.photo}>
                      {pet.photo ? (
                        <Image source={{ uri: pet.photo }} style={StyleSheet.absoluteFill} resizeMode="cover" />
                      ) : (
                        <SymbolIcon ios={pet.type === 'cat' ? 'cat.fill' : 'dog.fill'} material="pets" color={Colors.light.text} size={22} />
                      )}
                    </View>
                  }
                  onPress={() => router.push('/pet')}
                />
              </View>
            </View>
          ) : null}

          <View style={styles.section}>
            <ThemedText style={styles.sectionLabel}>{t('profile.settings')}</ThemedText>
            <View style={styles.card}>
              <ListRow title={t('settings.signedInWith')} value={session ? t(`method.${session.method}` as const) : ''} />
            </View>
            <ThemedText style={styles.sectionLabel}>{t('settings.language')}</ThemedText>
            <Segmented<Lang>
              value={lang}
              onChange={setLang}
              options={[
                { value: 'uk', label: t('lang.uk') },
                { value: 'en', label: t('lang.en') },
              ]}
            />
          </View>

          <Button
            variant="danger"
            title={t('settings.signOut')}
            onPress={() =>
              Alert.alert(t('settings.signOutTitle'), t('settings.signOutMessage'), [
                { text: t('petMenu.cancel'), style: 'cancel' },
                { text: t('settings.signOut'), style: 'destructive', onPress: () => void signOut() },
              ])
            }
          />
        </ScrollView>
      </SafeAreaView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  scroll: { width: '100%', maxWidth: 460, alignSelf: 'center', gap: 12, paddingHorizontal: Spacing.three, paddingTop: Spacing.two, paddingBottom: Spacing.six },
  card: { borderRadius: Radius.card, backgroundColor: Colors.light.surface },
  section: { gap: 8, paddingTop: 4 },
  sectionLabel: { color: Colors.light.textSecondary, fontSize: 13, lineHeight: 17, fontWeight: '500', paddingLeft: 4 },
  avatar: { width: 40, height: 40, borderRadius: 20, backgroundColor: Colors.light.hero, alignItems: 'center', justifyContent: 'center' },
  avatarText: { fontSize: 17, lineHeight: 22, fontWeight: '600' },
  photo: { width: 44, height: 44, borderRadius: 12, overflow: 'hidden', backgroundColor: Colors.light.hero, alignItems: 'center', justifyContent: 'center' },
});
