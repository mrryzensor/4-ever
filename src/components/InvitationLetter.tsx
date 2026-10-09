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
  resolveLetterFontFamily,
} from '../lib/letterAppearance.ts';
import { getWaxSealMotifPaths } from '../lib/waxSealAppearance.ts';
import { getThemeFontFamily } from '../lib/rsvpButtonStyle.ts';
import { CardOrnamentFrame } from './animations/CardOrnamentFrame.tsx';
import { StyleSpecificDivider } from './animations/StyleSpecificDivider.tsx';
import { CountdownStyleOrnament } from './animations/AnimatedCountdown.tsx';

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

const LetterCornerOrnament: React.FC<{ styleId: string; color: string }> = ({ styleId, color }) => {
  const celestial = ['dark-luxury', 'royal-navy', 'champagne-glam', 'minimal-editorial'].includes(styleId);
  const softFlorals = ['romantic-floral', 'watercolor-garden', 'lavender-provence'].includes(styleId);
  const washGradientId = `letter-corner-wash-${useId().replace(/:/g, '')}`;
  const leaves = [
    { x: 280, y: 15, rx: 11, ry: 4, rotate: 34 },
    { x: 253, y: 27, rx: 12, ry: 4, rotate: -22 },
    { x: 224, y: 23, rx: 10, ry: 3.5, rotate: 26 },
    { x: 197, y: 38, rx: 11, ry: 4, rotate: -34 },
    { x: 275, y: 53, rx: 12, ry: 4, rotate: 68 },
    { x: 286, y: 81, rx: 12, ry: 4, rotate: -35 },
    { x: 265, y: 106, rx: 11, ry: 4, rotate: 42 },
    { x: 241, y: 130, rx: 12, ry: 4, rotate: -42 },
    { x: 226, y: 161, rx: 11, ry: 4, rotate: 36 },
    { x: 254, y: 69, rx: 9, ry: 3.5, rotate: -28 },
    { x: 228, y: 91, rx: 10, ry: 3.5, rotate: 36 },
    { x: 205, y: 116, rx: 9, ry: 3.5, rotate: -36 },
    { x: 170, y: 43, rx: 9, ry: 3.5, rotate: 22 },
    { x: 294, y: 112, rx: 9, ry: 3.5, rotate: 74 },
    { x: 250, y: 171, rx: 10, ry: 3.5, rotate: -28 },
    { x: 184, y: 136, rx: 8, ry: 3.2, rotate: 28 },
  ];

  return (
    <div aria-hidden="true" className="pointer-events-none absolute -right-4 -top-5 z-[1] h-48 w-[72%] max-w-[330px] opacity-90 sm:h-56 sm:w-[62%] md:-right-3 md:-top-4 md:h-72 md:w-[40%] md:max-w-[420px]">
      <svg viewBox="0 0 300 220" fill="none" className="h-full w-full overflow-visible">
        <defs>
          <linearGradient id={washGradientId} x1="300" y1="0" x2="160" y2="220" gradientUnits="userSpaceOnUse">
            <stop stopColor={color} stopOpacity={softFlorals ? 0.24 : 0.17} />
            <stop offset="1" stopColor={color} stopOpacity="0" />
          </linearGradient>
        </defs>
        {!celestial && <path d="M302 -8C276 21 245 28 216 23C193 19 176 29 157 47M299 -2C277 31 270 55 278 79C286 105 270 128 245 150C226 167 220 190 226 224M268 59C245 66 224 84 209 109C198 128 183 143 160 153M255 87C278 85 294 91 310 107" stroke={color} strokeOpacity=".62" strokeWidth="1.8" strokeLinecap="round" />}
        {!celestial && leaves.map((leaf, index) => (
          <motion.ellipse
            key={index}
            cx={leaf.x}
            cy={leaf.y}
            rx={softFlorals ? leaf.rx * 1.15 : leaf.rx}
            ry={softFlorals ? leaf.ry * 1.35 : leaf.ry}
            fill={index % 3 === 0 ? `url(#${washGradientId})` : color}
            fillOpacity={index % 3 === 0 ? 1 : 0.43 + (index % 2) * 0.12}
            transform={`rotate(${leaf.rotate} ${leaf.x} ${leaf.y})`}
            initial={{ scale: 0.82, opacity: 0.45 }}
            animate={{ scale: [0.92, 1.12, 0.92], opacity: [0.58, 0.88, 0.58] }}
            transition={{ duration: 3 + (index % 4) * 0.45, repeat: Infinity, ease: 'easeInOut', delay: (index % 5) * 0.18 }}
            style={{ transformOrigin: `${leaf.x}px ${leaf.y}px` }}
          />
        ))}
        {celestial ? (
          <g fill={color}>
            <path d="m274 20 4 11 11 4-11 4-4 11-4-11-11-4 11-4 4-11ZM228 58l2.5 6.5L237 67l-6.5 2.5L228 76l-2.5-6.5L219 67l6.5-2.5L228 58ZM278 112l2 5 5 2-5 2-2 5-2-5-5-2 5-2 2-5Z" opacity=".5" />
            <circle cx="199" cy="31" r="2.2" opacity=".55" /><circle cx="254" cy="91" r="2" opacity=".45" /><circle cx="218" cy="139" r="1.8" opacity=".55" />
          </g>
        ) : softFlorals ? (
          <g fill={color}>
            {[{ x: 253, y: 44, r: 6 }, { x: 210, y: 72, r: 5 }, { x: 287, y: 132, r: 6 }, { x: 237, y: 185, r: 5 }].map(({ x, y, r }, index) => (
              <g key={index}>
                <motion.g animate={{ rotate: [0, 10, 0], scale: [0.9, 1.1, 0.9] }} transition={{ duration: 4 + index * 0.4, repeat: Infinity, ease: 'easeInOut' }} style={{ transformOrigin: `${x}px ${y}px` }}>
                  <ellipse cx={x} cy={y - r * 0.65} rx={r * 0.48} ry={r * 0.82} opacity=".42" />
                  <ellipse cx={x + r * 0.65} cy={y} rx={r * 0.48} ry={r * 0.82} transform={`rotate(90 ${x + r * 0.65} ${y})`} opacity=".36" />
                  <ellipse cx={x} cy={y + r * 0.65} rx={r * 0.48} ry={r * 0.82} opacity=".42" />
                  <ellipse cx={x - r * 0.65} cy={y} rx={r * 0.48} ry={r * 0.82} transform={`rotate(90 ${x - r * 0.65} ${y})`} opacity=".36" />
                </motion.g>
                <circle cx={x} cy={y} r={r * 0.26} fill="#fff" opacity=".9" />
              </g>
            ))}
          </g>
        ) : (
          <g fill={color}>
            <path d="M245 48c-5-5-12 2 0 11 12-9 5-16 0-11Z" opacity=".92" />
            <path d="M282 98c-4-4-10 2 0 9 10-7 4-13 0-9Z" opacity=".88" />
            <path d="M194 132c-4-4-10 2 0 9 10-7 4-13 0-9Z" opacity=".8" />
            <path d="M258 153c-3-3-8 2 0 7 8-5 3-10 0-7Z" opacity=".78" />
            <circle cx="271" cy="28" r="3" opacity=".9" /><circle cx="232" cy="153" r="2.5" opacity=".85" />
          </g>
        )}
      </svg>
    </div>
  );
};

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

