import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
  type PropsWithChildren,
} from 'react';

import {
  createMockPet,
  createMockRecords,
  nextOccurrence,
  sortByDate,
  type CareRecord,
  type Pet,
} from '@/data/care';
import { useI18n } from '@/i18n/i18n-provider';
import { today } from '@/lib/dates';

export type RecordInput = Omit<CareRecord, 'id'>;

type CareContextValue = {
  pet: Pet;
  /** All records sorted by date, oldest first. */
  records: CareRecord[];
  getRecord: (id: string) => CareRecord | undefined;
  addRecord: (input: RecordInput) => void;
  updateRecord: (id: string, input: RecordInput) => void;
  deleteRecord: (id: string) => void;
  /**
   * Marks a record done or not done. Completing a repeating record schedules
   * the next one, so recurring care never silently drops off the calendar.
   */
  toggleDone: (id: string) => void;
  updatePet: (pet: Pet) => void;
};

const CareContext = createContext<CareContextValue | null>(null);

let nextId = 1000;
const newId = () => String(nextId++);

// UI-only store: seeded with mock data, kept in memory until a backend exists.
export function CareProvider({ children }: PropsWithChildren) {
  // Mock data is seeded once, in the language the app starts in.
  const { language } = useI18n();
  const [pet, setPet] = useState<Pet>(() => createMockPet(today(), language));
  const [records, setRecords] = useState<CareRecord[]>(() =>
    sortByDate(createMockRecords(today(), language))
  );

  const getRecord = useCallback((id: string) => records.find((record) => record.id === id), [records]);

  const addRecord = useCallback((input: RecordInput) => {
    setRecords((current) => sortByDate([...current, { ...input, id: newId() }]));
  }, []);

  const updateRecord = useCallback((id: string, input: RecordInput) => {
    setRecords((current) =>
      sortByDate(current.map((record) => (record.id === id ? { ...input, id } : record)))
    );
  }, []);

  const deleteRecord = useCallback((id: string) => {
    setRecords((current) => current.filter((record) => record.id !== id));
  }, []);

  const toggleDone = useCallback((id: string) => {
    setRecords((current) => {
      const record = current.find((item) => item.id === id);
      if (!record) return current;

      const updated = current.map((item) => (item.id === id ? { ...item, done: !item.done } : item));
      if (record.done) return updated;

      const nextDate = nextOccurrence(record.date, record.repeat);
      const alreadyPlanned = current.some(
        (item) =>
          item.id !== id &&
          item.category === record.category &&
          item.title === record.title &&
          item.date === nextDate
      );
      if (!nextDate || alreadyPlanned) return updated;

      return sortByDate([...updated, { ...record, id: newId(), date: nextDate, done: false }]);
    });
  }, []);

  const value = useMemo(
    () => ({
      pet,
      records,
      getRecord,
      addRecord,
      updateRecord,
      deleteRecord,
      toggleDone,
      updatePet: setPet,
    }),
    [pet, records, getRecord, addRecord, updateRecord, deleteRecord, toggleDone]
  );

  return <CareContext.Provider value={value}>{children}</CareContext.Provider>;
}

export function useCare() {
  const context = useContext(CareContext);
  if (!context) {
    throw new Error('useCare must be used inside <CareProvider>');
  }
  return context;
}

/** Records that still need doing, split into overdue and upcoming. */
export function splitOpenRecords(records: CareRecord[], from = today()) {
  const open = records.filter((record) => !record.done);
  return {
    overdue: open.filter((record) => record.date < from),
    upcoming: open.filter((record) => record.date >= from),
  };
}
