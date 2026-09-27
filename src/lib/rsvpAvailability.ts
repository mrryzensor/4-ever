import type { WeddingSettings } from '../types.ts';

export type RsvpAction = 'register' | 'edit';

export class RsvpAvailabilityError extends Error {
  readonly action: RsvpAction;

  constructor(action: RsvpAction, message = getRsvpClosedMessage(action)) {
    super(message);
    this.name = 'RsvpAvailabilityError';
    this.action = action;
  }
}

export function getRsvpClosedMessage(action: RsvpAction, settings?: Partial<WeddingSettings>) {
  const allowed = action === 'register' ? settings?.rsvpAllowRegistration : settings?.rsvpAllowEdit;
  if (allowed === false) {
    return action === 'register'
      ? 'Por el momento ya no se aceptan nuevas confirmaciones.'
      : 'La edición de respuestas está desactivada.';
  }
  return action === 'register'
    ? 'El plazo para registrar una respuesta ya finalizó.'
    : 'El plazo para editar esta respuesta ya finalizó.';
}

function localDateTimeToInstant(value: string, timeZone: string): Date | null {
  const match = value.trim().match(/^(\d{4})-(\d{2})-(\d{2})[T ](\d{2}):(\d{2})(?::(\d{2}))?/);
  if (!match) return null;

  const [, year, month, day, hour, minute, second = '0'] = match;
  const localAsUtc = Date.UTC(Number(year), Number(month) - 1, Number(day), Number(hour), Number(minute), Number(second));
  try {
    const formatter = new Intl.DateTimeFormat('en-CA', {
      timeZone,
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      hourCycle: 'h23',
    });
    const getOffset = (instant: number) => {
      const parts = Object.fromEntries(formatter.formatToParts(new Date(instant)).map((part) => [part.type, part.value]));
      const representedAsUtc = Date.UTC(
        Number(parts.year), Number(parts.month) - 1, Number(parts.day),
        Number(parts.hour), Number(parts.minute), Number(parts.second),
      );
      return representedAsUtc - instant;
    };

    // Resolve the event's wall-clock time in its configured IANA timezone.
    let instant = localAsUtc - getOffset(localAsUtc);
    instant = localAsUtc - getOffset(instant);
    const result = new Date(instant);
    return Number.isNaN(result.getTime()) ? null : result;
  } catch {
    // A stale/invalid timezone should not silently close RSVP. Fall back to the
    // application's default timezone, then to the runtime's local timezone.
    if (timeZone !== 'America/Lima') return localDateTimeToInstant(value, 'America/Lima');
    const result = new Date(value);
    return Number.isNaN(result.getTime()) ? null : result;
  }
}

export function getRsvpCutoff(settings: Partial<WeddingSettings>, action: RsvpAction): Date | null {
  const mode = action === 'register'
    ? settings.rsvpRegistrationCutoffMode
    : settings.rsvpEditCutoffMode;
  const customCutoff = action === 'register'
    ? settings.rsvpRegistrationCutoffAt
    : settings.rsvpEditCutoffAt;
  const eventDate = settings.eventDate?.trim();
  const eventTime = settings.eventTime?.trim();
  const localDateTime = mode === 'custom' && customCutoff?.trim()
    ? customCutoff.trim()
    : eventDate && eventTime
      ? `${eventDate}T${eventTime.slice(0, 5)}`
      : '';

  return localDateTime
    ? localDateTimeToInstant(localDateTime, settings.rsvpCutoffTimeZone || 'America/Lima')
    : null;
}

export function isRsvpActionAllowed(
  settings: Partial<WeddingSettings>,
  action: RsvpAction,
  now: Date = new Date(),
): boolean {
  const enabled = action === 'register' ? settings.rsvpAllowRegistration : settings.rsvpAllowEdit;
  if (enabled === false) return false;
  const cutoff = getRsvpCutoff(settings, action);
  return !cutoff || now.getTime() <= cutoff.getTime();
}

export function assertRsvpActionAllowed(settings: Partial<WeddingSettings>, action: RsvpAction) {
  if (!isRsvpActionAllowed(settings, action)) {
    throw new RsvpAvailabilityError(action, getRsvpClosedMessage(action, settings));
  }
}
