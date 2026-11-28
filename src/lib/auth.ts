import * as Linking from 'expo-linking';
import * as WebBrowser from 'expo-web-browser';

import { supabase } from '@/lib/supabase';

export type AuthMethod = 'apple' | 'google' | 'email';

export type AuthErrorCode =
  | 'invalid_credentials'
  | 'user_exists'
  | 'email_not_confirmed'
  | 'weak_password'
  | 'rate_limit'
  | 'provider_disabled'
  | 'network'
  | 'unknown';

/** A failed sign-in with a code the screen can translate. */
export class AuthFailure extends Error {
  constructor(public code: AuthErrorCode, message?: string) {
    super(message ?? code);
  }
}

function toFailure(error: { code?: string; message?: string; name?: string }) {
  const code = error.code ?? '';
  const message = error.message ?? '';
  if (code === 'invalid_credentials') return new AuthFailure('invalid_credentials', message);
  if (code === 'user_already_exists' || code === 'email_exists') return new AuthFailure('user_exists', message);
  if (code === 'email_not_confirmed') return new AuthFailure('email_not_confirmed', message);
  if (code === 'weak_password') return new AuthFailure('weak_password', message);
  if (code.includes('rate_limit')) return new AuthFailure('rate_limit', message);
  if (code === 'provider_disabled' || /provider is not enabled/i.test(message)) return new AuthFailure('provider_disabled', message);
  if (error.name === 'AuthRetryableFetchError' || /network request failed|fetch failed/i.test(message)) return new AuthFailure('network', message);
  return new AuthFailure('unknown', message);
}

export async function signInWithEmail(email: string, password: string) {
  const { error } = await supabase.auth.signInWithPassword({ email, password });
  if (error) throw toFailure(error);
}

/** 'confirm' means Supabase sent a confirmation email and there is no session yet. */
export async function signUpWithEmail(email: string, password: string): Promise<'signed-in' | 'confirm'> {
  const { data, error } = await supabase.auth.signUp({ email, password, options: { emailRedirectTo: Linking.createURL('auth/callback') } });
  if (error) throw toFailure(error);
  // With email confirmation on, Supabase hides that an address is taken: it returns a user with no identities.
  if (data.user && data.user.identities?.length === 0) throw new AuthFailure('user_exists');
  return data.session ? 'signed-in' : 'confirm';
}

/** Google / Apple through the system browser. Returns false when the user closes it. */
export async function signInWithProvider(provider: 'google' | 'apple'): Promise<boolean> {
  const redirectTo = Linking.createURL('auth/callback');
  const { data, error } = await supabase.auth.signInWithOAuth({ provider, options: { redirectTo, skipBrowserRedirect: true } });
  if (error) throw toFailure(error);
  const result = await WebBrowser.openAuthSessionAsync(data.url, redirectTo);
  if (result.type !== 'success') return false;
  const { queryParams } = Linking.parse(result.url);
  const code = typeof queryParams?.code === 'string' ? queryParams.code : null;
  if (!code) {
    const reason = typeof queryParams?.error_description === 'string' ? queryParams.error_description : '';
    throw toFailure({ message: reason });
  }
  const exchanged = await supabase.auth.exchangeCodeForSession(code);
  if (exchanged.error) throw toFailure(exchanged.error);
  return true;
}
