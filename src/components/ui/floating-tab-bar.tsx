import { useRouter, type Tabs } from 'expo-router';
import type { ComponentProps } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { CalendarIcon, HomeIcon, PlusIcon } from '@/components/ui/tab-icons';
import { Colors, Radius, Spacing } from '@/constants/theme';
import { useI18n } from '@/i18n';
import type { StringKey } from '@/i18n/en';

type TabBarProps = Parameters<NonNullable<ComponentProps<typeof Tabs>['tabBar']>>[0];

const ITEMS: Record<string, { label: StringKey; Icon: typeof HomeIcon }> = {
  index: { label: 'tab.home', Icon: HomeIcon },
  calendar: { label: 'tab.calendar', Icon: CalendarIcon },
};

/** A floating grey capsule: Home, the black add-event button, Calendar. Both icons are black; the open tab has a grey circle. */
export function FloatingTabBar({ state, emitter, navigateToTab }: TabBarProps) {
  const { t } = useI18n();
  const router = useRouter();
  const insets = useSafeAreaInsets();

  return (
    <View pointerEvents="box-none" style={[styles.wrap, { paddingBottom: Math.max(insets.bottom + 14, Spacing.four) }]}>
      <View style={styles.bar}>
        {state.routes.map((route, index) => {
          if (route.name === 'add') {
            return (
              <Pressable
                key={route.key}
                accessibilityRole="button"
                accessibilityLabel={t('tab.add')}
                onPress={() => router.push('/add-event')}
                style={({ pressed }) => [styles.add, pressed && { opacity: 0.8, transform: [{ scale: 0.96 }] }]}>
                <PlusIcon color={Colors.light.onPrimary} />
              </Pressable>
            );
          }
          const item = ITEMS[route.name];
          if (!item) return null;
          const focused = state.index === index;
          return (
            <Pressable
              key={route.key}
              accessibilityRole="tab"
              accessibilityLabel={t(item.label)}
              accessibilityState={{ selected: focused }}
              onPress={() => {
                const event = emitter.emit({ type: 'tabPress', target: route.key, canPreventDefault: true });
                if (!focused && !event.defaultPrevented) navigateToTab(route.key);
              }}
              style={({ pressed }) => [styles.item, pressed && { opacity: 0.6 }]}>
              {/* The open tab sits on a soft grey circle, the same size as the add button. */}
              {focused ? <View style={styles.activeCircle} /> : null}
              <item.Icon color={Colors.light.text} />
            </Pressable>
          );
        })}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  // Absolute, so the page scrolls underneath it.
  wrap: { position: 'absolute', left: 0, right: 0, bottom: 0, alignItems: 'center' },
  // 184 x 68 with the three centres 58 apart, as in the wireframe.
  bar: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', width: 184, height: 68, borderRadius: Radius.pill, backgroundColor: Colors.light.control },
  activeCircle: { position: 'absolute', width: 48, height: 48, borderRadius: Radius.pill, backgroundColor: '#DADADA' },
  item: { width: 58, height: 52, alignItems: 'center', justifyContent: 'center' },
  add: { width: 48, height: 48, marginHorizontal: 5, borderRadius: Radius.pill, alignItems: 'center', justifyContent: 'center', backgroundColor: Colors.light.primary },
});
