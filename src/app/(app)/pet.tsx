import { useRouter } from 'expo-router';
import { Image, ScrollView, StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { countryName } from '@/components/pet-id-card';
import { PetMenuButton } from '@/components/pet-menu';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { IconButton } from '@/components/ui/icon-button';
import { ListRow } from '@/components/ui/list-row';
import { SymbolIcon } from '@/components/ui/symbol-icon';
import { Colors, Radius, Spacing } from '@/constants/theme';
import { breedName } from '@/data/breeds';
import { useAchievements } from '@/hooks/use-achievements';
import { useEventActions } from '@/hooks/use-event-actions';
import { useTask } from '@/hooks/use-task';
import { useI18n } from '@/i18n';
import { ageText, isoToInput } from '@/lib/dates';
import { KIND_COLORS, KIND_ICONS, KIND_SOFT } from '@/lib/event-kinds';
import { pickPetPhoto } from '@/lib/pick-photo';
import { lastVaccination } from '@/lib/repeat';
import { useSession } from '@/providers/session';

/** The pet's profile: a big photo, the name card, and everything we know in one list. */
export default function PetScreen() {
  const router = useRouter();
  const { t, lang } = useI18n();
  const { session, events, setPetPhoto } = useSession();
  const { list, unlockedCount } = useAchievements();
  const openEvent = useEventActions();
  const upload = useTask();
  const pet = session?.pet;
  if (!pet) return null;

  const vaccine = lastVaccination(events);
  const age = ageText(pet.birthDate, pet.approxAgeMonths, lang, true);
  const changePhoto = async () => {
    const uri = await pickPetPhoto();
    if (uri) await upload.run(() => setPetPhoto(uri));
  };

  return (
    <ThemedView style={styles.root}>
      <SafeAreaView style={styles.root} edges={['top']}>
        <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scroll}>
          <View style={styles.hero}>
            {pet.photo ? (
              <Image source={{ uri: pet.photo }} style={StyleSheet.absoluteFill} resizeMode="cover" />
            ) : (
              <SymbolIcon ios={pet.type === 'cat' ? 'cat.fill' : 'dog.fill'} material="pets" color="#FFFFFF" size={96} />
            )}
            <View style={styles.heroTop}>
              <IconButton label={t('back')} icon={{ ios: 'chevron.left', material: 'chevron_left' }} size={40} onPress={() => router.back()} />
              <View style={styles.menu}>
                <PetMenuButton />
              </View>
            </View>
            <View style={styles.camera}>
              <IconButton
                label={t(pet.photo ? 'pet.changePhoto' : 'pet.addPhoto')}
                icon={{ ios: 'camera.fill', material: 'photo_camera' }}
                tone="yellow"
                disabled={upload.pending}
                onPress={changePhoto}
              />
            </View>
          </View>

          <View style={styles.nameCard}>
            <ThemedText style={styles.name} numberOfLines={1}>
              {pet.name}
            </ThemedText>
            <ThemedText style={styles.nameDetails} numberOfLines={1}>
              {`${t(pet.type)}, ${age}, ${t(pet.sex)}`}
            </ThemedText>
          </View>

          <View style={styles.card}>
            <ListRow
              title={t('petProfile.basic')}
              subtitle={`${breedName(pet.breed, lang)} · ${countryName(pet.country ?? 'UA', lang)}`}
              icon={{ ios: 'doc.text', material: 'description', color: KIND_COLORS.vaccine, tint: KIND_SOFT.vaccine }}
            />
            <View style={styles.divider} />
            <ListRow
              title={t('petId.lastVaccine')}
              subtitle={vaccine ? `${isoToInput(vaccine.date)}${vaccine.description ? ` · ${vaccine.description}` : ''}` : t('petProfile.none')}
              icon={{ ...KIND_ICONS.vaccine, color: KIND_COLORS.medication, tint: KIND_SOFT.medication }}
              onPress={() => (vaccine ? openEvent(vaccine) : router.push({ pathname: '/add-event', params: { kind: 'vaccine' } }))}
            />
            <View style={styles.divider} />
            <ListRow
              title={t('petProfile.chip')}
              subtitle={t(pet.chipped ? 'petId.chipped' : 'petId.notChipped')}
              icon={{ ios: 'memorychip', material: 'memory', color: KIND_COLORS.vet, tint: KIND_SOFT.vet }}
            />
            <View style={styles.divider} />
            <ListRow
              title={t('petId.achievements')}
              subtitle={t('achievements.progress', { n: unlockedCount, total: list.length })}
              icon={{ ios: 'trophy', material: 'emoji_events', color: KIND_COLORS.grooming, tint: KIND_SOFT.grooming }}
              onPress={() => router.push('/achievements')}
            />
            {pet.instagram ? (
              <>
                <View style={styles.divider} />
                <ListRow title={t('petId.instagram')} subtitle={`@${pet.instagram}`} icon={{ ios: 'camera', material: 'photo_camera', color: KIND_COLORS.other, tint: KIND_SOFT.other }} />
              </>
            ) : null}
          </View>

          {pet.bio ? (
            <View style={[styles.card, styles.bio]}>
              <ThemedText style={styles.bioLabel}>{t('petId.about')}</ThemedText>
              <ThemedText style={styles.bioText}>{pet.bio}</ThemedText>
            </View>
          ) : null}
        </ScrollView>
      </SafeAreaView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  scroll: { width: '100%', maxWidth: 460, alignSelf: 'center', gap: 8, paddingHorizontal: Spacing.three, paddingBottom: Spacing.six },
  hero: { height: 300, borderRadius: 28, overflow: 'hidden', backgroundColor: '#2A2A2A', alignItems: 'center', justifyContent: 'center' },
  heroTop: { position: 'absolute', top: 14, left: 14, right: 14, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  menu: { width: 40, height: 40, borderRadius: 20, backgroundColor: '#FFFFFF', alignItems: 'center', justifyContent: 'center' },
  camera: { position: 'absolute', right: 14, bottom: 14 },
  nameCard: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: 12, padding: 18, borderRadius: Radius.card, backgroundColor: Colors.light.hero },
  name: { flexShrink: 1, fontSize: 26, lineHeight: 32, fontWeight: '600' },
  nameDetails: { color: Colors.light.textSecondary, fontSize: 13, lineHeight: 17, fontWeight: '500' },
  card: { borderRadius: Radius.card, backgroundColor: Colors.light.surface },
  divider: { height: 1, marginLeft: 66, backgroundColor: Colors.light.border },
  bio: { padding: 16, gap: 4 },
  bioLabel: { color: Colors.light.textSecondary, fontSize: 13, lineHeight: 17, fontWeight: '500' },
  bioText: { fontSize: 15, lineHeight: 21 },
});
