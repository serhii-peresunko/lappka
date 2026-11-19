import { Stack } from 'expo-router';

import { useSession } from '@/providers/session';

export const unstable_settings = {
  anchor: 'owner',
};

/** Three steps in a fixed order: owner name, pet type, pet details. */
export default function OnboardingLayout() {
  const { session, draftPetType } = useSession();
  const hasOwner = !!session?.ownerName;

  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Protected guard={!hasOwner}>
        <Stack.Screen name="owner" />
      </Stack.Protected>
      <Stack.Protected guard={hasOwner && !draftPetType}>
        <Stack.Screen name="pet-type" />
      </Stack.Protected>
      <Stack.Protected guard={hasOwner && !!draftPetType}>
        <Stack.Screen name="pet" />
      </Stack.Protected>
    </Stack>
  );
}
