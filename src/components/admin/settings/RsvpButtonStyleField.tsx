import React from 'react';
import { CARD_THEMES } from '../../../lib/themes.ts';
import { XV_CARD_THEMES } from '../../../xv/themes.ts';
import { getRsvpButtonPresentation, RSVP_BUTTON_STYLE_OPTIONS } from '../../../lib/rsvpButtonStyle.ts';
import type { WeddingSettings } from '../../../types.ts';

interface RsvpButtonStyleFieldProps {
  settings: WeddingSettings;
  onChange: (updated: Partial<WeddingSettings>) => void;
}

export const RsvpButtonStyleField: React.FC<RsvpButtonStyleFieldProps> = ({ settings, onChange }) => {
  const themeMap = settings.eventType === 'xv' ? XV_CARD_THEMES : CARD_THEMES;
  const accentColor = settings.customAccentColor || themeMap[settings.cardStyle]?.accentColorHex || '#5A5A40';
  const preview = getRsvpButtonPresentation(settings.rsvpButtonStyle, settings.cardStyle, accentColor, true);

  return (
    <div className="min-w-0 space-y-2 sm:col-span-2">
      <label className="block text-xs font-semibold text-[#5A5A40]">Estilo del botón grande de confirmación:</label>
      <select
        value={settings.rsvpButtonStyle || 'auto'}
        onChange={(event) => onChange({ rsvpButtonStyle: event.target.value as WeddingSettings['rsvpButtonStyle'] })}
        className="w-full min-w-0 max-w-full cursor-pointer truncate rounded-xl border border-[#E5E2D0] bg-[#FAF9F0] px-3.5 py-2.5 text-sm text-[#3D3D3D] focus:border-[#5A5A40] focus:outline-none"
      >
        {RSVP_BUTTON_STYLE_OPTIONS.map((option) => (
          <option key={option.value} value={option.value}>{option.label}</option>
        ))}
      </select>
      <div className="flex min-h-16 min-w-0 items-center justify-center overflow-hidden rounded-xl border border-dashed border-[#E5E2D0] bg-white p-2">
        <span aria-hidden="true" className={`${preview.className} truncate`} style={preview.style}>
          {settings.rsvpButtonText?.trim() || 'Confirmar asistencia'}
        </span>
      </div>
    </div>
  );
};
