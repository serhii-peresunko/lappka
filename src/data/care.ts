import type { AndroidSymbol } from 'expo-symbols';
import type { SFSymbol } from 'sf-symbols-typescript';

import type { Language } from '@/i18n/translations';
import { addDays, addMonths, type ISODate } from '@/lib/dates';

export type CareCategory =
  | 'vaccination'
  | 'parasite'
  | 'medication'
  | 'grooming'
  | 'checkup'
  | 'vet'
  | 'food'
  | 'other';

export type Repeat = 'none' | 'weekly' | 'monthly' | 'quarterly' | 'yearly';

export type CareRecord = {
  id: string;
  category: CareCategory;
  title: string;
  date: ISODate;
  /** Category-specific extra: vaccine batch, dosage, clinic, food brand... */
  details?: string;
  notes?: string;
  repeat: Repeat;
  done: boolean;
};

export type Pet = {
  name: string;
  species: string;
  breed: string;
  sex: 'Male' | 'Female';
  birthDate: ISODate;
  weightKg: string;
  color: string;
  neutered: boolean;
  microchip: string;
  passport: string;
  allergies: string;
  conditions: string;
  vetClinic: string;
  vetPhone: string;
  ownerName: string;
  ownerPhone: string;
};

/** Visual and behavioural metadata. Labels live in `@/i18n/translations`. */
type CategoryMeta = {
  color: string;
  icon: { ios: SFSymbol; android: AndroidSymbol; web: AndroidSymbol };
  defaultRepeat: Repeat;
};

export const CATEGORIES: Record<CareCategory, CategoryMeta> = {
  vaccination: {
    color: '#2F6FDE',
    icon: { ios: 'syringe.fill', android: 'vaccines', web: 'vaccines' },
    defaultRepeat: 'yearly',
  },
  parasite: {
    color: '#1E8E4E',
    icon: { ios: 'ladybug.fill', android: 'pest_control', web: 'pest_control' },
    defaultRepeat: 'monthly',
  },
  medication: {
    color: '#7C4DDB',
    icon: { ios: 'pills.fill', android: 'medication', web: 'medication' },
    defaultRepeat: 'none',
  },
  grooming: {
    color: '#D2407E',
    icon: { ios: 'scissors', android: 'content_cut', web: 'content_cut' },
    defaultRepeat: 'monthly',
  },
  checkup: {
    color: '#0E8C88',
    icon: { ios: 'stethoscope', android: 'stethoscope', web: 'stethoscope' },
    defaultRepeat: 'yearly',
  },
  vet: {
    color: '#C93A32',
    icon: { ios: 'cross.case.fill', android: 'local_hospital', web: 'local_hospital' },
    defaultRepeat: 'none',
  },
  food: {
    color: '#B86E00',
    icon: { ios: 'shippingbox.fill', android: 'local_shipping', web: 'local_shipping' },
    defaultRepeat: 'monthly',
  },
  other: {
    color: '#6B6661',
    icon: { ios: 'star.fill', android: 'star', web: 'star' },
    defaultRepeat: 'none',
  },
};

export const CATEGORY_ORDER: CareCategory[] = [
  'vaccination',
  'parasite',
  'medication',
  'grooming',
  'checkup',
  'vet',
  'food',
  'other',
];

export const REPEAT_ORDER: Repeat[] = ['none', 'weekly', 'monthly', 'quarterly', 'yearly'];

export function isCategory(value: unknown): value is CareCategory {
  return typeof value === 'string' && value in CATEGORIES;
}

export function nextOccurrence(date: ISODate, repeat: Repeat): ISODate | null {
  switch (repeat) {
    case 'weekly':
      return addDays(date, 7);
    case 'monthly':
      return addMonths(date, 1);
    case 'quarterly':
      return addMonths(date, 3);
    case 'yearly':
      return addMonths(date, 12);
    default:
      return null;
  }
}

export function sortByDate(records: CareRecord[]) {
  return [...records].sort((a, b) => a.date.localeCompare(b.date) || a.title.localeCompare(b.title));
}

// --- Mock data (UI only) ----------------------------------------------------
// Seeded in the app language at startup. These are user content, so they are
// not re-translated when the language changes later.

