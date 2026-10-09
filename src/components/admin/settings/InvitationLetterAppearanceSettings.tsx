import React from 'react';
import { Sparkles } from 'lucide-react';
import type { WeddingSettings } from '../../../types.ts';

interface InvitationLetterAppearanceSettingsProps {
  settings: WeddingSettings;
  onChange: (updates: Partial<WeddingSettings>) => void;
}

const ColorControl = ({
  label,
  value,
  fallback,
  onChange,
}: {
  label: string;
  value?: string;
  fallback: string;
  onChange: (value: string) => void;
}) => {
  const color = value || fallback;
  return (
    <label className="block min-w-0">
      <span className="mb-1.5 block text-xs font-semibold text-[#5A5A40]">{label}</span>
      <span className="flex items-center gap-2 rounded-xl border border-[#E5E2D0] bg-[#FAF9F0] p-2">
        <input
          type="color"
          value={color}
          onChange={(event) => onChange(event.target.value)}
          className="h-9 w-10 shrink-0 cursor-pointer rounded-lg border border-[#E5E2D0] bg-white p-0.5"
          aria-label={label}
        />
        <span className="truncate font-mono text-xs text-[#5A5A40]">{color.toUpperCase()}</span>
      </span>
    </label>
  );
};

const ShadowControl = ({
  label,
  value,
  fallback,
  onChange,
}: {
  label: string;
  value?: number;
  fallback: number;
  onChange: (value: number) => void;
}) => {
  const intensity = value ?? fallback;
  return (
    <label className="block min-w-0">
      <span className="mb-1.5 flex items-center justify-between gap-2 text-xs font-semibold text-[#5A5A40]">
        <span>{label}</span>
        <span className="font-mono font-normal text-stone-500">{intensity}%</span>
      </span>
      <input
        type="range"
        min="0"
        max="100"
        step="1"
        value={intensity}
        onChange={(event) => onChange(Number(event.target.value))}
        className="w-full accent-[#5A5A40]"
        aria-label={label}
      />
      <span className="mt-0.5 block text-[10px] text-stone-500">0% sin sombra · 100% intensa</span>
    </label>
  );
};

export const InvitationLetterAppearanceSettings: React.FC<InvitationLetterAppearanceSettingsProps> = ({ settings, onChange }) => (
  <section className="space-y-4 rounded-2xl border border-[#E5E2D0] bg-[#FAF9F0]/70 p-4 sm:p-5">
    <div className="flex items-start gap-2.5">
      <Sparkles className="mt-0.5 h-4 w-4 shrink-0 text-[#7D8C7A]" aria-hidden="true" />
      <div>
        <h3 className="text-sm font-bold text-[#3D3D3D]">Carta de entrada</h3>
        <p className="mt-0.5 text-xs leading-relaxed text-stone-600">
          Los textos usan la tipografía del estilo seleccionado. Personaliza aquí los tonos y las sombras del sobre y el sello.
        </p>
      </div>
    </div>

    <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-4">
      <ColorControl
        label="Color del sobre"
        value={settings.envelopeColor}
        fallback="#9F705A"
        onChange={(envelopeColor) => onChange({ envelopeColor })}
      />
      <ColorControl
        label="Color del sello"
        value={settings.waxSealColor}
        fallback="#C5A059"
        onChange={(waxSealColor) => onChange({ waxSealColor })}
      />
      <ColorControl
        label="Color de sombra del sobre"
        value={settings.envelopeShadowColor}
        fallback="#2C211B"
        onChange={(envelopeShadowColor) => onChange({ envelopeShadowColor })}
      />
      <ColorControl
        label="Color de sombra del sello"
        value={settings.waxSealShadowColor}
        fallback="#211A14"
        onChange={(waxSealShadowColor) => onChange({ waxSealShadowColor })}
      />
      <ShadowControl
        label="Intensidad de sombra del sobre"
        value={settings.envelopeShadowIntensity}
        fallback={36}
        onChange={(envelopeShadowIntensity) => onChange({ envelopeShadowIntensity })}
      />
      <ShadowControl
        label="Intensidad de sombra del sello"
        value={settings.waxSealShadowIntensity}
        fallback={55}
        onChange={(waxSealShadowIntensity) => onChange({ waxSealShadowIntensity })}
      />
    </div>
  </section>
);
