import React from 'react';
import { Check } from 'lucide-react';
import { WeddingSettings } from '../../types.ts';

interface HeroCourtPlacementControlProps {
  settings: WeddingSettings;
  onChange: (updated: Partial<WeddingSettings>) => void;
}

const placements = [
  { id: 'hero', title: 'En la portada (Hero)', description: 'Junto a los nombres; puedes elegir su posición.' },
  { id: 'after-hero', title: 'Página después del Hero', description: 'Una página amplia entre la portada y el resto.' },
  { id: 'after-countdown', title: 'Página después del contador', description: 'Una página amplia a continuación de la cuenta regresiva.' },
] as const;

export const HeroCourtPlacementControl: React.FC<HeroCourtPlacementControlProps> = ({ settings, onChange }) => {
  const placement = settings.heroCourtPlacement || 'hero';
  const heroPosition = settings.heroCourtPosition || 'below-names';

  return (
    <div className="space-y-3">
      <fieldset>
        <legend className="mb-1.5 text-[11px] font-bold uppercase tracking-wider text-stone-700">
          Dónde mostrar a la familia, padrinos y testigos
        </legend>
        <div className="grid grid-cols-1 gap-2 lg:grid-cols-3">
          {placements.map((option) => {
            const selected = placement === option.id;
            return (
              <button
                key={option.id}
                type="button"
                aria-pressed={selected}
                onClick={() => onChange({ heroCourtPlacement: option.id })}
                className={`flex cursor-pointer items-start gap-2 rounded-xl border p-3 text-left transition-colors ${
                  selected
                    ? 'border-[#5A5A40] bg-[#5A5A40] text-white shadow-sm'
                    : 'border-[#E5E2D0] bg-[#FAF9F0] text-stone-700 hover:bg-white'
                }`}
              >
                <span className={`mt-0.5 flex h-4 w-4 shrink-0 items-center justify-center rounded-full border ${selected ? 'border-white bg-white text-[#5A5A40]' : 'border-stone-400'}`}>
                  {selected && <Check className="h-3 w-3" aria-hidden="true" />}
                </span>
                <span>
                  <span className="block text-[11px] font-bold">{option.title}</span>
                  <span className={`mt-0.5 block text-[10px] leading-relaxed ${selected ? 'text-white/80' : 'text-stone-500'}`}>
                    {option.description}
                  </span>
                </span>
              </button>
            );
          })}
        </div>
      </fieldset>

      {placement === 'hero' ? (
        <fieldset>
          <legend className="mb-1.5 text-[10px] font-semibold text-stone-600">Posición dentro del Hero</legend>
          <div className="grid grid-cols-3 gap-1 rounded-xl border border-[#E5E2D0] bg-[#FAF9F0] p-1">
            {([
              ['above-names', 'Arriba de los nombres'],
              ['below-names', 'Debajo de los nombres'],
              ['below-quote', 'Debajo de la frase'],
            ] as const).map(([id, label]) => (
              <button
                key={id}
                type="button"
                aria-pressed={heroPosition === id}
                onClick={() => onChange({ heroCourtPosition: id })}
                className={`cursor-pointer rounded-lg px-2 py-2 text-[10px] font-medium transition-colors ${
                  heroPosition === id
                    ? 'bg-[#5A5A40] font-bold text-white shadow-xs'
                    : 'text-[#5A5A40] hover:bg-white/80'
                }`}
              >
                {label}
              </button>
            ))}
          </div>
        </fieldset>
      ) : (
        <p className="text-[10px] leading-relaxed text-stone-500">
          En página separada, la información se presenta en grande y ocupa casi toda la pantalla. Si eliges después del contador y ocultas el contador, aparecerá después del Hero.
        </p>
      )}
    </div>
  );
};
