import { useI18n } from '@/i18n';
import type { StringKey } from '@/i18n/en';
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
  /** Deletes the pet and its events; the app then asks for a new pet (onboarding). */
  removePet: () => void;
  events: PetEvent[];
  addEvent: (event: Omit<PetEvent, 'id'>) => void;
  /** Changes an event. A repeating event is changed as a whole (all its repeats). */
  updateEvent: (id: string, event: Omit<PetEvent, 'id'>) => void;
  /** Deletes an event (and, if it repeats, all its repeats). */
  removeEvent: (id: string) => void;
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

/** Demo events around today, of every kind (some repeat), so the calendar has plenty to show. */
const DEMO_EVENT_COUNT = 27;
function demoEvents(descriptions: string[]): PetEvent[] {
  const day = (offset: number) => {
    const date = new Date();
    date.setDate(date.getDate() + offset);
    return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
  };
  const list: [number, EventKind, string | null, Repeat | null][] = [
    [0, 'vet', '10:00', null],
    [0, 'vaccine', '10:30', null],
    [0, 'grooming', '15:00', null],
    [0, 'medication', '20:00', null],
    [0, 'other', null, null],
    [1, 'vet', '09:30', null],
    [1, 'other', '18:00', null],
    [2, 'medication', '08:00', { every: 2, unit: 'week' }],
    [3, 'grooming', '12:00', null],
    [3, 'other', '17:30', null],
    [4, 'vaccine', '11:00', null],
    [4, 'vet', '14:30', null],
    [5, 'other', null, null],
    [6, 'grooming', '13:00', { every: 1, unit: 'month' }],
    [7, 'medication', '09:00', null],
    [8, 'vet', '16:00', null],
    [9, 'other', '19:00', null],
    [10, 'vaccine', '10:00', { every: 1, unit: 'year' }],
    [12, 'grooming', '11:30', null],
    [14, 'vet', '12:00', null],
    [15, 'medication', null, null],
    [17, 'other', '10:30', null],
    [20, 'vet', '15:30', null],
    [-3, 'other', '18:00', null],
    [-5, 'vet', '16:30', null],
    [-9, 'vaccine', '09:30', null],
    [-14, 'grooming', '14:00', null],
  ];
  return list.map(([offset, kind, time, repeat], index) => ({
    id: `demo-${index}`,
    kind,
    description: descriptions[index] ?? '',
    time,
    repeat,
    date: day(offset),
  }));
}

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
    setEvents(demoEvents(Array.from({ length: DEMO_EVENT_COUNT }, (_, i) => t(`demo.e${i}` as StringKey))));
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

  const updateEvent = useCallback((id: string, event: Omit<PetEvent, 'id'>) => {
    setEvents((current) => current.map((item) => (item.id === id ? { ...event, id } : item)));
  }, []);

  const removeEvent = useCallback((id: string) => {
    setEvents((current) => current.filter((item) => item.id !== id));
  }, []);

  const setPetPhoto = useCallback((photo: string | null) => {
    setSession((current) => (current?.pet ? { ...current, pet: { ...current.pet, photo } } : current));
  }, []);

  const removePet = useCallback(() => {
    setSession((current) => (current ? { ...current, pet: null } : current));
    setEvents([]);
    setDraftPetType(null);
  }, []);

  const signOut = useCallback(() => {
    setSession(null);
    setEvents([]);
    setDraftPetType(null);
  }, []);

  const value = useMemo(
    () => ({ session, draftPetType, setDraftPetType, signIn, signUp, saveOwnerName, savePet, setPetPhoto, removePet, events, addEvent, updateEvent, removeEvent, signOut }),
    [session, draftPetType, signIn, signUp, saveOwnerName, savePet, setPetPhoto, removePet, events, addEvent, updateEvent, removeEvent, signOut]
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
