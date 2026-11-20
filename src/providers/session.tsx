import { useI18n } from '@/i18n';
import { createContext, useCallback, useContext, useMemo, useState, type PropsWithChildren } from 'react';

export type AuthMethod = 'apple' | 'google' | 'email';

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

export type PetEvent = {
  id: string;
  /** Optional note about the event; may be empty. */
  description: string;
  kind: EventKind;
  /** Local calendar day, YYYY-MM-DD. */
  date: string;
  /** HH:MM, or null for an all-day event. */
  time: string | null;
};

type Session = {
  method: AuthMethod;
  email: string;
  ownerName: string;
  pet: Pet | null;
};

type SessionContextValue = {
  session: Session | null;
  /** The pet type picked in the first pet step, before the details are saved. */
  draftPetType: PetType | null;
  setDraftPetType: (type: PetType | null) => void;
  signIn: (method: AuthMethod, email?: string) => Promise<void>;
  signUp: (method: AuthMethod, email?: string) => Promise<void>;
  saveOwnerName: (name: string) => void;
  savePet: (pet: Pet) => void;
  setPetPhoto: (uri: string | null) => void;
  events: PetEvent[];
  addEvent: (event: Omit<PetEvent, 'id'>) => void;
  signOut: () => void;
};

const SessionContext = createContext<SessionContextValue | null>(null);

// TODO: replace with a real backend. This is an in-memory mock so the flow can be built first.
// Sign in = an existing account (already has a name and a pet); sign up = a new, empty one.
const wait = (ms = 500) => new Promise((resolve) => setTimeout(resolve, ms));

const demoPet = (name: string): Pet => ({
  type: 'dog',
  name,
  sex: 'male',
  birthDate: '2023-04-12',
  approxAgeMonths: null,
  breed: 'Cocker Spaniel',
  bio: '',
  instagram: 'bublyk_demo',
  photo: null,
  chipped: true,
  verified: true,
});

function emailFor(method: AuthMethod, email: string | undefined, isNew: boolean) {
  if (email) return email;
  return `${isNew ? 'new.' : ''}${method}.user@example.com`;
}

export function SessionProvider({ children }: PropsWithChildren) {
  const { t } = useI18n();
  const [session, setSession] = useState<Session | null>(null);
  const [draftPetType, setDraftPetType] = useState<PetType | null>(null);
  const [events, setEvents] = useState<PetEvent[]>([]);

  const signIn = useCallback(async (method: AuthMethod, email?: string) => {
    await wait();
    setSession({ method, email: emailFor(method, email, false), ownerName: t('demo.owner'), pet: demoPet(t('demo.pet')) });
  }, [t]);

  const signUp = useCallback(async (method: AuthMethod, email?: string) => {
    await wait();
    setSession({ method, email: emailFor(method, email, true), ownerName: '', pet: null });
  }, []);

  const saveOwnerName = useCallback((name: string) => {
    setSession((current) => (current ? { ...current, ownerName: name } : current));
  }, []);

  const savePet = useCallback((pet: Pet) => {
    setSession((current) => (current ? { ...current, pet } : current));
  }, []);

  const addEvent = useCallback((event: Omit<PetEvent, 'id'>) => {
    setEvents((current) => [...current, { ...event, id: `${Date.now()}-${current.length}` }]);
  }, []);

  const setPetPhoto = useCallback((photo: string | null) => {
    setSession((current) => (current?.pet ? { ...current, pet: { ...current.pet, photo } } : current));
  }, []);

  const signOut = useCallback(() => {
    setSession(null);
    setEvents([]);
    setDraftPetType(null);
  }, []);

  const value = useMemo(
    () => ({ session, draftPetType, setDraftPetType, signIn, signUp, saveOwnerName, savePet, setPetPhoto, events, addEvent, signOut }),
    [session, draftPetType, signIn, signUp, saveOwnerName, savePet, setPetPhoto, events, addEvent, signOut]
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
