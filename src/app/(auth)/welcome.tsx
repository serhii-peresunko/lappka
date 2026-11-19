import { useRouter } from 'expo-router';
import { StyleSheet, View, useWindowDimensions } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { ThemedView } from '@/components/themed-view';
import { Button } from '@/components/ui/button';
import { DogLineArt } from '@/components/ui/dog-line-art';
import { Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';

/** First screen: one big picture and two buttons. Swap the illustration for a photo any time. */
export default function WelcomeScreen() {
  const theme = useTheme();
  const router = useRouter();
  const { width } = useWindowDimensions();

  const circle = Math.min(width - Spacing.four * 2, 380);

  return (
    <ThemedView style={styles.root}>
      <SafeAreaView style={styles.root} edges={['top', 'bottom']}>
        <View style={styles.picture}>
          <View
            style={[
              styles.circle,
              { width: circle, height: circle, borderRadius: circle / 2, backgroundColor: theme.primarySoft },
            ]}>
            <DogLineArt
              size={circle * 0.88}
              color={theme.text}
              accent={theme.primary}
              bandana
              strokeWidth={3.4}
            />
          </View>
        </View>

        <View style={styles.actions}>
          <Button title="Sign up" onPress={() => router.push({ pathname: '/auth', params: { mode: 'sign-up' } })} />
          <Button
            variant="outline"
            title="Sign in"
            onPress={() => router.push({ pathname: '/auth', params: { mode: 'sign-in' } })}
          />
        </View>
      </SafeAreaView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
  },
  picture: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: Spacing.four,
  },
  circle: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  actions: {
    width: '100%',
    maxWidth: 460,
    alignSelf: 'center',
    paddingHorizontal: Spacing.four,
    paddingBottom: Spacing.three,
    gap: Spacing.three,
  },
});
