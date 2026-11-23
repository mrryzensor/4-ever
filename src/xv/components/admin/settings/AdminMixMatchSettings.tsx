import React, { useEffect, useRef, useState } from 'react';
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
import { TypographyNumberFontField } from '../../../../components/admin/settings/TypographyNumberFontField.tsx';
import { TypographyHeroNumberFontField } from '../../../../components/admin/settings/TypographyHeroNumberFontField.tsx';
import { TypographyCountdownNumberFontField } from '../../../../components/admin/settings/TypographyCountdownNumberFontField.tsx';
import { getThemeDisplayFontFamily } from '../../../../lib/rsvpButtonStyle.ts';
import {
  StyleSpecificDivider,
  FixDateAnimatedTransitionDivider,
  CardOrnamentFrame,
  AnimatedAmbientParticles,
} from '../../AnimatedSvgs.tsx';

interface EmblemColorPickerProps {
  value?: string;
  defaultColor: string;
  onCommit: (color: string) => void;
}

const EmblemColorPicker = React.memo(({ value, defaultColor, onCommit }: EmblemColorPickerProps) => {
  const currentColor = /^#[\da-f]{6}$/i.test(value || '') ? value! : defaultColor;
  const [draftColor, setDraftColor] = useState(currentColor);
  const commitTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const dirtyRef = useRef(false);

  useEffect(() => {
    setDraftColor(currentColor);
    dirtyRef.current = false;
  }, [currentColor]);
  useEffect(() => () => {
    if (commitTimerRef.current) clearTimeout(commitTimerRef.current);
  }, []);

  const handleChange = (color: string) => {
    setDraftColor(color);
    dirtyRef.current = true;
    if (commitTimerRef.current) clearTimeout(commitTimerRef.current);
    commitTimerRef.current = setTimeout(() => {
      onCommit(color);
      dirtyRef.current = false;
      commitTimerRef.current = null;
    }, 250);
  };

  const commitDraft = () => {
    if (commitTimerRef.current) clearTimeout(commitTimerRef.current);
    commitTimerRef.current = null;
    if (!dirtyRef.current) return;
    dirtyRef.current = false;
    onCommit(draftColor);
  };

  const restorePalette = () => {
    if (commitTimerRef.current) clearTimeout(commitTimerRef.current);
    commitTimerRef.current = null;
    dirtyRef.current = false;
    setDraftColor(defaultColor);
    onCommit('');
  };

  return (
    <div className="rounded-xl border border-stone-200 bg-stone-50/70 p-3 sm:col-span-2">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <label htmlFor="hero-emblem-color" className="block text-xs font-semibold text-stone-800">Color del emblema</label>
          <p className="mt-1 text-[10px] text-stone-500">Al dejarlo en automÃ¡tico, el tono se adapta al motivo y a la paleta.</p>
        </div>
        <div className="flex items-center gap-2">
          <input id="hero-emblem-color" type="color" value={draftColor} onChange={(event) => handleChange(event.target.value)} onBlur={commitDraft} aria-label="Elegir color del emblema" className="h-10 w-12 cursor-pointer rounded-lg border border-stone-300 bg-white p-1" />
          <button type="button" onClick={restorePalette} className="rounded-lg border border-stone-300 bg-white px-3 py-2 text-[11px] font-medium text-stone-700 hover:bg-stone-100">Usar paleta</button>
        </div>
      </div>
    </div>
  );
});

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
  'disco-silver',
];

const PARTICLE_OPTIONS = [
  { id: 'auto', label: 'AutomÃ¡tico', desc: 'Heredar segÃºn estilo base' },
  { id: 'petals', label: 'PÃ©talos de Rosa', desc: 'CaÃ­da suave de pÃ©talos romÃ¡nticos' },
  { id: 'gold-sparkles', label: 'Chispas de Oro', desc: 'Polvo de diamantes dorados brillantes' },
  { id: 'champagne-bubbles', label: 'Burbujas ChampaÃ±a', desc: 'Efervescencia luminosa ascendente' },
  { id: 'fireflies', label: 'LuciÃ©rnagas', desc: 'Orbes etÃ©reos flotantes con destello' },
  { id: 'stars', label: 'Estrellas CÃ³smicas', desc: 'Centelleo estelar celestial' },
  { id: 'none', label: 'Desactivado', desc: 'Sin partÃ­culas en el fondo' },
];

