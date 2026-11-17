import type { Translation } from '@/i18n/translations';

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export const MIN_PASSWORD_LENGTH = 8;

export function validateEmail(email: string, t: Translation): string | undefined {
  if (!email.trim()) return t.validation.emailRequired;
  if (!EMAIL_PATTERN.test(email.trim())) return t.validation.emailInvalid;
  return undefined;
}

export function validatePassword(password: string, t: Translation): string | undefined {
  if (!password) return t.validation.passwordRequired;
  if (password.length < MIN_PASSWORD_LENGTH) return t.validation.passwordShort(MIN_PASSWORD_LENGTH);
  return undefined;
}
