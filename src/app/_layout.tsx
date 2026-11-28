import {
  GoogleSansFlex_400Regular,
  GoogleSansFlex_500Medium,
  GoogleSansFlex_600SemiBold,
  GoogleSansFlex_700Bold,
  useFonts,
} from '@expo-google-fonts/google-sans-flex';
import { DefaultTheme, Stack, ThemeProvider } from 'expo-router';

import { SessionGate } from '@/components/session-gate';
import { Colors } from '@/constants/theme';
import { I18nProvider } from '@/i18n';
import { SessionProvider, useSession } from '@/providers/session';

// The navigator's own surfaces (behind screens and sheets) follow the app's palette.
const NAV_THEME = {
  ...DefaultTheme,
  colors: { ...DefaultTheme.colors, primary: Colors.light.primary, background: Colors.light.background, card: Colors.light.surface, text: Colors.light.text, border: Colors.light.border },
};

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
    <>
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
    <SessionGate />
    </>
  );
}

export default function RootLayout() {
  const [fontsLoaded] = useFonts({
    GoogleSansFlex_400Regular,
    GoogleSansFlex_500Medium,
    GoogleSansFlex_600SemiBold,
    GoogleSansFlex_700Bold,
  });
  // Wait for the font so the first frame is not drawn in the system font.
  if (!fontsLoaded) return null;

  return (
    <ThemeProvider value={NAV_THEME}>
      <I18nProvider>
        <SessionProvider>
          <RootNavigator />
        </SessionProvider>
      </I18nProvider>
    </ThemeProvider>
  );
}
