import { StyleSheet, View } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { SymbolIcon } from '@/components/ui/symbol-icon';
import { Spacing } from '@/constants/theme';
import { useI18n } from '@/i18n';
import { KIND_COLORS, KIND_ICONS, kindKey } from '@/lib/event-kinds';
import type { PetEvent } from '@/providers/session';

type EventCardProps = {
  event: PetEvent;
  /** Small text on the card, e.g. "Today · 10:00". */
  when?: string;
  /** "tile" is a tall card for a two-column grid; "wide" is a full-width row. */
  variant?: 'tile' | 'wide';
};

/** An event as a soft pastel card tinted with its kind's color. */
export function EventCard({ event, when, variant = 'wide' }: EventCardProps) {
  const { t } = useI18n();
  const color = KIND_COLORS[event.kind];
  const tint = `${color}33`;

  const badge = (
    <View style={styles.badge}>
      <SymbolIcon {...KIND_ICONS[event.kind]} color={color} size={18} />
    </View>
  );
  const title = <ThemedText style={styles.title} numberOfLines={2}>{event.title}</ThemedText>;
  const kind = (
    <ThemedText type="small" style={styles.muted}>
      {t(kindKey(event.kind))}
    </ThemedText>
  );
  const whenText = when ? (
    <ThemedText type="smallBold" style={styles.dark}>
      {when}
    </ThemedText>
  ) : null;

  if (variant === 'tile') {
    return (
      <View style={[styles.tile, { backgroundColor: tint }]}>
        {badge}
        <View style={styles.tileText}>
          {title}
          {kind}
        </View>
        {whenText}
      </View>
    );
  }

  return (
    <View style={[styles.wide, { backgroundColor: tint }]}>
      {badge}
      <View style={styles.wideText}>
        {title}
        {kind}
      </View>
      {whenText}
    </View>
  );
}

// Pastel cards stay light in both themes, so their text is fixed dark rather than themed.
const styles = StyleSheet.create({
  badge: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(255,255,255,0.65)',
  },
  tile: { flex: 1, minHeight: 156, borderRadius: 24, padding: Spacing.three, gap: Spacing.two },
  tileText: { flex: 1, justifyContent: 'flex-end' },
  wide: { flexDirection: 'row', alignItems: 'center', gap: Spacing.three, borderRadius: 22, padding: Spacing.three },
  wideText: { flex: 1 },
  title: { fontSize: 16, fontWeight: '600', lineHeight: 22, color: '#2A211B' },
  muted: { color: '#5B534D' },
  dark: { color: '#2A211B' },
});
