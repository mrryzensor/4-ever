import React, { useState, useRef } from 'react';
import {
  Search,
  Download,
  Plus,
  CheckCircle,
  XCircle,
  Clock,
  MessageCircle,
  Edit2,
  Trash2,
  Share2,
  FileSpreadsheet,
  UploadCloud,
  FileText,
  AlertCircle,
  X,
} from 'lucide-react';
import { Guest, GuestStats, WeddingSettings } from '../../types.ts';
import { toast } from '../../lib/toast.ts';
import { AdminGuestModal, ExtendedGuestFormData } from './AdminGuestModal.tsx';

interface AdminGuestsTabProps {
  settings: WeddingSettings;
  guests: Guest[];
  stats: GuestStats;
  loading: boolean;
  search: string;
  onSearchChange: (value: string) => void;
  filterStatus: string;
  onFilterStatusChange: (value: string) => void;
  onExportCsv: () => void;
  onSaveGuest: (guestData: Partial<Guest> & { id?: number }) => Promise<void>;
  onDeleteGuest: (id: number) => Promise<void>;
  onGuestsImported?: () => void;
}

export const AdminGuestsTab: React.FC<AdminGuestsTabProps> = ({
  settings,
  guests,
  stats,
  loading,
  search,
  onSearchChange,
  filterStatus,
  onFilterStatusChange,
  onExportCsv,
  onSaveGuest,
  onDeleteGuest,
  onGuestsImported,
}) => {
  // Add / Edit Modal State
  const [showGuestModal, setShowGuestModal] = useState(false);
  const [editingGuest, setEditingGuest] = useState<Guest | null>(null);
  const [guestFormData, setGuestFormData] = useState<ExtendedGuestFormData>({
    fullName: '',
    allocatedPasses: 2,
    confirmedPasses: 2,
    groupName: 'Familiares',
    accessCode: '',
    phone: '',
    email: '',
    status: 'pending',
    attendingCeremony: true,
    attendingReception: true,
    dietaryRestrictions: '',
    suggestedSong: '',
    message: '',
    companionNames: '[]',
  });
  const [submitting, setSubmitting] = useState(false);

  // Bulk / Excel Import Modal State
  const [showBulkModal, setShowBulkModal] = useState(false);
  const [bulkPasteText, setBulkPasteText] = useState('');
  const [isBulkImporting, setIsBulkImporting] = useState(false);
  const [bulkStatus, setBulkStatus] = useState<{ type: 'success' | 'error'; message: string } | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const resetGuestForm = () => {
    setEditingGuest(null);
    setGuestFormData({
      fullName: '',
      allocatedPasses: 2,
      confirmedPasses: 2,
      groupName: 'Familiares',
      accessCode: '',
      phone: '',
      email: '',
      status: 'pending',
      attendingCeremony: true,
      attendingReception: true,
      dietaryRestrictions: '',
      suggestedSong: '',
      message: '',
      companionNames: '[]',
    });
  };

  const openAddGuest = () => {
    resetGuestForm();
    setShowGuestModal(true);
  };

  const openEditGuest = (g: Guest) => {
    setEditingGuest(g);
    setGuestFormData({
      fullName: g.fullName,
      allocatedPasses: g.allocatedPasses,
      confirmedPasses: g.confirmedPasses,
      groupName: g.groupName || 'Familiares',
      accessCode: g.accessCode,
      phone: g.phone || '',
      email: g.email || '',
      status: g.status,
      attendingCeremony: g.attendingCeremony ?? true,
      attendingReception: g.attendingReception ?? true,
      dietaryRestrictions: g.dietaryRestrictions || '',
      suggestedSong: g.suggestedSong || '',
      message: g.message || '',
      companionNames: g.companionNames || '[]',
    });
    setShowGuestModal(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      await onSaveGuest({
        id: editingGuest?.id,
        ...guestFormData,
      });
      setShowGuestModal(false);
      resetGuestForm();
      toast.success(editingGuest ? 'Invitado y RSVP actualizados con éxito' : 'Invitado registrado con éxito');
    } catch (err: any) {
      toast.error(err.message || 'Error al guardar invitado', 'Error');
    } finally {
      setSubmitting(false);
    }
  };


  /**
   * Universal Smart Parser for pasted Excel tables (TSV), CSV, or raw text lines:
   * Supports:
   * - Tab-delimited (copy & paste directly from Excel / Google Sheets)
   * - Comma-delimited (CSV standard)
   * - Semicolon-delimited (CSV European/Latin Excel)
   */
  const parseRowsToGuests = (text: string) => {
    const lines = text.split(/\r?\n/).map((l) => l.trim()).filter(Boolean);
    const parsedGuests: Array<{
      weddingId: number;
      fullName: string;
      allocatedPasses: number;
      groupName: string;
      phone: string;
      email: string;
      accessCode?: string;
    }> = [];

    // Header keywords to skip if first row is a header
    const headerKeywords = ['nombre', 'pases', 'pax', 'grupo', 'telefono', 'teléfono', 'email', 'correo', 'codigo', 'código'];

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];
      // Determine delimiter: tab (\t), semicolon (;), or comma (,)
      let cols: string[] = [];
      if (line.includes('\t')) {
        cols = line.split('\t').map((c) => c.trim());
      } else if (line.includes(';')) {
        cols = line.split(';').map((c) => c.trim());
      } else {
        cols = line.split(',').map((c) => c.trim());
      }

      if (cols.length === 0 || !cols[0]) continue;

      // Skip header row if matches common column names
      if (i === 0) {
        const firstColLower = cols[0].toLowerCase();
        if (headerKeywords.some((k) => firstColLower.includes(k))) {
          continue;
        }
      }

      const fullName = cols[0];
      // Passes can be in col 1, or default to 2
      let passes = 2;
      if (cols[1]) {
        const parsedNum = parseInt(cols[1].replace(/[^0-9]/g, ''), 10);
        if (!isNaN(parsedNum) && parsedNum > 0) {
          passes = parsedNum;
        }
      }

      const groupName = cols[2] || 'Invitados';
      const phone = cols[3] || '';
      const email = cols[4] || '';
      const customCode = cols[5] ? cols[5].toUpperCase() : undefined;

      if (fullName) {
        parsedGuests.push({
          weddingId: settings.id || 1,
          fullName,
          allocatedPasses: passes,
          groupName,
          phone,
          email,
          ...(customCode ? { accessCode: customCode } : {}),
        });
      }
    }

    return parsedGuests;
  };

  const handleExecuteBulkImport = async () => {
    const list = parseRowsToGuests(bulkPasteText);
    if (list.length === 0) {
      setBulkStatus({
        type: 'error',
        message: 'No se encontraron invitados válidos. Asegúrate de incluir al menos el nombre de cada invitado.',
      });
      return;
    }

    setIsBulkImporting(true);
    setBulkStatus(null);

    try {
      const res = await fetch('/api/guests/bulk', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          weddingId: settings.id || 1,
          guests: list,
        }),
      });

      if (!res.ok) {
        throw new Error('Error en el servidor al procesar la lista');
      }

      const data = await res.json();
      setBulkStatus({
        type: 'success',
        message: `¡Éxito! Se importaron correctamente ${data.count || list.length} invitados.`,
      });
      setBulkPasteText('');
      if (onGuestsImported) {
        onGuestsImported();
      }

      setTimeout(() => {
        setShowBulkModal(false);
        setBulkStatus(null);
      }, 2200);
    } catch (err: any) {
      setBulkStatus({
        type: 'error',
        message: err.message || 'Ocurrió un error al importar los invitados.',
      });
    } finally {
      setIsBulkImporting(false);
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (evt) => {
      const content = evt.target?.result as string;
      if (content) {
        setBulkPasteText(content);
        setBulkStatus({
          type: 'success',
          message: `Archivo "${file.name}" cargado. Revisa o confirma para importar.`,
        });
      }
    };
    reader.readAsText(file);
  };

  const getWhatsAppLink = (guest: Guest) => {
    if (!guest.phone) return '#';
    const cleanPhone = guest.phone.replace(/[^0-9+]/g, '');
    const currentUrl = window.location.origin;
    const weddingKey = settings.slug || settings.id || 1;
    const directInvitationUrl = `${currentUrl}/?w=${encodeURIComponent(weddingKey)}&code=${encodeURIComponent(guest.accessCode)}`;
    const msg = encodeURIComponent(
      `¡Hola ${guest.fullName}! Nos hace inmensa ilusión invitarte a nuestra boda. Puedes ver todos los detalles y confirmar tus pases (${guest.allocatedPasses}) directamente aquí: ${directInvitationUrl}`
    );
    return `https://wa.me/${cleanPhone.replace('+', '')}?text=${msg}`;
  };

  const copyGuestInvitationLink = (guest: Guest) => {
    const currentUrl = window.location.origin;
    const weddingKey = settings.slug || settings.id || 1;
    const link = `${currentUrl}/?w=${encodeURIComponent(weddingKey)}&code=${encodeURIComponent(guest.accessCode)}`;
    navigator.clipboard.writeText(link);
    toast.success(`Enlace de invitación de "${guest.fullName}" copiado al portapapeles`, 'Enlace Copiado');
  };

  return (
    <div className="space-y-6">
      {/* 1. Header Metrics Card */}
      <div className="bg-white p-6 sm:p-8 rounded-3xl sm:rounded-[36px] border border-[#E5E2D0] shadow-sm">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
          <div>
            <span className="text-xs uppercase tracking-widest text-[#7D8C7A] font-bold">
              Gestión de Invitados & RSVP
            </span>
            <h2 className="text-2xl sm:text-3xl font-serif text-[#1a1a1a] mt-1 font-bold">
              Lista de Asistencia
            </h2>
          </div>
          <div className="flex items-center gap-3">
            <div className="text-right">
              <span className="text-xs text-stone-500 block">Pases Confirmados</span>
              <span className="text-xl sm:text-2xl font-serif font-bold text-[#5A5A40]">
                {stats.totalConfirmedPasses} / {stats.totalAllocatedPasses}
              </span>
            </div>
            <div className="w-12 h-12 rounded-full bg-[#FAF9F0] border border-[#E5E2D0] flex items-center justify-center text-[#5A5A40] font-serif font-bold text-sm">
              {stats.totalAllocatedPasses > 0
                ? `${Math.round((stats.totalConfirmedPasses / stats.totalAllocatedPasses) * 100)}%`
                : '0%'}
            </div>
          </div>
        </div>

        {/* Progress bar */}
        <div className="w-full h-3 bg-[#F5F5F0] rounded-full overflow-hidden mb-6 shadow-inner">
          <div
            className="h-full bg-gradient-to-r from-[#7D8C7A] to-[#5A5A40] transition-all duration-700 rounded-full"
            style={{
              width: `${
                stats.totalAllocatedPasses > 0
                  ? Math.min(
                      100,
                      Math.round(
                        (stats.totalConfirmedPasses / stats.totalAllocatedPasses) * 100
                      )
                    )
                  : 0
              }%`,
            }}
          />
        </div>

        <div className="grid grid-cols-3 gap-2 sm:gap-4 pt-4 border-t border-[#F5F5F0] text-center sm:text-left">
          <div className="p-3 bg-[#FDFCF0] rounded-2xl border border-[#E5E2D0]/50">
            <p className="text-[10px] sm:text-xs uppercase tracking-wider text-stone-500 font-bold">
              Pendientes
            </p>
            <p className="text-xl sm:text-2xl font-serif text-[#1a1a1a] mt-0.5 font-bold">
              {stats.pendingGuests}
            </p>
          </div>
          <div className="p-3 bg-[#FDFCF0] rounded-2xl border border-[#E5E2D0]/50">
            <p className="text-[10px] sm:text-xs uppercase tracking-wider text-stone-500 font-bold">
              No Asisten
            </p>
            <p className="text-xl sm:text-2xl font-serif text-rose-700 mt-0.5 font-bold">
              {stats.declinedGuests}
            </p>
          </div>
          <div className="p-3 bg-amber-50/70 rounded-2xl border border-amber-200/60">
            <p className="text-[10px] sm:text-xs uppercase tracking-wider text-amber-800 font-bold">
              Confirmados
            </p>
            <p className="text-xl sm:text-2xl font-serif text-emerald-700 mt-0.5 font-bold">
              {stats.confirmedCount}
            </p>
          </div>
        </div>
      </div>

      {/* Action Toolbar */}
      <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3 pt-2">
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 flex-1">
          <div className="relative flex-1 max-w-md">
            <Search className="w-4 h-4 text-[#7D8C7A] absolute left-3.5 top-3" />
            <input
              type="text"
              placeholder="Buscar por nombre o código de pase..."
              value={search}
              onChange={(e) => onSearchChange(e.target.value)}
              className="w-full bg-white border border-[#E5E2D0] rounded-full pl-9 pr-4 py-2 text-xs text-[#3D3D3D] focus:outline-none focus:border-[#5A5A40] shadow-xs"
            />
          </div>

          <select
            value={filterStatus}
            onChange={(e) => onFilterStatusChange(e.target.value)}
            className="bg-white border border-[#E5E2D0] rounded-full px-4 py-2 text-xs text-[#3D3D3D] focus:outline-none focus:border-[#5A5A40] shadow-xs cursor-pointer"
          >
            <option value="all">Todos los estados</option>
            <option value="confirmed">Confirmados</option>
            <option value="declined">No Asisten</option>
            <option value="pending">Pendientes</option>
          </select>
        </div>

        <div className="flex items-center gap-2 justify-end flex-wrap">
          {/* BOTÓN 1: IMPORTAR EXCEL / PEGAR TABLA */}
          <button
            onClick={() => setShowBulkModal(true)}
            className="px-4 py-2 rounded-full border border-emerald-700 text-emerald-800 bg-emerald-50 hover:bg-emerald-100 text-xs font-semibold flex items-center gap-1.5 cursor-pointer shadow-xs transition-colors"
            title="Importar masivamente desde Excel o pegar tabla"
            id="btn-import-excel"
          >
            <FileSpreadsheet className="w-3.5 h-3.5 text-emerald-700" />
            <span>Importar Excel / Pegar</span>
          </button>

          {/* BOTÓN 2: EXPORTAR CSV */}
          <button
            onClick={onExportCsv}
            className="px-4 py-2 rounded-full border border-[#5A5A40] text-[#5A5A40] hover:bg-[#5A5A40]/10 text-xs font-semibold flex items-center gap-1.5 cursor-pointer shadow-xs transition-colors"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Exportar CSV</span>
          </button>

          {/* BOTÓN 3: NUEVO INVITADO */}
          <button
            onClick={openAddGuest}
            className="px-5 py-2 rounded-full bg-[#5A5A40] hover:bg-[#484833] text-white text-xs font-semibold flex items-center gap-1.5 cursor-pointer shadow-xs transition-colors"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Nuevo Invitado</span>
          </button>
        </div>
      </div>

      {/* Mobile Guest Cards List (Visible on Small Screens) */}
      <div className="md:hidden space-y-3">
        {loading ? (
          <div className="p-8 text-center bg-white rounded-3xl border border-[#E5E2D0] text-[#7D8C7A] font-serif italic text-sm">
            Cargando invitados...
          </div>
        ) : guests.length === 0 ? (
          <div className="p-8 text-center bg-white rounded-3xl border border-[#E5E2D0] text-[#7D8C7A] font-serif italic text-sm">
            No se encontraron invitados. Puedes agregar uno o importar una lista de Excel.
          </div>
        ) : (
          guests.map((g) => {
            const isConfirmed = g.status === 'confirmed';
            const isDeclined = g.status === 'declined';
            return (
              <div
                key={g.id}
                className="bg-white p-4 rounded-2xl border border-[#E5E2D0] shadow-xs space-y-3"
              >
                <div className="flex items-start justify-between">
                  <div>
                    <h3 className="font-serif font-bold text-sm text-[#1a1a1a]">
                      {g.fullName}
                    </h3>
                    <div className="flex items-center gap-2 mt-1">
                      <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded-full bg-[#FAF9F0] text-[#5A5A40] border border-[#E5E2D0]">
                        {g.accessCode}
                      </span>
                      <span className="text-[10px] text-stone-500 font-medium">
                        {g.groupName || 'Invitados'}
                      </span>
                    </div>
                  </div>

                  <span
                    className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-semibold ${
                      isConfirmed
                        ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                        : isDeclined
                        ? 'bg-rose-50 text-rose-800 border border-rose-200'
                        : 'bg-amber-50 text-amber-800 border border-amber-200'
                    }`}
                  >
                    {isConfirmed && <CheckCircle className="w-3 h-3 text-emerald-600" />}
                    {isDeclined && <XCircle className="w-3 h-3 text-rose-600" />}
                    {!isConfirmed && !isDeclined && <Clock className="w-3 h-3 text-amber-600" />}
                    {isConfirmed ? 'Confirmado' : isDeclined ? 'No Asiste' : 'Pendiente'}
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-2 text-[11px] bg-[#FAF9F0] p-2.5 rounded-xl border border-[#E5E2D0]">
                  <div>
                    <span className="text-stone-500 block">Pases:</span>
                    <span className="font-bold text-[#1a1a1a]">
                      {g.confirmedPasses ?? 0} de {g.allocatedPasses}
                    </span>
                  </div>
                  <div>
                    <span className="text-stone-500 block">Contacto:</span>
                    <span className="font-mono text-stone-700 truncate block">
                      {g.phone || g.email || 'Sin contacto'}
                    </span>
                  </div>
                </div>

                {g.message && (
                  <p className="text-[11px] text-stone-600 italic bg-amber-50/50 p-2 rounded-lg border border-amber-100">
                    "{g.message}"
                  </p>
                )}

                <div className="flex items-center justify-between pt-2 border-t border-[#F5F5F0]">
                  <div className="flex items-center gap-1.5">
                    {g.phone && (
                      <a
                        href={getWhatsAppLink(g)}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="p-1.5 rounded-full bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border border-emerald-200 transition-colors"
                        title="Enviar invitación por WhatsApp"
                      >
                        <MessageCircle className="w-3.5 h-3.5" />
                      </a>
                    )}
                    <button
                      onClick={() => copyGuestInvitationLink(g)}
                      className="p-1.5 rounded-full bg-[#FAF9F0] hover:bg-[#F5F5F0] text-[#5A5A40] border border-[#E5E2D0] transition-colors"
                      title="Copiar enlace personalizado"
                    >
                      <Share2 className="w-3.5 h-3.5" />
                    </button>
                  </div>

                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => openEditGuest(g)}
                      className="p-1.5 text-stone-500 hover:text-[#5A5A40] transition-colors"
                      title="Editar"
                    >
                      <Edit2 className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => onDeleteGuest(g.id)}
                      className="p-1.5 text-stone-400 hover:text-rose-600 transition-colors"
                      title="Eliminar"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Desktop Guest Table (Visible on Tablets & Desktops) */}
      <div className="hidden md:block bg-white rounded-3xl sm:rounded-[36px] border border-[#E5E2D0] shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="border-b border-[#E5E2D0] bg-[#FAF9F0]/80 text-[#5A5A40] font-serif uppercase tracking-wider text-[11px]">
                <th className="py-4 px-5 font-bold">Invitado / Familia</th>
                <th className="py-4 px-4 font-bold">Código</th>
                <th className="py-4 px-4 font-bold">Grupo</th>
                <th className="py-4 px-4 font-bold text-center">Pases</th>
                <th className="py-4 px-4 font-bold text-center">Estado</th>
                <th className="py-4 px-4 font-bold">Contacto</th>
                <th className="py-4 px-5 font-bold text-right">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#F5F5F0]">
              {loading ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-[#7D8C7A] font-serif italic">
                    Cargando invitados...
                  </td>
                </tr>
              ) : guests.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-[#7D8C7A] font-serif italic">
                    No se encontraron invitados. Puedes agregar uno o importar una lista de Excel.
                  </td>
                </tr>
              ) : (
                guests.map((g) => {
                  const isConfirmed = g.status === 'confirmed';
                  const isDeclined = g.status === 'declined';
                  return (
                    <tr key={g.id} className="hover:bg-[#FAF9F0]/50 transition-colors">
                      <td className="py-3.5 px-5">
                        <div className="font-serif font-bold text-stone-800 text-xs sm:text-sm">
                          {g.fullName}
                        </div>
                        {g.message && (
                          <div className="text-[11px] text-stone-500 italic mt-0.5 truncate max-w-xs">
                            "{g.message}"
                          </div>
                        )}
                      </td>
                      <td className="py-3.5 px-4">
                        <span className="font-mono text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-[#FAF9F0] text-[#5A5A40] border border-[#E5E2D0]">
                          {g.accessCode}
                        </span>
                      </td>
                      <td className="py-3.5 px-4 text-stone-600 font-medium">
                        {g.groupName || 'Invitados'}
                      </td>
                      <td className="py-3.5 px-4 text-center">
                        <span className="font-serif font-bold text-stone-800">
                          {g.confirmedPasses ?? 0}
                        </span>
                        <span className="text-stone-400 font-normal"> / {g.allocatedPasses}</span>
                      </td>
                      <td className="py-3.5 px-4 text-center">
                        <span
                          className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-[10px] font-bold tracking-wide uppercase ${
                            isConfirmed
                              ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                              : isDeclined
                              ? 'bg-rose-50 text-rose-800 border border-rose-200'
                              : 'bg-amber-50 text-amber-800 border border-amber-200'
                          }`}
                        >
                          {isConfirmed && <CheckCircle className="w-3 h-3 text-emerald-600" />}
                          {isDeclined && <XCircle className="w-3 h-3 text-rose-600" />}
                          {!isConfirmed && !isDeclined && <Clock className="w-3 h-3 text-amber-600" />}
                          {isConfirmed ? 'Confirmado' : isDeclined ? 'No Asiste' : 'Pendiente'}
                        </span>
                      </td>
                      <td className="py-3.5 px-4">
                        <div className="font-mono text-[11px] text-stone-700">{g.phone || '-'}</div>
                        <div className="text-[10px] text-stone-400 truncate max-w-[130px]">{g.email || ''}</div>
                      </td>
                      <td className="py-3.5 px-5 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          {g.phone && (
                            <a
                              href={getWhatsAppLink(g)}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="p-1.5 rounded-full bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border border-emerald-200 transition-colors"
                              title="Enviar invitación por WhatsApp"
                            >
                              <MessageCircle className="w-3.5 h-3.5" />
                            </a>
                          )}
                          <button
                            onClick={() => copyGuestInvitationLink(g)}
                            className="p-1.5 rounded-full bg-[#FAF9F0] hover:bg-[#F5F5F0] text-[#5A5A40] border border-[#E5E2D0] transition-colors cursor-pointer"
                            title="Copiar enlace personalizado"
                          >
                            <Share2 className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => openEditGuest(g)}
                            className="p-1.5 text-stone-400 hover:text-[#5A5A40] transition-colors cursor-pointer"
                            title="Editar invitado"
                          >
                            <Edit2 className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => onDeleteGuest(g.id)}
                            className="p-1.5 text-stone-300 hover:text-rose-600 transition-colors cursor-pointer"
                            title="Eliminar invitado"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* MODAL 1: IMPORTACIÓN MASIVA DESDE EXCEL / PEGAR TABLA */}
      {/* ========================================================================= */}
      {showBulkModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl border border-[#E5E2D0] p-6 sm:p-8 max-w-2xl w-full shadow-2xl space-y-5 animate-in fade-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between border-b border-[#F5F5F0] pb-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-emerald-100 text-emerald-800 flex items-center justify-center shrink-0">
                  <FileSpreadsheet className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-lg font-serif font-bold text-[#1a1a1a]">
                    Importar Invitados desde Excel / Pegar
                  </h3>
                  <p className="text-xs text-stone-500 font-serif italic">
                    Copia tus columnas en Excel o Google Sheets y pégalas directamente aquí.
                  </p>
                </div>
              </div>
              <button
                onClick={() => {
                  setShowBulkModal(false);
                  setBulkStatus(null);
                }}
                className="p-1.5 rounded-full hover:bg-stone-100 text-stone-400 hover:text-stone-700 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Quick Helper Banner */}
            <div className="bg-[#FAF9F0] p-4 rounded-2xl border border-[#E5E2D0] text-xs text-[#5A5A40] space-y-2">
              <div className="flex items-center gap-2 font-bold text-stone-800">
                <FileText className="w-4 h-4 text-emerald-700" />
                <span>Columnas sugeridas en tu Excel:</span>
              </div>
              <p className="font-mono text-[11px] bg-white p-2.5 rounded-xl border border-[#E5E2D0] text-stone-700 select-all">
                Nombre Completo | Pases | Grupo | Teléfono | Email
              </p>
              <p className="text-[11px] text-stone-500 leading-relaxed">
                Tip: Puedes seleccionar tus filas en Excel con <strong>Ctrl+C</strong> y pegarlas abajo con <strong>Ctrl+V</strong> (las tabulaciones y comas se reconocen automáticamente).
              </p>
            </div>

            {/* Upload CSV or Excel file button */}
            <div className="flex items-center justify-between gap-3">
              <input
                type="file"
                ref={fileInputRef}
                accept=".csv, .txt, .tsv"
                onChange={handleFileUpload}
                className="hidden"
              />
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="px-4 py-2 rounded-xl bg-stone-100 hover:bg-stone-200 text-stone-700 text-xs font-semibold flex items-center gap-2 transition-colors cursor-pointer border border-stone-200"
              >
                <UploadCloud className="w-4 h-4 text-stone-600" />
                <span>Subir archivo .csv o .tsv</span>
              </button>
              <span className="text-[11px] text-stone-400">o pega directamente en el recuadro</span>
            </div>

            {/* Textarea for pasting */}
            <textarea
              rows={8}
              placeholder={`Ejemplo al pegar desde Excel:\nFamilia Ruiz Morales\t4\tFamilia Novio\t+51987654321\tfamilia@gmail.com\nMariana Gómez\t2\tAmigas Novia\t+51911223344\tmariana@empresa.com`}
              value={bulkPasteText}
              onChange={(e) => setBulkPasteText(e.target.value)}
              className="w-full bg-[#FAF9F0] border border-[#E5E2D0] rounded-2xl p-4 font-mono text-xs text-[#3D3D3D] focus:outline-none focus:border-[#5A5A40] shadow-inner resize-y"
            />

            {bulkStatus && (
              <div
                className={`text-xs p-3.5 rounded-2xl flex items-center gap-2 ${
                  bulkStatus.type === 'success'
                    ? 'text-emerald-800 bg-emerald-50 border border-emerald-200'
                    : 'text-rose-800 bg-rose-50 border border-rose-200'
                }`}
              >
                {bulkStatus.type === 'success' ? (
                  <CheckCircle className="w-4 h-4 text-emerald-600 shrink-0" />
                ) : (
                  <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
                )}
                <span>{bulkStatus.message}</span>
              </div>
            )}

            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={() => {
                  setShowBulkModal(false);
                  setBulkStatus(null);
                }}
                className="px-5 py-2.5 rounded-full border border-stone-300 text-stone-600 hover:bg-stone-50 text-xs font-semibold cursor-pointer"
              >
                Cancelar
              </button>
              <button
                type="button"
                disabled={isBulkImporting || !bulkPasteText.trim()}
                onClick={handleExecuteBulkImport}
                className="px-6 py-2.5 rounded-full bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-semibold shadow-md transition-all cursor-pointer disabled:opacity-50 flex items-center gap-2"
              >
                <FileSpreadsheet className="w-4 h-4" />
                <span>{isBulkImporting ? 'Importando...' : 'Confirmar e Importar'}</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL 2: CREAR / EDITAR INVITADO INDIVIDUAL Y DETALLES DE RSVP */}
      {/* ========================================================================= */}
      <AdminGuestModal
        isOpen={showGuestModal}
        editingGuest={editingGuest}
        formData={guestFormData}
        onChangeFormData={(updated) => setGuestFormData((prev) => ({ ...prev, ...updated }))}
        onClose={() => {
          setShowGuestModal(false);
          resetGuestForm();
        }}
        onSave={handleSubmit}
        submitting={submitting}
      />
    </div>
  );
};

