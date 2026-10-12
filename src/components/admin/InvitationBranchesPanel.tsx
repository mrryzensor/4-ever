import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { Copy, GitBranch, Link2, LoaderCircle, Pencil, Plus, Save, Share2, Trash2, X } from 'lucide-react';
import { InvitationBranch, WeddingSettings } from '../../types.ts';
import { toast } from '../../lib/toast.ts';
import { buildInvitationShareMessage, getInvitationShareImageUrl, sendInvitationMessage } from '../../lib/invitationSharing.ts';

type BranchTextKey =
  | 'heroCourtTitle'
  | 'heroCourtPageHeading'
  | 'heroPadrinosTitle'
  | 'heroPadrinos'
  | 'heroBrideParentsTitle'
  | 'heroBrideParents'
  | 'heroGroomParentsTitle'
  | 'heroGroomParents'
  | 'heroWitnessesTitle'
  | 'heroWitnesses';

type BranchText = Record<BranchTextKey, string>;
type BranchDraft = Omit<InvitationBranch, 'textOverrides' | 'createdAt' | 'updatedAt'> & {
  textOverrides: Partial<BranchText>;
};

const textFields: Array<{ key: BranchTextKey; label: string; hint?: string }> = [
  { key: 'heroCourtTitle', label: 'Texto principal de Cortejo' },
  { key: 'heroCourtPageHeading', label: 'Encabezado de Familia y Padrinos' },
  { key: 'heroPadrinosTitle', label: 'Título de Padrinos' },
  { key: 'heroPadrinos', label: 'Nombres de Padrinos' },
  { key: 'heroBrideParentsTitle', label: 'Título de la familia de la novia' },
  { key: 'heroBrideParents', label: 'Nombres de la familia de la novia' },
  { key: 'heroGroomParentsTitle', label: 'Título de la familia del novio' },
  { key: 'heroGroomParents', label: 'Nombres de la familia del novio' },
  { key: 'heroWitnessesTitle', label: 'Título de Testigos' },
  { key: 'heroWitnesses', label: 'Nombres de Testigos' },
];

const getBaseTexts = (settings: WeddingSettings): BranchText => Object.fromEntries(
  textFields.map(({ key }) => [key, String(settings[key] || '')]),
) as BranchText;

const normalizeBranchCodeInput = (value: string) => value
  .normalize('NFD')
  .replace(/[\u0300-\u036f]/g, '')
  .toLowerCase()
  .replace(/[^a-z0-9-]+/g, '-')
  .replace(/-+/g, '-')
  .replace(/^-/, '')
  .slice(0, 32);

const getBranchUrl = (settings: WeddingSettings, slug: string) => {
  const baseUrl = settings.slug
    ? `${window.location.origin}/${encodeURIComponent(settings.slug)}`
    : `${window.location.origin}/?w=${encodeURIComponent(String(settings.id || 1))}`;
  const url = new URL(baseUrl);
  if (!settings.slug && settings.eventType) url.searchParams.set('event', settings.eventType);
  url.searchParams.set('branch', slug);
  return url.toString();
};

