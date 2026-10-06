import React from 'react';
import type { WeddingSettings } from '../../../types.ts';
import { NUMBER_FONT_OPTIONS, resolveHeroNumberFontFamily } from '../../../lib/numberFonts.ts';

interface TypographyHeroNumberFontFieldProps {
  settings: WeddingSettings;
  onChange: (updated: Partial<WeddingSettings>) => void;
}

const HERO_NUMBER_FONT_OPTIONS = [
  { value: 'global', label: 'Usar tipografía global' },
  ...NUMBER_FONT_OPTIONS,
];

export const TypographyHeroNumberFontField: React.FC<TypographyHeroNumberFontFieldProps> = ({ settings, onChange }) => {
  const selectedFont = settings.typographyHeroNumberFont || 'global';
  const fontFamily = resolveHeroNumberFontFamily(selectedFont, settings.typographyNumberFont, settings);

  return (
    <div className="grid grid-cols-1 gap-3 rounded-xl border border-stone-200 bg-stone-50/70 p-3 sm:grid-cols-2 sm:items-center">
      <div>
        <label className="mb-1.5 block text-xs font-semibold text-stone-800" htmlFor="invitation-hero-number-font">
          Tipografía de los números del hero:
        </label>
        <select
          id="invitation-hero-number-font"
          value={selectedFont}
          onChange={(event) => onChange({ typographyHeroNumberFont: event.target.value })}
          className="w-full rounded-xl border border-stone-300 bg-white px-3 py-2.5 text-xs text-stone-800 outline-none focus:border-indigo-600"
        >
          {HERO_NUMBER_FONT_OPTIONS.map((font) => (
            <option key={font.value} value={font.value}>{font.label}</option>
          ))}
        </select>
        <p className="mt-1 text-[10px] text-stone-500">Puedes usar la fuente global o elegir una exclusiva para el hero.</p>
      </div>
      <div className="flex min-h-12 items-center justify-between gap-3 rounded-xl border border-stone-200 bg-white px-3 py-2">
        <span className="text-[10px] uppercase tracking-wider text-stone-500">Vista previa</span>
        <span className="text-2xl font-bold tabular-nums text-indigo-900" style={{ fontFamily }}>0123456789</span>
      </div>
    </div>
  );
};
