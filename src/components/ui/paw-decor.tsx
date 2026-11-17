import { SymbolView } from 'expo-symbols';
import { StyleSheet, View, type ViewStyle } from 'react-native';

type Paw = { top?: number | `${number}%`; left?: number | `${number}%`; right?: number | `${number}%`; bottom?: number | `${number}%`; size: number; rotate: number };

/** Scattered, faded paw prints used as background decoration. */
export function PawDecor({ paws, color, opacity = 0.35 }: { paws: Paw[]; color: string; opacity?: number }) {
  return (
    <View pointerEvents="none" style={StyleSheet.absoluteFill}>
      {paws.map(({ size, rotate, ...position }, index) => (
        <View
          key={index}
          style={[styles.paw, position as ViewStyle, { opacity, transform: [{ rotate: `${rotate}deg` }] }]}>
          <SymbolView name={{ ios: 'pawprint.fill', android: 'pets', web: 'pets' }} tintColor={color} size={size} />
        </View>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  paw: {
    position: 'absolute',
  },
});
