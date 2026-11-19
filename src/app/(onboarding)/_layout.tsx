import { Stack } from 'expo-router';

import { useSession } from '@/providers/session';

export const unstable_settings = {
  anchor: 'owner',
};

/** Two steps in a fixed order: the owner's name first, then the pet. */
export default function OnboardingLayout() {
  const { session } = useSession();
  const hasOwner = !!session?.ownerName;

  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Protected guard={!hasOwner}>
        <Stack.Screen name="owner" />
      </Stack.Protected>
      <Stack.Protected guard={hasOwner}>
        <Stack.Screen name="pet" />
      </Stack.Protected>
    </Stack>
  );
}
