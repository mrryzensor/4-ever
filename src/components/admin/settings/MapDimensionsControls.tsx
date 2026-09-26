import React from 'react';
import type { WeddingSettings } from '../../../types.ts';

interface MapDimensionsControlsProps {
  settings: WeddingSettings;
  onChange: (updated: Partial<WeddingSettings>) => void;
}

export const MapDimensionsControls: React.FC<MapDimensionsControlsProps> = ({ settings, onChange }) => {
  const controls = [
    { key: 'mapMobileWidth', label: 'Ancho en móvil', min: 50, max: 100, step: 5, suffix: '%' },
    { key: 'mapMobileHeight', label: 'Alto en móvil', min: 140, max: 600, step: 20, suffix: ' px' },
    { key: 'mapDesktopWidth', label: 'Ancho en escritorio', min: 50, max: 100, step: 5, suffix: '%' },
    { key: 'mapDesktopHeight', label: 'Alto en escritorio', min: 180, max: 700, step: 20, suffix: ' px' },
  ] as const;

  const defaults: Record<(typeof controls)[number]['key'], number> = {
    mapMobileWidth: 100,
    mapMobileHeight: 240,
    mapDesktopWidth: 100,
    mapDesktopHeight: 320,
  };

  return (
    <section className="min-w-0 rounded-2xl border border-[#E5E2D0] bg-[#FAF9F0] p-4 sm:p-5">
      <div className="mb-4">
        <h4 className="text-sm font-bold text-[#3D3D2C]">Tamaño adaptable de los mapas</h4>
        <p className="mt-1 text-xs text-[#7D8C7A]">Ajusta el ancho y el alto de ambos mapas por separado para móvil y escritorio.</p>
      </div>
      <div className="grid min-w-0 grid-cols-1 gap-x-5 gap-y-4 sm:grid-cols-2">
        {controls.map(({ key, label, min, max, step, suffix }) => {
          const value = settings[key] ?? defaults[key];
          return (
            <label key={key} className="block min-w-0">
              <span className="mb-1.5 flex items-center justify-between gap-2 text-xs font-semibold text-stone-700">
                <span>{label}</span>
                <span className="shrink-0 tabular-nums text-[#5A5A40]">{value}{suffix}</span>
              </span>
              <input
                type="range"
                min={min}
                max={max}
                step={step}
                value={value}
                onChange={(event) => onChange({ [key]: Number(event.target.value) })}
                className="block w-full cursor-pointer accent-[#5A5A40]"
              />
            </label>
          );
        })}
      </div>
    </section>
  );
};
