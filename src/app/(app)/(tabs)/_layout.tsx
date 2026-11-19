import type { ColorValue } from 'react-native';
import { Tabs } from 'expo-router';
import { SymbolView } from 'expo-symbols';

import { useTheme } from '@/hooks/use-theme';

type TabIconProps = { ios: string; material: string; color: ColorValue };

function TabIcon({ ios, material, color }: TabIconProps) {
  return (
    <SymbolView
      name={{ ios: ios as never, android: material as never, web: material as never }}
      tintColor={color}
      size={24}
    />
  );
}

/** Bottom navigation: Home, Calendar, Pet ID. */
export default function TabsLayout() {
  const theme = useTheme();
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: theme.primaryText,
        tabBarInactiveTintColor: theme.textSecondary,
        tabBarStyle: { backgroundColor: theme.background, borderTopColor: theme.border },
        tabBarLabelStyle: { fontSize: 12, fontWeight: '600' },
      }}>
      <Tabs.Screen
        name="index"
        options={{
          title: 'Home',
          tabBarIcon: ({ color }) => <TabIcon ios="house.fill" material="home" color={color} />,
        }}
      />
      <Tabs.Screen
        name="calendar"
        options={{
          title: 'Calendar',
          tabBarIcon: ({ color }) => <TabIcon ios="calendar" material="calendar_month" color={color} />,
        }}
      />
      <Tabs.Screen
        name="id"
        options={{
          title: 'Pet ID',
          tabBarIcon: ({ color }) => <TabIcon ios="person.text.rectangle.fill" material="badge" color={color} />,
        }}
      />
    </Tabs>
  );
}
