import { useRouter } from 'expo-router';
import { Pressable, StyleSheet, View } from 'react-native';
import Svg, { Path } from 'react-native-svg';

import { countryLabel, Fact, guilloche, PET_PHOTO } from '@/components/pet-id-card';
import { PetMenuButton } from '@/components/pet-menu';
import { ThemedText } from '@/components/themed-text';
import { PetArt } from '@/components/ui/pet-art';
import { PetPhoto } from '@/components/ui/pet-photo';
import { SymbolIcon } from '@/components/ui/symbol-icon';
import { breedLook, breedName } from '@/data/breeds';
import { useI18n } from '@/i18n';
import { ageText, isoToInput } from '@/lib/dates';
import { lastVaccination } from '@/lib/repeat';
import { useSession } from '@/providers/session';

const PAD = 16;

const PHOTO_SHARE = 0.353; // photo width as a share of the card (another 5% wider)
const PHOTO_HEIGHT_SHARE = 0.43; // photo height as a share of the card width (unchanged)
const EXTRA = 0; // extra photo height, so four fields fit beside it
const FOOTER = 44; // the footer strip: a hint that a tap opens the achievements

/** The compact card's height for a given width (the add-card tile next to it uses the same). */
export const compactCardHeight = (cardWidth: number) => PAD * 2 + cardWidth * PHOTO_HEIGHT_SHARE + EXTRA + FOOTER;

/** The compact pet card: the photo on the left, the name and details on the right. The second page of the home pager. */
export function PetIdCardCompact({ width: cardWidth }: { width: number }) {
  const { t, lang } = useI18n();
  const router = useRouter();
  const { session, events } = useSession();
  const pet = session?.pet;
  if (!pet) return null;

  const cardHeight = compactCardHeight(cardWidth);
  const photoWidth = cardWidth * PHOTO_SHARE;
  const photoHeight = cardWidth * PHOTO_HEIGHT_SHARE + EXTRA;
  const look = breedLook(pet.type, pet.breed);
  const age = ageText(pet.birthDate, pet.approxAgeMonths, lang, true);
  const vaccine = lastVaccination(events);
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
            {/* Top: the name with the breed right under it. */}
            <View>
              <View style={styles.nameRow}>
                <ThemedText style={styles.name} numberOfLines={1}>
                  {pet.name}
                </ThemedText>
                {pet.verified ? <SymbolIcon ios="checkmark.seal.fill" material="verified" color="#111111" size={18} /> : null}
              </View>
              <View style={styles.breedRow}>
                <ThemedText style={styles.breedLine} numberOfLines={1}>
                  {breedName(pet.breed, lang)}
                </ThemedText>
                {/* There is no system symbol for sex, so the classic signs are used: male / female. */}
                <View style={styles.sexBadge} accessibilityLabel={t(pet.sex)}>
                  <ThemedText style={styles.sexGlyph}>{pet.sex === 'male' ? '\u2642' : '\u2640'}</ThemedText>
                </View>
              </View>
            </View>

            {/* Right under the breed: age (short, "3 р. 7 міс.") and country in one row. */}
            <View style={styles.pairRow}>
              <Fact label={t('petId.age')} value={age} flex={0} dark light compact />
              <Fact label={t('petId.country')} value={countryLabel(pet.country ?? 'UA', lang)} flex={0} dark compact />
            </View>

            {/* The last vaccination that has already happened: what it was (the event's note, else "Vaccination"), and when. */}
            <Fact
              label={t('petId.lastVaccine')}
              value={vaccine ? vaccine.description || t('kind.vaccine') : '-'}
              extra={vaccine ? isoToInput(vaccine.date) : undefined}
              flex={0}
              dark
              compact
            />
          </View>
        </View>

        {/* The menu (settings, co-owner, delete) is a small icon in the card's corner; there is no footer. */}
        <View style={styles.menu}>
          <PetMenuButton />
        </View>

        {/* Footer: tap to see the achievements. No fill, just a thin grey line above it. */}
        <Pressable
          accessibilityRole="button"
          accessibilityLabel={t('home.seeAchievements')}
          onPress={() => router.push('/achievements')}
          style={({ pressed }) => [styles.footer, pressed && { opacity: 0.7 }]}>
          <SymbolIcon ios="trophy.fill" material="emoji_events" color="#555555" size={15} />
          <ThemedText style={styles.footerText} numberOfLines={1}>
            {t('home.seeAchievements')}
          </ThemedText>
          <SymbolIcon ios="chevron.right" material="chevron_right" color="#8A8A8E" size={13} />
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  face: {
    borderRadius: 12,
    shadowColor: '#000',
    shadowOpacity: 0.14,
    shadowRadius: 20,
    shadowOffset: { width: 0, height: 10 },
  },
  inner: {
    flex: 1,
    borderRadius: 12,
    overflow: 'hidden',
    backgroundColor: '#FFFFFF',
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: '#DCDCDE',
  },
  watermark: { position: 'absolute', right: -34, bottom: -40, opacity: 0.028, transform: [{ rotate: '-18deg' }] },
  menu: { position: 'absolute', top: 14, right: 14 },
  footer: { position: 'absolute', left: PAD, right: PAD, bottom: 0, height: FOOTER, flexDirection: 'row', alignItems: 'center', gap: 8, borderTopWidth: StyleSheet.hairlineWidth, borderTopColor: '#C4C4C7' },
  footerText: { flex: 1, color: '#555555', fontSize: 13, lineHeight: 17, fontWeight: '500' },
  row: { flex: 1, flexDirection: 'row', paddingHorizontal: PAD, paddingTop: PAD, paddingBottom: PAD + FOOTER, gap: 16 },
  photo: { borderRadius: 7, overflow: 'hidden' },
  catBox: { backgroundColor: '#E4E4E6', alignItems: 'center', justifyContent: 'center' },
  // The name's top and the last field's bottom sit on the photo's top and bottom edges (the font adds a little air).
  // Everything sits at the top, right under the name; the card is only as tall as the photo.
  // The name's top sits on the photo's top edge and the last line's bottom on the photo's bottom edge (the font adds a little air).
  info: { flex: 1, justifyContent: 'space-between', marginTop: -6, marginBottom: -4 },
  nameRow: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  name: { color: '#111111', fontSize: 24, lineHeight: 28, fontWeight: '500', flexShrink: 1 },
  pairRow: { flexDirection: 'row', gap: 14 },
  breedRow: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  sexBadge: { width: 14, height: 14, borderRadius: 7, backgroundColor: 'rgba(0,0,0,0.07)', alignItems: 'center', justifyContent: 'center' },
  sexGlyph: { color: '#333333', fontSize: 9, lineHeight: 12, fontWeight: '600', textAlign: 'center' },
  breedLine: { color: '#6B6B6B', fontSize: 14, lineHeight: 18, fontWeight: '500', flexShrink: 1 },
});
