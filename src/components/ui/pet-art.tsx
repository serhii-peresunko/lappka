import type { PetType } from '@/providers/session';

import { CatLineArt, type CatEars } from './cat-line-art';
import { DogLineArt, type DogEars } from './dog-line-art';

type PetArtProps = {
  type: PetType;
  size?: number;
  color: string;
  accent?: string;
  bandana?: boolean;
  strokeWidth?: number;
  /** Coat color for the head and ears. */
  fill?: string;
  /** Ear shape; must match the pet type (dog: floppy / pointy / round, cat: pointy / fold / big). */
  ears?: DogEars | CatEars;
};

/** The illustration for a pet type, so screens do not branch on dog / cat themselves. */
export function PetArt({ type, ears, ...props }: PetArtProps) {
  return type === 'cat' ? (
    <CatLineArt {...props} ears={ears as CatEars | undefined} />
  ) : (
    <DogLineArt {...props} ears={ears as DogEars | undefined} />
  );
}
