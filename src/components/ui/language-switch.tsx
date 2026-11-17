import { Pressable, StyleSheet, View } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';
import { useI18n } from '@/i18n/i18n-provider';
import { LANGUAGES } from '@/i18n/translations';

/** Compact EN / УК segmented control. */
export function LanguageSwitch() {
  const theme = useTheme();
  const { language, setLanguage, t } = useI18n();

  return (
    <View
      accessibilityRole="radiogroup"
      accessibilityLabel={t.language.label}
      style={[styles.group, { backgroundColor: theme.backgroundElement, borderColor: theme.border }]}>
      {LANGUAGES.map((code) => {
        const selected = code === language;
        return (
          <Pressable
            key={code}
            accessibilityRole="radio"
            accessibilityState={{ checked: selected }}
            accessibilityLabel={t.language.names[code]}
            onPress={() => setLanguage(code)}
            style={[styles.option, selected && { backgroundColor: theme.primary }]}>
            <ThemedText
              type="smallBold"
              style={{ color: selected ? theme.onPrimary : theme.textSecondary }}>
              {t.language.short[code]}
            </ThemedText>
          </Pressable>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  group: {
    flexDirection: 'row',
    borderRadius: 999,
    borderWidth: 1,
    padding: 3,
    gap: 2,
    alignSelf: 'flex-start',
  },
  option: {
    paddingHorizontal: Spacing.three - Spacing.one,
    paddingVertical: Spacing.one,
    borderRadius: 999,
    minWidth: 44,
    alignItems: 'center',
  },
});
