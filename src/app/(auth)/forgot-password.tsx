import { Link, useLocalSearchParams } from 'expo-router';
import { useState } from 'react';
import { Alert, StyleSheet, View } from 'react-native';

import { AuthScreen } from '@/components/auth/auth-screen';
import { ThemedText } from '@/components/themed-text';
import { Button } from '@/components/ui/button';
import { TextField } from '@/components/ui/text-field';
import { Spacing } from '@/constants/theme';
import { useI18n } from '@/i18n/i18n-provider';
import { validateEmail } from '@/lib/validation';
import { useAuth } from '@/providers/auth-provider';

export default function ForgotPasswordScreen() {
  const { sendPasswordReset } = useAuth();
  const { t } = useI18n();
  const params = useLocalSearchParams<{ email?: string }>();

  const [email, setEmail] = useState(params.email ?? '');
  const [submitted, setSubmitted] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [sentTo, setSentTo] = useState<string | null>(null);

  const error = submitted ? validateEmail(email, t) : undefined;

  async function handleSubmit() {
    setSubmitted(true);
    if (validateEmail(email, t)) return;

    setSubmitting(true);
    try {
      await sendPasswordReset(email.trim());
      setSentTo(email.trim());
    } catch {
      Alert.alert(t.auth.forgot.failedTitle, t.auth.errorMessage);
    } finally {
      setSubmitting(false);
    }
  }

  const backToSignIn = (
    <Link href="/sign-in" replace>
      <ThemedText type="smallBold" themeColor="primary">
        {t.auth.forgot.back}
      </ThemedText>
    </Link>
  );

  if (sentTo) {
    return (
      <AuthScreen
        title={t.auth.forgot.sentTitle}
        subtitle={t.auth.forgot.sentSubtitle(sentTo)}
        footer={backToSignIn}>
        <Button
          variant="outline"
          title={t.auth.forgot.sendAgain}
          loading={submitting}
          onPress={handleSubmit}
        />
      </AuthScreen>
    );
  }

  return (
    <AuthScreen title={t.auth.forgot.title} subtitle={t.auth.forgot.subtitle} footer={backToSignIn}>
      <View style={styles.form}>
        <TextField
          label={t.auth.emailLabel}
          placeholder={t.auth.emailPlaceholder}
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
        <Button title={t.auth.forgot.submit} loading={submitting} onPress={handleSubmit} />
      </View>
    </AuthScreen>
  );
}

const styles = StyleSheet.create({
  form: {
    gap: Spacing.three,
  },
});
