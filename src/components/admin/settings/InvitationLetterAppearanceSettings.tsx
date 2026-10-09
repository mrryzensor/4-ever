import React from 'react';
import { Sparkles } from 'lucide-react';
import type { CardStyleId, WeddingSettings } from '../../../types.ts';
import { CARD_THEMES } from '../../../lib/themes.ts';
import { XV_CARD_THEMES } from '../../../xv/themes.ts';
import { resolveInvitationTheme } from '../../../lib/invitationTheme.ts';
import { formatHeroDate } from '../../../lib/dateFormatters.ts';

interface InvitationLetterAppearanceSettingsProps {
  settings: WeddingSettings;
  onChange: (updates: Partial<WeddingSettings>) => void;
}

const FONT_OPTIONS = [
  'Alex Brush', 'Cinzel', 'Cinzel Decorative', 'Cormorant Garamond', 'Italiana',
  'Lora', 'Marcellus', 'Montserrat', 'Playfair Display', 'Plus Jakarta Sans', 'Prata',
];

const ColorControl = ({
  label,
  value,
  fallback,
  onChange,
}: {
  label: string;
  value?: string;
  fallback: string;
  onChange: (value: string) => void;
}) => {
  const color = value || fallback;
  return (
    <label className="block min-w-0">
      <span className="mb-1.5 block text-xs font-semibold text-[#5A5A40]">{label}</span>
      <span className="flex min-h-12 items-center gap-2 rounded-xl border border-[#E5E2D0] bg-[#FAF9F0] p-2">
        <input
          type="color"
          value={color}
          onChange={(event) => onChange(event.target.value)}
          className="h-9 w-10 shrink-0 cursor-pointer rounded-lg border border-[#E5E2D0] bg-white p-0.5"
          aria-label={label}
        />
        <span className="min-w-0 flex-1 truncate font-mono text-[10px] text-[#5A5A40]">
          {value ? color.toUpperCase() : `Automático · ${color.toUpperCase()}`}
        </span>
        {value && <button type="button" onClick={() => onChange('')} className="shrink-0 text-[10px] font-semibold text-[#7D8C7A] underline">Automático</button>}
      </span>
    </label>
  );
};

const ShadowControl = ({
  label,
  value,
  fallback,
  onChange,
}: {
  label: string;
  value?: number;
  fallback: number;
  onChange: (value: number) => void;
}) => {
  const intensity = value ?? fallback;
  return (
    <label className="block min-w-0">
      <span className="mb-1.5 flex items-center justify-between gap-2 text-xs font-semibold text-[#5A5A40]">
        <span>{label}</span>
        <span className="font-mono font-normal text-stone-500">{intensity}%</span>
      </span>
      <input type="range" min="0" max="100" step="1" value={intensity} onChange={(event) => onChange(Number(event.target.value))} className="w-full accent-[#5A5A40]" aria-label={label} />
      <span className="mt-0.5 block text-[10px] text-stone-500">0% sin sombra · 100% intensa</span>
    </label>
  );
};

const SelectControl = ({
  label,
  value,
  options,
  onChange,
}: {
  label: string;
  value?: string;
  options: Array<{ value: string; label: string }>;
  onChange: (value: string) => void;
}) => (
  <label className="block min-w-0">
    <span className="mb-1.5 block text-xs font-semibold text-[#5A5A40]">{label}</span>
    <select value={value || 'auto'} onChange={(event) => onChange(event.target.value)} className="h-11 w-full rounded-xl border border-[#E5E2D0] bg-white px-3 text-xs text-stone-800 outline-none focus:border-[#7D8C7A]">
      {options.map((option) => <option key={option.value} value={option.value}>{option.label}</option>)}
    </select>
  </label>
);

