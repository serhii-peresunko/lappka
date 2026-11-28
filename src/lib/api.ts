import { supabase } from '@/lib/supabase';
import type { EventKind, Pet, PetEvent, PetSex, PetType, Repeat } from '@/providers/session';

/** All reads and writes. Row level security limits each of them to the signed-in user's own rows. */

const BUCKET = 'pet-photos';
const PHOTO_LINK_SECONDS = 60 * 60 * 24 * 7;
const PET_COLUMNS = 'id, type, name, sex, birth_date, approx_age_months, breed, bio, instagram, country, photo_path, chipped, verified';
const EVENT_COLUMNS = 'id, kind, description, date, time, repeat_every, repeat_unit';

type PetRow = {
  id: string;
  type: PetType;
  name: string;
  sex: PetSex;
  birth_date: string | null;
  approx_age_months: number | null;
  breed: string;
  bio: string;
  instagram: string | null;
  country: string;
  photo_path: string | null;
  chipped: boolean;
  verified: boolean;
};

type EventRow = {
  id: string;
  kind: EventKind;
  description: string;
  date: string;
  time: string | null;
  repeat_every: number | null;
  repeat_unit: Repeat['unit'] | null;
};

/** A pet as stored: the app's Pet plus the ids needed to change it. */
export type StoredPet = Pet & { id: string; photoPath: string | null };

async function photoLink(path: string | null) {
  if (!path) return null;
  // A missing file must not block the whole app, so a failed link just means "no photo".
  const { data } = await supabase.storage.from(BUCKET).createSignedUrl(path, PHOTO_LINK_SECONDS);
  return data?.signedUrl ?? null;
}

async function toPet(row: PetRow): Promise<StoredPet> {
  return {
    id: row.id,
    type: row.type,
    name: row.name,
    sex: row.sex,
    birthDate: row.birth_date,
    approxAgeMonths: row.approx_age_months,
    breed: row.breed,
    bio: row.bio,
    instagram: row.instagram,
    country: row.country,
    photoPath: row.photo_path,
    photo: await photoLink(row.photo_path),
    chipped: row.chipped,
    verified: row.verified,
  };
}

const toEvent = (row: EventRow): PetEvent => ({
  id: row.id,
  kind: row.kind,
  description: row.description,
  date: row.date,
  // Postgres returns "HH:MM:SS"; the app works with "HH:MM".
  time: row.time ? row.time.slice(0, 5) : null,
  repeat: row.repeat_every && row.repeat_unit ? { every: row.repeat_every, unit: row.repeat_unit } : null,
});

const eventFields = (event: Omit<PetEvent, 'id'>) => ({
  kind: event.kind,
  description: event.description,
  date: event.date,
  time: event.time,
  repeat_every: event.repeat?.every ?? null,
  repeat_unit: event.repeat?.unit ?? null,
});

export async function loadAccount(userId: string) {
  const [profile, pet, events] = await Promise.all([
    supabase.from('profiles').select('name').eq('id', userId).maybeSingle(),
    supabase.from('pets').select(PET_COLUMNS).maybeSingle(),
    supabase.from('events').select(EVENT_COLUMNS).order('date').order('time'),
  ]);
  const error = profile.error ?? pet.error ?? events.error;
  if (error) throw error;
  return {
    ownerName: (profile.data?.name as string | undefined) ?? '',
    pet: pet.data ? await toPet(pet.data as PetRow) : null,
    events: (events.data as EventRow[]).map(toEvent),
  };
}

export async function saveProfile(userId: string, name: string) {
  const { error } = await supabase.from('profiles').upsert({ id: userId, name });
  if (error) throw error;
}

/** Uploads a local picture into the user's folder and returns its storage path. */
async function uploadPhoto(userId: string, uri: string) {
  const response = await fetch(uri);
  const bytes = await response.arrayBuffer();
  const extension = /\.(png|webp|heic)$/i.exec(uri)?.[1]?.toLowerCase() ?? 'jpg';
  const path = `${userId}/${Date.now()}.${extension}`;
  const { error } = await supabase.storage.from(BUCKET).upload(path, bytes, {
    contentType: extension === 'jpg' ? 'image/jpeg' : `image/${extension}`,
  });
  if (error) throw error;
  return path;
}

/** Deleting an old file is tidying up: a failure leaves a stray file but must not fail the action. */
async function removePhoto(path: string | null) {
  if (path) await supabase.storage.from(BUCKET).remove([path]);
}

export async function createPet(userId: string, pet: Pet) {
  const photoPath = pet.photo ? await uploadPhoto(userId, pet.photo) : null;
  const { data, error } = await supabase
    .from('pets')
    .insert({
      type: pet.type,
      name: pet.name,
      sex: pet.sex,
      birth_date: pet.birthDate,
      approx_age_months: pet.approxAgeMonths,
      breed: pet.breed,
      bio: pet.bio,
      instagram: pet.instagram,
      country: pet.country ?? 'UA',
      photo_path: photoPath,
      chipped: pet.chipped,
    })
    .select(PET_COLUMNS)
    .single();
  if (error) {
    await removePhoto(photoPath);
    throw error;
  }
  return toPet(data as PetRow);
}

export async function replacePetPhoto(userId: string, pet: StoredPet, uri: string | null) {
  const photoPath = uri ? await uploadPhoto(userId, uri) : null;
  const { data, error } = await supabase.from('pets').update({ photo_path: photoPath }).eq('id', pet.id).select(PET_COLUMNS).single();
  if (error) {
    await removePhoto(photoPath);
    throw error;
  }
  await removePhoto(pet.photoPath);
  return toPet(data as PetRow);
}

/** The pet's events are deleted with it by the database. */
export async function deletePet(pet: StoredPet) {
  const { error } = await supabase.from('pets').delete().eq('id', pet.id);
  if (error) throw error;
  await removePhoto(pet.photoPath);
}

export async function createEvent(petId: string, event: Omit<PetEvent, 'id'>) {
  const { data, error } = await supabase
    .from('events')
    .insert({ pet_id: petId, ...eventFields(event) })
    .select(EVENT_COLUMNS)
    .single();
  if (error) throw error;
  return toEvent(data as EventRow);
}

export async function changeEvent(id: string, event: Omit<PetEvent, 'id'>) {
  const { data, error } = await supabase.from('events').update(eventFields(event)).eq('id', id).select(EVENT_COLUMNS).single();
  if (error) throw error;
  return toEvent(data as EventRow);
}

export async function deleteEvent(id: string) {
  const { error } = await supabase.from('events').delete().eq('id', id);
  if (error) throw error;
}
