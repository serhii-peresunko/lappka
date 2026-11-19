import { useMemo } from 'react';
import { Linking, PanResponder, Pressable, StyleSheet, View, useWindowDimensions } from 'react-native';
import Animated, { useAnimatedStyle, useSharedValue, withSpring, withTiming } from 'react-native-reanimated';
import { SafeAreaView } from 'react-native-safe-area-context';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { PetArt } from '@/components/ui/pet-art';
import { Spacing } from '@/constants/theme';
import { breedLook } from '@/data/breeds';
import { useTheme } from '@/hooks/use-theme';
import { ageText, isoToInput } from '@/lib/dates';
import { instagramUrl } from '@/lib/instagram';
import { useSession } from '@/providers/session';

const MAX_TILT = 22; // degrees
const TAP_SLOP = 6; // px a finger may move and still count as a tap

type Row = [label: string, value: string];

/** Pet ID tab: a card you can drag to tilt in 3D and tap to flip over. */
export default function PetIdScreen() {
  const theme = useTheme();
  const { width } = useWindowDimensions();
  const { session } = useSession();
  const pet = session?.pet;

  const cardWidth = Math.min(width - Spacing.four * 2, 340);
  const cardHeight = cardWidth * 1.38;

  const tiltX = useSharedValue(0);
  const tiltY = useSharedValue(0);
  const flip = useSharedValue(0); // 0 = front, 180 = back

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
      { perspective: 900 },
      { rotateX: `${tiltX.get()}deg` },
      { rotateY: `${flip.get() + tiltY.get()}deg` },
    ],
  }));
  const backStyle = useAnimatedStyle(() => ({
    transform: [
      { perspective: 900 },
      { rotateX: `${tiltX.get()}deg` },
      { rotateY: `${flip.get() + tiltY.get() + 180}deg` },
    ],
  }));

  // Light catches the card as it tilts: a soft white sheen that follows the angle.
  const sheenStyle = useAnimatedStyle(() => ({
    opacity: Math.min(0.28, (Math.abs(tiltX.get()) + Math.abs(tiltY.get())) / 120),
  }));

  if (!pet) return null;
  const look = breedLook(pet.type, pet.breed);

  const frontRows: Row[] = [
    ['Type', pet.type === 'cat' ? 'Cat' : 'Dog'],
    ['Breed', pet.breed],
    ['Sex', pet.sex === 'male' ? 'Male' : 'Female'],
    ['Age', ageText(pet.birthDate, pet.approxAgeMonths)],
  ];
  const backRows: Row[] = [
    ['Date of birth', pet.birthDate ? isoToInput(pet.birthDate) : 'Unknown'],
    ['Owner', session?.ownerName ?? ''],
  ];

  const face = [styles.face, { width: cardWidth, height: cardHeight, backgroundColor: theme.backgroundElement, borderColor: theme.border }];

  return (
    <ThemedView style={styles.root}>
      <SafeAreaView style={styles.root} edges={['top']}>
        <View style={styles.content}>
          <ThemedText type="subtitle">Pet ID</ThemedText>

          <View style={styles.stage}>
            <View
              {...responder.panHandlers}
              accessibilityRole="button"
              accessibilityLabel="Pet ID card. Tap to flip, drag to tilt."
              style={{ width: cardWidth, height: cardHeight }}>
              {/* Front */}
              <Animated.View style={[face, frontStyle]}>
                <View style={[styles.hero, { backgroundColor: theme.primarySoft }]}>
                  <View style={[styles.avatar, { backgroundColor: theme.background }]}>
                    <PetArt
                      type={pet.type}
                      size={84}
                      color={theme.text}
                      accent={theme.primary}
                      bandana
                      strokeWidth={4.6}
                      fill={look.coat}
                      ears={look.ears}
                    />
                  </View>
                  <ThemedText type="subtitle" style={styles.name}>
                    {pet.name}
                  </ThemedText>
                </View>
                <Rows rows={frontRows} />
                <Animated.View pointerEvents="none" style={[styles.sheen, sheenStyle]} />
              </Animated.View>

              {/* Back */}
              <Animated.View style={[face, backStyle]}>
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
                    <ThemedText themeColor="textSecondary">Instagram</ThemedText>
                    <ThemedText type="smallBold" style={{ color: theme.primaryText, fontSize: 16 }}>
                      @{pet.instagram}
                    </ThemedText>
                  </Pressable>
                ) : null}
                <View style={[styles.bio, { borderTopColor: theme.border }]}>
                  <ThemedText themeColor="textSecondary">About</ThemedText>
                  <ThemedText>{pet.bio || 'No notes yet.'}</ThemedText>
                </View>
                <Animated.View pointerEvents="none" style={[styles.sheen, sheenStyle]} />
              </Animated.View>
            </View>
          </View>

          <ThemedText type="small" themeColor="textSecondary" style={styles.hint}>
            Drag to tilt · tap to flip
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
  content: { flex: 1, paddingHorizontal: Spacing.four, paddingVertical: Spacing.four, gap: Spacing.three },
  stage: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  face: {
    position: 'absolute',
    borderWidth: 1,
    borderRadius: 28,
    overflow: 'hidden',
    backfaceVisibility: 'hidden',
    shadowColor: '#000',
    shadowOpacity: 0.18,
    shadowRadius: 18,
    shadowOffset: { width: 0, height: 10 },
  },
  hero: { alignItems: 'center', gap: Spacing.two, paddingVertical: Spacing.four },
  backHeader: { alignItems: 'center', paddingVertical: Spacing.three },
  avatar: { width: 120, height: 120, borderRadius: 60, alignItems: 'center', justifyContent: 'center' },
  name: { fontSize: 28, lineHeight: 34 },
  rows: { padding: Spacing.three, gap: Spacing.three },
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
  bio: { padding: Spacing.three, gap: Spacing.one, borderTopWidth: 1 },
  sheen: { ...StyleSheet.absoluteFill as object, backgroundColor: '#FFFFFF' },
  hint: { textAlign: 'center' },
});
