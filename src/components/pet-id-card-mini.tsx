import { Dimensions, StyleSheet, View } from 'react-native';

import { PET_PHOTO } from '@/components/pet-id-card';
import { compactCardHeight } from '@/components/pet-id-card-compact';
import { ThemedText } from '@/components/themed-text';
import { PetArt } from '@/components/ui/pet-art';
import { PetPhoto } from '@/components/ui/pet-photo';
import { SymbolIcon } from '@/components/ui/symbol-icon';
import { breedLook } from '@/data/breeds';
import { useSession } from '@/providers/session';

export const MINI_WIDTH = 112;
const PAD = 8;
const NAME_HEIGHT = 36;
const HEADER_HEIGHT = 30; // logo on the left, an icon for the kind of pet (dog / cat) on the right
// As tall as the full card, so switching between the two views does not shift the page.
export const MINI_HEIGHT = compactCardHeight(Math.min(Dimensions.get('window').width - 48, 420));
const PHOTO_HEIGHT = MINI_HEIGHT - PAD * 2 - NAME_HEIGHT - HEADER_HEIGHT;
const PHOTO_WIDTH = MINI_WIDTH - PAD * 2;

/** The smallest pet card: just the photo and the name. */
export function PetIdCardMini() {
  const { session } = useSession();
  const pet = session?.pet;
  if (!pet) return null;
  const look = breedLook(pet.type, pet.breed);

  return (
    <View style={styles.card}>
      <View style={styles.header}>
        <SymbolIcon ios="pawprint.fill" material="pets" color="#111111" size={17} />
        <SymbolIcon
          ios={pet.type === 'dog' ? 'dog.fill' : 'cat.fill'}
          material="pets"
          color="#8A8A8A"
          size={19}
        />
      </View>
      <View style={styles.photo}>
        {pet.photo || pet.type === 'dog' ? (
          <PetPhoto source={pet.photo ? { uri: pet.photo } : PET_PHOTO} width={PHOTO_WIDTH} height={PHOTO_HEIGHT} sharpShare={1} fit="cover" />
        ) : (
          <View style={styles.catBox}>
            <PetArt type={pet.type} size={64} color="#111" accent="#111" strokeWidth={4} fill={look.coat} ears={look.ears} />
          </View>
        )}
      </View>
      <View style={styles.nameBox}>
        <ThemedText style={styles.name} numberOfLines={1}>
          {pet.name}
        </ThemedText>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    width: MINI_WIDTH,
    height: MINI_HEIGHT,
    padding: PAD,
    borderRadius: 10,
    backgroundColor: '#FFFFFF',
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: '#DCDCDE',
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 6 },
  },
  header: { height: HEADER_HEIGHT, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingBottom: 4 },
  photo: { width: PHOTO_WIDTH, height: PHOTO_HEIGHT, borderRadius: 6, overflow: 'hidden' },
  catBox: { width: PHOTO_WIDTH, height: PHOTO_HEIGHT, backgroundColor: '#E4E4E6', alignItems: 'center', justifyContent: 'center' },
  nameBox: { height: NAME_HEIGHT, justifyContent: 'center' },
  name: { color: '#111111', fontSize: 16, lineHeight: 20, fontWeight: '500' },
});
