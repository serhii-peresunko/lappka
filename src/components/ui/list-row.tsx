import type { ReactNode } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { SymbolIcon } from '@/components/ui/symbol-icon';
import { Colors } from '@/constants/theme';

type ListRowProps = {
  title: string;
  subtitle?: string;
  /** A pastel icon tile on the left. */
  icon?: { ios: string; material: string; color: string; tint: string };
  /** Anything else on the left, instead of the icon tile (an avatar, a photo, a ring). */
  leading?: ReactNode;
  /** Short grey text on the right, before the chevron. */
  value?: string;
  onPress?: () => void;
};

/** The one row used by every list: tile, title over a grey line, and a chevron when it opens something. */
export function ListRow({ title, subtitle, icon, leading, value, onPress }: ListRowProps) {
  return (
    <Pressable
      accessibilityRole={onPress ? 'button' : undefined}
      disabled={!onPress}
      onPress={onPress}
      style={({ pressed }) => [styles.row, pressed && { opacity: 0.6 }]}>
      {leading ??
        (icon ? (
          <View style={[styles.tile, { backgroundColor: icon.tint }]}>
            <SymbolIcon ios={icon.ios} material={icon.material} color={icon.color} size={18} />
          </View>
        ) : null)}
      <View style={styles.text}>
        <ThemedText style={styles.title} numberOfLines={1}>
          {title}
        </ThemedText>
        {subtitle ? (
          <ThemedText style={styles.subtitle} numberOfLines={1}>
            {subtitle}
          </ThemedText>
        ) : null}
      </View>
      {value ? (
        <ThemedText style={styles.value} numberOfLines={1}>
          {value}
        </ThemedText>
      ) : null}
      {onPress ? <SymbolIcon ios="chevron.right" material="chevron_right" color={Colors.light.textTertiary} size={12} /> : null}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', alignItems: 'center', gap: 12, minHeight: 64, paddingHorizontal: 14, paddingVertical: 10 },
  tile: { width: 40, height: 40, borderRadius: 12, alignItems: 'center', justifyContent: 'center' },
  text: { flex: 1, gap: 1 },
  title: { fontSize: 15, lineHeight: 20, fontWeight: '600' },
  subtitle: { color: Colors.light.textSecondary, fontSize: 13, lineHeight: 17, fontWeight: '400' },
  value: { color: Colors.light.textSecondary, fontSize: 14, lineHeight: 18, fontWeight: '500', maxWidth: '45%' },
});
