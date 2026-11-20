import { LinearGradient } from 'expo-linear-gradient';
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
  /** The card to draw the eye to (the next event): a soft glow, a light sheen and a small label. */
  highlightLabel?: string;
};

/** An event as a soft pastel card tinted with its kind's color. */
export function EventCard({ event, when, variant = 'wide', highlightLabel }: EventCardProps) {
  const { t } = useI18n();
  const color = KIND_COLORS[event.kind];
  const tint = `${color}33`;

  const badge = (
    <View style={styles.badge}>
      <SymbolIcon {...KIND_ICONS[event.kind]} color={color} size={18} />
    </View>
  );
  const title = <ThemedText style={styles.title} numberOfLines={2}>{t(kindKey(event.kind))}</ThemedText>;
  const kind = event.description ? (
    <ThemedText type="small" style={styles.muted} numberOfLines={2}>
      {event.description}
    </ThemedText>
  ) : null;
  const whenText = when ? (
    <ThemedText type="smallBold" style={styles.dark}>
      {when}
    </ThemedText>
  ) : null;

  if (variant === 'tile') {
    return (
      <View style={[styles.tile, { backgroundColor: tint }, highlightLabel ? styles.glow : null]}>
        {highlightLabel ? (
          <>
            <LinearGradient
              colors={['rgba(255,255,255,0.75)', 'rgba(255,255,255,0)']}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={styles.sheen}
              pointerEvents="none"
            />
            <View style={styles.pill}>
              <ThemedText type="small" style={styles.pillText}>
                {highlightLabel}
              </ThemedText>
            </View>
          </>
        ) : null}
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
  // Soft light around the highlighted card, as if it were gently lit from behind.
  glow: {
    shadowColor: '#000',
    shadowOpacity: 0.16,
    shadowRadius: 16,
    shadowOffset: { width: 0, height: 6 },
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.9)',
  },
  sheen: { ...(StyleSheet.absoluteFill as object), borderRadius: 24 },
  pill: {
    position: 'absolute',
    top: 14,
    right: 14,
    paddingHorizontal: 10,
    paddingVertical: 3,
    borderRadius: 12,
    backgroundColor: '#1A1A1A',
  },
  pillText: { color: '#fff', fontSize: 12, lineHeight: 16 },
  tile: { flex: 1, minHeight: 156, borderRadius: 24, padding: Spacing.three, gap: Spacing.two },
  tileText: { flex: 1, justifyContent: 'flex-end' },
  wide: { flexDirection: 'row', alignItems: 'center', gap: Spacing.three, borderRadius: 22, padding: Spacing.three },
  wideText: { flex: 1 },
  title: { fontSize: 16, fontWeight: '600', lineHeight: 22, color: '#1A1A1A' },
  muted: { color: '#555555' },
  dark: { color: '#1A1A1A' },
});
