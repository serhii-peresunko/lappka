import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import { useEffect, useMemo } from 'react';
import { Linking, PanResponder, Pressable, StyleSheet, View, useWindowDimensions } from 'react-native';
import Animated, {
  Easing,
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withSpring,
  withTiming,
} from 'react-native-reanimated';
import { SafeAreaView } from 'react-native-safe-area-context';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { AchievementBadge } from '@/components/ui/achievement-badge';
import { PetArt } from '@/components/ui/pet-art';
import { Spacing, TAB_BAR_SPACE } from '@/constants/theme';
import { breedLook, breedName } from '@/data/breeds';
import { useAchievements } from '@/hooks/use-achievements';
import { useTheme } from '@/hooks/use-theme';
import { useI18n } from '@/i18n';
import { ageText, isoToInput } from '@/lib/dates';
import { instagramUrl } from '@/lib/instagram';
import { useSession } from '@/providers/session';

const MAX_TILT = 22; // degrees
const TAP_SLOP = 6; // px a finger may move and still count as a tap
const REST_X = 6; // degrees the card is tipped back when nobody touches it
const REST_Y = -7;

type Row = [label: string, value: string];

/** Pet ID tab: a card you can drag to tilt in 3D and tap to flip over. */
export default function PetIdScreen() {
  const theme = useTheme();
  const router = useRouter();
  const { t, lang } = useI18n();
  const { list, unlockedCount } = useAchievements();
  const { width } = useWindowDimensions();
  const { session } = useSession();
  const pet = session?.pet;

  const cardWidth = Math.min(width - Spacing.four * 2, 340);
  const cardHeight = cardWidth * 1.38;

  const tiltX = useSharedValue(0);
  const tiltY = useSharedValue(0);
  const flip = useSharedValue(0); // 0 = front, 180 = back
  // Idle motion: the card never sits perfectly flat, it drifts a few degrees back and forth (0..1).
  const sway = useSharedValue(0);

  useEffect(() => {
    sway.set(withRepeat(withTiming(1, { duration: 2800, easing: Easing.inOut(Easing.sin) }), -1, true));
  }, [sway]);

  // True once the finger has travelled further than a tap allows during the current touch.
  const dragged = useSharedValue(false);

  const responder = useMemo(
    () =>
      PanResponder.create({
        onPanResponderGrant: () => {
          dragged.set(false);
        },
        onStartShouldSetPanResponder: () => true,
        onMoveShouldSetPanResponder: () => true,
        onPanResponderTerminationRequest: () => false,
        onPanResponderMove: (_, { dx, dy }) => {
          if (Math.abs(dx) > TAP_SLOP || Math.abs(dy) > TAP_SLOP) dragged.set(true);
          const clamp = (v: number) => Math.max(-MAX_TILT, Math.min(MAX_TILT, v));
          tiltY.set(clamp((dx / (cardWidth / 2)) * MAX_TILT));
          tiltX.set(clamp((-dy / (cardHeight / 2)) * MAX_TILT));
        },
        onPanResponderRelease: () => {
          if (!dragged.get()) {
            flip.set(withTiming(flip.get() === 0 ? 180 : 0, { duration: 450 }));
          }
          tiltX.set(withSpring(0, { damping: 9, stiffness: 120 }));
          tiltY.set(withSpring(0, { damping: 9, stiffness: 120 }));
        },
        onPanResponderTerminate: () => {
          tiltX.set(withSpring(0));
          tiltY.set(withSpring(0));
        },
      }),
    [cardWidth, cardHeight, tiltX, tiltY, flip, dragged]
  );

  // Each face carries its own rotation (the back sits 180 degrees further round), because
  // backfaceVisibility is judged per layer and does not see a rotated parent.
  const frontStyle = useAnimatedStyle(() => ({
    transform: [
      { perspective: 800 },
      { rotateX: `${tiltX.get() + REST_X - sway.get() * 4}deg` },
      { rotateY: `${flip.get() + tiltY.get() + REST_Y + sway.get() * 8}deg` },
    ],
  }));
  const backStyle = useAnimatedStyle(() => ({
    transform: [
      { perspective: 800 },
      { rotateX: `${tiltX.get() + REST_X - sway.get() * 4}deg` },
      { rotateY: `${flip.get() + tiltY.get() + REST_Y + sway.get() * 8 + 180}deg` },
    ],
  }));

  // The avatar floats above the card: it slides against the tilt, which reads as depth (parallax).
  const avatarStyle = useAnimatedStyle(() => ({
    transform: [
      { translateX: (tiltY.get() + sway.get() * 8 - 4) * 0.9 },
      { translateY: (-tiltX.get() + sway.get() * 4) * 0.9 },
      { scale: 1.04 },
    ],
  }));

  // Light catches the card as it tilts: a soft white sheen that follows the angle.
  const sheenStyle = useAnimatedStyle(() => ({
    opacity: Math.min(0.9, 0.35 + (Math.abs(tiltX.get()) + Math.abs(tiltY.get())) / 40),
    transform: [{ translateX: (tiltY.get() + sway.get() * 8 - 4) * 7 }],
  }));

  if (!pet) return null;
  const look = breedLook(pet.type, pet.breed);

  const frontRows: Row[] = [
    [t('petId.type'), t(pet.type)],
    [t('petId.breed'), breedName(pet.breed, lang)],
    [t('petId.sex'), t(pet.sex)],
    [t('petId.age'), ageText(pet.birthDate, pet.approxAgeMonths, lang)],
  ];
  const backRows: Row[] = [
    [t('petId.dob'), pet.birthDate ? isoToInput(pet.birthDate) : t('unknown')],
    [t('petId.owner'), session?.ownerName ?? ''],
  ];
  const shownBadges = [...list].sort((a, b) => Number(b.unlocked) - Number(a.unlocked)).slice(0, 6);

  const face = [styles.face, { width: cardWidth, height: cardHeight }];

  return (
    <ThemedView style={styles.root}>
      <SafeAreaView style={styles.root} edges={['top']}>
        <View style={styles.content}>
          <ThemedText type="subtitle">{t('petId.title')}</ThemedText>

          <View style={styles.stage}>
            <View
              {...responder.panHandlers}
              accessibilityRole="button"
              accessibilityLabel={t('petId.cardLabel')}
              style={{ width: cardWidth, height: cardHeight }}>
              {/* Front */}
              <Animated.View style={[face, frontStyle]}>
                <View style={styles.inner}>
                <View style={[styles.hero, { backgroundColor: theme.primarySoft }]}>
                  <Animated.View style={[styles.avatar, { backgroundColor: theme.background }, avatarStyle]}>
                    <PetArt
                      type={pet.type}
                      size={68}
                      color={theme.text}
                      accent={theme.primary}
                      bandana
                      strokeWidth={4.6}
                      fill={look.coat}
                      ears={look.ears}
                    />
                  </Animated.View>
                  <ThemedText type="subtitle" style={styles.name}>
                    {pet.name}
                  </ThemedText>
                </View>
                <Rows rows={frontRows} />
                <Pressable
                  accessibilityRole="button"
                  onPress={() => router.push('/achievements')}
                  style={[styles.ach, { borderTopColor: theme.border }]}>
                  <View style={styles.achHeader}>
                    <ThemedText type="small" themeColor="textSecondary">
                      {t('petId.achievements')}
                    </ThemedText>
                    <ThemedText type="smallBold">{t('achievements.count', { n: unlockedCount, total: list.length })}</ThemedText>
                  </View>
                  <View style={styles.achRow}>
                    {shownBadges.map((item) => (
                      <AchievementBadge key={item.id} achievement={item} unlocked={item.unlocked} size={34} />
                    ))}
                  </View>
                </Pressable>
                <Animated.View pointerEvents="none" style={[styles.sheen, sheenStyle]}>
                  <LinearGradient
                    colors={['rgba(255,255,255,0)', 'rgba(255,255,255,0.5)', 'rgba(255,255,255,0)']}
                    locations={[0.3, 0.5, 0.7]}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 1 }}
                    style={StyleSheet.absoluteFill}
                  />
                </Animated.View>
                </View>
              </Animated.View>

              {/* Back */}
              <Animated.View style={[face, backStyle]}>
                <View style={styles.inner}>
                <View style={[styles.backHeader, { backgroundColor: theme.primarySoft }]}>
                  <ThemedText type="smallBold" style={{ color: theme.primaryText, fontSize: 16 }}>
                    {pet.name}
                  </ThemedText>
                </View>
                <Rows rows={backRows} />
                {pet.instagram ? (
                  <Pressable
                    accessibilityRole="link"
                    onPress={() => Linking.openURL(instagramUrl(pet.instagram!))}
                    style={[styles.link, { borderTopColor: theme.border }]}>
                    <ThemedText themeColor="textSecondary">{t('petId.instagram')}</ThemedText>
                    <ThemedText type="smallBold" style={{ color: theme.primaryText, fontSize: 16 }}>
                      @{pet.instagram}
                    </ThemedText>
                  </Pressable>
                ) : null}
                <View style={[styles.bio, { borderTopColor: theme.border }]}>
                  <ThemedText themeColor="textSecondary">{t('petId.about')}</ThemedText>
                  <ThemedText>{pet.bio || t('petId.noNotes')}</ThemedText>
                </View>
                <Animated.View pointerEvents="none" style={[styles.sheen, sheenStyle]}>
                  <LinearGradient
                    colors={['rgba(255,255,255,0)', 'rgba(255,255,255,0.5)', 'rgba(255,255,255,0)']}
                    locations={[0.3, 0.5, 0.7]}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 1 }}
                    style={StyleSheet.absoluteFill}
                  />
                </Animated.View>
                </View>
              </Animated.View>
            </View>
          </View>

          <ThemedText type="small" themeColor="textSecondary" style={styles.hint}>
            {t('petId.hint')}
          </ThemedText>
        </View>
      </SafeAreaView>
    </ThemedView>
  );
}