const TRANSITION_EFFECT_OPTIONS = [
  { id: 'wave', label: 'Olas orgÃ¡nicas', desc: 'Capas fluidas con silueta segÃºn la plantilla' },
  { id: 'petals', label: 'PÃ©talos flotantes', desc: 'PÃ©talos animados sobre un borde suave' },
  { id: 'sparkles', label: 'Destellos', desc: 'Brillos que aparecen y se desplazan' },
  { id: 'drape', label: 'Cortinaje', desc: 'Pliegues elegantes que enmarcan el contenido' },
  { id: 'orbit', label: 'Ã“rbitas', desc: 'Arcos luminosos alrededor de un domo' },
  { id: 'cascade', label: 'Lluvia botÃ¡nica', desc: 'Hojas y pÃ©talos caen sobre un borde escalonado' },
  { id: 'ribbons', label: 'Listones fluidos', desc: 'Cintas cruzadas se mecen al pasar al contenido' },
  { id: 'bloom', label: 'JardÃ­n en flor', desc: 'Arcos florales con flores que se abren suavemente' },
  { id: 'arch', label: 'Arcos de bienvenida', desc: 'Un pÃ³rtico ornamental se ilumina al entrar al contenido' },
  { id: 'aurora', label: 'Aurora suave', desc: 'Velos luminosos se desplazan bajo el hero' },
  { id: 'constellation', label: 'ConstelaciÃ³n', desc: 'Estrellas conectadas con destellos sutiles' },
  { id: 'confetti', label: 'Confeti delicado', desc: 'PequeÃ±os acentos flotan sobre un borde orgÃ¡nico' },
] as const;

const TYPOGRAPHY_SCALE_CONTROLS = [
  { key: 'typographyTitleScale', label: 'TÃ­tulos principales', help: 'Nombre de la quinceaÃ±era y tÃ­tulos grandes', cssVar: '--invitation-type-title' },
  { key: 'typographyHeadingScale', label: 'Encabezados', help: 'TÃ­tulos de secciones y tarjetas', cssVar: '--invitation-type-heading' },
  { key: 'typographyBodyScale', label: 'PÃ¡rrafos', help: 'Descripciones y textos de lectura', cssVar: '--invitation-type-body' },
  { key: 'typographySubtitleScale', label: 'SubtÃ­tulos', help: 'Texto de apoyo bajo la frase de bienvenida', cssVar: '--invitation-type-subtitle' },
  { key: 'typographyDetailScale', label: 'Detalles', help: 'Fechas, etiquetas y datos secundarios', cssVar: '--invitation-type-detail' },
  { key: 'typographyBadgeScale', label: 'Badges', help: 'PÃ­ldoras, categorÃ­as y etiquetas destacadas', cssVar: '--invitation-type-badge', max: 200 },
  { key: 'typographyButtonScale', label: 'Botones', help: 'Acciones y llamados a la acciÃ³n de la invitaciÃ³n', cssVar: '--invitation-type-button', max: 200 },
  { key: 'typographyToggleScale', label: 'Interruptores', help: 'TamaÃ±o del control Â¿Llevas invitados? en la confirmaciÃ³n', cssVar: '--invitation-type-toggle', max: 200 },
  { key: 'typographyGalleryFullscreenScale', label: 'GalerÃ­a ampliada', help: 'Todos los textos dentro de la foto a pantalla completa', cssVar: '--invitation-type-gallery-fullscreen', max: 200 },
] as const;

