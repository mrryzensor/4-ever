import React from 'react';
import {
  User,
  Users,
  CheckCircle2,
  XCircle,
  Clock,
  Phone,
  Mail,
  Key,
  X,
  Sparkles,
  Check
} from 'lucide-react';
import { Guest, RsvpOptionalField } from '../../../types.ts';
import { parseGuestCompanionNames } from '../../../lib/guestCompanions.ts';
import { parseCustomRsvpDetails } from '../../../lib/rsvpOptionalFields.ts';

export interface ExtendedGuestFormData {
  fullName: string;
  allocatedPasses: number;
  confirmedPasses: number;
  groupName: string;
  accessCode: string;
  phone: string;
  email: string;
  status: 'pending' | 'confirmed' | 'declined';
  attendingCeremony: boolean;
  attendingReception: boolean;
  dietaryRestrictions: string;
  suggestedSong: string;
  message: string;
  companionNames: string;
  customRsvpDetails: string;
}

interface AdminGuestModalProps {
  isOpen: boolean;
  editingGuest: Guest | null;
  formData: ExtendedGuestFormData;
  optionalFields: RsvpOptionalField[];
  onChangeFormData: (updated: Partial<ExtendedGuestFormData>) => void;
  onClose: () => void;
  onSave: (e: React.FormEvent) => void;
  submitting?: boolean;
}

