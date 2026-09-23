import React from 'react';
import { ArrowDown, ArrowUp, GripVertical } from 'lucide-react';
import { WeddingSettings } from '../../../types.ts';
import {
  DEFAULT_DETAIL_SECTION_ORDER,
  DEFAULT_LANDING_SECTION_ORDER,
  getDetailSectionOrder,
  getLandingSectionOrder,
  moveOrderedItem,
} from '../../../lib/sectionOrder.ts';

interface AdminSectionOrderProps {
  settings: WeddingSettings;
  onChange: (updated: Partial<WeddingSettings>) => void;
}

const LANDING_LABELS: Record<(typeof DEFAULT_LANDING_SECTION_ORDER)[number], string> = {
  invitation: 'Portada e información del evento',
  gallery: 'Galería de fotos',
  video: 'Recuerdos en video',
  hotels: 'Hoteles y hospedaje',
  guestbook: 'Libro de deseos',
  rsvp: 'Confirmación de asistencia',
};

const DETAIL_LABELS: Record<(typeof DEFAULT_DETAIL_SECTION_ORDER)[number], string> = {
  ceremony: 'Ceremonia',
  reception: 'Lugar de celebración',
  itinerary: 'Itinerario',
  gifts: 'Regalos y cuentas',
  'dress-code': 'Vestimenta',
  tips: 'Tips y recomendaciones',
};

export const AdminSectionOrder: React.FC<AdminSectionOrderProps> = ({ settings, onChange }) => {
  const landingOrder = getLandingSectionOrder(settings.landingSectionOrder);
  const detailOrder = getDetailSectionOrder(settings.detailSectionOrder);

  const saveLandingOrder = (index: number, offset: -1 | 1) => {
    onChange({ landingSectionOrder: JSON.stringify(moveOrderedItem(landingOrder, index, offset)) });
  };

  const saveDetailOrder = (index: number, offset: -1 | 1) => {
    onChange({ detailSectionOrder: JSON.stringify(moveOrderedItem(detailOrder, index, offset)) });
  };

  const renderOrderList = <T extends string>(
    order: T[],
    labels: Record<T, string>,
    move: (index: number, offset: -1 | 1) => void,
  ) => (
    <ol className="space-y-2">
      {order.map((id, index) => (
        <li key={id} className="flex items-center gap-2 rounded-xl border border-[#E5E2D0] bg-white px-3 py-2">
          <GripVertical className="h-4 w-4 shrink-0 text-[#A5A58D]" aria-hidden="true" />
          <span className="min-w-0 flex-1 text-xs font-medium text-stone-800">{labels[id]}</span>
          <span className="text-[10px] tabular-nums text-stone-400">{index + 1}</span>
          <button
            type="button"
            onClick={() => move(index, -1)}
            disabled={index === 0}
            aria-label={`Subir ${labels[id]}`}
            className="cursor-pointer rounded-lg p-1.5 text-[#5A5A40] hover:bg-[#FAF9F0] disabled:cursor-not-allowed disabled:opacity-30"
          >
            <ArrowUp className="h-3.5 w-3.5" />
          </button>
          <button
            type="button"
            onClick={() => move(index, 1)}
            disabled={index === order.length - 1}
            aria-label={`Bajar ${labels[id]}`}
            className="cursor-pointer rounded-lg p-1.5 text-[#5A5A40] hover:bg-[#FAF9F0] disabled:cursor-not-allowed disabled:opacity-30"
          >
            <ArrowDown className="h-3.5 w-3.5" />
          </button>
        </li>
      ))}
    </ol>
  );

  return (
    <div className="rounded-2xl border border-[#E5E2D0] bg-[#FAF9F0]/70 p-4 sm:p-5">
      <div className="mb-4">
        <h4 className="font-serif text-sm font-bold text-stone-900">Orden de las secciones</h4>
        <p className="mt-1 text-[11px] leading-relaxed text-stone-600">
          Usa las flechas para decidir qué aparece primero. El orden se guarda con la invitación; al integrar la galería en la información del evento, su posición se configura por separado.
        </p>
      </div>
      <div className="grid gap-5 lg:grid-cols-2">
        <div>
          <h5 className="mb-2 text-[11px] font-bold uppercase tracking-wider text-[#5A5A40]">Landing</h5>
          {renderOrderList(landingOrder, LANDING_LABELS, saveLandingOrder)}
        </div>
        <div>
          <h5 className="mb-2 text-[11px] font-bold uppercase tracking-wider text-[#5A5A40]">Información del evento</h5>
          {renderOrderList(detailOrder, DETAIL_LABELS, saveDetailOrder)}
        </div>
      </div>
      <div className="mt-5 grid gap-3 rounded-xl border border-[#E5E2D0] bg-white p-3 sm:grid-cols-2 sm:items-end">
        <label className="block">
          <span className="mb-1 block text-[11px] font-semibold text-stone-700">Ubicación de la galería</span>
          <select
            value={settings.galleryPlacement || 'landing'}
            onChange={(event) => onChange({ galleryPlacement: event.target.value as WeddingSettings['galleryPlacement'] })}
            className="w-full cursor-pointer rounded-lg border border-[#E5E2D0] bg-[#FAF9F0] px-3 py-2 text-xs text-stone-800"
          >
            <option value="landing">Como sección independiente de la landing</option>
            <option value="event-details">Entre las tarjetas de información del evento</option>
          </select>
        </label>
        {settings.galleryPlacement === 'event-details' && (
          <label className="block">
            <span className="mb-1 block text-[11px] font-semibold text-stone-700">Mostrar la galería después de</span>
            <select
              value={settings.galleryAfterDetailSection || 'reception'}
              onChange={(event) => onChange({ galleryAfterDetailSection: event.target.value as WeddingSettings['galleryAfterDetailSection'] })}
              className="w-full cursor-pointer rounded-lg border border-[#E5E2D0] bg-[#FAF9F0] px-3 py-2 text-xs text-stone-800"
            >
              {DEFAULT_DETAIL_SECTION_ORDER.map((id) => <option key={id} value={id}>{DETAIL_LABELS[id]}</option>)}
            </select>
          </label>
        )}
      </div>
    </div>
  );
};