const TypographyScaleControls: React.FC<{
  settings: WeddingSettings;
  onChange: (updated: Partial<WeddingSettings>) => void;
  accent: 'indigo' | 'purple';
}> = ({ settings, onChange, accent }) => (
  <div className="rounded-xl border border-stone-200 bg-stone-50/70 p-3 sm:p-4">
    <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
      <div>
        <h4 className="text-sm font-bold text-stone-800">TamaÃ±o de cada tipo de texto</h4>
        <p className="mt-0.5 text-xs text-stone-600">Los cambios se reflejan al instante en el simulador y la invitaciÃ³n.</p>
      </div>
      <button type="button" onClick={() => onChange({ typographyTitleScale: 100, typographyHeadingScale: 100, typographyBodyScale: 100, typographySubtitleScale: 100, typographyDetailScale: 100, typographyBadgeScale: 100, typographyButtonScale: 100, typographyToggleScale: 100, typographyGalleryFullscreenScale: 100 })} className="rounded-lg border border-stone-300 bg-white px-2.5 py-1.5 text-xs font-medium text-stone-700 hover:bg-stone-100">Restablecer tamaÃ±os</button>
    </div>
    <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
      {TYPOGRAPHY_SCALE_CONTROLS.map((control) => {
        const { key, label, help, cssVar } = control;
        const max = 'max' in control ? control.max : 140;
        const value = Math.min(max, Math.max(80, settings[key] ?? 100));
        return (
          <label key={key} className="rounded-lg border border-stone-200 bg-white p-3">
            <span className="flex items-center justify-between gap-2 text-xs font-semibold text-stone-800"><span>{label}</span><span className="tabular-nums text-stone-600">{value}%</span></span>
            <span className="mt-0.5 block text-[11px] text-stone-500">{help}</span>
            <span className={key === 'typographyToggleScale'
              ? 'mt-2 block origin-left'
              : key === 'typographyButtonScale'
              ? 'mt-2 inline-flex origin-left items-center rounded-full bg-[#5A5A40] px-3 py-1.5 font-sans text-xs font-semibold text-white'
              : key === 'typographyBadgeScale'
                ? 'mt-2 inline-flex origin-left items-center rounded-full border border-stone-300 bg-stone-50 px-3 py-1 font-sans text-xs font-medium text-stone-700'
                : `mt-2 block origin-left truncate font-serif text-sm italic text-stone-800 ${accent === 'indigo' ? 'text-indigo-800' : 'text-purple-800'}`}
              style={{ zoom: key === 'typographyToggleScale' || key === 'typographyGalleryFullscreenScale' ? value / 100 : `var(${cssVar}, 1)` }} aria-hidden="true">
              {key === 'typographyToggleScale' ? (
                <span className="inline-flex items-center justify-between gap-3 rounded-xl border border-stone-200 bg-stone-50 px-2.5 py-1.5 text-[10px] font-sans not-italic text-stone-700">
                  <span>Â¿Llevas acompaÃ±antes?</span>
                  <span className="relative h-4 w-7 rounded-full bg-[#5A5A40]"><span className="absolute right-0.5 top-0.5 h-3 w-3 rounded-full bg-white" /></span>
                </span>
              ) : key === 'typographyButtonScale' ? 'Ver invitaciÃ³n' : key === 'typographyBadgeScale' ? 'Puntualidad' : key === 'typographyGalleryFullscreenScale' ? 'Comentarios Â· Tu nombre y dedicatoria' : 'Valeria Â· Nos emociona compartir este dÃ­a'}
            </span>
            <input type="range" min="80" max={max} step="5" value={value} onChange={(event) => onChange({ [key]: Number(event.target.value) })} className={`mt-2 w-full ${accent === 'indigo' ? 'accent-indigo-700' : 'accent-purple-700'}`} aria-label={`TamaÃ±o de ${label.toLowerCase()}`} />
          </label>
        );
      })}
    </div>
  </div>
);

