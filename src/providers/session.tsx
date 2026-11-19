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
};

export type EventKind = 'vet' | 'vaccine' | 'grooming' | 'medication' | 'other';

export type PetEvent = {
  id: string;
  title: string;
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
  events: PetEvent[];
  addEvent: (event: Omit<PetEvent, 'id'>) => void;
  signOut: () => void;
};

const SessionContext = createContext<SessionContextValue | null>(null);

// TODO: replace with a real backend. This is an in-memory mock so the flow can be built first.
// Sign in = an existing account (already has a name and a pet); sign up = a new, empty one.
const wait = (ms = 500) => new Promise((resolve) => setTimeout(resolve, ms));

const DEMO_PET: Pet = {
  type: 'dog',
  name: 'Bublyk',
  sex: 'male',
  birthDate: '2023-04-12',
  approxAgeMonths: null,
  breed: 'Cocker Spaniel',
  bio: '',
};

/** A few events around today for the demo account, one of every kind, so the calendar has something to show. */
function demoEvents(): PetEvent[] {
  const day = (offset: number) => {
    const date = new Date();
    date.setDate(date.getDate() + offset);
    return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
  };
  const list: [number, EventKind, string, string | null][] = [
    [0, 'vet', 'Annual check-up', '10:00'],
    [0, 'vaccine', 'Rabies shot', '10:30'],
    [0, 'grooming', 'Haircut', '15:00'],
    [0, 'medication', 'Flea & tick pill', '20:00'],
    [0, 'other', 'Puppy training', null],
    [2, 'vet', 'Dental cleaning', '09:00'],
    [4, 'vaccine', 'Booster', '11:00'],
    [4, 'grooming', 'Nail trim', '12:00'],
    [7, 'medication', 'Deworming', null],
    [-3, 'other', 'Dog park meetup', '18:00'],
    [-5, 'vet', 'Limping check', '16:30'],
  ];
  return list.map(([offset, kind, title, time], index) => ({ id: `demo-${index}`, kind, title, time, date: day(offset) }));
}

function emailFor(method: AuthMethod, email: string | undefined, isNew: boolean) {
  if (email) return email;
  return `${isNew ? 'new.' : ''}${method}.user@example.com`;
}

export function SessionProvider({ children }: PropsWithChildren) {
  const [session, setSession] = useState<Session | null>(null);
  const [draftPetType, setDraftPetType] = useState<PetType | null>(null);
  const [events, setEvents] = useState<PetEvent[]>([]);

  const signIn = useCallback(async (method: AuthMethod, email?: string) => {
    await wait();
    setSession({ method, email: emailFor(method, email, false), ownerName: 'Alex', pet: DEMO_PET });
    setEvents(demoEvents());
  }, []);

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

  const signOut = useCallback(() => {
    setSession(null);
    setEvents([]);
    setDraftPetType(null);
  }, []);

  const value = useMemo(
    () => ({ session, draftPetType, setDraftPetType, signIn, signUp, saveOwnerName, savePet, events, addEvent, signOut }),
    [session, draftPetType, signIn, signUp, saveOwnerName, savePet, events, addEvent, signOut]
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
