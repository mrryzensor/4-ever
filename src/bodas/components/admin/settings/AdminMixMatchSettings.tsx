import React, { useState } from 'react';
import {
  Palette,
  Type,
  Clock,
  Sparkles,
  Layers,
  RotateCcw,
  Compass,
  Flame,
  Shield,
  Check,
  ChevronDown,
  ChevronUp,
  Brush,
  Feather,
  Sliders,
} from 'lucide-react';
import { WeddingSettings, CardStyleId } from '../../../../types.ts';
import { CARD_THEMES } from '../../../../lib/themes.ts';
import {
  StyleSpecificDivider,
  FixDateAnimatedTransitionDivider,
  CardOrnamentFrame,
  AnimatedAmbientParticles,
} from '../../AnimatedSvgs.tsx';

interface AdminMixMatchSettingsProps {
  settings: WeddingSettings;
  onChange: (updated: Partial<WeddingSettings>) => void;
  isXv?: boolean;
}

const STYLE_KEYS: CardStyleId[] = [
  'classic-gold',
  'romantic-floral',
  'boho-chic',
  'minimal-editorial',
  'dark-luxury',
  'watercolor-garden',
  'royal-navy',
  'terracotta-sunset',
  'lavender-provence',
  'emerald-botanical',
  'coastal-breeze',
  'champagne-glam',
];

const PARTICLE_OPTIONS = [
  { id: 'auto', label: 'Automático', desc: 'Heredar según estilo base' },
  { id: 'petals', label: 'Pétalos de Rosa', desc: 'Caída suave de pétalos románticos' },
  { id: 'gold-sparkles', label: 'Chispas de Oro', desc: 'Polvo de diamantes dorados brillantes' },
  { id: 'champagne-bubbles', label: 'Burbujas Champaña', desc: 'Efervescencia luminosa ascendente' },
  { id: 'fireflies', label: 'Luciérnagas', desc: 'Orbes etéreos flotantes con destello' },
  { id: 'stars', label: 'Estrellas Cósmicas', desc: 'Centelleo estelar celestial' },
  { id: 'none', label: 'Desactivado', desc: 'Sin partículas en el fondo' },
];

