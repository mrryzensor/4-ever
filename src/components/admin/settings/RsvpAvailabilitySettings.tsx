import React from 'react';
import { CalendarClock, Clock3, PencilLine, UserPlus } from 'lucide-react';
import type { WeddingSettings } from '../../../types.ts';

interface RsvpAvailabilitySettingsProps {
  settings: WeddingSettings;
  onChange: (updated: Partial<WeddingSettings>) => void;
}

const TIME_ZONES = [
  ['America/Lima', 'Perú · Lima'],
  ['America/Mexico_City', 'México · Ciudad de México'],
  ['America/Bogota', 'Colombia · Bogotá'],
  ['America/Guayaquil', 'Ecuador · Quito / Guayaquil'],
  ['America/La_Paz', 'Bolivia · La Paz'],
  ['America/Santiago', 'Chile · Santiago'],
  ['America/Argentina/Buenos_Aires', 'Argentina · Buenos Aires'],
  ['America/Montevideo', 'Uruguay · Montevideo'],
  ['America/Caracas', 'Venezuela · Caracas'],
  ['America/Panama', 'Panamá · Panamá'],
  ['America/Costa_Rica', 'Costa Rica · San José'],
  ['America/Guatemala', 'Guatemala · Ciudad de Guatemala'],
  ['America/New_York', 'Estados Unidos · Este'],
  ['Europe/Madrid', 'España · Madrid'],
  ['UTC', 'UTC'],
] as const;

type CutoffAction = 'registration' | 'edit';