export const AdminGuestModal: React.FC<AdminGuestModalProps> = ({
  isOpen,
  editingGuest,
  formData,
  optionalFields,
  onChangeFormData,
  onClose,
  onSave,
  submitting = false,
}) => {
  if (!isOpen) return null;

  // Companion names parsing
  const companionList = parseGuestCompanionNames(formData.companionNames, formData.fullName, formData.confirmedPasses);
  const customAnswers = parseCustomRsvpDetails(formData.customRsvpDetails);
  const configuredFieldIds = new Set(optionalFields.map((field) => field.id));
  const savedBuiltInFields: RsvpOptionalField[] = [
    { id: 'dietaryRestrictions', label: 'Respuesta anterior: Restricciones alimentarias / alergias', placeholder: '', type: 'text' },
    { id: 'suggestedSong', label: 'Respuesta anterior: Canción para la fiesta', placeholder: '', type: 'text' },
    { id: 'message', label: 'Respuesta anterior: Mensaje o dedicatoria', placeholder: '', type: 'textarea' },
    { id: 'phone', label: 'Respuesta anterior: Teléfono / WhatsApp', placeholder: '', type: 'tel' },
    { id: 'email', label: 'Respuesta anterior: Correo electrónico', placeholder: '', type: 'email' },
  ].filter((field) => !configuredFieldIds.has(field.id) && Boolean((formData[field.id as keyof ExtendedGuestFormData] as string)?.trim()));
  const fieldsToRender = [
    ...optionalFields,
    ...savedBuiltInFields,
    ...Object.keys(customAnswers)
      .filter((id) => !configuredFieldIds.has(id))
      .map((id) => ({
        id,
        label: `Pregunta anterior (${id.replace(/^custom_/, '')})`,
        placeholder: '',
        type: 'text' as const,
      })),
  ];
  const optionalValues: Record<string, string> = {
    dietaryRestrictions: formData.dietaryRestrictions,
    suggestedSong: formData.suggestedSong,
    message: formData.message,
    phone: formData.phone,
    email: formData.email,
    ...customAnswers,
  };

  const handleCompanionChange = (index: number, val: string) => {
    const updated = [...companionList];
    updated[index] = val;
    onChangeFormData({ companionNames: JSON.stringify(updated) });
  };

  const handleConfirmedPassesChange = (num: number) => {
    const validNum = Math.max(1, Math.min(num, formData.allocatedPasses || 20));
    const newCompanions = [...companionList];
    const companionCount = Math.max(0, validNum - 1);
    while (newCompanions.length < companionCount) {
      newCompanions.push('');
    }
    onChangeFormData({
      confirmedPasses: validNum,
      companionNames: JSON.stringify(newCompanions.slice(0, companionCount)),
      status: validNum > 0 ? 'confirmed' : formData.status,
    });
  };

  const handleOptionalAnswerChange = (id: string, value: string) => {
    switch (id) {
      case 'dietaryRestrictions': onChangeFormData({ dietaryRestrictions: value }); break;
      case 'suggestedSong': onChangeFormData({ suggestedSong: value }); break;
      case 'message': onChangeFormData({ message: value }); break;
      case 'phone': onChangeFormData({ phone: value }); break;
      case 'email': onChangeFormData({ email: value }); break;
      default: onChangeFormData({ customRsvpDetails: JSON.stringify({ ...customAnswers, [id]: value }) });
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-stone-900/70 backdrop-blur-md overflow-y-auto">
      <div className="bg-[#FDFCF0] border border-[#E5E2D0] rounded-3xl sm:rounded-[36px] p-5 sm:p-8 max-w-3xl w-full shadow-2xl text-[#3D3D3D] relative my-auto max-h-[92vh] flex flex-col animate-in fade-in zoom-in-95 duration-200">
        
        {/* Header */}
        <div className="flex items-start justify-between border-b border-[#E5E2D0] pb-4 mb-4 shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-[#5A5A40]/10 border border-[#5A5A40]/20 text-[#5A5A40] flex items-center justify-center shrink-0">
              <Users className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-xl sm:text-2xl font-serif text-[#1a1a1a] font-bold">
                  {editingGuest ? 'Editar & Sincronizar Invitado' : 'Registrar Nuevo Invitado'}
                </h3>
                {editingGuest && (
                  <span
                    className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold tracking-wide uppercase ${
                      formData.status === 'confirmed'
                        ? 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                        : formData.status === 'declined'
                        ? 'bg-rose-100 text-rose-800 border border-rose-300'
                        : 'bg-amber-100 text-amber-800 border border-amber-300'
                    }`}
                  >
                    {formData.status === 'confirmed' && <CheckCircle2 className="w-3 h-3 text-emerald-600" />}
                    {formData.status === 'declined' && <XCircle className="w-3 h-3 text-rose-600" />}
                    {formData.status === 'pending' && <Clock className="w-3 h-3 text-amber-600" />}
                    {formData.status === 'confirmed' ? 'Confirmado' : formData.status === 'declined' ? 'No Asiste' : 'Pendiente'}
                  </span>
                )}
              </div>
              <p className="text-xs text-[#7D8C7A] font-serif italic mt-0.5">
                Gestiona pases, código de acceso y todos los datos sincronizados del RSVP en tiempo real.
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="text-[#5A5A40] hover:text-[#1a1a1a] p-2 rounded-full hover:bg-white border border-transparent hover:border-[#E5E2D0] cursor-pointer transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Scrollable Form Body */}
        <form onSubmit={onSave} className="overflow-y-auto pr-1 sm:pr-2 space-y-6 flex-1">
          
          {/* SECCIÓN 1: DATOS PRINCIPALES DE CONTACTO & ASIGNACIÓN */}
          <div className="bg-white p-4 sm:p-5 rounded-2xl sm:rounded-3xl border border-[#E5E2D0] space-y-4 shadow-2xs">
            <h4 className="text-xs font-bold uppercase tracking-widest text-[#5A5A40] flex items-center gap-2">
              <User className="w-3.5 h-3.5 text-[#7D8C7A]" />
              1. Datos de Identificación & Pases Asignados
            </h4>

            <div className="grid grid-cols-1 sm:grid-cols-12 gap-3.5">
              <div className="sm:col-span-7">
                <label className="text-xs font-semibold text-[#5A5A40] block mb-1.5">
                  Nombre Completo / Familia: <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  placeholder="Ej. Familia Rodríguez Morales"
                  value={formData.fullName}
                  onChange={(e) => onChangeFormData({ fullName: e.target.value })}
                  className="w-full bg-[#FAF9F0] border border-[#E5E2D0] rounded-xl px-3.5 py-2.5 text-xs text-[#3D3D3D] font-medium focus:outline-none focus:border-[#5A5A40] focus:bg-white transition-all"
                  required
                />
              </div>

              <div className="sm:col-span-5">
                <label className="text-xs font-semibold text-[#5A5A40] block mb-1.5">
                  Grupo o Categoría:
                </label>
                <input
                  type="text"
                  placeholder="Ej. Familia Novia, Amigos, Trabajo"
                  value={formData.groupName}
                  onChange={(e) => onChangeFormData({ groupName: e.target.value })}
                  className="w-full bg-[#FAF9F0] border border-[#E5E2D0] rounded-xl px-3.5 py-2.5 text-xs text-[#3D3D3D] focus:outline-none focus:border-[#5A5A40] focus:bg-white transition-all"
                />
              </div>

              <div className="sm:col-span-4">
                <label className="text-xs font-semibold text-[#5A5A40] block mb-1.5 flex items-center justify-between">
                  <span>Pases Asignados:</span>
                  <span className="text-[10px] text-stone-400 font-mono">Máx invitado</span>
                </label>
                <input
                  type="number"
                  min={1}
                  max={20}
                  value={formData.allocatedPasses}
                  onChange={(e) => {
                    const allocated = parseInt(e.target.value, 10) || 1;
                    onChangeFormData({
                      allocatedPasses: allocated,
                      confirmedPasses: Math.min(formData.confirmedPasses, allocated),
                    });
                  }}
                  className="w-full bg-[#FAF9F0] border border-[#E5E2D0] rounded-xl px-3.5 py-2.5 text-xs text-[#3D3D3D] font-bold focus:outline-none focus:border-[#5A5A40] focus:bg-white"
                  required
                />
              </div>

              <div className="sm:col-span-4">
                <label className="text-xs font-semibold text-[#5A5A40] block mb-1.5 flex items-center gap-1">
                  <Key className="w-3 h-3 text-[#7D8C7A]" />
                  Código de Acceso Único:
                </label>
                <input
                  type="text"
                  placeholder="Ej. FAM-ROD-881"
                  value={formData.accessCode}
                  onChange={(e) => onChangeFormData({ accessCode: e.target.value.toUpperCase() })}
                  className="w-full bg-[#FAF9F0] border border-[#E5E2D0] rounded-xl px-3.5 py-2.5 text-xs font-mono font-bold text-[#5A5A40] focus:outline-none focus:border-[#5A5A40] focus:bg-white uppercase"
                />
              </div>

              {!configuredFieldIds.has('phone') && <div className="sm:col-span-4">
                <label className="text-xs font-semibold text-[#5A5A40] block mb-1.5 flex items-center gap-1">
                  <Phone className="w-3 h-3 text-[#7D8C7A]" />
                  WhatsApp / Celular:
                </label>
                <input
                  type="tel"
                  placeholder="+51 999 000 111"
                  value={formData.phone}
                  onChange={(e) => onChangeFormData({ phone: e.target.value })}
                  className="w-full bg-[#FAF9F0] border border-[#E5E2D0] rounded-xl px-3.5 py-2.5 text-xs font-mono text-[#3D3D3D] focus:outline-none focus:border-[#5A5A40] focus:bg-white"
                />
              </div>}

              {!configuredFieldIds.has('email') && <div className="sm:col-span-12">
                <label className="text-xs font-semibold text-[#5A5A40] block mb-1.5 flex items-center gap-1">
                  <Mail className="w-3 h-3 text-[#7D8C7A]" />
                  Correo Electrónico (opcional):
                </label>
                <input
                  type="email"
                  placeholder="ejemplo@correo.com"
                  value={formData.email}
                  onChange={(e) => onChangeFormData({ email: e.target.value })}
                  className="w-full bg-[#FAF9F0] border border-[#E5E2D0] rounded-xl px-3.5 py-2.5 text-xs text-[#3D3D3D] focus:outline-none focus:border-[#5A5A40] focus:bg-white"
                />
              </div>}
            </div>
          </div>

          {/* SECCIÓN 2: DATOS SINCRONIZADOS DE CONFIRMACIÓN & ASISTENCIA */}
          <div className="bg-white p-4 sm:p-5 rounded-2xl sm:rounded-3xl border border-[#E5E2D0] space-y-4 shadow-2xs">
            <div className="flex items-center justify-between border-b border-[#E5E2D0]/60 pb-2">
              <h4 className="text-xs font-bold uppercase tracking-widest text-[#5A5A40] flex items-center gap-2">
                <Sparkles className="w-3.5 h-3.5 text-[#7D8C7A]" />
                2. Estado del RSVP & Detalles de la Celebración (Sincronizado)
              </h4>
              <span className="text-[10px] text-[#7D8C7A] font-serif italic">
                {editingGuest?.confirmedAt ? `Confirmó el ${new Date(editingGuest.confirmedAt).toLocaleDateString()}` : 'No confirmado aún'}
              </span>
            </div>

            {/* Selector de Estado */}
            <div>
              <label className="text-xs font-semibold text-[#5A5A40] block mb-2">
                Estado de la Confirmación:
              </label>
              <div className="grid grid-cols-3 gap-2 sm:gap-3">
                <button
                  type="button"
                  onClick={() => onChangeFormData({ status: 'confirmed', confirmedPasses: formData.confirmedPasses || formData.allocatedPasses })}
                  className={`py-2.5 px-3 rounded-xl border text-xs font-bold flex items-center justify-center gap-1.5 cursor-pointer transition-all ${
                    formData.status === 'confirmed'
                      ? 'bg-emerald-50 border-emerald-500 text-emerald-900 ring-2 ring-emerald-500/20 shadow-xs'
                      : 'bg-[#FAF9F0] border-[#E5E2D0] text-stone-600 hover:bg-white'
                  }`}
                >
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                  <span>Asistirá</span>
                </button>

                <button
                  type="button"
                  onClick={() => onChangeFormData({ status: 'declined', confirmedPasses: 0 })}
                  className={`py-2.5 px-3 rounded-xl border text-xs font-bold flex items-center justify-center gap-1.5 cursor-pointer transition-all ${
                    formData.status === 'declined'
                      ? 'bg-rose-50 border-rose-500 text-rose-900 ring-2 ring-rose-500/20 shadow-xs'
                      : 'bg-[#FAF9F0] border-[#E5E2D0] text-stone-600 hover:bg-white'
                  }`}
                >
                  <XCircle className="w-4 h-4 text-rose-600" />
                  <span>No Asistirá</span>
                </button>

                <button
                  type="button"
                  onClick={() => onChangeFormData({ status: 'pending' })}
                  className={`py-2.5 px-3 rounded-xl border text-xs font-bold flex items-center justify-center gap-1.5 cursor-pointer transition-all ${
                    formData.status === 'pending'
                      ? 'bg-amber-50 border-amber-500 text-amber-900 ring-2 ring-amber-500/20 shadow-xs'
                      : 'bg-[#FAF9F0] border-[#E5E2D0] text-stone-600 hover:bg-white'
                  }`}
                >
                  <Clock className="w-4 h-4 text-amber-600" />
                  <span>Pendiente</span>
                </button>
              </div>
            </div>

            {formData.status === 'confirmed' && (
              <div className="space-y-4 pt-2 border-t border-[#E5E2D0]/60 animate-fadeIn">
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div>
                    <label className="text-xs font-semibold text-[#5A5A40] block mb-1.5">
                      Número de Asistentes Confirmados:
                    </label>
                    <input
                      type="number"
                      min={1}
                      max={formData.allocatedPasses || 20}
                      value={formData.confirmedPasses}
                      onChange={(e) => handleConfirmedPassesChange(parseInt(e.target.value, 10) || 1)}
                      className="w-full bg-[#FAF9F0] border border-[#E5E2D0] rounded-xl px-3.5 py-2.5 text-xs font-bold text-emerald-900 focus:outline-none focus:border-[#5A5A40] focus:bg-white"
                    />
                  </div>

                  <div className="sm:col-span-2 flex items-center gap-4 pt-5">
                    <label className="flex items-center gap-2 cursor-pointer select-none text-xs text-stone-700 font-medium">
                      <input
                        type="checkbox"
                        checked={formData.attendingCeremony}
                        onChange={(e) => onChangeFormData({ attendingCeremony: e.target.checked })}
                        className="w-4 h-4 rounded text-[#5A5A40] focus:ring-0 border-stone-300"
                      />
                      <span>Asiste a Ceremonia</span>
                    </label>

                    <label className="flex items-center gap-2 cursor-pointer select-none text-xs text-stone-700 font-medium">
                      <input
                        type="checkbox"
                        checked={formData.attendingReception}
                        onChange={(e) => onChangeFormData({ attendingReception: e.target.checked })}
                        className="w-4 h-4 rounded text-[#5A5A40] focus:ring-0 border-stone-300"
                      />
                      <span>Asiste a Recepción & Fiesta</span>
                    </label>
                  </div>
                </div>

                {/* Sólo almacenar nombres de acompañantes; el titular ya está en fullName. */}
                {formData.confirmedPasses > 1 && (
                  <div className="p-3.5 rounded-2xl bg-[#FAF9F0] border border-[#E5E2D0] space-y-2">
                    <label className="text-[11px] font-bold uppercase tracking-wider text-[#5A5A40] block">
                      Nombres de los Acompañantes ({formData.confirmedPasses - 1}):
                    </label>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                      {Array.from({ length: formData.confirmedPasses - 1 }).map((_, idx) => (
                        <input
                          key={idx}
                          type="text"
                          placeholder={`Acompañante ${idx + 1}`}
                          value={companionList[idx] || ''}
                          onChange={(e) => handleCompanionChange(idx, e.target.value)}
                          className="bg-white border border-[#E5E2D0] rounded-xl px-3 py-2 text-xs text-stone-800 focus:outline-none focus:border-[#5A5A40]"
                        />
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}

            {fieldsToRender.length > 0 && (
              <section className="space-y-3 border-t border-[#E5E2D0] pt-4">
                <h4 className="text-xs font-bold uppercase tracking-wider text-[#5A5A40]">Detalles opcionales</h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                  {fieldsToRender.map((field) => {
                    return (
                      <label key={field.id} className={`block ${field.type === 'textarea' ? 'sm:col-span-2' : ''}`}>
                        <span className="mb-1.5 block text-xs font-semibold text-[#5A5A40]">{field.label}</span>
                        {field.type === 'textarea' ? (
                          <textarea
                            rows={2}
                            value={optionalValues[field.id] || ''}
                            placeholder={field.placeholder}
                            onChange={(event) => handleOptionalAnswerChange(field.id, event.target.value)}
                            className="w-full resize-y rounded-xl border border-[#E5E2D0] bg-[#FAF9F0] px-3.5 py-2.5 text-xs text-[#3D3D3D] focus:border-[#5A5A40] focus:bg-white focus:outline-none"
                          />
                        ) : (
                          <input
                            type={field.type === 'tel' || field.type === 'email' ? field.type : 'text'}
                            value={optionalValues[field.id] || ''}
                            placeholder={field.placeholder}
                            onChange={(event) => handleOptionalAnswerChange(field.id, event.target.value)}
                            className="w-full rounded-xl border border-[#E5E2D0] bg-[#FAF9F0] px-3.5 py-2.5 text-xs text-[#3D3D3D] focus:border-[#5A5A40] focus:bg-white focus:outline-none"
                          />
                        )}
                      </label>
                    );
                  })}
                </div>
              </section>
            )}
          </div>

          {/* Action Buttons */}
          <div className="pt-2 flex flex-col sm:flex-row items-center justify-end gap-3 sticky bottom-0 bg-[#FDFCF0] pb-2">
            <button
              type="button"
              onClick={onClose}
              className="w-full sm:w-auto px-5 py-3 rounded-full border border-[#E5E2D0] text-stone-600 hover:bg-white text-xs font-semibold transition-all cursor-pointer"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="w-full sm:w-auto px-8 py-3 rounded-full bg-[#5A5A40] hover:bg-[#484833] text-white text-xs font-semibold shadow-md transition-all cursor-pointer flex items-center justify-center gap-2 disabled:opacity-60"
            >
              {submitting ? (
                <span>Guardando cambios...</span>
              ) : (
                <>
                  <Check className="w-4 h-4 text-amber-300" />
                  <span>{editingGuest ? 'Actualizar & Sincronizar Invitado' : 'Guardar Invitado'}</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
