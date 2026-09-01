import React, { useState, useEffect, useRef } from 'react';
import { motion, useScroll, useTransform } from 'motion/react';
import {
  MapPin,
  Heart,
  ChevronDown,
  CalendarPlus,
  Compass,
  Sparkles,
} from 'lucide-react';
import { WeddingSettings, Guest } from '../types.ts';
import { CARD_THEMES } from '../lib/themes.ts';
import { formatHeroDate } from '../lib/dateFormatters.ts';
import {
  AnimatedFloatingPetals,
  AnimatedWeddingRings,
  AnimatedChurchBells,
  AnimatedChampagneGlasses,
  FixDateAnimatedTransitionDivider,
  StyleSpecificDivider,
  AnimatedOliveWreath,
  AnimatedRoseArchDivider,
  AnimatedTwinSwans,
  AnimatedPampasGrassDivider,
  AnimatedBohoSunMandala,
  AnimatedEditorialLineDivider,
  AnimatedConstellationDivider,
  AnimatedWatercolorBranchDivider,
} from './AnimatedSvgs.tsx';

interface EnvelopeCardProps {
  settings: WeddingSettings;
  guest?: Guest | null;
  onOpenRsvp: () => void;
}

export const EnvelopeCard: React.FC<EnvelopeCardProps> = ({
  settings,
  guest,
  onOpenRsvp,
}) => {
  const heroContainerRef = useRef<HTMLDivElement>(null);
  const theme = CARD_THEMES[settings.cardStyle] || CARD_THEMES['classic-gold'];

  // Track page scroll for smooth progressive optical blur and parallax
  const { scrollY } = useScroll();

  // Hero Scroll Effects: 
  // At scroll = 0: strictly 0px blur, 100% crisp and clear image
  // As user scrolls: gradual optical blur and subtle zoom
  const heroBgBlur = useTransform(
    scrollY,
    [0, 80, 240, 480],
    ['blur(0px)', 'blur(4px)', 'blur(14px)', 'blur(28px)']
  );
  const heroBgScale = useTransform(scrollY, [0, 480], [1, 1.1]);
  const heroBgOpacity = useTransform(scrollY, [0, 300, 600], [1, 0.85, 0.4]);

  // Hero Text & Controls: completely visible and sharp at top, smoothly dissolves on scroll
  const heroContentOpacity = useTransform(scrollY, [0, 260], [1, 0]);
  const heroContentY = useTransform(scrollY, [0, 320], ['0px', '-35px']);
  const heroContentBlur = useTransform(
    scrollY,
    [0, 80, 260],
    ['blur(0px)', 'blur(0px)', 'blur(6px)']
  );

  const [timeLeft, setTimeLeft] = useState({
    days: 0,
    hours: 0,
    minutes: 0,
    seconds: 0,
  });

  // Countdown timer calculations
  useEffect(() => {
    const calculateTimeLeft = () => {
      const targetDate = new Date(`${settings.eventDate}T${settings.eventTime || '17:00'}:00`).getTime();
      const now = new Date().getTime();
      const difference = targetDate - now;

      if (difference > 0) {
        setTimeLeft({
          days: Math.floor(difference / (1000 * 60 * 60 * 24)),
          hours: Math.floor((difference / (1000 * 60 * 60)) % 24),
          minutes: Math.floor((difference / 1000 / 60) % 60),
          seconds: Math.floor((difference / 1000) % 60),
        });
      } else {
        setTimeLeft({ days: 0, hours: 0, minutes: 0, seconds: 0 });
      }
    };

    calculateTimeLeft();
    const interval = setInterval(calculateTimeLeft, 1000);
    return () => clearInterval(interval);
  }, [settings.eventDate, settings.eventTime]);

  const eventDateSafe = settings.eventDate || '2026-11-28';
  const eventTimeSafe = settings.eventTime || '17:00';
  const coupleNamesSafe = settings.coupleNames || 'Sofía & Alejandro';
  const receptionVenueSafe = settings.receptionVenue || 'Hacienda Los Laureles';
  const receptionAddressSafe = settings.receptionAddress || 'San Miguel de Allende, Gto.';

  const formattedDate = new Date(`${eventDateSafe}T12:00:00`).toLocaleDateString('es-ES', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

  // Add to Google Calendar URL (Safely guarded against undefined properties)
  const cleanDate = eventDateSafe.replace(/-/g, '');
  const cleanTime = eventTimeSafe.replace(/:/g, '');
  const googleCalendarUrl = `https://calendar.google.com/calendar/render?action=TEMPLATE&text=Boda+de+${encodeURIComponent(
    coupleNamesSafe
  )}&dates=${cleanDate}T${cleanTime}00Z/${cleanDate}T235900Z&details=Celebraci%C3%B3n+de+nuestra+boda.+Recepci%C3%B3n+en+${encodeURIComponent(
    receptionVenueSafe
  )}&location=${encodeURIComponent(receptionAddressSafe)}`;

  // Default high-quality wedding background cover if none provided
  const coverImage = settings.coverPhoto || 'https://images.unsplash.com/photo-1519741497674-611481863552?q=80&w=2070&auto=format&fit=crop';

  const scrollToContent = () => {
    const el = document.getElementById('detalles-boda');
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const isDark = settings.cardStyle === 'dark-luxury';

  return (
    <div
      className="w-full relative transition-colors duration-500"
      style={{ backgroundColor: theme.bgHex }}
    >
      {/* 1. HERO SECTION - Sticky Full Viewport */}
      <div
        ref={heroContainerRef}
        className="sticky top-0 h-screen min-h-[600px] w-full overflow-hidden flex flex-col justify-between items-center text-center px-4 py-8 sm:py-10 select-none z-0"
      >
        {/* Background Layer: Clear at top, blurs & zooms progressively on scroll */}
        <motion.div
          style={{
            opacity: heroBgOpacity,
            filter: settings.heroEnableScrollBlur !== false ? heroBgBlur : undefined,
          }}
          className="absolute inset-0 w-full h-full pointer-events-none will-change-[opacity,filter]"
        >
          {/* If fit is 'contain', render an ambient backdrop */}
          {settings.heroImageFit === 'contain' && (
            <div
              className="absolute inset-0 bg-cover bg-center filter blur-xl scale-110 opacity-60"
              style={{ backgroundImage: `url(${coverImage})` }}
            />
          )}

          <motion.div
            className="absolute inset-0 bg-no-repeat"
            style={{
              backgroundImage: `url(${coverImage})`,
              backgroundSize:
                settings.heroImageFit === 'fill'
                  ? '100% 100%'
                  : settings.heroImageFit === 'contain'
                  ? 'contain'
                  : settings.heroImageFit === 'original'
                  ? 'auto'
                  : 'cover',
              backgroundPosition:
                settings.heroImagePosition === 'top'
                  ? 'center top'
                  : settings.heroImagePosition === 'bottom'
                  ? 'center bottom'
                  : 'center center',
              scale: heroBgScale,
            }}
          >
            {/* Customizable elegant dark vignette for typography readability */}
            {(() => {
              const alpha = (settings.heroOverlayOpacity !== undefined ? settings.heroOverlayOpacity : 50) / 100;
              return (
                <div
                  className="absolute inset-0 transition-opacity duration-300"
                  style={{
                    background: `linear-gradient(to bottom, rgba(0,0,0,${Math.min(0.95, alpha * 1.15)}) 0%, rgba(0,0,0,${alpha * 0.75}) 50%, rgba(0,0,0,${Math.min(0.98, alpha * 1.45)}) 100%)`,
                  }}
                />
              );
            })()}
          </motion.div>
          
          {/* Subtle floating flower petals */}
          <AnimatedFloatingPetals count={14} />
        </motion.div>

        {/* Foreground Hero Content: Sharp at 0 scroll, dissolves with soft blur & upward drift on scroll */}
        <motion.div
          style={{
            opacity: heroContentOpacity,
            y: heroContentY,
            filter: heroContentBlur,
          }}
          className="relative z-10 w-full h-full flex flex-col justify-between items-center will-change-[opacity,filter,transform] pt-6 sm:pt-10 pb-16"
        >
            {/* Top Area: Optional Motive or Spacing */}
            <div className="min-h-4">
              {settings.heroShowIcon && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.8 }}
                  className="mb-1"
                >
                  {settings.cardStyle === 'romantic-floral' ? (
                    <AnimatedTwinSwans className="w-14 h-12 mx-auto" />
                  ) : settings.cardStyle === 'boho-chic' ? (
                    <AnimatedBohoSunMandala className="w-12 h-12 mx-auto" />
                  ) : settings.cardStyle === 'dark-luxury' ? (
                    <AnimatedConstellationDivider className="w-40 h-8 mx-auto" color="#C5A059" />
                  ) : settings.cardStyle === 'watercolor-garden' ? (
                    <AnimatedWatercolorBranchDivider className="w-40 h-8 mx-auto" color="#FFF" />
                  ) : (
                    <AnimatedWeddingRings className="w-14 h-10 mx-auto" />
                  )}
                </motion.div>
              )}
            </div>

            {/* Center Hero Information: Minimal by default as requested */}
            <div className="max-w-4xl mx-auto my-auto px-4 text-center text-white flex flex-col items-center justify-center">
              {/* 1. Date at top: e.g. dd.mm.aaaa */}
              <motion.p
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: 0.1 }}
                className="text-base sm:text-2xl md:text-3xl tracking-[0.25em] uppercase text-stone-200 drop-shadow-md font-serif font-medium select-none"
              >
                {formatHeroDate(
                  settings.eventDate,
                  settings.heroDateFormat || 'dd.mm.aaaa',
                  settings.heroCustomDateText
                )}
              </motion.p>

              {/* 2. Couple Names underneath the date */}
              <motion.h1
                initial={{ opacity: 0, scale: 0.94 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.9, delay: 0.2 }}
                className={`text-4xl sm:text-6xl md:text-7xl lg:text-8xl italic tracking-tight text-white drop-shadow-2xl my-3 sm:my-5 font-normal leading-tight ${theme.fontDisplay}`}
              >
                {settings.coupleNames || 'Sofía & Alejandro'}
              </motion.h1>

              {/* 3. Special Phrase with Large Opening & Closing Quotes, and Biblical Verse underneath */}
              <motion.div
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.9, delay: 0.35 }}
                className="max-w-2xl mx-auto flex flex-col items-center mt-1 sm:mt-2"
              >
                {/* Large Opening Quotation Mark */}
                <span className="text-4xl sm:text-6xl md:text-7xl font-serif text-amber-200/90 leading-none select-none font-display mb-0.5 opacity-90 drop-shadow">
                  “
                </span>

                {/* Special Phrase */}
                <p className="text-base sm:text-xl md:text-2xl font-serif italic text-white/95 leading-relaxed drop-shadow-md text-center max-w-xl px-2">
                  {settings.heroQuote !== undefined && settings.heroQuote !== ''
                    ? settings.heroQuote
                    : 'El amor todo lo sufre, todo lo cree, todo lo espera, todo lo soporta.'}
                </p>

                {/* Large Closing Quotation Mark */}
                <span className="text-4xl sm:text-6xl md:text-7xl font-serif text-amber-200/90 leading-none select-none font-display mt-0.5 opacity-90 drop-shadow">
                  ”
                </span>

                {/* Biblical Verse / Author Reference (Underneath closing quotes) */}
                {(settings.heroVerse !== undefined ? settings.heroVerse : '1 Corintios 13:7') && (
                  <p className="text-xs sm:text-sm md:text-base font-sans tracking-[0.25em] uppercase font-semibold text-amber-200/90 mt-2 sm:mt-3 drop-shadow">
                    {settings.heroVerse !== undefined ? settings.heroVerse : '1 Corintios 13:7'}
                  </p>
                )}
              </motion.div>

              {/* Optional Guest Personalization Pill (if enabled) */}
              {settings.heroShowGuestPill && guest && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.8, delay: 0.5 }}
                  className="inline-flex flex-col items-center bg-black/50 backdrop-blur-md px-5 py-2 rounded-2xl border border-amber-300/40 shadow-xl mt-4"
                >
                  <span className="text-[10px] uppercase tracking-widest text-amber-300 font-semibold">
                    Invitación Personal
                  </span>
                  <span className="text-sm sm:text-base font-serif font-bold text-white">
                    {guest.fullName}
                  </span>
                  <span className="text-[11px] text-stone-300">
                    {guest.allocatedPasses === 1 ? '1 pase reservado' : `${guest.allocatedPasses} pases reservados`}
                  </span>
                </motion.div>
              )}

              {/* Optional Live Countdown Timer (if enabled in settings) */}
              {settings.heroShowCountdown && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.8, delay: 0.6 }}
                  className="grid grid-cols-4 gap-2 sm:gap-4 max-w-sm sm:max-w-md mx-auto mt-6"
                >
                  {[
                    { label: 'Días', value: timeLeft.days },
                    { label: 'Horas', value: timeLeft.hours },
                    { label: 'Min', value: timeLeft.minutes },
                    { label: 'Seg', value: timeLeft.seconds },
                  ].map((item, i) => (
                    <div
                      key={i}
                      className="bg-black/40 backdrop-blur-md rounded-2xl p-2 sm:p-3 border border-white/20 shadow-lg flex flex-col items-center"
                    >
                      <span className="text-xl sm:text-3xl font-serif font-bold text-white font-mono leading-none">
                        {String(item.value).padStart(2, '0')}
                      </span>
                      <span className="text-[9px] sm:text-[10px] uppercase tracking-wider text-amber-200/90 mt-1">
                        {item.label}
                      </span>
                    </div>
                  ))}
                </motion.div>
              )}

              {/* Optional Direct RSVP Buttons (if enabled in settings) */}
              {settings.heroShowRsvpButton && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.8, delay: 0.7 }}
                  className="flex flex-wrap items-center justify-center gap-3 mt-6"
                >
                  <button
                    onClick={onOpenRsvp}
                    className="px-6 sm:px-8 py-3 rounded-full bg-gradient-to-r from-amber-600 via-amber-500 to-amber-700 text-white font-serif font-semibold text-xs sm:text-sm tracking-wider uppercase shadow-xl hover:brightness-110 transition-all cursor-pointer flex items-center gap-2"
                    id="hero-rsvp-btn"
                  >
                    <Heart className="w-4 h-4 fill-white shrink-0" />
                    <span>Confirmar Asistencia</span>
                  </button>

                  <a
                    href={googleCalendarUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="px-5 py-3 rounded-full bg-white/20 hover:bg-white/30 text-white backdrop-blur-md border border-white/40 font-medium text-xs sm:text-sm shadow-md transition-all cursor-pointer flex items-center gap-2"
                  >
                    <CalendarPlus className="w-4 h-4 text-amber-300 shrink-0" />
                    <span>Agendar</span>
                  </a>
                </motion.div>
              )}
            </div>

            {/* Bottom Scroll Prompt */}
            <motion.div
              animate={{ y: [0, 6, 0] }}
              transition={{ repeat: Infinity, duration: 2 }}
              onClick={scrollToContent}
              className="cursor-pointer flex flex-col items-center gap-1 text-stone-300 hover:text-white transition-colors pb-3 select-none"
            >
              <span className="text-[10px] uppercase tracking-[0.25em] font-medium">Ver Invitación</span>
              <ChevronDown className="w-4 h-4 text-amber-200/90" />
            </motion.div>
          </motion.div>

      </div>

      {/* 2. INVITATION DETAILS SECTION - Seamless Continuous Page */}
      <section
        id="detalles-boda"
        className="relative z-10 w-full pt-24 sm:pt-32 md:pt-40 pb-10 sm:pb-14 px-4 sm:px-8 md:px-12 lg:px-16"
        style={{ backgroundColor: theme.bgHex }}
      >
        {/* FIXDATE-STYLE ANIMATED WAVE TRANSITION DIVIDER (Half in Hero, Half in Details Section) */}
        <div className="absolute left-0 right-0 -top-16 sm:-top-22 md:-top-28 lg:-top-32 pointer-events-none w-full leading-none overflow-hidden z-20">
          <FixDateAnimatedTransitionDivider
            fillColor={theme.bgHex}
            accentColor={theme.accentColorHex}
            cardStyle={settings.cardStyle}
          />
        </div>
        <div className="max-w-6xl mx-auto text-center">
          
          {/* Section Header: Story & Quote Banner */}
          <div className="mb-8 sm:mb-10 flex flex-col items-center">
            {/* Large Animated Wedding Rings SVG with Converging Rings Effect */}
            <motion.div
              initial={{ opacity: 0, scale: 0.85 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8 }}
              className="mb-4 sm:mb-6 mt-2 overflow-visible"
            >
              <AnimatedWeddingRings className="w-32 h-20 sm:w-40 sm:h-24 md:w-52 md:h-32 mx-auto" />
            </motion.div>

            <div className={`inline-flex items-center gap-2 px-4 py-1.5 rounded-full border mb-4 ${theme.accentClass}`}>
              <Sparkles className="w-3.5 h-3.5" />
              <span className="text-[11px] uppercase tracking-[0.3em] font-semibold">
                Nuestra Boda
              </span>
            </div>

            <h2 className={`text-2xl sm:text-4xl md:text-5xl italic leading-tight max-w-4xl mx-auto font-normal ${theme.textPrimaryClass} ${theme.fontDisplay}`}>
              "{settings.welcomeMessage || '¡Nos casamos! Nos hace inmensa ilusión celebrar nuestro amor'}"
            </h2>
            
            <StyleSpecificDivider
              cardStyle={settings.cardStyle}
              className="w-56 sm:w-72 h-10 mx-auto mt-6"
              color={theme.accentColorHex}
            />
            
            <p className={`text-sm sm:text-base font-serif max-w-2xl mx-auto mt-3 leading-relaxed ${isDark ? 'text-stone-300' : 'text-stone-600'}`}>
              {settings.welcomeSubtitle || 'Nos emociona compartir este día tan especial contigo. Aquí encontrarás todos los detalles y ubicaciones de nuestra celebración.'}
            </p>
          </div>

          {/* Locations: Ceremonia & Fiesta Cards (Theme-aware styling) */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 text-left my-6">
            
            {/* Ceremony Card */}
            <div className={`rounded-3xl p-8 sm:p-10 transition-all flex flex-col justify-between group hover:shadow-lg ${theme.cardBgClass}`}>
              <div>
                <div className={`w-14 h-14 rounded-2xl flex items-center justify-center mb-5 border group-hover:scale-105 transition-transform ${theme.accentClass}`}>
                  <AnimatedChurchBells className="w-10 h-10" color={theme.accentColorHex} />
                </div>
                <span className="text-xs uppercase tracking-widest font-semibold block mb-1 opacity-80" style={{ color: theme.accentColorHex }}>
                  Momento Sagrado
                </span>
                <h3 className={`text-2xl sm:text-3xl font-semibold mb-2 ${theme.textPrimaryClass} ${theme.fontDisplay}`}>
                  Ceremonia Religiosa
                </h3>
                <p className={`text-base sm:text-lg font-medium ${isDark ? 'text-stone-100' : 'text-stone-900'}`}>{settings.ceremonyVenue}</p>
                <p className={`text-xs sm:text-sm mt-2 flex items-start gap-2 ${isDark ? 'text-stone-400' : 'text-stone-600'}`}>
                  <MapPin className="w-4 h-4 shrink-0 mt-0.5" style={{ color: theme.accentColorHex }} />
                  <span>{settings.ceremonyAddress}</span>
                </p>
              </div>

              <div className="mt-8 pt-5 border-t border-stone-200/40 dark:border-stone-700/40 flex items-center justify-between">
                <span className={`text-xs sm:text-sm font-mono font-bold px-4 py-1.5 rounded-full border ${theme.accentClass}`}>
                  {settings.ceremonyTime || '17:00'} hrs
                </span>
                {settings.ceremonyMapsUrl && (
                  <a
                    href={settings.ceremonyMapsUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-xs sm:text-sm font-semibold flex items-center gap-1.5 hover:underline"
                    style={{ color: theme.accentColorHex }}
                  >
                    <Compass className="w-4 h-4 shrink-0" />
                    <span>Cómo llegar</span>
                  </a>
                )}
              </div>
            </div>

            {/* Reception Card */}
            <div className={`rounded-3xl p-8 sm:p-10 transition-all flex flex-col justify-between group hover:shadow-lg ${theme.cardBgClass}`}>
              <div>
                <div className="w-14 h-14 rounded-2xl bg-amber-500/10 text-amber-700 flex items-center justify-center mb-5 border border-amber-200/50 group-hover:scale-105 transition-transform">
                  <AnimatedChampagneGlasses className="w-10 h-10" />
                </div>
                <span className="text-xs uppercase tracking-widest text-amber-700 font-semibold block mb-1">
                  Celebración & Fiesta
                </span>
                <h3 className={`text-2xl sm:text-3xl font-semibold mb-2 ${theme.textPrimaryClass} ${theme.fontDisplay}`}>
                  Recepción & Brindis
                </h3>
                <p className={`text-base sm:text-lg font-medium ${isDark ? 'text-stone-100' : 'text-stone-900'}`}>{settings.receptionVenue}</p>
                <p className={`text-xs sm:text-sm mt-2 flex items-start gap-2 ${isDark ? 'text-stone-400' : 'text-stone-600'}`}>
                  <MapPin className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                  <span>{settings.receptionAddress}</span>
                </p>
              </div>

              <div className="mt-8 pt-5 border-t border-stone-200/40 dark:border-stone-700/40 flex items-center justify-between">
                <span className="text-xs sm:text-sm font-mono font-bold text-amber-900 bg-amber-50 px-4 py-1.5 rounded-full border border-amber-200/70">
                  {settings.receptionTime || '19:30'} hrs
                </span>
                {settings.receptionMapsUrl && (
                  <a
                    href={settings.receptionMapsUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-xs sm:text-sm font-semibold text-amber-700 hover:text-amber-900 flex items-center gap-1.5 hover:underline"
                  >
                    <Compass className="w-4 h-4 text-amber-600 shrink-0" />
                    <span>Cómo llegar</span>
                  </a>
                )}
              </div>
            </div>
          </div>

          {/* Dress Code Callout */}
          <div className={`rounded-3xl p-8 max-w-2xl mx-auto my-10 text-center shadow-sm ${theme.cardBgClass}`}>
            <span className="text-xs uppercase tracking-[0.25em] font-semibold block mb-1" style={{ color: theme.accentColorHex }}>
              Código de Vestimenta
            </span>
            <p className={`text-xl font-bold ${theme.textPrimaryClass} ${theme.fontDisplay}`}>
              {settings.dressCode}
            </p>
            {settings.dressCodeDescription && (
              <p className={`text-xs sm:text-sm mt-1.5 italic ${isDark ? 'text-stone-400' : 'text-stone-600'}`}>
                "{settings.dressCodeDescription}"
              </p>
            )}
            <p className="text-xs text-amber-700 font-medium mt-3">
              Confirmar asistencia antes del <strong>{settings.rsvpDeadline}</strong>
            </p>
          </div>
        </div>
      </section>
    </div>
  );
};


