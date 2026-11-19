import type { EventKind } from '@/providers/session';

export const EVENT_KINDS: { value: EventKind; label: string }[] = [
  { value: 'vet', label: 'Vet visit' },
  { value: 'vaccine', label: 'Vaccination' },
  { value: 'grooming', label: 'Grooming' },
  { value: 'medication', label: 'Medication' },
  { value: 'other', label: 'Other' },
];

export const kindLabel = (kind: EventKind) => EVENT_KINDS.find((item) => item.value === kind)?.label ?? 'Other';

/** One color per kind, used for the calendar dots and the event cards. */
export const KIND_COLORS: Record<EventKind, string> = {
  vet: '#E5484D',
  vaccine: '#2F80ED',
  grooming: '#8E4EC6',
  medication: '#12A594',
  other: '#E5A00D',
};
