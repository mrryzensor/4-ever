import { DetailSectionId, LandingSectionId } from '../types.ts';

export const DEFAULT_LANDING_SECTION_ORDER: LandingSectionId[] = [
  'invitation',
  'gallery',
  'video',
  'hotels',
  'guestbook',
  'rsvp',
];

export const DEFAULT_DETAIL_SECTION_ORDER: DetailSectionId[] = [
  'ceremony',
  'reception',
  'rsvp',
  'itinerary',
  'gifts',
  'dress-code',
  'tips',
];

function normalizeOrder<T extends string>(value: string | undefined, defaults: readonly T[]): T[] {
  let parsed: unknown;
  try {
    parsed = value ? JSON.parse(value) : [];
  } catch {
    parsed = [];
  }

  const known = new Set<string>(defaults);
  const requested = Array.isArray(parsed)
    ? parsed.filter((item): item is T => typeof item === 'string' && known.has(item))
    : [];
  const uniqueRequested = [...new Set(requested)];
  return [...uniqueRequested, ...defaults.filter((item) => !uniqueRequested.includes(item))];
}

export const getLandingSectionOrder = (value?: string): LandingSectionId[] =>
  normalizeOrder(value, DEFAULT_LANDING_SECTION_ORDER);

export function getDetailSectionOrder(value?: string): DetailSectionId[] {
  const order = normalizeOrder(value, DEFAULT_DETAIL_SECTION_ORDER);
  let explicitlyOrderedRsvp = false;
  try {
    const parsed: unknown = value ? JSON.parse(value) : [];
    explicitlyOrderedRsvp = Array.isArray(parsed) && parsed.includes('rsvp');
  } catch {
    // Invalid legacy JSON uses the safe default position after Reception.
  }

  // Older saved invitations do not contain an RSVP-button slot. Keep their
  // chosen card order, but insert the new control immediately after Reception.
  if (!explicitlyOrderedRsvp) {
    const rsvpIndex = order.indexOf('rsvp');
    if (rsvpIndex >= 0) order.splice(rsvpIndex, 1);
    const receptionIndex = order.indexOf('reception');
    order.splice(receptionIndex + 1, 0, 'rsvp');
  }

  return order;
}

export function moveOrderedItem<T>(items: readonly T[], index: number, offset: -1 | 1): T[] {
  const destination = index + offset;
  if (index < 0 || index >= items.length || destination < 0 || destination >= items.length) {
    return [...items];
  }

  const updated = [...items];
  [updated[index], updated[destination]] = [updated[destination], updated[index]];
  return updated;
}
