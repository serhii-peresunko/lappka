import { StyleSheet, View } from 'react-native';

import { breedLook } from '@/data/breeds';
import type { PetType } from '@/providers/session';

import { PetArt } from './pet-art';

// Fixed colors so the coat reads the same in light and dark mode.
const LINE = '#111111';
const ACCENT = '#555555';
const BACKDROP = '#EDEDED';

type BreedIconProps = {
  type: PetType;
  /** Breed name; unknown names get a neutral icon. */
  breed: string;
  size?: number;
};

/** Small round icon for a breed: its coat color and ear shape on a neutral disc. */
export function BreedIcon({ type, breed, size = 40 }: BreedIconProps) {
  const { coat, ears } = breedLook(type, breed);
  return (
    <View
      style={[styles.disc, { width: size, height: size, borderRadius: size / 2, backgroundColor: BACKDROP }]}>
      <PetArt
        type={type}
        size={size * 1.18}
        color={LINE}
        accent={ACCENT}
        fill={coat}
        ears={ears}
        strokeWidth={Math.max(5, 150 / size)}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  disc: {
    overflow: 'hidden',
    alignItems: 'center',
    justifyContent: 'center',
  },
});
