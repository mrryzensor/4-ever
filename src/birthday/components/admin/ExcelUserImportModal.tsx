import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  FileSpreadsheet,
  Upload,
  ClipboardPaste,
  CheckCircle2,
  AlertCircle,
  X,
  Sparkles,
  ArrowRight,
  Trash2,
  Users,
  ShieldCheck,
  Briefcase
} from 'lucide-react';
import { PlanId, UserRole } from '../../../types.ts';
import { SUBSCRIPTION_PLANS } from '../../../data/plans.ts';
import { toast } from '../../../lib/toast.ts';

interface ExcelUserImportModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

type ColumnType = 'name' | 'email' | 'role' | 'plan' | 'agencyName' | 'phone' | 'password' | 'skip';

const COLUMN_OPTIONS: { id: ColumnType; label: string }[] = [
  { id: 'name', label: '👤 Nombre Completo' },
  { id: 'email', label: '✉️ Correo Electrónico' },
  { id: 'role', label: '👑 Rol (Planner/Pareja)' },
  { id: 'plan', label: '💎 Plan de Suscripción' },
  { id: 'agencyName', label: '💼 Agencia / Empresa' },
  { id: 'phone', label: '📱 Teléfono / WhatsApp' },
  { id: 'password', label: '🔑 Contraseña' },
  { id: 'skip', label: '🚫 Omitir esta columna' },
];

