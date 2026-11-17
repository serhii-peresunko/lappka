import { SymbolView } from 'expo-symbols';
import { StyleSheet, View } from 'react-native';

import { useTheme } from '@/hooks/use-theme';

/** Placeholder avatar until photo upload exists. */
export function PetAvatar({ size = 56 }: { size?: number }) {
  const theme = useTheme();
  return (
    <View
      style={[
        styles.avatar,
        { width: size, height: size, borderRadius: size / 2, backgroundColor: theme.primarySoft },
      ]}>
      <SymbolView
        name={{ ios: 'pawprint.fill', android: 'pets', web: 'pets' }}
        tintColor={theme.primary}
        size={size * 0.48}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  avatar: {
    alignItems: 'center',
    justifyContent: 'center',
  },
});
