import { useRouter } from 'expo-router';

import type { PetEvent } from '@/providers/session';

/** The id of the stored event behind a shown one (repeats are shown with ids like "id@2026-12-04"). */
export const baseEventId = (id: string) => id.split('@')[0];

/**
 * What a tap on an event does: it opens the event in the bottom sheet, where it can be changed or deleted.
 * A repeating event is changed and deleted as a whole.
 */
export function useEventActions() {
  const router = useRouter();
  return (event: PetEvent) => router.push({ pathname: '/add-event', params: { id: baseEventId(event.id) } });
}
