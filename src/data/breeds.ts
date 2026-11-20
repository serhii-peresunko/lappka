import type { CatEars } from '@/components/ui/cat-line-art';
import type { DogEars } from '@/components/ui/dog-line-art';
import type { PetType } from '@/providers/session';

export const MIXED_BREED = 'Mixed breed';

/** Coat colors used by the breed icons. */
const COAT = {
  cream: '#EFEFEF',
  golden: '#C9C9C9',
  red: '#9A9A9A',
  brown: '#7A7A7A',
  chocolate: '#4A4A4A',
  black: '#2B2B2B',
  white: '#FFFFFF',
  gray: '#BDBDBD',
  blue: '#A5A5A5',
  sand: '#DADADA',
  fawn: '#B0B0B0',
  tabby: '#8C8C8C',
} as const;

export type Breed<E> = { name: string; coat: string; ears: E };

const dog = (name: string, coat: string, ears: DogEars): Breed<DogEars> => ({ name, coat, ears });
const cat = (name: string, coat: string, ears: CatEars): Breed<CatEars> => ({ name, coat, ears });

const DOGS: Breed<DogEars>[] = [
  dog('Cocker Spaniel', COAT.golden, 'floppy'),
  dog('Labrador Retriever', COAT.sand, 'floppy'),
  dog('Golden Retriever', COAT.golden, 'floppy'),
  dog('German Shepherd', COAT.brown, 'pointy'),
  dog('Corgi (Pembroke)', COAT.red, 'pointy'),
  dog('Corgi (Cardigan)', COAT.fawn, 'pointy'),
  dog('French Bulldog', COAT.fawn, 'pointy'),
  dog('English Bulldog', COAT.cream, 'round'),
  dog('Poodle', COAT.white, 'round'),
  dog('Beagle', COAT.brown, 'floppy'),
  dog('Rottweiler', COAT.black, 'floppy'),
  dog('Dachshund', COAT.chocolate, 'floppy'),
  dog('Yorkshire Terrier', COAT.blue, 'pointy'),
  dog('Boxer', COAT.fawn, 'round'),
  dog('Siberian Husky', COAT.gray, 'pointy'),
  dog('Chihuahua', COAT.cream, 'pointy'),
  dog('Shih Tzu', COAT.cream, 'floppy'),
  dog('Pomeranian', COAT.red, 'round'),
  dog('Border Collie', COAT.black, 'floppy'),
  dog('Australian Shepherd', COAT.blue, 'floppy'),
  dog('Cavalier King Charles Spaniel', COAT.red, 'floppy'),
  dog('Maltese', COAT.white, 'floppy'),
  dog('Jack Russell Terrier', COAT.white, 'floppy'),
  dog('Dobermann', COAT.black, 'pointy'),
  dog('Great Dane', COAT.gray, 'floppy'),
  dog('Saint Bernard', COAT.red, 'floppy'),
  dog('Alaskan Malamute', COAT.gray, 'round'),
  dog('Akita Inu', COAT.red, 'pointy'),
  dog('Shiba Inu', COAT.red, 'pointy'),
  dog('Samoyed', COAT.white, 'round'),
  dog('Pug', COAT.fawn, 'floppy'),
  dog('Bernese Mountain Dog', COAT.black, 'floppy'),
  dog('West Highland White Terrier', COAT.white, 'pointy'),
  dog('Staffordshire Bull Terrier', COAT.fawn, 'round'),
  dog('Basset Hound', COAT.brown, 'floppy'),
  dog('Dalmatian', COAT.white, 'floppy'),
  dog('Papillon', COAT.white, 'pointy'),
  dog('Schnauzer', COAT.gray, 'pointy'),
  dog('Chow Chow', COAT.red, 'round'),
  dog('Newfoundland', COAT.black, 'floppy'),
  dog('Caucasian Shepherd', COAT.sand, 'floppy'),
  dog('Belgian Malinois', COAT.fawn, 'pointy'),
  dog('Greyhound', COAT.gray, 'pointy'),
];

const CATS: Breed<CatEars>[] = [
  cat('British Shorthair', COAT.blue, 'pointy'),
  cat('Maine Coon', COAT.tabby, 'big'),
  cat('Scottish Fold', COAT.gray, 'fold'),
  cat('Siamese', COAT.cream, 'big'),
  cat('Persian', COAT.cream, 'fold'),
  cat('Bengal', COAT.golden, 'pointy'),
  cat('Ragdoll', COAT.white, 'pointy'),
  cat('Sphynx', '#E2E2E2', 'big'),
  cat('Russian Blue', COAT.blue, 'pointy'),
  cat('Abyssinian', COAT.red, 'big'),
  cat('Norwegian Forest Cat', COAT.tabby, 'big'),
  cat('Siberian', COAT.gray, 'pointy'),
  cat('Birman', COAT.cream, 'pointy'),
  cat('American Shorthair', COAT.gray, 'pointy'),
  cat('Oriental Shorthair', COAT.chocolate, 'big'),
  cat('Burmese', COAT.chocolate, 'pointy'),
  cat('Devon Rex', COAT.gray, 'big'),
  cat('Cornish Rex', COAT.white, 'big'),
  cat('Exotic Shorthair', COAT.sand, 'fold'),
  cat('Turkish Angora', COAT.white, 'pointy'),
  cat('Domestic shorthair', COAT.tabby, 'pointy'),
  cat('Domestic longhair', COAT.red, 'pointy'),
];

