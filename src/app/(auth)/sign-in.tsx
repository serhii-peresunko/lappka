import { Link } from 'expo-router';
import { useRef, useState } from 'react';
import { Alert, StyleSheet, View, type TextInputInstance } from 'react-native';

import { AuthScreen } from '@/components/auth/auth-screen';
import { OrDivider, SocialButtons } from '@/components/auth/social-buttons';
import { ThemedText } from '@/components/themed-text';
import { Button } from '@/components/ui/button';
import { TextField } from '@/components/ui/text-field';
import { Spacing } from '@/constants/theme';
import { useI18n } from '@/i18n/i18n-provider';
import { validateEmail } from '@/lib/validation';
import { useAuth } from '@/providers/auth-provider';

export default function SignInScreen() {
  const { signInWithEmail } = useAuth();
  const { t } = useI18n();
  const passwordRef = useRef<TextInputInstance>(null);

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  // Errors are derived on render so they follow the current language and clear as you type.
  const errors = submitted
    ? {
        email: validateEmail(email, t),
        password: password ? undefined : t.validation.passwordRequired,
      }
    : {};

  async function handleSubmit() {
    setSubmitted(true);
    if (validateEmail(email, t) || !password) return;

    setSubmitting(true);
    try {
      await signInWithEmail(email.trim(), password);
    } catch {
      Alert.alert(t.auth.signIn.failedTitle, t.auth.signIn.failedMessage);
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <AuthScreen
      title={t.auth.signIn.title}
      subtitle={t.auth.signIn.subtitle}
      footer={
        <>
          <ThemedText type="small" themeColor="textSecondary">
            {t.auth.signIn.newHere}{' '}
          </ThemedText>
          <Link href="/sign-up" replace>
            <ThemedText type="smallBold" themeColor="primary">
              {t.auth.signIn.createAccount}
            </ThemedText>
          </Link>
        </>
      }>
      <SocialButtons mode="sign-in" />
      <OrDivider />

      <View style={styles.form}>
        <TextField
          label={t.auth.emailLabel}
          placeholder={t.auth.emailPlaceholder}
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
          label={t.auth.passwordLabel}
          placeholder={t.auth.signIn.passwordPlaceholder}
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
            <Button variant="ghost" title={t.auth.signIn.forgot} />
          </Link>
        </View>
        <Button title={t.auth.signIn.submit} loading={submitting} onPress={handleSubmit} />
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
