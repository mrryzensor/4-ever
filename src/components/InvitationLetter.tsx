import React, { useId, useMemo, useState } from 'react';
import { CalendarDays, Heart } from 'lucide-react';
import { motion } from 'motion/react';
import { WeddingSettings, Guest, CardStyleId } from '../types.ts';
import { CARD_THEMES } from '../lib/themes.ts';
import { XV_CARD_THEMES } from '../xv/themes.ts';
import { resolveInvitationTheme } from '../lib/invitationTheme.ts';
import { formatHeroDate } from '../lib/dateFormatters.ts';
import { getDisplayedWaxSealText } from '../lib/eventUtils.ts';
import {
  getEnvelopeTintMatrix,
  getLetterBoxShadowStyle,
  getLetterShadowStyle,
  normalizeLetterShadow,
} from '../lib/letterAppearance.ts';
import { getThemeFontFamily } from '../lib/rsvpButtonStyle.ts';
import { CardOrnamentFrame } from './animations/CardOrnamentFrame.tsx';

interface InvitationLetterProps {
  settings: WeddingSettings;
  guest?: Guest | null;
  eventType: 'bodas' | 'xv';
  onOpen: () => void;
}

const hexToRgb = (hex: string) => {
  const normalized = hex.replace('#', '');
  const value = normalized.length === 3
    ? normalized.split('').map((part) => `${part}${part}`).join('')
    : normalized;
  const parsed = Number.parseInt(value, 16);
  if (!Number.isFinite(parsed)) return { r: 90, g: 90, b: 64 };
  return { r: (parsed >> 16) & 255, g: (parsed >> 8) & 255, b: parsed & 255 };
};

const shade = (hex: string, amount: number) => {
  const { r, g, b } = hexToRgb(hex);
  const channel = (value: number) => Math.round(value * (1 - amount));
  return `rgb(${channel(r)}, ${channel(g)}, ${channel(b)})`;
};

const LetterFlorals = ({ color }: { color: string }) => (
  <svg aria-hidden="true" viewBox="0 0 260 190" className="pointer-events-none absolute h-auto w-40 opacity-45 sm:w-52" fill="none">
    <g fill={color} fillOpacity=".16">
      <ellipse cx="180" cy="24" rx="31" ry="13" transform="rotate(38 180 24)" />
      <ellipse cx="215" cy="46" rx="31" ry="13" transform="rotate(-12 215 46)" />
      <ellipse cx="228" cy="82" rx="31" ry="13" transform="rotate(55 228 82)" />
      <ellipse cx="167" cy="58" rx="28" ry="12" transform="rotate(-48 167 58)" />
      <ellipse cx="193" cy="96" rx="28" ry="12" transform="rotate(21 193 96)" />
      <ellipse cx="125" cy="24" rx="24" ry="10" transform="rotate(18 125 24)" />
    </g>
    <g stroke={color} strokeOpacity=".24" strokeWidth="2" strokeLinecap="round">
      <path d="M248 12c-39 30-56 68-62 111M223 39c-16-3-29-10-39-22m61 41c-15 3-28 1-41-5m25 34c-14-4-25-12-34-24" />
      <path d="M198 100c-23 9-43 25-57 47" />
    </g>
    <g fill={color} fillOpacity=".25">
      <circle cx="189" cy="43" r="4" /><circle cx="229" cy="78" r="4" /><circle cx="162" cy="73" r="3" />
    </g>
  </svg>
);

const TintedLetterArtwork = ({
  source,
  viewBox,
  width,
  height,
  filterId,
  envelopeColor,
}: {
  source: string;
  viewBox: string;
  width: number;
  height: number;
  filterId: string;
  envelopeColor: string;
}) => (
  <svg aria-hidden="true" viewBox={viewBox} preserveAspectRatio="xMidYMid meet" className="pointer-events-none h-full w-full">
    <defs>
      <filter id={filterId} colorInterpolationFilters="sRGB">
        <feColorMatrix type="matrix" values={getEnvelopeTintMatrix(envelopeColor)} />
      </filter>
    </defs>
    <image href={source} x="0" y="0" width={width} height={height} filter={`url(#${filterId})`} />
  </svg>
);

