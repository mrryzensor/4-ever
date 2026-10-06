import type { Guest, RsvpOptionalField, WeddingSettings } from '../types.ts';

export const DEFAULT_RSVP_MAX_COMPANIONS = 5;
export const RSVP_BUILT_IN_OPTIONAL_FIELD_IDS = [
  'dietaryRestrictions',
  'suggestedSong',
  'message',
  'phone',
  'email',
] as const;

export const DEFAULT_RSVP_OPTIONAL_FIELDS: RsvpOptionalField[] = [
  {
    id: 'dietaryRestrictions',
    label: 'Restricciones alimentarias / alergias',
    placeholder: 'Ej. vegetariano, celíaco, alergia...',
    type: 'text',
  },
  {
    id: 'suggestedSong',
    label: 'Canción para la fiesta (DJ)',
    placeholder: 'Ej. Vivir Mi Vida - Marc Anthony',
    type: 'text',
  },
  {
    id: 'message',
    label: 'Mensaje o dedicatoria para los anfitriones',
    placeholder: 'Escribe unas palabras de felicitación o buenos deseos...',
    type: 'textarea',
  },
  {
    id: 'phone',
    label: 'Teléfono / WhatsApp',
    placeholder: 'Ej. +51 987 654 321',
    type: 'tel',
  },
  {
    id: 'email',
    label: 'Correo electrónico',
    placeholder: 'correo@ejemplo.com',
    type: 'email',
  },
];

const builtInFieldIds = new Set<string>(RSVP_BUILT_IN_OPTIONAL_FIELD_IDS);
const optionalFieldTypes = new Set<RsvpOptionalField['type']>(['text', 'textarea', 'tel', 'email']);

export function resolveRsvpMaxCompanions(value: WeddingSettings['rsvpMaxCompanions']): number {
  if (value == null) return DEFAULT_RSVP_MAX_COMPANIONS;
  const parsed = Number(value);
  if (!Number.isFinite(parsed)) return DEFAULT_RSVP_MAX_COMPANIONS;
  return Math.min(20, Math.max(0, Math.trunc(parsed)));
}

export function parseRsvpOptionalFields(value: WeddingSettings['rsvpOptionalFields']): RsvpOptionalField[] {
  if (value === undefined || value === null || value === '') return DEFAULT_RSVP_OPTIONAL_FIELDS.map((field) => ({ ...field }));

  let parsed: unknown = value;
  if (typeof value === 'string') {
    try {
      parsed = JSON.parse(value);
    } catch {
      return DEFAULT_RSVP_OPTIONAL_FIELDS.map((field) => ({ ...field }));
    }
  }
  if (!Array.isArray(parsed)) return DEFAULT_RSVP_OPTIONAL_FIELDS.map((field) => ({ ...field }));

  const seen = new Set<string>();
  return parsed.flatMap((candidate): RsvpOptionalField[] => {
    if (!candidate || typeof candidate !== 'object') return [];
    const field = candidate as Partial<RsvpOptionalField>;
    const id = typeof field.id === 'string' ? field.id.trim() : '';
    const validId = builtInFieldIds.has(id) || /^custom_[a-z0-9_-]{1,64}$/i.test(id);
    const label = typeof field.label === 'string' ? field.label.trim().slice(0, 100) : '';
    if (!validId || seen.has(id)) return [];
    seen.add(id);
    return [{
      id,
      label,
      placeholder: typeof field.placeholder === 'string' ? field.placeholder.slice(0, 160) : '',
      type: optionalFieldTypes.has(field.type as RsvpOptionalField['type'])
        ? field.type as RsvpOptionalField['type']
        : 'text',
    }];
  });
}

export function parseCustomRsvpDetails(value: Guest['customRsvpDetails'] | Record<string, unknown> | null | undefined): Record<string, string> {
  let parsed: unknown = value;
  if (typeof value === 'string') {
    try {
      parsed = JSON.parse(value);
    } catch {
      return {};
    }
  }
  if (!parsed || typeof parsed !== 'object' || Array.isArray(parsed)) return {};

  return Object.fromEntries(
    Object.entries(parsed as Record<string, unknown>)
      .filter(([id]) => /^custom_[a-z0-9_-]{1,64}$/i.test(id))
      .map(([id, answer]) => [id, typeof answer === 'string' ? answer.slice(0, 2000) : ''])
  );
}

export function getGuestRsvpOptionalValues(guest: Guest | null | undefined): Record<string, string> {
  if (!guest) return {};
  return {
    dietaryRestrictions: guest.dietaryRestrictions || '',
    suggestedSong: guest.suggestedSong || '',
    message: guest.message || '',
    phone: guest.phone || '',
    email: guest.email || '',
    ...parseCustomRsvpDetails(guest.customRsvpDetails),
  };
}

export function collectActiveRsvpOptionalValues(
  fields: RsvpOptionalField[],
  values: Record<string, string>,
): { builtIn: Record<string, string>; custom: Record<string, string> } {
  const builtIn: Record<string, string> = {};
  const custom: Record<string, string> = {};
  fields.forEach(({ id }) => {
    const answer = String(values[id] || '').slice(0, 2000);
    if (builtInFieldIds.has(id)) builtIn[id] = answer;
    else custom[id] = answer;
  });
  return { builtIn, custom };
}

export function hasRsvpOptionalAnswers(fields: RsvpOptionalField[], values: Record<string, string>): boolean {
  return fields.some(({ id }) => Boolean(values[id]?.trim()));
}
