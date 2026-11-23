import React from 'react';
import { Sparkles, Mail, DoorOpen } from 'lucide-react';
import type { CardStyleId, WeddingSettings } from '../../../types.ts';
import { CARD_THEMES } from '../../../lib/themes.ts';
import { XV_CARD_THEMES } from '../../../xv/themes.ts';
import { BIRTHDAY_CARD_THEMES } from '../../../birthday/themes.ts';
import { resolveInvitationTheme } from '../../../lib/invitationTheme.ts';
import { formatHeroDate } from '../../../lib/dateFormatters.ts';
import { WAX_SEAL_DESIGNS } from '../../../lib/waxSealAppearance.ts';
import { generateDynamicInitials } from '../../../lib/eventUtils.ts';

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
  const isBirthday = settings.eventType === 'birthday';
  const isDoor = settings.entranceType === 'door';
  const themes = isXv ? XV_CARD_THEMES : isBirthday ? BIRTHDAY_CARD_THEMES : CARD_THEMES;
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

  const doorStyleOptions = [
    { value: 'auto', label: 'Automático · según estilo de la invitación' },
    { value: 'disco-silver', label: 'Disco After-Party & Silver Glam (Acero y Plata)' },
    { value: 'luxury-wood', label: 'Madera Noble & Caoba (Lujo Clásico)' },
    { value: 'classic', label: 'Clásico Editorial Noir & Oro' },
    { value: 'arch-ornate', label: 'Portal Real Ornamentado (Navy & Gold)' },
  ];

  return (
    <section className="space-y-4 rounded-2xl border border-[#E5E2D0] bg-[#FAF9F0]/70 p-4 sm:p-5">
      <div className="flex items-start gap-2.5">
        <Sparkles className="mt-0.5 h-4 w-4 shrink-0 text-[#7D8C7A]" aria-hidden="true" />
        <div>
          <h3 className="text-sm font-bold text-[#3D3D3D]">Experiencia de Entrada (Carta o Puertas)</h3>
          <p className="mt-0.5 text-xs leading-relaxed text-stone-600">
            Personaliza cómo tus invitados ingresan a la invitación: un sobre tradicional con lacre o unas puertas dobles 3D abriéndose.
          </p>
        </div>
      </div>

      <label className="flex cursor-pointer items-start gap-3 rounded-xl border border-[#E5E2D0] bg-white/75 p-3">
        <input type="checkbox" checked={settings.showInvitationLetter !== false} onChange={(event) => onChange({ showInvitationLetter: event.target.checked })} className="mt-0.5 h-4 w-4 shrink-0 accent-[#5A5A40]" />
        <span>
          <span className="block text-xs font-semibold text-[#3D3D3D]">Mostrar experiencia de entrada</span>
          <span className="mt-0.5 block text-[11px] leading-relaxed text-stone-500">Si la desactivas, la invitación abrirá directamente en su portada.</span>
        </span>
      </label>

      {/* Selector de Tipo de Entrada */}
      <div className="space-y-3 rounded-xl border border-[#E5E2D0] bg-white/80 p-3 sm:p-4">
        <label className="text-xs font-bold text-[#3D3D3D] block">
          Tipo de Apertura:
        </label>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <button
            type="button"
            onClick={() => onChange({ entranceType: 'letter' })}
            className={`p-3 rounded-xl border text-left transition-all cursor-pointer flex items-center gap-3 ${
              !isDoor
                ? 'bg-[#5A5A40] text-white border-[#5A5A40] shadow-sm'
                : 'bg-white hover:bg-stone-50 text-stone-700 border-[#E5E2D0]'
            }`}
          >
            <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${
              !isDoor ? 'bg-white/20 text-white' : 'bg-[#FAF9F0] text-amber-800'
            }`}>
              <Mail className="w-4 h-4" />
            </div>
            <div>
              <span className="block text-xs font-bold">Carta con Sobre</span>
              <span className="text-[10px] opacity-80 block">Sobre elegante con sello de lacre interactivo</span>
            </div>
          </button>
          <button
            type="button"
            onClick={() => onChange({ entranceType: 'door' })}
            className={`p-3 rounded-xl border text-left transition-all cursor-pointer flex items-center gap-3 ${
              isDoor
                ? 'bg-[#5A5A40] text-white border-[#5A5A40] shadow-sm'
                : 'bg-white hover:bg-stone-50 text-stone-700 border-[#E5E2D0]'
            }`}
          >
            <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${
              isDoor ? 'bg-white/20 text-white' : 'bg-[#FAF9F0] text-amber-800'
            }`}>
              <DoorOpen className="w-4 h-4" />
            </div>
            <div>
              <span className="block text-xs font-bold">Puertas Abriéndose</span>
              <span className="text-[10px] opacity-80 block">Puertas dobles 3D abriéndose a la celebración</span>
            </div>
          </button>
        </div>

        {/* Estilo visual de las Puertas 3D cuando está seleccionado 'door' */}
        {isDoor && (
          <div className="pt-2 border-t border-[#E5E2D0]/80">
            <SelectControl
              label="Estilo visual de las Puertas 3D"
              value={settings.doorStyle}
              options={doorStyleOptions}
              onChange={(doorStyle) => onChange({ doorStyle: doorStyle as WeddingSettings['doorStyle'] })}
            />
            <p className="mt-1 text-[11px] text-stone-500">
              Personaliza el acabado de los paneles, molduras, picaportes y destellos de las puertas dobles.
            </p>
          </div>
        )}
      </div>

      {!isDoor && (
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
      )}

      {/* Textos del Hero (Portada principal tras la entrada) */}
      <div className="space-y-3 rounded-xl border border-[#E5E2D0] bg-white/65 p-3 sm:p-4">
        <div>
          <h4 className="text-xs font-bold text-[#3D3D3D]">Textos del Hero (Portada de la invitación)</h4>
          <p className="mt-0.5 text-[11px] text-stone-500">Personaliza la frase de invitación y el encabezado superior que se muestra en la portada de la invitación.</p>
        </div>
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          <TextControl
            label="Frase de invitación del Hero"
            value={settings.heroInvitationText}
            fallback={isXv ? 'TE INVITO A CELEBRAR MIS XV' : isBirthday ? 'TE INVITO A CELEBRAR MI CUMPLEAÑOS' : 'TE INVITAMOS A CELEBRAR NUESTRA BODA'}
            onChange={(heroInvitationText) => onChange({ heroInvitationText })}
          />
          <TextControl
            label="Encabezado superior del Hero (Estilo Disco / Glam)"
            value={settings.heroHeadingText}
            fallback={isXv ? "It's my Birthday" : isBirthday ? "It's my Birthday" : 'Nuestra Boda'}
            onChange={(heroHeadingText) => onChange({ heroHeadingText })}
          />
        </div>
      </div>

      {/* Textos de la pantalla de entrada (Carta o Puertas) */}
      <div className="space-y-3 rounded-xl border border-[#E5E2D0] bg-white/65 p-3 sm:p-4">
        <div>
          <h4 className="text-xs font-bold text-[#3D3D3D]">
            {isDoor ? 'Textos de la puerta de entrada' : 'Textos de la carta'}
          </h4>
          <p className="mt-0.5 text-[11px] text-stone-500">
            {isDoor
              ? 'Deja un campo vacío para usar el texto automático del evento. Los textos personalizados afectan la pantalla del portal y las puertas 3D.'
              : 'Deja un campo vacío para usar el texto automático del evento. Los nombres y la fecha personalizados sólo afectan la carta.'}
          </p>
        </div>
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          <div className="sm:col-span-2 space-y-1.5">
            <TextControl
              label={isDoor ? 'Insignia o frase superior (Badge sobre el nombre)' : 'Insignia o frase superior (Badge sobre el nombre)'}
              value={settings.letterBadgeText}
              fallback={isXv ? 'TE INVITO A CELEBRAR MIS XV' : isBirthday ? 'TE INVITO A CELEBRAR MI CUMPLEAÑOS' : 'TE INVITAMOS A CELEBRAR NUESTRA BODA'}
              onChange={(letterBadgeText) => onChange({ letterBadgeText })}
            />
            <label className="flex cursor-pointer items-center gap-2 text-[11px] text-stone-600">
              <input
                type="checkbox"
                checked={settings.letterShowBadge !== false}
                onChange={(e) => onChange({ letterShowBadge: e.target.checked })}
                className="h-3.5 w-3.5 rounded accent-[#5A5A40]"
              />
              <span>Mostrar insignia superior con destellos sobre el nombre</span>
            </label>
          </div>
          <TextControl
            label={isDoor ? 'Encabezado del evento (Arquitrabe del portal)' : 'Encabezado del evento'}
            value={settings.letterHeadingText}
            fallback={isXv ? 'MIS XV AÑOS' : isBirthday ? 'MI CUMPLEAÑOS' : 'NUESTRA BODA'}
            onChange={(letterHeadingText) => onChange({ letterHeadingText })}
          />
          <TextControl
            label={isDoor ? 'Nombres mostrados en el portal' : 'Nombres mostrados en la carta'}
            value={settings.letterNamesText}
            fallback={settings.coupleNames || (isBirthday ? 'Sofía Alvarez' : isXv ? 'Mis Quince Años' : 'Nombres del evento')}
            onChange={(letterNamesText) => onChange({ letterNamesText })}
          />
          <TextControl
            label="Fecha mostrada"
            value={settings.letterDateText}
            fallback={formatHeroDate(settings.eventDate || '', settings.heroDateFormat || 'dd.mm.aaaa', settings.heroCustomDateText)}
            onChange={(letterDateText) => onChange({ letterDateText })}
          />
          <TextControl
            label={isDoor ? 'Mensaje inferior de bienvenida (bajo el botón)' : 'Mensaje de bienvenida'}
            value={settings.letterMessageText}
            fallback={isDoor ? 'Una celebración inolvidable te espera' : 'Nos encantará compartir este día tan especial contigo.'}
            onChange={(letterMessageText) => onChange({ letterMessageText })}
            multiline
          />
          <TextControl
            label="Título de lugares reservados"
            value={settings.letterReservationHeadingText}
            fallback="Hemos reservado"
            onChange={(letterReservationHeadingText) => onChange({ letterReservationHeadingText })}
          />
          <TextControl
            label="Texto para un lugar"
            value={settings.letterReservationSingleText}
            fallback={isDoor ? 'pase' : 'lugar en tu honor'}
            onChange={(letterReservationSingleText) => onChange({ letterReservationSingleText })}
          />
          <TextControl
            label="Texto para varios lugares"
            value={settings.letterReservationPluralText}
            fallback={isDoor ? 'pases' : 'lugares en tu honor'}
            onChange={(letterReservationPluralText) => onChange({ letterReservationPluralText })}
          />
          <TextControl
            label="Etiqueta antes del nombre del invitado"
            value={settings.letterGuestLabelText}
            fallback={isDoor ? 'Pase de invitado para:' : 'Para'}
            onChange={(letterGuestLabelText) => onChange({ letterGuestLabelText })}
          />
          <TextControl
            label="Instrucción para abrir"
            value={settings.letterCtaText}
            fallback={isDoor ? 'Toca para abrir las puertas' : 'Toca el sobre para abrir la invitación'}
            onChange={(letterCtaText) => onChange({ letterCtaText })}
          />
          <TextControl
            label="Texto durante la apertura"
            value={settings.letterOpeningText}
            fallback={isDoor ? 'Abriendo puertas...' : 'Abriendo tu invitación…'}
            onChange={(letterOpeningText) => onChange({ letterOpeningText })}
          />
          {!isDoor && (
            <TextControl
              label="Despedida / firma"
              value={settings.letterSignoffText}
              fallback="Con cariño,"
              onChange={(letterSignoffText) => onChange({ letterSignoffText })}
            />
          )}
        </div>
      </div>

      {/* Tipografía */}
      <div className="space-y-3 rounded-xl border border-[#E5E2D0] bg-white/65 p-3 sm:p-4">
        <div>
          <h4 className="text-xs font-bold text-[#3D3D3D]">
            {isDoor ? 'Tipografía de la pantalla de entrada' : 'Tipografía independiente'}
          </h4>
          <p className="mt-0.5 text-[11px] text-stone-500">
            {isDoor
              ? 'Elige una fuente para los nombres en el portal y otra para fechas y mensajes.'
              : 'Elige una fuente distinta para los nombres y para el resto de los textos.'}
          </p>
        </div>
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          <SelectControl label="Tipografía de nombres y títulos" value={settings.letterDisplayFont} options={fontOptions} onChange={(letterDisplayFont) => onChange({ letterDisplayFont })} />
          <SelectControl label="Tipografía de textos y fechas" value={settings.letterBodyFont} options={fontOptions} onChange={(letterBodyFont) => onChange({ letterBodyFont })} />
        </div>
      </div>

      {/* Colores */}
      <div className="space-y-3 rounded-xl border border-[#E5E2D0] bg-white/65 p-3 sm:p-4">
        <div>
          <h4 className="text-xs font-bold text-[#3D3D3D]">
            {isDoor ? 'Colores de la pantalla y el portal' : 'Colores de papel y textos'}
          </h4>
          <p className="mt-0.5 text-[11px] text-stone-500">
            “Automático” hereda la paleta activa; cualquier color elegido queda reservado para esta pantalla.
          </p>
        </div>
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-3">
          <ColorControl label="Fondo exterior" value={settings.letterBackgroundColor} fallback={theme.bgHex} onChange={(letterBackgroundColor) => onChange({ letterBackgroundColor })} />
          {!isDoor && (
            <ColorControl label="Papel de la carta" value={settings.letterPaperColor} fallback={theme.secondaryBgHex} onChange={(letterPaperColor) => onChange({ letterPaperColor })} />
          )}
          <ColorControl label="Texto general y mensajes" value={settings.letterTextColor} fallback={isDoor ? '#D6D3D1' : theme.primaryColorHex} onChange={(letterTextColor) => onChange({ letterTextColor })} />
          <ColorControl label={isDoor ? 'Acentos, herrajes y fecha' : 'Acentos y fecha'} value={settings.letterAccentColor} fallback={theme.accentColorHex} onChange={(letterAccentColor) => onChange({ letterAccentColor })} />
          <ColorControl label="Nombres principales" value={settings.letterHeroColor} fallback={isDoor ? '#FFFFFF' : theme.primaryColorHex} onChange={(letterHeroColor) => onChange({ letterHeroColor })} />
          {isDoor && (
            <ColorControl label="Medallón central de las puertas" value={settings.waxSealColor} fallback={theme.accentColorHex} onChange={(waxSealColor) => onChange({ waxSealColor })} />
          )}
        </div>
      </div>

      {/* Elementos visuales complementarios */}
      {!isDoor ? (
        <div className="space-y-3 rounded-xl border border-[#E5E2D0] bg-white/65 p-3 sm:p-4">
          <div>
            <h4 className="text-xs font-bold text-[#3D3D3D]">Estilos y colores de los elementos de la carta</h4>
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
            <SelectControl label="Forma del sello" value={settings.waxSealDesign} options={[
              { value: 'auto', label: 'Automática · según el estilo' },
              ...Object.entries(WAX_SEAL_DESIGNS).map(([value, design]) => ({ value, label: design.label })),
            ]} onChange={(waxSealDesign) => onChange({ waxSealDesign: waxSealDesign as WeddingSettings['waxSealDesign'] })} />
            <ColorControl label="Sello de lacre" value={settings.waxSealColor} fallback={theme.accentColorHex} onChange={(waxSealColor) => onChange({ waxSealColor })} />
            <ColorControl label="Sombra del sobre" value={settings.envelopeShadowColor} fallback="#2C211B" onChange={(envelopeShadowColor) => onChange({ envelopeShadowColor })} />
            <ColorControl label="Sombra del sello" value={settings.waxSealShadowColor} fallback="#211A14" onChange={(waxSealShadowColor) => onChange({ waxSealShadowColor })} />
          </div>
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <ShadowControl label="Intensidad de sombra del sobre" value={settings.envelopeShadowIntensity} fallback={36} onChange={(envelopeShadowIntensity) => onChange({ envelopeShadowIntensity })} />
            <ShadowControl label="Intensidad de sombra del sello" value={settings.waxSealShadowIntensity} fallback={55} onChange={(waxSealShadowIntensity) => onChange({ waxSealShadowIntensity })} />
          </div>
        </div>
      ) : (
        <div className="space-y-3 rounded-xl border border-[#E5E2D0] bg-white/65 p-3 sm:p-4">
          <div>
            <h4 className="text-xs font-bold text-[#3D3D3D]">Medallón central y detalles del portal</h4>
            <p className="mt-0.5 text-[11px] text-stone-500">Configura el monograma y los detalles centrales de las puertas 3D.</p>
          </div>
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <TextControl
              label="Iniciales / Monograma en el medallón"
              value={settings.waxSealText}
              fallback={generateDynamicInitials(settings.letterNamesText || settings.coupleNames, settings.eventType)}
              onChange={(waxSealText) => onChange({ waxSealText, waxSealTextIsCustom: true })}
            />
            <ColorControl
              label="Color del medallón central"
              value={settings.waxSealColor}
              fallback={theme.accentColorHex}
              onChange={(waxSealColor) => onChange({ waxSealColor })}
            />
          </div>
        </div>
      )}
    </section>
  );
};
