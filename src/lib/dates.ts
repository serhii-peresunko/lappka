/** Local-time date helpers; ISO day strings are YYYY-MM-DD in the device's time zone. */

export const toIso = (date: Date) =>
  `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;

export const todayIso = () => toIso(new Date());

/** "15022024" -> "15.02.2024": keeps only digits and inserts the dots while typing. */
export function formatDateInput(input: string) {
  const digits = input.replace(/\D/g, '').slice(0, 8);
  return [digits.slice(0, 2), digits.slice(2, 4), digits.slice(4, 8)].filter(Boolean).join('.');
}

/** "15.02.2024" -> "2024-02-15", or null when it is not a real date. */
export function parseDateInput(text: string): string | null {
  const match = /^(\d{2})\.(\d{2})\.(\d{4})$/.exec(text);
  if (!match) return null;
  const [, dd, mm, yyyy] = match;
  const date = new Date(Number(yyyy), Number(mm) - 1, Number(dd));
  const real =
    date.getFullYear() === Number(yyyy) && date.getMonth() === Number(mm) - 1 && date.getDate() === Number(dd);
  return real ? `${yyyy}-${mm}-${dd}` : null;
}

/** "2024-02-15" -> "15.02.2024". */
export const isoToInput = (iso: string) => iso.split('-').reverse().join('.');

/** "0930" -> "09:30" while typing. */
export function formatTimeInput(input: string) {
  const digits = input.replace(/\D/g, '').slice(0, 4);
  return digits.length > 2 ? `${digits.slice(0, 2)}:${digits.slice(2)}` : digits;
}

export const isValidTime = (text: string) => /^([01]\d|2[0-3]):[0-5]\d$/.test(text);

/** 6 rows x 7 days (Monday first) covering the month; days outside the month have `inMonth` false. */
export function monthGrid(year: number, month: number) {
  const first = new Date(year, month, 1);
  const offset = (first.getDay() + 6) % 7;
  return Array.from({ length: 42 }, (_, index) => {
    const date = new Date(year, month, 1 - offset + index);
    return { iso: toIso(date), day: date.getDate(), inMonth: date.getMonth() === month };
  });
}
