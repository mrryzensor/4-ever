import React from 'react';
import { Building2, ExternalLink, MapPin, Phone, Plus, Trash2 } from 'lucide-react';
import { HotelRecommendation, WeddingSettings } from '../../../types.ts';

interface AdminHotelsSettingsProps {
  settings: WeddingSettings;
  onChange: (updated: Partial<WeddingSettings>) => void;
}

const parseHotels = (value?: string): HotelRecommendation[] => {
  try {
    const parsed = value ? JSON.parse(value) : [];
    return Array.isArray(parsed)
      ? parsed
          .filter((hotel) => hotel && typeof hotel === 'object')
          .map((hotel) => {
            const record = hotel as Record<string, unknown>;
            const asText = (field: string) => typeof record[field] === 'string' ? record[field] as string : '';
            return {
              name: asText('name'),
              address: asText('address'),
              mapsUrl: asText('mapsUrl'),
              bookingUrl: asText('bookingUrl'),
              phone: asText('phone'),
              notes: asText('notes'),
            };
          })
      : [];
  } catch {
    return [];
  }
};

export const AdminHotelsSettings: React.FC<AdminHotelsSettingsProps> = ({ settings, onChange }) => {
  const hotels = parseHotels(settings.hotelRecommendations);

  const save = (next: HotelRecommendation[]) => {
    onChange({ hotelRecommendations: JSON.stringify(next) });
  };

  const updateHotel = (index: number, field: keyof HotelRecommendation, value: string) => {
    save(hotels.map((hotel, hotelIndex) => hotelIndex === index ? { ...hotel, [field]: value } : hotel));
  };

  return (
    <section className="rounded-2xl border border-[#E5E2D0] bg-white p-4 sm:p-5">
      <div className="mb-4 flex flex-wrap items-start justify-between gap-3">
        <div className="flex items-start gap-2.5">
          <Building2 className="mt-0.5 h-4 w-4 text-[#5A5A40]" />
          <div>
            <h4 className="text-sm font-bold text-stone-900">Hoteles y hospedaje</h4>
            <p className="mt-1 text-[11px] text-stone-500">Estos datos aparecen cuando activas la sección de hoteles.</p>
          </div>
        </div>
        <button
          type="button"
          onClick={() => save([...hotels, { name: '' }])}
          className="inline-flex cursor-pointer items-center gap-1.5 rounded-xl border border-[#E5E2D0] bg-[#FAF9F0] px-3 py-2 text-xs font-semibold text-[#5A5A40] hover:bg-[#F0EEDC]"
        >
          <Plus className="h-3.5 w-3.5" /> Agregar hotel
        </button>
      </div>

      <label className="mb-4 block">
        <span className="mb-1 block text-[11px] font-semibold text-stone-700">Título de sección</span>
        <input
          value={settings.hotelsTitle || ''}
          onChange={(event) => onChange({ hotelsTitle: event.target.value })}
          placeholder="Hospedaje recomendado"
          className="w-full rounded-xl border border-[#E5E2D0] bg-[#FAF9F0] px-3 py-2 text-sm text-stone-800 outline-none focus:border-[#5A5A40]"
        />
      </label>

      {hotels.length === 0 ? (
        <p className="rounded-xl border border-dashed border-[#E5E2D0] bg-[#FAF9F0]/60 p-4 text-center text-xs text-stone-500">
          Agrega uno o más hoteles, con dirección, mapa, teléfono o enlace de reserva.
        </p>
      ) : (
        <div className="space-y-3">
          {hotels.map((hotel, index) => (
            <div key={index} className="rounded-xl border border-[#E5E2D0] bg-[#FAF9F0]/60 p-3 sm:p-4">
              <div className="mb-3 flex items-center justify-between gap-2">
                <span className="text-xs font-bold text-stone-800">Hotel {index + 1}</span>
                <button
                  type="button"
                  onClick={() => save(hotels.filter((_, hotelIndex) => hotelIndex !== index))}
                  aria-label={`Eliminar hotel ${index + 1}`}
                  className="cursor-pointer rounded-lg p-2 text-rose-600 hover:bg-rose-50"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
              <div className="grid gap-3 sm:grid-cols-2">
                <label className="sm:col-span-2">
                  <span className="mb-1 block text-[10px] font-semibold text-stone-600">Nombre</span>
                  <input value={hotel.name || ''} onChange={(event) => updateHotel(index, 'name', event.target.value)} placeholder="Hotel Central" className="w-full rounded-lg border border-[#E5E2D0] bg-white px-3 py-2 text-xs text-stone-800 outline-none focus:border-[#5A5A40]" />
                </label>
                <label className="sm:col-span-2">
                  <span className="mb-1 flex items-center gap-1 text-[10px] font-semibold text-stone-600"><MapPin className="h-3 w-3" /> Dirección</span>
                  <input value={hotel.address || ''} onChange={(event) => updateHotel(index, 'address', event.target.value)} placeholder="Dirección del hotel" className="w-full rounded-lg border border-[#E5E2D0] bg-white px-3 py-2 text-xs text-stone-800 outline-none focus:border-[#5A5A40]" />
                </label>
                <label>
                  <span className="mb-1 flex items-center gap-1 text-[10px] font-semibold text-stone-600"><MapPin className="h-3 w-3" /> Enlace de mapa</span>
                  <input value={hotel.mapsUrl || ''} onChange={(event) => updateHotel(index, 'mapsUrl', event.target.value)} placeholder="https://maps.google.com/..." className="w-full rounded-lg border border-[#E5E2D0] bg-white px-3 py-2 text-xs text-stone-800 outline-none focus:border-[#5A5A40]" />
                </label>
                <label>
                  <span className="mb-1 flex items-center gap-1 text-[10px] font-semibold text-stone-600"><ExternalLink className="h-3 w-3" /> Reserva / sitio web</span>
                  <input value={hotel.bookingUrl || ''} onChange={(event) => updateHotel(index, 'bookingUrl', event.target.value)} placeholder="https://..." className="w-full rounded-lg border border-[#E5E2D0] bg-white px-3 py-2 text-xs text-stone-800 outline-none focus:border-[#5A5A40]" />
                </label>
                <label>
                  <span className="mb-1 flex items-center gap-1 text-[10px] font-semibold text-stone-600"><Phone className="h-3 w-3" /> Teléfono</span>
                  <input value={hotel.phone || ''} onChange={(event) => updateHotel(index, 'phone', event.target.value)} placeholder="+51 ..." className="w-full rounded-lg border border-[#E5E2D0] bg-white px-3 py-2 text-xs text-stone-800 outline-none focus:border-[#5A5A40]" />
                </label>
                <label>
                  <span className="mb-1 block text-[10px] font-semibold text-stone-600">Nota para invitados</span>
                  <input value={hotel.notes || ''} onChange={(event) => updateHotel(index, 'notes', event.target.value)} placeholder="Menciona el evento para obtener tarifa especial" className="w-full rounded-lg border border-[#E5E2D0] bg-white px-3 py-2 text-xs text-stone-800 outline-none focus:border-[#5A5A40]" />
                </label>
              </div>
            </div>
          ))}
        </div>
      )}
    </section>
  );
};
