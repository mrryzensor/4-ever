import React from 'react';
import { Plus, Trash2 } from 'lucide-react';
import type { RsvpOptionalField, WeddingSettings } from '../../../types.ts';
import { parseRsvpOptionalFields, resolveRsvpMaxCompanions } from '../../../lib/rsvpOptionalFields.ts';

interface RsvpFormOptionsSettingsProps {
  settings: WeddingSettings;
  onChange: (updated: Partial<WeddingSettings>) => void;
}

const inputClass = 'w-full rounded-xl border border-[#E5E2D0] bg-[#FAF9F0] px-3 py-2 text-xs text-[#3D3D3D] focus:border-[#5A5A40] focus:outline-none';

export const RsvpFormOptionsSettings: React.FC<RsvpFormOptionsSettingsProps> = ({ settings, onChange }) => {
  const fields = parseRsvpOptionalFields(settings.rsvpOptionalFields);
  const updateFields = (nextFields: RsvpOptionalField[]) => onChange({ rsvpOptionalFields: JSON.stringify(nextFields) });

  const addField = () => {
    const idBase = `custom_${Date.now().toString(36)}`;
    let id = idBase;
    let suffix = 2;
    while (fields.some((field) => field.id === id)) id = `${idBase}_${suffix++}`;
    updateFields([...fields, { id, label: 'Nueva pregunta', placeholder: 'Escribe tu respuesta...', type: 'text' }]);
  };

  const updateField = (id: string, updates: Partial<RsvpOptionalField>) => {
    updateFields(fields.map((field) => field.id === id ? { ...field, ...updates } : field));
  };

  return (
    <section className="space-y-4 rounded-2xl border border-[#E5E2D0] bg-[#FAF9F0]/70 p-4">
      <div>
        <h4 className="text-sm font-bold text-[#3D3D3D]">Configuración del formulario RSVP</h4>
        <p className="mt-1 text-[11px] text-[#7D8C7A]">Estas opciones aplican al formulario de la portada y al apartado de confirmación.</p>
      </div>

      <label className="block max-w-sm">
        <span className="mb-1.5 block text-xs font-semibold text-[#5A5A40]">Máximo de acompañantes por invitación</span>
        <input
          type="number"
          min={0}
          max={20}
          step={1}
          value={resolveRsvpMaxCompanions(settings.rsvpMaxCompanions)}
          onChange={(event) => onChange({ rsvpMaxCompanions: resolveRsvpMaxCompanions(Number(event.target.value)) })}
          className={inputClass}
        />
        <span className="mt-1 block text-[10px] text-stone-500">El máximo se combina con los pases asignados a cada invitado. Usa 0 para no permitir acompañantes.</span>
      </label>

      <div className="space-y-3 border-t border-[#E5E2D0] pt-4">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div>
            <h5 className="text-xs font-bold text-[#3D3D3D]">Detalles opcionales</h5>
            <p className="mt-0.5 text-[10px] text-stone-500">Edita, elimina o añade preguntas. Si no quedan preguntas, el acordeón no aparece.</p>
          </div>
          <button type="button" onClick={addField} className="inline-flex items-center gap-1.5 rounded-lg border border-[#D7D3BF] bg-white px-3 py-2 text-xs font-semibold text-[#5A5A40] hover:bg-stone-50">
            <Plus className="h-3.5 w-3.5" /> Añadir pregunta
          </button>
        </div>

        {fields.length === 0 ? (
          <p className="rounded-xl border border-dashed border-stone-300 bg-white p-4 text-xs text-stone-500">No hay detalles opcionales configurados.</p>
        ) : (
          <div className="space-y-2.5">
            {fields.map((field) => (
              <div key={field.id} className="grid grid-cols-1 items-end gap-2 rounded-xl border border-stone-200 bg-white p-3 sm:grid-cols-[minmax(0,1fr)_minmax(0,1fr)_140px_36px]">
                <label className="block">
                  <span className="mb-1 block text-[10px] font-semibold text-stone-600">Pregunta / etiqueta</span>
                  <input value={field.label} maxLength={100} onChange={(event) => updateField(field.id, { label: event.target.value })} className={inputClass} />
                </label>
                <label className="block">
                  <span className="mb-1 block text-[10px] font-semibold text-stone-600">Texto de ayuda</span>
                  <input value={field.placeholder} maxLength={160} onChange={(event) => updateField(field.id, { placeholder: event.target.value })} className={inputClass} />
                </label>
                <label className="block">
                  <span className="mb-1 block text-[10px] font-semibold text-stone-600">Tipo de respuesta</span>
                  <select value={field.type} onChange={(event) => updateField(field.id, { type: event.target.value as RsvpOptionalField['type'] })} className={inputClass}>
                    <option value="text">Texto corto</option>
                    <option value="textarea">Texto largo</option>
                    <option value="tel">Teléfono</option>
                    <option value="email">Correo electrónico</option>
                  </select>
                </label>
                <button type="button" onClick={() => updateFields(fields.filter((item) => item.id !== field.id))} aria-label={`Eliminar pregunta ${field.label}`} title="Eliminar pregunta" className="flex h-9 w-9 items-center justify-center rounded-lg text-rose-600 hover:bg-rose-50">
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </section>
  );
};
