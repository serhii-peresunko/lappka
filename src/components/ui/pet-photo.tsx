import { BlurView } from 'expo-blur';
import { Image, StyleSheet, View, type ImageSourcePropType } from 'react-native';

type PetPhotoProps = {
  source: ImageSourcePropType;
  width: number;
  height: number;
  /** How much of the frame (from the top) the sharp photo may use; the rest is left to the blurred backdrop. */
  sharpShare?: number;
  /** "contain" shows the whole photo (blurred backdrop fills the rest); "cover" fills the frame and may trim the edges. */
  fit?: 'contain' | 'cover';
};

/**
 * Any photo, whole: the sharp picture is shown uncropped (contain) near the top, and the same
 * picture, enlarged and blurred, fills the rest of the frame, so nothing is cut off and there
 * are no empty bars. A 4:5 crop from the picker fits almost exactly and the backdrop barely shows.
 */
export function PetPhoto({ source, width, height, sharpShare = 0.7, fit = 'contain' }: PetPhotoProps) {
  return (
    <View style={{ width, height, overflow: 'hidden', backgroundColor: '#1A1A1A' }}>
      <Image source={source} style={StyleSheet.absoluteFill} resizeMode="cover" blurRadius={28} />
      <BlurView intensity={30} tint="dark" style={StyleSheet.absoluteFill} />
      <Image source={source} style={{ width, height: height * sharpShare }} resizeMode={fit} />
    </View>
  );
}
