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
          borderRadius: 14,
          backgroundColor: onDark ? 'rgba(255,255,255,0.88)' : unlocked ? theme.accent : theme.raised,
        },
      ]}>
      {unlocked ? (
        <SymbolIcon {...achievement.icon} color={theme.text} size={size * 0.48} />
      ) : (
        <SymbolIcon ios="lock.fill" material="lock" color={theme.textTertiary} size={size * 0.42} />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  badge: { alignItems: 'center', justifyContent: 'center' },
});
