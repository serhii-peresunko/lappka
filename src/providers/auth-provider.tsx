import { createContext, useCallback, useContext, useMemo, useState, type PropsWithChildren } from 'react';

export type AuthProviderName = 'email' | 'google' | 'apple';

export type Session = {
  name: string;
  email: string;
  provider: AuthProviderName;
};

type AuthContextValue = {
  session: Session | null;
  signInWithEmail: (email: string, password: string) => Promise<void>;
  signUpWithEmail: (name: string, email: string, password: string) => Promise<void>;
  signInWithGoogle: () => Promise<void>;
  signInWithApple: () => Promise<void>;
  sendPasswordReset: (email: string) => Promise<void>;
  signOut: () => void;
};

const AuthContext = createContext<AuthContextValue | null>(null);

// TODO: replace with a real auth backend. Everything below is an in-memory mock
// so the UI can be built and tested before the backend exists.
const wait = (ms = 600) => new Promise((resolve) => setTimeout(resolve, ms));

function nameFromEmail(email: string) {
  return email.split('@')[0] ?? email;
}

export function AuthProvider({ children }: PropsWithChildren) {
  const [session, setSession] = useState<Session | null>(null);

  const signInWithEmail = useCallback(async (email: string, _password: string) => {
    await wait();
    setSession({ name: nameFromEmail(email), email, provider: 'email' });
  }, []);

  const signUpWithEmail = useCallback(async (name: string, email: string, _password: string) => {
    await wait();
    setSession({ name, email, provider: 'email' });
  }, []);

  const signInWithGoogle = useCallback(async () => {
    await wait();
    setSession({ name: 'Google user', email: 'google.user@example.com', provider: 'google' });
  }, []);

  const signInWithApple = useCallback(async () => {
    await wait();
    setSession({ name: 'Apple user', email: 'apple.user@example.com', provider: 'apple' });
  }, []);

  const sendPasswordReset = useCallback(async (_email: string) => {
    await wait();
  }, []);

  const signOut = useCallback(() => setSession(null), []);

  const value = useMemo(
    () => ({
      session,
      signInWithEmail,
      signUpWithEmail,
      signInWithGoogle,
      signInWithApple,
      sendPasswordReset,
      signOut,
    }),
    [session, signInWithEmail, signUpWithEmail, signInWithGoogle, signInWithApple, sendPasswordReset, signOut]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used inside <AuthProvider>');
  }
  return context;
}
