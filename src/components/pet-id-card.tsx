import Svg, { Path } from 'react-native-svg';
import type { ReactNode } from 'react';
import { StyleSheet, View, useWindowDimensions } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { PetPhoto } from '@/components/ui/pet-photo';
import { SymbolIcon } from '@/components/ui/symbol-icon';
import { PetArt } from '@/components/ui/pet-art';
import { breedLook, breedName } from '@/data/breeds';
import { Colors } from '@/constants/theme';
import { useI18n } from '@/i18n';
import { ageText, isoToInput } from '@/lib/dates';
import { useSession } from '@/providers/session';

// The demo pet's photo, until pets can upload their own.
export const PET_PHOTO = require('../../assets/images/pet-photo.jpg');

// Security-style guilloche: evenly spaced parallel waves, each shifted slightly from the one above, so
// together they flow like one smooth ribbon (neat, like the pattern on an ID card or banknote).
export function guilloche(width: number, height: number) {
  const paths: string[] = [];
  const lines = 24;
  const gap = height / (lines - 1);
  for (let i = 0; i < lines; i++) {
    const baseY = gap * i;
    let d = '';
    for (let x = 0; x <= width; x += 4) {
      const t = (x / width) * Math.PI * 2 * 1.5;
      const y = baseY + Math.sin(t + i * 0.22) * gap * 1.6;
      d += `${x === 0 ? 'M' : 'L'}${x.toFixed(1)} ${y.toFixed(1)} `;
    }
    paths.push(d);
  }
  return paths;
}

/** The pet's passport card: header, photo in a white frame, name and details. One page of the home pager. */
export function PetIdCard() {
  const { t, lang } = useI18n();
  const { width } = useWindowDimensions();
  const { session } = useSession();
  const pet = session?.pet;

  // A tall rectangular card: the photo fills it, a gradient at the top and bottom carries the text.
  const cardWidth = Math.min(width - 32, 420);
  // The photo sits on top at a 4:5 frame, shown whole (never cropped); the info block sits right under it.
  const FRAME = 16; // the white frame around the photo, equal to the side padding of the text
  const photoWidth = cardWidth - FRAME * 2;
  const photoHeight = photoWidth * 0.95;
  const HEADER = 44; // the header row above the photo
  const cardHeight = HEADER + photoHeight + 168;

  if (!pet) return null;
  const look = breedLook(pet.type, pet.breed);

  const dob = pet.birthDate ? isoToInput(pet.birthDate) : ageText(pet.birthDate, pet.approxAgeMonths, lang);
  const lines = guilloche(cardWidth, cardHeight);

  return (
    <View
      accessibilityLabel={t('petId.cardLabel')}
      style={[styles.face, { width: cardWidth, height: cardHeight }]}>
      <View style={styles.inner}>
                  <View style={StyleSheet.absoluteFill}>
                  {/* The whole photo, uncropped, at the top of the card. */}
                  <View style={styles.whiteBase} />
                  {/* The pattern sits on the white frame and the white info area (the photo covers it). */}
                  <View pointerEvents="none" style={StyleSheet.absoluteFill}>
                    <Svg width={cardWidth} height={cardHeight}>
                      {lines.map((d, index) => (
                        <Path key={index} d={d} stroke="#000000" strokeOpacity={0.07} strokeWidth={0.6} fill="none" />
                      ))}
                    </Svg>
                  </View>
                  <View pointerEvents="none" style={styles.watermark}>
                    <SymbolIcon ios="pawprint.fill" material="pets" color="#000000" size={210} />
                  </View>

                  <View style={[styles.photoFrame, { top: HEADER, left: FRAME, width: photoWidth, height: photoHeight }]}>
                    {pet.photo || pet.type === 'dog' ? (
                      <PetPhoto source={pet.photo ? { uri: pet.photo } : PET_PHOTO} width={photoWidth} height={photoHeight} sharpShare={1} fit="cover" />
                    ) : (
                      <View style={[styles.catBox, { width: photoWidth, height: photoHeight }]}>
                        <PetArt type={pet.type} size={150} color="#111" accent="#111" strokeWidth={4} fill={look.coat} ears={look.ears} />
                      </View>
                    )}
                  </View>

                  <View style={styles.pad}>
                    <View style={styles.headerRow}>
                      <SymbolIcon ios="pawprint.fill" material="pets" color="#111111" size={18} />
                      <ThemedText style={styles.kind}>{t('petId.cardTitle')}</ThemedText>
                    </View>

                    <View style={styles.bottomInfo}>
                      <View style={styles.nameRow}>
                        <ThemedText style={styles.nameBig} numberOfLines={1}>
                          {pet.name}
                        </ThemedText>
                        {pet.verified ? <SymbolIcon ios="checkmark.seal.fill" material="verified" color="#111111" size={22} /> : null}
                        {pet.chipped ? (
                          <View style={styles.badge}>
                            <SymbolIcon ios="memorychip.fill" material="memory" color="#6B6B6B" size={11} />
                          </View>
                        ) : null}
                      </View>

                      <View style={styles.factsRow}>
                        <View style={styles.colLeft}>
                          <Fact label={t('petId.breed')} value={breedName(pet.breed, lang)} flex={0} dark />
                        </View>
                        <View style={styles.colRight}>
                          <Fact label={t('petId.sex')} value={t(pet.sex)} flex={0} dark />
                        </View>
                      </View>
                      <View style={styles.factsRow}>
                        <View style={styles.colLeft}>
                          <Fact label={t('petId.country')} value={countryLabel(pet.country ?? 'UA', lang)} flex={0} dark />
                        </View>
                        <View style={styles.colRight}>
                          <Fact label={t('petId.dob')} value={dob} flex={0} dark light />
                        </View>
                      </View>
                    </View>
                  </View>
                </View>
      </View>
    </View>
  );
}

