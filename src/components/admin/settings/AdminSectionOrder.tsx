import React, { useState } from 'react';
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

type OrderGroup = 'landing' | 'detail';

const moveItemToIndex = <T,>(items: readonly T[], from: number, to: number): T[] => {
  if (from < 0 || from >= items.length || to < 0 || to >= items.length || from === to) return [...items];
  const updated = [...items];
  const [item] = updated.splice(from, 1);
  updated.splice(to, 0, item);
  return updated;
};

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
  reception: 'Recepción y brindis (lugar de celebración)',
  rsvp: 'Botón de confirmar asistencia',
  itinerary: 'Itinerario',
  gifts: 'Regalos y cuentas',
  'dress-code': 'Vestimenta',
  tips: 'Tips y recomendaciones',
};

export const AdminSectionOrder: React.FC<AdminSectionOrderProps> = ({ settings, onChange }) => {
  const [draggedSection, setDraggedSection] = useState<{ group: OrderGroup; id: string } | null>(null);
  const [dropTarget, setDropTarget] = useState<{ group: OrderGroup; id: string } | null>(null);
  const landingOrder = getLandingSectionOrder(settings.landingSectionOrder);
  const detailOrder = getDetailSectionOrder(settings.detailSectionOrder);

  const saveLandingOrder = (index: number, offset: -1 | 1) => {
    onChange({ landingSectionOrder: JSON.stringify(moveOrderedItem(landingOrder, index, offset)) });
  };

  const saveDetailOrder = (index: number, offset: -1 | 1) => {
    onChange({ detailSectionOrder: JSON.stringify(moveOrderedItem(detailOrder, index, offset)) });
  };

  const reorderLanding = (from: number, to: number) => {
    onChange({ landingSectionOrder: JSON.stringify(moveItemToIndex(landingOrder, from, to)) });
  };

  const reorderDetails = (from: number, to: number) => {
    onChange({ detailSectionOrder: JSON.stringify(moveItemToIndex(detailOrder, from, to)) });
  };

  const renderOrderList = <T extends string>(
    order: T[],
    labels: Record<T, string>,
    group: OrderGroup,
    move: (index: number, offset: -1 | 1) => void,
    reorder: (from: number, to: number) => void,
  ) => (
    <ol className="w-full min-w-0 space-y-2">
      {order.map((id, index) => (
        <li
          key={id}
          onDragOver={(event) => {
            if (draggedSection?.group !== group) return;
            event.preventDefault();
            event.dataTransfer.dropEffect = 'move';
            setDropTarget({ group, id });
          }}
          onDrop={(event) => {
            event.preventDefault();
            if (draggedSection?.group === group) {
              const from = order.indexOf(draggedSection.id as T);
              reorder(from, index);
            }
            setDraggedSection(null);
            setDropTarget(null);
          }}
          className={`grid w-full min-w-0 grid-cols-[32px_minmax(0,1fr)_24px_32px_32px] items-center gap-1.5 rounded-xl border bg-white px-2.5 py-2.5 transition-colors sm:gap-2 sm:px-3 ${
            draggedSection?.group === group && draggedSection.id === id ? 'opacity-50' : ''
          } ${
            dropTarget?.group === group && dropTarget.id === id ? 'border-[#5A5A40] bg-[#FAF9F0] ring-2 ring-[#5A5A40]/20' : 'border-[#E5E2D0]'
          }`}
        >
          <button
            type="button"
            draggable
            onDragStart={(event) => {
              setDraggedSection({ group, id });
              setDropTarget({ group, id });
              event.dataTransfer.effectAllowed = 'move';
              event.dataTransfer.setData('text/plain', id);
            }}
            onDragEnd={() => {
              setDraggedSection(null);
              setDropTarget(null);
            }}
            aria-label={`Arrastrar para reordenar: ${labels[id]}`}
            title="Arrastrar para reordenar"
            className="flex h-8 w-8 cursor-grab touch-none items-center justify-center rounded-lg text-[#8B8B74] active:cursor-grabbing hover:bg-[#FAF9F0]"
          >
            <GripVertical className="h-4 w-4" aria-hidden="true" />
          </button>
          <span className="min-w-0 break-words text-xs font-medium leading-snug text-stone-800">{labels[id]}</span>
          <span className="text-center text-[10px] tabular-nums text-stone-400">{index + 1}</span>
          <button
            type="button"
            onClick={() => move(index, -1)}
            disabled={index === 0}
            aria-label={`Subir ${labels[id]}`}
            className="inline-flex h-8 w-8 cursor-pointer items-center justify-center rounded-lg text-[#5A5A40] hover:bg-[#FAF9F0] disabled:cursor-not-allowed disabled:opacity-30"
          >
            <ArrowUp className="h-3.5 w-3.5" />
          </button>
          <button
            type="button"
            onClick={() => move(index, 1)}
            disabled={index === order.length - 1}
            aria-label={`Bajar ${labels[id]}`}
            className="inline-flex h-8 w-8 cursor-pointer items-center justify-center rounded-lg text-[#5A5A40] hover:bg-[#FAF9F0] disabled:cursor-not-allowed disabled:opacity-30"
          >
            <ArrowDown className="h-3.5 w-3.5" />
          </button>
        </li>
      ))}
    </ol>
  );

  return (
    <div className="w-full min-w-0 overflow-hidden rounded-2xl border border-[#E5E2D0] bg-[#FAF9F0]/70 p-3 sm:p-5">
      <div className="mb-4">
        <h4 className="font-serif text-sm font-bold text-stone-900">Orden de las secciones</h4>
        <p className="mt-1 text-[11px] leading-relaxed text-stone-600">
          Arrastra cada elemento desde el asa o usa las flechas para ordenarlo. En pantallas táctiles, utiliza las flechas. La ubicación de la galería se configura por separado.
        </p>
      </div>
      <div className="grid w-full min-w-0 gap-5" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 340px), 1fr))' }}>
        <div className="min-w-0">
          <h5 className="mb-2 text-[11px] font-bold uppercase tracking-wider text-[#5A5A40]">Landing</h5>
          {renderOrderList(landingOrder, LANDING_LABELS, 'landing', saveLandingOrder, reorderLanding)}
        </div>
        <div className="min-w-0">
          <h5 className="mb-2 text-[11px] font-bold uppercase tracking-wider text-[#5A5A40]">Información del evento</h5>
          {renderOrderList(detailOrder, DETAIL_LABELS, 'detail', saveDetailOrder, reorderDetails)}
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
              {DEFAULT_DETAIL_SECTION_ORDER.filter((id) => id !== 'rsvp').map((id) => <option key={id} value={id}>{DETAIL_LABELS[id]}</option>)}
            </select>
          </label>
        )}
      </div>
    </div>
  );
};
