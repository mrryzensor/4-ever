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

export const getDetailSectionOrder = (value?: string): DetailSectionId[] =>
  normalizeOrder(value, DEFAULT_DETAIL_SECTION_ORDER);

export function moveOrderedItem<T>(items: readonly T[], index: number, offset: -1 | 1): T[] {
  const destination = index + offset;
  if (index < 0 || index >= items.length || destination < 0 || destination >= items.length) {
    return [...items];
  }

  const updated = [...items];
  [updated[index], updated[destination]] = [updated[destination], updated[index]];
  return updated;
}
