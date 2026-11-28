import { Stack } from 'expo-router';

export default function AppLayout() {
  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="(tabs)" />
      <Stack.Screen name="profile" />
      <Stack.Screen name="pet" />
      <Stack.Screen name="events" />
      <Stack.Screen
        name="add-event"
        options={{
          presentation: 'formSheet',
          sheetGrabberVisible: true,
          sheetAllowedDetents: [0.88],
          sheetCornerRadius: 28,
          contentStyle: { backgroundColor: '#EBEAE6' },
        }}
      />
    </Stack>
  );
}
