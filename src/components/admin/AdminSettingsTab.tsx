import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  Palette,
  Settings,
  Eye,
  Sliders,
  Save,
  CheckCircle,
  Sparkles,
  Zap,
  SlidersHorizontal,
  ChevronDown,
  ChevronUp,
  Maximize2,
  Minimize2,
  X,
  Edit3,
} from 'lucide-react';
import { WeddingSettings } from '../../types.ts';
import { LiveInvitationCanvas } from '../LiveInvitationCanvas.tsx';
import { AdminHeroSettings } from './settings/AdminHeroSettings.tsx';
import { AdminThemeSettings } from './settings/AdminThemeSettings.tsx';
import { AdminSectionToggles } from './settings/AdminSectionToggles.tsx';
import { AdminLocationsSettings } from './settings/AdminLocationsSettings.tsx';
import { AdminDressCodeSettings } from './settings/AdminDressCodeSettings.tsx';
import { AdminGiftRegistrySettings } from './settings/AdminGiftRegistrySettings.tsx';
import { SimpleModeInline } from './SimpleModeInline.tsx';

interface AdminSettingsTabProps {
  settings: WeddingSettings;
  onChange: (updated: Partial<WeddingSettings>) => void;
  atelierViewMode: 'split' | 'config' | 'preview';
  setAtelierViewMode: (mode: 'split' | 'config' | 'preview') => void;
  onSaveAllSettings: () => void;
  savingSettings: boolean;
  settingsSavedToast: boolean;
  onBackToInvitation: () => void;
}

