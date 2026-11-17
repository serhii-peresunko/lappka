import { Link, useLocalSearchParams } from 'expo-router';
import { useState } from 'react';
import { Alert, StyleSheet, View } from 'react-native';

import { AuthScreen } from '@/components/auth/auth-screen';
import { ThemedText } from '@/components/themed-text';
import { Button } from '@/components/ui/button';
import { TextField } from '@/components/ui/text-field';
import { Spacing } from '@/constants/theme';
import { validateEmail } from '@/lib/validation';
import { useAuth } from '@/providers/auth-provider';

export default function ForgotPasswordScreen() {
  const { sendPasswordReset } = useAuth();
  const params = useLocalSearchParams<{ email?: string }>();

  const [email, setEmail] = useState(params.email ?? '');
  const [error, setError] = useState<string>();
  const [submitting, setSubmitting] = useState(false);
  const [sentTo, setSentTo] = useState<string | null>(null);

  async function handleSubmit() {
    const nextError = validateEmail(email);
    setError(nextError);
    if (nextError) return;

    setSubmitting(true);
    try {
      await sendPasswordReset(email.trim());
      setSentTo(email.trim());
    } catch {
      Alert.alert('Could not send the link', 'Please try again.');
    } finally {
      setSubmitting(false);
    }
  }

  const backToSignIn = (
    <Link href="/sign-in" replace>
      <ThemedText type="smallBold" themeColor="primary">
        Back to sign in
      </ThemedText>
    </Link>
  );

  if (sentTo) {
    return (
      <AuthScreen
        title="Check your email"
        subtitle={`If an account exists for ${sentTo}, we sent a link to reset your password.`}
        footer={backToSignIn}>
        <Button variant="outline" title="Send again" loading={submitting} onPress={handleSubmit} />
      </AuthScreen>
    );
  }

  return (
    <AuthScreen
      title="Reset password"
      subtitle="Enter the email you signed up with and we'll send you a reset link"
      footer={backToSignIn}>
      <View style={styles.form}>
        <TextField
          label="Email"
          placeholder="you@example.com"
          value={email}
          onChangeText={setEmail}
          error={error}
          keyboardType="email-address"
          autoCapitalize="none"
          autoComplete="email"
          textContentType="emailAddress"
          returnKeyType="send"
          onSubmitEditing={handleSubmit}
          autoFocus={!email}
        />
        <Button title="Send reset link" loading={submitting} onPress={handleSubmit} />
      </View>
    </AuthScreen>
  );
}

const styles = StyleSheet.create({
  form: {
    gap: Spacing.three,
  },
});