const MOCK_TEXT = {
  en: {
    pet: {
      species: 'Dog',
      breed: 'Corgi (Pembroke)',
      color: 'Red & white',
      allergies: 'Chicken',
      conditions: 'None',
      vetClinic: 'Happy Paws Vet Clinic',
      ownerName: 'Alex Moroz',
    },
    records: {
      rabies: ['Rabies', 'Happy Paws, batch RB-2291'],
      dhppi: ['DHPPi (combo)', 'Happy Paws Vet Clinic'],
      lepto: ['Leptospirosis', 'Happy Paws Vet Clinic'],
      flea: ['Flea & tick tablet', 'NexGard Spectra, 1 tablet'],
      worms: ['Deworming', 'Milbemax, 1 tablet'],
      ears: ['Ear drops', '3 drops each ear, twice a day', 'Finish the full 7-day course'],
      joints: ['Joint supplement', '1 chew daily'],
      bath: ['Bath & nail trim', 'Fluffy Studio, 11:00'],
      groom: ['Full groom', 'Fluffy Studio'],
      checkup: [
        'Annual wellness exam',
        'Happy Paws Vet Clinic',
        'Bring vaccination passport and a stool sample',
      ],
      earCheck: ['Ear infection check', 'Dr. Kovalenko', 'Prescribed ear drops for 7 days'],
      earFollowUp: ['Ear infection follow-up', 'Dr. Kovalenko'],
      food: ['Dry food delivery', 'Acana Puppy, 6 kg'],
      harness: ['Buy a new harness'],
    },
  },
  uk: {
    pet: {
      species: 'Собака',
      breed: 'Коргі (пемброк)',
      color: 'Рудо-білий',
      allergies: 'Курка',
      conditions: 'Немає',
      vetClinic: 'Ветклініка «Щасливі лапки»',
      ownerName: 'Олександр Мороз',
    },
    records: {
      rabies: ['Сказ', 'Щасливі лапки, серія RB-2291'],
      dhppi: ['Комплексна (DHPPi)', 'Ветклініка «Щасливі лапки»'],
      lepto: ['Лептоспіроз', 'Ветклініка «Щасливі лапки»'],
      flea: ['Таблетка від бліх і кліщів', 'NexGard Spectra, 1 таблетка'],
      worms: ['Дегельмінтизація', 'Мільбемакс, 1 таблетка'],
      ears: ['Краплі для вух', 'По 3 краплі в кожне вухо двічі на день', 'Пройти повний курс 7 днів'],
      joints: ['Добавка для суглобів', '1 жувальна таблетка щодня'],
      bath: ['Купання та стрижка кігтів', 'Fluffy Studio, 11:00'],
      groom: ['Повний грумінг', 'Fluffy Studio'],
      checkup: [
        'Щорічний профогляд',
        'Ветклініка «Щасливі лапки»',
        'Взяти ветпаспорт і аналіз калу',
      ],
      earCheck: ['Огляд вух', 'Д-р Коваленко', 'Призначили вушні краплі на 7 днів'],
      earFollowUp: ['Повторний огляд вух', 'Д-р Коваленко'],
      food: ['Доставка сухого корму', 'Acana Puppy, 6 кг'],
      harness: ['Купити нову шлейку'],
    },
  },
} as const;

export function createMockPet(base: ISODate, language: Language): Pet {
  const text = MOCK_TEXT[language].pet;
  return {
    name: language === 'uk' ? 'Бублик' : 'Bublyk',
    species: text.species,
    breed: text.breed,
    sex: 'Male',
    birthDate: addMonths(base, -28),
    weightKg: '12.4',
    color: text.color,
    neutered: true,
    microchip: '985 141 002 345 678',
    passport: 'UA-0123456',
    allergies: text.allergies,
    conditions: text.conditions,
    vetClinic: text.vetClinic,
    vetPhone: '+380 44 123 45 67',
    ownerName: text.ownerName,
    ownerPhone: '+380 67 000 00 00',
  };
}

export function createMockRecords(base: ISODate, language: Language): CareRecord[] {
  const text = MOCK_TEXT[language].records;
  const r = (
    id: string,
    category: CareCategory,
    [title, details, notes]: readonly string[],
    offsetDays: number,
    extra: Partial<CareRecord> = {}
  ): CareRecord => ({
    id,
    category,
    title,
    details,
    notes,
    date: addDays(base, offsetDays),
    repeat: CATEGORIES[category].defaultRepeat,
    done: offsetDays < 0,
    ...extra,
  });

  return [
    r('1', 'vaccination', text.rabies, -340),
    r('2', 'vaccination', text.dhppi, 25),
    r('3', 'vaccination', text.lepto, 25),
    r('4', 'parasite', text.flea, -2, { done: false }),
    r('5', 'parasite', text.worms, 12, { repeat: 'quarterly' }),
    r('6', 'medication', text.ears, 0),
    r('7', 'medication', text.joints, 3, { repeat: 'weekly' }),
    r('8', 'grooming', text.bath, 6),
    r('9', 'grooming', text.groom, -28),
    r('10', 'checkup', text.checkup, 40),
    r('11', 'vet', text.earCheck, -9),
    r('12', 'vet', text.earFollowUp, 5),
    r('13', 'food', text.food, 9),
    r('14', 'food', text.food, -21),
    r('15', 'other', text.harness, 15),
    // A busy day: shows several events on one calendar day.
    r('16', 'medication', text.joints, 25, { repeat: 'none' }),
    r('17', 'food', text.food, 25, { repeat: 'none' }),
  ];
}
