import { LinearGradient } from 'expo-linear-gradient';
import Svg, { Path } from 'react-native-svg';
import { useEffect, useMemo, useRef, type ComponentRef } from 'react';
import * as Sharing from 'expo-sharing';
import { captureRef } from 'react-native-view-shot';
import { PanResponder, Pressable, StyleSheet, View, useWindowDimensions } from 'react-native';
import Animated, {
  Easing,
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withSpring,
  withTiming,
} from 'react-native-reanimated';

import { ThemedText } from '@/components/themed-text';
import { cardNumber } from '@/lib/pet-card';
import { PetPhoto } from '@/components/ui/pet-photo';
import { SymbolIcon } from '@/components/ui/symbol-icon';
import { PetArt } from '@/components/ui/pet-art';
import { Spacing } from '@/constants/theme';
import { breedLook, breedName } from '@/data/breeds';
import { useI18n } from '@/i18n';
import { ageText, isoToInput } from '@/lib/dates';
import { useSession } from '@/providers/session';

// Placeholder until pets can upload their own photo.
const PET_PHOTO = require('../../assets/images/welcome-dog-card.jpg');

// Security-style guilloche: evenly spaced parallel waves, each shifted slightly from the one above, so
// together they flow like one smooth ribbon (neat, like the pattern on an ID card or banknote).
function guilloche(width: number, height: number) {
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

const MAX_TILT = 22; // degrees
const REST_X = 6; // degrees the card is tipped back when nobody touches it
const REST_Y = -7;


/** The pet's ID badge (drag to tilt in 3D), with sharing, status and achievements under it. */
export function PetIdCard() {
  const { t, lang } = useI18n();
  const { width } = useWindowDimensions();
  const { session } = useSession();
  const pet = session?.pet;

  // A compact landscape ID card: photo on the left, the details on the right.
  const cardWidth = Math.min(width - Spacing.four * 2, 360);
  const cardHeight = cardWidth * 0.78;
  const photoWidth = cardWidth * 0.3;
  const photoHeight = photoWidth * 1.3;

  // The front of the badge, captured as a picture for sharing.
  const shotRef = useRef<ComponentRef<typeof View>>(null);

  async function shareCard() {
    if (!shotRef.current) return;
    const uri = await captureRef(shotRef, { format: 'png', quality: 1 });
    if (await Sharing.isAvailableAsync()) await Sharing.shareAsync(uri, { mimeType: 'image/png', dialogTitle: t('petId.share') });
  }

  const tiltX = useSharedValue(0);
  const tiltY = useSharedValue(0);
  // Idle motion: the card never sits perfectly flat, it drifts a few degrees back and forth (0..1).
  const sway = useSharedValue(0);

  useEffect(() => {
    sway.set(withRepeat(withTiming(1, { duration: 2800, easing: Easing.inOut(Easing.sin) }), -1, true));
  }, [sway]);

  const responder = useMemo(
    () =>
      PanResponder.create({
        onStartShouldSetPanResponder: () => true,
        onMoveShouldSetPanResponder: () => true,
        onPanResponderTerminationRequest: () => false,
        onPanResponderMove: (_, { dx, dy }) => {
          const clamp = (v: number) => Math.max(-MAX_TILT, Math.min(MAX_TILT, v));
          tiltY.set(clamp((dx / (cardWidth / 2)) * MAX_TILT));
          tiltX.set(clamp((-dy / (cardHeight / 2)) * MAX_TILT));
        },
        onPanResponderRelease: () => {
          tiltX.set(withSpring(0, { damping: 9, stiffness: 120 }));
          tiltY.set(withSpring(0, { damping: 9, stiffness: 120 }));
        },
        onPanResponderTerminate: () => {
          tiltX.set(withSpring(0));
          tiltY.set(withSpring(0));
        },
      }),
    [cardWidth, cardHeight, tiltX, tiltY]
  );

  const frontStyle = useAnimatedStyle(() => ({
    transform: [
      { perspective: 800 },
      { rotateX: `${tiltX.get() + REST_X - sway.get() * 4}deg` },
      { rotateY: `${tiltY.get() + REST_Y + sway.get() * 8}deg` },
    ],
  }));

  // Light catches the card as it tilts: a soft white sheen that follows the angle.
  const sheenStyle = useAnimatedStyle(() => ({
    opacity: Math.min(0.9, 0.35 + (Math.abs(tiltX.get()) + Math.abs(tiltY.get())) / 40),
    transform: [{ translateX: (tiltY.get() + sway.get() * 8 - 4) * 7 }],
  }));

  if (!pet) return null;
  const look = breedLook(pet.type, pet.breed);

  const dob = pet.birthDate ? isoToInput(pet.birthDate) : ageText(pet.birthDate, pet.approxAgeMonths, lang);
  const lines = guilloche(cardWidth, cardHeight);
  const face = [styles.face, { width: cardWidth, height: cardHeight }];

  return (
    <View style={styles.content}>
          <View style={[styles.stage, { height: cardHeight + 28 }]}>
            <View
              {...responder.panHandlers}
              accessibilityLabel={t('petId.cardLabel')}
              style={{ width: cardWidth, height: cardHeight }}>
              {/* One side only: photo, name, details and number, top to bottom. */}
              <Animated.View style={[face, frontStyle]}>
                <View style={styles.inner}>
                  <View ref={shotRef} collapsable={false} style={StyleSheet.absoluteFill}>
                  {/* A light card: white fading to a very soft grey. */}
                  <LinearGradient colors={['#FFFFFF', '#EEEEEF']} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={StyleSheet.absoluteFill} />
                  {/* The photo is a clean rounded picture inset on the left: no fade, no gradient over it. */}
                  {/* Fine wavy lines across the whole card (security pattern). */}
                  <View pointerEvents="none" style={StyleSheet.absoluteFill}>
                    <Svg width={cardWidth} height={cardHeight}>
                      {lines.map((d, index) => (
                        <Path key={index} d={d} stroke="#000000" strokeOpacity={0.035} strokeWidth={0.6} fill="none" />
                      ))}
                    </Svg>
                  </View>
                  {/* Watermark: a large, very faint paw print cropped by the corner of the card. */}
                  <View pointerEvents="none" style={styles.watermark}>
                    <SymbolIcon ios="pawprint.fill" material="pets" color="#000000" size={210} />
                  </View>
                  <View style={styles.pad}>
                    <View style={styles.headerRow}>
                      <View style={styles.brand}>
                        <SymbolIcon ios="pawprint.fill" material="pets" color="#111111" size={14} />
                        <ThemedText style={styles.cardNo}>{cardNumber(pet)}</ThemedText>
                      </View>
                      <ThemedText style={styles.kind}>{t('petId.cardTitle')}</ThemedText>
                    </View>

                    <View style={styles.mainRow}>
                      <View style={[styles.photo, { width: photoWidth, height: photoHeight }]}>
                        {pet.photo || pet.type === 'dog' ? (
                          <PetPhoto source={pet.photo ? { uri: pet.photo } : PET_PHOTO} width={photoWidth} height={photoHeight} sharpShare={1} fit="cover" />
                        ) : (
                          <View style={[styles.catBox, { width: photoWidth, height: photoHeight }]}>
                            <PetArt type={pet.type} size={72} color="#111" accent="#111" strokeWidth={4} fill={look.coat} ears={look.ears} />
                          </View>
                        )}
                      </View>

                      <View style={styles.identity}>
                        <View style={styles.nameRow}>
                          <ThemedText style={styles.nameBig} numberOfLines={1}>
                            {pet.name}
                          </ThemedText>
                          {pet.verified ? <SymbolIcon ios="checkmark.seal.fill" material="verified" color="#111111" size={22} /> : null}
                          {pet.chipped ? <SymbolIcon ios="memorychip.fill" material="memory" color="#111111" size={22} /> : null}
                        </View>
                        <ThemedText style={styles.breed} numberOfLines={1}>
                          {breedName(pet.breed, lang)}
                        </ThemedText>
                        <View style={styles.sexBlock}>
                          <Fact label={t('petId.sex')} value={t(pet.sex)} flex={0} />
                        </View>
                        <View style={styles.dobBlock}>
                          <Fact
                            label={t('petId.dob')}
                            value={dob}
                            extra={pet.birthDate ? ageText(pet.birthDate, pet.approxAgeMonths, lang) : undefined}
                            flex={0}
                          />
                        </View>
                      </View>
                    </View>

                    <View style={styles.facts}>
                      
                      <Fact label={t('petId.owner')} value={session?.ownerName ?? ''} flex={1} />
                    </View>
                  </View>
                </View>
                  <Animated.View pointerEvents="none" style={[styles.sheen, sheenStyle]}>
                    <LinearGradient
                      colors={['rgba(255,255,255,0)', 'rgba(255,255,255,0.9)', 'rgba(255,255,255,0)']}
                      locations={[0.3, 0.5, 0.7]}
                      start={{ x: 0, y: 0 }}
                      end={{ x: 1, y: 1 }}
                      style={StyleSheet.absoluteFill}
                    />
                  </Animated.View>
                  <Pressable
                    accessibilityRole="button"
                    accessibilityLabel={t('petId.share')}
                    onPress={shareCard}
                    hitSlop={8}
                    style={({ pressed }) => [styles.shareBtn, pressed && { opacity: 0.8 }]}>
                    <SymbolIcon ios="square.and.arrow.up" material="ios_share" color="#6B6B6B" size={20} />
                  </Pressable>
                </View>
              </Animated.View>
            </View>
          </View>
    </View>
  );
}

/** One labelled value in the card's bottom row: a quiet grey label over a bold value. */
function Fact({ label, value, extra, flex }: { label: string; value: string; extra?: string; flex: number }) {
  return (
    <View style={flex ? { flex } : undefined}>
      <ThemedText style={styles.factLabel}>{label}</ThemedText>
      <ThemedText style={styles.factValue} numberOfLines={1}>
        {value}
        {extra ? <ThemedText style={styles.factExtra}>{`  \u00b7  ${extra}`}</ThemedText> : null}
      </ThemedText>
    </View>
  );
}

const styles = StyleSheet.create({
  pad: { flex: 1, padding: 16, justifyContent: 'space-between' },
  headerRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  shareBtn: { position: 'absolute', right: 10, bottom: 10, width: 44, height: 44, alignItems: 'center', justifyContent: 'center' },
  watermark: { position: 'absolute', right: -46, bottom: -52, opacity: 0.025, transform: [{ rotate: '-18deg' }] },
  brand: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  cardNo: { color: '#333333', fontSize: 11, lineHeight: 14, fontWeight: '600', letterSpacing: 1.2 },
  kind: { color: 'rgba(0,0,0,0.4)', fontSize: 9, lineHeight: 12, fontWeight: '600', letterSpacing: 1.2 },
  mainRow: { flexDirection: 'row', alignItems: 'stretch', gap: 14 },
  photo: { borderRadius: 6, overflow: 'hidden' },
  identity: { flex: 1, gap: 3, marginTop: -4 },
  nameRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  nameBig: { color: '#111111', fontSize: 28, lineHeight: 34, fontWeight: '700', flexShrink: 1 },
  breed: { color: '#6B6B6B', fontSize: 14, lineHeight: 19, fontWeight: '500' },
  // Pushed to the bottom of the column, so it lines up with the bottom edge of the photo.
  sexBlock: { marginTop: 8 },
  dobBlock: { marginTop: 'auto' },
  facts: { flexDirection: 'row', gap: 12, paddingTop: 12, borderTopWidth: StyleSheet.hairlineWidth, borderTopColor: 'rgba(0,0,0,0.12)' },
  factLabel: { color: '#8A8A8A', fontSize: 11, lineHeight: 14, fontWeight: '500' },
  factExtra: { color: '#6B6B6B', fontSize: 13, fontWeight: '400' },
  factValue: { color: '#111111', fontSize: 14, lineHeight: 19, fontWeight: '600' },
  content: { gap: Spacing.three },
  stage: { alignItems: 'center', justifyContent: 'center' },
  face: {
    position: 'absolute',
    borderRadius: 18,
    // A deep, soft shadow lifts the card off the page.
    shadowColor: '#000',
    shadowOpacity: 0.14,
    shadowRadius: 20,
    shadowOffset: { width: 0, height: 10 },
  },
  // Clipping to the rounded corners happens here, inside the shadow-casting face.
  inner: { flex: 1, borderRadius: 18, overflow: 'hidden', borderWidth: StyleSheet.hairlineWidth, borderColor: '#DCDCDE' },
  photoFade: { position: 'absolute', top: 0, left: 0, right: 0 },
  divider: { height: StyleSheet.hairlineWidth, backgroundColor: 'rgba(255,255,255,0.3)', marginVertical: 4 },
  cardPad: { flex: 1, paddingVertical: 12, paddingRight: 14, paddingLeft: 8, justifyContent: 'space-between' },
  // The punched slot a lanyard clips through.
  slot: { alignSelf: 'center', width: 54, height: 9, borderRadius: 5, backgroundColor: 'rgba(0,0,0,0.55)', borderWidth: 1, borderColor: 'rgba(255,255,255,0.25)' },
  photoFrame: {
    alignSelf: 'flex-start',
    borderRadius: 10,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.35)',
  },
  catBox: { backgroundColor: '#E4E4E6', alignItems: 'center', justifyContent: 'center' },
  // Wider than the card so the highlight can slide across without showing an edge.
  sheen: { position: 'absolute', top: 0, bottom: 0, left: '-25%', width: '150%' },
});
