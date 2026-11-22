import { BlurView } from 'expo-blur';
import { useRouter, type Tabs } from 'expo-router';
import type { ComponentProps } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { SymbolIcon } from '@/components/ui/symbol-icon';
import { Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';
import { useI18n } from '@/i18n';
import type { StringKey } from '@/i18n/en';

type TabBarProps = Parameters<NonNullable<ComponentProps<typeof Tabs>['tabBar']>>[0];

const ITEMS: Record<string, { label: StringKey; ios: string; material: string }> = {
  index: { label: 'tab.home', ios: 'house.fill', material: 'home' },
  calendar: { label: 'tab.calendar', ios: 'calendar', material: 'calendar_month' },
};

/**
 * A floating frosted-glass tab bar: it blurs whatever scrolls underneath it, shows icons only,
 * marks the active tab with a soft pill, and the middle button opens the Add event form.
 */
export function FloatingTabBar({ state, emitter, navigateToTab }: TabBarProps) {
  const theme = useTheme();
  const router = useRouter();
  const { t } = useI18n();
  const insets = useSafeAreaInsets();

  return (
    <View
      pointerEvents="box-none"
      style={[styles.wrap, { paddingBottom: Math.max(insets.bottom, Spacing.three) }]}>
      <View style={styles.shadow}>
        <View style={styles.bar}>
          <BlurView intensity={55} tint="light" style={StyleSheet.absoluteFill} />
          <View style={styles.tint} pointerEvents="none" />

          {state.routes.map((route, index) => {
            if (route.name === 'add') {
              return (
                <View key={route.key} style={styles.slot}>
                  <Pressable
                    accessibilityRole="button"
                    accessibilityLabel={t('tab.add')}
                    onPress={() => router.push('/add-event')}
                    style={({ pressed }) => [styles.add, { backgroundColor: theme.text }, pressed && { opacity: 0.85 }]}>
                    <SymbolIcon ios="plus" material="add" color={theme.background} size={22} />
                  </Pressable>
                </View>
              );
            }

            const item = ITEMS[route.name];
            if (!item) return null;
            const focused = state.index === index;

            return (
              <View key={route.key} style={styles.slot}>
                <Pressable
                  accessibilityRole="tab"
                  accessibilityLabel={t(item.label)}
                  accessibilityState={{ selected: focused }}
                  onPress={() => {
                    const event = emitter.emit({ type: 'tabPress', target: route.key, canPreventDefault: true });
                    if (!focused && !event.defaultPrevented) navigateToTab(route.key);
                  }}
                  style={[styles.item, focused && styles.itemActive]}>
                  <SymbolIcon
                    ios={item.ios}
                    material={item.material}
                    color={focused ? theme.text : theme.textSecondary}
                    size={22}
                  />
                </Pressable>
              </View>
            );
          })}
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  // Absolute, so the page scrolls underneath and shows through the blur.
  wrap: { position: 'absolute', left: 0, right: 0, bottom: 0, alignItems: 'center' },
  shadow: {
    width: 204,
    borderRadius: 32,
    shadowColor: '#000',
    shadowOpacity: 0.12,
    shadowRadius: 20,
    shadowOffset: { width: 0, height: 8 },
    elevation: 8,
  },
  tint: { ...(StyleSheet.absoluteFill as object), backgroundColor: 'rgba(255,255,255,0.78)' },
  bar: {
    flexDirection: 'row',
    alignItems: 'center',
    height: 64,
    borderRadius: 32,
    overflow: 'hidden',
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: 'rgba(255,255,255,0.7)',
  },
  // Every button gets an equal-width slot, so the icons are evenly spaced and the + is dead centre.
  slot: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  // The buttons have no fill of their own; only the open tab is marked with a faint tint.
  itemActive: { backgroundColor: 'rgba(0,0,0,0.07)' },
  item: { height: 44, width: 44, borderRadius: 22, alignItems: 'center', justifyContent: 'center' },
  add: { width: 44, height: 44, borderRadius: 22, alignItems: 'center', justifyContent: 'center' },
});
