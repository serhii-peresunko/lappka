import Svg, { Path } from 'react-native-svg';
import { StyleSheet, View } from 'react-native';

import { PetMenuButton } from '@/components/pet-menu';
import { countryLabel, Fact, guilloche, PET_PHOTO } from '@/components/pet-id-card';
import { ThemedText } from '@/components/themed-text';
import { PetArt } from '@/components/ui/pet-art';
import { PetPhoto } from '@/components/ui/pet-photo';
import { SymbolIcon } from '@/components/ui/symbol-icon';
import { breedLook, breedName } from '@/data/breeds';
import { useI18n } from '@/i18n';
import { cardNumber } from '@/lib/pet-card';
import { ageText, isoToInput } from '@/lib/dates';
import { useSession } from '@/providers/session';

const PAD = 16;
const FOOTER = 40; // the footer row: the card number
const HEADER = 40; // the header row: logo on the left, "Pet passport" on the right

const PHOTO_SHARE = 0.32;

/** The compact card's height for a given width (the add-card tile next to it uses the same). */
export const compactCardHeight = (cardWidth: number) => HEADER + cardWidth * PHOTO_SHARE * 1.3 + PAD + FOOTER;

/** The compact pet card: the photo on the left, the name and details on the right. The second page of the home pager. */
export function PetIdCardCompact({ width: cardWidth }: { width: number }) {
  const { t, lang } = useI18n();
  const { session } = useSession();
  const pet = session?.pet;
  if (!pet) return null;

  const cardHeight = compactCardHeight(cardWidth);
  const photoWidth = cardWidth * PHOTO_SHARE;
  const photoHeight = photoWidth * 1.3;
  const look = breedLook(pet.type, pet.breed);
  const dob = pet.birthDate ? isoToInput(pet.birthDate) : ageText(pet.birthDate, pet.approxAgeMonths, lang);
  const lines = guilloche(cardWidth, cardHeight);

  return (
    <View accessibilityLabel={t('petId.cardLabel')} style={[styles.face, { width: cardWidth, height: cardHeight }]}>
      <View style={styles.inner}>
        <View pointerEvents="none" style={StyleSheet.absoluteFill}>
          <Svg width={cardWidth} height={cardHeight}>
            {lines.map((d, index) => (
              <Path key={index} d={d} stroke="#000000" strokeOpacity={0.05} strokeWidth={0.6} fill="none" />
            ))}
          </Svg>
        </View>
        <View pointerEvents="none" style={styles.watermark}>
          <SymbolIcon ios="pawprint.fill" material="pets" color="#000000" size={150} />
        </View>

        <View style={styles.header}>
          <SymbolIcon ios="pawprint.fill" material="pets" color="#111111" size={19} />
          <PetMenuButton />
        </View>

        <View style={styles.row}>
          <View style={[styles.photo, { width: photoWidth, height: photoHeight }]}>
            {pet.photo || pet.type === 'dog' ? (
              <PetPhoto source={pet.photo ? { uri: pet.photo } : PET_PHOTO} width={photoWidth} height={photoHeight} sharpShare={1} fit="cover" />
            ) : (
              <View style={[styles.catBox, { width: photoWidth, height: photoHeight }]}>
                <PetArt type={pet.type} size={80} color="#111" accent="#111" strokeWidth={4} fill={look.coat} ears={look.ears} />
              </View>
            )}
          </View>

          <View style={styles.info}>
            <View style={styles.nameRow}>
              <ThemedText style={styles.name} numberOfLines={1}>
                {pet.name}
              </ThemedText>
              {pet.verified ? <SymbolIcon ios="checkmark.seal.fill" material="verified" color="#111111" size={18} /> : null}
              {pet.chipped ? (
                <View style={styles.badge}>
                  <SymbolIcon ios="memorychip.fill" material="memory" color="#6B6B6B" size={10} />
                </View>
              ) : null}
            </View>
            <View style={styles.facts}>
              <Fact label={t('petId.type')} value={`${t(pet.type)} (${t(pet.sex).toLowerCase()})`} flex={0} dark compact />
              <Fact label={t('petId.breed')} value={breedName(pet.breed, lang)} flex={0} dark compact />
              <Fact
                label={t('petId.dob')}
                value={dob}
                extra={pet.birthDate ? ageText(pet.birthDate, pet.approxAgeMonths, lang) : undefined}
                flex={0}
                dark
                light
                compact
                inline
              />
            </View>
          </View>
        </View>

        <View style={styles.footer}>
          <ThemedText style={styles.country} numberOfLines={1}>
            {countryLabel(pet.country ?? 'UA', lang)}
          </ThemedText>
          <ThemedText style={styles.cardNo}>{cardNumber(pet)}</ThemedText>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  face: {
    borderRadius: 10,
    shadowColor: '#000',
    shadowOpacity: 0.14,
    shadowRadius: 20,
    shadowOffset: { width: 0, height: 10 },
  },
  inner: {
    flex: 1,
    borderRadius: 10,
    overflow: 'hidden',
    backgroundColor: '#FFFFFF',
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: '#DCDCDE',
  },
  watermark: { position: 'absolute', right: -34, bottom: -40, opacity: 0.028, transform: [{ rotate: '-18deg' }] },
  header: { position: 'absolute', top: 0, left: PAD, right: PAD, height: HEADER, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  footer: { position: 'absolute', bottom: 0, left: PAD, right: PAD, height: FOOTER, borderTopWidth: StyleSheet.hairlineWidth, borderTopColor: '#C4C4C7', flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  country: { color: '#111111', fontSize: 14, lineHeight: 18, fontWeight: '500', flexShrink: 1 },
  cardNo: { color: '#6B6B6B', fontSize: 11, lineHeight: 14, fontWeight: '500', letterSpacing: 1.2 },
  row: { flex: 1, flexDirection: 'row', paddingHorizontal: PAD, paddingTop: HEADER, paddingBottom: PAD + FOOTER, gap: 16 },
  photo: { borderRadius: 6, overflow: 'hidden' },
  catBox: { backgroundColor: '#E4E4E6', alignItems: 'center', justifyContent: 'center' },
  // The name's top and the last field's bottom sit on the photo's top and bottom edges (the font adds a little air).
  info: { flex: 1, justifyContent: 'space-between', marginTop: -5, marginBottom: -4 },
  nameRow: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  name: { color: '#111111', fontSize: 24, lineHeight: 28, fontWeight: '500', flexShrink: 1 },
  badge: { width: 18, height: 18, borderRadius: 9, backgroundColor: 'rgba(0,0,0,0.06)', alignItems: 'center', justifyContent: 'center' },
  facts: { gap: 4 },
});
