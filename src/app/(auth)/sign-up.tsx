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
import type { Translation } from '@/i18n/translations';
import { validateEmail, validatePassword } from '@/lib/validation';
import { useAuth } from '@/providers/auth-provider';

type Values = { name: string; email: string; password: string; confirm: string };

function validate(values: Values, t: Translation) {
  return {
    name: values.name.trim() ? undefined : t.validation.nameRequired,
    email: validateEmail(values.email, t),
    password: validatePassword(values.password, t),
    confirm: values.confirm === values.password ? undefined : t.validation.passwordsMismatch,
  };
}

export default function SignUpScreen() {
  const { signUpWithEmail } = useAuth();
  const { t } = useI18n();
  const emailRef = useRef<TextInputInstance>(null);
  const passwordRef = useRef<TextInputInstance>(null);
  const confirmRef = useRef<TextInputInstance>(null);

  const [values, setValues] = useState<Values>({ name: '', email: '', password: '', confirm: '' });
  const [submitted, setSubmitted] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const set = (key: keyof Values) => (value: string) => setValues((current) => ({ ...current, [key]: value }));
  const errors: Partial<ReturnType<typeof validate>> = submitted ? validate(values, t) : {};

  async function handleSubmit() {
    setSubmitted(true);
    if (Object.values(validate(values, t)).some(Boolean)) return;

    setSubmitting(true);
    try {
      await signUpWithEmail(values.name.trim(), values.email.trim(), values.password);
    } catch {
      Alert.alert(t.auth.signUp.failedTitle, t.auth.errorMessage);
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <AuthScreen
      title={t.auth.signUp.title}
      subtitle={t.auth.signUp.subtitle}
      footer={
        <>
          <ThemedText type="small" themeColor="textSecondary">
            {t.auth.signUp.haveAccount}{' '}
          </ThemedText>
          <Link href="/sign-in" replace>
            <ThemedText type="smallBold" themeColor="primary">
              {t.auth.signUp.signIn}
            </ThemedText>
          </Link>
        </>
      }>
      <SocialButtons mode="sign-up" />
      <OrDivider />

      <View style={styles.form}>
        <TextField
          label={t.auth.signUp.nameLabel}
          placeholder={t.auth.signUp.namePlaceholder}
          value={values.name}
          onChangeText={set('name')}
          error={errors.name}
          autoCapitalize="words"
          autoComplete="name"
          textContentType="name"
          returnKeyType="next"
          onSubmitEditing={() => emailRef.current?.focus()}
        />
        <TextField
          ref={emailRef}
          label={t.auth.emailLabel}
          placeholder={t.auth.emailPlaceholder}
          value={values.email}
          onChangeText={set('email')}
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
          placeholder={t.auth.signUp.passwordPlaceholder}
          password
          value={values.password}
          onChangeText={set('password')}
          error={errors.password}
          autoComplete="new-password"
          textContentType="newPassword"
          returnKeyType="next"
          onSubmitEditing={() => confirmRef.current?.focus()}
        />
        <TextField
          ref={confirmRef}
          label={t.auth.signUp.confirmLabel}
          placeholder={t.auth.signUp.confirmPlaceholder}
          password
          value={values.confirm}
          onChangeText={set('confirm')}
          error={errors.confirm}
          autoComplete="new-password"
          textContentType="newPassword"
          returnKeyType="go"
          onSubmitEditing={handleSubmit}
        />
        <Button title={t.auth.signUp.submit} loading={submitting} onPress={handleSubmit} />
        <ThemedText type="small" themeColor="textSecondary" style={styles.legal}>
          {t.auth.signUp.legal}
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