const WaxSealFinish: React.FC<{ ornamentStyle: string }> = ({ ornamentStyle }) => (
  <svg aria-hidden="true" viewBox="0 0 100 100" className="pointer-events-none absolute inset-[7%] h-[86%] w-[86%] overflow-visible">
    <circle cx="50" cy="50" r="42" fill="none" stroke="white" strokeOpacity=".46" strokeWidth="1.4" />
    <g fill="none" stroke="white" strokeOpacity=".62" strokeWidth="1.35" strokeLinecap="round" strokeLinejoin="round">
      {getWaxSealMotifPaths(ornamentStyle).map((path, index) => <path key={index} d={path} />)}
    </g>
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
          <WaxSealFinish ornamentStyle={sealTheme.ornamentStyle} />
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
  const frameStyle = settings.letterFrameStyle && settings.letterFrameStyle !== 'auto' ? settings.letterFrameStyle : activeFrameStyle;
  const motifStyle = settings.letterMotifStyle && settings.letterMotifStyle !== 'auto'
    ? settings.letterMotifStyle
    : settings.countdownStyle && settings.countdownStyle !== 'auto'
      ? settings.countdownStyle
      : settings.cardStyle || fallbackStyle;
  const dividerStyle = settings.letterDividerStyle && settings.letterDividerStyle !== 'auto'
    ? settings.letterDividerStyle
    : settings.dividerStyle && settings.dividerStyle !== 'auto'
      ? settings.dividerStyle
      : settings.cardStyle || fallbackStyle;
  const [isOpening, setIsOpening] = useState(false);
  const arrowMarkerId = `letter-arrow-${useId().replace(/:/g, '')}`;
  const namesFont = resolveLetterFontFamily(settings.letterDisplayFont, getThemeFontFamily(theme.fontDisplay, 'Georgia, serif'));
  const bodyFont = resolveLetterFontFamily(settings.letterBodyFont, getThemeFontFamily(theme.fontBody, 'Georgia, serif'));
  const backgroundColor = settings.letterBackgroundColor || theme.bgHex;
  const paperColor = settings.letterPaperColor || theme.secondaryBgHex || '#fff';
  const textColor = settings.letterTextColor || theme.primaryColorHex;
  const accentColor = settings.letterAccentColor || theme.accentColorHex;
  const heroColor = settings.letterHeroColor || textColor;
  const motifColor = settings.letterMotifColor || accentColor;
  const frameColor = settings.letterFrameColor || accentColor;
  const dividerColor = settings.letterDividerColor || accentColor;
  const arrowColor = settings.letterArrowColor || accentColor;
  const eventDateText = useMemo(() => formatHeroDate(
    settings.eventDate || '',
    settings.heroDateFormat || 'dd.mm.aaaa',
    settings.heroCustomDateText,
  ), [settings.eventDate, settings.heroDateFormat, settings.heroCustomDateText]);
  const date = settings.letterDateText?.trim() || eventDateText;
  const reservedPasses = guest ? Math.max(1, guest.allocatedPasses || guest.confirmedPasses || 1) : null;
  const heading = settings.letterHeadingText?.trim() || (eventType === 'xv' ? 'MIS XV AÑOS' : 'NUESTRA BODA');
  const displayNames = settings.letterNamesText?.trim() || settings.coupleNames?.trim() || (eventType === 'xv' ? 'Una celebración especial' : 'Nuestra celebración');
  const reservationHeading = settings.letterReservationHeadingText?.trim() || 'Hemos reservado';
  const reservationSingle = settings.letterReservationSingleText?.trim() || 'lugar en tu honor';
  const reservationPlural = settings.letterReservationPluralText?.trim() || 'lugares en tu honor';
  const guestLabel = settings.letterGuestLabelText?.trim() || 'Para';
  const ctaText = settings.letterCtaText?.trim() || 'Toca el sobre para abrir la invitación';
  const openingText = settings.letterOpeningText?.trim() || 'Abriendo tu invitación…';
  const signoffText = settings.letterSignoffText?.trim() || 'Con cariño,';
  const messageText = settings.letterMessageText?.trim() || 'Nos encantará compartir este día tan especial contigo.';
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
      className="fixed inset-0 z-[200] flex h-[100svh] max-h-[100svh] items-center justify-center overflow-hidden p-2 sm:p-5"
      style={{ backgroundColor, color: textColor, fontFamily: bodyFont }}
    >
      <motion.article
        initial={{ opacity: 0, y: 14, scale: 0.985 }}
        animate={{ opacity: isOpening ? 0 : 1, y: isOpening ? -10 : 0, scale: isOpening ? 1.025 : 1 }}
        transition={{ duration: isOpening ? 0.55 : 0.55, ease: 'easeOut' }}
        data-invitation-card="true"
        className={`relative flex h-[calc(100svh-1rem)] max-h-[calc(100svh-1rem)] min-h-0 w-full max-w-[540px] flex-col justify-center gap-[clamp(1rem,2.6svh,1.5rem)] overflow-hidden ${settings.letterShowCardBorder === false ? '!border-0 !ring-0' : 'border'} sm:h-[calc(100svh-2.5rem)] sm:max-h-[calc(100svh-2.5rem)] md:aspect-[1.72/1] md:h-auto md:max-h-none md:min-h-0 md:max-w-[1180px] md:grid md:grid-cols-[1fr_0.94fr] md:grid-rows-1 md:gap-0 ${theme.cardBgClass} ${theme.cardShapeClass || 'rounded-3xl'} ${theme.cardBorderDecoration || 'shadow-md'}`}
        style={{ backgroundColor: paperColor, borderColor: `${frameColor}55`, color: textColor }}
      >
        {settings.letterShowCornerMotifs !== false && <>
          <CardOrnamentFrame cardStyle={frameStyle} accentColor={frameColor} />
          <LetterCornerOrnament
            styleId={settings.letterMotifStyle && settings.letterMotifStyle !== 'auto' ? settings.letterMotifStyle : settings.cardStyle || fallbackStyle}
            color={motifColor}
          />
          <div className="pointer-events-none absolute -right-8 -top-8 z-[1] h-48 w-48 opacity-75 sm:h-56 sm:w-56 md:h-72 md:w-72">
            <CountdownStyleOrnament
              style={motifStyle}
              fallbackStyle={motifStyle}
              accentColor={motifColor}
            />
          </div>
        </>}
        <div className="pointer-events-none absolute right-0 top-0 z-[2] h-12 w-[58%] max-w-[300px] opacity-90 md:w-[35%] md:max-w-[380px]">
          <StyleSpecificDivider
            cardStyle={dividerStyle}
            dividerStyle={dividerStyle}
            fallbackStyle={fallbackStyle}
            color={dividerColor}
            className="!mx-0 !my-0 h-full w-full"
          />
        </div>
        <div className="pointer-events-none absolute -bottom-8 left-0 z-[1] h-28 w-full overflow-hidden opacity-90 sm:h-36 md:h-40">
          <StyleSpecificDivider
            cardStyle={dividerStyle}
            dividerStyle={dividerStyle}
            fallbackStyle={fallbackStyle}
            color={dividerColor}
            className="!mx-0 !my-0 h-full w-full"
          />
        </div>

        <section className="relative z-10 flex min-h-0 shrink-0 flex-col items-center justify-center overflow-hidden px-4 py-0 text-center sm:px-10 md:items-start md:px-12 md:py-12 md:text-left lg:px-16">
          <p className="mb-[clamp(0.15rem,0.8svh,0.5rem)] text-[clamp(0.68rem,1.8svh,1.05rem)] font-medium uppercase tracking-[0.2em] md:mb-4 md:text-lg" style={{ color: accentColor }}>{heading}</p>
          <div className="mb-[clamp(0.15rem,0.8svh,0.5rem)] h-px w-20 md:mb-4 md:w-24" style={{ backgroundColor: `${dividerColor}80` }} />
          <h1 className="max-w-full break-words text-[clamp(2rem,6.2svh,3.5rem)] leading-[1.02] tracking-tight md:text-[clamp(3.75rem,5vw,6.5rem)] md:leading-[1.04]" style={{ color: heroColor, fontFamily: namesFont }}>
            {displayNames}
          </h1>
          <p className="mt-[clamp(0.3rem,1.3svh,0.8rem)] flex max-w-full flex-wrap items-center justify-center gap-2 text-[clamp(1rem,3.2svh,1.7rem)] tracking-[0.1em] md:mt-5 md:text-3xl md:justify-start" style={{ color: accentColor }}>
            <CalendarDays className="h-[clamp(1rem,3svh,1.75rem)] w-[clamp(1rem,3svh,1.75rem)] md:h-8 md:w-8" aria-hidden="true" />
            <span className="min-w-0 break-words">{date}</span>
          </p>

          <div className="mt-6 hidden h-px w-full max-w-sm md:block" style={{ backgroundColor: `${dividerColor}50` }} />
          <div className="mt-[clamp(0.25rem,1svh,0.65rem)] min-h-0 text-center md:mt-5 md:min-h-[86px] md:text-left">
            {reservedPasses ? (
              <>
                <p className="text-[clamp(0.68rem,2.1svh,1.1rem)] uppercase tracking-[0.16em] opacity-75 md:text-lg">{reservationHeading}</p>
                <p className="mt-[clamp(0.15rem,0.6svh,0.45rem)] flex items-center justify-center gap-2 md:mt-2 md:gap-3 md:justify-start">
                  <span className="inline-flex h-[clamp(2.4rem,7.5svh,4rem)] min-w-[clamp(2.4rem,7.5svh,4rem)] items-center justify-center rounded-xl border px-2 text-[clamp(1.8rem,5.5svh,3rem)] md:h-16 md:min-w-16 md:px-3 md:text-5xl" style={{ color: accentColor, borderColor: `${accentColor}70`, fontFamily: namesFont }}>{reservedPasses}</span>
                  <span className="text-[clamp(0.62rem,1.8svh,1.1rem)] uppercase tracking-[0.12em] md:text-lg">{reservedPasses === 1 ? reservationSingle : reservationPlural}</span>
                </p>
              </>
            ) : (
              <p className="mx-auto max-w-xs text-[clamp(0.85rem,2.7svh,1.4rem)] italic opacity-75 md:mx-0 md:text-2xl">{messageText}</p>
            )}
          </div>
          {guest?.fullName && <p className="mt-[clamp(0.15rem,0.6svh,0.5rem)] max-w-full break-words text-[clamp(0.68rem,1.8svh,1rem)] opacity-70 md:mt-3 md:text-lg">{guestLabel} {guest.fullName}</p>}
        </section>

        <section className="relative z-10 flex min-h-0 shrink-0 flex-col items-center justify-center overflow-hidden px-3 py-0 sm:px-10 md:px-10 md:py-10 lg:px-14">
          <div className="relative flex w-[calc(31svh*1.421)] max-w-full flex-col items-center md:w-full md:max-w-[440px]">
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
                <marker id={arrowMarkerId} markerWidth="12" markerHeight="12" refX="10.5" refY="6" orient="auto" markerUnits="userSpaceOnUse">
                  <path d="M0 0 12 6 0 12 2.5 6Z" fill={arrowColor} />
                </marker>
              </defs>
              <motion.path
                d="M146 337 C127 320 132 294 151 292 C171 290 176 316 158 316 C148 316 145 302 157 296 C169 290 179 272 187 258"
                fill="none"
                stroke={arrowColor}
                strokeWidth="2.5"
                strokeLinecap="round"
                strokeDasharray="1.2 7"
                markerEnd={`url(#${arrowMarkerId})`}
                animate={{ strokeDashoffset: [0, -27] }}
                transition={{ duration: 1.5, repeat: Infinity, ease: 'linear' }}
              />
            </motion.svg>
            <p aria-live="polite" className="relative z-20 mt-[clamp(1rem,2.6svh,1.5rem)] flex min-h-0 w-full flex-wrap items-center justify-center gap-1 text-center text-[clamp(0.68rem,1.9svh,1rem)] font-medium uppercase tracking-[0.07em] md:mt-4 md:min-h-7 md:gap-2 md:text-base md:tracking-[0.09em]" style={{ color: arrowColor }}>
              {isOpening ? openingText : <><Heart className="h-4 w-4 shrink-0 sm:h-5 sm:w-5" aria-hidden="true" />{ctaText}</>}
            </p>
          </div>
          <p className="mt-[clamp(1.5rem,4.5svh,2.5rem)] max-w-full break-words text-center text-[clamp(1rem,2.7svh,1.35rem)] italic leading-tight tracking-[0.04em] opacity-65 md:mt-20 md:text-xl" style={{ color: heroColor, fontFamily: namesFont }}>{signoffText} {displayNames}</p>
        </section>
      </motion.article>
    </main>
  );
};