export const AdminMixMatchSettings: React.FC<AdminMixMatchSettingsProps> = ({
  settings,
  onChange,
  isXv = false,
}) => {
  const [openSection, setOpenSection] = useState<string | null>('colors');

  const toggleSection = (id: string) => {
    setOpenSection((prev) => (prev === id ? null : id));
  };

  const handleResetAllToAuto = () => {
    onChange({
      colorPaletteStyle: 'auto',
      customAccentColor: '',
      customBgColor: '',
      fontPairStyle: 'auto',
      countdownStyle: 'auto',
      dividerStyle: 'auto',
      frameOrnamentStyle: 'auto',
      transitionWaveStyle: 'auto',
      heroIconStyle: 'auto',
      ambientParticleStyle: 'auto',
      sealStyle: 'auto',
    });
  };

  const activeTheme = CARD_THEMES[settings.cardStyle] || CARD_THEMES['classic-gold'];

  // Check if any modular overrides are active
  const hasOverrides =
    (settings.colorPaletteStyle && settings.colorPaletteStyle !== 'auto') ||
    !!settings.customAccentColor ||
    !!settings.customBgColor ||
    (settings.fontPairStyle && settings.fontPairStyle !== 'auto') ||
    (settings.countdownStyle && settings.countdownStyle !== 'auto') ||
    (settings.dividerStyle && settings.dividerStyle !== 'auto') ||
    (settings.frameOrnamentStyle && settings.frameOrnamentStyle !== 'auto') ||
    (settings.transitionWaveStyle && settings.transitionWaveStyle !== 'auto') ||
    (settings.heroIconStyle && settings.heroIconStyle !== 'auto') ||
    (settings.ambientParticleStyle && settings.ambientParticleStyle !== 'auto') ||
    (settings.sealStyle && settings.sealStyle !== 'auto');

  return (
    <div className="bg-gradient-to-br from-amber-50/40 via-white to-stone-50 p-4 sm:p-6 rounded-2xl sm:rounded-3xl border border-amber-200/80 shadow-sm space-y-4">
      {/* Header with Title & Reset Button */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-amber-200/60 pb-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="p-1.5 rounded-xl bg-amber-500 text-white shadow-xs">
              <Sliders className="w-4 h-4" />
            </span>
            <h3 className="text-base sm:text-lg font-serif font-bold text-stone-900">
              Modo Avanzado: Mezcla Modular (Mix & Match)
            </h3>
          </div>
          <p className="text-xs text-stone-600 mt-1">
            Combina elementos de cualquier estilo: colores, fuentes, contador SVG, divisores, esquineros y efectos.
          </p>
        </div>

        {hasOverrides && (
          <button
            type="button"
            onClick={handleResetAllToAuto}
            className="self-start sm:self-auto px-3.5 py-1.5 rounded-full bg-stone-100 hover:bg-stone-200 text-stone-700 border border-stone-300 text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer"
            title="Revertir todas las opciones modulares al estilo base seleccionado"
          >
            <RotateCcw className="w-3.5 h-3.5 text-stone-600" />
            <span>Restablecer Todo a Base</span>
          </button>
        )}
      </div>

      {/* 1. SECCIÓN: PALETA DE COLORES & ACENTOS */}
      <div className="border border-stone-200 rounded-2xl overflow-hidden bg-white">
        <button
          type="button"
          onClick={() => toggleSection('colors')}
          className="w-full px-4 py-3 bg-stone-50/80 hover:bg-stone-100/80 flex items-center justify-between text-left transition-colors cursor-pointer"
        >
          <div className="flex items-center gap-2.5">
            <Palette className="w-4 h-4 text-amber-600" />
            <div>
              <span className="text-xs sm:text-sm font-bold text-stone-800">
                1. Paleta Cromática & Acentos
              </span>
              <span className="block text-[11px] text-stone-500 font-normal">
                {settings.colorPaletteStyle && settings.colorPaletteStyle !== 'auto'
                  ? `Personalizada: ${CARD_THEMES[settings.colorPaletteStyle as CardStyleId]?.name || settings.colorPaletteStyle}`
                  : 'Automático (del estilo base)'}
              </span>
            </div>
          </div>
          {openSection === 'colors' ? (
            <ChevronUp className="w-4 h-4 text-stone-400" />
          ) : (
            <ChevronDown className="w-4 h-4 text-stone-400" />
          )}
        </button>

        {openSection === 'colors' && (
          <div className="p-4 space-y-4 border-t border-stone-200">
            <div>
              <label className="text-xs font-semibold text-stone-700 block mb-2">
                Selecciona una Paleta de Inspiración:
              </label>
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2">
                <button
                  type="button"
                  onClick={() => onChange({ colorPaletteStyle: 'auto' })}
                  className={`p-2.5 rounded-xl border text-left text-xs transition-all cursor-pointer ${
                    !settings.colorPaletteStyle || settings.colorPaletteStyle === 'auto'
                      ? 'border-amber-600 bg-amber-50/60 ring-1 ring-amber-500 font-bold'
                      : 'border-stone-200 hover:border-stone-300'
                  }`}
                >
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="truncate">Auto (Base)</span>
                    {(!settings.colorPaletteStyle || settings.colorPaletteStyle === 'auto') && (
                      <Check className="w-3.5 h-3.5 text-amber-600 shrink-0" />
                    )}
                  </div>
                  <div className="flex items-center gap-1">
                    <span
                      className="w-3.5 h-3.5 rounded-full border border-stone-200"
                      style={{ backgroundColor: activeTheme.accentColorHex }}
                    />
                    <span
                      className="w-3.5 h-3.5 rounded-full border border-stone-200"
                      style={{ backgroundColor: activeTheme.bgHex }}
                    />
                    <span
                      className="w-3.5 h-3.5 rounded-full border border-stone-200"
                      style={{ backgroundColor: activeTheme.primaryColorHex }}
                    />
                  </div>
                </button>

                {STYLE_KEYS.map((key) => {
                  const t = CARD_THEMES[key];
                  const isSelected = settings.colorPaletteStyle === key;
                  return (
                    <button
                      key={key}
                      type="button"
                      onClick={() => onChange({ colorPaletteStyle: key })}
                      className={`p-2.5 rounded-xl border text-left text-xs transition-all cursor-pointer ${
                        isSelected
                          ? 'border-amber-600 bg-amber-50/60 ring-1 ring-amber-500 font-bold'
                          : 'border-stone-200 hover:border-stone-300'
                      }`}
                    >
                      <div className="flex items-center justify-between mb-1.5">
                        <span className="truncate text-[11px]">{t.name}</span>
                        {isSelected && <Check className="w-3.5 h-3.5 text-amber-600 shrink-0" />}
                      </div>
                      <div className="flex items-center gap-1">
                        <span
                          className="w-3.5 h-3.5 rounded-full border border-stone-200"
                          style={{ backgroundColor: t.accentColorHex }}
                          title={`Acento: ${t.accentColorHex}`}
                        />
                        <span
                          className="w-3.5 h-3.5 rounded-full border border-stone-200"
                          style={{ backgroundColor: t.bgHex }}
                          title={`Fondo: ${t.bgHex}`}
                        />
                        <span
                          className="w-3.5 h-3.5 rounded-full border border-stone-200"
                          style={{ backgroundColor: t.primaryColorHex }}
                          title={`Texto: ${t.primaryColorHex}`}
                        />
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>

            <div className="pt-3 border-t border-stone-200 grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="text-xs font-semibold text-stone-700 block mb-1">
                  Color de Acento / Detalles (Hex):
                </label>
                <div className="flex items-center gap-2">
                  <input
                    type="color"
                    value={settings.customAccentColor || activeTheme.accentColorHex}
                    onChange={(e) => onChange({ customAccentColor: e.target.value })}
                    className="w-8 h-8 rounded-lg border border-stone-300 cursor-pointer p-0"
                  />
                  <input
                    type="text"
                    value={settings.customAccentColor || ''}
                    placeholder={activeTheme.accentColorHex}
                    onChange={(e) => onChange({ customAccentColor: e.target.value })}
                    className="w-28 text-xs font-mono px-2 py-1.5 border border-stone-300 rounded-lg"
                  />
                  {settings.customAccentColor && (
                    <button
                      type="button"
                      onClick={() => onChange({ customAccentColor: '' })}
                      className="text-[11px] text-stone-500 hover:text-stone-800 underline"
                    >
                      Restablecer
                    </button>
                  )}
                </div>
              </div>

              <div>
                <label className="text-xs font-semibold text-stone-700 block mb-1">
                  Color de Fondo de Tarjeta (Hex):
                </label>
                <div className="flex items-center gap-2">
                  <input
                    type="color"
                    value={settings.customBgColor || activeTheme.bgHex}
                    onChange={(e) => onChange({ customBgColor: e.target.value })}
                    className="w-8 h-8 rounded-lg border border-stone-300 cursor-pointer p-0"
                  />
                  <input
                    type="text"
                    value={settings.customBgColor || ''}
                    placeholder={activeTheme.bgHex}
                    onChange={(e) => onChange({ customBgColor: e.target.value })}
                    className="w-28 text-xs font-mono px-2 py-1.5 border border-stone-300 rounded-lg"
                  />
                  {settings.customBgColor && (
                    <button
                      type="button"
                      onClick={() => onChange({ customBgColor: '' })}
                      className="text-[11px] text-stone-500 hover:text-stone-800 underline"
                    >
                      Restablecer
                    </button>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* 2. SECCIÓN: TIPOGRAFÍA & PAREJAS DE FUENTES */}
      <div className="border border-stone-200 rounded-2xl overflow-hidden bg-white">
        <button
          type="button"
          onClick={() => toggleSection('fonts')}
          className="w-full px-4 py-3 bg-stone-50/80 hover:bg-stone-100/80 flex items-center justify-between text-left transition-colors cursor-pointer"
        >
          <div className="flex items-center gap-2.5">
            <Type className="w-4 h-4 text-indigo-600" />
            <div>
              <span className="text-xs sm:text-sm font-bold text-stone-800">
                2. Tipografía & Fuentes Editoriales
              </span>
              <span className="block text-[11px] text-stone-500 font-normal">
                {settings.fontPairStyle && settings.fontPairStyle !== 'auto'
                  ? `Estilo: ${CARD_THEMES[settings.fontPairStyle as CardStyleId]?.name || settings.fontPairStyle}`
                  : 'Automático (del estilo base)'}
              </span>
            </div>
          </div>
          {openSection === 'fonts' ? (
            <ChevronUp className="w-4 h-4 text-stone-400" />
          ) : (
            <ChevronDown className="w-4 h-4 text-stone-400" />
          )}
        </button>

        {openSection === 'fonts' && (
          <div className="p-4 space-y-3 border-t border-stone-200">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2.5">
              <button
                type="button"
                onClick={() => onChange({ fontPairStyle: 'auto' })}
                className={`p-3 rounded-xl border text-left transition-all cursor-pointer ${
                  !settings.fontPairStyle || settings.fontPairStyle === 'auto'
                    ? 'border-indigo-600 bg-indigo-50/50 ring-1 ring-indigo-500'
                    : 'border-stone-200 hover:border-stone-300'
                }`}
              >
                <div className="flex items-center justify-between mb-1">
                  <span className="text-xs font-bold text-stone-800">Auto (Estilo Base)</span>
                  {(!settings.fontPairStyle || settings.fontPairStyle === 'auto') && (
                    <Check className="w-3.5 h-3.5 text-indigo-600" />
                  )}
                </div>
                <p className={`text-base italic text-stone-700 leading-snug ${activeTheme.fontDisplay}`}>
                  {settings.coupleNames || (isXv ? 'Valeria Montserrat' : 'Sofía & Alejandro')}
                </p>
                <p className={`text-[11px] text-stone-500 mt-0.5 ${activeTheme.fontBody}`}>
                  {activeTheme.fontDisplay.replace('font-[', '').replace(']', '')} + {activeTheme.fontBody.replace('font-[', '').replace(']', '')}
                </p>
              </button>

              {STYLE_KEYS.map((key) => {
                const t = CARD_THEMES[key];
                const isSelected = settings.fontPairStyle === key;
                return (
                  <button
                    key={key}
                    type="button"
                    onClick={() => onChange({ fontPairStyle: key })}
                    className={`p-3 rounded-xl border text-left transition-all cursor-pointer ${
                      isSelected
                        ? 'border-indigo-600 bg-indigo-50/50 ring-1 ring-indigo-500'
                        : 'border-stone-200 hover:border-stone-300'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-xs font-bold text-stone-800 truncate">{t.name}</span>
                      {isSelected && <Check className="w-3.5 h-3.5 text-indigo-600 shrink-0" />}
                    </div>
                    <p className={`text-base italic text-stone-700 leading-snug ${t.fontDisplay}`}>
                      {settings.coupleNames || (isXv ? 'Valeria Montserrat' : 'Sofía & Alejandro')}
                    </p>
                    <p className={`text-[10px] text-stone-500 mt-0.5 truncate ${t.fontBody}`}>
                      {t.fontDisplay.replace('font-[', '').replace(']', '')} + {t.fontBody.replace('font-[', '').replace(']', '')}
                    </p>
                  </button>
                );
              })}
            </div>
          </div>
        )}
      </div>

      {/* 3. SECCIÓN: CUENTA REGRESIVA SVG */}
      <div className="border border-stone-200 rounded-2xl overflow-hidden bg-white">
        <button
          type="button"
          onClick={() => toggleSection('countdown')}
          className="w-full px-4 py-3 bg-stone-50/80 hover:bg-stone-100/80 flex items-center justify-between text-left transition-colors cursor-pointer"
        >
          <div className="flex items-center gap-2.5">
            <Clock className="w-4 h-4 text-emerald-600" />
            <div>
              <span className="text-xs sm:text-sm font-bold text-stone-800">
                3. Estilo de Cuenta Regresiva SVG Animada
              </span>
              <span className="block text-[11px] text-stone-500 font-normal">
                {settings.countdownStyle && settings.countdownStyle !== 'auto'
                  ? `Estilo: ${CARD_THEMES[settings.countdownStyle as CardStyleId]?.name || settings.countdownStyle}`
                  : 'Automático (del estilo base)'}
              </span>
            </div>
          </div>
          {openSection === 'countdown' ? (
            <ChevronUp className="w-4 h-4 text-stone-400" />
          ) : (
            <ChevronDown className="w-4 h-4 text-stone-400" />
          )}
        </button>

        {openSection === 'countdown' && (
          <div className="p-4 space-y-3 border-t border-stone-200">
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2">
              <button
                type="button"
                onClick={() => onChange({ countdownStyle: 'auto' })}
                className={`p-3 rounded-xl border text-left transition-all cursor-pointer ${
                  !settings.countdownStyle || settings.countdownStyle === 'auto'
                    ? 'border-emerald-600 bg-emerald-50/50 ring-1 ring-emerald-500 font-bold'
                    : 'border-stone-200 hover:border-stone-300'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="text-xs">Auto (Base)</span>
                  {(!settings.countdownStyle || settings.countdownStyle === 'auto') && (
                    <Check className="w-3.5 h-3.5 text-emerald-600" />
                  )}
                </div>
                <span className="text-[10px] text-stone-500 block mt-1">Estilo original</span>
              </button>

              {STYLE_KEYS.map((key) => {
                const t = CARD_THEMES[key];
                const isSelected = settings.countdownStyle === key;
                return (
                  <button
                    key={key}
                    type="button"
                    onClick={() => onChange({ countdownStyle: key })}
                    className={`p-3 rounded-xl border text-left transition-all cursor-pointer ${
                      isSelected
                        ? 'border-emerald-600 bg-emerald-50/50 ring-1 ring-emerald-500 font-bold'
                        : 'border-stone-200 hover:border-stone-300'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-xs truncate">{t.name}</span>
                      {isSelected && <Check className="w-3.5 h-3.5 text-emerald-600 shrink-0" />}
                    </div>
                    <span className="text-[10px] text-stone-500 block mt-1 truncate">{t.badge}</span>
                  </button>
                );
              })}
            </div>
          </div>
        )}
      </div>

      {/* 4. SECCIÓN: SEPARADORES & MOTIVOS SVG */}
      <div className="border border-stone-200 rounded-2xl overflow-hidden bg-white">
        <button
          type="button"
          onClick={() => toggleSection('dividers')}
          className="w-full px-4 py-3 bg-stone-50/80 hover:bg-stone-100/80 flex items-center justify-between text-left transition-colors cursor-pointer"
        >
          <div className="flex items-center gap-2.5">
            <Brush className="w-4 h-4 text-rose-600" />
            <div>
              <span className="text-xs sm:text-sm font-bold text-stone-800">
                4. Separadores & Motivos Vectoriales Animados
              </span>
              <span className="block text-[11px] text-stone-500 font-normal">
                {settings.dividerStyle && settings.dividerStyle !== 'auto'
                  ? `Estilo: ${CARD_THEMES[settings.dividerStyle as CardStyleId]?.name || settings.dividerStyle}`
                  : 'Automático (del estilo base)'}
              </span>
            </div>
          </div>
          {openSection === 'dividers' ? (
            <ChevronUp className="w-4 h-4 text-stone-400" />
          ) : (
            <ChevronDown className="w-4 h-4 text-stone-400" />
          )}
        </button>

        {openSection === 'dividers' && (
          <div className="p-4 space-y-3 border-t border-stone-200">
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2.5">
              <button
                type="button"
                onClick={() => onChange({ dividerStyle: 'auto' })}
                className={`p-2.5 rounded-xl border text-left transition-all cursor-pointer flex flex-col justify-between ${
                  !settings.dividerStyle || settings.dividerStyle === 'auto'
                    ? 'border-rose-600 bg-rose-50/40 ring-1 ring-rose-500 font-bold'
                    : 'border-stone-200 hover:border-stone-300'
                }`}
              >
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs">Auto (Base)</span>
                  {(!settings.dividerStyle || settings.dividerStyle === 'auto') && (
                    <Check className="w-3.5 h-3.5 text-rose-600" />
                  )}
                </div>
                <div className="h-8 flex items-center justify-center">
                  <StyleSpecificDivider cardStyle={settings.cardStyle} className="w-20 h-4" />
                </div>
              </button>

              {STYLE_KEYS.map((key) => {
                const t = CARD_THEMES[key];
                const isSelected = settings.dividerStyle === key;
                return (
                  <button
                    key={key}
                    type="button"
                    onClick={() => onChange({ dividerStyle: key })}
                    className={`p-2.5 rounded-xl border text-left transition-all cursor-pointer flex flex-col justify-between ${
                      isSelected
                        ? 'border-rose-600 bg-rose-50/40 ring-1 ring-rose-500 font-bold'
                        : 'border-stone-200 hover:border-stone-300'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-xs truncate">{t.name}</span>
                      {isSelected && <Check className="w-3.5 h-3.5 text-rose-600 shrink-0" />}
                    </div>
                    <div className="h-8 flex items-center justify-center">
                      <StyleSpecificDivider cardStyle={key} className="w-20 h-4" color={t.accentColorHex} />
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        )}
      </div>

      {/* 5. SECCIÓN: MARCOS & ESQUINAS DE TARJETAS */}
      <div className="border border-stone-200 rounded-2xl overflow-hidden bg-white">
        <button
          type="button"
          onClick={() => toggleSection('frames')}
          className="w-full px-4 py-3 bg-stone-50/80 hover:bg-stone-100/80 flex items-center justify-between text-left transition-colors cursor-pointer"
        >
          <div className="flex items-center gap-2.5">
            <Layers className="w-4 h-4 text-purple-600" />
            <div>
              <span className="text-xs sm:text-sm font-bold text-stone-800">
                5. Filigranas & Esquinas de Tarjetas
              </span>
              <span className="block text-[11px] text-stone-500 font-normal">
                {settings.frameOrnamentStyle && settings.frameOrnamentStyle !== 'auto'
                  ? `Estilo: ${CARD_THEMES[settings.frameOrnamentStyle as CardStyleId]?.name || settings.frameOrnamentStyle}`
                  : 'Automático (del estilo base)'}
              </span>
            </div>
          </div>
          {openSection === 'frames' ? (
            <ChevronUp className="w-4 h-4 text-stone-400" />
          ) : (
            <ChevronDown className="w-4 h-4 text-stone-400" />
          )}
        </button>

        {openSection === 'frames' && (
          <div className="p-4 space-y-3 border-t border-stone-200">
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2">
              <button
                type="button"
                onClick={() => onChange({ frameOrnamentStyle: 'auto' })}
                className={`p-3 rounded-xl border text-left transition-all cursor-pointer ${
                  !settings.frameOrnamentStyle || settings.frameOrnamentStyle === 'auto'
                    ? 'border-purple-600 bg-purple-50/50 ring-1 ring-purple-500 font-bold'
                    : 'border-stone-200 hover:border-stone-300'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="text-xs">Auto (Base)</span>
                  {(!settings.frameOrnamentStyle || settings.frameOrnamentStyle === 'auto') && (
                    <Check className="w-3.5 h-3.5 text-purple-600" />
                  )}
                </div>
                <span className="text-[10px] text-stone-500 block mt-1">Esquinas del tema</span>
              </button>

              {STYLE_KEYS.map((key) => {
                const t = CARD_THEMES[key];
                const isSelected = settings.frameOrnamentStyle === key;
                return (
                  <button
                    key={key}
                    type="button"
                    onClick={() => onChange({ frameOrnamentStyle: key })}
                    className={`p-3 rounded-xl border text-left transition-all cursor-pointer ${
                      isSelected
                        ? 'border-purple-600 bg-purple-50/50 ring-1 ring-purple-500 font-bold'
                        : 'border-stone-200 hover:border-stone-300'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-xs truncate">{t.name}</span>
                      {isSelected && <Check className="w-3.5 h-3.5 text-purple-600 shrink-0" />}
                    </div>
                    <span className="text-[10px] text-stone-500 block mt-1 truncate">{t.badge}</span>
                  </button>
                );
              })}
            </div>
          </div>
        )}
      </div>

      {/* 6. SECCIÓN: OLAS DE TRANSICIÓN HERO */}
      <div className="border border-stone-200 rounded-2xl overflow-hidden bg-white">
        <button
          type="button"
          onClick={() => toggleSection('waves')}
          className="w-full px-4 py-3 bg-stone-50/80 hover:bg-stone-100/80 flex items-center justify-between text-left transition-colors cursor-pointer"
        >
          <div className="flex items-center gap-2.5">
            <Compass className="w-4 h-4 text-cyan-600" />
            <div>
              <span className="text-xs sm:text-sm font-bold text-stone-800">
                6. Ola de Transición Orgánica (Hero ➔ Contenido)
              </span>
              <span className="block text-[11px] text-stone-500 font-normal">
                {settings.transitionWaveStyle && settings.transitionWaveStyle !== 'auto'
                  ? `Estilo: ${CARD_THEMES[settings.transitionWaveStyle as CardStyleId]?.name || settings.transitionWaveStyle}`
                  : 'Automático (del estilo base)'}
              </span>
            </div>
          </div>
          {openSection === 'waves' ? (
            <ChevronUp className="w-4 h-4 text-stone-400" />
          ) : (
            <ChevronDown className="w-4 h-4 text-stone-400" />
          )}
        </button>

        {openSection === 'waves' && (
          <div className="p-4 space-y-3 border-t border-stone-200">
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2">
              <button
                type="button"
                onClick={() => onChange({ transitionWaveStyle: 'auto' })}
                className={`p-3 rounded-xl border text-left transition-all cursor-pointer ${
                  !settings.transitionWaveStyle || settings.transitionWaveStyle === 'auto'
                    ? 'border-cyan-600 bg-cyan-50/50 ring-1 ring-cyan-500 font-bold'
                    : 'border-stone-200 hover:border-stone-300'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="text-xs">Auto (Base)</span>
                  {(!settings.transitionWaveStyle || settings.transitionWaveStyle === 'auto') && (
                    <Check className="w-3.5 h-3.5 text-cyan-600" />
                  )}
                </div>
                <span className="text-[10px] text-stone-500 block mt-1">Ola del tema activo</span>
              </button>

              {STYLE_KEYS.map((key) => {
                const t = CARD_THEMES[key];
                const isSelected = settings.transitionWaveStyle === key;
                return (
                  <button
                    key={key}
                    type="button"
                    onClick={() => onChange({ transitionWaveStyle: key })}
                    className={`p-3 rounded-xl border text-left transition-all cursor-pointer ${
                      isSelected
                        ? 'border-cyan-600 bg-cyan-50/50 ring-1 ring-cyan-500 font-bold'
                        : 'border-stone-200 hover:border-stone-300'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-xs truncate">{t.name}</span>
                      {isSelected && <Check className="w-3.5 h-3.5 text-cyan-600 shrink-0" />}
                    </div>
                    <span className="text-[10px] text-stone-500 block mt-1 truncate">{t.badge}</span>
                  </button>
                );
              })}
            </div>
          </div>
        )}
      </div>

      {/* 7. SECCIÓN: EMBLEMA HERO */}
      <div className="border border-stone-200 rounded-2xl overflow-hidden bg-white">
        <button
          type="button"
          onClick={() => toggleSection('heroIcon')}
          className="w-full px-4 py-3 bg-stone-50/80 hover:bg-stone-100/80 flex items-center justify-between text-left transition-colors cursor-pointer"
        >
          <div className="flex items-center gap-2.5">
            <Feather className="w-4 h-4 text-teal-600" />
            <div>
              <span className="text-xs sm:text-sm font-bold text-stone-800">
                7. Emblema Central del Hero
              </span>
              <span className="block text-[11px] text-stone-500 font-normal">
                {settings.heroIconStyle && settings.heroIconStyle !== 'auto'
                  ? `Emblema: ${CARD_THEMES[settings.heroIconStyle as CardStyleId]?.name || settings.heroIconStyle}`
                  : 'Automático (del estilo base)'}
              </span>
            </div>
          </div>
          {openSection === 'heroIcon' ? (
            <ChevronUp className="w-4 h-4 text-stone-400" />
          ) : (
            <ChevronDown className="w-4 h-4 text-stone-400" />
          )}
        </button>

        {openSection === 'heroIcon' && (
          <div className="p-4 space-y-3 border-t border-stone-200">
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2">
              <button
                type="button"
                onClick={() => onChange({ heroIconStyle: 'auto' })}
                className={`p-3 rounded-xl border text-left transition-all cursor-pointer ${
                  !settings.heroIconStyle || settings.heroIconStyle === 'auto'
                    ? 'border-teal-600 bg-teal-50/50 ring-1 ring-teal-500 font-bold'
                    : 'border-stone-200 hover:border-stone-300'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="text-xs">Auto (Base)</span>
                  {(!settings.heroIconStyle || settings.heroIconStyle === 'auto') && (
                    <Check className="w-3.5 h-3.5 text-teal-600" />
                  )}
                </div>
                <span className="text-[10px] text-stone-500 block mt-1">
                  {isXv ? 'Tiara Real' : 'Anillos Nupciales'}
                </span>
              </button>

              {STYLE_KEYS.map((key) => {
                const t = CARD_THEMES[key];
                const isSelected = settings.heroIconStyle === key;
                return (
                  <button
                    key={key}
                    type="button"
                    onClick={() => onChange({ heroIconStyle: key })}
                    className={`p-3 rounded-xl border text-left transition-all cursor-pointer ${
                      isSelected
                        ? 'border-teal-600 bg-teal-50/50 ring-1 ring-teal-500 font-bold'
                        : 'border-stone-200 hover:border-stone-300'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-xs truncate">{t.name}</span>
                      {isSelected && <Check className="w-3.5 h-3.5 text-teal-600 shrink-0" />}
                    </div>
                    <span className="text-[10px] text-stone-500 block mt-1 truncate">{t.badge}</span>
                  </button>
                );
              })}
            </div>
          </div>
        )}
      </div>

      {/* 8. SECCIÓN: PARTÍCULAS AMBIENTALES */}
      <div className="border border-stone-200 rounded-2xl overflow-hidden bg-white">
        <button
          type="button"
          onClick={() => toggleSection('particles')}
          className="w-full px-4 py-3 bg-stone-50/80 hover:bg-stone-100/80 flex items-center justify-between text-left transition-colors cursor-pointer"
        >
          <div className="flex items-center gap-2.5">
            <Sparkles className="w-4 h-4 text-amber-500" />
            <div>
              <span className="text-xs sm:text-sm font-bold text-stone-800">
                8. Efectos de Partículas Ambientales en Pantalla
              </span>
              <span className="block text-[11px] text-stone-500 font-normal">
                {PARTICLE_OPTIONS.find((p) => p.id === (settings.ambientParticleStyle || 'auto'))?.label || 'Automático'}
              </span>
            </div>
          </div>
          {openSection === 'particles' ? (
            <ChevronUp className="w-4 h-4 text-stone-400" />
          ) : (
            <ChevronDown className="w-4 h-4 text-stone-400" />
          )}
        </button>

        {openSection === 'particles' && (
          <div className="p-4 space-y-3 border-t border-stone-200">
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2.5">
              {PARTICLE_OPTIONS.map((opt) => {
                const isSelected = (settings.ambientParticleStyle || 'auto') === opt.id;
                return (
                  <button
                    key={opt.id}
                    type="button"
                    onClick={() => onChange({ ambientParticleStyle: opt.id })}
                    className={`p-3 rounded-xl border text-left transition-all cursor-pointer ${
                      isSelected
                        ? 'border-amber-500 bg-amber-50/50 ring-1 ring-amber-400 font-bold'
                        : 'border-stone-200 hover:border-stone-300'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-xs text-stone-800">{opt.label}</span>
                      {isSelected && <Check className="w-3.5 h-3.5 text-amber-600" />}
                    </div>
                    <p className="text-[11px] text-stone-500 leading-snug">{opt.desc}</p>
                  </button>
                );
              })}
            </div>
          </div>
        )}
      </div>

      {/* 9. SECCIÓN: SELLO DE LACRE DIGITAL */}
      <div className="border border-stone-200 rounded-2xl overflow-hidden bg-white">
        <button
          type="button"
          onClick={() => toggleSection('seal')}
          className="w-full px-4 py-3 bg-stone-50/80 hover:bg-stone-100/80 flex items-center justify-between text-left transition-colors cursor-pointer"
        >
          <div className="flex items-center gap-2.5">
            <Shield className="w-4 h-4 text-amber-700" />
            <div>
              <span className="text-xs sm:text-sm font-bold text-stone-800">
                9. Acabado del Sello de Cera / Lacre
              </span>
              <span className="block text-[11px] text-stone-500 font-normal">
                {settings.sealStyle && settings.sealStyle !== 'auto'
                  ? `Acabado: ${CARD_THEMES[settings.sealStyle as CardStyleId]?.name || settings.sealStyle}`
                  : 'Automático (del estilo base)'}
              </span>
            </div>
          </div>
          {openSection === 'seal' ? (
            <ChevronUp className="w-4 h-4 text-stone-400" />
          ) : (
            <ChevronDown className="w-4 h-4 text-stone-400" />
          )}
        </button>

        {openSection === 'seal' && (
          <div className="p-4 space-y-3 border-t border-stone-200">
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2">
              <button
                type="button"
                onClick={() => onChange({ sealStyle: 'auto' })}
                className={`p-2.5 rounded-xl border text-left transition-all cursor-pointer flex items-center gap-2 ${
                  !settings.sealStyle || settings.sealStyle === 'auto'
                    ? 'border-amber-700 bg-amber-50/50 ring-1 ring-amber-600 font-bold'
                    : 'border-stone-200 hover:border-stone-300'
                }`}
              >
                <div className={`w-4 h-4 rounded-full ${activeTheme.sealBg} shrink-0`} />
                <span className="text-xs truncate">Auto (Base)</span>
              </button>

              {STYLE_KEYS.map((key) => {
                const t = CARD_THEMES[key];
                const isSelected = settings.sealStyle === key;
                return (
                  <button
                    key={key}
                    type="button"
                    onClick={() => onChange({ sealStyle: key })}
                    className={`p-2.5 rounded-xl border text-left transition-all cursor-pointer flex items-center gap-2 ${
                      isSelected
                        ? 'border-amber-700 bg-amber-50/50 ring-1 ring-amber-600 font-bold'
                        : 'border-stone-200 hover:border-stone-300'
                    }`}
                  >
                    <div className={`w-4 h-4 rounded-full ${t.sealBg} shrink-0`} />
                    <span className="text-xs truncate">{t.name}</span>
                  </button>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
