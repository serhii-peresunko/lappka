import type { User } from '@supabase/supabase-js';
import { createContext, useCallback, useContext, useEffect, useMemo, useState, type PropsWithChildren } from 'react';

import * as api from '@/lib/api';
import { signInWithEmail, signInWithProvider, signUpWithEmail, type AuthMethod } from '@/lib/auth';
import { isSupabaseConfigured, supabase } from '@/lib/supabase';

export type { AuthMethod };

export type PetType = 'dog' | 'cat';

export type PetSex = 'male' | 'female';

export type Pet = {
  /** Dogs and cats for now; more pet types are planned. */
  type: PetType;
  name: string;
  sex: PetSex;
  /** ISO date (YYYY-MM-DD) when the owner knows it, otherwise null. */
  birthDate: string | null;
  /** Approximate age in months when the birth date is unknown, otherwise null. */
  approxAgeMonths: number | null;
  breed: string;
  bio: string;
  /** Instagram handle without the @, or null. */
  instagram: string | null;
  /** ISO 3166-1 alpha-2 code of the pet's home country, e.g. "UA". Missing means Ukraine. */
  country?: string;
  /** Local uri of the pet's photo (already cropped by the owner), or null. */
  photo: string | null;
  /** Has a microchip implanted. */
  chipped: boolean;
  /** Identity confirmed (e.g. by a vet). A mock flag until there is a backend to set it. */
  verified: boolean;
};

export type EventKind = 'vet' | 'vaccine' | 'grooming' | 'medication' | 'other';

/** How often an event comes back: every `every` days / weeks / months / years. */
export type Repeat = { every: number; unit: 'day' | 'week' | 'month' | 'year' };

export type PetEvent = {
  id: string;
  /** Optional note about the event; may be empty. */
  description: string;
  kind: EventKind;
  /** Local calendar day, YYYY-MM-DD. */
  date: string;
  /** HH:MM, or null for an all-day event. */
  time: string | null;
  /** Repeats after the first date; null or missing for a one-off event. */
  repeat?: Repeat | null;
};

type Session = {
  method: AuthMethod;
  email: string;
  ownerName: string;
  pet: Pet | null;
};

/** loading: restoring the saved sign-in or fetching the account. error: signed in, but the account could not be read. */
export type SessionStatus = 'loading' | 'ready' | 'error';

type SessionContextValue = {
  status: SessionStatus;
  session: Session | null;
  /** The pet type picked in the first pet step, before the details are saved. */
  draftPetType: PetType | null;
  setDraftPetType: (type: PetType | null) => void;
  /** Signs in to an existing account. Throws AuthFailure. */
  signIn: (method: AuthMethod, email?: string, password?: string) => Promise<void>;
  /** Creates an account. 'confirm' means the user has to confirm their email first. Throws AuthFailure. */
  signUp: (method: AuthMethod, email?: string, password?: string) => Promise<'signed-in' | 'confirm'>;
  signOut: () => Promise<void>;
  /** Fetches the account again after a failure. */
  reload: () => void;
  // Everything below is saved on the server first; the app changes only when that worked, and throws if not.
  saveOwnerName: (name: string) => Promise<void>;
  savePet: (pet: Pet) => Promise<void>;
  setPetPhoto: (uri: string | null) => Promise<void>;
  /** Deletes the pet and its events; the app then asks for a new pet (onboarding). */
  removePet: () => Promise<void>;
  events: PetEvent[];
  addEvent: (event: Omit<PetEvent, 'id'>) => Promise<void>;
  /** Changes an event. A repeating event is changed as a whole (all its repeats). */
  updateEvent: (id: string, event: Omit<PetEvent, 'id'>) => Promise<void>;
  /** Deletes an event (and, if it repeats, all its repeats). */
  removeEvent: (id: string) => Promise<void>;
};

const SessionContext = createContext<SessionContextValue | null>(null);

type Account = {
  /** Whose data this is; compared with the signed-in user so one account never shows another's data. */
  userId: string;
  ownerName: string;
  pet: api.StoredPet | null;
  events: PetEvent[];
};

const methodOf = (user: User): AuthMethod => {
  const provider = user.app_metadata?.provider;
  return provider === 'google' || provider === 'apple' ? provider : 'email';
};