function Rows({ rows }: { rows: Row[] }) {
  return (
    <View style={styles.rows}>
      {rows.map(([label, value]) => (
        <View key={label} style={styles.row}>
          <ThemedText themeColor="textSecondary">{label}</ThemedText>
          <ThemedText type="smallBold" style={styles.value}>
            {value}
          </ThemedText>
        </View>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  content: { flex: 1, paddingHorizontal: Spacing.four, paddingTop: Spacing.four, paddingBottom: TAB_BAR_SPACE, gap: Spacing.three },
  stage: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  face: {
    position: 'absolute',
    borderRadius: 28,
    backfaceVisibility: 'hidden',
    // A deep, soft shadow lifts the card off the page.
    shadowColor: '#000',
    shadowOpacity: 0.22,
    shadowRadius: 26,
    shadowOffset: { width: 0, height: 18 },
  },
  // The shadow lives on the outer face; clipping to the rounded corners happens here, inside it.
  inner: { flex: 1, borderRadius: 28, overflow: 'hidden', backgroundColor: '#F5F5F7' },
  hero: { alignItems: 'center', gap: Spacing.one, paddingVertical: Spacing.three },
  backHeader: { alignItems: 'center', paddingVertical: Spacing.three },
  avatar: {
    width: 96,
    height: 96,
    borderRadius: 48,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOpacity: 0.2,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 8 },
  },
  name: { fontSize: 26, lineHeight: 32 },
  rows: { padding: Spacing.three, gap: Spacing.two + Spacing.one },
  row: { flexDirection: 'row', justifyContent: 'space-between', gap: Spacing.three },
  value: { fontSize: 16, flexShrink: 1, textAlign: 'right' },
  link: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    minHeight: 48,
    paddingHorizontal: Spacing.three,
    borderTopWidth: 1,
  },
  ach: { paddingHorizontal: Spacing.three, paddingVertical: Spacing.three, gap: Spacing.two, borderTopWidth: StyleSheet.hairlineWidth },
  achHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  achRow: { flexDirection: 'row', gap: 6 },
  bio: { padding: Spacing.three, gap: Spacing.one, borderTopWidth: 1 },
  // Wider than the card so the highlight can slide across without showing an edge.
  sheen: { position: 'absolute', top: 0, bottom: 0, left: '-25%', width: '150%' },
  hint: { textAlign: 'center' },
});
