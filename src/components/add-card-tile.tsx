import { StyleSheet, View } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { SymbolIcon } from '@/components/ui/symbol-icon';
import { useI18n } from '@/i18n';

/** A dashed placeholder next to the pet card: it shows that one more pet can be added. */
export function AddCardTile({ width, height, mini }: { width: number; height: number; mini?: boolean }) {
  const { t } = useI18n();
  return (
    <View accessibilityLabel={t('card.add')} style={[styles.tile, { width, height }]}>
      <View style={styles.plus}>
        <SymbolIcon ios="plus" material="add" color="#111111" size={22} />
      </View>
      {mini ? null : <ThemedText style={styles.label}>{t('card.add')}</ThemedText>}
    </View>
  );
}

const styles = StyleSheet.create({
  tile: {
    borderRadius: 10,
    borderWidth: 1.5,
    borderStyle: 'dashed',
    borderColor: '#C9C9CC',
    backgroundColor: 'rgba(255,255,255,0.5)',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
  },
  plus: { width: 44, height: 44, borderRadius: 22, backgroundColor: '#FFFFFF', alignItems: 'center', justifyContent: 'center', borderWidth: StyleSheet.hairlineWidth, borderColor: '#D8D8DA' },
  label: { color: '#6B6B6B', fontSize: 13, lineHeight: 17, fontWeight: '500' },
});
