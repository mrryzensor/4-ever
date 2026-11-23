import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Sparkles, CalendarDays, KeyRound, DoorOpen } from 'lucide-react';
import { WeddingSettings, Guest, CardStyleId } from '../types.ts';
import { CARD_THEMES } from '../lib/themes.ts';
import { XV_CARD_THEMES } from '../xv/themes.ts';
import { BIRTHDAY_CARD_THEMES } from '../birthday/themes.ts';
import { resolveInvitationTheme } from '../lib/invitationTheme.ts';
import { formatHeroDate } from '../lib/dateFormatters.ts';
import { getDisplayedWaxSealText } from '../lib/eventUtils.ts';
import { getThemeFontFamily } from '../lib/rsvpButtonStyle.ts';
import { SilverGlitterStar } from './animations/discoSilver.tsx';

interface InvitationDoorsProps {
  settings: WeddingSettings;
  guest?: Guest | null;
  eventType: 'bodas' | 'xv' | 'birthday';
  onOpen: () => void;
}

export const InvitationDoors: React.FC<InvitationDoorsProps> = ({
  settings,
  guest,
  eventType,
  onOpen,
}) => {
  const [isOpening, setIsOpening] = useState(false);
  const [isHovered, setIsHovered] = useState(false);

  const themes = eventType === 'xv' ? XV_CARD_THEMES : eventType === 'birthday' ? BIRTHDAY_CARD_THEMES : CARD_THEMES;
  const fallbackStyle = (eventType === 'xv' ? 'romantic-floral' : 'classic-gold') as CardStyleId;
  const theme = resolveInvitationTheme(settings, themes, fallbackStyle);

  const isDiscoSilver = settings.cardStyle === 'disco-silver';

  const namesFont = getThemeFontFamily(theme.fontDisplay, 'Cinzel, Georgia, serif');
  const bodyFont = getThemeFontFamily(theme.fontBody, 'Montserrat, sans-serif');

  const coupleNamesSafe = settings.coupleNames || (eventType === 'birthday' ? 'Sofía Alvarez' : eventType === 'xv' ? 'Mis Quince Años' : 'Nuestra Boda');

  const eventDateText = useMemo(() => formatHeroDate(
    settings.eventDate || '',
    settings.heroDateFormat || 'dd.mm.aaaa',
    settings.heroCustomDateText,
  ), [settings.eventDate, settings.heroDateFormat, settings.heroCustomDateText]);

  const sealInitials = getDisplayedWaxSealText(settings);

  const headingText = (
    settings.heroHeadingText?.trim() ||
    settings.letterHeadingText?.trim() ||
    (eventType === 'birthday' ? 'Birthday' : eventType === 'xv' ? 'Mis XV' : 'Nuestra Boda')
  );

  const introText = settings.heroIntroText !== undefined
    ? settings.heroIntroText.trim()
    : (/^it['’]s\s*my/i.test(headingText) ? '' : (eventType === 'birthday' ? "It's my" : ''));

  const invitationPhrase = (
    settings.heroInvitationText?.trim() ||
    (eventType === 'birthday' ? 'TE INVITO A CELEBRAR MI CUMPLEAÑOS' : eventType === 'xv' ? 'TE INVITO A CELEBRAR MIS XV' : 'TE INVITAMOS A CELEBRAR NUESTRA BODA')
  );

  const reservedPasses = guest ? Math.max(1, guest.allocatedPasses || guest.confirmedPasses || 1) : null;

  const handleOpenDoors = () => {
    if (isOpening) return;
    setIsOpening(true);
    window.setTimeout(() => {
      onOpen();
    }, 950);
  };

  return (
    <main
      className="fixed inset-0 z-[200] flex h-[100svh] max-h-[100svh] flex-col items-center justify-between overflow-hidden p-3 sm:p-6 select-none"
      style={{
        backgroundColor: isDiscoSilver ? '#08080C' : (theme.bgHex || '#0B0D13'),
        fontFamily: bodyFont,
      }}
    >
      {/* Background Ambient Atmosphere */}
      <div className="absolute inset-0 pointer-events-none z-0 overflow-hidden">
        {/* Soft Radial Vignette */}
        <div
          className="absolute inset-0 opacity-80"
          style={{
            background: isDiscoSilver
              ? 'radial-gradient(circle at 50% 40%, rgba(30,41,59,0.7) 0%, rgba(10,12,18,0.95) 75%, #050608 100%)'
              : `radial-gradient(circle at 50% 40%, ${theme.accentColorHex}25 0%, rgba(12,14,20,0.85) 60%, #060709 100%)`,
          }}
        />

        {/* Ambient disco stars for Disco Silver theme */}
        {isDiscoSilver && (
          <>
            <SilverGlitterStar size={24} className="absolute top-10 left-8 sm:left-24" twinkleDelay={0.2} rotation={12} />
            <SilverGlitterStar size={32} className="absolute top-20 right-10 sm:right-28" twinkleDelay={0.8} rotation={-20} />
            <SilverGlitterStar size={20} className="absolute bottom-28 left-12 sm:left-32" twinkleDelay={1.4} rotation={45} />
            <SilverGlitterStar size={28} className="absolute bottom-20 right-8 sm:right-24" twinkleDelay={2.0} rotation={-10} />
          </>
        )}

        {/* Subtle Overhead Spotlight casting down on the doorway */}
        <div
          className="absolute -top-24 left-1/2 -translate-x-1/2 w-[340px] sm:w-[540px] h-[340px] sm:h-[450px] opacity-25 filter blur-3xl pointer-events-none"
          style={{
            background: isDiscoSilver
              ? 'radial-gradient(circle, rgba(226,232,240,0.9) 0%, rgba(148,163,184,0.3) 50%, transparent 80%)'
              : `radial-gradient(circle, ${theme.accentColorHex} 0%, rgba(255,255,255,0.2) 50%, transparent 80%)`,
          }}
        />
      </div>

      {/* Top Header Information: Event Title & Celebrant */}
      <motion.header
        initial={{ opacity: 0, y: -16 }}
        animate={{ opacity: isOpening ? 0 : 1, y: isOpening ? -20 : 0 }}
        transition={{ duration: 0.6 }}
        className="relative z-20 flex flex-col items-center text-center max-w-lg mx-auto pt-1 sm:pt-2 px-2"
      >
        {/* Eyebrow badge */}
        <div className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full border border-white/20 bg-white/10 backdrop-blur-md text-[10px] sm:text-xs font-semibold tracking-[0.22em] uppercase text-stone-200 shadow-sm mb-1 sm:mb-2">
          <Sparkles className="w-3 h-3 text-amber-300" />
          <span>{invitationPhrase}</span>
        </div>

        {/* Celebrant Name */}
        <h1
          style={{ fontFamily: namesFont }}
          className="text-2xl xs:text-3xl sm:text-4xl md:text-5xl font-normal text-white leading-tight tracking-tight drop-shadow-[0_4px_16px_rgba(0,0,0,0.9)] max-w-full truncate px-2"
        >
          {coupleNamesSafe}
        </h1>

        {/* Date line */}
        <div className="flex items-center justify-center gap-2 text-xs sm:text-sm font-medium tracking-wider text-stone-300/90 mt-1 uppercase">
          <CalendarDays className="w-3.5 h-3.5 text-amber-200/90" />
          <span>{eventDateText}</span>
        </div>

        {/* Guest VIP badge if provided */}
        {guest?.fullName && (
          <div className="mt-1 text-[11px] sm:text-xs text-white/80 font-medium">
            Pase de invitado para: <span className="font-bold text-white">{guest.fullName}</span>
            {reservedPasses && (
              <span className="ml-1 opacity-75">({reservedPasses} {reservedPasses === 1 ? 'pase' : 'pases'})</span>
            )}
          </div>
        )}
      </motion.header>

      {/* Center 3D Portal & Opening Double Doors */}
      <motion.div
        animate={{
          scale: isOpening ? [1, 1.08, 1.18] : isHovered ? 1.02 : 1,
          opacity: isOpening ? [1, 1, 0] : 1,
        }}
        transition={{ duration: isOpening ? 0.95 : 0.35, ease: 'easeInOut' }}
        className="relative z-10 flex flex-col items-center justify-center my-auto w-full max-w-sm sm:max-w-md"
        style={{ perspective: 1300 }}
      >
        {/* Door Frame Arch / Surround */}
        <div
          onClick={handleOpenDoors}
          onMouseEnter={() => setIsHovered(true)}
          onMouseLeave={() => setIsHovered(false)}
          className="relative cursor-pointer transition-transform duration-300 rounded-t-3xl sm:rounded-t-[36px] p-2.5 sm:p-3.5 shadow-[0_24px_50px_rgba(0,0,0,0.9)] border"
          style={{
            borderColor: isDiscoSilver ? 'rgba(226,232,240,0.35)' : `${theme.accentColorHex}55`,
            background: isDiscoSilver
              ? 'linear-gradient(to bottom, #1E293B, #0F172A)'
              : 'linear-gradient(to bottom, #2C221A, #16110D)',
          }}
        >
          {/* Top Lintel Arch Decorator */}
          <div className="flex items-center justify-between px-3 py-1 mb-1.5 border-b border-white/15">
            <div className="h-1 w-6 sm:w-10 rounded-full bg-white/20" />
            <span className="text-[9px] sm:text-[10px] font-serif tracking-[0.25em] uppercase text-stone-300 font-semibold drop-shadow-sm">
              {introText ? `${introText} ${headingText}` : headingText}
            </span>
            <div className="h-1 w-6 sm:w-10 rounded-full bg-white/20" />
          </div>

          {/* Doorway Interior Backing (The Light behind doors) */}
          <div className="relative w-[260px] xs:w-[290px] sm:w-[340px] md:w-[380px] h-[370px] xs:h-[410px] sm:h-[470px] md:h-[510px] rounded-t-2xl sm:rounded-t-3xl overflow-hidden bg-black shadow-inner">
            {/* The Celebration Light that bursts forward when opening */}
            <motion.div
              animate={{
                opacity: isOpening ? [0, 0.8, 1] : 0,
                scale: isOpening ? [0.6, 1.2, 1.8] : 0.5,
              }}
              transition={{ duration: 0.9, ease: 'easeOut' }}
              className="absolute inset-0 flex items-center justify-center pointer-events-none z-0"
            >
              <div
                className="w-full h-full filter blur-xl opacity-90"
                style={{
                  background: isDiscoSilver
                    ? 'radial-gradient(circle, #FFFFFF 0%, #CBD5E1 35%, #64748B 70%, transparent 100%)'
                    : `radial-gradient(circle, #FFFBEB 0%, #FDE68A 35%, ${theme.accentColorHex} 70%, transparent 100%)`,
                }}
              />
              {/* Central golden flare ray */}
              <div className="absolute inset-y-0 w-8 bg-white filter blur-sm animate-pulse" />
            </motion.div>

            {/* Silhouette of celebration lights/stars inside */}
            <AnimatePresence>
              {isOpening && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="absolute inset-0 z-10 flex items-center justify-center pointer-events-none"
                >
                  <Sparkles className="w-16 h-16 text-white drop-shadow-[0_0_15px_rgba(255,255,255,1)] animate-spin" style={{ animationDuration: '8s' }} />
                </motion.div>
              )}
            </AnimatePresence>

            {/* THE DOUBLE DOORS: 3D Left Door and Right Door */}
            <div className="relative z-20 w-full h-full flex overflow-visible" style={{ transformStyle: 'preserve-3d' }}>
              {/* LEFT DOOR */}
              <motion.div
                animate={{
                  rotateY: isOpening ? -118 : isHovered ? -8 : 0,
                  scaleX: isOpening ? 0.96 : 1,
                }}
                transition={{
                  duration: isOpening ? 1.05 : 0.35,
                  ease: [0.16, 1, 0.3, 1],
                }}
                className="relative w-1/2 h-full flex flex-col justify-between p-2.5 sm:p-3.5 border-r border-black/80 rounded-tl-2xl sm:rounded-tl-3xl select-none"
                style={{
                  transformOrigin: 'left center',
                  background: isDiscoSilver
                    ? 'linear-gradient(135deg, #242B38 0%, #171C26 40%, #0F131A 100%)'
                    : 'linear-gradient(135deg, #32251B 0%, #221811 40%, #150F0A 100%)',
                  boxShadow: 'inset -3px 0 10px rgba(0,0,0,0.7), inset 2px 2px 5px rgba(255,255,255,0.12)',
                }}
              >
                {/* Left Door Upper Beveled Panel */}
                <div
                  className="w-full h-[52%] rounded-xl sm:rounded-2xl border p-2 flex flex-col justify-between"
                  style={{
                    borderColor: isDiscoSilver ? 'rgba(203,213,225,0.25)' : `${theme.accentColorHex}40`,
                    background: isDiscoSilver
                      ? 'linear-gradient(to bottom, #1E2532, #11151F)'
                      : 'linear-gradient(to bottom, #271C14, #18110B)',
                    boxShadow: 'inset 2px 2px 8px rgba(0,0,0,0.8), 0 1px 2px rgba(255,255,255,0.08)',
                  }}
                >
                  <div className="w-full h-full rounded-lg border border-white/10 flex items-center justify-center">
                    <div className="w-8 h-8 sm:w-12 sm:h-12 rounded-full border border-white/10 opacity-40 flex items-center justify-center">
                      <div className="w-2 h-2 rounded-full bg-white/20" />
                    </div>
                  </div>
                </div>

                {/* Left Door Lower Beveled Panel */}
                <div
                  className="w-full h-[38%] rounded-xl sm:rounded-2xl border p-2 flex flex-col justify-between"
                  style={{
                    borderColor: isDiscoSilver ? 'rgba(203,213,225,0.25)' : `${theme.accentColorHex}40`,
                    background: isDiscoSilver
                      ? 'linear-gradient(to bottom, #1E2532, #11151F)'
                      : 'linear-gradient(to bottom, #271C14, #18110B)',
                    boxShadow: 'inset 2px 2px 8px rgba(0,0,0,0.8), 0 1px 2px rgba(255,255,255,0.08)',
                  }}
                >
                  <div className="w-full h-full rounded-lg border border-white/10" />
                </div>

                {/* Left Metallic Handle */}
                <div className="absolute right-2.5 sm:right-3.5 top-1/2 -translate-y-1/2 z-30 pointer-events-none">
                  <div
                    className="w-2 sm:w-2.5 h-16 sm:h-20 rounded-full shadow-[2px_4px_10px_rgba(0,0,0,0.9)] border border-white/30"
                    style={{
                      background: isDiscoSilver
                        ? 'linear-gradient(to right, #FFFFFF, #94A3B8, #334155)'
                        : 'linear-gradient(to right, #FDE68A, #D97706, #78350F)',
                    }}
                  />
                </div>

                {/* Left Half of Central Seal Emblem */}
                <div className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-1/2 w-14 sm:w-16 h-14 sm:h-16 overflow-hidden pointer-events-none z-40">
                  <div className="w-14 sm:w-16 h-14 sm:h-16 rounded-full border-2 border-white/40 shadow-[0_4px_16px_rgba(0,0,0,0.95)] flex items-center justify-center"
                    style={{
                      background: isDiscoSilver
                        ? 'linear-gradient(135deg, #E2E8F0 0%, #94A3B8 50%, #334155 100%)'
                        : `linear-gradient(135deg, #FDE68A 0%, ${theme.accentColorHex} 60%, #78350F 100%)`,
                    }}
                  >
                    <span className="font-serif font-black text-xs sm:text-sm text-stone-900 tracking-wider">
                      {sealInitials}
                    </span>
                  </div>
                </div>
              </motion.div>

              {/* RIGHT DOOR */}
              <motion.div
                animate={{
                  rotateY: isOpening ? 118 : isHovered ? 8 : 0,
                  scaleX: isOpening ? 0.96 : 1,
                }}
                transition={{
                  duration: isOpening ? 1.05 : 0.35,
                  ease: [0.16, 1, 0.3, 1],
                }}
                className="relative w-1/2 h-full flex flex-col justify-between p-2.5 sm:p-3.5 border-l border-black/80 rounded-tr-2xl sm:rounded-tr-3xl select-none"
                style={{
                  transformOrigin: 'right center',
                  background: isDiscoSilver
                    ? 'linear-gradient(135deg, #171C26 0%, #242B38 60%, #0F131A 100%)'
                    : 'linear-gradient(135deg, #221811 0%, #32251B 60%, #150F0A 100%)',
                  boxShadow: 'inset 3px 0 10px rgba(0,0,0,0.7), inset -2px 2px 5px rgba(255,255,255,0.12)',
                }}
              >
                {/* Right Door Upper Beveled Panel */}
                <div
                  className="w-full h-[52%] rounded-xl sm:rounded-2xl border p-2 flex flex-col justify-between"
                  style={{
                    borderColor: isDiscoSilver ? 'rgba(203,213,225,0.25)' : `${theme.accentColorHex}40`,
                    background: isDiscoSilver
                      ? 'linear-gradient(to bottom, #1E2532, #11151F)'
                      : 'linear-gradient(to bottom, #271C14, #18110B)',
                    boxShadow: 'inset 2px 2px 8px rgba(0,0,0,0.8), 0 1px 2px rgba(255,255,255,0.08)',
                  }}
                >
                  <div className="w-full h-full rounded-lg border border-white/10 flex items-center justify-center">
                    <div className="w-8 h-8 sm:w-12 sm:h-12 rounded-full border border-white/10 opacity-40 flex items-center justify-center">
                      <div className="w-2 h-2 rounded-full bg-white/20" />
                    </div>
                  </div>
                </div>

                {/* Right Door Lower Beveled Panel */}
                <div
                  className="w-full h-[38%] rounded-xl sm:rounded-2xl border p-2 flex flex-col justify-between"
                  style={{
                    borderColor: isDiscoSilver ? 'rgba(203,213,225,0.25)' : `${theme.accentColorHex}40`,
                    background: isDiscoSilver
                      ? 'linear-gradient(to bottom, #1E2532, #11151F)'
                      : 'linear-gradient(to bottom, #271C14, #18110B)',
                    boxShadow: 'inset 2px 2px 8px rgba(0,0,0,0.8), 0 1px 2px rgba(255,255,255,0.08)',
                  }}
                >
                  <div className="w-full h-full rounded-lg border border-white/10" />
                </div>

                {/* Right Metallic Handle */}
                <div className="absolute left-2.5 sm:left-3.5 top-1/2 -translate-y-1/2 z-30 pointer-events-none">
                  <div
                    className="w-2 sm:w-2.5 h-16 sm:h-20 rounded-full shadow-[-2px_4px_10px_rgba(0,0,0,0.9)] border border-white/30"
                    style={{
                      background: isDiscoSilver
                        ? 'linear-gradient(to left, #FFFFFF, #94A3B8, #334155)'
                        : 'linear-gradient(to left, #FDE68A, #D97706, #78350F)',
                    }}
                  />
                </div>

                {/* Right Half of Central Seal Emblem */}
                <div className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-1/2 w-14 sm:w-16 h-14 sm:h-16 overflow-hidden pointer-events-none z-40">
                  <div className="w-14 sm:w-16 h-14 sm:h-16 rounded-full border-2 border-white/40 shadow-[0_4px_16px_rgba(0,0,0,0.95)] flex items-center justify-center"
                    style={{
                      background: isDiscoSilver
                        ? 'linear-gradient(135deg, #E2E8F0 0%, #94A3B8 50%, #334155 100%)'
                        : `linear-gradient(135deg, #FDE68A 0%, ${theme.accentColorHex} 60%, #78350F 100%)`,
                    }}
                  >
                    <span className="font-serif font-black text-xs sm:text-sm text-stone-900 tracking-wider">
                      {sealInitials}
                    </span>
                  </div>
                </div>
              </motion.div>
            </div>
          </div>

          {/* Threshold bottom bar */}
          <div className="h-1.5 sm:h-2 w-full mt-1.5 rounded-full bg-gradient-to-r from-transparent via-white/30 to-transparent" />
        </div>
      </motion.div>

      {/* Bottom CTA Button / Instruction */}
      <motion.footer
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: isOpening ? 0 : 1, y: isOpening ? 20 : 0 }}
        transition={{ duration: 0.6 }}
        className="relative z-20 flex flex-col items-center text-center pb-2 sm:pb-3"
      >
        <button
          type="button"
          onClick={handleOpenDoors}
          className="group px-6 sm:px-8 py-2.5 sm:py-3 rounded-full border border-white/30 bg-white/10 hover:bg-white/20 active:scale-95 transition-all text-white font-serif text-xs sm:text-sm uppercase tracking-[0.2em] shadow-lg backdrop-blur-md flex items-center gap-2 cursor-pointer"
        >
          {isOpening ? (
            <>
              <DoorOpen className="w-4 h-4 text-amber-300 animate-pulse" />
              <span>Abriendo puertas...</span>
            </>
          ) : (
            <>
              <KeyRound className="w-4 h-4 text-amber-300 group-hover:rotate-45 transition-transform" />
              <span>Toca para abrir las puertas</span>
            </>
          )}
        </button>

        <p className="text-[10px] sm:text-xs text-stone-400 font-sans tracking-wider uppercase mt-2 opacity-70">
          Una celebración inolvidable te espera
        </p>
      </motion.footer>
    </main>
  );
};
