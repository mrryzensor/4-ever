import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence, useScroll, useTransform } from 'motion/react';
import {
  MapPin,
  Heart,
  ChevronDown,
  CalendarPlus,
  Compass,
  Sparkles,
  Navigation,
  Shirt,
  Palette,
  CreditCard,
  Clock,
  X,
  ExternalLink,
} from 'lucide-react';
import { WeddingSettings, Guest } from '../types.ts';
import { CARD_THEMES } from '../lib/themes.ts';
import { formatHeroDate } from '../lib/dateFormatters.ts';
import {
  AnimatedFloatingPetals,
  AnimatedWeddingRings,
  AnimatedChurchBells,
  AnimatedChampagneGlasses,
  AnimatedGiftBox,
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

  // State for inline details modal in Section 2 (Ceremonia, Recepcion, Dresscode, Gifts, Itinerary)
  const [activeDetailsModal, setActiveDetailsModal] = useState<'ceremony' | 'reception' | 'dresscode' | 'gifts' | 'itinerary' | null>(null);
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  const handleCopy = (text: string, key: string) => {
    if (!text) return;
    navigator.clipboard.writeText(text);
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(null), 2000);
  };

  const getMapsSearchUrl = (venue: string, address: string, customUrl?: string) => {
    if (customUrl && customUrl.trim() !== '') return customUrl;
    const query = encodeURIComponent(`${venue} ${address}`.trim());
    return `https://www.google.com/maps/search/?api=1&query=${query}`;
  };

  const getWazeUrl = (venue: string, address: string) => {
    const query = encodeURIComponent(`${venue} ${address}`.trim());
    return `https://waze.com/ul?q=${query}&navigate=yes`;
  };

  const getEmbedUrl = (venue: string, address: string, customEmbed?: string) => {
    if (customEmbed && customEmbed.trim() !== '') return customEmbed;
    const query = encodeURIComponent(`${venue} ${address}`.trim());
    return `https://maps.google.com/maps?q=${query}&t=&z=15&ie=UTF8&iwloc=&output=embed`;
  };

  let itineraryList: { time: string; title: string; description?: string }[] = [];
  try {
    itineraryList = JSON.parse(settings.itinerary || '[]');
  } catch {
    itineraryList = [];
  }

  let registryItems: { type?: string; storeName?: string; title?: string; description?: string; url?: string }[] = [];
  try {
    registryItems = JSON.parse(settings.giftRegistry || '[]');
  } catch {
    registryItems = [];
  }

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

      {/* 2. FUSED INVITATION DETAILS SECTION - Interactive Inline Cards Hub */}
      <section
        id="detalles-boda"
        className="relative z-10 w-full pt-16 sm:pt-20 md:pt-28 lg:pt-32 pb-16 sm:pb-24 px-4 sm:px-8 md:px-12 lg:px-16"
        style={{ backgroundColor: theme.bgHex }}
      >
        {/* FIXDATE-STYLE ANIMATED WAVE TRANSITION DIVIDER (Half in Hero, Half in Details Section) */}
        <div className="absolute left-0 right-0 -top-16 sm:-top-22 md:-top-28 lg:-top-32 pointer-events-none w-full leading-none overflow-hidden z-0">
          <FixDateAnimatedTransitionDivider
            fillColor={theme.bgHex}
            accentColor={theme.accentColorHex}
            cardStyle={settings.cardStyle}
          />
        </div>

        <div className="relative z-10 max-w-6xl mx-auto text-center overflow-visible">
          
          {/* Section Header: Story & Quote Banner */}
          <div className="mb-8 sm:mb-12 flex flex-col items-center overflow-visible">
            {/* Large Animated Wedding Rings SVG */}
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
              className="mb-4 sm:mb-5 overflow-visible"
            >
              <AnimatedWeddingRings className="w-32 h-20 sm:w-40 sm:h-24 md:w-48 md:h-28 mx-auto" />
            </motion.div>

            <div className={`inline-flex items-center gap-2 px-5 py-2 rounded-full border mb-4 shadow-2xs ${theme.accentClass}`}>
              <Sparkles className="w-3.5 h-3.5" />
              <span className="text-xs uppercase tracking-[0.25em] font-semibold font-serif">
                Boda de {settings.coupleNames || 'Sofía & Alejandro'}
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
              {settings.welcomeSubtitle || 'Nos emociona compartir este día tan especial contigo. Toca cada tarjeta para explorar los detalles completos sin salir de esta sección.'}
            </p>
          </div>

          {/* Fused Interactive 4-Cards Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 sm:gap-8 text-left my-6">
            
            {/* CARD 1: CEREMONIA RELIGIOSA / CIVIL */}
            <div
              className={`rounded-3xl p-7 sm:p-9 transition-all flex flex-col justify-between border shadow-sm hover:shadow-xl relative overflow-hidden group cursor-pointer ${
                activeDetailsModal === 'ceremony' ? 'ring-2 ring-amber-400 scale-[1.01]' : ''
              } ${theme.cardBgClass}`}
              onClick={() => setActiveDetailsModal(activeDetailsModal === 'ceremony' ? null : 'ceremony')}
            >
              <div>
                <div className="flex items-center justify-between mb-4">
                  <div className={`w-14 h-14 rounded-2xl flex items-center justify-center border group-hover:scale-105 transition-transform ${theme.accentClass}`}>
                    <AnimatedChurchBells className="w-10 h-10" color={theme.accentColorHex} />
                  </div>
                  <span className={`text-xs font-mono font-bold px-3.5 py-1.5 rounded-full border ${theme.accentClass}`}>
                    {settings.ceremonyTime || '17:00'} hrs
                  </span>
                </div>

                <span className="text-xs uppercase tracking-widest font-semibold block mb-1 opacity-80" style={{ color: theme.accentColorHex }}>
                  Momento Sagrado
                </span>
                <h3 className={`text-2xl sm:text-3xl font-semibold mb-2 ${theme.textPrimaryClass} ${theme.fontDisplay}`}>
                  Ceremonia Religiosa
                </h3>
                <p className={`text-base sm:text-lg font-medium ${isDark ? 'text-stone-100' : 'text-stone-900'}`}>
                  {settings.ceremonyVenue || 'Parroquia Principal'}
                </p>
                <p className={`text-xs sm:text-sm mt-2 flex items-start gap-2 ${isDark ? 'text-stone-400' : 'text-stone-600'}`}>
                  <MapPin className="w-4 h-4 shrink-0 mt-0.5" style={{ color: theme.accentColorHex }} />
                  <span>{settings.ceremonyAddress || 'Dirección de la ceremonia'}</span>
                </p>
              </div>

              <div className="mt-8 pt-5 border-t border-stone-200/40 dark:border-stone-700/40 flex items-center justify-between">
                <button
                  type="button"
                  className={`inline-flex items-center gap-2 text-xs sm:text-sm font-semibold transition-colors cursor-pointer hover:underline`}
                  style={{ color: theme.accentColorHex }}
                >
                  <Navigation className="w-4 h-4 shrink-0" />
                  <span>{activeDetailsModal === 'ceremony' ? 'Ocultar detalles' : 'Ver mapa y cómo llegar'}</span>
                  <ChevronDown className={`w-3.5 h-3.5 transition-transform ${activeDetailsModal === 'ceremony' ? 'rotate-180' : ''}`} />
                </button>
              </div>
            </div>

            {/* CARD 2: RECEPCIÓN & BANQUETE */}
            <div
              className={`rounded-3xl p-7 sm:p-9 transition-all flex flex-col justify-between border shadow-sm hover:shadow-xl relative overflow-hidden group cursor-pointer ${
                activeDetailsModal === 'reception' ? 'ring-2 ring-amber-400 scale-[1.01]' : ''
              } ${theme.cardBgClass}`}
              onClick={() => setActiveDetailsModal(activeDetailsModal === 'reception' ? null : 'reception')}
            >
              <div>
                <div className="flex items-center justify-between mb-4">
                  <div className="w-14 h-14 rounded-2xl bg-amber-500/10 text-amber-700 flex items-center justify-center border border-amber-200/50 group-hover:scale-105 transition-transform">
                    <AnimatedChampagneGlasses className="w-10 h-10" />
                  </div>
                  <span className="text-xs font-mono font-bold text-amber-900 bg-amber-50 px-3.5 py-1.5 rounded-full border border-amber-200/70">
                    {settings.receptionTime || '19:30'} hrs
                  </span>
                </div>

                <span className="text-xs uppercase tracking-widest text-amber-700 font-semibold block mb-1">
                  Celebración & Fiesta
                </span>
                <h3 className={`text-2xl sm:text-3xl font-semibold mb-2 ${theme.textPrimaryClass} ${theme.fontDisplay}`}>
                  Recepción & Banquete
                </h3>
                <p className={`text-base sm:text-lg font-medium ${isDark ? 'text-stone-100' : 'text-stone-900'}`}>
                  {settings.receptionVenue || 'Hacienda / Salón de Eventos'}
                </p>
                <p className={`text-xs sm:text-sm mt-2 flex items-start gap-2 ${isDark ? 'text-stone-400' : 'text-stone-600'}`}>
                  <MapPin className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                  <span>{settings.receptionAddress || 'Dirección de la recepción'}</span>
                </p>
              </div>

              <div className="mt-8 pt-5 border-t border-stone-200/40 dark:border-stone-700/40 flex items-center justify-between">
                <button
                  type="button"
                  className="inline-flex items-center gap-2 text-xs sm:text-sm font-semibold text-amber-700 hover:text-amber-900 transition-colors cursor-pointer hover:underline"
                >
                  <Navigation className="w-4 h-4 text-amber-600 shrink-0" />
                  <span>{activeDetailsModal === 'reception' ? 'Ocultar detalles' : 'Ver mapa y cómo llegar'}</span>
                  <ChevronDown className={`w-3.5 h-3.5 transition-transform ${activeDetailsModal === 'reception' ? 'rotate-180' : ''}`} />
                </button>
              </div>
            </div>

            {/* CARD 3: CÓDIGO DE VESTIMENTA (DRESS CODE) */}
            {settings.showDressCode !== false && (
              <div
                className={`rounded-3xl p-7 sm:p-9 transition-all flex flex-col justify-between border shadow-sm hover:shadow-xl relative overflow-hidden group cursor-pointer ${
                  activeDetailsModal === 'dresscode' ? 'ring-2 ring-amber-400 scale-[1.01]' : ''
                } ${theme.cardBgClass}`}
                onClick={() => setActiveDetailsModal(activeDetailsModal === 'dresscode' ? null : 'dresscode')}
              >
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <div className={`w-14 h-14 rounded-2xl flex items-center justify-center border group-hover:scale-105 transition-transform ${theme.accentClass}`}>
                      <Shirt className="w-7 h-7" style={{ color: theme.accentColorHex }} />
                    </div>
                    <span className={`text-xs uppercase font-serif font-bold tracking-wider px-3.5 py-1.5 rounded-full border ${theme.accentClass}`}>
                      {settings.dressCode || 'Formal / Elegante'}
                    </span>
                  </div>

                  <span className="text-xs uppercase tracking-widest font-semibold block mb-1 opacity-80" style={{ color: theme.accentColorHex }}>
                    Etiqueta & Estilo
                  </span>
                  <h3 className={`text-2xl sm:text-3xl font-semibold mb-2 ${theme.textPrimaryClass} ${theme.fontDisplay}`}>
                    Código de Vestimenta
                  </h3>
                  <p className={`text-sm sm:text-base font-serif italic line-clamp-2 ${isDark ? 'text-stone-300' : 'text-stone-600'}`}>
                    "{settings.dressCodeDescription || 'Agradecemos asistir con atuendo acorde a la ocasión y paleta de colores.'}"
                  </p>
                </div>

                <div className="mt-8 pt-5 border-t border-stone-200/40 dark:border-stone-700/40 flex items-center justify-between">
                  <button
                    type="button"
                    className="inline-flex items-center gap-2 text-xs sm:text-sm font-semibold transition-colors cursor-pointer hover:underline"
                    style={{ color: theme.accentColorHex }}
                  >
                    <Palette className="w-4 h-4 shrink-0" />
                    <span>{activeDetailsModal === 'dresscode' ? 'Ocultar guía' : 'Ver guía de colores y outfits'}</span>
                    <ChevronDown className={`w-3.5 h-3.5 transition-transform ${activeDetailsModal === 'dresscode' ? 'rotate-180' : ''}`} />
                  </button>
                </div>
              </div>
            )}

            {/* CARD 4: MESA DE REGALOS & CUENTAS */}
            {settings.showGiftRegistry !== false && (
              <div
                className={`rounded-3xl p-7 sm:p-9 transition-all flex flex-col justify-between border shadow-sm hover:shadow-xl relative overflow-hidden group cursor-pointer ${
                  activeDetailsModal === 'gifts' ? 'ring-2 ring-amber-400 scale-[1.01]' : ''
                } ${theme.cardBgClass}`}
                onClick={() => setActiveDetailsModal(activeDetailsModal === 'gifts' ? null : 'gifts')}
              >
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <div className="w-14 h-14 rounded-2xl bg-rose-500/10 text-rose-600 flex items-center justify-center border border-rose-200/50 group-hover:scale-105 transition-transform">
                      <AnimatedGiftBox className="w-9 h-9" />
                    </div>
                    <span className="text-xs font-serif font-bold text-rose-700 bg-rose-50 px-3.5 py-1.5 rounded-full border border-rose-200/70">
                      Mesa de Regalos
                    </span>
                  </div>

                  <span className="text-xs uppercase tracking-widest text-rose-600 font-semibold block mb-1">
                    Muestras de Cariño
                  </span>
                  <h3 className={`text-2xl sm:text-3xl font-semibold mb-2 ${theme.textPrimaryClass} ${theme.fontDisplay}`}>
                    Regalos & Cuentas
                  </h3>
                  <p className={`text-sm sm:text-base font-serif italic line-clamp-2 ${isDark ? 'text-stone-300' : 'text-stone-600'}`}>
                    "{settings.giftRegistryMessage || 'Tu presencia es nuestro mejor regalo. Si deseas tener un detalle, aquí te compartimos nuestras opciones.'}"
                  </p>
                </div>

                <div className="mt-8 pt-5 border-t border-stone-200/40 dark:border-stone-700/40 flex items-center justify-between">
                  <button
                    type="button"
                    className="inline-flex items-center gap-2 text-xs sm:text-sm font-semibold text-rose-700 hover:text-rose-900 transition-colors cursor-pointer hover:underline"
                  >
                    <CreditCard className="w-4 h-4 text-rose-600 shrink-0" />
                    <span>{activeDetailsModal === 'gifts' ? 'Ocultar cuentas' : 'Ver cuentas bancarias y tiendas'}</span>
                    <ChevronDown className={`w-3.5 h-3.5 transition-transform ${activeDetailsModal === 'gifts' ? 'rotate-180' : ''}`} />
                  </button>
                </div>
              </div>
            )}

            {/* CARD 5: ITINERARIO COMPLETO (Si está activo) */}
            {settings.showItinerary !== false && (
              <div
                className={`md:col-span-2 rounded-3xl p-7 sm:p-9 transition-all flex flex-col justify-between border shadow-sm hover:shadow-xl relative overflow-hidden group cursor-pointer ${
                  activeDetailsModal === 'itinerary' ? 'ring-2 ring-amber-400 scale-[1.01]' : ''
                } ${theme.cardBgClass}`}
                onClick={() => setActiveDetailsModal(activeDetailsModal === 'itinerary' ? null : 'itinerary')}
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div className="flex items-center gap-4">
                    <div className={`w-14 h-14 rounded-2xl flex items-center justify-center shrink-0 border group-hover:scale-105 transition-transform ${theme.accentClass}`}>
                      <Clock className="w-7 h-7" style={{ color: theme.accentColorHex }} />
                    </div>
                    <div>
                      <span className="text-xs uppercase tracking-widest font-semibold block mb-0.5 opacity-80" style={{ color: theme.accentColorHex }}>
                        Cronograma del Evento
                      </span>
                      <h3 className={`text-2xl sm:text-3xl font-semibold ${theme.textPrimaryClass} ${theme.fontDisplay}`}>
                        Itinerario de la Boda
                      </h3>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 flex-wrap">
                    {itineraryList.slice(0, 3).map((item, idx) => (
                      <span key={idx} className={`px-3 py-1 rounded-full text-xs font-mono font-medium border ${theme.accentClass}`}>
                        {item.time} {item.title}
                      </span>
                    ))}
                  </div>
                </div>

                <div className="mt-6 pt-4 border-t border-stone-200/40 dark:border-stone-700/40 flex items-center justify-between">
                  <span className={`text-xs font-serif italic ${isDark ? 'text-stone-400' : 'text-stone-600'}`}>
                    Conoce el horario de cada momento especial
                  </span>
                  <button
                    type="button"
                    className="inline-flex items-center gap-1.5 text-xs sm:text-sm font-semibold transition-colors cursor-pointer hover:underline"
                    style={{ color: theme.accentColorHex }}
                  >
                    <span>{activeDetailsModal === 'itinerary' ? 'Ocultar cronograma' : 'Ver itinerario detallado'}</span>
                    <ChevronDown className={`w-3.5 h-3.5 transition-transform ${activeDetailsModal === 'itinerary' ? 'rotate-180' : ''}`} />
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* ========================================================================= */}
          {/* INLINE EXPANDED DETAILS CONTAINER (Stays in Section 2, No Scroll jumping) */}
          {/* ========================================================================= */}
          <AnimatePresence>
            {activeDetailsModal && (
              <motion.div
                initial={{ opacity: 0, y: 20, height: 0 }}
                animate={{ opacity: 1, y: 0, height: 'auto' }}
                exit={{ opacity: 0, y: 20, height: 0 }}
                transition={{ duration: 0.35, ease: 'easeInOut' }}
                className="overflow-hidden mt-8 text-left"
              >
                <div className={`p-6 sm:p-10 rounded-3xl border-2 shadow-2xl relative ${
                  isDark ? 'bg-stone-900/95 border-[#C5A059]/60 text-stone-100' : 'bg-white/98 border-[#5A5A40]/40 text-stone-900'
                }`}>
                  {/* Close Inline Details button */}
                  <button
                    type="button"
                    onClick={() => setActiveDetailsModal(null)}
                    className="absolute top-5 right-5 p-2 rounded-full bg-stone-200 dark:bg-stone-800 text-stone-600 dark:text-stone-300 hover:scale-105 transition-all cursor-pointer"
                    title="Cerrar detalles"
                  >
                    <X className="w-5 h-5" />
                  </button>

                  {/* 1. CEREMONIA DETALLES & MAPAS */}
                  {activeDetailsModal === 'ceremony' && (
                    <div className="space-y-6">
                      <div className="flex items-center gap-3 border-b pb-4 border-stone-200 dark:border-stone-800">
                        <div className={`w-12 h-12 rounded-2xl flex items-center justify-center border ${theme.accentClass}`}>
                          <AnimatedChurchBells className="w-8 h-8" color={theme.accentColorHex} />
                        </div>
                        <div>
                          <span className="text-xs uppercase tracking-widest font-mono font-bold text-amber-500">
                            Paso 1 • Ceremonia Religiosa
                          </span>
                          <h4 className="text-2xl font-serif font-bold text-stone-900 dark:text-stone-100">
                            {settings.ceremonyVenue || 'Parroquia Principal'}
                          </h4>
                        </div>
                      </div>

                      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                        <div className="space-y-4">
                          <p className="text-sm text-stone-600 dark:text-stone-300 flex items-start gap-2">
                            <MapPin className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                            <span>{settings.ceremonyAddress || 'Dirección completa de la ceremonia'}</span>
                          </p>
                          <div className="flex items-center gap-2 text-sm font-mono font-semibold text-stone-800 dark:text-stone-200">
                            <Clock className="w-4 h-4 text-amber-500" />
                            <span>Hora: {settings.ceremonyTime || '17:00'} hrs</span>
                          </div>

                          {/* Quick Action Buttons */}
                          <div className="flex flex-wrap gap-2.5 pt-2">
                            <a
                              href={getMapsSearchUrl(settings.ceremonyVenue || 'Ceremonia', settings.ceremonyAddress || '', settings.ceremonyMapsUrl)}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="px-5 py-2.5 rounded-full bg-[#5A5A40] text-white text-xs font-bold uppercase tracking-wider flex items-center gap-2 hover:bg-[#484833] transition-all shadow-sm"
                            >
                              <Navigation className="w-4 h-4" />
                              <span>Abrir en Google Maps</span>
                            </a>
                            <a
                              href={getWazeUrl(settings.ceremonyVenue || 'Ceremonia', settings.ceremonyAddress || '')}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="px-5 py-2.5 rounded-full bg-stone-100 dark:bg-stone-800 text-stone-800 dark:text-stone-200 border border-stone-300 dark:border-stone-700 text-xs font-bold uppercase tracking-wider flex items-center gap-2 hover:bg-stone-200 transition-all"
                            >
                              <Compass className="w-4 h-4 text-amber-500" />
                              <span>Waze</span>
                            </a>
                          </div>
                        </div>

                        {/* Interactive Google Map iframe */}
                        <div className="w-full h-64 sm:h-72 rounded-2xl overflow-hidden border border-stone-300 dark:border-stone-700 shadow-inner">
                          <iframe
                            title="Mapa Ceremonia"
                            width="100%"
                            height="100%"
                            frameBorder="0"
                            src={getEmbedUrl(settings.ceremonyVenue || 'Ceremonia', settings.ceremonyAddress || '', settings.ceremonyEmbedUrl)}
                            loading="lazy"
                          />
                        </div>
                      </div>
                    </div>
                  )}

                  {/* 2. RECEPCIÓN DETALLES & MAPAS */}
                  {activeDetailsModal === 'reception' && (
                    <div className="space-y-6">
                      <div className="flex items-center gap-3 border-b pb-4 border-stone-200 dark:border-stone-800">
                        <div className="w-12 h-12 rounded-2xl bg-amber-500/10 text-amber-700 flex items-center justify-center border border-amber-300/50">
                          <AnimatedChampagneGlasses className="w-8 h-8" />
                        </div>
                        <div>
                          <span className="text-xs uppercase tracking-widest font-mono font-bold text-amber-600">
                            Paso 2 • Fiesta & Banquete
                          </span>
                          <h4 className="text-2xl font-serif font-bold text-stone-900 dark:text-stone-100">
                            {settings.receptionVenue || 'Hacienda / Salón de Eventos'}
                          </h4>
                        </div>
                      </div>

                      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                        <div className="space-y-4">
                          <p className="text-sm text-stone-600 dark:text-stone-300 flex items-start gap-2">
                            <MapPin className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                            <span>{settings.receptionAddress || 'Dirección completa de la recepción'}</span>
                          </p>
                          <div className="flex items-center gap-2 text-sm font-mono font-semibold text-stone-800 dark:text-stone-200">
                            <Clock className="w-4 h-4 text-amber-500" />
                            <span>Hora: {settings.receptionTime || '19:30'} hrs</span>
                          </div>

                          {/* Quick Action Buttons */}
                          <div className="flex flex-wrap gap-2.5 pt-2">
                            <a
                              href={getMapsSearchUrl(settings.receptionVenue || 'Recepción', settings.receptionAddress || '', settings.receptionMapsUrl)}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="px-5 py-2.5 rounded-full bg-[#5A5A40] text-white text-xs font-bold uppercase tracking-wider flex items-center gap-2 hover:bg-[#484833] transition-all shadow-sm"
                            >
                              <Navigation className="w-4 h-4" />
                              <span>Abrir en Google Maps</span>
                            </a>
                            <a
                              href={getWazeUrl(settings.receptionVenue || 'Recepción', settings.receptionAddress || '')}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="px-5 py-2.5 rounded-full bg-stone-100 dark:bg-stone-800 text-stone-800 dark:text-stone-200 border border-stone-300 dark:border-stone-700 text-xs font-bold uppercase tracking-wider flex items-center gap-2 hover:bg-stone-200 transition-all"
                            >
                              <Compass className="w-4 h-4 text-amber-500" />
                              <span>Waze</span>
                            </a>
                          </div>
                        </div>

                        {/* Interactive Google Map iframe */}
                        <div className="w-full h-64 sm:h-72 rounded-2xl overflow-hidden border border-stone-300 dark:border-stone-700 shadow-inner">
                          <iframe
                            title="Mapa Recepción"
                            width="100%"
                            height="100%"
                            frameBorder="0"
                            src={getEmbedUrl(settings.receptionVenue || 'Recepción', settings.receptionAddress || '', settings.receptionEmbedUrl)}
                            loading="lazy"
                          />
                        </div>
                      </div>
                    </div>
                  )}

                  {/* 3. DRESS CODE DETALLES */}
                  {activeDetailsModal === 'dresscode' && (
                    <div className="space-y-6">
                      <div className="flex items-center gap-3 border-b pb-4 border-stone-200 dark:border-stone-800">
                        <div className={`w-12 h-12 rounded-2xl flex items-center justify-center border ${theme.accentClass}`}>
                          <Shirt className="w-6 h-6" style={{ color: theme.accentColorHex }} />
                        </div>
                        <div>
                          <span className="text-xs uppercase tracking-widest font-mono font-bold text-amber-500">
                            Guía de Estilo & Colores
                          </span>
                          <h4 className="text-2xl font-serif font-bold text-stone-900 dark:text-stone-100">
                            {settings.dressCode || 'Formal / Elegante'}
                          </h4>
                        </div>
                      </div>

                      <p className="text-sm sm:text-base font-serif italic text-stone-700 dark:text-stone-300 leading-relaxed">
                        "{settings.dressCodeDescription || 'Agradecemos a todos nuestros invitados vestir de acuerdo a la ocasión para crear juntos recuerdos memorables e inolvidables.'}"
                      </p>

                      {/* Color Palette Display */}
                      {settings.dressCodeColors && (
                        <div className="pt-2">
                          <span className="text-xs uppercase tracking-widest font-bold block mb-3 text-stone-500">
                            Paleta sugerida de colores:
                          </span>
                          <div className="flex flex-wrap gap-3">
                            {settings.dressCodeColors.split(',').map((colorHex, idx) => (
                              <div key={idx} className="flex items-center gap-2 p-2 rounded-2xl bg-stone-100 dark:bg-stone-800 border border-stone-200 dark:border-stone-700">
                                <span className="w-8 h-8 rounded-full border shadow-sm" style={{ backgroundColor: colorHex.trim() }} />
                                <span className="text-xs font-mono font-semibold">{colorHex.trim()}</span>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  )}

                  {/* 4. MESA DE REGALOS & CUENTAS */}
                  {activeDetailsModal === 'gifts' && (
                    <div className="space-y-6">
                      <div className="flex items-center gap-3 border-b pb-4 border-stone-200 dark:border-stone-800">
                        <div className="w-12 h-12 rounded-2xl bg-rose-500/10 text-rose-600 flex items-center justify-center border border-rose-300/50">
                          <AnimatedGiftBox className="w-8 h-8" />
                        </div>
                        <div>
                          <span className="text-xs uppercase tracking-widest font-mono font-bold text-rose-600">
                            Mesa de Regalos & Cuentas Bancarias
                          </span>
                          <h4 className="text-2xl font-serif font-bold text-stone-900 dark:text-stone-100">
                            Opciones para acompañarnos con un detalle
                          </h4>
                        </div>
                      </div>

                      {settings.giftRegistryMessage && (
                        <p className="text-sm font-serif italic text-stone-700 dark:text-stone-300">
                          "{settings.giftRegistryMessage}"
                        </p>
                      )}

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
                        {/* Direct Bank Account */}
                        {settings.enableBankTransfer !== false && (settings.bankClabe || settings.bankAccountNumber || settings.bankName) && (
                          <div className="p-5 rounded-2xl bg-stone-100 dark:bg-stone-800 border border-stone-300 dark:border-stone-700 space-y-2">
                            <div className="flex items-center justify-between">
                              <span className="text-xs font-bold uppercase tracking-wider text-amber-600">
                                {settings.bankName || 'Transferencia Bancaria'}
                              </span>
                              <CreditCard className="w-4 h-4 text-stone-400" />
                            </div>
                            {settings.bankBeneficiary && (
                              <p className="text-xs text-stone-600 dark:text-stone-400">
                                Titular: <strong className="text-stone-900 dark:text-stone-100">{settings.bankBeneficiary}</strong>
                              </p>
                            )}
                            {settings.bankAccountNumber && (
                              <div className="flex items-center justify-between bg-white dark:bg-stone-900 p-2 rounded-xl text-xs font-mono">
                                <span>Cuenta: {settings.bankAccountNumber}</span>
                                <button
                                  type="button"
                                  onClick={() => handleCopy(settings.bankAccountNumber || '', 'acc')}
                                  className="text-[11px] text-amber-600 hover:underline cursor-pointer"
                                >
                                  {copiedKey === 'acc' ? '¡Copiado!' : 'Copiar'}
                                </button>
                              </div>
                            )}
                            {settings.bankClabe && (
                              <div className="flex items-center justify-between bg-white dark:bg-stone-900 p-2 rounded-xl text-xs font-mono">
                                <span>CLABE/CCI: {settings.bankClabe}</span>
                                <button
                                  type="button"
                                  onClick={() => handleCopy(settings.bankClabe || '', 'clabe')}
                                  className="text-[11px] text-amber-600 hover:underline cursor-pointer"
                                >
                                  {copiedKey === 'clabe' ? '¡Copiado!' : 'Copiar'}
                                </button>
                              </div>
                            )}
                          </div>
                        )}

                        {/* Registry Items */}
                        {registryItems.map((item, idx) => (
                          <div key={idx} className="p-5 rounded-2xl bg-stone-100 dark:bg-stone-800 border border-stone-300 dark:border-stone-700 space-y-3">
                            <div className="flex items-center justify-between">
                              <span className="text-xs font-bold uppercase tracking-wider text-stone-800 dark:text-stone-200">
                                {item.storeName || item.title || 'Mesa Online'}
                              </span>
                              <Sparkles className="w-4 h-4 text-amber-400" />
                            </div>
                            {item.description && (
                              <p className="text-xs text-stone-600 dark:text-stone-400">{item.description}</p>
                            )}
                            {item.url && (
                              <a
                                href={item.url}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-stone-900 text-white text-xs font-semibold hover:bg-stone-800 transition-all"
                              >
                                <span>Ver mesa en tienda</span>
                                <ExternalLink className="w-3.5 h-3.5" />
                              </a>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* 5. ITINERARIO DETALLADO */}
                  {activeDetailsModal === 'itinerary' && (
                    <div className="space-y-6">
                      <div className="flex items-center gap-3 border-b pb-4 border-stone-200 dark:border-stone-800">
                        <div className={`w-12 h-12 rounded-2xl flex items-center justify-center border ${theme.accentClass}`}>
                          <Clock className="w-6 h-6" style={{ color: theme.accentColorHex }} />
                        </div>
                        <div>
                          <span className="text-xs uppercase tracking-widest font-mono font-bold text-amber-500">
                            Cronograma Completo
                          </span>
                          <h4 className="text-2xl font-serif font-bold text-stone-900 dark:text-stone-100">
                            Itinerario de la Celebración
                          </h4>
                        </div>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                        {itineraryList.map((item, idx) => (
                          <div key={idx} className="p-4 rounded-2xl bg-stone-100 dark:bg-stone-800 border border-stone-300 dark:border-stone-700 flex items-start gap-3">
                            <span className="px-2.5 py-1 rounded-lg bg-amber-400/20 text-amber-700 dark:text-amber-300 font-mono text-xs font-bold shrink-0">
                              {item.time}
                            </span>
                            <div>
                              <h5 className="font-serif font-bold text-sm text-stone-900 dark:text-stone-100">{item.title}</h5>
                              {item.description && (
                                <p className="text-xs text-stone-600 dark:text-stone-400 mt-0.5">{item.description}</p>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* RSVP Deadline Banner & Direct Action */}
          <div className={`rounded-3xl p-6 sm:p-8 max-w-2xl mx-auto my-10 text-center border shadow-sm ${theme.cardBgClass}`}>
            <p className="text-xs text-amber-700 dark:text-amber-300 font-medium">
              Por favor confirmar asistencia antes del <strong>{settings.rsvpDeadline || '15 de Octubre de 2026'}</strong>
            </p>
            <div className="mt-4 flex justify-center">
              <button
                type="button"
                onClick={onOpenRsvp}
                className="px-8 py-3 rounded-full bg-gradient-to-r from-amber-500 to-amber-600 text-white font-serif font-bold text-xs sm:text-sm uppercase tracking-wider shadow-lg hover:scale-105 active:scale-95 transition-all cursor-pointer"
              >
                Confirmar Asistencia (RSVP)
              </button>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};
