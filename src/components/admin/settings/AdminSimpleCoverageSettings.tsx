import React, { useState } from 'react';
import { Clock, Image, Link2, Plus, Trash2, Users } from 'lucide-react';
import { WeddingSettings } from '../../../types.ts';

interface AdminSimpleCoverageSettingsProps {
  settings: WeddingSettings;
  onChange: (updated: Partial<WeddingSettings>) => void;
}

type ItineraryItem = { time: string; title: string; desc: string };

const defaultItinerary: ItineraryItem[] = [
  { time: '17:00', title: 'Ceremonia Religiosa', desc: 'Enlace matrimonial y bendición' },
  { time: '18:30', title: 'Cóctel & Bienvenida', desc: 'Brindis y aperitivos' },
  { time: '20:00', title: 'Banquete & Cena', desc: 'Cena de gala y primer baile' },
  { time: '22:00', title: 'Fiesta & Baile', desc: 'Pista de baile y barra libre' },
];

const parseItinerary = (value: string): ItineraryItem[] => {
  try {
    const parsed = JSON.parse(value);
    if (Array.isArray(parsed) && parsed.length > 0) return parsed;
  } catch {
    // Keep the same starter schedule used by Simple mode for empty or invalid data.
  }
  return defaultItinerary;
};

const parseHeroPhotos = (settings: WeddingSettings): string[] => {
  try {
    const parsed = JSON.parse(settings.heroPhotos || '[]');
    if (Array.isArray(parsed) && parsed.length > 0) return parsed.filter((url) => typeof url === 'string');
  } catch {
    if (settings.heroPhotos?.includes(',')) {
      return settings.heroPhotos.split(',').map((url) => url.trim()).filter(Boolean);
    }
  }
  return settings.coverPhoto ? [settings.coverPhoto] : [];
};

const inputClass = 'w-full min-w-0 rounded-xl border border-[#E5E2D0] bg-white px-3 py-2 text-sm text-stone-800 focus:border-[#7D8C7A] focus:outline-none';
const subcardClass = 'rounded-2xl border border-[#E5E2D0] bg-[#FAF9F0]/70 p-4 space-y-3 min-w-0';

