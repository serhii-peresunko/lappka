import { StyleSheet, View, useWindowDimensions } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { PetIdCardCompact } from '@/components/pet-id-card-compact';
import { Spacing } from '@/constants/theme';
import { useI18n } from '@/i18n';

/** The "Your pets" block: a title and the pet's card (the app holds a single pet for now). */
export function PetCardPager() {
  const { t } = useI18n();
  const { width } = useWindowDimensions();
  const cardWidth = width - Spacing.four * 2;

  return (
    <View style={styles.wrap}>
      <ThemedText style={styles.title}>{t('home.pets')}</ThemedText>
      {/* Room above and below the card for its shadow. */}
      <View style={styles.cardBox}>
        <PetIdCardCompact width={cardWidth} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { gap: Spacing.three },
  title: { fontSize: 20, fontWeight: '600' },
  cardBox: { paddingVertical: Spacing.two },
});
