import { useRouter } from 'expo-router';
import { Image, Pressable, StyleSheet, View } from 'react-native';

import { countryName } from '@/components/pet-id-card';
import { PetMenuButton } from '@/components/pet-menu';
import { ThemedText } from '@/components/themed-text';
import { SymbolIcon } from '@/components/ui/symbol-icon';
import { Colors } from '@/constants/theme';
import { breedName } from '@/data/breeds';
import { useAchievements } from '@/hooks/use-achievements';
import { useEventActions } from '@/hooks/use-event-actions';
import { useTask } from '@/hooks/use-task';
import { useI18n } from '@/i18n';
import { ageText, isoToInput } from '@/lib/dates';
import { KIND_COLORS, KIND_ICONS } from '@/lib/event-kinds';
import { pickPetPhoto } from '@/lib/pick-photo';
import { lastVaccination } from '@/lib/repeat';
import { useSession } from '@/providers/session';

/**
 * The pet's passport card: a square photo at the top left, all the details beside it, and two tiles along the
 * bottom (last vaccination, achievements). Nothing on it opens a details screen.
 */
export function PetCardPager() {
  const { t, lang } = useI18n();
  const router = useRouter();
  const { session, events, setPetPhoto } = useSession();
  const { list, unlockedCount } = useAchievements();
  const openEvent = useEventActions();
  const upload = useTask();
  const pet = session?.pet;
  if (!pet) return null;

  const vaccine = lastVaccination(events);
  const changePhoto = async () => {
    const uri = await pickPetPhoto();
    if (uri) await upload.run(() => setPetPhoto(uri));
  };

  return (
    <View style={styles.card}>
      <View style={styles.top}>
        <View style={styles.photo}>
          {pet.photo ? (
            <Image source={{ uri: pet.photo }} style={StyleSheet.absoluteFill} resizeMode="cover" />
          ) : (
            <SymbolIcon ios={pet.type === 'cat' ? 'cat.fill' : 'dog.fill'} material="pets" color={Colors.light.text} size={44} />
          )}
          <Pressable
            accessibilityRole="button"
            accessibilityLabel={t(pet.photo ? 'pet.changePhoto' : 'pet.addPhoto')}
            hitSlop={8}
            disabled={upload.pending}
            onPress={changePhoto}
            style={({ pressed }) => [styles.camera, (pressed || upload.pending) && { opacity: 0.6 }]}>
            <SymbolIcon ios="camera.fill" material="photo_camera" color={Colors.light.text} size={13} />
          </Pressable>
        </View>

        {/* Plain text: everything is on the card, so it does not open another screen. */}
        <View style={styles.info}>
          <View style={styles.nameRow}>
            <ThemedText style={styles.name} numberOfLines={1}>
              {pet.name}
            </ThemedText>
            {pet.verified ? <SymbolIcon ios="checkmark.seal.fill" material="verified" color={Colors.light.text} size={15} /> : null}
            {/* There is no system symbol for sex, so the classic signs are used: male / female. */}
            <ThemedText style={styles.sex} accessibilityLabel={t(pet.sex)}>
              {pet.sex === 'male' ? '\u2642' : '\u2640'}
            </ThemedText>
          </View>
          <ThemedText style={styles.detail} numberOfLines={2}>
            {breedName(pet.breed, lang)}
          </ThemedText>
          <ThemedText style={styles.detail} numberOfLines={1}>
            {ageText(pet.birthDate, pet.approxAgeMonths, lang, true)}
          </ThemedText>
          <ThemedText style={styles.detail} numberOfLines={1}>
            {countryName(pet.country ?? 'UA', lang)}
          </ThemedText>
          <ThemedText style={styles.detail} numberOfLines={1}>
            {`${t('pet.chip')}: ${t(pet.chipped ? 'yes' : 'no').toLowerCase()}`}
          </ThemedText>
        </View>

        {/* Settings, co-owner and delete. */}
        <View style={styles.menu}>
          <PetMenuButton />
        </View>
      </View>

      <View style={styles.stats}>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel={`${t('petId.lastVaccine')}: ${vaccine ? isoToInput(vaccine.date) : t('petId.addVaccine')}`}
          onPress={() => (vaccine ? openEvent(vaccine) : router.push({ pathname: '/add-event', params: { kind: 'vaccine' } }))}
          style={({ pressed }) => [styles.half, pressed && { opacity: 0.6 }]}>
          <View style={styles.statCircle}>
            <SymbolIcon {...KIND_ICONS.vaccine} color={KIND_COLORS.vaccine} size={16} />
          </View>
          <View style={styles.statText}>
            <ThemedText style={styles.statLabel} numberOfLines={1} adjustsFontSizeToFit>
              {t('petId.lastVaccine')}
            </ThemedText>
            <ThemedText style={styles.statValue} numberOfLines={1}>
              {vaccine ? isoToInput(vaccine.date) : t('petId.addVaccine')}
            </ThemedText>
          </View>
        </Pressable>

        <Pressable
          accessibilityRole="button"
          accessibilityLabel={t('home.seeAchievements')}
          onPress={() => router.push('/achievements')}
          style={({ pressed }) => [styles.half, pressed && { opacity: 0.6 }]}>
          <View style={styles.statCircle}>
            <SymbolIcon ios="trophy.fill" material="emoji_events" color={Colors.light.text} size={15} />
          </View>
          <View style={styles.statText}>
            <ThemedText style={styles.statLabel} numberOfLines={1}>
              {t('petId.achievements')}
            </ThemedText>
            <ThemedText style={styles.statValue}>
              {unlockedCount}/{list.length}
            </ThemedText>
          </View>
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  // 250 high with a 161 square photo 16 from the top and left, as in the wireframe.
  card: { gap: 16, padding: 16, borderRadius: 12, backgroundColor: Colors.light.surface },
  top: { flexDirection: 'row', gap: 14 },
  photo: { width: '46%', aspectRatio: 1, borderRadius: 12, overflow: 'hidden', alignItems: 'center', justifyContent: 'center', backgroundColor: Colors.light.raised },
  camera: { position: 'absolute', right: 8, bottom: 8, width: 34, height: 34, borderRadius: 17, alignItems: 'center', justifyContent: 'center', backgroundColor: Colors.light.accent },
  info: { flex: 1, justifyContent: 'center', gap: 2 },
  nameRow: { flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: 4, paddingRight: 4 },
  name: { flexShrink: 1, fontSize: 24, lineHeight: 29, fontWeight: '500' },
  sex: { fontSize: 18, lineHeight: 24, fontWeight: '500' },
  menu: { position: 'absolute', top: 0, right: 0 },
  detail: { color: Colors.light.textSecondary, fontSize: 14, lineHeight: 19, fontWeight: '500' },
  stats: { flexDirection: 'row', gap: 8 },
  statCircle: { width: 34, height: 34, borderRadius: 17, alignItems: 'center', justifyContent: 'center', backgroundColor: Colors.light.surface },
  half: { flex: 1, flexDirection: 'row', alignItems: 'center', gap: 8, height: 52, paddingHorizontal: 9, borderRadius: 12, backgroundColor: Colors.light.raised },
  statText: { flex: 1 },
  statLabel: { color: Colors.light.textSecondary, fontSize: 10, lineHeight: 13, fontWeight: '500' },
  statValue: { fontSize: 14, lineHeight: 18, fontWeight: '500', fontVariant: ['tabular-nums'] },
});
