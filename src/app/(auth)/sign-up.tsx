import { Link } from 'expo-router';
import { useRef, useState } from 'react';
import { Alert, StyleSheet, View, type TextInputInstance } from 'react-native';

import { AuthScreen } from '@/components/auth/auth-screen';
import { OrDivider, SocialButtons } from '@/components/auth/social-buttons';
import { ThemedText } from '@/components/themed-text';
import { Button } from '@/components/ui/button';
import { TextField } from '@/components/ui/text-field';
import { Spacing } from '@/constants/theme';
import { validateEmail, validatePassword } from '@/lib/validation';
import { useAuth } from '@/providers/auth-provider';

type Errors = { name?: string; email?: string; password?: string; confirm?: string };

export default function SignUpScreen() {
  const { signUpWithEmail } = useAuth();
  const emailRef = useRef<TextInputInstance>(null);
  const passwordRef = useRef<TextInputInstance>(null);
  const confirmRef = useRef<TextInputInstance>(null);

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [errors, setErrors] = useState<Errors>({});
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit() {
    const nextErrors: Errors = {
      name: name.trim() ? undefined : 'Enter your name',
      email: validateEmail(email),
      password: validatePassword(password),
      confirm: confirm === password ? undefined : 'Passwords do not match',
    };
    setErrors(nextErrors);
    if (Object.values(nextErrors).some(Boolean)) return;

    setSubmitting(true);
    try {
      await signUpWithEmail(name.trim(), email.trim(), password);
    } catch {
      Alert.alert('Could not create account', 'Please try again.');
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <AuthScreen
      title="Create your account"
      subtitle="Vaccinations, grooming and pills — all in one place"
      footer={
        <>
          <ThemedText type="small" themeColor="textSecondary">
            Already have an account?{' '}
          </ThemedText>
          <Link href="/sign-in" replace>
            <ThemedText type="smallBold" themeColor="primary">
              Sign in
            </ThemedText>
          </Link>
        </>
      }>
      <SocialButtons mode="sign-up" />
      <OrDivider />

      <View style={styles.form}>
        <TextField
          label="Name"
          placeholder="Your name"
          value={name}
          onChangeText={setName}
          error={errors.name}
          autoCapitalize="words"
          autoComplete="name"
          textContentType="name"
          returnKeyType="next"
          onSubmitEditing={() => emailRef.current?.focus()}
        />
        <TextField
          ref={emailRef}
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
          placeholder="At least 8 characters"
          password
          value={password}
          onChangeText={setPassword}
          error={errors.password}
          autoComplete="new-password"
          textContentType="newPassword"
          returnKeyType="next"
          onSubmitEditing={() => confirmRef.current?.focus()}
        />
        <TextField
          ref={confirmRef}
          label="Confirm password"
          placeholder="Repeat your password"
          password
          value={confirm}
          onChangeText={setConfirm}
          error={errors.confirm}
          autoComplete="new-password"
          textContentType="newPassword"
          returnKeyType="go"
          onSubmitEditing={handleSubmit}
        />
        <Button title="Create account" loading={submitting} onPress={handleSubmit} />
        <ThemedText type="small" themeColor="textSecondary" style={styles.legal}>
          By creating an account you agree to the Terms of Service and Privacy Policy.
        </ThemedText>
      </View>
    </AuthScreen>
  );
}

const styles = StyleSheet.create({
  form: {
    gap: Spacing.three,
  },
  legal: {
    textAlign: 'center',
  },
});