export const ExcelUserImportModal: React.FC<ExcelUserImportModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
}) => {
  const [pasteText, setPasteText] = useState('');
  const [parsedRows, setParsedRows] = useState<string[][]>([]);
  const [columnMappings, setColumnMappings] = useState<ColumnType[]>([]);
  const [defaultPlan, setDefaultPlan] = useState<PlanId>('atelier');
  const [defaultRole, setDefaultRole] = useState<UserRole>('couple');
  const [defaultPassword, setDefaultPassword] = useState('Atelier2026!');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [activeStep, setActiveStep] = useState<'input' | 'map'>('input');

  const parseRawText = (text: string) => {
    if (!text.trim()) return [];
    const lines = text.trim().split(/\r?\n/).filter((l) => l.trim().length > 0);
    return lines.map((line) => {
      // If tab separated (Excel paste)
      if (line.includes('\t')) {
        return line.split('\t').map((c) => c.trim().replace(/^["']|["']$/g, ''));
      }
      // If semicolon separated
      if (line.includes(';')) {
        return line.split(';').map((c) => c.trim().replace(/^["']|["']$/g, ''));
      }
      // If comma separated
      return line.split(',').map((c) => c.trim().replace(/^["']|["']$/g, ''));
    });
  };

  const autoDetectColumn = (sampleValues: string[], colIndex: number): ColumnType => {
    const hasEmail = sampleValues.some((v) => v.includes('@') && v.includes('.'));
    if (hasEmail) return 'email';

    const hasPhone = sampleValues.some((v) => /^[\+\d\s\-\(\)]{7,18}$/.test(v) && /\d{4,}/.test(v));
    if (hasPhone) return 'phone';

    const hasRole = sampleValues.some((v) => /planner|organizador|pareja|novio|novia|ceo|admin/i.test(v));
    if (hasRole) return 'role';

    const hasPlan = sampleValues.some((v) => /free|atelier|elite|planner|esencial|gratis/i.test(v));
    if (hasPlan) return 'plan';

    if (colIndex === 0 && !hasEmail) return 'name';
    if (colIndex === 1 && !hasEmail) return 'name';
    if (colIndex === 3) return 'agencyName';

    return 'name';
  };

  const handleProcessInput = (raw: string) => {
    const rows = parseRawText(raw);
    if (rows.length === 0) {
      toast.warning('No se encontraron filas o datos válidos para procesar.');
      return;
    }

    setParsedRows(rows);

    // Auto detect column mappings from first few rows
    const maxCols = Math.max(...rows.map((r) => r.length));
    const initialMappings: ColumnType[] = [];

    for (let c = 0; c < maxCols; c++) {
      const colSamples = rows.slice(0, 10).map((r) => r[c] || '');
      initialMappings.push(autoDetectColumn(colSamples, c));
    }

    setColumnMappings(initialMappings);
    setActiveStep('map');
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const content = (event.target?.result as string) || '';
      setPasteText(content);
      handleProcessInput(content);
    };
    reader.readAsText(file);
  };

  const getProcessedUsers = () => {
    return parsedRows.map((row) => {
      const userObj: any = {
        plan: defaultPlan,
        role: defaultRole,
        password: defaultPassword,
      };

      columnMappings.forEach((mapping, colIdx) => {
        const val = row[colIdx];
        if (!val || mapping === 'skip') return;

        if (mapping === 'email') {
          userObj.email = val.toLowerCase().trim();
        } else if (mapping === 'name') {
          userObj.name = val.trim();
        } else if (mapping === 'role') {
          const lower = val.toLowerCase();
          if (lower.includes('planner') || lower.includes('organizador')) {
            userObj.role = 'wedding_planner';
          } else if (lower.includes('ceo')) {
            userObj.role = 'ceo';
          } else {
            userObj.role = 'couple';
          }
        } else if (mapping === 'plan') {
          const lower = val.toLowerCase();
          if (lower.includes('free') || lower.includes('esencial') || lower.includes('gratis')) userObj.plan = 'free';
          else if (lower.includes('elite')) userObj.plan = 'elite';
          else if (lower.includes('pro') || lower.includes('agencia')) userObj.plan = 'planner_pro';
          else if (lower.includes('starter') || lower.includes('studio')) userObj.plan = 'planner_starter';
          else if (lower.includes('ceo')) userObj.plan = 'ceo_unlimited';
          else userObj.plan = 'atelier';
        } else if (mapping === 'agencyName') {
          userObj.agencyName = val.trim();
        } else if (mapping === 'phone') {
          userObj.phone = val.trim();
        } else if (mapping === 'password') {
          userObj.password = val.trim();
        }
      });

      return userObj;
    }).filter((u) => u.email && u.email.includes('@'));
  };

  const handleConfirmImport = async () => {
    const usersToImport = getProcessedUsers();
    if (usersToImport.length === 0) {
      toast.error('No hay usuarios válidos con correo electrónico para importar.');
      return;
    }

    setIsSubmitting(true);
    try {
      const res = await fetch('/api/admin/ceo/users/bulk-import', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          users: usersToImport,
          defaultPlan,
          defaultRole,
        }),
      });

      if (res.ok) {
        const data = await res.json();
        toast.success(`Se importaron exitosamente ${data.count || usersToImport.length} usuarios a la plataforma.`, 'Importación Exitosa');
        onSuccess();
        onClose();
      } else {
        const err = await res.json();
        toast.error(err.error || 'Error al importar usuarios.');
      }
    } catch (error) {
      console.error('Import error:', error);
      toast.error('Error de conexión al importar usuarios.');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen) return null;

  const validUsersCount = getProcessedUsers().length;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-stone-950/85 backdrop-blur-md overflow-y-auto">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.95 }}
          className="w-full max-w-4xl bg-stone-900 border border-stone-700 rounded-3xl p-6 sm:p-8 text-stone-100 shadow-2xl my-auto"
        >
          {/* Header */}
          <div className="flex items-center justify-between pb-4 border-b border-stone-800 mb-6">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-2xl bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 flex items-center justify-center shadow-inner">
                <FileSpreadsheet className="w-6 h-6" />
              </div>
              <div>
                <h3 className="font-serif text-lg sm:text-xl font-bold text-white flex items-center gap-2">
                  <span>Carga Masiva de Usuarios desde Excel / Portapapeles</span>
                  <Sparkles className="w-4 h-4 text-amber-400" />
                </h3>
                <p className="text-xs text-stone-400">
                  Pega directamente celdas de Excel/Google Sheets o sube un archivo CSV/Excel para crear o actualizar cuentas.
                </p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-2 text-stone-400 hover:text-white rounded-full hover:bg-stone-800 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {activeStep === 'input' ? (
            /* STEP 1: INPUT DATA */
            <div className="space-y-6">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-stone-300 mb-2 flex items-center gap-2">
                  <ClipboardPaste className="w-4 h-4 text-amber-400" />
                  <span>Pegar Datos Directamente (Copiar en Excel y Pegar aquí):</span>
                </label>
                <textarea
                  rows={6}
                  value={pasteText}
                  onChange={(e) => setPasteText(e.target.value)}
                  placeholder={`Ejemplo:\nCarlos Mendoza\tcarlos@planner.com\tWedding Planner\tAtelier Events\t+51999888777\nAna & Jorge\tana.jorge@boda.com\tPareja\t\t+525512345678`}
                  className="w-full text-xs font-mono bg-stone-950 border border-stone-700 rounded-2xl p-4 text-stone-200 placeholder:text-stone-600 focus:outline-none focus:border-amber-500"
                />
              </div>

              <div className="flex items-center justify-center gap-3">
                <div className="h-px bg-stone-800 flex-1" />
                <span className="text-xs uppercase font-bold text-stone-500 tracking-wider">o subir archivo</span>
                <div className="h-px bg-stone-800 flex-1" />
              </div>

              <label className="border-2 border-dashed border-stone-700 hover:border-amber-500/60 rounded-2xl p-6 flex flex-col items-center justify-center cursor-pointer transition-colors bg-stone-950/50 hover:bg-stone-950">
                <Upload className="w-8 h-8 text-stone-400 mb-2" />
                <span className="text-xs font-semibold text-stone-200">
                  Haz clic para subir un archivo CSV o de texto tabulado
                </span>
                <span className="text-[10px] text-stone-500 mt-0.5">
                  Exportado desde Microsoft Excel o Google Sheets (.csv, .tsv, .txt)
                </span>
                <input
                  type="file"
                  accept=".csv, .tsv, .txt"
                  onChange={handleFileUpload}
                  className="hidden"
                />
              </label>

              <div className="flex justify-end gap-3 pt-4 border-t border-stone-800">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-4 py-2 text-xs font-medium text-stone-400 hover:text-white"
                >
                  Cancelar
                </button>
                <button
                  type="button"
                  onClick={() => handleProcessInput(pasteText)}
                  disabled={!pasteText.trim()}
                  className="px-6 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 disabled:opacity-40 text-stone-950 font-bold text-xs flex items-center gap-2 cursor-pointer shadow-lg shadow-amber-500/20"
                >
                  <span>Procesar Columnas</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          ) : (
            /* STEP 2: MAP COLUMNS & GLOBAL DEFAULTS */
            <div className="space-y-6">
              {/* Global Defaults Config */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 bg-stone-950 p-4 rounded-2xl border border-stone-800">
                <div>
                  <label className="block text-[10px] font-bold uppercase tracking-wider text-amber-400 mb-1.5">
                    Plan Masivo Predeterminado:
                  </label>
                  <select
                    value={defaultPlan}
                    onChange={(e) => setDefaultPlan(e.target.value as PlanId)}
                    className="w-full text-xs bg-stone-900 border border-stone-700 rounded-xl px-3 py-2 text-stone-200 focus:outline-none focus:border-amber-500"
                  >
                    <option value="free">Plan Esencial ($0 USD)</option>
                    <option value="atelier">Plan Atelier Romance ($29 USD)</option>
                    <option value="elite">Plan Élite Gran Boda ($59 USD)</option>
                    <option value="planner_starter">Planner Studio 5 Bodas ($89 USD)</option>
                    <option value="planner_pro">Planner Agencia Ilimitado ($179 USD)</option>
                    <option value="ceo_unlimited">CEO Maestro Ilimitado</option>
                  </select>
                </div>

                <div>
                  <label className="block text-[10px] font-bold uppercase tracking-wider text-amber-400 mb-1.5">
                    Rol por Defecto:
                  </label>
                  <select
                    value={defaultRole}
                    onChange={(e) => setDefaultRole(e.target.value as UserRole)}
                    className="w-full text-xs bg-stone-900 border border-stone-700 rounded-xl px-3 py-2 text-stone-200 focus:outline-none focus:border-amber-500"
                  >
                    <option value="couple">Pareja / Cliente</option>
                    <option value="wedding_planner">Event Planner / Organizador</option>
                    <option value="ceo">CEO Master</option>
                  </select>
                </div>

                <div>
                  <label className="block text-[10px] font-bold uppercase tracking-wider text-amber-400 mb-1.5">
                    Contraseña Inicial:
                  </label>
                  <input
                    type="text"
                    value={defaultPassword}
                    onChange={(e) => setDefaultPassword(e.target.value)}
                    className="w-full text-xs bg-stone-900 border border-stone-700 rounded-xl px-3 py-2 text-stone-200 focus:outline-none focus:border-amber-500 font-mono"
                  />
                </div>
              </div>

              {/* Column Mapping Header */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-bold text-stone-300">
                    Mapeo de Columnas Detectadas:
                  </span>
                  <span className="text-xs text-amber-400 font-semibold">
                    {validUsersCount} {validUsersCount === 1 ? 'usuario válido' : 'usuarios válidos'} detectados
                  </span>
                </div>

                {/* Mapping Controls per Column */}
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-2 mb-4">
                  {columnMappings.map((mapping, idx) => (
                    <div key={idx} className="p-2.5 rounded-xl bg-stone-950 border border-stone-800">
                      <span className="text-[10px] uppercase font-bold text-stone-500 block mb-1">
                        Columna {idx + 1}
                      </span>
                      <select
                        value={mapping}
                        onChange={(e) => {
                          const newMappings = [...columnMappings];
                          newMappings[idx] = e.target.value as ColumnType;
                          setColumnMappings(newMappings);
                        }}
                        className={`w-full text-[11px] font-medium rounded-lg px-2 py-1.5 border focus:outline-none ${
                          mapping === 'email'
                            ? 'bg-emerald-950/60 border-emerald-500/50 text-emerald-300 font-bold'
                            : mapping === 'skip'
                            ? 'bg-stone-900 border-stone-700 text-stone-500'
                            : 'bg-stone-900 border-stone-700 text-stone-200'
                        }`}
                      >
                        {COLUMN_OPTIONS.map((opt) => (
                          <option key={opt.id} value={opt.id}>
                            {opt.label}
                          </option>
                        ))}
                      </select>
                    </div>
                  ))}
                </div>
              </div>

              {/* Data Table Preview */}
              <div className="max-h-56 overflow-y-auto rounded-2xl border border-stone-800 bg-stone-950">
                <table className="w-full text-left text-xs text-stone-300">
                  <thead className="bg-stone-900/90 text-stone-400 uppercase text-[10px] tracking-wider sticky top-0">
                    <tr>
                      <th className="py-2.5 px-3">#</th>
                      {columnMappings.map((m, idx) => (
                        <th key={idx} className="py-2.5 px-3">
                          {COLUMN_OPTIONS.find((o) => o.id === m)?.label.split(' ')[1] || `Col ${idx + 1}`}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-stone-800 font-mono text-[11px]">
                    {parsedRows.slice(0, 15).map((row, rIdx) => {
                      const emailColIdx = columnMappings.findIndex((m) => m === 'email');
                      const hasEmail = emailColIdx !== -1 && row[emailColIdx]?.includes('@');
                      return (
                        <tr key={rIdx} className={hasEmail ? 'hover:bg-stone-900/50' : 'bg-rose-950/20 text-rose-300'}>
                          <td className="py-2 px-3 text-stone-500">{rIdx + 1}</td>
                          {columnMappings.map((_, cIdx) => (
                            <td key={cIdx} className="py-2 px-3 truncate max-w-[160px]">
                              {row[cIdx] || '—'}
                            </td>
                          ))}
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>

              {/* Actions Footer */}
              <div className="flex items-center justify-between pt-4 border-t border-stone-800">
                <button
                  type="button"
                  onClick={() => setActiveStep('input')}
                  className="px-4 py-2 text-xs text-stone-400 hover:text-white"
                >
                  ← Volver a pegar datos
                </button>

                <div className="flex items-center gap-3">
                  <button
                    type="button"
                    onClick={onClose}
                    className="px-4 py-2 text-xs font-medium text-stone-400 hover:text-white"
                  >
                    Cancelar
                  </button>
                  <button
                    type="button"
                    onClick={handleConfirmImport}
                    disabled={isSubmitting || validUsersCount === 0}
                    className="px-6 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 disabled:opacity-40 text-stone-950 font-bold text-xs flex items-center gap-2 cursor-pointer shadow-lg shadow-emerald-500/20"
                  >
                    {isSubmitting ? (
                      <span>Importando cuentas...</span>
                    ) : (
                      <>
                        <CheckCircle2 className="w-4 h-4" />
                        <span>Confirmar e Importar {validUsersCount} Usuarios</span>
                      </>
                    )}
                  </button>
                </div>
              </div>
            </div>
          )}
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