const SealedEnvelope = ({
  envelopeColor,
  envelopeShadowColor,
  envelopeShadowIntensity,
  sealColor,
  sealShadowColor,
  sealShadowIntensity,
  sealText,
  sealTheme,
  isOpening,
  onOpen,
}: {
  envelopeColor: string;
  envelopeShadowColor: string;
  envelopeShadowIntensity: number;
  sealColor: string;
  sealShadowColor: string;
  sealShadowIntensity: number;
  sealText: string;
  sealTheme: (typeof CARD_THEMES)[CardStyleId] | (typeof XV_CARD_THEMES)[CardStyleId];
  isOpening: boolean;
  onOpen: () => void;
}) => {
  const envelopeTintId = `letter-envelope-tint-${useId().replace(/:/g, '')}`;
  const darkerSeal = shade(sealColor, 0.22);
  const isFloral = ['floral', 'watercolor'].some((style) => sealTheme.ornamentStyle.toLowerCase().includes(style));
  return (
    <motion.button
      type="button"
      aria-label="Abrir la invitación tocando el sobre"
      disabled={isOpening}
      onClick={onOpen}
      whileHover={isOpening ? undefined : { y: -5, scale: 1.015 }}
      whileTap={isOpening ? undefined : { scale: 0.985 }}
      animate={{ aspectRatio: isOpening ? 0.869 : 1.421 }}
      transition={{ duration: 0.48, ease: [0.2, 0.75, 0.2, 1] }}
      className="relative block h-auto w-full cursor-pointer touch-manipulation border-0 bg-transparent p-0 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 disabled:cursor-default"
      style={{ aspectRatio: 1.421, outlineColor: sealColor }}
    >
      <motion.div
        className="absolute inset-0 overflow-hidden rounded-[1.5rem]"
        animate={{ opacity: isOpening ? 0 : 1, scale: isOpening ? 0.96 : 1, y: isOpening ? -10 : 0 }}
        transition={{ duration: 0.34, ease: 'easeIn' }}
        style={{ filter: getLetterShadowStyle(envelopeShadowColor, envelopeShadowIntensity) }}
      >
        <TintedLetterArtwork
          source="/carta-cerrada.svg"
          viewBox="0 0 1915.69 1348.75"
          width={1915.69}
          height={1348.75}
          filterId={`${envelopeTintId}-closed`}
          envelopeColor={envelopeColor}
        />
      </motion.div>
      <motion.div
        className="pointer-events-none absolute inset-0 overflow-hidden rounded-b-[1.5rem]"
        initial={false}
        animate={{ opacity: isOpening ? 1 : 0, scale: isOpening ? 1 : 0.92, y: isOpening ? 0 : 12 }}
        transition={{ duration: 0.42, ease: 'easeOut', delay: isOpening ? 0.12 : 0 }}
        style={{ filter: getLetterShadowStyle(envelopeShadowColor, envelopeShadowIntensity) }}
      >
        <TintedLetterArtwork
          source="/carta-abierta.svg"
          viewBox="0 0 3353.5 3859.5"
          width={3353.5}
          height={3859.5}
          filterId={`${envelopeTintId}-open`}
          envelopeColor={envelopeColor}
        />
      </motion.div>
      <span aria-hidden="true" className="absolute left-1/2 top-[63.5%] w-[22%] -translate-x-1/2 -translate-y-1/2">
        <motion.span
          className="relative flex aspect-square w-full items-center justify-center rounded-full border-2 text-[clamp(0.7rem,3.6vw,1.1rem)] font-bold tracking-wide text-white shadow-[0_5px_12px_rgba(33,26,20,0.32)]"
          animate={{ opacity: isOpening ? 0 : 1, scale: isOpening ? 0.45 : 1, y: isOpening ? 12 : 0 }}
          transition={{ duration: 0.27, ease: 'easeIn', delay: isOpening ? 0.04 : 0 }}
          style={{
            transformOrigin: 'center',
            background: `radial-gradient(circle at 35% 25%, ${sealColor}, ${darkerSeal})`,
            borderColor: 'rgba(255,255,255,.36)',
            boxShadow: getLetterBoxShadowStyle(sealShadowColor, sealShadowIntensity),
          }}
        >
          {isFloral ? (
            <span className="absolute inset-[10%] rounded-full border border-white/45" />
          ) : (
            <span className="absolute h-1/2 w-1/2 rotate-45 border border-white/45" />
          )}
          <span className="relative z-10 max-w-[88%] truncate">{sealText}</span>
        </motion.span>
      </span>
    </motion.button>
  );
};

