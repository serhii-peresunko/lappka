import type { StringKey } from '@/i18n/en';
import type { EventKind } from '@/providers/session';

export const EVENT_KIND_ORDER: EventKind[] = ['vet', 'vaccine', 'grooming', 'medication', 'other'];


/** One color per kind, used for the calendar dots and the event cards. */
export const KIND_COLORS: Record<EventKind, string> = {
  vet: '#111111',
  vaccine: '#4D4D4D',
  grooming: '#7A7A7A',
  medication: '#A0A0A0',
  other: '#C2C2C2',
};

/** SF Symbol (iOS) and Material (Android / web) icon names for each kind. */
export const KIND_ICONS: Record<EventKind, { ios: string; material: string }> = {
  vet: { ios: 'stethoscope', material: 'stethoscope' },
  vaccine: { ios: 'syringe.fill', material: 'vaccines' },
  grooming: { ios: 'scissors', material: 'content_cut' },
  medication: { ios: 'pills.fill', material: 'medication' },
  other: { ios: 'star.fill', material: 'star' },
};

/** Dictionary key for a kind's name. */
export const kindKey = (kind: EventKind) => `kind.${kind}` as StringKey;
