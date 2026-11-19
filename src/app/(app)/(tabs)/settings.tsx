import { ScrollView, StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { Button } from '@/components/ui/button';
import { Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';
import { useSession, type AuthMethod } from '@/providers/session';

const METHOD: Record<AuthMethod, string> = { apple: 'Apple', google: 'Google', email: 'Email' };

/** Settings tab: who is signed in, and sign out. */
export default function SettingsScreen() {
  const theme = useTheme();
  const { session, signOut } = useSession();

  const rows: [string, string][] = [
    ['Name', session?.ownerName ?? ''],
    ['Email', session?.email ?? ''],
    ['Signed in with', session ? METHOD[session.method] : ''],
  ];

  return (
    <ThemedView style={styles.root}>
      <SafeAreaView style={styles.root} edges={['top']}>
        <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
          <View style={styles.content}>
            <ThemedText type="subtitle">Settings</ThemedText>

            <View style={styles.section}>
              <ThemedText type="smallBold" style={styles.sectionTitle}>
                Account
              </ThemedText>
              <View style={[styles.card, { backgroundColor: theme.backgroundElement, borderColor: theme.border }]}>
                {rows.map(([label, value], index) => (
                  <View
                    key={label}
                    style={[styles.row, index > 0 && { borderTopWidth: 1, borderTopColor: theme.border }]}>
                    <ThemedText themeColor="textSecondary">{label}</ThemedText>
                    <ThemedText type="smallBold" style={styles.value} numberOfLines={1}>
                      {value}
                    </ThemedText>
                  </View>
                ))}
              </View>
            </View>

            <Button variant="outline" title="Sign out" onPress={signOut} />
          </View>
        </ScrollView>
      </SafeAreaView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  scroll: { flexGrow: 1, paddingHorizontal: Spacing.four, paddingVertical: Spacing.four },
  content: { width: '100%', maxWidth: 460, alignSelf: 'center', gap: Spacing.four },
  section: { gap: Spacing.two },
  sectionTitle: { fontSize: 17 },
  card: { borderWidth: 1, borderRadius: 16, overflow: 'hidden' },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: Spacing.three,
    minHeight: 52,
    paddingHorizontal: Spacing.three,
  },
  value: { fontSize: 16, flexShrink: 1, textAlign: 'right' },
});
