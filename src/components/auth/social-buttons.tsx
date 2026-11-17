import { SymbolView } from 'expo-symbols';
import { useState } from 'react';
import { Alert, Platform, StyleSheet, View } from 'react-native';
import Svg, { Path } from 'react-native-svg';

import { ThemedText } from '@/components/themed-text';
import { Button } from '@/components/ui/button';
import { Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';
import { useI18n } from '@/i18n/i18n-provider';
import { useAuth } from '@/providers/auth-provider';

function GoogleLogo() {
  return (
    <Svg width={18} height={18} viewBox="0 0 18 18">
      <Path
        fill="#4285F4"
        d="M17.64 9.2c0-.637-.057-1.251-.164-1.84H9v3.481h4.844c-.209 1.125-.843 2.078-1.796 2.717v2.258h2.908c1.702-1.567 2.684-3.874 2.684-6.615z"
      />
      <Path
        fill="#34A853"
        d="M9 18c2.43 0 4.467-.806 5.956-2.18l-2.908-2.259c-.806.54-1.837.86-3.048.86-2.344 0-4.328-1.584-5.036-3.711H.957v2.332A8.997 8.997 0 0 0 9 18z"
      />
      <Path
        fill="#FBBC05"
        d="M3.964 10.71A5.41 5.41 0 0 1 3.682 9c0-.593.102-1.17.282-1.71V4.958H.957A8.996 8.996 0 0 0 0 9c0 1.452.348 2.827.957 4.042l3.007-2.332z"
      />
      <Path
        fill="#EA4335"
        d="M9 3.58c1.321 0 2.508.454 3.44 1.345l2.582-2.58C13.463.891 11.426 0 9 0A8.997 8.997 0 0 0 .957 4.958L3.964 7.29C4.672 5.163 6.656 3.58 9 3.58z"
      />
    </Svg>
  );
}

function AppleLogo({ color }: { color: string }) {
  return (
    <SymbolView
      name={{ ios: 'apple.logo' }}
      tintColor={color}
      size={18}
      // SF Symbols only exist on Apple platforms; elsewhere fall back to the Apple glyph.
      fallback={<ThemedText style={{ color, fontSize: 18 }}>{''}</ThemedText>}
    />
  );
}

type SocialButtonsProps = {
  mode: 'sign-in' | 'sign-up';
};

export function SocialButtons({ mode }: SocialButtonsProps) {
  const theme = useTheme();
  const { signInWithApple, signInWithGoogle } = useAuth();
  const { t } = useI18n();
  const [pending, setPending] = useState<'apple' | 'google' | null>(null);

  const label = mode === 'sign-in' ? t.auth.continueWith : t.auth.signUpWith;

  async function run(provider: 'apple' | 'google') {
    setPending(provider);
    try {
      await (provider === 'apple' ? signInWithApple() : signInWithGoogle());
    } catch {
      Alert.alert(t.auth.errorTitle, t.auth.errorMessage);
    } finally {
      setPending(null);
    }
  }

  return (
    <View style={styles.list}>
      {/* Sign in with Apple is iOS-first; Android users get Google and email. */}
      {Platform.OS !== 'android' && (
        <Button
          variant="apple"
          title={label('Apple')}
          icon={<AppleLogo color={theme.background} />}
          loading={pending === 'apple'}
          disabled={pending !== null}
          onPress={() => run('apple')}
        />
      )}
      <Button
        variant="outline"
        title={label('Google')}
        icon={<GoogleLogo />}
        loading={pending === 'google'}
        disabled={pending !== null}
        onPress={() => run('google')}
      />
    </View>
  );
}

export function OrDivider() {
  const theme = useTheme();
  const { t } = useI18n();
  return (
    <View style={styles.divider}>
      <View style={[styles.line, { backgroundColor: theme.border }]} />
      <ThemedText type="small" themeColor="textSecondary">
        {t.common.or}
      </ThemedText>
      <View style={[styles.line, { backgroundColor: theme.border }]} />
    </View>
  );
}

const styles = StyleSheet.create({
  list: {
    gap: Spacing.two + Spacing.one,
  },
  divider: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.three,
  },
  line: {
    flex: 1,
    height: StyleSheet.hairlineWidth,
  },
});