export const InvitationLetter: React.FC<InvitationLetterProps> = ({ settings, guest, eventType, onOpen }) => {
  const themes = eventType === 'xv' ? XV_CARD_THEMES : CARD_THEMES;
  const fallbackStyle = (eventType === 'xv' ? 'romantic-floral' : 'classic-gold') as CardStyleId;
  const theme = resolveInvitationTheme(settings, themes, fallbackStyle);
  const sealStyle = settings.sealStyle && settings.sealStyle !== 'auto' ? settings.sealStyle : settings.cardStyle;
  const sealTheme = themes[sealStyle as CardStyleId] || theme;
  const activeFrameStyle = settings.frameOrnamentStyle && settings.frameOrnamentStyle !== 'auto'
    ? settings.frameOrnamentStyle
    : settings.cardStyle || fallbackStyle;
  const [isOpening, setIsOpening] = useState(false);
  const arrowMarkerId = `letter-arrow-${useId().replace(/:/g, '')}`;
  const namesFont = getThemeFontFamily(theme.fontDisplay, 'Georgia, serif');
  const bodyFont = getThemeFontFamily(theme.fontBody, 'Georgia, serif');
  const date = useMemo(() => formatHeroDate(
    settings.eventDate || '',
    settings.heroDateFormat || 'dd.mm.aaaa',
    settings.heroCustomDateText,
  ), [settings.eventDate, settings.heroDateFormat, settings.heroCustomDateText]);
  const reservedPasses = guest ? Math.max(1, guest.allocatedPasses || guest.confirmedPasses || 1) : null;
  const heading = eventType === 'xv' ? 'MIS XV AÑOS' : 'NUESTRA BODA';
  const displayNames = settings.coupleNames?.trim() || (eventType === 'xv' ? 'Una celebración especial' : 'Nuestra celebración');
  const sealText = getDisplayedWaxSealText(settings);
  const envelopeShadowIntensity = normalizeLetterShadow(settings.envelopeShadowIntensity, 36);
  const sealShadowIntensity = normalizeLetterShadow(settings.waxSealShadowIntensity, 55);

  const openInvitation = () => {
    if (isOpening) return;
    setIsOpening(true);
    window.setTimeout(onOpen, 600);
  };

  return (
    <main
      className="fixed inset-0 z-[200] flex min-h-[100svh] items-center justify-center overflow-y-auto p-3 sm:p-5"
      style={{ backgroundColor: theme.bgHex, color: theme.primaryColorHex, fontFamily: bodyFont }}
    >
      <motion.article
        initial={{ opacity: 0, y: 14, scale: 0.985 }}
        animate={{ opacity: isOpening ? 0 : 1, y: isOpening ? -10 : 0, scale: isOpening ? 1.025 : 1 }}
        transition={{ duration: isOpening ? 0.55 : 0.55, ease: 'easeOut' }}
        data-invitation-card="true"
        className={`relative grid min-h-[calc(100svh-1.5rem)] w-full max-w-[540px] grid-rows-[auto_1fr] overflow-hidden sm:min-h-[calc(100svh-2.5rem)] md:aspect-[1.72/1] md:min-h-0 md:max-w-[1180px] md:grid-cols-[1fr_0.94fr] md:grid-rows-1 ${settings.borderlessCards ? '!border-0 !ring-0' : 'border'} ${theme.cardBgClass} ${theme.cardShapeClass || 'rounded-3xl'} ${theme.cardBorderDecoration || 'shadow-md'} ${settings.transparentCards ? '!bg-transparent !bg-none !shadow-none' : ''}`}
        style={{ backgroundColor: settings.transparentCards ? 'transparent' : theme.secondaryBgHex || '#fff', borderColor: `${theme.accentColorHex}38`, color: theme.primaryColorHex }}
      >
        <CardOrnamentFrame cardStyle={activeFrameStyle} accentColor={theme.accentColorHex} />
        <div className="pointer-events-none absolute -right-7 -top-3 opacity-70">
          <LetterFlorals color={theme.accentColorHex} />
        </div>
        <div className="pointer-events-none absolute -bottom-20 -left-14 rotate-180 opacity-50 md:bottom-0 md:left-0">
          <LetterFlorals color={theme.accentColorHex} />
        </div>

        <section className="relative z-10 flex flex-col items-center justify-center px-5 pb-1 pt-11 text-center sm:px-10 sm:pt-14 md:items-start md:px-12 md:py-12 md:text-left lg:px-16">
          <p className="mb-4 text-lg font-medium uppercase tracking-[0.2em] sm:text-xl" style={{ color: theme.accentColorHex }}>{heading}</p>
          <div className="mb-4 h-px w-24" style={{ backgroundColor: `${theme.accentColorHex}80` }} />
          <h1 className="max-w-full break-words text-[clamp(3.5rem,13vw,5.8rem)] leading-[1.04] tracking-tight sm:text-[clamp(4rem,7vw,6.4rem)] md:text-[clamp(3.75rem,5vw,6.5rem)]" style={{ color: theme.primaryColorHex, fontFamily: namesFont }}>
            {displayNames}
          </h1>
          <p className="mt-5 flex items-center justify-center gap-2 text-2xl tracking-[0.1em] sm:text-3xl md:justify-start" style={{ color: theme.accentColorHex }}>
            <CalendarDays className="h-7 w-7 sm:h-8 sm:w-8" aria-hidden="true" />
            <span>{date}</span>
          </p>

          <div className="mt-6 hidden h-px w-full max-w-sm md:block" style={{ backgroundColor: `${theme.accentColorHex}30` }} />
          <div className="mt-5 min-h-[86px] text-center md:text-left">
            {reservedPasses ? (
              <>
                <p className="text-lg uppercase tracking-[0.16em] opacity-75 sm:text-xl">Hemos reservado</p>
                <p className="mt-2 flex items-center justify-center gap-3 md:justify-start">
                  <span className="inline-flex h-16 min-w-16 items-center justify-center rounded-xl border px-3 text-5xl" style={{ color: theme.accentColorHex, borderColor: `${theme.accentColorHex}70`, fontFamily: namesFont }}>{reservedPasses}</span>
                  <span className="text-lg uppercase tracking-[0.12em] sm:text-xl">{reservedPasses === 1 ? 'lugar en tu honor' : 'lugares en tu honor'}</span>
                </p>
              </>
            ) : (
              <p className="mx-auto max-w-xs text-2xl italic opacity-75 md:mx-0">Nos encantará compartir este día tan especial contigo.</p>
            )}
          </div>
          {guest?.fullName && <p className="mt-3 break-words text-lg opacity-70 sm:text-xl">Para {guest.fullName}</p>}
        </section>

        <section className="relative z-10 flex flex-col items-center justify-start px-3 pb-8 pt-2 sm:px-10 sm:pb-10 md:justify-center md:px-10 md:py-10 lg:px-14">
          <div className="relative w-full max-w-[440px]">
            <SealedEnvelope
              envelopeColor={settings.envelopeColor || '#9F705A'}
              envelopeShadowColor={settings.envelopeShadowColor || '#2C211B'}
              envelopeShadowIntensity={envelopeShadowIntensity}
              sealColor={settings.waxSealColor || sealTheme.accentColorHex}
              sealShadowColor={settings.waxSealShadowColor || '#211A14'}
              sealShadowIntensity={sealShadowIntensity}
              sealText={sealText}
              sealTheme={sealTheme}
              isOpening={isOpening}
              onOpen={openInvitation}
            />
            <motion.svg
              aria-hidden="true"
              viewBox="0 0 440 390"
              preserveAspectRatio="xMidYMin meet"
              className="pointer-events-none absolute inset-x-0 top-0 z-10 h-[calc(100%+4rem)] w-full overflow-visible"
              animate={{ opacity: isOpening ? 0 : 1 }}
              transition={{ duration: 0.2 }}
            >
              <defs>
                <marker id={arrowMarkerId} markerWidth="6" markerHeight="6" refX="5.2" refY="3" orient="auto" markerUnits="userSpaceOnUse">
                  <path d="M0 0 6 3 0 6 1.5 3Z" fill={theme.accentColorHex} />
                </marker>
              </defs>
              <motion.path
                d="M146 337 C127 320 132 294 151 292 C171 290 176 316 158 316 C148 316 145 302 157 296 C169 290 184 255 205 221"
                fill="none"
                stroke={theme.accentColorHex}
                strokeWidth="2.5"
                strokeLinecap="round"
                strokeDasharray="1.2 7"
                markerEnd={`url(#${arrowMarkerId})`}
                animate={{ strokeDashoffset: [0, -27] }}
                transition={{ duration: 1.5, repeat: Infinity, ease: 'linear' }}
              />
            </motion.svg>
            <p aria-live="polite" className="relative z-20 mt-2 flex min-h-7 w-full flex-wrap items-center justify-center gap-2 text-center text-[clamp(1rem,4.1vw,1.25rem)] font-medium uppercase tracking-[0.09em] sm:mt-4" style={{ color: theme.accentColorHex }}>
              {isOpening ? 'Abriendo tu invitación…' : <><Heart className="h-4 w-4 shrink-0 sm:h-5 sm:w-5" aria-hidden="true" />Toca el sobre para abrir la invitación</>}
            </p>
          </div>
          <p className="mt-14 text-center text-lg italic tracking-[0.04em] opacity-65 sm:mt-16 sm:text-xl md:mt-20" style={{ fontFamily: namesFont }}>Con cariño, {displayNames}</p>
        </section>
      </motion.article>
    </main>
  );
};
