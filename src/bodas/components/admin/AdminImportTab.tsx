import React, { useState, useRef } from 'react';
import {
  FileSpreadsheet,
  UploadCloud,
  CheckCircle,
  AlertCircle,
  FileText,
  Copy,
  Users,
  Sparkles
} from 'lucide-react';

interface AdminImportTabProps {
  weddingId?: number;
  onGuestsImported?: () => void;
  bulkText?: string;
  bulkSuccess?: string;
  onBulkTextChange?: (val: string) => void;
  onBulkImport?: () => void;
}

export const AdminImportTab: React.FC<AdminImportTabProps> = ({
  weddingId = 1,
  onGuestsImported,
}) => {
  const [bulkText, setBulkText] = useState('');
  const [bulkStatus, setBulkStatus] = useState<{ type: 'success' | 'error'; message: string } | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  /**
   * Universal Smart Parser:
   * Supports:
   * - Tab-delimited (direct copy & paste from Excel / Google Sheets)
   * - Comma-delimited (CSV standard)
   * - Semicolon-delimited (European / Latin Excel CSV)
   * - Ignores header rows automatically
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

    const headerKeywords = ['nombre', 'pases', 'pax', 'grupo', 'telefono', 'teléfono', 'email', 'correo', 'codigo', 'código'];

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];
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
          weddingId: weddingId || 1,
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

  const handleBulkImport = async () => {
    const list = parseRowsToGuests(bulkText);
    if (list.length === 0) {
      setBulkStatus({
        type: 'error',
        message: 'No se encontraron invitados válidos en el texto. Asegúrate de incluir al menos el nombre de cada invitado.',
      });
      return;
    }

    setIsProcessing(true);
    setBulkStatus(null);

    try {
      const res = await fetch('/api/guests/bulk', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          weddingId: weddingId || 1,
          guests: list,
        }),
      });

      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || 'Error al importar invitados');
      }

      const data = await res.json();
      const count = data.count || list.length;
      setBulkStatus({
        type: 'success',
        message: `¡Se importaron con éxito ${count} invitados a la boda!`,
      });
      setBulkText('');
      if (onGuestsImported) {
        onGuestsImported();
      }
    } catch (e: any) {
      setBulkStatus({
        type: 'error',
        message: e.message || 'Error al procesar la importación.',
      });
    } finally {
      setIsProcessing(false);
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (evt) => {
      const content = evt.target?.result as string;
      if (content) {
        setBulkText(content);
        setBulkStatus({
          type: 'success',
          message: `Archivo "${file.name}" cargado con éxito. Revisa el texto y presiona el botón inferior para procesarlo.`,
        });
      }
    };
    reader.readAsText(file);
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="bg-white p-6 sm:p-8 rounded-3xl sm:rounded-[36px] border border-[#E5E2D0] shadow-sm space-y-6">
        
        {/* Header Title */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#F5F5F0] pb-5">
          <div className="flex items-center gap-3.5">
            <div className="w-12 h-12 rounded-2xl bg-emerald-100 text-emerald-800 flex items-center justify-center shrink-0 shadow-xs">
              <FileSpreadsheet className="w-6 h-6" />
            </div>
            <div>
              <span className="text-xs uppercase tracking-widest text-[#7D8C7A] font-bold block">
                Carga Masiva por lista
              </span>
              <h3 className="text-xl sm:text-2xl font-serif font-bold text-[#1a1a1a]">
                Importación Masiva de Invitados
              </h3>
              <p className="text-xs text-stone-500 mt-0.5">
                Pega una lista en formato CSV, Excel o texto para registrar múltiples invitados en segundos.
              </p>
            </div>
          </div>

          {/* Subir archivo directo */}
          <div className="flex items-center gap-2">
            <input
              type="file"
              ref={fileInputRef}
              accept=".csv, .txt, .tsv, .xlsx"
              onChange={handleFileUpload}
              className="hidden"
            />
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="px-4 py-2.5 rounded-full bg-[#FAF9F0] hover:bg-[#F5F5F0] text-[#5A5A40] border border-[#E5E2D0] text-xs font-semibold flex items-center gap-2 transition-colors cursor-pointer shadow-xs"
            >
              <UploadCloud className="w-4 h-4 text-emerald-700 shrink-0" />
              <span>Cargar desde Excel / CSV</span>
            </button>
          </div>
        </div>

        {/* Format Explanation Card */}
        <div className="bg-[#F9F7EF] p-5 rounded-2xl border border-[#E5E2D0] text-xs text-[#5A5A40] space-y-3">
          <div className="flex items-center gap-2 font-bold font-serif text-sm text-[#1a1a1a]">
            <FileText className="w-4 h-4 text-emerald-700 shrink-0" />
            <span>Formato por línea (Nombre, Pases, Grupo, Teléfono, Email):</span>
          </div>

          <div className="bg-white p-3.5 rounded-xl border border-[#E5E2D0] font-mono text-[11px] text-[#3D3D3D] flex items-center justify-between">
            <span>Nombre Completo, Número de Pases, Grupo/Familia, Teléfono, Email</span>
            <span className="text-[10px] text-emerald-700 font-sans font-semibold bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-200">
              Compatible con copiar/pegar de Excel
            </span>
          </div>

          <div className="text-[11px] text-stone-600 bg-white/60 p-3 rounded-xl border border-[#E5E2D0]/60 space-y-1">
            <span className="font-bold text-[#5A5A40] block">Ejemplo:</span>
            <p className="font-mono text-[11px] text-stone-700">
              Familia Mendoza Castro, 4, Familia Novia, +51987654321<br />
              Ing. Juan Carlos Pérez, 2, Amigos Novio, +51912345678, juan.perez@gmail.com
            </p>
          </div>
        </div>

        {/* Text Area */}
        <div className="space-y-2">
          <label className="text-xs font-bold text-stone-700 block">
            Pega aquí tu lista de invitados desde Excel o escribe por líneas:
          </label>
          <textarea
            rows={10}
            placeholder={`Pega aquí tu lista de invitados...\n\nEjemplo directo copiado desde Excel:\nFamilia Mendoza Castro\t4\tFamilia Novia\t+51987654321\nIng. Juan Carlos Pérez\t2\tAmigos Novio\t+51912345678`}
            value={bulkText}
            onChange={(e) => setBulkText(e.target.value)}
            className="w-full bg-[#FAF9F0] border border-[#E5E2D0] rounded-2xl p-4 font-mono text-xs text-[#3D3D3D] focus:outline-none focus:border-[#5A5A40] shadow-inner resize-y"
          />
        </div>

        {/* Status Message */}
        {bulkStatus && (
          <div
            className={`text-xs p-4 rounded-2xl flex items-center gap-2.5 ${
              bulkStatus.type === 'success'
                ? 'text-emerald-900 bg-emerald-50 border border-emerald-200'
                : 'text-rose-900 bg-rose-50 border border-rose-200'
            }`}
          >
            {bulkStatus.type === 'success' ? (
              <CheckCircle className="w-5 h-5 text-emerald-600 shrink-0" />
            ) : (
              <AlertCircle className="w-5 h-5 text-rose-600 shrink-0" />
            )}
            <span className="font-medium">{bulkStatus.message}</span>
          </div>
        )}

        {/* Submit Button */}
        <button
          onClick={handleBulkImport}
          disabled={!bulkText.trim() || isProcessing}
          className="w-full py-4 rounded-full bg-[#5A5A40] hover:bg-[#484833] text-white text-xs font-serif font-bold tracking-wide shadow-md disabled:opacity-50 transition-all cursor-pointer flex items-center justify-center gap-2"
          id="btn-process-bulk"
        >
          <FileSpreadsheet className="w-4 h-4 text-amber-300" />
          <span>{isProcessing ? 'Procesando importación...' : 'Procesar e Importar Invitados a la Boda'}</span>
        </button>
      </div>
    </div>
  );
};
