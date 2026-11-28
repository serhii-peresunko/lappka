import type { StringKey } from '@/i18n/en';
import type { EventKind } from '@/providers/session';

export const EVENT_KIND_ORDER: EventKind[] = ['vet', 'vaccine', 'grooming', 'medication', 'other'];


/** The icon's colour: a deeper shade of the kind's tile. */
export const KIND_COLORS: Record<EventKind, string> = {
  vet: '#000000',
  vaccine: '#000000',
  grooming: '#000000',
  medication: '#000000',
  other: '#000000',
};

/** The pastel tile behind a kind's icon. */
export const KIND_SOFT: Record<EventKind, string> = {
  vet: '#CFCFCF',
  vaccine: '#CFCFCF',
  grooming: '#CFCFCF',
  medication: '#CFCFCF',
  other: '#CFCFCF',
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