const TextControl = ({
  label,
  value,
  fallback,
  onChange,
  multiline = false,
}: {
  label: string;
  value?: string;
  fallback: string;
  onChange: (value: string) => void;
  multiline?: boolean;
}) => (
  <label className="block min-w-0">
    <span className="mb-1.5 block text-xs font-semibold text-[#5A5A40]">{label}</span>
    {multiline ? (
      <textarea value={value || ''} onChange={(event) => onChange(event.target.value)} placeholder={fallback} rows={2} className="w-full resize-y rounded-xl border border-[#E5E2D0] bg-white px-3 py-2.5 text-xs text-stone-800 outline-none placeholder:text-stone-400 focus:border-[#7D8C7A]" />
    ) : (
      <input type="text" value={value || ''} onChange={(event) => onChange(event.target.value)} placeholder={fallback} className="h-11 w-full rounded-xl border border-[#E5E2D0] bg-white px-3 text-xs text-stone-800 outline-none placeholder:text-stone-400 focus:border-[#7D8C7A]" />
    )}
  </label>
);

export const InvitationLetterAppearanceSettings: React.FC<InvitationLetterAppearanceSettingsProps> = ({ settings, onChange }) => {
  const isXv = settings.eventType === 'xv';
  const themes = isXv ? XV_CARD_THEMES : CARD_THEMES;
  const fallbackStyle = (isXv ? 'romantic-floral' : 'classic-gold') as CardStyleId;
  const theme = resolveInvitationTheme(settings, themes, fallbackStyle);
  const styleOptions = [
    { value: 'auto', label: 'Automático · estilo de la invitación' },
    ...(Object.keys(themes) as CardStyleId[]).map((style) => ({ value: style, label: themes[style].name })),
  ];
  const fontOptions = [
    { value: 'auto', label: 'Automática · estilo de la invitación' },
    ...FONT_OPTIONS.map((font) => ({ value: font, label: font })),
  ];

  return (
    <section className="space-y-4 rounded-2xl border border-[#E5E2D0] bg-[#FAF9F0]/70 p-4 sm:p-5">
      <div className="flex items-start gap-2.5">
        <Sparkles className="mt-0.5 h-4 w-4 shrink-0 text-[#7D8C7A]" aria-hidden="true" />
        <div>
          <h3 className="text-sm font-bold text-[#3D3D3D]">Carta de entrada</h3>
          <p className="mt-0.5 text-xs leading-relaxed text-stone-600">
            Personaliza la carta sin alterar los colores ni las fuentes del resto de la invitación. Los valores automáticos siguen el estilo elegido.
          </p>
        </div>
      </div>

      <label className="flex cursor-pointer items-start gap-3 rounded-xl border border-[#E5E2D0] bg-white/75 p-3">
        <input type="checkbox" checked={settings.showInvitationLetter !== false} onChange={(event) => onChange({ showInvitationLetter: event.target.checked })} className="mt-0.5 h-4 w-4 shrink-0 accent-[#5A5A40]" />
        <span>
          <span className="block text-xs font-semibold text-[#3D3D3D]">Mostrar carta de entrada</span>
          <span className="mt-0.5 block text-[11px] leading-relaxed text-stone-500">Si la desactivas, la invitación abrirá directamente en su portada.</span>
        </span>
      </label>

      <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
        <label className="flex cursor-pointer items-start gap-3 rounded-xl border border-[#E5E2D0] bg-white/75 p-3">
          <input type="checkbox" checked={settings.letterShowCardBorder !== false} onChange={(event) => onChange({ letterShowCardBorder: event.target.checked })} className="mt-0.5 h-4 w-4 shrink-0 accent-[#5A5A40]" />
          <span>
            <span className="block text-xs font-semibold text-[#3D3D3D]">Mostrar borde del card</span>
            <span className="mt-0.5 block text-[11px] leading-relaxed text-stone-500">Desactívalo para una carta sin borde (borderless).</span>
          </span>
        </label>
        <label className="flex cursor-pointer items-start gap-3 rounded-xl border border-[#E5E2D0] bg-white/75 p-3">
          <input type="checkbox" checked={settings.letterShowCornerMotifs !== false} onChange={(event) => onChange({ letterShowCornerMotifs: event.target.checked })} className="mt-0.5 h-4 w-4 shrink-0 accent-[#5A5A40]" />
          <span>
            <span className="block text-xs font-semibold text-[#3D3D3D]">Mostrar motivos de las esquinas</span>
            <span className="mt-0.5 block text-[11px] leading-relaxed text-stone-500">Controla los adornos del marco y los motivos animados de las esquinas.</span>
          </span>
        </label>
      </div>

      <div className="space-y-3 rounded-xl border border-[#E5E2D0] bg-white/65 p-3 sm:p-4">
        <div>
          <h4 className="text-xs font-bold text-[#3D3D3D]">Textos de la carta</h4>
          <p className="mt-0.5 text-[11px] text-stone-500">Deja un campo vacío para usar el texto automático del evento. Los nombres y la fecha personalizados sólo afectan la carta.</p>
        </div>
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          <TextControl label="Encabezado del evento" value={settings.letterHeadingText} fallback={isXv ? 'MIS XV AÑOS' : 'NUESTRA BODA'} onChange={(letterHeadingText) => onChange({ letterHeadingText })} />
          <TextControl label="Nombres mostrados en la carta" value={settings.letterNamesText} fallback={settings.coupleNames || 'Nombres del evento'} onChange={(letterNamesText) => onChange({ letterNamesText })} />
          <TextControl label="Fecha mostrada" value={settings.letterDateText} fallback={formatHeroDate(settings.eventDate || '', settings.heroDateFormat || 'dd.mm.aaaa', settings.heroCustomDateText)} onChange={(letterDateText) => onChange({ letterDateText })} />
          <TextControl label="Mensaje de bienvenida" value={settings.letterMessageText} fallback="Nos encantará compartir este día tan especial contigo." onChange={(letterMessageText) => onChange({ letterMessageText })} multiline />
          <TextControl label="Título de lugares reservados" value={settings.letterReservationHeadingText} fallback="Hemos reservado" onChange={(letterReservationHeadingText) => onChange({ letterReservationHeadingText })} />
          <TextControl label="Texto para un lugar" value={settings.letterReservationSingleText} fallback="lugar en tu honor" onChange={(letterReservationSingleText) => onChange({ letterReservationSingleText })} />
          <TextControl label="Texto para varios lugares" value={settings.letterReservationPluralText} fallback="lugares en tu honor" onChange={(letterReservationPluralText) => onChange({ letterReservationPluralText })} />
          <TextControl label="Etiqueta antes del nombre del invitado" value={settings.letterGuestLabelText} fallback="Para" onChange={(letterGuestLabelText) => onChange({ letterGuestLabelText })} />
          <TextControl label="Instrucción para abrir" value={settings.letterCtaText} fallback="Toca el sobre para abrir la invitación" onChange={(letterCtaText) => onChange({ letterCtaText })} />
          <TextControl label="Texto durante la apertura" value={settings.letterOpeningText} fallback="Abriendo tu invitación…" onChange={(letterOpeningText) => onChange({ letterOpeningText })} />
          <TextControl label="Despedida / firma" value={settings.letterSignoffText} fallback="Con cariño," onChange={(letterSignoffText) => onChange({ letterSignoffText })} />
        </div>
      </div>

      <div className="space-y-3 rounded-xl border border-[#E5E2D0] bg-white/65 p-3 sm:p-4">
        <div>
          <h4 className="text-xs font-bold text-[#3D3D3D]">Tipografía independiente</h4>
          <p className="mt-0.5 text-[11px] text-stone-500">Elige una fuente distinta para los nombres y para el resto de los textos.</p>
        </div>
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          <SelectControl label="Tipografía de nombres y títulos" value={settings.letterDisplayFont} options={fontOptions} onChange={(letterDisplayFont) => onChange({ letterDisplayFont })} />
          <SelectControl label="Tipografía de textos y fechas" value={settings.letterBodyFont} options={fontOptions} onChange={(letterBodyFont) => onChange({ letterBodyFont })} />
        </div>
      </div>

      <div className="space-y-3 rounded-xl border border-[#E5E2D0] bg-white/65 p-3 sm:p-4">
        <div>
          <h4 className="text-xs font-bold text-[#3D3D3D]">Colores de papel y textos</h4>
          <p className="mt-0.5 text-[11px] text-stone-500">“Automático” hereda la paleta activa; cualquier color elegido queda reservado para esta carta.</p>
        </div>
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-3">
          <ColorControl label="Fondo exterior" value={settings.letterBackgroundColor} fallback={theme.bgHex} onChange={(letterBackgroundColor) => onChange({ letterBackgroundColor })} />
          <ColorControl label="Papel de la carta" value={settings.letterPaperColor} fallback={theme.secondaryBgHex} onChange={(letterPaperColor) => onChange({ letterPaperColor })} />
          <ColorControl label="Texto general" value={settings.letterTextColor} fallback={theme.primaryColorHex} onChange={(letterTextColor) => onChange({ letterTextColor })} />
          <ColorControl label="Acentos y fecha" value={settings.letterAccentColor} fallback={theme.accentColorHex} onChange={(letterAccentColor) => onChange({ letterAccentColor })} />
          <ColorControl label="Nombres principales" value={settings.letterHeroColor} fallback={theme.primaryColorHex} onChange={(letterHeroColor) => onChange({ letterHeroColor })} />
        </div>
      </div>

      <div className="space-y-3 rounded-xl border border-[#E5E2D0] bg-white/65 p-3 sm:p-4">
        <div>
          <h4 className="text-xs font-bold text-[#3D3D3D]">Estilos y colores de los elementos</h4>
          <p className="mt-0.5 text-[11px] text-stone-500">Puedes combinar marcos, motivos y separadores de otros estilos sin cambiar el tema principal.</p>
        </div>
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-3">
          <SelectControl label="Estilo del marco del card" value={settings.letterFrameStyle} options={styleOptions} onChange={(letterFrameStyle) => onChange({ letterFrameStyle })} />
          <SelectControl label="Estilo de motivos animados" value={settings.letterMotifStyle} options={styleOptions} onChange={(letterMotifStyle) => onChange({ letterMotifStyle })} />
          <SelectControl label="Estilo de separadores" value={settings.letterDividerStyle} options={styleOptions} onChange={(letterDividerStyle) => onChange({ letterDividerStyle })} />
          <ColorControl label="Motivos y detalles animados" value={settings.letterMotifColor} fallback={theme.accentColorHex} onChange={(letterMotifColor) => onChange({ letterMotifColor })} />
          <ColorControl label="Marco y esquinas" value={settings.letterFrameColor} fallback={theme.accentColorHex} onChange={(letterFrameColor) => onChange({ letterFrameColor })} />
          <ColorControl label="Separadores" value={settings.letterDividerColor} fallback={theme.accentColorHex} onChange={(letterDividerColor) => onChange({ letterDividerColor })} />
          <ColorControl label="Flecha animada" value={settings.letterArrowColor} fallback={theme.accentColorHex} onChange={(letterArrowColor) => onChange({ letterArrowColor })} />
          <ColorControl label="Sobre" value={settings.envelopeColor} fallback="#9F705A" onChange={(envelopeColor) => onChange({ envelopeColor })} />
          <ColorControl label="Sello de lacre" value={settings.waxSealColor} fallback={theme.accentColorHex} onChange={(waxSealColor) => onChange({ waxSealColor })} />
          <ColorControl label="Sombra del sobre" value={settings.envelopeShadowColor} fallback="#2C211B" onChange={(envelopeShadowColor) => onChange({ envelopeShadowColor })} />
          <ColorControl label="Sombra del sello" value={settings.waxSealShadowColor} fallback="#211A14" onChange={(waxSealShadowColor) => onChange({ waxSealShadowColor })} />
        </div>
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          <ShadowControl label="Intensidad de sombra del sobre" value={settings.envelopeShadowIntensity} fallback={36} onChange={(envelopeShadowIntensity) => onChange({ envelopeShadowIntensity })} />
          <ShadowControl label="Intensidad de sombra del sello" value={settings.waxSealShadowIntensity} fallback={55} onChange={(waxSealShadowIntensity) => onChange({ waxSealShadowIntensity })} />
        </div>
      </div>
    </section>
  );
};
