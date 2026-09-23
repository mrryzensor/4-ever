import React from 'react';
import { Building2 } from 'lucide-react';
import { WeddingSettings } from '../../types.ts';
import { AdminSectionOrder } from './settings/AdminSectionOrder.tsx';
import { AdminHotelsSettings } from './settings/AdminHotelsSettings.tsx';

interface SimpleModeSectionsStepProps {
  settings: WeddingSettings;
  onChange: (updated: Partial<WeddingSettings>) => void;
}

export const SimpleModeSectionsStep: React.FC<SimpleModeSectionsStepProps> = ({ settings, onChange }) => (
  <div className="space-y-5 animate-fadeIn">
    <AdminSectionOrder settings={settings} onChange={onChange} />

    <section className="rounded-2xl border border-[#E5E2D0] bg-white p-4 sm:p-5">
      <label className="flex cursor-pointer items-start gap-3">
        <input
          type="checkbox"
          checked={settings.showHotels === true}
          onChange={(event) => onChange({ showHotels: event.target.checked })}
          className="mt-0.5 h-4 w-4 cursor-pointer accent-[#5A5A40]"
        />
        <span>
          <span className="flex items-center gap-2 text-sm font-bold text-stone-900">
            <Building2 className="h-4 w-4 text-[#5A5A40]" /> Incluir hoteles y hospedaje
          </span>
          <span className="mt-1 block text-[11px] text-stone-500">
            Opcional. Actívalo solo si quieres recomendar alojamientos a tus invitados.
          </span>
        </span>
      </label>
      {settings.showHotels === true && (
        <div className="mt-4 border-t border-[#E5E2D0] pt-4">
          <AdminHotelsSettings settings={settings} onChange={onChange} />
        </div>
      )}
    </section>
  </div>
);
