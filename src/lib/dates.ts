/**
 * Dates are stored as local calendar days in `YYYY-MM-DD` form. Care events are
 * day-based, so this avoids time-zone drift that full timestamps would bring.
 * Text formatting that depends on the app language lives in `@/i18n`.
 */
export type ISODate = string;

const pad = (value: number) => String(value).padStart(2, '0');

export function toISODate(date: Date): ISODate {
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`;
}

export function fromISODate(value: ISODate): Date {
  const [year, month, day] = value.split('-').map(Number);
  return new Date(year, month - 1, day);
}

export function today(): ISODate {
  return toISODate(new Date());
}

export function addDays(value: ISODate, days: number): ISODate {
  const date = fromISODate(value);
  date.setDate(date.getDate() + days);
  return toISODate(date);
}

/** Adds calendar months, clamping to the last day (Jan 31 + 1 month = Feb 28/29). */
export function addMonths(value: ISODate, months: number): ISODate {
  const date = fromISODate(value);
  const day = date.getDate();
  date.setDate(1);
  date.setMonth(date.getMonth() + months);
  const lastDay = new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate();
  date.setDate(Math.min(day, lastDay));
  return toISODate(date);
}

/** Whole days from `from` to `to` (negative when `to` is in the past). */
export function daysBetween(from: ISODate, to: ISODate): number {
  const ms = fromISODate(to).getTime() - fromISODate(from).getTime();
  return Math.round(ms / 86_400_000);
}

export function formatDate(value: ISODate, locale: string, options: Intl.DateTimeFormatOptions = {}) {
  return fromISODate(value).toLocaleDateString(locale, {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
    ...options,
  });
}

export function formatMonth(year: number, month: number, locale: string) {
  const text = new Date(year, month, 1).toLocaleDateString(locale, { month: 'long', year: 'numeric' });
  // Ukrainian month names come back lower-case ("листопад 2026 р.").
  return text.charAt(0).toUpperCase() + text.slice(1);
}

/**
 * Days to draw for a month view, Monday first. Leading/trailing cells from
 * neighbouring months are `null` so the grid stays aligned.
 */
export function monthGrid(year: number, month: number): (ISODate | null)[] {
  const first = new Date(year, month, 1);
  const leading = (first.getDay() + 6) % 7;
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const cells: (ISODate | null)[] = Array.from({ length: leading }, () => null);
  for (let day = 1; day <= daysInMonth; day++) {
    cells.push(toISODate(new Date(year, month, day)));
  }
  while (cells.length % 7 !== 0) cells.push(null);
  return cells;
}
