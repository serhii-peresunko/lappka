import { useRouter } from 'expo-router';
import type { BottomTabBarProps } from 'expo-router/js-tabs';
import { SymbolView, type SymbolViewProps } from 'expo-symbols';
import { Pressable, StyleSheet, View } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { CardShadow, Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';
import { useI18n } from '@/i18n/i18n-provider';
import type { Translation } from '@/i18n/translations';

type TabMeta = {
  label: (t: Translation) => string;
  icon: SymbolViewProps['name'];
  activeIcon: SymbolViewProps['name'];
};

const TABS: Record<string, TabMeta> = {
  index: {
    label: (t) => t.tabs.today,
    icon: { ios: 'house', android: 'home', web: 'home' },
    activeIcon: { ios: 'house.fill', android: 'home', web: 'home' },
  },
  calendar: {
    label: (t) => t.tabs.calendar,
    icon: { ios: 'calendar', android: 'calendar_month', web: 'calendar_month' },
    activeIcon: { ios: 'calendar', android: 'calendar_month', web: 'calendar_month' },
  },
  care: {
    label: (t) => t.tabs.care,
    icon: { ios: 'heart.text.square', android: 'medical_services', web: 'medical_services' },
    activeIcon: { ios: 'heart.text.square.fill', android: 'medical_services', web: 'medical_services' },
  },
  pet: {
    label: (t) => t.tabs.pet,
    icon: { ios: 'pawprint', android: 'pets', web: 'pets' },
    activeIcon: { ios: 'pawprint.fill', android: 'pets', web: 'pets' },
  },
};

/** Floating white tab bar with a raised orange "+" in the middle that opens a new care entry. */
export function TabBar({ state, navigateToTab, insets }: BottomTabBarProps) {
  const theme = useTheme();
  const router = useRouter();
  const { t } = useI18n();

  const items = state.routes.filter((route) => route.name in TABS);
  const middle = Math.ceil(items.length / 2);

  const renderTab = (route: (typeof items)[number]) => {
    const meta = TABS[route.name];
    const focused = state.routes[state.index]?.key === route.key;
    const color = focused ? theme.primary : theme.textSecondary;
    return (
      <Pressable
        key={route.key}
        accessibilityRole="tab"
        accessibilityState={{ selected: focused }}
        accessibilityLabel={meta.label(t)}
        onPress={() => navigateToTab(route.key)}
        style={({ pressed }) => [styles.tab, pressed && styles.pressed]}>
        <SymbolView name={focused ? meta.activeIcon : meta.icon} tintColor={color} size={24} />
        <ThemedText
          numberOfLines={1}
          style={[styles.label, { color, fontWeight: focused ? 700 : 500 }]}>
          {meta.label(t)}
        </ThemedText>
      </Pressable>
    );
  };

  return (
    <View
      pointerEvents="box-none"
      style={[styles.wrapper, { paddingBottom: Math.max(insets.bottom, Spacing.three) }]}>
      <View style={[styles.bar, CardShadow, { backgroundColor: theme.backgroundElement }]}>
        {items.slice(0, middle).map(renderTab)}
        <View style={styles.addSlot}>
          <Pressable
            accessibilityRole="button"
            accessibilityLabel={t.tabs.add}
            onPress={() => router.push('/record')}
            style={({ pressed }) => [
              styles.add,
              { backgroundColor: theme.primary, borderColor: theme.background },
              pressed && styles.pressed,
            ]}>
            <SymbolView
              name={{ ios: 'plus', android: 'add', web: 'add' }}
              tintColor={theme.onPrimary}
              size={28}
              weight="bold"
            />
          </Pressable>
        </View>
        {items.slice(middle).map(renderTab)}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    paddingHorizontal: Spacing.three,
    alignItems: 'center',
  },
  bar: {
    width: '100%',
    maxWidth: 520,
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 28,
    paddingHorizontal: Spacing.two,
    paddingVertical: Spacing.two,
  },
  tab: {
    flex: 1,
    alignItems: 'center',
    gap: 2,
    paddingVertical: Spacing.one,
  },
  label: {
    fontSize: 11,
    lineHeight: 14,
  },
  addSlot: {
    width: 72,
    alignItems: 'center',
  },
  add: {
    width: 60,
    height: 60,
    borderRadius: 30,
    marginTop: -34,
    borderWidth: 5,
    alignItems: 'center',
    justifyContent: 'center',
  },
  pressed: {
    opacity: 0.75,
  },
});
