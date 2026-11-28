import { Image, StyleSheet, View } from 'react-native';

import { countryName } from '@/components/pet-id-card';
import { PetMenuButton } from '@/components/pet-menu';
import { STATS_HEIGHT } from '@/components/pet-stats';
import { ThemedText } from '@/components/themed-text';
import { IconButton } from '@/components/ui/icon-button';
import { SymbolIcon } from '@/components/ui/symbol-icon';
import { Colors } from '@/constants/theme';
import { breedName } from '@/data/breeds';
import { useTask } from '@/hooks/use-task';
import { useI18n } from '@/i18n';
import { ageText } from '@/lib/dates';
import { pickPetPhoto } from '@/lib/pick-photo';
import { useSession } from '@/providers/session';

const CARD_SHARE = 0.7; // the whole card's height as a share of its width
const TEXT_HEIGHT = 56; // the name and details under the picture
const PHOTO_RATIO = 5 / 4; // photos are cropped to 4:5 when picked
const FOCUS = 0.3; // how far down the portrait the crop starts, so the face stays in frame

/** The pet: its photo (or an icon with an add-photo button), then the name and details in plain text. */
export function PetIdCardCompact({ width }: { width: number }) {
  const { t, lang } = useI18n();
  const { session, setPetPhoto } = useSession();
  const upload = useTask();
  const pet = session?.pet;
  if (!pet) return null;

  const height = Math.round(width * CARD_SHARE) - STATS_HEIGHT - TEXT_HEIGHT;
  const imageHeight = Math.max(height, width * PHOTO_RATIO);
  const details = [breedName(pet.breed, lang), ageText(pet.birthDate, pet.approxAgeMonths, lang, true), countryName(pet.country ?? 'UA', lang)];

  const addPhoto = async () => {
    const uri = await pickPetPhoto();
    if (uri) await upload.run(() => setPetPhoto(uri));
  };

  return (
    <View accessibilityLabel={t('petId.cardLabel')} style={{ width }}>
      <View style={[styles.face, { width, height }]}>
        {pet.photo ? (
          <Image
            source={{ uri: pet.photo }}
            resizeMode="cover"
            style={{ position: 'absolute', left: 0, width, height: imageHeight, top: -(imageHeight - height) * FOCUS }}
          />
        ) : (
          <View style={styles.art}>
            <SymbolIcon ios={pet.type === 'cat' ? 'cat' : 'dog'} material="pets" color={Colors.light.text} size={72} />
          </View>
        )}
        <View style={styles.top}>
          {!pet.photo ? (
            <IconButton label={t('pet.addPhoto')} icon={{ ios: 'camera', material: 'photo_camera' }} disabled={upload.pending} onPress={addPhoto} />
          ) : (
            <View />
          )}
          <PetMenuButton />
        </View>
      </View>

      <View style={styles.bottom}>
        <View style={styles.nameRow}>
          <ThemedText style={styles.name} numberOfLines={1}>
            {pet.name}
          </ThemedText>
          {pet.verified ? <SymbolIcon ios="checkmark.seal" material="verified" color={Colors.light.text} size={18} /> : null}
          {/* There is no system symbol for sex, so the classic signs are used: male / female. */}
          <ThemedText style={styles.sex} accessibilityLabel={t(pet.sex)}>
            {pet.sex === 'male' ? '\u2642' : '\u2640'}
          </ThemedText>
        </View>
        <ThemedText style={styles.details} numberOfLines={1}>
          {details.join('  ·  ')}
        </ThemedText>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  face: { overflow: 'hidden' },
  art: { ...(StyleSheet.absoluteFill as object), alignItems: 'center', justifyContent: 'center' },
  top: { position: 'absolute', top: 8, left: 0, right: 0, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  bottom: { height: TEXT_HEIGHT, justifyContent: 'center', gap: 2 },
  nameRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  name: { color: Colors.light.text, fontSize: 24, lineHeight: 30, fontWeight: '700', flexShrink: 1 },
  sex: { color: Colors.light.text, fontSize: 18, lineHeight: 24, fontWeight: '500' },
  details: { color: Colors.light.textSecondary, fontSize: 13, lineHeight: 18, fontWeight: '500' },
});
