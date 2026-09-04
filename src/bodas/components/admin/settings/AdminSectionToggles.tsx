import React from 'react';
import {
  ListChecks,
  CheckCheck,
  Clock,
  MapPin,
  Shirt,
  Gift,
  Camera,
  Film,
  MessageSquareHeart,
  CheckCircle,
  Lightbulb,
} from 'lucide-react';
import { WeddingSettings } from '../../../../types.ts';

interface AdminSectionTogglesProps {
  settings: WeddingSettings;
  onChange: (updated: Partial<WeddingSettings>) => void;
}

export const AdminSectionToggles: React.FC<AdminSectionTogglesProps> = ({
  settings,
  onChange,
}) => {
  const enableAll = () => {
    onChange({
      showItinerary: true,
      showLocations: true,
      showDressCode: true,
      showGiftRegistry: true,
      showPhotoGallery: true,
      showVideoMemories: true,
      showGuestbook: true,
      showRsvpSection: true,
    });
  };

  const setEssentialMode = () => {
    onChange({
      showItinerary: false,
      showLocations: true,
      showDressCode: false,
      showGiftRegistry: false,
      showPhotoGallery: false,
      showVideoMemories: false,
      showGuestbook: false,
      showRsvpSection: true,
    });
  };

  return (
    <div className="bg-white p-4 sm:p-6 lg:p-7 rounded-2xl sm:rounded-3xl border border-[#E5E2D0] space-y-5 shadow-sm min-w-0">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-[#E5E2D0] pb-4">
        <div>
          <h3 className="text-lg font-serif text-[#1a1a1a] flex items-center gap-2 font-bold">
            <ListChecks className="w-5 h-5 text-[#7D8C7A]" />
            Secciones Visibles de la Invitación
          </h3>
          <p className="text-xs text-[#7D8C7A] mt-0.5">
            Elige qué bloques y módulos deseas mostrar u ocultar en la tarjeta de tus invitados.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={enableAll}
            className="px-3 py-1.5 rounded-full bg-[#FAF9F0] hover:bg-[#F0EEDC] text-[#5A5A40] border border-[#E5E2D0] text-[11px] font-semibold flex items-center gap-1 transition-colors cursor-pointer"
          >
            <CheckCheck className="w-3.5 h-3.5 text-[#7D8C7A]" />
            <span>Activar Todo</span>
          </button>

          <button
            type="button"
            onClick={setEssentialMode}
            className="px-3 py-1.5 rounded-full bg-white hover:bg-stone-100 text-stone-600 border border-[#E5E2D0] text-[11px] font-semibold transition-colors cursor-pointer"
          >
            <span>Modo Esencial</span>
          </button>
        </div>
      </div>

      {/* Grid of section toggles */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 2xl:grid-cols-2 gap-3 min-w-0">
        {/* 1. Itinerario */}
        <label
          className={`p-3.5 rounded-2xl border transition-all cursor-pointer flex items-start gap-3 select-none ${
            settings.showItinerary !== false
              ? 'bg-[#FAF9F0] border-[#5A5A40]/40 ring-1 ring-[#5A5A40]/20 shadow-2xs'
              : 'bg-white border-[#E5E2D0] opacity-60 hover:opacity-100'
          }`}
        >
          <input
            type="checkbox"
            checked={settings.showItinerary !== false}
            onChange={(e) =>
              onChange({ showItinerary: e.target.checked })
            }
            className="mt-0.5 w-4 h-4 rounded text-[#5A5A40] accent-[#5A5A40] cursor-pointer shrink-0"
          />
          <div>
            <div className="flex items-center gap-1.5">
              <Clock className="w-3.5 h-3.5 text-[#5A5A40]" />
              <span className="text-xs font-bold text-[#1a1a1a]">Itinerario</span>
            </div>
            <p className="text-[10px] text-[#7D8C7A] mt-0.5 leading-snug">
              Cronograma paso a paso con horas y actividades.
            </p>
          </div>
        </label>

        {/* 2. Ubicaciones */}
        <label
          className={`p-3.5 rounded-2xl border transition-all cursor-pointer flex items-start gap-3 select-none ${
            settings.showLocations !== false
              ? 'bg-[#FAF9F0] border-[#5A5A40]/40 ring-1 ring-[#5A5A40]/20 shadow-2xs'
              : 'bg-white border-[#E5E2D0] opacity-60 hover:opacity-100'
          }`}
        >
          <input
            type="checkbox"
            checked={settings.showLocations !== false}
            onChange={(e) =>
              onChange({ showLocations: e.target.checked })
            }
            className="mt-0.5 w-4 h-4 rounded text-[#5A5A40] accent-[#5A5A40] cursor-pointer shrink-0"
          />
          <div>
            <div className="flex items-center gap-1.5">
              <MapPin className="w-3.5 h-3.5 text-[#5A5A40]" />
              <span className="text-xs font-bold text-[#1a1a1a]">Cómo Llegar</span>
            </div>
            <p className="text-[10px] text-[#7D8C7A] mt-0.5 leading-snug">
              Google Maps, Waze y rutas directas para invitados.
            </p>
          </div>
        </label>

        {/* 3. Código de Vestimenta */}
        <label
          className={`p-3.5 rounded-2xl border transition-all cursor-pointer flex items-start gap-3 select-none ${
            settings.showDressCode !== false
              ? 'bg-[#FAF9F0] border-[#5A5A40]/40 ring-1 ring-[#5A5A40]/20 shadow-2xs'
              : 'bg-white border-[#E5E2D0] opacity-60 hover:opacity-100'
          }`}
        >
          <input
            type="checkbox"
            checked={settings.showDressCode !== false}
            onChange={(e) =>
              onChange({ showDressCode: e.target.checked })
            }
            className="mt-0.5 w-4 h-4 rounded text-[#5A5A40] accent-[#5A5A40] cursor-pointer shrink-0"
          />
          <div>
            <div className="flex items-center gap-1.5">
              <Shirt className="w-3.5 h-3.5 text-[#5A5A40]" />
              <span className="text-xs font-bold text-[#1a1a1a]">Vestimenta</span>
            </div>
            <p className="text-[10px] text-[#7D8C7A] mt-0.5 leading-snug">
              Dress code, etiqueta y paleta de colores sugerida.
            </p>
          </div>
        </label>

        {/* 4. Mesa de Regalos & Cuentas */}
        <label
          className={`p-3.5 rounded-2xl border transition-all cursor-pointer flex items-start gap-3 select-none ${
            settings.showGiftRegistry !== false
              ? 'bg-[#FAF9F0] border-[#5A5A40]/40 ring-1 ring-[#5A5A40]/20 shadow-2xs'
              : 'bg-white border-[#E5E2D0] opacity-60 hover:opacity-100'
          }`}
        >
          <input
            type="checkbox"
            checked={settings.showGiftRegistry !== false}
            onChange={(e) =>
              onChange({ showGiftRegistry: e.target.checked })
            }
            className="mt-0.5 w-4 h-4 rounded text-[#5A5A40] accent-[#5A5A40] cursor-pointer shrink-0"
          />
          <div>
            <div className="flex items-center gap-1.5">
              <Gift className="w-3.5 h-3.5 text-[#5A5A40]" />
              <span className="text-xs font-bold text-[#1a1a1a]">Regalos & Cuentas</span>
            </div>
            <p className="text-[10px] text-[#7D8C7A] mt-0.5 leading-snug">
              Datos bancarios, CLABE, lluvia de sobres y tiendas.
            </p>
          </div>
        </label>

        {/* 5. Galería de Fotos */}
        <label
          className={`p-3.5 rounded-2xl border transition-all cursor-pointer flex items-start gap-3 select-none ${
            settings.showPhotoGallery !== false
              ? 'bg-[#FAF9F0] border-[#5A5A40]/40 ring-1 ring-[#5A5A40]/20 shadow-2xs'
              : 'bg-white border-[#E5E2D0] opacity-60 hover:opacity-100'
          }`}
        >
          <input
            type="checkbox"
            checked={settings.showPhotoGallery !== false}
            onChange={(e) =>
              onChange({ showPhotoGallery: e.target.checked })
            }
            className="mt-0.5 w-4 h-4 rounded text-[#5A5A40] accent-[#5A5A40] cursor-pointer shrink-0"
          />
          <div>
            <div className="flex items-center gap-1.5">
              <Camera className="w-3.5 h-3.5 text-[#5A5A40]" />
              <span className="text-xs font-bold text-[#1a1a1a]">Galería de Fotos</span>
            </div>
            <p className="text-[10px] text-[#7D8C7A] mt-0.5 leading-snug">
              Fotos oficiales y carga en vivo de invitados.
            </p>
          </div>
        </label>

        {/* 6. Recuerdos en Video */}
        <label
          className={`p-3.5 rounded-2xl border transition-all cursor-pointer flex items-start gap-3 select-none ${
            settings.showVideoMemories !== false
              ? 'bg-[#FAF9F0] border-[#5A5A40]/40 ring-1 ring-[#5A5A40]/20 shadow-2xs'
              : 'bg-white border-[#E5E2D0] opacity-60 hover:opacity-100'
          }`}
        >
          <input
            type="checkbox"
            checked={settings.showVideoMemories !== false}
            onChange={(e) =>
              onChange({ showVideoMemories: e.target.checked })
            }
            className="mt-0.5 w-4 h-4 rounded text-[#5A5A40] accent-[#5A5A40] cursor-pointer shrink-0"
          />
          <div>
            <div className="flex items-center gap-1.5">
              <Film className="w-3.5 h-3.5 text-[#5A5A40]" />
              <span className="text-xs font-bold text-[#1a1a1a]">Video Recuerdos</span>
            </div>
            <p className="text-[10px] text-[#7D8C7A] mt-0.5 leading-snug">
              Reproductor de video oficial o mensaje de novios.
            </p>
          </div>
        </label>

        {/* 7. Libro de Firmas */}
        <label
          className={`p-3.5 rounded-2xl border transition-all cursor-pointer flex items-start gap-3 select-none ${
            settings.showGuestbook !== false
              ? 'bg-[#FAF9F0] border-[#5A5A40]/40 ring-1 ring-[#5A5A40]/20 shadow-2xs'
              : 'bg-white border-[#E5E2D0] opacity-60 hover:opacity-100'
          }`}
        >
          <input
            type="checkbox"
            checked={settings.showGuestbook !== false}
            onChange={(e) =>
              onChange({ showGuestbook: e.target.checked })
            }
            className="mt-0.5 w-4 h-4 rounded text-[#5A5A40] accent-[#5A5A40] cursor-pointer shrink-0"
          />
          <div>
            <div className="flex items-center gap-1.5">
              <MessageSquareHeart className="w-3.5 h-3.5 text-[#5A5A40]" />
              <span className="text-xs font-bold text-[#1a1a1a]">Libro de Deseos</span>
            </div>
            <p className="text-[10px] text-[#7D8C7A] mt-0.5 leading-snug">
              Dedicatorias y felicitaciones en tiempo real.
            </p>
          </div>
        </label>

        {/* 8. Módulo RSVP */}
        <label
          className={`p-3.5 rounded-2xl border transition-all cursor-pointer flex items-start gap-3 select-none ${
            settings.showRsvpSection !== false
              ? 'bg-[#FAF9F0] border-[#5A5A40]/40 ring-1 ring-[#5A5A40]/20 shadow-2xs'
              : 'bg-white border-[#E5E2D0] opacity-60 hover:opacity-100'
          }`}
        >
          <input
            type="checkbox"
            checked={settings.showRsvpSection !== false}
            onChange={(e) =>
              onChange({ showRsvpSection: e.target.checked })
            }
            className="mt-0.5 w-4 h-4 rounded text-[#5A5A40] accent-[#5A5A40] cursor-pointer shrink-0"
          />
          <div>
            <div className="flex items-center gap-1.5">
              <CheckCircle className="w-3.5 h-3.5 text-[#5A5A40]" />
              <span className="text-xs font-bold text-[#1a1a1a]">Confirmación RSVP</span>
            </div>
            <p className="text-[10px] text-[#7D8C7A] mt-0.5 leading-snug">
              Formulario interactivo de pases y confirmación.
            </p>
          </div>
        </label>

        {/* 9. Tips & Recomendaciones */}
        <label
          className={`p-3.5 rounded-2xl border transition-all cursor-pointer flex items-start gap-3 select-none ${
            settings.showTips !== false
              ? 'bg-[#FAF9F0] border-[#5A5A40]/40 ring-1 ring-[#5A5A40]/20 shadow-2xs'
              : 'bg-white border-[#E5E2D0] opacity-60 hover:opacity-100'
          }`}
        >
          <input
            type="checkbox"
            checked={settings.showTips !== false}
            onChange={(e) =>
              onChange({ showTips: e.target.checked })
            }
            className="mt-0.5 w-4 h-4 rounded text-[#5A5A40] accent-[#5A5A40] cursor-pointer shrink-0"
          />
          <div>
            <div className="flex items-center gap-1.5">
              <Lightbulb className="w-3.5 h-3.5 text-[#5A5A40]" />
              <span className="text-xs font-bold text-[#1a1a1a]">Tips & Recomendaciones</span>
            </div>
            <p className="text-[10px] text-[#7D8C7A] mt-0.5 leading-snug">
              Sugerencias de puntualidad, valet, niños y guía de eventos.
            </p>
          </div>
        </label>
      </div>
    </div>
  );
};
