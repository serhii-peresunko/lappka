import { Tabs } from 'expo-router/js-tabs';

import { TabBar } from '@/components/navigation/tab-bar';

// JS tabs (not NativeTabs) so the bar can have the raised "+" button and look the
// same on iOS, Android and web.
export default function TabsLayout() {
  return (
    <Tabs screenOptions={{ headerShown: false }} tabBar={(props) => <TabBar {...props} />}>
      <Tabs.Screen name="index" />
      <Tabs.Screen name="calendar" />
      <Tabs.Screen name="care" />
      <Tabs.Screen name="pet" />
    </Tabs>
  );
}
