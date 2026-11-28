import { useRouter } from 'expo-router';
import { useRef, useState, type ComponentRef } from 'react';
import { Alert, Modal, Pressable, StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { ThemedText } from '@/components/themed-text';
import { SymbolIcon } from '@/components/ui/symbol-icon';
import { Colors } from '@/constants/theme';
import { useTask } from '@/hooks/use-task';
import { useI18n } from '@/i18n';
import { useSession } from '@/providers/session';

/**
 * A grey settings icon; a tap opens a small menu: settings, add a co-owner, delete the pet.
 * The menu is a plain modal, so it looks and works the same on iOS and Android.
 */
export function PetMenuButton() {
  const { t } = useI18n();
  const router = useRouter();
  const { removePet } = useSession();
  const { run } = useTask();
  const insets = useSafeAreaInsets();
  const [open, setOpen] = useState(false);
  const iconRef = useRef<ComponentRef<typeof Pressable>>(null);
  const [top, setTop] = useState(0);

  const close = () => setOpen(false);

  const items = [
    {
      key: 'settings',
      label: t('petMenu.settings'),
      ios: 'gearshape',
      material: 'settings',
      danger: false,
      run: () => router.push('/profile'),
    },
    {
      key: 'coOwner',
      label: t('petMenu.addCoOwner'),
      ios: 'person.badge.plus',
      material: 'person_add',
      danger: false,
      run: () => Alert.alert(t('petMenu.addCoOwner'), t('petMenu.coOwnerSoon'), [{ text: t('petMenu.ok') }]),
    },
    {
      key: 'delete',
      label: t('petMenu.delete'),
      ios: 'trash',
      material: 'delete',
      danger: true,
      run: () =>
        Alert.alert(t('petMenu.deleteTitle'), t('petMenu.deleteMessage'), [
          { text: t('petMenu.cancel'), style: 'cancel' },
          { text: t('petMenu.delete'), style: 'destructive', onPress: () => void run(removePet) },
        ]),
    },
  ];

  return (
    <>
      <Pressable
        accessibilityRole="button"
        accessibilityLabel={t('petMenu.settings')}
        hitSlop={14}
        ref={iconRef}
        onPress={() => {
          // Open the menu just under the icon, flush with the page's right edge.
          iconRef.current?.measureInWindow((_x, y, _w, h) => {
            setTop(y + h + 6);
            setOpen(true);
          });
        }}
        style={styles.icon}>
        <SymbolIcon ios="ellipsis" material="more_horiz" color={Colors.light.text} size={17} />
      </Pressable>

      <Modal visible={open} transparent animationType="fade" onRequestClose={close}>
        <Pressable style={styles.backdrop} onPress={close} accessibilityLabel={t('petMenu.cancel')}>
          <View style={[styles.menu, { top: Math.max(top, insets.top + 8), right: 16 }]}>
            {items.map((item, index) => (
              <Pressable
                key={item.key}
                accessibilityRole="button"
                onPress={() => {
                  close();
                  // Let the menu close first, so an alert is not blocked by the closing modal.
                  setTimeout(item.run, 250);
                }}
                style={({ pressed }) => [
                  styles.row,
                  index > 0 && styles.rowBorder,
                  pressed && { backgroundColor: 'rgba(0,0,0,0.04)' },
                ]}>
                <SymbolIcon ios={item.ios} material={item.material} color={item.danger ? Colors.light.danger : Colors.light.primary} size={18} />
                <ThemedText style={[styles.label, item.danger && { color: Colors.light.danger }]}>{item.label}</ThemedText>
              </Pressable>
            ))}
          </View>
        </Pressable>
      </Modal>
    </>
  );
}

const styles = StyleSheet.create({
  // A round white button, readable over any photo.
  icon: { width: 32, height: 32, borderRadius: 16, backgroundColor: 'transparent', alignItems: 'center', justifyContent: 'center' },
  backdrop: { flex: 1, backgroundColor: 'rgba(0,0,0,0.12)' },
  menu: {
    position: 'absolute',
    minWidth: 230,
    borderRadius: 8,
    backgroundColor: '#FFFFFF',
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOpacity: 0.18,
    shadowRadius: 24,
    shadowOffset: { width: 0, height: 10 },
    elevation: 8,
  },
  row: { flexDirection: 'row', alignItems: 'center', gap: 12, paddingHorizontal: 16, height: 50 },
  rowBorder: { borderTopWidth: StyleSheet.hairlineWidth, borderTopColor: 'rgba(0,0,0,0.12)' },
  label: { fontSize: 15, lineHeight: 20, fontWeight: '500' },
});
