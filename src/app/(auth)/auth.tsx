import { SymbolView } from 'expo-symbols';
import { useRef, useState } from 'react';
import { Alert, Platform, StyleSheet, View, type TextInputInstance } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { Button } from '@/components/ui/button';
import { Segmented } from '@/components/ui/choice';
import { FormScreen } from '@/components/ui/form-screen';
import { TextField } from '@/components/ui/text-field';
import { Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';
import { useSession, type AuthMethod } from '@/providers/session';

type Mode = 'sign-up' | 'sign-in';

const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const MIN_PASSWORD = 8;

/** One screen for everyone: sign in or create an account with Apple, Google or email. */
export default function AuthScreen() {
  const theme = useTheme();
  const { signIn, signUp } = useSession();
  const passwordRef = useRef<TextInputInstance>(null);

  const [mode, setMode] = useState<Mode>('sign-up');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const [pending, setPending] = useState<AuthMethod | null>(null);

  const isSignUp = mode === 'sign-up';

  const emailError = !email.trim() ? 'Enter your email' : !EMAIL.test(email.trim()) ? 'Enter a valid email' : undefined;
  const passwordError = !password
    ? 'Enter your password'
    : isSignUp && password.length < MIN_PASSWORD
      ? `Use at least ${MIN_PASSWORD} characters`
      : undefined;

  async function run(method: AuthMethod, withEmail?: string) {
    setPending(method);
    try {
      await (isSignUp ? signUp(method, withEmail) : signIn(method, withEmail));
    } catch {
      Alert.alert('Something went wrong', 'Please try again.');
    } finally {
      setPending(null);
    }
  }

  function submit() {
    setSubmitted(true);
    if (emailError || passwordError) return;
    run('email', email.trim());
  }

  const verb = isSignUp ? 'Sign up' : 'Continue';

  return (
    <FormScreen
      title={isSignUp ? 'Create your account' : 'Welcome back'}
      subtitle="Keep your dog's care in one place.">
      <Segmented
        value={mode}
        onChange={(next) => {
          setMode(next);
          setSubmitted(false);
        }}
        options={[
          { value: 'sign-up', label: 'Create account' },
          { value: 'sign-in', label: 'Sign in' },
        ]}
      />

      <View style={styles.group}>
        {/* Sign in with Apple is iOS-first, so Android shows Google and email only. */}
        {Platform.OS !== 'android' && (
          <Button
            variant="dark"
            title={`${verb} with Apple`}
            icon={
              <SymbolView name={{ ios: 'apple.logo' }} tintColor={theme.background} size={18} fallback={<View />} />
            }
            loading={pending === 'apple'}
            disabled={pending !== null}
            onPress={() => run('apple')}
          />
        )}
        <Button
          variant="outline"
          title={`${verb} with Google`}
          loading={pending === 'google'}
          disabled={pending !== null}
          onPress={() => run('google')}
        />
      </View>

      <View style={styles.divider}>
        <View style={[styles.line, { backgroundColor: theme.border }]} />
        <ThemedText type="small" themeColor="textSecondary">
          or
        </ThemedText>
        <View style={[styles.line, { backgroundColor: theme.border }]} />
      </View>

      <View style={styles.group}>
        <TextField
          label="Email"
          placeholder="you@example.com"
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
          label="Password"
          placeholder={isSignUp ? `At least ${MIN_PASSWORD} characters` : 'Your password'}
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
          title={isSignUp ? 'Create account' : 'Sign in'}
          loading={pending === 'email'}
          disabled={pending !== null}
          onPress={submit}
        />
      </View>
    </FormScreen>
  );
}

const styles = StyleSheet.create({
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
    height: StyleSheet.hairlineWidth,
  },
});
