import { useRouter } from 'expo-router';
import { StyleSheet, View } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { AchievementBadge } from '@/components/ui/achievement-badge';
import { FormScreen } from '@/components/ui/form-screen';
import { SymbolIcon } from '@/components/ui/symbol-icon';
import { Colors } from '@/constants/theme';
import { useAchievements } from '@/hooks/use-achievements';
import { useI18n } from '@/i18n';
import type { StringKey } from '@/i18n/en';

/** All achievements: a summary card, then a two-column grid (unlocked in color, locked with progress). */
export default function AchievementsScreen() {
  const router = useRouter();
  const { t } = useI18n();
  const { list, unlockedCount } = useAchievements();

  const sorted = [...list].sort((a, b) => Number(b.unlocked) - Number(a.unlocked) || b.current / b.target - a.current / a.target);
  const pairs = Array.from({ length: Math.ceil(sorted.length / 2) }, (_, i) => sorted.slice(i * 2, i * 2 + 2));

  return (
    <FormScreen title={t('achievements.title')} onBack={() => router.back()}>
      <View style={styles.summary}>
        <View style={styles.summaryHead}>
          <ThemedText style={styles.summaryText}>{t('achievements.progress', { n: unlockedCount, total: list.length })}</ThemedText>
          <View style={styles.trophy}>
            <SymbolIcon ios="trophy.fill" material="emoji_events" color={Colors.light.text} size={24} />
          </View>
        </View>
        <View style={styles.summaryTrack}>
          <View style={[styles.summaryFill, { width: `${(unlockedCount / Math.max(1, list.length)) * 100}%` }]} />
        </View>
      </View>

      <View style={styles.grid}>
        {pairs.map((pair, index) => (
          <View key={index} style={styles.pair}>
            {pair.map((item) => (
              <View key={item.id} style={styles.tile}>
                <AchievementBadge achievement={item} unlocked={item.unlocked} size={52} />
                <View style={styles.text}>
                  <ThemedText style={styles.title}>{t(`ach.${item.id}.title` as StringKey)}</ThemedText>
                  <ThemedText type="small" themeColor="textSecondary">
                    {t(`ach.${item.id}.desc` as StringKey)}
                  </ThemedText>
                </View>
                {item.unlocked ? (
                  <View style={styles.done}>
                    <SymbolIcon ios="checkmark" material="check" color={Colors.light.text} size={11} />
                    <ThemedText style={styles.doneText}>{t('achievements.unlocked')}</ThemedText>
                  </View>
                ) : (
                  <View style={styles.progress}>
                    <View style={styles.track}>
                      <View style={[styles.fill, { width: `${(item.current / item.target) * 100}%`, backgroundColor: item.color }]} />
                    </View>
                    <ThemedText style={styles.count}>
                      {item.current}/{item.target}
                    </ThemedText>
                  </View>
                )}
              </View>
            ))}
          </View>
        ))}
      </View>
    </FormScreen>
  );
}

const styles = StyleSheet.create({
  summary: { borderRadius: 20, padding: 18, gap: 14, backgroundColor: Colors.light.hero },
  summaryHead: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: 12 },
  summaryText: { flex: 1, color: Colors.light.text, fontSize: 20, lineHeight: 26, fontWeight: '700' },
  trophy: { width: 48, height: 48, borderRadius: 14, backgroundColor: '#FFFFFF', alignItems: 'center', justifyContent: 'center' },
  summaryTrack: { height: 6, borderRadius: 3, backgroundColor: '#FFFFFF', overflow: 'hidden' },
  summaryFill: { height: 6, borderRadius: 3, backgroundColor: Colors.light.text },
  grid: { gap: 12 },
  pair: { flexDirection: 'row', gap: 12 },
  tile: { flex: 1, minHeight: 168, borderRadius: 20, padding: 14, gap: 10, backgroundColor: Colors.light.surface },
  text: { flex: 1, gap: 2 },
  title: { fontSize: 16, fontWeight: '700', lineHeight: 21, letterSpacing: -0.2 },
  done: { alignSelf: 'flex-start', flexDirection: 'row', alignItems: 'center', gap: 5, height: 28, paddingHorizontal: 10, borderRadius: 999, backgroundColor: Colors.light.accent },
  doneText: { color: Colors.light.text, fontSize: 12, lineHeight: 16, fontWeight: '700' },
  progress: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  track: { flex: 1, height: 6, borderRadius: 3, overflow: 'hidden', backgroundColor: Colors.light.backgroundSelected },
  fill: { height: 6, borderRadius: 3 },
  count: { color: Colors.light.textSecondary, fontSize: 12, lineHeight: 16, fontWeight: '600' },
});
