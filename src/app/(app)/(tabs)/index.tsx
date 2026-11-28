import { useRouter } from 'expo-router';
import { ScrollView, StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { NextEvents } from '@/components/next-events';
import { PetCardPager } from '@/components/pet-card-pager';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { IconButton } from '@/components/ui/icon-button';
import { Colors, Spacing, TAB_BAR_SPACE } from '@/constants/theme';
import { useI18n } from '@/i18n';
import { useSession } from '@/providers/session';

/** The home tab, as in the wireframe: the owner and settings, "Your pets" with the card, and the next events in a row. */
export default function HomeScreen() {
  const { t } = useI18n();
  const router = useRouter();
  const { session } = useSession();

  return (
    <ThemedView style={styles.root}>
      <SafeAreaView style={styles.root} edges={['top']}>
        {/* Fits a normal phone without scrolling; the scroll is only there for small screens and large text. */}
        <ScrollView alwaysBounceVertical={false} showsVerticalScrollIndicator={false} contentContainerStyle={styles.scroll}>
          <View style={styles.content}>
            <View style={styles.header}>
              <View style={styles.avatar}>
                <ThemedText style={styles.avatarText}>{(session?.ownerName ?? '').trim().charAt(0).toUpperCase()}</ThemedText>
              </View>
              <View style={styles.owner}>
                <ThemedText style={styles.ownerName} numberOfLines={1}>
                  {session?.ownerName ?? ''}
                </ThemedText>
                <ThemedText style={styles.ownerEmail} numberOfLines={1}>
                  {session?.email ?? ''}
                </ThemedText>
              </View>
              <IconButton label={t('settings.title')} icon={{ ios: 'slider.horizontal.3', material: 'tune' }} size={48} onPress={() => router.push('/profile')} />
            </View>

            <View style={styles.section}>
              <ThemedText style={styles.sectionTitle}>{t('home.pets')}</ThemedText>
              <PetCardPager />
            </View>

            <View style={styles.section}>
              <ThemedText style={styles.sectionTitle}>{t('home.nextEvents')}</ThemedText>
              <NextEvents />
            </View>
          </View>
        </ScrollView>
      </SafeAreaView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  scroll: { flexGrow: 1, paddingHorizontal: Spacing.three, paddingBottom: TAB_BAR_SPACE },
  content: { width: '100%', maxWidth: 460, alignSelf: 'center', gap: 48 },
  header: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  avatar: { width: 48, height: 48, borderRadius: 24, backgroundColor: Colors.light.primary, alignItems: 'center', justifyContent: 'center' },
  avatarText: { color: Colors.light.onPrimary, fontSize: 20, lineHeight: 26, fontWeight: '500' },
  owner: { flex: 1, justifyContent: 'center' },
  ownerName: { fontSize: 24, lineHeight: 29, fontWeight: '400' },
  ownerEmail: { color: Colors.light.textSecondary, fontSize: 11, lineHeight: 14, fontWeight: '400' },
  section: { gap: 14 },
  sectionTitle: { fontSize: 28, lineHeight: 34, fontWeight: '500', paddingLeft: 2 },
});
