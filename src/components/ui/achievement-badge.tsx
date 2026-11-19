import { StyleSheet, View } from 'react-native';

import { SymbolIcon } from '@/components/ui/symbol-icon';
import { useTheme } from '@/hooks/use-theme';
import type { Achievement } from '@/lib/achievements';

type AchievementBadgeProps = {
  achievement: Achievement;
  unlocked: boolean;
  size?: number;
};

/** A round badge: the achievement's color and icon when unlocked, a grey lock when not. */
export function AchievementBadge({ achievement, unlocked, size = 44 }: AchievementBadgeProps) {
  const theme = useTheme();
  return (
    <View
      style={[
        styles.badge,
        {
          width: size,
          height: size,
          borderRadius: size / 2,
          backgroundColor: unlocked ? `${achievement.color}2E` : theme.backgroundSelected,
        },
      ]}>
      {unlocked ? (
        <SymbolIcon {...achievement.icon} color={achievement.color} size={size * 0.46} />
      ) : (
        <SymbolIcon ios="lock.fill" material="lock" color={theme.textSecondary} size={size * 0.4} />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  badge: { alignItems: 'center', justifyContent: 'center' },
});
