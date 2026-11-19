import { Tabs } from 'expo-router';

import { FloatingTabBar } from '@/components/ui/floating-tab-bar';

/** Bottom navigation: Home, Calendar, [Add event], Pet ID, Settings (see FloatingTabBar). */
export default function TabsLayout() {
  return (
    <Tabs tabBar={(props) => <FloatingTabBar {...props} />} screenOptions={{ headerShown: false }}>
      <Tabs.Screen name="index" options={{ title: 'Home' }} />
      <Tabs.Screen name="calendar" options={{ title: 'Calendar' }} />
      <Tabs.Screen name="add" options={{ title: 'Add event' }} />
      <Tabs.Screen name="id" options={{ title: 'Pet ID' }} />
      <Tabs.Screen name="settings" options={{ title: 'Settings' }} />
    </Tabs>
  );
}
