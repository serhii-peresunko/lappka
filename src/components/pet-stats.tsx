import { useRouter } from 'expo-router';
import { Pressable, StyleSheet, View } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { SymbolIcon } from '@/components/ui/symbol-icon';
import { Colors } from '@/constants/theme';
import { useEventActions } from '@/hooks/use-event-actions';
import { useAchievements } from '@/hooks/use-achievements';
import { useI18n } from '@/i18n';
import { isoToInput } from '@/lib/dates';
import { KIND_ICONS } from '@/lib/event-kinds';
import { lastVaccination } from '@/lib/repeat';
import { useSession } from '@/providers/session';

export const STATS_HEIGHT = 64;

/** The bottom of the pet card, in two halves: the last vaccination, and the way into the achievements. */
export function PetStats() {
  const { t } = useI18n();
  const router = useRouter();
  const { events } = useSession();
  const { list, unlockedCount } = useAchievements();
  const openEvent = useEventActions();
  const vaccine = lastVaccination(events);

  return (
    <View style={styles.row}>
      <Pressable
        accessibilityRole="button"
        accessibilityLabel={`${t('petId.lastVaccine')}: ${vaccine ? isoToInput(vaccine.date) : t('petId.addVaccine')}`}
        onPress={() => (vaccine ? openEvent(vaccine) : router.push({ pathname: '/add-event', params: { kind: 'vaccine' } }))}
        style={({ pressed }) => [styles.half, pressed && { opacity: 0.6 }]}>
        <ThemedText style={styles.label} numberOfLines={1}>
          {t('petId.lastVaccine')}
        </ThemedText>
        <View style={styles.valueRow}>
          <SymbolIcon {...KIND_ICONS.vaccine} color={Colors.light.text} size={15} />
          <ThemedText style={styles.value} numberOfLines={1}>
            {vaccine ? isoToInput(vaccine.date) : t('petId.addVaccine')}
          </ThemedText>
        </View>
      </Pressable>

      <View style={styles.divider} />

      <Pressable
        accessibilityRole="button"
        accessibilityLabel={t('home.seeAchievements')}
        onPress={() => router.push('/achievements')}
        style={({ pressed }) => [styles.half, pressed && { opacity: 0.6 }]}>
        <ThemedText style={styles.label} numberOfLines={1}>
          {t('petId.achievements')}
        </ThemedText>
        <View style={styles.valueRow}>
          <ThemedText style={styles.value}>
            {unlockedCount}/{list.length}
          </ThemedText>
          <View style={styles.track}>
            <View style={[styles.fill, { width: `${(unlockedCount / Math.max(1, list.length)) * 100}%` }]} />
          </View>
          <SymbolIcon ios="chevron.right" material="chevron_right" color={Colors.light.textTertiary} size={11} />
        </View>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', alignItems: 'stretch', height: STATS_HEIGHT, borderTopWidth: 1, borderTopColor: Colors.light.backgroundSelected, backgroundColor: Colors.light.surface },
  half: { flex: 1, justifyContent: 'center', gap: 3 },
  divider: { width: 1, marginVertical: 12, marginHorizontal: 16, backgroundColor: Colors.light.backgroundSelected },
  label: { color: Colors.light.textSecondary, fontSize: 11, lineHeight: 14, fontWeight: '500' },
  valueRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  value: { color: Colors.light.text, fontSize: 15, lineHeight: 20, fontWeight: '700', fontVariant: ['tabular-nums'] },
  track: { flex: 1, height: 4, borderRadius: 2, backgroundColor: Colors.light.backgroundSelected, overflow: 'hidden' },
  fill: { height: 4, borderRadius: 2, backgroundColor: Colors.light.primary },
});