export const AdminSettingsTab: React.FC<AdminSettingsTabProps> = ({
  settings,
  onChange,
  atelierViewMode,
  setAtelierViewMode,
  onSaveAllSettings,
  savingSettings,
  settingsSavedToast,
  onBackToInvitation,
}) => {
  // Simple Mode is active by default in the Atelier / Edit tab
  const [editorMode, setEditorMode] = useState<'simple' | 'advanced'>('simple');

  // Mobile floating config sheet state (expanded by default or minimizable to highlight canvas)
  const [isMobileSheetOpen, setIsMobileSheetOpen] = useState(true);

  return (
    <div className="space-y-3 sm:space-y-3.5 w-full animate-fadeIn">
      {/* 1. MOBILE COMPACT TOOLBAR (Single minimal line to maximize preview canvas space) */}
      <div className="md:hidden bg-white/95 backdrop-blur-md border border-[#E5E2D0] rounded-2xl px-2.5 py-1.5 shadow-2xs flex items-center justify-between gap-1.5 min-w-0">
        <div className="flex items-center gap-1.5 min-w-0">
          <div className="w-6 h-6 rounded-lg bg-[#FAF9F0] border border-[#E5E2D0] flex items-center justify-center text-[#5A5A40] shrink-0">
            {editorMode === 'simple' ? (
              <Zap className="w-3.5 h-3.5 text-amber-700" />
            ) : (
              <SlidersHorizontal className="w-3.5 h-3.5 text-[#5A5A40]" />
            )}
          </div>
          <span className="text-xs font-serif font-bold text-stone-900 truncate">
            {editorMode === 'simple' ? 'Modo Simple' : 'Modo Avanzado'}
          </span>
        </div>

        <div className="flex items-center gap-1 shrink-0">
          {/* Compact Toggle Simple/Avanzado */}
          <div className="bg-[#FAF9F0] border border-[#E5E2D0] p-0.5 rounded-xl flex items-center gap-0.5 shadow-2xs shrink-0">
            <button
              type="button"
              id="btn-mode-toggle-simple-mobile"
              onClick={() => setEditorMode('simple')}
              className={`px-2 py-0.5 rounded-lg text-[10px] font-bold transition-all cursor-pointer select-none ${
                editorMode === 'simple'
                  ? 'bg-gradient-to-r from-amber-700 via-amber-800 to-amber-900 text-amber-50 shadow-2xs'
                  : 'text-stone-500 hover:text-stone-800'
              }`}
            >
              Simple
            </button>
            <button
              type="button"
              id="btn-mode-toggle-advanced-mobile"
              onClick={() => setEditorMode('advanced')}
              className={`px-2 py-0.5 rounded-lg text-[10px] font-bold transition-all cursor-pointer select-none ${
                editorMode === 'advanced'
                  ? 'bg-[#5A5A40] text-white shadow-2xs'
                  : 'text-stone-500 hover:text-stone-800'
              }`}
            >
              Avanz.
            </button>
          </div>

          {/* Quick Save */}
          <button
            type="button"
            onClick={onSaveAllSettings}
            disabled={savingSettings}
            className="px-2.5 py-1 rounded-xl bg-[#5A5A40] hover:bg-[#484833] text-white text-[10px] font-bold shadow-2xs flex items-center gap-1 cursor-pointer transition-all shrink-0"
          >
            <Save className="w-3 h-3 text-white" />
            <span>{savingSettings ? '...' : 'Guardar'}</span>
          </button>
        </div>
      </div>

      {/* 2. DESKTOP / TABLET SLIM TOOLBAR (md and above) - Single sleek line to maximize live preview prominence */}
      <div className="hidden md:flex bg-white/95 backdrop-blur-md border border-[#E5E2D0] rounded-2xl px-3.5 sm:px-4 py-2 shadow-2xs items-center justify-between gap-2.5 flex-wrap min-w-0">
        {/* Left: Minimal Branding & Current Mode Badge */}
        <div className="flex items-center gap-2 min-w-0">
          <div className="w-7 h-7 rounded-xl bg-[#FAF9F0] border border-[#E5E2D0] flex items-center justify-center text-[#5A5A40] shadow-2xs shrink-0">
            {editorMode === 'simple' ? (
              <Zap className="w-3.5 h-3.5 text-amber-700" />
            ) : (
              <Palette className="w-3.5 h-3.5 text-[#7D8C7A]" />
            )}
          </div>
          <div className="flex items-center gap-2 min-w-0">
            <h2 className="text-sm font-serif font-bold text-[#1a1a1a] whitespace-nowrap">
              Atelier & Edición
            </h2>
            <span
              className={`text-[10px] font-bold px-2 py-0.5 rounded-full whitespace-nowrap ${
                editorMode === 'simple'
                  ? 'bg-amber-100 text-amber-900 border border-amber-200/70'
                  : 'bg-stone-100 text-stone-700 border border-stone-200/70'
              }`}
            >
              {editorMode === 'simple' ? '✨ Rápido' : '⚙️ Completo'}
            </span>
          </div>
        </div>

        {/* Right: Consolidated Controls in 1 Clean Row */}
        <div className="flex items-center gap-1.5 sm:gap-2 flex-wrap shrink-0">
          {/* Simple / Advanced Toggle */}
          <div className="bg-[#FAF9F0] border border-[#E5E2D0] p-0.5 rounded-xl flex items-center gap-0.5 shadow-2xs shrink-0">
            <button
              type="button"
              id="btn-mode-toggle-simple"
              onClick={() => setEditorMode('simple')}
              className={`px-2.5 py-1 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer select-none whitespace-nowrap ${
                editorMode === 'simple'
                  ? 'bg-gradient-to-r from-amber-700 via-amber-800 to-amber-900 text-amber-50 shadow-2xs'
                  : 'text-[#7D8C7A] hover:text-[#1a1a1a] hover:bg-white/60'
              }`}
              title="Modo Simple: Datos esenciales y foto con compresión automática en AVIF 95%"
            >
              <Sparkles className="w-3 h-3 text-amber-300 shrink-0" />
              <span>Modo Simple</span>
            </button>

            <button
              type="button"
              id="btn-mode-toggle-advanced"
              onClick={() => setEditorMode('advanced')}
              className={`px-2.5 py-1 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer select-none whitespace-nowrap ${
                editorMode === 'advanced'
                  ? 'bg-[#5A5A40] text-white shadow-2xs'
                  : 'text-[#7D8C7A] hover:text-[#1a1a1a] hover:bg-white/60'
              }`}
              title="Modo Avanzado: Personaliza temas, estilos, colores y fuentes"
            >
              <SlidersHorizontal className="w-3 h-3 shrink-0" />
              <span>Avanzado</span>
            </button>
          </div>

          {/* Desktop Layout Switcher (Edición, Simulador, Dividido) */}
          <div className="bg-[#FAF9F0] border border-[#E5E2D0] p-0.5 rounded-xl flex items-center gap-0.5 shadow-2xs shrink-0">
            <button
              type="button"
              onClick={() => setAtelierViewMode('config')}
              className={`px-2.5 py-1 rounded-lg text-xs font-semibold flex items-center gap-1 transition-all cursor-pointer select-none whitespace-nowrap ${
                atelierViewMode === 'config'
                  ? 'bg-[#5A5A40] text-white shadow-2xs'
                  : 'text-[#7D8C7A] hover:text-[#1a1a1a] hover:bg-white/60'
              }`}
              title="Mostrar solo panel de formulario"
            >
              <Settings className="w-3 h-3 shrink-0" />
              <span>Edición</span>
            </button>

            <button
              type="button"
              onClick={() => setAtelierViewMode('preview')}
              className={`px-2.5 py-1 rounded-lg text-xs font-semibold flex items-center gap-1 transition-all cursor-pointer select-none whitespace-nowrap ${
                atelierViewMode === 'preview'
                  ? 'bg-[#5A5A40] text-white shadow-2xs'
                  : 'text-[#7D8C7A] hover:text-[#1a1a1a] hover:bg-white/60'
              }`}
              title="Mostrar solo simulador interactivo"
            >
              <Eye className="w-3 h-3 shrink-0" />
              <span>Simulador</span>
            </button>

            <button
              type="button"
              onClick={() => setAtelierViewMode('split')}
              className={`px-2.5 py-1 rounded-lg text-xs font-semibold flex items-center gap-1 transition-all cursor-pointer select-none whitespace-nowrap ${
                atelierViewMode === 'split'
                  ? 'bg-[#5A5A40] text-white shadow-2xs'
                  : 'text-[#7D8C7A] hover:text-[#1a1a1a] hover:bg-white/60'
              }`}
              title="Panel Dividido: Formulario y simulador lado a lado"
            >
              <Sliders className="w-3 h-3 shrink-0" />
              <span>Dividido</span>
            </button>
          </div>

          {/* Quick Save Button */}
          <button
            type="button"
            onClick={onSaveAllSettings}
            disabled={savingSettings}
            className="px-3.5 py-1 rounded-xl bg-[#5A5A40] hover:bg-[#484833] text-white text-xs font-semibold shadow-2xs flex items-center gap-1.5 cursor-pointer transition-all shrink-0 select-none whitespace-nowrap"
          >
            <Save className="w-3 h-3 text-white shrink-0" />
            <span>{savingSettings ? 'Guardando...' : 'Guardar Todo'}</span>
          </button>
        </div>
      </div>

      {/* ==================================================================== */}
      {/* DESKTOP LAYOUT (xl and wider) */}
      {/* ==================================================================== */}
      <div className="hidden xl:block w-full">
        <div
          className={`w-full ${
            atelierViewMode === 'split'
              ? 'grid grid-cols-12 gap-6 items-start'
              : 'w-full'
          }`}
        >
          {/* LEFT COLUMN: EDITING FORM */}
          {(atelierViewMode === 'split' || atelierViewMode === 'config') && (
            <div
              className={`${
                atelierViewMode === 'split'
                  ? 'col-span-6 2xl:col-span-5 max-h-[calc(100vh-140px)] overflow-y-auto overflow-x-hidden pr-3 sticky top-24 custom-scrollbar space-y-6 min-w-0'
                  : 'max-w-4xl mx-auto space-y-8 min-w-0'
              }`}
            >
              {editorMode === 'simple' ? (
                <SimpleModeInline
                  settings={settings}
                  onChange={onChange}
                  onSaveAllSettings={onSaveAllSettings}
                  savingSettings={savingSettings}
                  settingsSavedToast={settingsSavedToast}
                  onSwitchToAdvanced={() => setEditorMode('advanced')}
                />
              ) : (
                <div className="space-y-6 animate-fadeIn">
                  <div className="bg-[#FAF9F0] border border-[#E5E2D0] rounded-2xl p-3.5 flex items-center justify-between gap-3">
                    <div className="flex items-center gap-2">
                      <SlidersHorizontal className="w-4 h-4 text-[#5A5A40]" />
                      <span className="text-xs font-semibold text-stone-800">
                        Vista Avanzada de Atelier
                      </span>
                    </div>
                    <button
                      type="button"
                      onClick={() => setEditorMode('simple')}
                      className="px-3 py-1 rounded-xl bg-white border border-[#E5E2D0] hover:bg-stone-50 text-xs font-semibold text-[#5A5A40] flex items-center gap-1.5 shadow-2xs cursor-pointer transition-all"
                    >
                      <Sparkles className="w-3 h-3 text-amber-600" />
                      <span>Volver a Modo Simple</span>
                    </button>
                  </div>

                  <AdminHeroSettings
                    settings={settings}
                    onChange={onChange}
                    onOpenSimpleMode={() => setEditorMode('simple')}
                  />
                  <AdminThemeSettings settings={settings} onChange={onChange} />
                  <AdminSectionToggles settings={settings} onChange={onChange} />
                  {settings.showLocations !== false && (
                    <AdminLocationsSettings settings={settings} onChange={onChange} />
                  )}
                  {settings.showDressCode !== false && (
                    <AdminDressCodeSettings settings={settings} onChange={onChange} />
                  )}
                  {settings.showGiftRegistry !== false && (
                    <AdminGiftRegistrySettings settings={settings} onChange={onChange} />
                  )}

                  <div className="pt-2 flex items-center justify-between gap-4">
                    {settingsSavedToast && (
                      <span className="text-xs text-emerald-800 bg-emerald-50 border border-emerald-200 px-4 py-2 rounded-full font-semibold flex items-center gap-1.5">
                        <CheckCircle className="w-4 h-4 text-emerald-600" />
                        ¡Guardado en base de datos!
                      </span>
                    )}
                    <button
                      type="button"
                      onClick={onSaveAllSettings}
                      disabled={savingSettings}
                      className="ml-auto px-8 py-3.5 rounded-full bg-[#5A5A40] hover:bg-[#484833] text-white text-xs font-semibold shadow-md flex items-center gap-2 cursor-pointer transition-all"
                    >
                      <Save className="w-4 h-4 text-white" />
                      <span>{savingSettings ? 'Guardando...' : 'Guardar Cambios'}</span>
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* RIGHT COLUMN: SIMULATOR CANVAS */}
          {(atelierViewMode === 'split' || atelierViewMode === 'preview') && (
            <div
              className={`${
                atelierViewMode === 'split'
                  ? 'col-span-6 2xl:col-span-7 sticky top-24 min-w-0 overflow-hidden'
                  : 'w-full min-w-0 overflow-hidden'
              } space-y-3`}
            >
              <LiveInvitationCanvas
                settings={settings}
                onOpenFullInvitation={onBackToInvitation}
              />
            </div>
          )}
        </div>
      </div>

      {/* ==================================================================== */}
      {/* MOBILE / TABLET LAYOUT (< xl): CANVAS PROMINENT + FLOATING SEMITRANSPARENT CONFIG */}
      {/* ==================================================================== */}
      <div className="xl:hidden relative w-full space-y-4 pb-28">
        {/* 1. Main Live Invitation Canvas (Always Prominent & Interactive) */}
        <div className="w-full relative rounded-3xl overflow-hidden shadow-sm border border-[#E5E2D0]/80">
          <LiveInvitationCanvas
            settings={settings}
            onOpenFullInvitation={onBackToInvitation}
          />
        </div>

        {/* 2. Floating Semi-Transparent Configuration Sheet (Minimizable / Expandable) */}
        <div className="fixed bottom-0 inset-x-0 z-40 px-2 sm:px-4 pb-2 sm:pb-3 pointer-events-none">
          <motion.div
            initial={false}
            animate={{
              height: isMobileSheetOpen ? 'auto' : '64px',
            }}
            className="w-full max-w-2xl mx-auto bg-white/95 backdrop-blur-xl border border-[#E5E2D0] shadow-2xl rounded-t-[28px] sm:rounded-3xl overflow-hidden pointer-events-auto flex flex-col transition-all duration-300"
            style={{ maxHeight: isMobileSheetOpen ? '82vh' : '64px' }}
          >
            {/* Sheet Handle & Header Bar */}
            <div
              onClick={() => setIsMobileSheetOpen(!isMobileSheetOpen)}
              className="p-3.5 bg-gradient-to-r from-[#FAF9F0] via-white to-[#FAF9F0] border-b border-[#E5E2D0] flex items-center justify-between cursor-pointer select-none hover:bg-stone-50/80 transition-colors"
            >
              <div className="flex items-center gap-2.5 min-w-0">
                <div className="w-8 h-8 rounded-xl bg-[#5A5A40] text-white flex items-center justify-center shrink-0 shadow-2xs">
                  {editorMode === 'simple' ? (
                    <Zap className="w-4 h-4 text-amber-300" />
                  ) : (
                    <SlidersHorizontal className="w-4 h-4" />
                  )}
                </div>
                <div className="min-w-0">
                  <div className="flex items-center gap-1.5">
                    <span className="text-xs font-serif font-bold text-stone-900 truncate">
                      {editorMode === 'simple' ? 'Modo Simple (Edición)' : 'Modo Avanzado (Atelier)'}
                    </span>
                    <span className="text-[9px] bg-amber-100 text-amber-900 font-bold px-2 py-0.5 rounded-full">
                      {isMobileSheetOpen ? 'Abierto' : 'Toca para editar'}
                    </span>
                  </div>
                  <p className="text-[10px] text-[#7D8C7A] truncate">
                    {isMobileSheetOpen
                      ? 'Edita y observa cambios en tiempo real arriba'
                      : 'Configuración minimizada para interactuar con la invitación'}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2 shrink-0">
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    onSaveAllSettings();
                  }}
                  disabled={savingSettings}
                  className="px-3 py-1.5 rounded-xl bg-[#5A5A40] hover:bg-[#484833] text-white text-[11px] font-semibold flex items-center gap-1.5 shadow-2xs cursor-pointer"
                >
                  <Save className="w-3.5 h-3.5 text-white" />
                  <span>{savingSettings ? '...' : 'Guardar'}</span>
                </button>

                <div className="w-7 h-7 rounded-xl bg-white border border-[#E5E2D0] flex items-center justify-center text-stone-600 shadow-2xs">
                  {isMobileSheetOpen ? (
                    <ChevronDown className="w-4 h-4" />
                  ) : (
                    <ChevronUp className="w-4 h-4 text-[#5A5A40]" />
                  )}
                </div>
              </div>
            </div>

            {/* Scrollable Form Body when Expanded */}
            {isMobileSheetOpen && (
              <div className="p-2.5 sm:p-5 overflow-y-auto overflow-x-hidden custom-scrollbar space-y-4 sm:space-y-6 max-h-[calc(82vh-64px)] w-full max-w-full min-w-0 box-border">
                {editorMode === 'simple' ? (
                  <SimpleModeInline
                    settings={settings}
                    onChange={onChange}
                    onSaveAllSettings={onSaveAllSettings}
                    savingSettings={savingSettings}
                    settingsSavedToast={settingsSavedToast}
                    onSwitchToAdvanced={() => setEditorMode('advanced')}
                  />
                ) : (
                  <div className="space-y-6">
                    <div className="bg-[#FAF9F0] border border-[#E5E2D0] rounded-2xl p-3 flex items-center justify-between">
                      <span className="text-xs font-semibold text-stone-800">
                        Atelier Completo
                      </span>
                      <button
                        type="button"
                        onClick={() => setEditorMode('simple')}
                        className="px-3 py-1 rounded-xl bg-white border border-[#E5E2D0] text-xs font-semibold text-[#5A5A40] flex items-center gap-1"
                      >
                        <Sparkles className="w-3 h-3 text-amber-600" />
                        <span>Ir a Modo Simple</span>
                      </button>
                    </div>

                    <AdminHeroSettings
                      settings={settings}
                      onChange={onChange}
                      onOpenSimpleMode={() => setEditorMode('simple')}
                    />
                    <AdminThemeSettings settings={settings} onChange={onChange} />
                    <AdminSectionToggles settings={settings} onChange={onChange} />
                    {settings.showLocations !== false && (
                      <AdminLocationsSettings settings={settings} onChange={onChange} />
                    )}
                    {settings.showDressCode !== false && (
                      <AdminDressCodeSettings settings={settings} onChange={onChange} />
                    )}
                    {settings.showGiftRegistry !== false && (
                      <AdminGiftRegistrySettings settings={settings} onChange={onChange} />
                    )}
                  </div>
                )}
              </div>
            )}
          </motion.div>
        </div>
      </div>
    </div>
  );
};
