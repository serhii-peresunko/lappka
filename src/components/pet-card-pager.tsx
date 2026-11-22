import { useState } from 'react';
import { ScrollView, StyleSheet, View, useWindowDimensions, type NativeScrollEvent, type NativeSyntheticEvent } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { AddCardTile } from '@/components/add-card-tile';
import { compactCardHeight, PetIdCardCompact } from '@/components/pet-id-card-compact';
import { Spacing } from '@/constants/theme';
import { useI18n } from '@/i18n';

const GAP = 12;
const PEEK = 0; // how much of the next card shows at the right edge, hinting that the row scrolls

/**
 * The pet's cards in a row: the pet card, then a dashed "add a pet" tile peeking in from the right.
 * Swipe sideways to move between them; the row snaps to each card.
 */
export function PetCardPager() {
  const { t } = useI18n();
  const { width } = useWindowDimensions();
  const [page, setPage] = useState(0);

  const cardWidth = width - Spacing.four * 2 - PEEK;
  const cardHeight = compactCardHeight(cardWidth);
  const step = cardWidth + GAP;
  const pages = 2;

  const onScroll = (event: NativeSyntheticEvent<NativeScrollEvent>) => {
    setPage(Math.min(pages - 1, Math.max(0, Math.round(event.nativeEvent.contentOffset.x / step))));
  };

  return (
    <View style={styles.wrap}>
      <ThemedText style={styles.title}>{t('home.pets')}</ThemedText>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        decelerationRate="fast"
        snapToInterval={step}
        snapToAlignment="start"
        onScroll={onScroll}
        scrollEventThrottle={16}
        style={styles.scroll}
        contentContainerStyle={styles.row}>
        <PetIdCardCompact width={cardWidth} />
        <AddCardTile width={cardWidth} height={cardHeight} />
      </ScrollView>
      <View style={styles.dots}>
        {Array.from({ length: pages }, (_, index) => (
          <View key={index} style={[styles.dot, index === page && styles.dotActive]} />
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  // Cancels the page's side padding so the row can run to the screen edges.
  // The extra top margin and the slimmer bottom padding make the space above the card (to the owner) and below it
  // (past the dots, to the next title) look equal.
  wrap: { marginHorizontal: -Spacing.four, marginTop: 14, marginBottom: 0, gap: Spacing.three },
  // Lines up with the page's side padding (the row itself runs to the screen edges).
  // Lines up with the page's side padding (the row itself runs to the screen edges).
  title: { paddingHorizontal: Spacing.four, fontSize: 20, fontWeight: '600' },
  scroll: { flexGrow: 0, overflow: 'visible' },
  // Room above and below for the card's shadow.
  row: { paddingHorizontal: Spacing.four, paddingTop: Spacing.two, paddingBottom: Spacing.two, gap: GAP, alignItems: 'flex-start' },
  dots: { flexDirection: 'row', justifyContent: 'center', gap: 6 },
  dot: { width: 6, height: 6, borderRadius: 3, backgroundColor: '#D0D0D2' },
  dotActive: { width: 18, backgroundColor: '#111111' },
});
