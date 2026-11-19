import { useRouter } from 'expo-router';
import { StyleSheet, View } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { AchievementBadge } from '@/components/ui/achievement-badge';
import { FormScreen } from '@/components/ui/form-screen';
import { Spacing } from '@/constants/theme';
import { useAchievements } from '@/hooks/use-achievements';
import { useTheme } from '@/hooks/use-theme';
import { useI18n } from '@/i18n';
import type { StringKey } from '@/i18n/en';

/** All achievements as a two-column grid: unlocked ones in color, locked ones greyed with progress. */
export default function AchievementsScreen() {
  const theme = useTheme();
  const router = useRouter();
  const { t } = useI18n();
  const { list, unlockedCount } = useAchievements();

  const pairs = Array.from({ length: Math.ceil(list.length / 2) }, (_, i) => list.slice(i * 2, i * 2 + 2));

  return (
    <FormScreen
      title={t('achievements.title')}
      subtitle={t('achievements.progress', { n: unlockedCount, total: list.length })}
      onBack={() => router.back()}>
      <View style={[styles.track, { backgroundColor: theme.backgroundSelected }]}>
        <View style={[styles.fill, { width: `${(unlockedCount / list.length) * 100}%`, backgroundColor: theme.text }]} />
      </View>

      <View style={styles.grid}>
        {pairs.map((pair, index) => (
          <View key={index} style={styles.pair}>
            {pair.map((item) => (
              <View
                key={item.id}
                style={[
                  styles.tile,
                  { backgroundColor: item.unlocked ? `${item.color}26` : theme.backgroundElement },
                ]}>
                <AchievementBadge achievement={item} unlocked={item.unlocked} size={48} />
                <View style={styles.text}>
                  <ThemedText style={[styles.title, !item.unlocked && { color: theme.textSecondary }]}>
                    {t(`ach.${item.id}.title` as StringKey)}
                  </ThemedText>
                  <ThemedText type="small" themeColor="textSecondary">
                    {t(`ach.${item.id}.desc` as StringKey)}
                  </ThemedText>
                </View>
                {item.unlocked ? (
                  <ThemedText type="smallBold" style={{ color: item.color }}>
                    {t('achievements.unlocked')}
                  </ThemedText>
                ) : (
                  <View style={styles.progress}>
                    <View style={[styles.progressTrack, { backgroundColor: theme.backgroundSelected }]}>
                      <View
                        style={[
                          styles.progressFill,
                          { width: `${(item.current / item.target) * 100}%`, backgroundColor: theme.textSecondary },
                        ]}
                      />
                    </View>
                    <ThemedText type="small" themeColor="textSecondary">
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
  track: { height: 8, borderRadius: 4, overflow: 'hidden' },
  fill: { height: 8, borderRadius: 4 },
  grid: { gap: Spacing.three },
  pair: { flexDirection: 'row', gap: Spacing.three },
  tile: { flex: 1, minHeight: 190, borderRadius: 24, padding: Spacing.three, gap: Spacing.two },
  text: { flex: 1, gap: 2 },
  title: { fontSize: 16, fontWeight: '600', lineHeight: 22 },
  progress: { gap: 4 },
  progressTrack: { height: 6, borderRadius: 3, overflow: 'hidden' },
  progressFill: { height: 6, borderRadius: 3 },
});