// Country names for the card. Hermes (the JS engine in React Native) has no Intl.DisplayNames, so they live here.
const COUNTRY_NAMES: Record<string, { uk: string; en: string }> = {
  UA: { uk: 'Україна', en: 'Ukraine' },
  PL: { uk: 'Польща', en: 'Poland' },
  DE: { uk: 'Німеччина', en: 'Germany' },
  GB: { uk: 'Велика Британія', en: 'United Kingdom' },
  US: { uk: 'США', en: 'United States' },
  CZ: { uk: 'Чехія', en: 'Czechia' },
  SK: { uk: 'Словаччина', en: 'Slovakia' },
  RO: { uk: 'Румунія', en: 'Romania' },
  MD: { uk: 'Молдова', en: 'Moldova' },
  FR: { uk: 'Франція', en: 'France' },
  IT: { uk: 'Італія', en: 'Italy' },
  ES: { uk: 'Іспанія', en: 'Spain' },
  CA: { uk: 'Канада', en: 'Canada' },
};

/** "UA" -> "🇺🇦 Україна": a flag emoji built from the two-letter code, then the name in the app language. */
export function countryName(code: string, lang: 'uk' | 'en') {
  const upper = code.toUpperCase();
  return COUNTRY_NAMES[upper]?.[lang] ?? upper;
}

export function countryLabel(code: string, lang: 'uk' | 'en') {
  const upper = code.toUpperCase();
  const flag = upper.replace(/./g, (c) => String.fromCodePoint(127397 + c.charCodeAt(0)));
  return `${flag} ${COUNTRY_NAMES[upper]?.[lang] ?? upper}`;
}

