import { StyleSheet, View } from 'react-native';

import { SymbolIcon } from '@/components/ui/symbol-icon';
import { useTheme } from '@/hooks/use-theme';
import type { Achievement } from '@/lib/achievements';

type AchievementBadgeProps = {
  achievement: Achievement;
  unlocked: boolean;
  size?: number;
  /** On a dark photo: a light badge with a dark icon, whatever the achievement's own color. */
  onDark?: boolean;
};

/** A round badge: the achievement's color and icon when unlocked, a grey lock when not. */
export function AchievementBadge({ achievement, unlocked, size = 44, onDark }: AchievementBadgeProps) {
  const theme = useTheme();
  return (
    <View
      style={[
        styles.badge,
        {
          width: size,
          height: size,
          borderRadius: size / 2,
          backgroundColor: onDark ? 'rgba(255,255,255,0.88)' : unlocked ? `${achievement.color}2E` : theme.backgroundSelected,
        },
      ]}>
      {unlocked ? (
        <SymbolIcon {...achievement.icon} color={onDark ? '#1A1A1A' : achievement.color} size={size * 0.46} />
      ) : (
        <SymbolIcon ios="lock.fill" material="lock" color={theme.textSecondary} size={size * 0.4} />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  badge: { alignItems: 'center', justifyContent: 'center' },
});
