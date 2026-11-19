import { SymbolView } from 'expo-symbols';
import type { ColorValue } from 'react-native';

type SymbolIconProps = {
  ios: string;
  material: string;
  color: ColorValue;
  size?: number;
};

/** One icon from a pair of names: an SF Symbol on iOS, a Material symbol elsewhere. */
export function SymbolIcon({ ios, material, color, size = 20 }: SymbolIconProps) {
  return (
    <SymbolView
      name={{ ios: ios as never, android: material as never, web: material as never }}
      tintColor={color}
      size={size}
    />
  );
}
