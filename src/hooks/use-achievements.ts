import { useMemo } from 'react';

import { computeAchievements } from '@/lib/achievements';
import { useSession } from '@/providers/session';

/** All achievements with progress, plus how many are unlocked. */
export function useAchievements() {
  const { session, events } = useSession();
  const pet = session?.pet ?? null;
  return useMemo(() => {
    const list = computeAchievements(events, pet);
    return { list, unlockedCount: list.filter((item) => item.unlocked).length };
  }, [events, pet]);
}
