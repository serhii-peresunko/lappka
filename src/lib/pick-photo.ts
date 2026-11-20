import * as ImagePicker from 'expo-image-picker';

/** Aspect ratio of the crop box; the Pet ID card shows the photo at about this shape. */
export const PHOTO_ASPECT: [number, number] = [4, 5];

/**
 * Opens the photo library with the system crop editor, so the owner frames the pet themselves
 * (move and zoom until the whole animal is inside the box). Returns the local file uri, or null
 * when cancelled or when access was denied.
 */
export async function pickPetPhoto(): Promise<string | null> {
  const result = await ImagePicker.launchImageLibraryAsync({
    mediaTypes: ['images'],
    allowsEditing: true,
    aspect: PHOTO_ASPECT,
    quality: 0.85,
  });
  if (result.canceled) return null;
  return result.assets[0]?.uri ?? null;
}
