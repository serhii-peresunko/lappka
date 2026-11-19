import { useRouter, type Tabs } from "expo-router";
import { SymbolView } from "expo-symbols";
import type { ComponentProps } from "react";
import { Pressable, StyleSheet, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { Spacing } from "@/constants/theme";
import { useTheme } from "@/hooks/use-theme";

type TabBarProps = Parameters<
  NonNullable<ComponentProps<typeof Tabs>["tabBar"]>
>[0];

const ITEMS: Record<string, { label: string; ios: string; material: string }> =
  {
    index: { label: "Home", ios: "house.fill", material: "home" },
    calendar: {
      label: "Calendar",
      ios: "calendar",
      material: "calendar_month",
    },
    id: {
      label: "Pet ID",
      ios: "person.text.rectangle.fill",
      material: "badge",
    },
    settings: {
      label: "Settings",
      ios: "gearshape.fill",
      material: "settings",
    },
  };

/**
 * A floating, rounded tab bar: icons only, the active tab sits in a soft pill,
 * and the middle button opens the Add event form instead of switching tabs.
 */
export function FloatingTabBar({ state, emitter, navigateToTab }: TabBarProps) {
  const theme = useTheme();
  const router = useRouter();
  const insets = useSafeAreaInsets();

  return (
    <View
      style={[
        styles.wrap,
        {
          backgroundColor: theme.background,
          paddingBottom: Math.max(insets.bottom, Spacing.three),
        },
      ]}
    >
      <View
        style={[
          styles.bar,
          { backgroundColor: theme.background, borderColor: theme.border },
        ]}
      >
        {state.routes.map((route, index) => {
          if (route.name === "add") {
            return (
              <View key={route.key} style={styles.slot}>
                <Pressable
                  accessibilityRole="button"
                  accessibilityLabel="Add event"
                  onPress={() => router.push("/add-event")}
                  style={({ pressed }) => [
                    styles.add,
                    { backgroundColor: theme.text },
                    pressed && { opacity: 0.85 },
                  ]}
                >
                  <SymbolView
                    name={{ ios: "plus", android: "add", web: "add" }}
                    tintColor={theme.background}
                    size={24}
                    weight="semibold"
                  />
                </Pressable>
              </View>
            );
          }

          const item = ITEMS[route.name];
          if (!item) return null;
          const focused = state.index === index;
          const color = focused ? theme.text : theme.textSecondary;

          return (
            <View key={route.key} style={styles.slot}>
              <Pressable
                accessibilityRole="tab"
                accessibilityLabel={item.label}
                accessibilityState={{ selected: focused }}
                onPress={() => {
                  const event = emitter.emit({
                    type: "tabPress",
                    target: route.key,
                    canPreventDefault: true,
                  });
                  if (!focused && !event.defaultPrevented)
                    navigateToTab(route.key);
                }}
                style={[
                  styles.item,
                  focused && { backgroundColor: theme.backgroundElement },
                ]}
              >
                <SymbolView
                  name={{
                    ios: item.ios as never,
                    android: item.material as never,
                    web: item.material as never,
                  }}
                  tintColor={color}
                  size={22}
                />
              </Pressable>
            </View>
          );
        })}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { paddingHorizontal: Spacing.three, paddingTop: Spacing.two },
  bar: {
    flexDirection: "row",
    alignItems: "center",
    height: 68,
    borderRadius: 34,
    borderWidth: StyleSheet.hairlineWidth,
    shadowColor: "#000",
    shadowOpacity: 0.06,
    shadowRadius: 14,
    shadowOffset: { width: 0, height: 4 },
    elevation: 8,
  },
  // Every button gets an equal-width slot, so the icons are evenly spaced and the + is dead centre.
  slot: { flex: 1, alignItems: "center", justifyContent: "center" },
  item: {
    height: 48,
    width: 48,
    borderRadius: 24,
    alignItems: "center",
    justifyContent: "center",
  },
  add: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: "center",
    justifyContent: "center",
  },
});
