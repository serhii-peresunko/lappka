import { Link } from 'expo-router';
import { useRef, useState } from 'react';
import { Alert, StyleSheet, View, type TextInputInstance } from 'react-native';

import { AuthScreen } from '@/components/auth/auth-screen';
import { OrDivider, SocialButtons } from '@/components/auth/social-buttons';
import { ThemedText } from '@/components/themed-text';
import { Button } from '@/components/ui/button';
import { TextField } from '@/components/ui/text-field';
import { Spacing } from '@/constants/theme';
import { validateEmail } from '@/lib/validation';
import { useAuth } from '@/providers/auth-provider';

export default function SignInScreen() {
  const { signInWithEmail } = useAuth();
  const passwordRef = useRef<TextInputInstance>(null);

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errors, setErrors] = useState<{ email?: string; password?: string }>({});
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit() {
    const nextErrors = {
      email: validateEmail(email),
      password: password ? undefined : 'Enter your password',
    };
    setErrors(nextErrors);
    if (nextErrors.email || nextErrors.password) return;

    setSubmitting(true);
    try {
      await signInWithEmail(email.trim(), password);
    } catch {
      Alert.alert('Could not sign in', 'Check your email and password and try again.');
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <AuthScreen
      title="Welcome back"
      subtitle="Sign in to keep your pet's care on track"
      footer={
        <>
          <ThemedText type="small" themeColor="textSecondary">
            New to Lappka?{' '}
          </ThemedText>
          <Link href="/sign-up" replace>
            <ThemedText type="smallBold" themeColor="primary">
              Create an account
            </ThemedText>
          </Link>
        </>
      }>
      <SocialButtons mode="sign-in" />
      <OrDivider />

      <View style={styles.form}>
        <TextField
          label="Email"
          placeholder="you@example.com"
          value={email}
          onChangeText={setEmail}
          error={errors.email}
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
          placeholder="Your password"
          password
          value={password}
          onChangeText={setPassword}
          error={errors.password}
          autoComplete="current-password"
          textContentType="password"
          returnKeyType="go"
          onSubmitEditing={handleSubmit}
        />
        <View style={styles.forgot}>
          <Link href={{ pathname: '/forgot-password', params: email ? { email } : {} }} asChild>
            <Button variant="ghost" title="Forgot password?" />
          </Link>
        </View>
        <Button title="Sign in" loading={submitting} onPress={handleSubmit} />
      </View>
    </AuthScreen>
  );
}

const styles = StyleSheet.create({
  form: {
    gap: Spacing.three,
  },
  forgot: {
    alignItems: 'flex-end',
    marginTop: -Spacing.two,
    marginBottom: -Spacing.one,
  },
});
