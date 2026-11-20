import type { Pet } from '@/providers/session';

/** A small stable hash (djb2) so a pet always gets the same mock numbers. */
function hash(text: string) {
  let h = 5381;
  for (let i = 0; i < text.length; i += 1) h = ((h << 5) + h + text.charCodeAt(i)) >>> 0;
  return h;
}

const digits = (seed: string, length: number) => {
  let out = '';
  let h = hash(seed);
  while (out.length < length) {
    out += String(h).padStart(10, '0');
    h = hash(String(h) + seed);
  }
  return out.slice(0, length);
};

/** Mock card number, e.g. "LP 4821 0937". A real one will come from the backend. */
export const cardNumber = (pet: Pet) => {
  const d = digits(`card:${pet.name}:${pet.birthDate ?? pet.approxAgeMonths}`, 8);
  return `LP ${d.slice(0, 4)} ${d.slice(4)}`;
};

/** Mock 15-digit ISO microchip number, e.g. "980 1234 5678 901". Only shown when the pet is chipped. */
export const chipNumber = (pet: Pet) => {
  const d = digits(`chip:${pet.name}:${pet.birthDate ?? pet.approxAgeMonths}`, 12);
  return `980 ${d.slice(0, 4)} ${d.slice(4, 8)} ${d.slice(8)}`;
};