export const AdminSimpleCoverageSettings: React.FC<AdminSimpleCoverageSettingsProps> = ({ settings, onChange }) => {
  const [newHeroPhotoUrl, setNewHeroPhotoUrl] = useState('');
  const itinerary = parseItinerary(settings.itinerary || '');
  const heroPhotos = parseHeroPhotos(settings);

  const saveItinerary = (items: ItineraryItem[]) => onChange({ itinerary: JSON.stringify(items) });
  const saveHeroPhotos = (urls: string[]) => onChange({
    heroPhotos: JSON.stringify(urls),
    ...(urls[0] ? { coverPhoto: urls[0] } : {}),
  });

  return (
    <section className="rounded-3xl border border-[#E5E2D0] bg-white p-4 sm:p-6 shadow-xs space-y-4">
      <div>
        <h3 className="font-serif text-lg font-bold text-stone-900">Controles complementarios</h3>
        <p className="mt-1 text-xs text-stone-500">
          Aquí también están disponibles en modo avanzado algunos ajustes que aparecen en la configuración simple.
        </p>
      </div>

      <div className="grid grid-cols-1 2xl:grid-cols-2 gap-4">
        <div className={subcardClass}>
          <h4 className="flex items-center gap-2 text-sm font-bold text-stone-800">
            <Clock className="h-4 w-4 text-[#5A5A40]" /> Itinerario & cronograma
          </h4>
          <div className="space-y-2">
            {itinerary.map((item, index) => (
              <div key={index} className="grid grid-cols-1 sm:grid-cols-[110px_minmax(0,1fr)_minmax(0,1fr)_36px] gap-2 items-center">
                <input aria-label={`Hora del momento ${index + 1}`} type="time" value={item.time || ''} onChange={(event) => {
                  const next = [...itinerary];
                  next[index] = { ...item, time: event.target.value };
                  saveItinerary(next);
                }} className={inputClass} />
                <input aria-label={`Título del momento ${index + 1}`} value={item.title || ''} onChange={(event) => {
                  const next = [...itinerary];
                  next[index] = { ...item, title: event.target.value };
                  saveItinerary(next);
                }} placeholder="Momento" className={inputClass} />
                <input aria-label={`Detalle del momento ${index + 1}`} value={item.desc || ''} onChange={(event) => {
                  const next = [...itinerary];
                  next[index] = { ...item, desc: event.target.value };
                  saveItinerary(next);
                }} placeholder="Detalle" className={inputClass} />
                <button type="button" disabled={itinerary.length <= 1} onClick={() => saveItinerary(itinerary.filter((_, itemIndex) => itemIndex !== index))} className="h-9 w-9 inline-flex items-center justify-center rounded-lg text-stone-500 hover:bg-rose-50 hover:text-rose-700 disabled:opacity-40" aria-label={`Eliminar momento ${index + 1}`}>
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            ))}
          </div>
          <button type="button" onClick={() => saveItinerary([...itinerary, { time: '23:30', title: 'Momento Especial', desc: 'Descripción breve' }])} className="inline-flex items-center gap-1.5 rounded-xl border border-[#E5E2D0] bg-white px-3 py-2 text-xs font-semibold text-[#5A5A40] hover:bg-stone-50">
            <Plus className="h-3.5 w-3.5" /> Añadir momento
          </button>
        </div>

        <div className={subcardClass}>
          <h4 className="flex items-center gap-2 text-sm font-bold text-stone-800">
            <Image className="h-4 w-4 text-[#5A5A40]" /> Fotos de portada en rotación
          </h4>
          <p className="text-[11px] text-stone-500">Edita el orden y las direcciones de las fotos que se alternan en el hero.</p>
          <div className="space-y-2">
            {heroPhotos.map((url, index) => (
              <div key={`${index}-${url}`} className="flex min-w-0 gap-2">
                <input aria-label={`URL de foto de portada ${index + 1}`} type="url" value={url} onChange={(event) => {
                  const next = [...heroPhotos];
                  next[index] = event.target.value;
                  saveHeroPhotos(next);
                }} placeholder="https://…" className={inputClass} />
                <button type="button" disabled={heroPhotos.length <= 1} onClick={() => saveHeroPhotos(heroPhotos.filter((_, itemIndex) => itemIndex !== index))} className="h-10 w-10 shrink-0 inline-flex items-center justify-center rounded-lg text-stone-500 hover:bg-rose-50 hover:text-rose-700 disabled:opacity-40" aria-label={`Quitar foto ${index + 1}`}>
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            ))}
          </div>
          <div className="flex flex-wrap items-center gap-3">
            <form className="flex min-w-0 flex-1 gap-2" onSubmit={(event) => {
              event.preventDefault();
              const url = newHeroPhotoUrl.trim();
              if (!url) return;
              saveHeroPhotos([...heroPhotos, url]);
              setNewHeroPhotoUrl('');
            }}>
              <input type="url" value={newHeroPhotoUrl} onChange={(event) => setNewHeroPhotoUrl(event.target.value)} placeholder="Añadir URL de foto" aria-label="Nueva foto de portada" className={`${inputClass} min-w-0`} />
              <button type="submit" disabled={!newHeroPhotoUrl.trim()} className="inline-flex shrink-0 items-center gap-1.5 rounded-xl border border-[#E5E2D0] bg-white px-3 py-2 text-xs font-semibold text-[#5A5A40] hover:bg-stone-50 disabled:opacity-40">
                <Plus className="h-3.5 w-3.5" /> Añadir
              </button>
            </form>
            <label className="flex items-center gap-2 text-xs text-stone-700">
              Intervalo
              <select value={settings.heroAutoplayInterval || 5} onChange={(event) => onChange({ heroAutoplayInterval: Number(event.target.value) })} className="rounded-lg border border-[#E5E2D0] bg-white px-2.5 py-2">
                {[3, 5, 8, 12].map((seconds) => <option key={seconds} value={seconds}>{seconds} segundos</option>)}
              </select>
            </label>
          </div>
        </div>

        <div className={subcardClass}>
          <h4 className="flex items-center gap-2 text-sm font-bold text-stone-800">
            <Link2 className="h-4 w-4 text-[#5A5A40]" /> Álbum externo de fotos
          </h4>
          <label className="block space-y-1 text-xs font-semibold text-stone-700">
            Texto del enlace
            <input value={settings.galleryExternalAlbumTitle || ''} onChange={(event) => onChange({ galleryExternalAlbumTitle: event.target.value })} placeholder="Ver álbum completo" className={inputClass} />
          </label>
          <label className="block space-y-1 text-xs font-semibold text-stone-700">
            Enlace del álbum
            <input type="url" value={settings.galleryExternalAlbumUrl || ''} onChange={(event) => onChange({ galleryExternalAlbumUrl: event.target.value, galleryDrivePhotoSelectionMode: 'all', galleryDrivePhotoIds: '[]' })} placeholder="https://…" className={`${inputClass} font-mono font-normal`} />
          </label>
        </div>

        <div className={subcardClass}>
          <h4 className="flex items-center gap-2 text-sm font-bold text-stone-800">
            <Users className="h-4 w-4 text-[#5A5A40]" /> Confirmación de asistencia
          </h4>
          <label className="block space-y-1 text-xs font-semibold text-stone-700">
            Teléfono de contacto / WhatsApp
            <input type="tel" value={settings.contactPhone || ''} onChange={(event) => onChange({ contactPhone: event.target.value })} placeholder="+51 987 654 321" className={`${inputClass} font-mono font-normal`} />
          </label>
          <p className="text-[11px] text-stone-500">La fecha límite y sus textos se configuran en el panel de portada y RSVP.</p>
        </div>
      </div>
    </section>
  );
};
