import { StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { Button } from '@/components/ui/button';
import { Spacing } from '@/constants/theme';
import { useAuth } from '@/providers/auth-provider';

const PROVIDER_LABEL = { email: 'email', google: 'Google', apple: 'Apple' } as const;

// Placeholder until the Home, Calendar, Vaccination, Grooming and Pills tabs are built.
export default function HomeScreen() {
  const { session, signOut } = useAuth();

  return (
    <ThemedView style={styles.root}>
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.content}>
          <ThemedText type="subtitle">Hi, {session?.name}</ThemedText>
          <ThemedText themeColor="textSecondary">
            Signed in with {session ? PROVIDER_LABEL[session.provider] : ''} as {session?.email}
          </ThemedText>
          <Button variant="outline" title="Sign out" onPress={signOut} />
        </View>
      </SafeAreaView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
  },
  safeArea: {
    flex: 1,
    justifyContent: 'center',
    paddingHorizontal: Spacing.four,
  },
  content: {
    width: '100%',
    maxWidth: 420,
    alignSelf: 'center',
    gap: Spacing.three,
  },
});
