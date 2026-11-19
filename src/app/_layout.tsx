import { DarkTheme, DefaultTheme, Stack, ThemeProvider } from 'expo-router';
import { useColorScheme } from 'react-native';

import { SessionProvider, useSession } from '@/providers/session';

/**
 * Flow:
 *   signed out                  -> (auth)        sign in / sign up
 *   signed in, no owner name    -> (onboarding)  owner
 *   signed in, no pet yet       -> (onboarding)  pet
 *   everything done             -> (app)         placeholder
 */
function RootNavigator() {
  const { session } = useSession();

  const signedIn = session !== null;
  const needsOwner = signedIn && !session.ownerName;
  const needsPet = signedIn && !needsOwner && !session.pet;
  const onboarding = needsOwner || needsPet;

  const fallback = !signedIn ? '/welcome' : needsOwner ? '/owner' : needsPet ? '/pet-type' : '/';

  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Protected guard={!signedIn} redirectTo={fallback}>
        <Stack.Screen name="(auth)" />
      </Stack.Protected>
      <Stack.Protected guard={onboarding} redirectTo={fallback}>
        <Stack.Screen name="(onboarding)" />
      </Stack.Protected>
      <Stack.Protected guard={signedIn && !onboarding} redirectTo={fallback}>
        <Stack.Screen name="(app)" />
      </Stack.Protected>
    </Stack>
  );
}

export default function RootLayout() {
  const colorScheme = useColorScheme();
  return (
    <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
      <SessionProvider>
        <RootNavigator />
      </SessionProvider>
    </ThemeProvider>
  );
}
