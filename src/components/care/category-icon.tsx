import { SymbolView } from 'expo-symbols';
import { StyleSheet, View } from 'react-native';

import { CATEGORIES, type CareCategory } from '@/data/care';

type CategoryIconProps = {
  category: CareCategory;
  size?: number;
};

export function CategoryIcon({ category, size = 40 }: CategoryIconProps) {
  const meta = CATEGORIES[category];
  return (
    <View
      style={[
        styles.badge,
        { width: size, height: size, borderRadius: size * 0.32, backgroundColor: `${meta.color}22` },
      ]}>
      <SymbolView name={meta.icon} tintColor={meta.color} size={size * 0.5} />
    </View>
  );
}

const styles = StyleSheet.create({
  badge: {
    alignItems: 'center',
    justifyContent: 'center',
  },
});