/** One labelled value in the card's bottom row: a quiet grey label over a bold value. */
export function Fact({ label, value, extra, icon, flex, dark, light, compact, inline }: { label: string; value: string; extra?: string; icon?: ReactNode; flex: number; dark?: boolean; light?: boolean; compact?: boolean; inline?: boolean }) {
  return (
    <View style={flex ? { flex } : { flexShrink: 1 }}>
      <ThemedText style={[styles.factLabel, dark && styles.onDarkLabel, compact && styles.compactLabel]}>{label}</ThemedText>
      <View style={[styles.factLine, inline && styles.factLineInline]}>
        <View style={styles.factValueRow}>
          {icon}
          <ThemedText style={[styles.factValue, dark && styles.onDarkValue, light && styles.lightValue, compact && styles.compactValue]} numberOfLines={1}>
            {value}
          </ThemedText>
        </View>
        {extra ? (
          <ThemedText style={[styles.factExtra, dark && styles.onDarkExtra, inline && styles.factExtraInline]} numberOfLines={1}>
            {extra}
          </ThemedText>
        ) : null}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  pad: { ...(StyleSheet.absoluteFill as object), paddingHorizontal: 16, paddingTop: 14, paddingBottom: 16, justifyContent: 'space-between' },
  photoFrame: { position: 'absolute', borderRadius: 14, overflow: 'hidden' },
  whiteBase: { ...(StyleSheet.absoluteFill as object), backgroundColor: '#FFFFFF' },
  gradTop: { position: 'absolute', top: 0, left: 0, right: 0 },
  gradBottom: { position: 'absolute', bottom: 0, left: 0, right: 0 },
  bottomInfo: { gap: 2 },
  colLeft: { width: '56%' },
  colRight: { flex: 1 },
  factsRow: { flexDirection: 'row', columnGap: 12, marginTop: 12 },
  onDarkLabel: { color: Colors.light.textSecondary },
  onDarkValue: { color: Colors.light.text },
  onDarkExtra: { color: Colors.light.textSecondary },
  headerRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  watermark: { position: 'absolute', right: -46, bottom: -52, opacity: 0.035, transform: [{ rotate: '-18deg' }] },
  headerPill: { alignSelf: 'flex-start', marginTop: 6, marginLeft: 6, flexDirection: 'row', alignItems: 'center', gap: 8, paddingHorizontal: 10, paddingVertical: 6, borderRadius: 14, backgroundColor: 'rgba(255,255,255,0.82)' },
  kind: { color: 'rgba(0,0,0,0.65)', fontSize: 9, lineHeight: 12, fontWeight: '500', letterSpacing: 1.2 },
  countryLine: { color: '#6B6B6B', fontSize: 15, lineHeight: 20, fontWeight: '500' },
  mainRow: { flexDirection: 'row', alignItems: 'stretch', gap: 14, marginTop: 14 },
  photo: { borderRadius: 6, overflow: 'hidden' },
  identity: { flex: 1, justifyContent: 'space-between', marginBottom: -4 },
  identityTop: { gap: 0, marginTop: -7 },
  identityBottom: { gap: 8, marginBottom: -2 },
  badge: { width: 20, height: 20, borderRadius: 10, backgroundColor: 'rgba(0,0,0,0.06)', alignItems: 'center', justifyContent: 'center' },
  breedRow: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  nameRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  nameBig: { color: '#111111', fontSize: 30, lineHeight: 35, fontWeight: '500', flexShrink: 1 },
  breed: { color: '#6B6B6B', fontSize: 13, lineHeight: 17, fontWeight: '500', flexShrink: 1 },
  // Pushed to the bottom of the column, so it lines up with the bottom edge of the photo.
  factLabel: { color: Colors.light.textSecondary, fontSize: 12, lineHeight: 15, fontWeight: '500' },
  // The custom font has no italic face, so the slant is drawn by skewing the text.
  factExtra: { color: Colors.light.textSecondary, fontSize: 13, lineHeight: 16, fontWeight: '400', marginTop: -2, alignSelf: 'flex-start', transform: [{ skewX: '-10deg' }] },
  factValueRow: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  // Age beside the date: one line, in the same light grey as the labels.
  factLineInline: { flexDirection: 'row', alignItems: 'baseline', gap: 8 },
  factExtraInline: { marginTop: 0, flexShrink: 1, color: '#8A8A8A', fontSize: 12, lineHeight: 18 },
  factLine: { flexDirection: 'column', alignItems: 'flex-start' },
  // Digits are heavier than letters in this font, so a date is set a step lighter to look as strong as the words.
  lightValue: { fontWeight: '400' },
  compactLabel: { fontSize: 11, lineHeight: 14 },
  compactValue: { fontSize: 14, lineHeight: 18 },
  factValue: { color: Colors.light.text, fontSize: 16, lineHeight: 21, fontWeight: '500' },
  face: {
    borderRadius: 18,
    // A deep, soft shadow lifts the card off the page.
    shadowColor: '#000',
    shadowOpacity: 0.14,
    shadowRadius: 20,
    shadowOffset: { width: 0, height: 10 },
  },
  // Clipping to the rounded corners happens here, inside the shadow-casting face.
  inner: { flex: 1, borderRadius: 18, overflow: 'hidden', borderWidth: StyleSheet.hairlineWidth, borderColor: '#DCDCDE' },
  catBox: { backgroundColor: '#E4E4E6', alignItems: 'center', justifyContent: 'center' },
});
