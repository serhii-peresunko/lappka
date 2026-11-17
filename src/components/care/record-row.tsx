import { useRouter } from 'expo-router';
import { SymbolView } from 'expo-symbols';
import { Pressable, StyleSheet, View } from 'react-native';

import { CategoryIcon } from '@/components/care/category-icon';
import { ThemedText } from '@/components/themed-text';
import type { CareRecord } from '@/data/care';
import { CardShadow, Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';
import { useI18n } from '@/i18n/i18n-provider';
import { today } from '@/lib/dates';
import { useCare } from '@/providers/care-provider';

type RecordRowProps = {
  record: CareRecord;
  /** Hide the date when the list is already grouped by day. */
  showDate?: boolean;
};

export function RecordRow({ record, showDate = true }: RecordRowProps) {
  const theme = useTheme();
  const router = useRouter();
  const { toggleDone } = useCare();
  const { t, formatRelative } = useI18n();

  const label = t.categories[record.category].label;
  const overdue = !record.done && record.date < today();
  const subtitle = [label, record.details].filter(Boolean).join(' · ');

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={`${record.title}, ${label}, ${formatRelative(record.date)}`}
      onPress={() => router.push({ pathname: '/record', params: { id: record.id } })}
      style={({ pressed }) => [
        styles.row,
        CardShadow, { backgroundColor: theme.backgroundElement },
        pressed && styles.pressed,
      ]}>
      <CategoryIcon category={record.category} />
      <View style={styles.text}>
        <ThemedText
          type="smallBold"
          numberOfLines={1}
          style={[styles.title, record.done && styles.doneTitle]}
          themeColor={record.done ? 'textSecondary' : 'text'}>
          {record.title}
        </ThemedText>
        <ThemedText type="small" themeColor="textSecondary" numberOfLines={1}>
          {subtitle}
        </ThemedText>
        {showDate ? (
          <ThemedText
            type="small"
            style={{ color: overdue ? theme.danger : theme.textSecondary, fontWeight: overdue ? 700 : 500 }}>
            {overdue ? t.recordRow.overdue(formatRelative(record.date)) : formatRelative(record.date)}
          </ThemedText>
        ) : null}
      </View>
      <Pressable
        accessibilityRole="checkbox"
        accessibilityState={{ checked: record.done }}
        accessibilityLabel={record.done ? t.recordRow.markNotDone : t.recordRow.markDone}
        hitSlop={10}
        onPress={() => toggleDone(record.id)}
        style={styles.check}>
        <SymbolView
          name={
            record.done
              ? { ios: 'checkmark.circle.fill', android: 'check_circle', web: 'check_circle' }
              : { ios: 'circle', android: 'radio_button_unchecked', web: 'radio_button_unchecked' }
          }
          tintColor={record.done ? theme.primary : theme.textSecondary}
          size={26}
        />
      </Pressable>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.three,
    padding: Spacing.three,
    borderRadius: 16,
  },
  pressed: {
    opacity: 0.75,
  },
  text: {
    flex: 1,
    gap: 2,
  },
  title: {
    fontSize: 16,
  },
  doneTitle: {
    textDecorationLine: 'line-through',
  },
  check: {
    padding: Spacing.one,
  },
});