export function SessionProvider({ children }: PropsWithChildren) {
  // undefined: the saved sign-in is not read yet. null: signed out.
  const [user, setUser] = useState<User | null | undefined>(isSupabaseConfigured ? undefined : null);
  const [account, setAccount] = useState<Account | null>(null);
  const [failedFor, setFailedFor] = useState<string | null>(null);
  const [attempt, setAttempt] = useState(0);
  const [draftPetType, setDraftPetType] = useState<PetType | null>(null);

  useEffect(() => {
    if (!isSupabaseConfigured) return;
    // Only state is set here: calling Supabase from inside this callback can deadlock it.
    const { data } = supabase.auth.onAuthStateChange((event, next) => {
      setUser(next?.user ?? null);
      if (event === 'SIGNED_OUT') {
        setAccount(null);
        setFailedFor(null);
        setDraftPetType(null);
      }
    });
    return () => data.subscription.unsubscribe();
  }, []);

  const userId = user?.id ?? null;

  useEffect(() => {
    if (!userId) return;
    let stale = false;
    api.loadAccount(userId).then(
      (loaded) => {
        if (!stale) setAccount({ userId, ...loaded });
      },
      (error: unknown) => {
        console.warn('Could not load the account', error);
        if (!stale) setFailedFor(userId);
      }
    );
    return () => {
      stale = true;
    };
  }, [userId, attempt]);

  const mine = account && account.userId === userId ? account : null;
  const status: SessionStatus = user === undefined ? 'loading' : !user || mine ? 'ready' : failedFor === user.id ? 'error' : 'loading';

  const session = useMemo<Session | null>(
    () => (user && mine ? { method: methodOf(user), email: user.email ?? '', ownerName: mine.ownerName, pet: mine.pet } : null),
    [user, mine]
  );
  const events = useMemo(() => mine?.events ?? [], [mine]);

  const signIn = useCallback(async (method: AuthMethod, email?: string, password?: string) => {
    if (method === 'email') await signInWithEmail(email ?? '', password ?? '');
    else await signInWithProvider(method);
  }, []);

  const signUp = useCallback(async (method: AuthMethod, email?: string, password?: string) => {
    if (method === 'email') return signUpWithEmail(email ?? '', password ?? '');
    await signInWithProvider(method);
    return 'signed-in' as const;
  }, []);

  const signOut = useCallback(async () => {
    // "local" still signs this phone out when the server cannot be reached.
    await supabase.auth.signOut({ scope: 'local' });
  }, []);

  const reload = useCallback(() => {
    setFailedFor(null);
    setAttempt((n) => n + 1);
  }, []);

  /** Applies a change to the account it was made for (not to another one signed in meanwhile). */
  const patch = useCallback((id: string, change: (current: Account) => Partial<Account>) => {
    setAccount((current) => (current && current.userId === id ? { ...current, ...change(current) } : current));
  }, []);

  const requireAccount = useCallback(() => {
    if (!mine) throw new Error('Not signed in');
    return mine;
  }, [mine]);

  const saveOwnerName = useCallback(
    async (name: string) => {
      const { userId: id } = requireAccount();
      await api.saveProfile(id, name);
      patch(id, () => ({ ownerName: name }));
    },
    [requireAccount, patch]
  );

  const savePet = useCallback(
    async (pet: Pet) => {
      const { userId: id } = requireAccount();
      const saved = await api.createPet(id, pet);
      patch(id, () => ({ pet: saved }));
    },
    [requireAccount, patch]
  );

  const setPetPhoto = useCallback(
    async (uri: string | null) => {
      const { userId: id, pet } = requireAccount();
      if (!pet) return;
      const saved = await api.replacePetPhoto(id, pet, uri);
      patch(id, () => ({ pet: saved }));
    },
    [requireAccount, patch]
  );

  const removePet = useCallback(async () => {
    const { userId: id, pet } = requireAccount();
    if (!pet) return;
    await api.deletePet(pet);
    setDraftPetType(null);
    patch(id, () => ({ pet: null, events: [] }));
  }, [requireAccount, patch]);

  const addEvent = useCallback(
    async (event: Omit<PetEvent, 'id'>) => {
      const { userId: id, pet } = requireAccount();
      if (!pet) throw new Error('No pet');
      const saved = await api.createEvent(pet.id, event);
      patch(id, (current) => ({ events: [...current.events, saved] }));
    },
    [requireAccount, patch]
  );

  const updateEvent = useCallback(
    async (eventId: string, event: Omit<PetEvent, 'id'>) => {
      const { userId: id } = requireAccount();
      const saved = await api.changeEvent(eventId, event);
      patch(id, (current) => ({ events: current.events.map((item) => (item.id === eventId ? saved : item)) }));
    },
    [requireAccount, patch]
  );

  const removeEvent = useCallback(
    async (eventId: string) => {
      const { userId: id } = requireAccount();
      await api.deleteEvent(eventId);
      patch(id, (current) => ({ events: current.events.filter((item) => item.id !== eventId) }));
    },
    [requireAccount, patch]
  );

  const value = useMemo(
    () => ({ status, session, draftPetType, setDraftPetType, signIn, signUp, signOut, reload, saveOwnerName, savePet, setPetPhoto, removePet, events, addEvent, updateEvent, removeEvent }),
    [status, session, draftPetType, signIn, signUp, signOut, reload, saveOwnerName, savePet, setPetPhoto, removePet, events, addEvent, updateEvent, removeEvent]
  );

  return <SessionContext.Provider value={value}>{children}</SessionContext.Provider>;
}

export function useSession() {
  const context = useContext(SessionContext);
  if (!context) {
    throw new Error('useSession must be used inside <SessionProvider>');
  }
  return context;
}
