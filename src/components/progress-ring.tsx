import { StyleSheet, View } from 'react-native';
import Svg, { Circle } from 'react-native-svg';

import { ThemedText } from '@/components/themed-text';
import { Colors } from '@/constants/theme';

/** A small ring that fills in yellow, with a short label in the middle. */
export function ProgressRing({ value, label, size = 48 }: { value: number; label: string; size?: number }) {
  const stroke = 4;
  const radius = (size - stroke) / 2;
  const around = 2 * Math.PI * radius;
  const share = Math.min(1, Math.max(0, value));
  return (
    <View style={[styles.box, { width: size, height: size, borderRadius: size / 2 }]}>
      <Svg width={size} height={size} style={StyleSheet.absoluteFill}>
        <Circle cx={size / 2} cy={size / 2} r={radius} stroke={Colors.light.backgroundSelected} strokeWidth={stroke} fill="none" />
        {share > 0 ? (
          <Circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            stroke={Colors.light.primary}
            strokeWidth={stroke}
            strokeDasharray={`${around * share} ${around}`}
            strokeLinecap="round"
            fill="none"
            transform={`rotate(-90 ${size / 2} ${size / 2})`}
          />
        ) : null}
      </Svg>
      <ThemedText style={styles.label}>{label}</ThemedText>
    </View>
  );
}

const styles = StyleSheet.create({
  box: { alignItems: 'center', justifyContent: 'center', backgroundColor: Colors.light.surface },
  label: { fontSize: 12, lineHeight: 16, fontWeight: '600', fontVariant: ['tabular-nums'] },
});
