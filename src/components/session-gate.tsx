import { ActivityIndicator, StyleSheet, View } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { Button } from '@/components/ui/button';
import { Colors, Spacing } from '@/constants/theme';
import { useI18n } from '@/i18n';
import { isSupabaseConfigured } from '@/lib/supabase';
import { useSession } from '@/providers/session';

/**
 * Covers the app while the account is not ready: restoring the sign-in, a failed load, or a missing setup.
 * It lies over the navigator (rather than replacing it) so the navigator keeps its state.
 */
export function SessionGate() {
  const { status, reload, signOut } = useSession();
  const { t } = useI18n();

  if (isSupabaseConfigured && status === 'ready') return null;

  return (
    <View style={styles.cover}>
      {!isSupabaseConfigured ? (
        <>
          <ThemedText style={styles.title}>{t('setup.title')}</ThemedText>
          <ThemedText themeColor="textSecondary" style={styles.text}>
            {t('setup.body')}
          </ThemedText>
        </>
      ) : status === 'loading' ? (
        <ActivityIndicator size="large" color={Colors.light.primary} />
      ) : (
        <>
          <ThemedText style={styles.title}>{t('error.title')}</ThemedText>
          <ThemedText themeColor="textSecondary" style={styles.text}>
            {t('error.load')}
          </ThemedText>
          <View style={styles.actions}>
            <Button title={t('error.retry')} onPress={reload} />
            <Button variant="outline" title={t('settings.signOut')} onPress={() => void signOut()} />
          </View>
        </>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  cover: { ...(StyleSheet.absoluteFill as object), backgroundColor: Colors.light.background, alignItems: 'center', justifyContent: 'center', padding: Spacing.four, gap: Spacing.three },
  title: { fontSize: 24, lineHeight: 30, fontWeight: '700', textAlign: 'center' },
  text: { textAlign: 'center', maxWidth: 360 },
  actions: { alignSelf: 'stretch', gap: 10 },
});