export type BreedEntry = { name: string; coat: string; ears: DogEars | CatEars };

const MIXED: Record<PetType, BreedEntry> = {
  dog: { name: MIXED_BREED, coat: '#D0D0D0', ears: 'floppy' },
  cat: { name: MIXED_BREED, coat: '#D0D0D0', ears: 'pointy' },
};

/** Breeds for a pet type: "Mixed breed" first, then A to Z. */
export function breedsFor(type: PetType): BreedEntry[] {
  const list: BreedEntry[] = type === 'cat' ? CATS : DOGS;
  return [MIXED[type], ...[...list].sort((a, b) => a.name.localeCompare(b.name))];
}

/** Icon data for a breed name; unknown (typed-in) breeds get a neutral look. */
export function breedLook(type: PetType, name: string): Pick<BreedEntry, 'coat' | 'ears'> {
  const found = breedsFor(type).find((entry) => entry.name.toLowerCase() === name.trim().toLowerCase());
  return found ?? MIXED[type];
}

/** Ukrainian names for the built-in breeds; anything else (a typed-in breed) is shown as typed. */
const UK_NAMES: Record<string, string> = {
  'Mixed breed': 'Метис',
  'Cocker Spaniel': 'Кокер-спанієль',
  'Labrador Retriever': 'Лабрадор-ретривер',
  'Golden Retriever': 'Золотистий ретривер',
  'German Shepherd': 'Німецька вівчарка',
  'Corgi (Pembroke)': 'Коргі (пемброк)',
  'Corgi (Cardigan)': 'Коргі (кардиган)',
  'French Bulldog': 'Французький бульдог',
  'English Bulldog': 'Англійський бульдог',
  Poodle: 'Пудель',
  Beagle: 'Бігль',
  Rottweiler: 'Ротвейлер',
  Dachshund: 'Такса',
  'Yorkshire Terrier': 'Йоркширський тер’єр',
  Boxer: 'Боксер',
  'Siberian Husky': 'Сибірський хаскі',
  Chihuahua: 'Чихуахуа',
  'Shih Tzu': 'Ші-тцу',
  Pomeranian: 'Померанський шпіц',
  'Border Collie': 'Бордер-коллі',
  'Australian Shepherd': 'Австралійська вівчарка',
  'Cavalier King Charles Spaniel': 'Кавалер-кінг-чарльз-спанієль',
  Maltese: 'Мальтійська болонка',
  'Jack Russell Terrier': 'Джек-рассел-тер’єр',
  Dobermann: 'Доберман',
  'Great Dane': 'Німецький дог',
  'Saint Bernard': 'Сенбернар',
  'Alaskan Malamute': 'Аляскинський маламут',
  'Akita Inu': 'Акіта-іну',
  'Shiba Inu': 'Сіба-іну',
  Samoyed: 'Самоїд',
  Pug: 'Мопс',
  'Bernese Mountain Dog': 'Бернський зенненхунд',
  'West Highland White Terrier': 'Вест-хайленд-вайт-тер’єр',
  'Staffordshire Bull Terrier': 'Стаффордширський бультер’єр',
  'Basset Hound': 'Бассет-хаунд',
  Dalmatian: 'Далматин',
  Papillon: 'Папійон',
  Schnauzer: 'Шнауцер',
  'Chow Chow': 'Чау-чау',
  Newfoundland: 'Ньюфаундленд',
  'Caucasian Shepherd': 'Кавказька вівчарка',
  'Belgian Malinois': 'Бельгійська вівчарка (малінуа)',
  Greyhound: 'Грейхаунд',
  'British Shorthair': 'Британська короткошерста',
  'Maine Coon': 'Мейн-кун',
  'Scottish Fold': 'Шотландська висловуха',
  Siamese: 'Сіамська',
  Persian: 'Перська',
  Bengal: 'Бенгальська',
  Ragdoll: 'Регдол',
  Sphynx: 'Сфінкс',
  'Russian Blue': 'Російська блакитна',
  Abyssinian: 'Абіссінська',
  'Norwegian Forest Cat': 'Норвезька лісова',
  Siberian: 'Сибірська',
  Birman: 'Священна бірма',
  'American Shorthair': 'Американська короткошерста',
  'Oriental Shorthair': 'Орієнтальна короткошерста',
  Burmese: 'Бурманська',
  'Devon Rex': 'Девон-рекс',
  'Cornish Rex': 'Корніш-рекс',
  'Exotic Shorthair': 'Екзотична короткошерста',
  'Turkish Angora': 'Турецька ангора',
  'Domestic shorthair': 'Домашня короткошерста',
  'Domestic longhair': 'Домашня довгошерста',
};

/** The breed name to show for a stored (English) breed name. */
export function breedName(name: string, lang: 'uk' | 'en'): string {
  return lang === 'uk' ? (UK_NAMES[name] ?? name) : name;
}
