import { SymbolView } from 'expo-symbols';
import { useState } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import Animated, { useAnimatedStyle, useSharedValue, withSpring } from 'react-native-reanimated';

import { ThemedText } from '@/components/themed-text';
import { Button } from '@/components/ui/button';
import { FormScreen } from '@/components/ui/form-screen';
import { PetArt } from '@/components/ui/pet-art';
import { Spacing } from '@/constants/theme';
import { useI18n } from '@/i18n';
import { useTheme } from '@/hooks/use-theme';
import { useSession, type PetType } from '@/providers/session';

const OPTIONS: PetType[] = ['dog', 'cat'];

/** Step 2: who are we adding? Two big cards; tap one, then continue. */
export default function PetTypeScreen() {
  const { setDraftPetType } = useSession();
  const { t } = useI18n();
  const [selected, setSelected] = useState<PetType | null>(null);

  return (
    <FormScreen
      eyebrow={t('step', { n: 2 })}
      title={t('petType.title')}
      subtitle={t('petType.subtitle')}
      footer={
        <Button
          title={t('continue')}
          disabled={!selected}
          onPress={() => selected && setDraftPetType(selected)}
        />
      }>
      <View style={styles.row}>
        {OPTIONS.map((option) => (
          <PetCard
            key={option}
            type={option}
            label={t(option)}
            selected={selected === option}
            onPress={() => setSelected(option)}
          />
        ))}
      </View>
    </FormScreen>
  );
}

function PetCard({
  type,
  label,
  selected,
  onPress,
}: {
  type: PetType;
  label: string;
  selected: boolean;
  onPress: () => void;
}) {
  const theme = useTheme();
  const scale = useSharedValue(1);
  const animated = useAnimatedStyle(() => ({ transform: [{ scale: scale.get() }] }));

  return (
    <Pressable
      style={styles.cardOuter}
      accessibilityRole="radio"
      accessibilityState={{ checked: selected }}
      accessibilityLabel={label}
      onPressIn={() => scale.set(withSpring(0.97, { damping: 18, stiffness: 320 }))}
      onPressOut={() => scale.set(withSpring(1, { damping: 18, stiffness: 320 }))}
      onPress={onPress}>
      <Animated.View
        style={[
          styles.card,
          {
            borderColor: selected ? theme.primary : theme.border,
            backgroundColor: selected ? theme.primarySoft : theme.backgroundElement,
          },
          animated,
        ]}>
        <View style={[styles.art, { backgroundColor: selected ? theme.background : theme.primarySoft }]}>
          <PetArt type={type} size={104} color={theme.text} accent={theme.primary} bandana strokeWidth={4} />
        </View>
        <ThemedText type="subtitle" style={[styles.label, selected && { color: theme.primaryText }]}>
          {label}
        </ThemedText>
        <View
          style={[
            styles.check,
            selected
              ? { backgroundColor: theme.primary, borderColor: theme.primary }
              : { borderColor: theme.border },
          ]}>
          {selected && (
            <SymbolView
              name={{ ios: 'checkmark', android: 'check', web: 'check' }}
              tintColor={theme.onPrimary}
              size={14}
              weight="bold"
            />
          )}
        </View>
      </Animated.View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    gap: Spacing.three,
  },
  cardOuter: {
    flex: 1,
  },
  card: {
    alignItems: 'center',
    gap: Spacing.three,
    paddingVertical: Spacing.four,
    paddingHorizontal: Spacing.two,
    borderWidth: 2,
    borderRadius: 24,
  },
  art: {
    width: 132,
    height: 132,
    borderRadius: 66,
    alignItems: 'center',
    justifyContent: 'center',
  },
  label: {
    fontSize: 24,
    lineHeight: 30,
    fontWeight: 700,
  },
  check: {
    width: 26,
    height: 26,
    borderRadius: 13,
    borderWidth: 2,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