export const InvitationBranchesPanel: React.FC<{ settings: WeddingSettings }> = ({ settings }) => {
  const [branches, setBranches] = useState<BranchDraft[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [isEditorOpen, setIsEditorOpen] = useState(false);
  const [editingBranch, setEditingBranch] = useState<BranchDraft | null>(null);
  const [draftName, setDraftName] = useState('');
  const [draftSlug, setDraftSlug] = useState('');
  const [draftTexts, setDraftTexts] = useState<BranchText>(() => getBaseTexts(settings));
  const weddingId = settings.id || 1;
  const baseTexts = useMemo(() => getBaseTexts(settings), [settings]);

  const loadBranches = useCallback(async () => {
    setLoading(true);
    try {
      const response = await fetch(`/api/invitation-branches?weddingId=${weddingId}`);
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || 'No se pudieron cargar las ramas.');
      setBranches(Array.isArray(data) ? data : []);
    } catch (error: any) {
      toast.error(error.message || 'No se pudieron cargar las ramas de invitación.', 'Error');
    } finally {
      setLoading(false);
    }
  }, [weddingId]);

  useEffect(() => { void loadBranches(); }, [loadBranches]);

  const openCreate = () => {
    setIsEditorOpen(true);
    setEditingBranch(null);
    setDraftName('');
    setDraftSlug('');
    setDraftTexts({ ...baseTexts });
  };

  const openEdit = (branch: BranchDraft) => {
    setIsEditorOpen(true);
    setEditingBranch(branch);
    setDraftName(branch.name);
    setDraftSlug(branch.slug);
    setDraftTexts({ ...baseTexts, ...branch.textOverrides });
  };

  const closeEditor = () => {
    if (saving) return;
    setIsEditorOpen(false);
    setEditingBranch(null);
    setDraftName('');
    setDraftSlug('');
  };

  const saveBranch = async (event: React.FormEvent) => {
    event.preventDefault();
    const name = draftName.trim();
    const slug = editingBranch && draftSlug === editingBranch.slug
      ? editingBranch.slug
      : normalizeBranchCodeInput(draftSlug).replace(/-+$/, '');
    if (!name) {
      toast.warning('Escribe un nombre para identificar esta rama.');
      return;
    }
    if (slug && slug.length < 3) {
      toast.warning('El código del enlace debe tener al menos 3 caracteres.');
      return;
    }
    const overrides = Object.fromEntries(textFields.flatMap(({ key }) => (
      draftTexts[key] !== baseTexts[key] ? [[key, draftTexts[key].slice(0, 1000)]] : []
    ))) as Partial<BranchText>;
    if (!Object.keys(overrides).length && !editingBranch) {
      toast.warning('Personaliza al menos uno de los textos antes de guardar.');
      return;
    }

    setSaving(true);
    try {
      const response = await fetch(editingBranch ? `/api/invitation-branches/${editingBranch.id}` : '/api/invitation-branches', {
        method: editingBranch ? 'PUT' : 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ weddingId, name, slug, textOverrides: overrides }),
      });
      const result = await response.json();
      if (!response.ok) throw new Error(result.error || 'No se pudo guardar la rama.');
      toast.success(editingBranch ? 'Rama actualizada.' : 'Rama creada con su propio enlace.');
      setIsEditorOpen(false);
      setEditingBranch(null);
      setDraftName('');
      setDraftSlug('');
      await loadBranches();
    } catch (error: any) {
      toast.error(error.message || 'No se pudo guardar la rama.', 'Error');
    } finally {
      setSaving(false);
    }
  };

  const copyLink = async (branch: BranchDraft) => {
    try {
      await navigator.clipboard.writeText(getBranchUrl(settings, branch.slug));
      toast.success(`Enlace de “${branch.name}” copiado.`);
    } catch {
      toast.error('No se pudo copiar el enlace.');
    }
  };

  const shareBranch = async (branch: BranchDraft) => {
    const branchSettings = { ...settings, ...branch.textOverrides };
    const message = buildInvitationShareMessage({ ...branchSettings, branchSlug: branch.slug }, window.location.origin);
    const imageUrl = getInvitationShareImageUrl({ ...branchSettings, branchSlug: branch.slug }, window.location.origin);
    const result = await sendInvitationMessage(message, `Invitación de ${settings.coupleNames || 'Nuestra celebración'}`, imageUrl);
    if (result === 'copied') {
      toast.success('Mensaje con el enlace personalizado copiado. Ya puedes pegarlo en tu aplicación de mensajería.', 'Listo para compartir');
    } else if (result === 'failed') {
      toast.error('No se pudo abrir el menú para compartir.', 'Error al compartir');
    }
  };

  const removeBranch = async (branch: BranchDraft) => {
    if (!window.confirm(`¿Eliminar la rama “${branch.name}”? Su enlace dejará de funcionar.`)) return;
    try {
      const response = await fetch(`/api/invitation-branches/${branch.id}`, { method: 'DELETE' });
      const result = await response.json();
      if (!response.ok) throw new Error(result.error || 'No se pudo eliminar la rama.');
      setBranches((current) => current.filter((item) => item.id !== branch.id));
      toast.success('Rama eliminada.');
    } catch (error: any) {
      toast.error(error.message || 'No se pudo eliminar la rama.', 'Error');
    }
  };

  return (
    <section className="rounded-3xl border border-[#E5E2D0] bg-white p-5 sm:p-6 shadow-sm space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-start gap-3">
          <div className="h-10 w-10 rounded-2xl bg-[#FAF9F0] border border-[#E5E2D0] text-[#5A5A40] flex items-center justify-center shrink-0">
            <GitBranch className="w-5 h-5" />
          </div>
          <div>
            <h3 className="font-serif font-bold text-lg text-stone-900">Invitaciones personalizadas</h3>
            <p className="text-xs text-stone-500 mt-0.5">Crea ramas para este evento. Solo cambian los textos; diseño, RSVP y métricas se comparten entre sus enlaces.</p>
          </div>
        </div>
        <button
          type="button"
          onClick={openCreate}
          className="inline-flex items-center justify-center gap-2 rounded-full bg-[#5A5A40] px-4 py-2 text-xs font-semibold text-white hover:bg-[#484833] transition-colors"
        >
          <Plus className="w-4 h-4" /> Crear rama
        </button>
      </div>

      {loading ? (
        <div className="flex items-center gap-2 rounded-2xl bg-[#FAF9F0] px-4 py-3 text-xs text-stone-500">
          <LoaderCircle className="w-4 h-4 animate-spin" /> Cargando enlaces…
        </div>
      ) : branches.length === 0 ? (
        <p className="rounded-2xl border border-dashed border-[#E5E2D0] bg-[#FAF9F0]/60 px-4 py-3 text-xs text-stone-500">
          Aún no hay ramas. Cada una tendrá su propio enlace y sus RSVP seguirán sumándose a este evento.
        </p>
      ) : (
        <div className="grid gap-2">
          {branches.map((branch) => (
            <div key={branch.id} className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 rounded-2xl border border-[#E5E2D0] bg-[#FDFCF8] px-4 py-3">
              <div className="min-w-0">
                <p className="truncate text-sm font-semibold text-stone-800">{branch.name}</p>
                <p className="mt-0.5 flex items-center gap-1 text-[11px] text-stone-500">
                  <Link2 className="w-3 h-3 shrink-0" /> Enlace personalizado · RSVP compartido
                </p>
                <p className="mt-1 text-[10px] text-stone-400">Código: <span className="font-mono">{branch.slug}</span></p>
              </div>
              <div className="flex items-center gap-2 shrink-0">
                <button type="button" onClick={() => void shareBranch(branch)} className="inline-flex items-center gap-1.5 rounded-full bg-[#5A5A40] px-3 py-1.5 text-[11px] font-semibold text-white hover:bg-[#484833]">
                  <Share2 className="w-3.5 h-3.5" /> Compartir
                </button>
                <button type="button" onClick={() => void copyLink(branch)} className="inline-flex items-center gap-1.5 rounded-full border border-[#D8D2BC] bg-white px-3 py-1.5 text-[11px] font-semibold text-[#5A5A40] hover:bg-[#FAF9F0]">
                  <Copy className="w-3.5 h-3.5" /> Copiar enlace
                </button>
                <button type="button" onClick={() => openEdit(branch)} title="Editar textos" className="rounded-full border border-[#E5E2D0] bg-white p-2 text-stone-600 hover:bg-[#FAF9F0]">
                  <Pencil className="w-3.5 h-3.5" />
                </button>
                <button type="button" onClick={() => void removeBranch(branch)} title="Eliminar rama" className="rounded-full border border-rose-100 bg-white p-2 text-rose-600 hover:bg-rose-50">
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {isEditorOpen ? (
        <div className="fixed inset-0 z-[90] flex items-center justify-center bg-black/50 p-3 sm:p-6" onMouseDown={(event) => { if (event.target === event.currentTarget) closeEditor(); }}>
          <form onSubmit={saveBranch} className="flex max-h-[92vh] w-full max-w-3xl flex-col overflow-hidden rounded-3xl border border-[#E5E2D0] bg-white shadow-2xl">
            <div className="flex items-start justify-between gap-4 border-b border-[#F0EEE4] px-5 py-4 sm:px-7">
              <div>
                <h3 className="font-serif text-xl font-bold text-stone-900">{editingBranch ? 'Editar rama' : 'Crear rama de invitación'}</h3>
                <p className="mt-1 text-xs text-stone-500">Solo cambian estos textos. La composición y el estilo de la invitación se conservan.</p>
              </div>
              <button type="button" onClick={closeEditor} aria-label="Cerrar" className="rounded-full p-2 text-stone-500 hover:bg-stone-100"><X className="w-5 h-5" /></button>
            </div>
            <div className="flex-1 space-y-5 overflow-y-auto px-5 py-5 sm:px-7">
              <label className="block space-y-1.5">
                <span className="text-xs font-semibold text-stone-700">Nombre de la rama</span>
                <input value={draftName} onChange={(event) => setDraftName(event.target.value)} maxLength={80} placeholder="Ej. Familia de Ana" className="w-full rounded-xl border border-[#D8D2BC] px-3.5 py-2.5 text-sm text-stone-800 outline-none focus:border-[#5A5A40] focus:ring-2 focus:ring-[#5A5A40]/10" />
              </label>
              <div className="space-y-1.5">
                <div className="flex items-center justify-between gap-3">
                  <label htmlFor="invitation-branch-code" className="text-xs font-semibold text-stone-700">Código del enlace</label>
                  <button type="button" onClick={() => setDraftSlug('')} className="text-[10px] font-semibold text-[#5A5A40] underline underline-offset-2 hover:text-[#484833]">
                    Usar código aleatorio corto
                  </button>
                </div>
                <input
                  id="invitation-branch-code"
                  value={draftSlug}
                  onChange={(event) => setDraftSlug(normalizeBranchCodeInput(event.target.value))}
                  maxLength={32}
                  placeholder="Ej. familia-ana (opcional)"
                  className="w-full rounded-xl border border-[#D8D2BC] px-3.5 py-2.5 text-sm text-stone-800 outline-none focus:border-[#5A5A40] focus:ring-2 focus:ring-[#5A5A40]/10"
                />
                <span className="block text-[10px] leading-4 text-stone-500">
                  Personalízalo o déjalo vacío para generar un código aleatorio corto. Se conserva el slug del evento: <span className="font-mono">/{settings.slug || `?w=${settings.id || 1}`}{settings.slug ? '?' : '&'}branch=…</span>
                </span>
              </div>
              <div className="grid gap-4 sm:grid-cols-2">
                {textFields.map(({ key, label, hint }) => (
                  <label key={key} className="block space-y-1.5">
                    <span className="text-xs font-semibold text-stone-700">{label}</span>
                    <textarea
                      value={draftTexts[key]}
                      onChange={(event) => setDraftTexts((current) => ({ ...current, [key]: event.target.value.slice(0, 1000) }))}
                      maxLength={1000}
                      rows={key.endsWith('Title') || key === 'heroCourtTitle' || key === 'heroCourtPageHeading' ? 2 : 3}
                      className="w-full resize-y rounded-xl border border-[#D8D2BC] px-3.5 py-2.5 text-sm text-stone-800 outline-none focus:border-[#5A5A40] focus:ring-2 focus:ring-[#5A5A40]/10"
                    />
                    {hint && <span className="block text-[10px] text-stone-400">{hint}</span>}
                  </label>
                ))}
              </div>
              <p className="rounded-xl bg-[#FAF9F0] px-3.5 py-3 text-[11px] leading-5 text-[#5A5A40]">
                La fecha, los lugares, las confirmaciones y las métricas pertenecen al evento compartido. Cada RSVP guardará el último enlace personalizado desde el que se envió.
              </p>
            </div>
            <div className="flex justify-end gap-2 border-t border-[#F0EEE4] px-5 py-4 sm:px-7">
              <button type="button" onClick={closeEditor} disabled={saving} className="rounded-full border border-[#D8D2BC] px-4 py-2 text-xs font-semibold text-stone-600 hover:bg-stone-50 disabled:opacity-50">Cancelar</button>
              <button type="submit" disabled={saving} className="inline-flex items-center gap-2 rounded-full bg-[#5A5A40] px-5 py-2 text-xs font-semibold text-white hover:bg-[#484833] disabled:opacity-60">
                {saving ? <LoaderCircle className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                {saving ? 'Guardando…' : editingBranch ? 'Guardar cambios' : 'Guardar y generar enlace'}
              </button>
            </div>
          </form>
        </div>
      ) : null}
    </section>
  );
};
