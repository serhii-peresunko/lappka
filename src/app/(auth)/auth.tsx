import { useLocalSearchParams, useRouter } from 'expo-router';
import { SymbolView } from 'expo-symbols';
import { useRef, useState } from 'react';
import { Alert, Platform, Pressable, StyleSheet, View, type TextInputInstance } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { Button } from '@/components/ui/button';
import { FormScreen } from '@/components/ui/form-screen';
import { TextField } from '@/components/ui/text-field';
import { Spacing } from '@/constants/theme';
import { useI18n } from '@/i18n';
import { useTheme } from '@/hooks/use-theme';
import { AuthFailure } from '@/lib/auth';
import type { StringKey } from '@/i18n/en';
import { useSession, type AuthMethod } from '@/providers/session';

type Mode = 'sign-up' | 'sign-in';

const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const MIN_PASSWORD = 8;

/** One screen for everyone: sign in or create an account with Apple, Google or email. */
export default function AuthScreen() {
  const theme = useTheme();
  const router = useRouter();
  const { t } = useI18n();
  const params = useLocalSearchParams<{ mode?: string }>();
  const { signIn, signUp } = useSession();
  const passwordRef = useRef<TextInputInstance>(null);

  const [mode, setMode] = useState<Mode>(params.mode === 'sign-in' ? 'sign-in' : 'sign-up');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const [pending, setPending] = useState<AuthMethod | null>(null);

  const isSignUp = mode === 'sign-up';

  const emailError = !email.trim()
    ? t('auth.errEmailEmpty')
    : !EMAIL.test(email.trim())
      ? t('auth.errEmailInvalid')
      : undefined;
  const passwordError = !password
    ? t('auth.errPasswordEmpty')
    : isSignUp && password.length < MIN_PASSWORD
      ? t('auth.errPasswordShort', { n: MIN_PASSWORD })
      : undefined;

  async function run(method: AuthMethod, withEmail?: string, withPassword?: string) {
    setPending(method);
    try {
      if (isSignUp) {
        if ((await signUp(method, withEmail, withPassword)) === 'confirm') {
          Alert.alert(t('auth.confirmTitle'), t('auth.confirmBody', { email: withEmail ?? '' }));
          setMode('sign-in');
          setPassword('');
          setSubmitted(false);
        }
      } else {
        await signIn(method, withEmail, withPassword);
      }
    } catch (error) {
      const code = error instanceof AuthFailure ? error.code : 'unknown';
      console.warn('Sign-in failed', code, error instanceof Error ? error.message : error);
      Alert.alert(t('auth.failedTitle'), t(`auth.fail.${code}` as StringKey));
    } finally {
      setPending(null);
    }
  }

  function submit() {
    setSubmitted(true);
    if (emailError || passwordError) return;
    run('email', email.trim(), password);
  }

  return (
    <FormScreen
      bottom
      onBack={() => router.back()}
      title={isSignUp ? t('auth.titleSignUp') : t('auth.titleSignIn')}
      subtitle={t('auth.subtitle')}>
      <View style={styles.group}>
        <TextField
          label={t('auth.email')}
          placeholder={t('auth.emailPlaceholder')}
          value={email}
          onChangeText={setEmail}
          error={submitted ? emailError : undefined}
          keyboardType="email-address"
          autoCapitalize="none"
          autoComplete="email"
          textContentType="emailAddress"
          returnKeyType="next"
          onSubmitEditing={() => passwordRef.current?.focus()}
        />
        <TextField
          ref={passwordRef}
          label={t('auth.password')}
          placeholder={isSignUp ? t('auth.passwordPlaceholderUp', { n: MIN_PASSWORD }) : t('auth.passwordPlaceholderIn')}
          value={password}
          onChangeText={setPassword}
          error={submitted ? passwordError : undefined}
          secureTextEntry
          autoCapitalize="none"
          autoCorrect={false}
          autoComplete={isSignUp ? 'new-password' : 'current-password'}
          textContentType={isSignUp ? 'newPassword' : 'password'}
          returnKeyType="go"
          onSubmitEditing={submit}
        />
        <Button
          title={isSignUp ? t('auth.createAccount') : t('auth.signIn')}
          loading={pending === 'email'}
          disabled={pending !== null}
          onPress={submit}
        />
      </View>

      <View style={styles.divider}>
        <View style={[styles.line, { backgroundColor: theme.border }]} />
        <ThemedText type="small" themeColor="textSecondary">
          {t('or')}
        </ThemedText>
        <View style={[styles.line, { backgroundColor: theme.border }]} />
      </View>

      <View style={styles.group}>
        {/* Sign in with Apple is iOS-first, so Android shows Google and email only. */}
        {Platform.OS !== 'android' && (
          <Button
            variant="dark"
            title={isSignUp ? t('auth.appleUp') : t('auth.appleIn')}
            icon={
              <SymbolView name={{ ios: 'apple.logo' }} tintColor={theme.onPrimary} size={18} fallback={<View />} />
            }
            loading={pending === 'apple'}
            disabled={pending !== null}
            onPress={() => run('apple')}
          />
        )}
        <Button
          variant="outline"
          title={isSignUp ? t('auth.googleUp') : t('auth.googleIn')}
          loading={pending === 'google'}
          disabled={pending !== null}
          onPress={() => run('google')}
        />
      </View>

      <Pressable
        accessibilityRole="button"
        onPress={() => {
          setMode(isSignUp ? 'sign-in' : 'sign-up');
          setSubmitted(false);
        }}
        style={styles.switch}>
        <ThemedText type="small" themeColor="textSecondary">
          {isSignUp ? t('auth.hasAccount') : t('auth.newHere')}
          <ThemedText type="smallBold" style={{ color: theme.primaryText }}>
            {isSignUp ? t('auth.signIn') : t('auth.createAccount')}
          </ThemedText>
        </ThemedText>
      </Pressable>
    </FormScreen>
  );
}

const styles = StyleSheet.create({
  switch: {
    minHeight: 44,
    alignItems: 'center',
    justifyContent: 'center',
  },
  group: {
    gap: Spacing.three,
  },
  divider: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.three,
  },
  line: {
    flex: 1,
    height: 1,
  },
});
