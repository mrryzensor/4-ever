import React from 'react';
import { MapPin, Heart, Sparkles, Navigation, Car } from 'lucide-react';
import { WeddingSettings } from '../../../types.ts';
import { generateGoogleMapsLink, generateGoogleMapsDirLink } from '../../../lib/navigation.ts';

interface AdminLocationsSettingsProps {
  settings: WeddingSettings;
  onChange: (updated: Partial<WeddingSettings>) => void;
}

export const AdminLocationsSettings: React.FC<AdminLocationsSettingsProps> = ({
  settings,
  onChange,
}) => {
  return (
    <div className="bg-white p-4 sm:p-6 lg:p-7 rounded-2xl sm:rounded-3xl border border-[#E5E2D0] space-y-5 sm:space-y-6 shadow-sm min-w-0">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 border-b border-[#E5E2D0] pb-3.5 min-w-0">
        <div className="min-w-0">
          <h3 className="text-base sm:text-lg font-serif text-[#1a1a1a] flex items-center gap-2 font-bold truncate">
            <MapPin className="w-5 h-5 text-[#7D8C7A] shrink-0" />
            <span>Lugares & Ubicaciones con Google Maps</span>
          </h3>
          <p className="text-xs text-[#7D8C7A] mt-0.5">
            Permite a los invitados abrir el lugar en Google Maps, generar rutas automáticas y ver el mapa integrado.
          </p>
        </div>
        <span className="text-[11px] font-mono bg-[#FAF9F0] px-3 py-1 rounded-full border border-[#E5E2D0] text-[#5A5A40] shrink-0 self-start sm:self-auto">
          Integración Google Maps
        </span>
      </div>

      <div className="grid grid-cols-1 2xl:grid-cols-2 gap-4 sm:gap-5 min-w-0">
        {/* 2.1 Lugar de la Ceremonia */}
        <div className="p-4 sm:p-5 bg-[#FAF9F0] rounded-2xl border border-[#E5E2D0] space-y-4 flex flex-col justify-between min-w-0">
          <div className="space-y-3.5 min-w-0">
            <div className="flex items-center justify-between border-b border-[#E5E2D0] pb-2.5 min-w-0">
              <span className="text-xs font-bold text-[#5A5A40] uppercase tracking-wider flex items-center gap-1.5 truncate">
                <Heart className="w-3.5 h-3.5 text-[#7D8C7A] shrink-0" />
                <span>1. Lugar de la Ceremonia</span>
              </span>
            </div>

            <div className="min-w-0">
              <label className="text-[11px] font-semibold text-stone-700 block mb-1">
                Nombre del Templo / Parroquia / Lugar:
              </label>
              <input
                type="text"
                placeholder="Ej. Parroquia San Francisco de Asís"
                value={settings.ceremonyVenue || ''}
                onChange={(e) =>
                  onChange({ ceremonyVenue: e.target.value })
                }
                className="w-full bg-white border border-[#E5E2D0] rounded-xl px-3.5 py-2 text-xs text-[#3D3D3D] focus:outline-none focus:border-[#5A5A40] shadow-2xs"
              />
            </div>

            <div className="space-y-3 min-w-0">
              <div className="min-w-0">
                <label className="text-[11px] font-semibold text-stone-700 block mb-1">
                  Dirección Completa (Calle, Número, Ciudad):
                </label>
                <input
                  type="text"
                  placeholder="Ej. Calle Morelos 450, Centro Histórico"
                  value={settings.ceremonyAddress || ''}
                  onChange={(e) =>
                    onChange({ ceremonyAddress: e.target.value })
                  }
                  className="w-full bg-white border border-[#E5E2D0] rounded-xl px-3.5 py-2 text-xs text-[#3D3D3D] focus:outline-none focus:border-[#5A5A40] shadow-2xs"
                />
              </div>

              <div className="min-w-0">
                <label className="text-[11px] font-semibold text-stone-700 block mb-1">
                  Hora de la Ceremonia:
                </label>
                <input
                  type="time"
                  value={settings.ceremonyTime || '17:00'}
                  onChange={(e) =>
                    onChange({ ceremonyTime: e.target.value })
                  }
                  className="w-full bg-white border border-[#E5E2D0] rounded-xl px-3.5 py-2 text-xs text-[#3D3D3D] focus:outline-none focus:border-[#5A5A40] shadow-2xs"
                />
              </div>
            </div>

            <div className="min-w-0">
              <div className="flex items-center justify-between mb-1 gap-2">
                <label className="text-[11px] font-semibold text-stone-700 truncate">
                  Enlace / Búsqueda Google Maps:
                </label>
                <button
                  type="button"
                  onClick={() => {
                    const link = generateGoogleMapsLink(settings.ceremonyVenue, settings.ceremonyAddress);
                    onChange({ ceremonyMapsUrl: link });
                  }}
                  className="text-[10px] text-[#5A5A40] hover:underline font-semibold cursor-pointer shrink-0"
                >
                  ⚡ Auto-Generar
                </button>
              </div>
              <input
                type="url"
                placeholder="https://www.google.com/maps/..."
                value={settings.ceremonyMapsUrl || ''}
                onChange={(e) =>
                  onChange({ ceremonyMapsUrl: e.target.value })
                }
                className="w-full bg-white border border-[#E5E2D0] rounded-xl px-3.5 py-2 text-xs text-[#3D3D3D] focus:outline-none focus:border-[#5A5A40] shadow-2xs"
              />
            </div>
          </div>

          {/* Actions & Map Preview Test */}
          <div className="pt-3 border-t border-[#E5E2D0] flex flex-wrap items-center gap-2">
            <a
              href={settings.ceremonyMapsUrl || generateGoogleMapsLink(settings.ceremonyVenue, settings.ceremonyAddress)}
              target="_blank"
              rel="noopener noreferrer"
              className="px-3 py-1.5 bg-[#5A5A40] text-white hover:bg-[#484833] text-[11px] font-semibold rounded-full flex items-center gap-1.5 transition-colors shadow-2xs whitespace-nowrap"
            >
              <Navigation className="w-3 h-3 shrink-0" />
              <span>Abrir en Google Maps</span>
            </a>

            <a
              href={generateGoogleMapsDirLink(settings.ceremonyVenue, settings.ceremonyAddress)}
              target="_blank"
              rel="noopener noreferrer"
              className="px-3 py-1.5 bg-white border border-[#E5E2D0] text-[#5A5A40] hover:bg-stone-50 text-[11px] font-semibold rounded-full flex items-center gap-1.5 transition-colors shadow-2xs whitespace-nowrap"
            >
              <Car className="w-3 h-3 text-[#7D8C7A] shrink-0" />
              <span>Probar Ruta</span>
            </a>
          </div>
        </div>

        {/* 2.2 Lugar de la Recepción */}
        <div className="p-4 sm:p-5 bg-[#FAF9F0] rounded-2xl border border-[#E5E2D0] space-y-4 flex flex-col justify-between min-w-0">
          <div className="space-y-3.5 min-w-0">
            <div className="flex items-center justify-between border-b border-[#E5E2D0] pb-2.5 min-w-0">
              <span className="text-xs font-bold text-[#5A5A40] uppercase tracking-wider flex items-center gap-1.5 truncate">
                <Sparkles className="w-3.5 h-3.5 text-[#7D8C7A] shrink-0" />
                <span>2. Lugar de la Recepción & Fiesta</span>
              </span>
            </div>

            <div className="min-w-0">
              <label className="text-[11px] font-semibold text-stone-700 block mb-1">
                Nombre de la Hacienda / Salón / Jardín:
              </label>
              <input
                type="text"
                placeholder="Ej. Hacienda Los Arcángeles"
                value={settings.receptionVenue || ''}
                onChange={(e) =>
                  onChange({ receptionVenue: e.target.value })
                }
                className="w-full bg-white border border-[#E5E2D0] rounded-xl px-3.5 py-2 text-xs text-[#3D3D3D] focus:outline-none focus:border-[#5A5A40] shadow-2xs"
              />
            </div>

            <div className="space-y-3 min-w-0">
              <div className="min-w-0">
                <label className="text-[11px] font-semibold text-stone-700 block mb-1">
                  Dirección Completa (Calle, Número, Ciudad):
                </label>
                <input
                  type="text"
                  placeholder="Ej. Carr. Real a Querétaro Km 4.5"
                  value={settings.receptionAddress || ''}
                  onChange={(e) =>
                    onChange({ receptionAddress: e.target.value })
                  }
                  className="w-full bg-white border border-[#E5E2D0] rounded-xl px-3.5 py-2 text-xs text-[#3D3D3D] focus:outline-none focus:border-[#5A5A40] shadow-2xs"
                />
              </div>

              <div className="min-w-0">
                <label className="text-[11px] font-semibold text-stone-700 block mb-1">
                  Hora del Banquete:
                </label>
                <input
                  type="time"
                  value={settings.receptionTime || '19:00'}
                  onChange={(e) =>
                    onChange({ receptionTime: e.target.value })
                  }
                  className="w-full bg-white border border-[#E5E2D0] rounded-xl px-3.5 py-2 text-xs text-[#3D3D3D] focus:outline-none focus:border-[#5A5A40] shadow-2xs"
                />
              </div>
            </div>

            <div className="min-w-0">
              <div className="flex items-center justify-between mb-1 gap-2">
                <label className="text-[11px] font-semibold text-stone-700 truncate">
                  Enlace / Búsqueda Google Maps:
                </label>
                <button
                  type="button"
                  onClick={() => {
                    const link = generateGoogleMapsLink(settings.receptionVenue, settings.receptionAddress);
                    onChange({ receptionMapsUrl: link });
                  }}
                  className="text-[10px] text-[#5A5A40] hover:underline font-semibold cursor-pointer shrink-0"
                >
                  ⚡ Auto-Generar
                </button>
              </div>
              <input
                type="url"
                placeholder="https://www.google.com/maps/..."
                value={settings.receptionMapsUrl || ''}
                onChange={(e) =>
                  onChange({ receptionMapsUrl: e.target.value })
                }
                className="w-full bg-white border border-[#E5E2D0] rounded-xl px-3.5 py-2 text-xs text-[#3D3D3D] focus:outline-none focus:border-[#5A5A40] shadow-2xs"
              />
            </div>
          </div>

          {/* Actions & Map Preview Test */}
          <div className="pt-3 border-t border-[#E5E2D0] flex flex-wrap items-center gap-2">
            <a
              href={settings.receptionMapsUrl || generateGoogleMapsLink(settings.receptionVenue, settings.receptionAddress)}
              target="_blank"
              rel="noopener noreferrer"
              className="px-3 py-1.5 bg-[#5A5A40] text-white hover:bg-[#484833] text-[11px] font-semibold rounded-full flex items-center gap-1.5 transition-colors shadow-2xs whitespace-nowrap"
            >
              <Navigation className="w-3 h-3 shrink-0" />
              <span>Abrir en Google Maps</span>
            </a>

            <a
              href={generateGoogleMapsDirLink(settings.receptionVenue, settings.receptionAddress)}
              target="_blank"
              rel="noopener noreferrer"
              className="px-3 py-1.5 bg-white border border-[#E5E2D0] text-[#5A5A40] hover:bg-stone-50 text-[11px] font-semibold rounded-full flex items-center gap-1.5 transition-colors shadow-2xs whitespace-nowrap"
            >
              <Car className="w-3 h-3 text-[#7D8C7A] shrink-0" />
              <span>Probar Ruta</span>
            </a>
          </div>
        </div>
      </div>
    </div>
  );
};
