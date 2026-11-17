import { Stack } from 'expo-router';

import { CareProvider } from '@/providers/care-provider';

export default function AppLayout() {
  return (
    <CareProvider>
      <Stack screenOptions={{ headerShown: false }}>
        <Stack.Screen name="(tabs)" />
        <Stack.Screen name="record" options={{ presentation: 'modal' }} />
        <Stack.Screen name="edit-pet" options={{ presentation: 'modal' }} />
        <Stack.Screen name="settings" />
      </Stack>
    </CareProvider>
  );
}
