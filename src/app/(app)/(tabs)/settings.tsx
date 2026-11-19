import { ScrollView, StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { SymbolIcon } from '@/components/ui/symbol-icon';
import { Button } from '@/components/ui/button';
import { Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';
import { useSession, type AuthMethod } from '@/providers/session';

const METHOD: Record<AuthMethod, string> = { apple: 'Apple', google: 'Google', email: 'Email' };

/** Settings tab: who is signed in, and sign out. */
export default function SettingsScreen() {
  const theme = useTheme();
  const { session, signOut } = useSession();

  const rows: { label: string; value: string; ios: string; material: string }[] = [
    { label: 'Name', value: session?.ownerName ?? '', ios: 'person', material: 'person' },
    { label: 'Email', value: session?.email ?? '', ios: 'envelope', material: 'mail' },
    { label: 'Signed in with', value: session ? METHOD[session.method] : '', ios: 'key', material: 'key' },
  ];

  return (
    <ThemedView style={styles.root}>
      <SafeAreaView style={styles.root} edges={['top']}>
        <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
          <View style={styles.content}>
            <ThemedText type="subtitle">Settings</ThemedText>

            <View style={styles.section}>
              <ThemedText type="smallBold" themeColor="textSecondary" style={styles.sectionTitle}>
                Account
              </ThemedText>
              <View>
                {rows.map(({ label, value, ios, material }, index) => (
                  <View
                    key={label}
                    style={[styles.row, index > 0 && { borderTopWidth: StyleSheet.hairlineWidth, borderTopColor: theme.border }]}>
                    <SymbolIcon ios={ios} material={material} color={theme.textSecondary} size={20} />
                    <ThemedText themeColor="textSecondary" style={styles.label}>
                      {label}
                    </ThemedText>
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
  sectionTitle: { fontSize: 14 },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: Spacing.three,
    minHeight: 52,
  },
  label: { flex: 1 },
  value: { fontSize: 16, flexShrink: 1, textAlign: 'right', maxWidth: '60%' },
});
