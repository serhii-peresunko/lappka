import type { EventKind, Pet, PetEvent } from '@/providers/session';

import { todayIso } from './dates';

export type Achievement = {
  /** Text lives in the dictionaries as ach.<id>.title and ach.<id>.desc. */
  id: string;
  icon: { ios: string; material: string };
  /** Accent color of the badge. */
  color: string;
  /** How many of the counted thing it takes to unlock. */
  target: number;
};

type Counts = { total: number; byKind: Record<EventKind, number>; instagram: number };

type Definition = Achievement & { count: (counts: Counts) => number };

const kind = (k: EventKind) => (counts: Counts) => counts.byKind[k];

const DEFINITIONS: Definition[] = [
  {
    id: 'first-event',
    icon: { ios: 'flag.fill', material: 'flag' },
    color: '#111111',
    target: 1,
    count: (c) => c.total,
  },
  {
    id: 'planner',
    icon: { ios: 'calendar.badge.checkmark', material: 'event_available' },
    color: '#333333',
    target: 10,
    count: (c) => c.total,
  },
  {
    id: 'first-vaccine',
    icon: { ios: 'syringe.fill', material: 'vaccines' },
    color: '#4A4A4A',
    target: 1,
    count: kind('vaccine'),
  },
  {
    id: 'vaccine-hero',
    icon: { ios: 'shield.checkered', material: 'verified_user' },
    color: '#111111',
    target: 10,
    count: kind('vaccine'),
  },
  {
    id: 'fresh-clean',
    icon: { ios: 'scissors', material: 'content_cut' },
    color: '#333333',
    target: 1,
    count: kind('grooming'),
  },
  {
    id: 'style-icon',
    icon: { ios: 'sparkles', material: 'auto_awesome' },
    color: '#4A4A4A',
    target: 5,
    count: kind('grooming'),
  },
  {
    id: 'vet-friend',
    icon: { ios: 'stethoscope', material: 'stethoscope' },
    color: '#111111',
    target: 1,
    count: kind('vet'),
  },
  {
    id: 'health-hero',
    icon: { ios: 'heart.fill', material: 'favorite' },
    color: '#333333',
    target: 5,
    count: kind('vet'),
  },
  {
    id: 'pill-pro',
    icon: { ios: 'pills.fill', material: 'medication' },
    color: '#4A4A4A',
    target: 5,
    count: kind('medication'),
  },
  {
    id: 'social-star',
    icon: { ios: 'camera.fill', material: 'photo_camera' },
    color: '#111111',
    target: 1,
    count: (c) => c.instagram,
  },
];

export type AchievementStatus = Achievement & { current: number; unlocked: boolean };

/**
 * Progress for every achievement. Only events dated today or earlier count, since a future
 * event has not happened yet.
 */
export function computeAchievements(events: PetEvent[], pet: Pet | null): AchievementStatus[] {
  const today = todayIso();
  const counts: Counts = {
    total: 0,
    byKind: { vet: 0, vaccine: 0, grooming: 0, medication: 0, other: 0 },
    instagram: pet?.instagram ? 1 : 0,
  };
  for (const event of events) {
    if (event.date > today) continue;
    counts.total += 1;
    counts.byKind[event.kind] += 1;
  }
  return DEFINITIONS.map(({ count, ...achievement }) => {
    const current = Math.min(count(counts), achievement.target);
    return { ...achievement, current, unlocked: current >= achievement.target };
  });
}
