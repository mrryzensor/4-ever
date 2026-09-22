import { EventType, WeddingSettings } from '../types.ts';

const EVENT_TYPE_ALIASES = new Set(['xv', 'quince', 'quinceanera', 'quinceañera', '15', '15anos', '15años']);

const stripAccents = (value: string) =>
  value
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '');

const cleanNamePart = (value: string) =>
  stripAccents(value)
    .replace(/[^a-zA-Z0-9\s-]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();

const compactName = (value: string) => cleanNamePart(value).replace(/[^a-zA-Z0-9]/g, '');

/**
 * The application currently supports weddings and XV celebrations. Unknown
 * values intentionally fall back to weddings instead of changing the visual
 * editor based on a slug or an event id.
 */
export function normalizeEventType(value: unknown): EventType {
  const normalized = stripAccents(String(value ?? '')).trim().toLowerCase();
  return EVENT_TYPE_ALIASES.has(normalized) || normalized.includes('quince') || normalized.includes('xv')
    ? 'xv'
    : 'bodas';
}

/**
 * Explicit event_type is authoritative. Slug inference is only a compatibility
 * fallback for legacy rows that predate the event_type column.
 */
export function resolveEventType(value: unknown, slug?: unknown): EventType {
  if (value !== undefined && value !== null && String(value).trim() !== '') {
    return normalizeEventType(value);
  }

  const normalizedSlug = stripAccents(String(slug ?? '')).toLowerCase();
  return normalizedSlug.startsWith('xv-') || normalizedSlug.startsWith('quince-') || normalizedSlug.includes('-xv-')
    ? 'xv'
    : 'bodas';
}

export interface EventPresentation {
  type: EventType;
  label: string;
  defaultName: string;
  landingTitle: string;
  landingDescription: string;
  invitationTitle: (coupleNames: string, guestName?: string) => string;
  siteName: (coupleNames: string) => string;
  imageAlt: (coupleNames: string, formattedDate: string) => string;
}

const EVENT_PRESENTATIONS: Record<EventType, Omit<EventPresentation, 'type'>> = {
  bodas: {
    label: 'Boda',
    defaultName: 'Sofía & Alejandro',
    landingTitle: 'Atelier Nupcial Digital | Invitaciones Digitales de Boda Elegantes',
    landingDescription: 'Crea y comparte una invitación digital de boda con música, confirmación RSVP, itinerario, mapa y galería colaborativa.',
    invitationTitle: (coupleNames, guestName) => guestName
      ? `💌 ¡${guestName}, tienes una invitación para la Boda de ${coupleNames}!`
      : `💍 Boda de ${coupleNames} — Invitación Oficial`,
    siteName: (coupleNames) => `Boda de ${coupleNames}`,
    imageAlt: (coupleNames, formattedDate) => `Invitación de Boda de ${coupleNames} - ${formattedDate}`,
  },
  xv: {
    label: 'XV Años',
    defaultName: 'Valeria Montserrat',
    landingTitle: 'Atelier XV Años | Invitaciones Digitales de Quinceañera',
    landingDescription: 'Crea y comparte una invitación digital de XV Años con vals, cronograma, música, confirmación RSVP, mapa y galería.',
    invitationTitle: (coupleNames, guestName) => guestName
      ? `👑 ¡${guestName}, tienes una invitación a los XV Años de ${coupleNames}!`
      : `👑 XV Años de ${coupleNames} — Invitación Oficial`,
    siteName: (coupleNames) => `XV Años de ${coupleNames}`,
    imageAlt: (coupleNames, formattedDate) => `Invitación de XV Años de ${coupleNames} - ${formattedDate}`,
  },
};

export function getEventPresentation(value?: unknown, slug?: unknown): EventPresentation {
  const type = resolveEventType(value, slug);
  return { type, ...EVENT_PRESENTATIONS[type] };
}

function splitEventNames(value: string, eventType: EventType): string[] {
  const cleaned = cleanNamePart(value);
  if (!cleaned) return [];

  const explicitParts = cleaned
    .split(/\s*(?:&|\+|\/|,|\||\by\b|\band\b|\be\b)\s*/i)
    .map((part) => part.trim())
    .filter(Boolean);

  if (explicitParts.length > 1) return explicitParts;

  const words = cleaned.split(/\s+/).filter(Boolean);
  // For a wedding without a separator, use the first two names when possible.
  if (eventType === 'bodas' && words.length > 1) return words.slice(0, 2);
  return [cleaned];
}

function eventYear(eventDate?: string | Date | null): string {
  const raw = String(eventDate ?? '');
  const year = raw.match(/\b(20\d{2}|19\d{2})\b/)?.[1];
  if (year) return year;

  const parsed = new Date(raw);
  return Number.isNaN(parsed.getTime()) ? String(new Date().getFullYear()) : String(parsed.getFullYear());
}

/** Generates a readable, event-specific default hashtag. */
export function generateEventHashtag(
  coupleNames?: string | null,
  eventType?: unknown,
  eventDate?: string | Date | null,
): string {
  const type = normalizeEventType(eventType);
  const parts = splitEventNames(coupleNames || '', type);
  const year = eventYear(eventDate);

  if (type === 'xv') {
    const firstName = (parts[0] || coupleNames || 'Quinceanera').split(/\s+/)[0];
    const name = compactName(firstName) || 'Quinceanera';
    return `#MisXV${name}${year}`;
  }

  const first = compactName(parts[0] || 'Boda') || 'Boda';
  const second = compactName(parts[1] || '')
    ? `Y${compactName(parts[1])}`
    : '';
  return `#Boda${first}${second}${year}`;
}

/** Generates dynamic initials for the admin seal/header. */
export function generateDynamicInitials(coupleNames?: string | null, eventType?: unknown): string {
  const type = normalizeEventType(eventType);
  const names = stripAccents(String(coupleNames || ''))
    .replace(/[^a-zA-Z0-9\s&+/,|]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
  if (!names) return type === 'xv' ? 'XV' : 'W';

  const explicitParts = names
    .split(/\s*(?:&|\+|\/|,|\||\by\b|\band\b|\be\b)\s*/i)
    .map((part) => part.trim())
    .filter(Boolean);

  if (explicitParts.length > 1) {
    return explicitParts.slice(0, 2).map((part) => part.charAt(0).toUpperCase()).join('&');
  }

  const words = names.split(/\s+/).filter(Boolean);
  return words
    .slice(0, 2)
    .map((word) => word.charAt(0).toUpperCase())
    .join('') || (type === 'xv' ? 'XV' : 'W');
}

export function getDisplayedWaxSealText(settings?: Pick<WeddingSettings, 'coupleNames' | 'eventType' | 'waxSealText' | 'waxSealTextIsCustom'> | null): string {
  if (settings?.waxSealTextIsCustom === true && settings.waxSealText?.trim()) {
    return settings.waxSealText.trim();
  }
  return generateDynamicInitials(settings?.coupleNames, settings?.eventType);
}

/**
 * Centralizes editor updates so every mode (simple and advanced) keeps auto
 * values in sync while preserving values the user explicitly edited.
 */
export function applyWeddingSettingsChange<T extends Partial<WeddingSettings>>(
  current: WeddingSettings,
  updates: T,
): WeddingSettings {
  const next = { ...current, ...updates } as WeddingSettings;

  if (Object.prototype.hasOwnProperty.call(updates, 'hashtag')) {
    next.hashtagIsCustom = true;
  }

  if (Object.prototype.hasOwnProperty.call(updates, 'waxSealText')) {
    next.waxSealTextIsCustom = true;
  }

  const namesChanged = Object.prototype.hasOwnProperty.call(updates, 'coupleNames');
  const eventTypeChanged = Object.prototype.hasOwnProperty.call(updates, 'eventType');
  const dateChanged = Object.prototype.hasOwnProperty.call(updates, 'eventDate');

  if ((namesChanged || eventTypeChanged || dateChanged) && current.hashtagIsCustom !== true && !Object.prototype.hasOwnProperty.call(updates, 'hashtag')) {
    next.hashtag = generateEventHashtag(next.coupleNames, next.eventType, next.eventDate);
    next.hashtagIsCustom = false;
  }

  if ((namesChanged || eventTypeChanged) && current.waxSealTextIsCustom !== true && !Object.prototype.hasOwnProperty.call(updates, 'waxSealText')) {
    next.waxSealText = generateDynamicInitials(next.coupleNames, next.eventType);
    next.waxSealTextIsCustom = false;
  }

  return next;
}