export const RsvpAvailabilitySettings: React.FC<RsvpAvailabilitySettingsProps> = ({ settings, onChange }) => {
  const eventDateTime = `${settings.eventDate || ''}T${(settings.eventTime || '17:00').slice(0, 5)}`;
  const timezone = settings.rsvpCutoffTimeZone || 'America/Lima';

  const changeMode = (action: CutoffAction, mode: 'event' | 'custom') => {
    if (action === 'registration') {
      onChange({
        rsvpRegistrationCutoffMode: mode,
        ...(mode === 'custom' && !settings.rsvpRegistrationCutoffAt ? { rsvpRegistrationCutoffAt: eventDateTime } : {}),
      });
    } else {
      onChange({
        rsvpEditCutoffMode: mode,
        ...(mode === 'custom' && !settings.rsvpEditCutoffAt ? { rsvpEditCutoffAt: eventDateTime } : {}),
      });
    }
  };

  const renderCutoff = (action: CutoffAction) => {
    const isRegistration = action === 'registration';
    const mode = isRegistration
      ? settings.rsvpRegistrationCutoffMode || 'event'
      : settings.rsvpEditCutoffMode || 'event';
    const value = isRegistration ? settings.rsvpRegistrationCutoffAt : settings.rsvpEditCutoffAt;
    const key = isRegistration ? 'rsvpRegistrationCutoffAt' : 'rsvpEditCutoffAt';
    const Icon = isRegistration ? UserPlus : PencilLine;
    const title = isRegistration ? 'Permitir registrar una respuesta' : 'Permitir editar una respuesta';
    const enabled = isRegistration ? settings.rsvpAllowRegistration !== false : settings.rsvpAllowEdit !== false;
    const toggleKey = isRegistration ? 'rsvpAllowRegistration' : 'rsvpAllowEdit';

    return (
      <div key={action} className="min-w-0 rounded-xl border border-[#E5E2D0] bg-white p-3.5 sm:p-4">
        <label className="flex min-w-0 cursor-pointer items-start gap-2.5">
          <input
            type="checkbox"
            checked={enabled}
            onChange={(event) => onChange({ [toggleKey]: event.target.checked } as Partial<WeddingSettings>)}
            className="mt-0.5 h-4 w-4 shrink-0 accent-[#5A5A40]"
          />
          <span className="min-w-0">
            <span className="flex items-center gap-1.5 text-xs font-semibold text-[#3D3D3D]">
              <Icon className="h-3.5 w-3.5 shrink-0 text-[#7D8C7A]" />
              {title}
            </span>
            <span className="mt-1 block text-[10px] leading-relaxed text-[#7D8C7A]">
              {isRegistration
                ? 'Controla hasta cuándo se aceptan nuevas confirmaciones.'
                : 'Controla hasta cuándo un invitado puede cambiar su respuesta guardada.'}
            </span>
          </span>
        </label>

        <div className="mt-3 min-w-0 space-y-2">
          <select
            aria-label={`Fecha límite para ${isRegistration ? 'registrar' : 'editar'}`}
            value={mode}
            onChange={(event) => changeMode(action, event.target.value as 'event' | 'custom')}
            className="block min-w-0 w-full rounded-lg border border-[#E5E2D0] bg-[#FAF9F0] px-3 py-2.5 text-[11px] text-[#3D3D3D] focus:border-[#5A5A40] focus:outline-none"
          >
            <option value="event">Fecha y hora del evento</option>
            <option value="custom">Fecha y hora personalizada</option>
          </select>
          {mode === 'custom' ? (
            <input
              type="datetime-local"
              aria-label={`Fecha y hora personalizada para ${isRegistration ? 'registrar' : 'editar'}`}
              value={value || eventDateTime}
              onChange={(event) => onChange({ [key]: event.target.value } as Partial<WeddingSettings>)}
              className="block min-w-0 w-full rounded-lg border border-[#E5E2D0] bg-[#FAF9F0] px-3 py-2.5 text-[11px] text-[#3D3D3D] focus:border-[#5A5A40] focus:outline-none"
            />
          ) : (
            <p className="flex min-w-0 items-center gap-1.5 rounded-lg bg-[#FAF9F0] px-3 py-2 text-[10px] leading-relaxed text-[#706F5A]">
              <CalendarClock className="h-3.5 w-3.5 shrink-0" />
              Se sincroniza con la fecha y hora configuradas para el evento.
            </p>
          )}
        </div>
      </div>
    );
  };

  return (
    <section className="min-w-0 rounded-2xl border border-[#E5E2D0] bg-[#FAF9F0]/70 p-3.5 sm:p-4" aria-labelledby="rsvp-availability-heading">
      <div className="flex flex-col gap-2 border-b border-[#E5E2D0] pb-3 sm:flex-row sm:items-start sm:justify-between">
        <div className="flex min-w-0 items-start gap-2">
          <Clock3 className="mt-0.5 h-4 w-4 shrink-0 text-[#7D8C7A]" />
          <div className="min-w-0">
            <h4 id="rsvp-availability-heading" className="text-xs font-bold text-[#3D3D3D]">Disponibilidad del RSVP</h4>
            <p className="mt-1 text-[10px] leading-relaxed text-[#7D8C7A]">
              Los plazos de registro y edición son independientes. Si no eliges una fecha personalizada, vencen al iniciar el evento.
            </p>
          </div>
        </div>
        <label className="flex shrink-0 items-center gap-1.5 text-[10px] text-[#706F5A]">
          Zona horaria
          <select
            value={timezone}
            onChange={(event) => onChange({ rsvpCutoffTimeZone: event.target.value })}
            className="max-w-[190px] rounded-lg border border-[#E5E2D0] bg-white px-2 py-1.5 text-[10px] text-[#3D3D3D] focus:border-[#5A5A40] focus:outline-none"
          >
            {TIME_ZONES.map(([value, label]) => <option key={value} value={value}>{label}</option>)}
            {!TIME_ZONES.some(([value]) => value === timezone) && <option value={timezone}>{timezone}</option>}
          </select>
        </label>
      </div>
      <div className="mt-3 grid min-w-0 grid-cols-1 gap-3 lg:grid-cols-2">
        {renderCutoff('registration')}
        {renderCutoff('edit')}
      </div>
    </section>
  );
};