export const AdminMixMatchSettings: React.FC<AdminMixMatchSettingsProps> = ({
  settings,
  onChange,
  isXv = true,
}) => {
  const [openSection, setOpenSection] = useState<string | null>(null);

  const toggleSection = (id: string) => {
    setOpenSection((prev) => (prev === id ? null : id));
  };

  const handleResetAllToAuto = () => {
    onChange({
      colorPaletteStyle: 'auto',
      customAccentColor: '',
      customBgColor: '',
      fontPairStyle: 'auto',
      typographyNumberFont: 'theme',
      typographyHeroNumberFont: 'global',
      typographyCountdownNumberFont: 'global',
      countdownStyle: 'auto',
      countdownLayout: 'circle',
      dividerStyle: 'auto',
      showCardDividers: false,
      borderlessCards: false,
      transparentCards: false,
      frameOrnamentStyle: 'auto',
      transitionWaveStyle: 'auto',
      transitionEffect: 'wave',
      heroIconStyle: 'auto',
      heroEmblemColor: '',
      heroEmblemGlow: 72,
      heroEmblemSparkle: 78,
      heroEmblemScale: 100,
      ambientParticleStyle: 'auto',
      sealStyle: 'auto',
    });
  };

  const activeTheme = CARD_THEMES[settings.cardStyle] || CARD_THEMES['classic-gold'];
  const emblemTheme = settings.colorPaletteStyle && settings.colorPaletteStyle !== 'auto'
    ? (CARD_THEMES[settings.colorPaletteStyle as CardStyleId] || activeTheme)
    : activeTheme;
  const defaultEmblemColor = emblemTheme.accentColorHex;

  const updateHeroEmblemSettings = (updated: Partial<WeddingSettings>) => {
    onChange({ ...updated, heroShowIcon: true });
  };

  const hasOverrides =
    (settings.colorPaletteStyle && settings.colorPaletteStyle !== 'auto') ||
    !!settings.customAccentColor ||
    !!settings.customBgColor ||
    (settings.fontPairStyle && settings.fontPairStyle !== 'auto') ||
    (settings.typographyNumberFont && settings.typographyNumberFont !== 'theme') ||
    (settings.typographyHeroNumberFont && settings.typographyHeroNumberFont !== 'global') ||
    (settings.typographyCountdownNumberFont && settings.typographyCountdownNumberFont !== 'global') ||
    (settings.countdownStyle && settings.countdownStyle !== 'auto') ||
    (settings.countdownLayout && settings.countdownLayout !== 'circle') ||
    (settings.dividerStyle && settings.dividerStyle !== 'auto') ||
    settings.showCardDividers === true ||
    settings.borderlessCards === true ||
    settings.transparentCards === true ||
    (settings.frameOrnamentStyle && settings.frameOrnamentStyle !== 'auto') ||
    (settings.transitionWaveStyle && settings.transitionWaveStyle !== 'auto') ||
    (settings.transitionEffect && settings.transitionEffect !== 'wave') ||
    (settings.heroIconStyle && settings.heroIconStyle !== 'auto') ||
    !!settings.heroEmblemColor ||
    (settings.heroEmblemGlow !== undefined && settings.heroEmblemGlow !== 72) ||
    (settings.heroEmblemSparkle !== undefined && settings.heroEmblemSparkle !== 78) ||
    (settings.heroEmblemScale !== undefined && settings.heroEmblemScale !== 100) ||
    (settings.ambientParticleStyle && settings.ambientParticleStyle !== 'auto') ||
    (settings.sealStyle && settings.sealStyle !== 'auto');

  return (
    <div className="bg-gradient-to-br from-pink-50/40 via-white to-stone-50 p-4 sm:p-6 rounded-2xl sm:rounded-3xl border border-pink-200/80 shadow-sm space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-pink-200/60 pb-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="p-1.5 rounded-xl bg-pink-600 text-white shadow-xs">
              <Sliders className="w-4 h-4" />
            </span>
            <h3 className="text-base sm:text-lg font-serif font-bold text-stone-900">
              Modo Avanzado: Mezcla Modular de Mis XV (Mix & Match)
            </h3>
          </div>
          <p className="text-xs text-stone-600 mt-1">
            Combina elementos de cualquier estilo: paleta de color, tipografÃ­a, contador animado, filigranas y destellos.
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

      {/* 1. SECCIÃ“N: PALETA DE COLORES & ACENTOS */}
      <div className="border border-stone-200 rounded-2xl overflow-hidden bg-white">
        <button
          type="button"
          onClick={() => toggleSection('colors')}
          className="w-full px-4 py-3 bg-stone-50/80 hover:bg-stone-100/80 flex items-center justify-between text-left transition-colors cursor-pointer"
        >
          <div className="flex items-center gap-2.5">
            <Palette className="w-4 h-4 text-pink-600" />
            <div>
              <span className="text-xs sm:text-sm font-bold text-stone-800">
                1. Paleta CromÃ¡tica & Acentos
              </span>
              <span className="block text-[11px] text-stone-500 font-normal">
                {settings.colorPaletteStyle && settings.colorPaletteStyle !== 'auto'
                  ? `Personalizada: ${CARD_THEMES[settings.colorPaletteStyle as CardStyleId]?.name || settings.colorPaletteStyle}`
                  : 'AutomÃ¡tico (del estilo base)'}
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
                Selecciona una Paleta de InspiraciÃ³n:
              </label>
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2">
                <button
                  type="button"
                  onClick={() => onChange({ colorPaletteStyle: 'auto' })}
                  className={`p-2.5 rounded-xl border text-left text-xs transition-all cursor-pointer ${
                    !settings.colorPaletteStyle || settings.colorPaletteStyle === 'auto'
                      ? 'border-pink-600 bg-pink-50/60 ring-1 ring-pink-500 font-bold'
                      : 'border-stone-200 hover:border-stone-300'
                  }`}
                >
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="truncate">Auto (Base)</span>
                    {(!settings.colorPaletteStyle || settings.colorPaletteStyle === 'auto') && (
                      <Check className="w-3.5 h-3.5 text-pink-600 shrink-0" />
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
                          ? 'border-pink-600 bg-pink-50/60 ring-1 ring-pink-500 font-bold'
                          : 'border-stone-200 hover:border-stone-300'
                      }`}
                    >
                      <div className="flex items-center justify-between mb-1.5">
                        <span className="truncate text-[11px]">{t.name}</span>
                        {isSelected && <Check className="w-3.5 h-3.5 text-pink-600 shrink-0" />}
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

      {/* 2. SECCIÃ“N: TIPOGRAFÃA & PAREJAS DE FUENTES */}
      <div className="border border-stone-200 rounded-2xl overflow-hidden bg-white">
        <button
          type="button"
          onClick={() => toggleSection('fonts')}
          className="w-full px-4 py-3 bg-stone-50/80 hover:bg-stone-100/80 flex items-center justify-between text-left transition-colors cursor-pointer"
        >
          <div className="flex items-center gap-2.5">
            <Type className="w-4 h-4 text-purple-600" />
            <div>
              <span className="text-xs sm:text-sm font-bold text-stone-800">
                2. TipografÃ­a & Fuentes Editoriales
              </span>
              <span className="block text-[11px] text-stone-500 font-normal">
                {settings.fontPairStyle && settings.fontPairStyle !== 'auto'
                  ? `Estilo: ${CARD_THEMES[settings.fontPairStyle as CardStyleId]?.name || settings.fontPairStyle}`
                  : 'AutomÃ¡tico (del estilo base)'}
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
                    ? 'border-purple-600 bg-purple-50/50 ring-1 ring-purple-500'
                    : 'border-stone-200 hover:border-stone-300'
                }`}
              >
                <div className="flex items-center justify-between mb-1">
                  <span className="text-xs font-bold text-stone-800">Auto (Estilo Base)</span>
                  {(!settings.fontPairStyle || settings.fontPairStyle === 'auto') && (
                    <Check className="w-3.5 h-3.5 text-purple-600" />
                  )}
                </div>
                <p style={{ fontFamily: getThemeDisplayFontFamily(activeTheme.fontDisplay) }} className={`text-base italic text-stone-700 leading-snug ${activeTheme.fontDisplay}`}>
                  {settings.coupleNames || 'Valeria Montserrat'}
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
                        ? 'border-purple-600 bg-purple-50/50 ring-1 ring-purple-500'
                        : 'border-stone-200 hover:border-stone-300'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-xs font-bold text-stone-800 truncate">{t.name}</span>
                      {isSelected && <Check className="w-3.5 h-3.5 text-purple-600 shrink-0" />}
                    </div>
                    <p style={{ fontFamily: getThemeDisplayFontFamily(t.fontDisplay) }} className={`text-base italic text-stone-700 leading-snug ${t.fontDisplay}`}>
                      {settings.coupleNames || 'Valeria Montserrat'}
                    </p>
                    <p className={`text-[10px] text-stone-500 mt-0.5 truncate ${t.fontBody}`}>
                      {t.fontDisplay.replace('font-[', '').replace(']', '')} + {t.fontBody.replace('font-[', '').replace(']', '')}
                    </p>
                  </button>
                );
              })}
            </div>
            <TypographyNumberFontField settings={settings} onChange={onChange} />
            <TypographyHeroNumberFontField settings={settings} onChange={onChange} />
            <TypographyCountdownNumberFontField settings={settings} onChange={onChange} />
            <TypographyScaleControls settings={settings} onChange={onChange} accent="purple" />
          </div>
        )}
      </div>

      {/* 3. SECCIÃ“N: CUENTA REGRESIVA SVG */}
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
                  : 'AutomÃ¡tico (del estilo base)'}
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

      {/* 4. SECCIÃ“N: SEPARADORES & MOTIVOS SVG */}
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
                  : 'AutomÃ¡tico (del estilo base)'}
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
            <label className="flex cursor-pointer items-start gap-3 rounded-xl border border-rose-200 bg-rose-50/40 p-3">
              <input
                type="checkbox"
                checked={settings.showCardDividers === true}
                onChange={(event) => onChange({ showCardDividers: event.target.checked })}
                className="mt-0.5 h-4 w-4 accent-rose-600"
              />
              <span>
                <span className="block text-xs font-semibold text-stone-800">Separadores SVG entre tarjetas</span>
                <span className="mt-0.5 block text-[11px] text-stone-600">Horizontales al apilarse en mÃ³vil y verticales entre tarjetas de una misma fila en desktop.</span>
              </span>
            </label>
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

      {/* 5. SECCIÃ“N: MARCOS & ESQUINAS DE TARJETAS */}
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
                  : 'AutomÃ¡tico (del estilo base)'}
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
            <label className="flex cursor-pointer items-start gap-3 rounded-xl border border-purple-200 bg-purple-50/40 p-3">
              <input
                type="checkbox"
                checked={settings.borderlessCards === true}
                onChange={(event) => onChange({ borderlessCards: event.target.checked })}
                className="mt-0.5 h-4 w-4 accent-purple-600"
              />
              <span>
                <span className="block text-xs font-semibold text-stone-800">Tarjetas sin borde exterior</span>
                <span className="mt-0.5 block text-[11px] text-stone-600">Conserva los motivos y las sombras del estilo, pero oculta el borde y el anillo exterior.</span>
              </span>
            </label>
            <label className="flex cursor-pointer items-start gap-3 rounded-xl border border-sky-200 bg-sky-50/40 p-3">
              <input
                type="checkbox"
                checked={settings.transparentCards === true}
                onChange={(event) => onChange({ transparentCards: event.target.checked })}
                className="mt-0.5 h-4 w-4 accent-sky-600"
              />
              <span>
                <span className="block text-xs font-semibold text-stone-800">Fondo transparente</span>
                <span className="mt-0.5 block text-[11px] text-stone-600">Quita el fondo y la sombra para integrar los motivos con el fondo. CombÃ­nalo con Â«sin bordeÂ» para eliminar la caja visual.</span>
              </span>
            </label>
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

      {/* 6. SECCIÃ“N: OLAS DE TRANSICIÃ“N HERO */}
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
                6. TransiciÃ³n Animada (Hero âž” Contenido) Â· 12 diseÃ±os
              </span>
              <span className="block text-[11px] text-stone-500 font-normal">
                {`${TRANSITION_EFFECT_OPTIONS.find((option) => option.id === (settings.transitionEffect || 'wave'))?.label || 'Olas orgÃ¡nicas'} Â· ${settings.transitionWaveStyle && settings.transitionWaveStyle !== 'auto'
                  ? CARD_THEMES[settings.transitionWaveStyle as CardStyleId]?.name || settings.transitionWaveStyle
                  : 'paleta automÃ¡tica'}`}
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
            <div>
              <span className="mb-2 block text-xs font-bold text-stone-800">Tipo de efecto animado</span>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2">
                {TRANSITION_EFFECT_OPTIONS.map((option) => {
                  const isSelected = (settings.transitionEffect || 'wave') === option.id;
                  return (
                    <button
                      key={option.id}
                      type="button"
                      onClick={() => onChange({ transitionEffect: option.id })}
                      className={`rounded-xl border p-3 text-left transition-all cursor-pointer ${isSelected
                        ? 'border-cyan-600 bg-cyan-50/50 ring-1 ring-cyan-500'
                        : 'border-stone-200 hover:border-stone-300'}`}
                    >
                      <span className="flex items-center justify-between gap-2 text-xs font-semibold text-stone-800">
                        {option.label}
                        {isSelected && <Check className="w-3.5 h-3.5 text-cyan-600 shrink-0" />}
                      </span>
                      <span className="mt-1 block text-[10px] text-stone-500">{option.desc}</span>
                    </button>
                  );
                })}
              </div>
            </div>
            <div className="border-t border-stone-200 pt-3">
              <span className="mb-2 block text-xs font-bold text-stone-800">Paleta y silueta segÃºn plantilla</span>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
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
                <span className="text-[10px] text-stone-500 block mt-1">Colores de la plantilla activa</span>
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
          </div>
        )}
      </div>

      {/* 7. SECCIÃ“N: EMBLEMA HERO */}
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
                  : 'AutomÃ¡tico (del estilo base)'}
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
                    onClick={() => updateHeroEmblemSettings({ heroIconStyle: 'auto' })}
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
                  Tiara Real de XV AÃ±os
                </span>
              </button>

              {STYLE_KEYS.map((key) => {
                const t = CARD_THEMES[key];
                const isSelected = settings.heroIconStyle === key;
                return (
                  <button
                    key={key}
                    type="button"
                    onClick={() => updateHeroEmblemSettings({ heroIconStyle: key })}
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
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 border-t border-stone-200 pt-4">
              <label className="flex items-center gap-3 rounded-xl border border-stone-200 bg-stone-50/70 p-3 sm:col-span-2">
                <input
                  type="checkbox"
                  checked={Boolean(settings.heroShowIcon)}
                  onChange={(event) => onChange({ heroShowIcon: event.target.checked })}
                  className="h-4 w-4 accent-teal-700"
                />
                <span className="text-xs font-semibold text-stone-800">Mostrar el emblema animado en la portada</span>
              </label>
              <EmblemColorPicker
                value={settings.heroEmblemColor}
                defaultColor={defaultEmblemColor}
                onCommit={(color) => updateHeroEmblemSettings({ heroEmblemColor: color })}
              />
              <label className="rounded-xl border border-stone-200 p-3">
                <span className="flex justify-between gap-2 text-xs font-semibold text-stone-800"><span>Intensidad del resplandor</span><span>{settings.heroEmblemGlow ?? 72}%</span></span>
                <input type="range" min="0" max="100" value={settings.heroEmblemGlow ?? 72} onChange={(event) => updateHeroEmblemSettings({ heroEmblemGlow: Number(event.target.value) })} className="mt-3 w-full accent-teal-700" aria-label="Intensidad del resplandor del emblema" />
              </label>
              <label className="rounded-xl border border-stone-200 p-3">
                <span className="flex justify-between gap-2 text-xs font-semibold text-stone-800"><span>Destellos</span><span>{settings.heroEmblemSparkle ?? 78}%</span></span>
                <input type="range" min="0" max="100" value={settings.heroEmblemSparkle ?? 78} onChange={(event) => updateHeroEmblemSettings({ heroEmblemSparkle: Number(event.target.value) })} className="mt-3 w-full accent-teal-700" aria-label="Intensidad de destellos del emblema" />
              </label>
              <label className="rounded-xl border border-stone-200 p-3 sm:col-span-2">
                <span className="flex justify-between gap-2 text-xs font-semibold text-stone-800"><span>TamaÃ±o</span><span>{settings.heroEmblemScale ?? 100}%</span></span>
                <input type="range" min="70" max="150" value={settings.heroEmblemScale ?? 100} onChange={(event) => updateHeroEmblemSettings({ heroEmblemScale: Number(event.target.value) })} className="mt-3 w-full accent-teal-700" aria-label="TamaÃ±o del emblema" />
              </label>
            </div>
          </div>
        )}
      </div>

      {/* 8. SECCIÃ“N: PARTÃCULAS AMBIENTALES */}
      <div className="border border-stone-200 rounded-2xl overflow-hidden bg-white">
        <button
          type="button"
          onClick={() => toggleSection('particles')}
          className="w-full px-4 py-3 bg-stone-50/80 hover:bg-stone-100/80 flex items-center justify-between text-left transition-colors cursor-pointer"
        >
          <div className="flex items-center gap-2.5">
            <Sparkles className="w-4 h-4 text-pink-500" />
            <div>
              <span className="text-xs sm:text-sm font-bold text-stone-800">
                8. Efectos de PartÃ­culas Ambientales en Pantalla
              </span>
              <span className="block text-[11px] text-stone-500 font-normal">
                {PARTICLE_OPTIONS.find((p) => p.id === (settings.ambientParticleStyle || 'auto'))?.label || 'AutomÃ¡tico'}
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
                        ? 'border-pink-500 bg-pink-50/50 ring-1 ring-pink-400 font-bold'
                        : 'border-stone-200 hover:border-stone-300'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-xs text-stone-800">{opt.label}</span>
                      {isSelected && <Check className="w-3.5 h-3.5 text-pink-600" />}
                    </div>
                    <p className="text-[11px] text-stone-500 leading-snug">{opt.desc}</p>
                  </button>
                );
              })}
            </div>
          </div>
        )}
      </div>

      {/* 9. SECCIÃ“N: SELLO DE LACRE DIGITAL */}
      <div className="border border-stone-200 rounded-2xl overflow-hidden bg-white">
        <button
          type="button"
          onClick={() => toggleSection('seal')}
          className="w-full px-4 py-3 bg-stone-50/80 hover:bg-stone-100/80 flex items-center justify-between text-left transition-colors cursor-pointer"
        >
          <div className="flex items-center gap-2.5">
            <Shield className="w-4 h-4 text-pink-700" />
            <div>
              <span className="text-xs sm:text-sm font-bold text-stone-800">
                9. Acabado del Sello de Cera / Lacre
              </span>
              <span className="block text-[11px] text-stone-500 font-normal">
                {settings.sealStyle && settings.sealStyle !== 'auto'
                  ? `Acabado: ${CARD_THEMES[settings.sealStyle as CardStyleId]?.name || settings.sealStyle}`
                  : 'AutomÃ¡tico (del estilo base)'}
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
                    ? 'border-pink-700 bg-pink-50/50 ring-1 ring-pink-600 font-bold'
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
                        ? 'border-pink-700 bg-pink-50/50 ring-1 ring-pink-600 font-bold'
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
