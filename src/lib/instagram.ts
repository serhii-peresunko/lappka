const HANDLE = /^[A-Za-z0-9._]{1,30}$/;

/**
 * Accepts "@name", "name" or a profile link and returns the bare handle.
 * Empty input is fine (the field is optional) and gives null; anything else that is not a handle gives undefined.
 */
export function parseInstagram(input: string): string | null | undefined {
  const text = input.trim();
  if (!text) return null;
  const fromLink = /^(?:https?:\/\/)?(?:www\.)?instagram\.com\/([^/?#\s]+)/i.exec(text);
  const handle = (fromLink ? fromLink[1] : text).replace(/^@/, '');
  return HANDLE.test(handle) ? handle : undefined;
}

export const instagramUrl = (handle: string) => `https://instagram.com/${handle}`;
