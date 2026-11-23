import { toIso } from '@/lib/dates';
import type { PetEvent, Repeat } from '@/providers/session';

const MAX_OCCURRENCES = 800;

function addTo(start: Date, repeat: Repeat, step: number) {
  const date = new Date(start);
  const n = repeat.every * step;
  if (repeat.unit === 'day') date.setDate(start.getDate() + n);
  else if (repeat.unit === 'week') date.setDate(start.getDate() + n * 7);
  else if (repeat.unit === 'month') {
    // Jan 31 + 1 month is Feb 28/29, not March 3.
    const target = new Date(start.getFullYear(), start.getMonth() + n, 1);
    const last = new Date(target.getFullYear(), target.getMonth() + 1, 0).getDate();
    date.setFullYear(target.getFullYear(), target.getMonth(), Math.min(start.getDate(), last));
  } else {
    const last = new Date(start.getFullYear() + n, start.getMonth() + 1, 0).getDate();
    date.setFullYear(start.getFullYear() + n, start.getMonth(), Math.min(start.getDate(), last));
  }
  return date;
}

/**
 * Every day an event happens on within [from, to] (YYYY-MM-DD, inclusive), as copies of the event with that
 * day as `date`. A one-off event gives itself at most once; a repeating one gives each of its repeats.
 */
export function expandEvents(events: PetEvent[], from: string, to: string): PetEvent[] {
  const out: PetEvent[] = [];
  for (const event of events) {
    if (!event.repeat) {
      if (event.date >= from && event.date <= to) out.push(event);
      continue;
    }
    const start = new Date(`${event.date}T12:00:00`);
    for (let step = 0; step < MAX_OCCURRENCES; step++) {
      const iso = toIso(addTo(start, event.repeat, step));
      if (iso > to) break;
      if (iso >= from) out.push(step === 0 ? event : { ...event, id: `${event.id}@${iso}`, date: iso });
    }
  }
  return out;
}

/** Every event from today on (a year ahead), repeats included, in time order. */
export function upcomingEvents(events: PetEvent[]): PetEvent[] {
  const today = toIso(new Date());
  const end = new Date(`${today}T12:00:00`);
  end.setFullYear(end.getFullYear() + 1);
  return expandEvents(events, today, toIso(end)).sort((a, b) =>
    `${a.date} ${a.time ?? ''}`.localeCompare(`${b.date} ${b.time ?? ''}`)
  );
}

/** The latest vaccination event that has already happened (today counts), repeats included; null if there is none. */
export function lastVaccination(events: PetEvent[]): PetEvent | null {
  const today = toIso(new Date());
  const past = expandEvents(
    events.filter((event) => event.kind === 'vaccine'),
    '2000-01-01',
    today
  ).sort((a, b) => `${a.date} ${a.time ?? ''}`.localeCompare(`${b.date} ${b.time ?? ''}`));
  return past.length > 0 ? past[past.length - 1] : null;
}
