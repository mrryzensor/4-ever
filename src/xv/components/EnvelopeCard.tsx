import React, { useState, useEffect, useRef, useMemo } from 'react';
import { motion, AnimatePresence, useScroll, useTransform } from 'motion/react';
import {
  MapPin,
  Heart,
  CalendarPlus,
  Compass,
  Sparkles,
  Clock,
  Shirt,
  Navigation,
  Car,
  ExternalLink,
  CreditCard,
  Mail,
  ChevronDown,
  Building2,
  Palette,
  Check,
  Church,
  GlassWater,
  Utensils,
  Music2,
  Moon,
  Lightbulb,
  Camera,
  Info,
  ShieldCheck,
  Footprints,
} from 'lucide-react';
import { WeddingSettings, Guest, ItineraryItem, GiftRegistryItem, WeddingTipItem } from '../../types.ts';
import { XV_CARD_THEMES as CARD_THEMES } from '../themes.ts';
import { formatHeroDate } from '../../lib/dateFormatters.ts';
import {
  AnimatedFloatingPetals,
  AnimatedWeddingRings,
  AnimatedChurchBells,
  AnimatedChampagneGlasses,
  AnimatedGiftBox,
  FixDateAnimatedTransitionDivider,
  StyleSpecificDivider,
  AnimatedTwinSwans,
  AnimatedBohoSunMandala,
  AnimatedConstellationDivider,
  AnimatedWatercolorBranchDivider,
  AnimatedRoyalCrownEmblem,
  AnimatedSunsetDesertEmblem,
  AnimatedLavenderButterflyEmblem,
  AnimatedMonsteraEmblem,
  AnimatedSeashellPearlEmblem,
  AnimatedArtDecoFanEmblem,
  CardOrnamentFrame,
  AnimatedQuinceaneraTiara,
  AnimatedGlassSlipper,
} from './AnimatedSvgs.tsx';
import { ManFashionMockup, WomanFashionMockup } from './DressCodeSection.tsx';

interface EnvelopeCardProps {
  settings: WeddingSettings;
  guest?: Guest | null;
  onOpenRsvp?: () => void;
}

export const EnvelopeCard: React.FC<EnvelopeCardProps> = ({
  settings,
  guest,
  onOpenRsvp,
}) => {
  const heroContainerRef = useRef<HTMLDivElement>(null);
  const theme = CARD_THEMES[settings.cardStyle] || CARD_THEMES['classic-gold'];
  const isDark = settings.cardStyle === 'dark-luxury' || settings.cardStyle === 'royal-navy' || settings.cardStyle === 'emerald-botanical';

  const [expandedSection, setExpandedSection] = useState<'none' | 'ceremony' | 'reception' | 'itinerary' | 'dresscode' | 'gifts' | 'tips'>('none');
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  // Dress Code interactive visualizer state
  let paletteList: string[] = [];
  try {
    paletteList = settings.dressCodePalette ? JSON.parse(settings.dressCodePalette) : [];
  } catch {
    paletteList = [];
  }
  if (!paletteList.length) {
    switch (settings.cardStyle) {
      case 'romantic-floral':
        paletteList = ['#9E5B6D', '#D8A47F', '#6E8B74', '#E6D7C3', '#2D2926'];
        break;
      case 'boho-chic':
        paletteList = ['#C87D55', '#DDA15E', '#BC6C25', '#606C38', '#283618'];
        break;
      case 'dark-luxury':
        paletteList = ['#D4AF37', '#1E293B', '#475569', '#334155', '#0F172A'];
        break;
      case 'royal-navy':
        paletteList = ['#D4AF37', '#0D1B2A', '#1E3A8A', '#E2E8F0', '#94A3B8'];
        break;
      case 'terracotta-sunset':
        paletteList = ['#E07A5F', '#DDA15E', '#8F4A38', '#F4F1DE', '#3D405B'];
        break;
      case 'lavender-provence':
        paletteList = ['#7B6D8D', '#9D8BB0', '#D6CEDE', '#4A3E56', '#FAF5FF'];
        break;
      case 'emerald-botanical':
        paletteList = ['#D4AF37', '#1B4332', '#2D6A4F', '#52B788', '#D8F3DC'];
        break;
      case 'coastal-breeze':
        paletteList = ['#2B6CB0', '#4299E1', '#D4A373', '#EBF8FF', '#2C5282'];
        break;
      case 'champagne-glam':
        paletteList = ['#C39B60', '#E5C992', '#261E14', '#FAF7F0', '#8F6E3B'];
        break;
      case 'watercolor-garden':
        paletteList = ['#526B50', '#7D947B', '#C5D6C4', '#2D3B2C', '#FAFBF6'];
        break;
      case 'minimal-editorial':
        paletteList = ['#141414', '#5A5A40', '#999999', '#E5E2D0', '#FFFFFF'];
        break;
      case 'classic-gold':
      default:
        paletteList = ['#5A5A40', '#7D8C7A', '#C5A059', '#E5E2D0', '#1C2D37'];
        break;
    }
  }

  const [selectedPaletteIndex, setSelectedPaletteIndex] = useState(0);
  const activePaletteColor = paletteList[selectedPaletteIndex] || paletteList[0] || '#5A5A40';
  const [activeWomanOutfit, setActiveWomanOutfit] = useState<'long-gown' | 'cocktail' | 'jumpsuit' | 'boho'>('long-gown');
  const [activeManOutfit, setActiveManOutfit] = useState<'tuxedo' | 'suit' | 'guayabera' | 'blazer'>('tuxedo');
  const [activeGenderView, setActiveGenderView] = useState<'both' | 'women' | 'men'>('both');

  const getItineraryIcon = (iconName?: string) => {
    switch (iconName) {
      case 'church':
        return <Church className="w-5 h-5" />;
      case 'cocktail':
        return <GlassWater className="w-5 h-5" />;
      case 'utensils':
        return <Utensils className="w-5 h-5" />;
      case 'music':
        return <Music2 className="w-5 h-5" />;
      case 'moon':
        return <Moon className="w-5 h-5" />;
      default:
        return <Sparkles className="w-5 h-5" />;
    }
  };

  const getTipIcon = (iconName?: string) => {
    switch (iconName) {
      case 'clock':
        return <Clock className="w-5 h-5" />;
      case 'car':
        return <Car className="w-5 h-5" />;
      case 'camera':
        return <Camera className="w-5 h-5" />;
      case 'heart':
        return <Heart className="w-5 h-5" />;
      case 'shield':
        return <ShieldCheck className="w-5 h-5" />;
      case 'footprints':
        return <Footprints className="w-5 h-5" />;
      default:
        return <Lightbulb className="w-5 h-5" />;
    }
  };

  const toggleSection = (section: 'ceremony' | 'reception' | 'itinerary' | 'dresscode' | 'gifts' | 'tips') => {
    setExpandedSection((prev) => (prev === section ? 'none' : section));
  };

  const handleCopy = (text: string, key: string) => {
    if (!text) return;
    navigator.clipboard.writeText(text);
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(null), 2000);
  };

  let itineraryList: ItineraryItem[] = [];
  try {
    itineraryList = JSON.parse(settings.itinerary || '[]');
  } catch {
    itineraryList = [];
  }

  let registryItems: GiftRegistryItem[] = [];
  try {
    registryItems = JSON.parse(settings.giftRegistry || '[]');
  } catch {
    registryItems = [];
  }

  let tipsList: WeddingTipItem[] = [];
  try {
    if (typeof settings.tipsList === 'string') {
      tipsList = JSON.parse(settings.tipsList || '[]');
    } else if (Array.isArray(settings.tipsList)) {
      tipsList = settings.tipsList;
    }
  } catch {
    tipsList = [];
  }
  if (!tipsList.length) {
    tipsList = [
      { icon: 'clock', title: 'Puntualidad', desc: 'Agradecemos llegar 15 minutos antes de la ceremonia para comenzar a tiempo.' },
      { icon: 'car', title: 'Estacionamiento & Valet', desc: 'El recinto cuenta con servicio de Valet Parking y vigilancia privada.' },
      { icon: 'camera', title: 'Fotografías & Momentos', desc: '¡Comparte tus fotos en nuestra galería en vivo o usando nuestro hashtag oficial!' },
      { icon: 'heart', title: 'Niños / Solo Adultos', desc: 'Hemos preparado una celebración de gala para adultos. ¡Disfrutemos juntos la noche!' },
    ];
  }

  const getMapsSearchUrl = (venue: string, address: string, customUrl?: string) => {
    if (customUrl && customUrl.trim() !== '') return customUrl;
    const query = encodeURIComponent(`${venue} ${address}`.trim());
    return `https://www.google.com/maps/search/?api=1&query=${query}`;
  };

  const getMapsDirectionsUrl = (venue: string, address: string) => {
    const destination = encodeURIComponent(`${venue} ${address}`.trim());
    return `https://www.google.com/maps/dir/?api=1&destination=${destination}`;
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

  const ceremonyEmbedUrl = getEmbedUrl(settings.ceremonyVenue || 'Ceremonia', settings.ceremonyAddress || '', settings.ceremonyEmbedUrl);
  const receptionEmbedUrl = getEmbedUrl(settings.receptionVenue || 'Recepción', settings.receptionAddress || '', settings.receptionEmbedUrl);
  const ceremonyMapsUrl = getMapsSearchUrl(settings.ceremonyVenue || 'Ceremonia', settings.ceremonyAddress || '', settings.ceremonyMapsUrl);
  const receptionMapsUrl = getMapsSearchUrl(settings.receptionVenue || 'Recepción', settings.receptionAddress || '', settings.receptionMapsUrl);
  const ceremonyDirectionsUrl = getMapsDirectionsUrl(settings.ceremonyVenue || 'Ceremonia', settings.ceremonyAddress || '');
  const receptionDirectionsUrl = getMapsDirectionsUrl(settings.receptionVenue || 'Recepción', settings.receptionAddress || '');
  const ceremonyWazeUrl = getWazeUrl(settings.ceremonyVenue || 'Ceremonia', settings.ceremonyAddress || '');
  const receptionWazeUrl = getWazeUrl(settings.receptionVenue || 'Recepción', settings.receptionAddress || '');

  const { scrollY } = useScroll();
  const heroBgBlur = useTransform(scrollY, [0, 80, 240, 480], ['blur(0px)', 'blur(4px)', 'blur(14px)', 'blur(28px)']);
  const heroBgScale = useTransform(scrollY, [0, 480], [1, 1.1]);
  const heroBgOpacity = useTransform(scrollY, [0, 300, 600], [1, 0.85, 0.4]);
  const heroContentOpacity = useTransform(scrollY, [0, 260], [1, 0]);
  const heroContentY = useTransform(scrollY, [0, 320], ['0px', '-35px']);
  const heroContentBlur = useTransform(scrollY, [0, 80, 260], ['blur(0px)', 'blur(0px)', 'blur(6px)']);

  const [timeLeft, setTimeLeft] = useState({ days: 0, hours: 0, minutes: 0, seconds: 0 });

  useEffect(() => {
    const calculateTimeLeft = () => {
      const targetDate = new Date(`${settings.eventDate || '2026-11-28'}T${settings.eventTime || '17:00'}:00`).getTime();
      const now = new Date().getTime();
      const difference = targetDate - now;
      if (difference > 0) {
        setTimeLeft({
          days: Math.floor(difference / (1000 * 60 * 60 * 24)),
          hours: Math.floor((difference / (1000 * 60 * 60)) % 24),
          minutes: Math.floor((difference / 1000 / 60) % 60),
          seconds: Math.floor((difference / 1000) % 60),
        });
      }
    };
    calculateTimeLeft();
    const interval = setInterval(calculateTimeLeft, 1000);
    return () => clearInterval(interval);
  }, [settings.eventDate, settings.eventTime]);

  const coupleNamesSafe = settings.coupleNames || 'Sofía & Alejandro';
  const eventDateSafe = settings.eventDate || '2026-11-28';
  const eventTimeSafe = settings.eventTime || '17:00';
  const cleanDate = eventDateSafe.replace(/-/g, '');
  const cleanTime = eventTimeSafe.replace(/:/g, '');
  const googleCalendarUrl = `https://calendar.google.com/calendar/render?action=TEMPLATE&text=Boda+de+${encodeURIComponent(coupleNamesSafe)}&dates=${cleanDate}T${cleanTime}00Z/${cleanDate}T235900Z&details=Celebraci%C3%B3n+de+nuestra+boda.&location=${encodeURIComponent(settings.receptionVenue || '')}`;

  // Multi-photo Hero Carousel with Configurable Auto-Play Timer
  const heroPhotoList = useMemo(() => {
    try {
      if (settings.heroPhotos) {
        if (typeof settings.heroPhotos === 'string') {
          const parsed = JSON.parse(settings.heroPhotos);
          if (Array.isArray(parsed) && parsed.length > 0) return parsed;
        }
      }
    } catch {
      // If it's a comma-separated list
      if (typeof settings.heroPhotos === 'string' && settings.heroPhotos.includes(',')) {
        return settings.heroPhotos.split(',').map((u) => u.trim()).filter(Boolean);
      }
    }
    return [settings.coverPhoto || 'https://images.unsplash.com/photo-1519741497674-611481863552?q=80&w=2070&auto=format&fit=crop'];
  }, [settings.heroPhotos, settings.coverPhoto]);

  const [activeHeroPhotoIndex, setActiveHeroPhotoIndex] = useState(0);

  useEffect(() => {
    if (heroPhotoList.length <= 1) return;
    const intervalSec = Math.max(2, settings.heroAutoplayInterval || 5);
    const interval = setInterval(() => {
      setActiveHeroPhotoIndex((prev) => (prev + 1) % heroPhotoList.length);
    }, intervalSec * 1000);
    return () => clearInterval(interval);
  }, [heroPhotoList, settings.heroAutoplayInterval]);

  const currentCoverImage = heroPhotoList[activeHeroPhotoIndex] || heroPhotoList[0];

  const scrollToContent = () => document.getElementById('detalles-boda')?.scrollIntoView({ behavior: 'smooth' });

  return (
    <div className="w-full relative transition-colors duration-500" style={{ backgroundColor: theme.bgHex }}>
      <div ref={heroContainerRef} className="sticky top-0 h-screen min-h-[600px] w-full overflow-hidden flex flex-col justify-between items-center text-center px-4 py-8 sm:py-10 select-none z-0">
        <motion.div style={{ opacity: heroBgOpacity, filter: settings.heroEnableScrollBlur !== false ? heroBgBlur : undefined }} className="absolute inset-0 w-full h-full pointer-events-none will-change-[opacity,filter]">
          {settings.heroImageFit === 'contain' && (
            <div className="absolute inset-0 bg-cover bg-center filter blur-xl scale-110 opacity-60" style={{ backgroundImage: `url(${currentCoverImage})` }} />
          )}
          
          <AnimatePresence mode="sync">
            <motion.div
              key={currentCoverImage}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 1.2, ease: 'easeInOut' }}
              className="absolute inset-0 bg-no-repeat"
              style={{
                backgroundImage: `url(${currentCoverImage})`,
                backgroundSize: settings.heroImageFit || 'cover',
                backgroundPosition: settings.heroImagePosition === 'top' ? 'center top' : 'center center',
                scale: heroBgScale,
              }}
            >
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
          </AnimatePresence>

          {/* Hero Slide Indicator Dots if multi-photo */}
          {heroPhotoList.length > 1 && (
            <div className="absolute bottom-6 left-1/2 -translate-x-1/2 z-30 flex items-center gap-1.5 pointer-events-auto">
              {heroPhotoList.map((_, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => setActiveHeroPhotoIndex(idx)}
                  className={`h-1.5 rounded-full transition-all cursor-pointer ${
                    idx === activeHeroPhotoIndex
                      ? 'w-6 bg-amber-400 shadow-sm'
                      : 'w-1.5 bg-white/40 hover:bg-white/70'
                  }`}
                  title={`Foto ${idx + 1}`}
                />
              ))}
            </div>
          )}

          <AnimatedFloatingPetals count={14} />
        </motion.div>

        <motion.div style={{ opacity: heroContentOpacity, y: heroContentY, filter: heroContentBlur }} className="relative z-10 w-full h-full flex flex-col justify-between items-center will-change-[opacity,filter,transform] pt-6 sm:pt-10 pb-16">
          <div className="min-h-4">
            {settings.heroShowIcon && (
              <motion.div initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.8 }} className="mb-1">
                <AnimatedQuinceaneraTiara className="w-16 h-12 mx-auto" color="#E5B25D" />
              </motion.div>
            )}
          </div>
          <div className="max-w-4xl mx-auto my-auto px-4 text-center text-white flex flex-col items-center justify-center">
            <motion.p initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8, delay: 0.1 }} className="text-base sm:text-2xl md:text-3xl tracking-[0.25em] uppercase text-stone-200 drop-shadow-md font-serif font-medium">{formatHeroDate(settings.eventDate, settings.heroDateFormat || 'dd.mm.aaaa', settings.heroCustomDateText)}</motion.p>
            <motion.h1 initial={{ opacity: 0, scale: 0.94 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.9, delay: 0.2 }} className={`text-4xl sm:text-6xl md:text-7xl lg:text-8xl italic tracking-tight text-white my-3 font-normal ${theme.fontDisplay}`}>{coupleNamesSafe}</motion.h1>
            <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.9, delay: 0.35 }} className="max-w-2xl mx-auto mt-2">
              <p className="text-base sm:text-xl font-serif italic text-white/95 leading-relaxed drop-shadow-md">{settings.heroQuote || 'Deja que la vida te despeine, sueña en grande y baila como si el mundo fuera tuyo.'}</p>
            </motion.div>
            {settings.heroShowRsvpButton && (
              <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8, delay: 0.7 }} className="flex gap-3 mt-6">
                <button onClick={onOpenRsvp} className="px-8 py-3 rounded-full bg-gradient-to-r from-amber-600 to-amber-700 text-white font-serif font-semibold text-sm uppercase shadow-xl hover:brightness-110 transition-all flex items-center gap-2">
                  <Heart className="w-4 h-4 fill-white" /> Confirmar Asistencia
                </button>
              </motion.div>
            )}
          </div>
          <motion.div animate={{ y: [0, 6, 0] }} transition={{ repeat: Infinity, duration: 2 }} onClick={scrollToContent} className="cursor-pointer flex flex-col items-center text-stone-300 hover:text-white transition-colors pb-3">
            <span className="text-[10px] uppercase tracking-[0.25em] font-medium">Ver Invitación</span>
            <ChevronDown className="w-4 h-4 text-amber-200/90" />
          </motion.div>
        </motion.div>
      </div>

      {/* 2. INVITATION DETAILS SECTION - FUSED INTERACTIVE SECTION WITH INLINE EXPANSIONS */}
      <section
        id="detalles-boda"
        className="relative z-10 w-full pt-16 sm:pt-20 md:pt-28 lg:pt-32 pb-14 sm:pb-20 px-4 sm:px-8 md:px-12 lg:px-16"
        style={{ backgroundColor: theme.bgHex }}
      >
        {/* Animated Transition Divider */}
        <div className="absolute left-0 right-0 -top-16 sm:-top-22 md:-top-28 lg:-top-32 pointer-events-none w-full leading-none overflow-hidden z-0">
          <FixDateAnimatedTransitionDivider
            fillColor={theme.bgHex}
            accentColor={theme.accentColorHex}
            cardStyle={settings.cardStyle}
          />
        </div>

        <div className="relative z-10 w-full max-w-7xl 2xl:max-w-[1600px] mx-auto text-center overflow-visible">
          {/* Section Header: Story & Quote Banner */}
          <div className="mb-8 sm:mb-12 flex flex-col items-center overflow-visible">
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
              className="mb-4 sm:mb-5 overflow-visible"
            >
              <AnimatedQuinceaneraTiara className="w-36 h-24 sm:w-44 sm:h-28 md:w-52 md:h-32 mx-auto" color={theme.accentColorHex} />
            </motion.div>

            <div className={`inline-flex items-center gap-2 px-5 py-2 rounded-full border mb-4 shadow-2xs ${theme.accentClass}`}>
              <Sparkles className="w-3.5 h-3.5" />
              <span className="text-xs uppercase tracking-[0.25em] font-semibold font-serif">
                Mis XV Años • {settings.coupleNames || 'Valeria Montserrat'}
              </span>
            </div>

            <h2 className={`text-2xl sm:text-4xl md:text-5xl italic leading-tight max-w-4xl mx-auto font-normal ${theme.textPrimaryClass} ${theme.fontDisplay}`}>
              "{settings.welcomeMessage || '¡Mis Quince Años! Un sueño hecho realidad'}"
            </h2>
            
            <StyleSpecificDivider
              cardStyle={settings.cardStyle}
              className="w-56 sm:w-72 h-10 mx-auto mt-6"
              color={theme.accentColorHex}
            />
            
            <p className={`text-sm sm:text-base font-serif max-w-2xl mx-auto mt-3 leading-relaxed ${isDark ? 'text-stone-300' : 'text-stone-600'}`}>
              {settings.welcomeSubtitle || 'Nos emociona compartir este día tan especial contigo. Toca los botones de cada tarjeta para ver la información completa de manera interactiva.'}
            </p>
          </div>

          {/* FUSED INTERACTIVE CARDS GRID - items-start ensures expanding one card only expands that single card without stretching siblings */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 text-left my-8 items-start">
            
            {/* 1. CEREMONIA RELIGIOSA (Interactive Card with Embedded Map, GPS and Waze - Fully Clickable) */}
            <div
              onClick={() => toggleSection('ceremony')}
              className={`p-6 sm:p-8 transition-all flex flex-col justify-between border cursor-pointer select-none group relative ${theme.cardBgClass} ${theme.cardShapeClass || 'rounded-3xl'} ${theme.cardBorderDecoration || 'shadow-sm'} ${
                expandedSection === 'ceremony' ? 'ring-2 ring-amber-400/50 scale-[1.01]' : 'hover:-translate-y-1 hover:shadow-xl'
              }`}
            >
              <CardOrnamentFrame cardStyle={settings.cardStyle} accentColor={theme.accentColorHex} />
              <div className="relative z-10">
                <div className="flex items-center justify-between gap-3 mb-4">
                  <div className={`w-12 h-12 flex items-center justify-center border group-hover:scale-105 transition-transform ${theme.cardHeaderShapeClass || 'rounded-2xl'} ${theme.accentClass}`}>
                    <AnimatedChurchBells className="w-9 h-9" color={theme.accentColorHex} />
                  </div>
                  <span className={`text-xs sm:text-sm font-mono font-bold px-3.5 py-1.5 rounded-full border ${theme.accentClass}`}>
                    {settings.ceremonyTime || '17:00'} hrs
                  </span>
                </div>

                <span className="text-xs uppercase tracking-widest font-semibold block mb-1" style={{ color: theme.accentColorHex }}>
                  Momento Sagrado
                </span>
                <h3 className={`text-2xl sm:text-3xl font-semibold mb-2 ${theme.textPrimaryClass} ${theme.fontDisplay}`}>
                  Ceremonia Religiosa
                </h3>
                <p className={`text-base sm:text-lg font-medium ${isDark ? 'text-white' : 'text-stone-900'}`}>{settings.ceremonyVenue || 'Parroquia Principal'}</p>
                <p className={`text-xs sm:text-sm mt-2 flex items-start gap-2 ${isDark ? 'text-stone-200' : 'text-stone-600'}`}>
                  <MapPin className="w-4 h-4 shrink-0 mt-0.5" style={{ color: theme.accentColorHex }} />
                  <span>{settings.ceremonyAddress || 'Dirección de la ceremonia'}</span>
                </p>
              </div>

              {/* Action Toolbar */}
              <div className="mt-6 pt-4 border-t border-stone-200/40 dark:border-stone-700/40 flex items-center justify-between gap-2">
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    toggleSection('ceremony');
                  }}
                  className={`inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-semibold border transition-all cursor-pointer ${
                    expandedSection === 'ceremony'
                      ? isDark ? 'bg-[#C5A059] text-stone-950 font-bold' : 'bg-[#5A5A40] text-white'
                      : isDark ? 'bg-stone-800/90 text-stone-100 hover:text-white border-stone-600' : 'bg-white hover:bg-stone-100 text-[#5A5A40]'
                  }`}
                >
                  <Navigation className="w-3.5 h-3.5" />
                  <span>{expandedSection === 'ceremony' ? 'Ocultar Mapa' : 'Ver Mapa y Rutas'}</span>
                  <ChevronDown className={`w-3.5 h-3.5 transition-transform ${expandedSection === 'ceremony' ? 'rotate-180' : ''}`} />
                </button>

                {settings.ceremonyMapsUrl && (
                  <a
                    href={settings.ceremonyMapsUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    onClick={(e) => e.stopPropagation()}
                    className="text-xs sm:text-sm font-semibold flex items-center gap-1.5 hover:underline"
                    style={{ color: theme.accentColorHex }}
                  >
                    <Compass className="w-4 h-4 shrink-0" />
                    <span>Google Maps</span>
                  </a>
                )}
              </div>

              {/* Collapsible Map & GPS Container */}
              <AnimatePresence>
                {expandedSection === 'ceremony' && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    onClick={(e) => e.stopPropagation()}
                    className="mt-5 pt-4 border-t border-stone-200/40 dark:border-stone-700/40 space-y-3 overflow-hidden"
                  >
                    <div className="w-full h-52 sm:h-64 rounded-2xl overflow-hidden border shadow-inner">
                      <iframe title="Mapa Ceremonia" width="100%" height="100%" src={ceremonyEmbedUrl} className="w-full h-full border-0" loading="lazy" />
                    </div>
                    <div className="grid grid-cols-2 gap-2 pt-1">
                      <a
                        href={ceremonyDirectionsUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className={`p-2.5 rounded-xl text-xs font-bold text-center flex items-center justify-center gap-1.5 border ${
                          isDark ? 'bg-[#C5A059] text-stone-950 border-[#C5A059]' : 'bg-[#5A5A40] text-white border-[#5A5A40]'
                        }`}
                      >
                        <Car className="w-3.5 h-3.5" />
                        <span>Cómo Llegar (GPS)</span>
                      </a>
                      <a
                        href={ceremonyWazeUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className={`p-2.5 rounded-xl text-xs font-semibold text-center flex items-center justify-center gap-1.5 border ${
                          isDark ? 'bg-stone-800 text-stone-100 border-stone-600' : 'bg-white text-stone-700 border-stone-300'
                        }`}
                      >
                        <Compass className="w-3.5 h-3.5" />
                        <span>Abrir en Waze</span>
                      </a>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* 2. RECEPCIÓN & BANQUETE (Interactive Card with Embedded Map, GPS and Waze - Fully Clickable) */}
            <div
              onClick={() => toggleSection('reception')}
              className={`p-6 sm:p-8 transition-all flex flex-col justify-between border cursor-pointer select-none group relative ${theme.cardBgClass} ${theme.cardShapeClass || 'rounded-3xl'} ${theme.cardBorderDecoration || 'shadow-sm'} ${
                expandedSection === 'reception' ? 'ring-2 ring-amber-400/50 scale-[1.01]' : 'hover:-translate-y-1 hover:shadow-xl'
              }`}
            >
              <CardOrnamentFrame cardStyle={settings.cardStyle} accentColor={theme.accentColorHex} />
              <div className="relative z-10">
                <div className="flex items-center justify-between gap-3 mb-4">
                  <div className={`w-12 h-12 flex items-center justify-center border group-hover:scale-105 transition-transform ${theme.cardHeaderShapeClass || 'rounded-2xl'} ${theme.accentClass}`}>
                    <AnimatedChampagneGlasses className="w-9 h-9" />
                  </div>
                  <span className={`text-xs sm:text-sm font-mono font-bold px-3.5 py-1.5 rounded-full border ${theme.accentClass}`}>
                    {settings.receptionTime || '19:30'} hrs
                  </span>
                </div>

                <span className={`text-xs uppercase tracking-widest font-semibold block mb-1 ${isDark ? 'text-amber-400' : 'text-amber-700'}`}>
                  Celebración & Fiesta
                </span>
                <h3 className={`text-2xl sm:text-3xl font-semibold mb-2 ${theme.textPrimaryClass} ${theme.fontDisplay}`}>
                  Recepción & Brindis
                </h3>
                <p className={`text-base sm:text-lg font-medium ${isDark ? 'text-white' : 'text-stone-900'}`}>{settings.receptionVenue || 'Hacienda de Eventos'}</p>
                <p className={`text-xs sm:text-sm mt-2 flex items-start gap-2 ${isDark ? 'text-stone-200' : 'text-stone-600'}`}>
                  <MapPin className="w-4 h-4 text-amber-500 shrink-0 mt-0.5" />
                  <span>{settings.receptionAddress || 'Dirección de la recepción'}</span>
                </p>
              </div>

              {/* Action Toolbar */}
              <div className="mt-6 pt-4 border-t border-stone-200/40 dark:border-stone-700/40 flex items-center justify-between gap-2">
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    toggleSection('reception');
                  }}
                  className={`inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-semibold border transition-all cursor-pointer ${
                    expandedSection === 'reception'
                      ? 'bg-amber-500 text-stone-950 font-bold border-amber-500'
                      : isDark ? 'bg-stone-800/90 text-stone-100 hover:text-white border-stone-600' : 'bg-white hover:bg-stone-100 text-amber-900'
                  }`}
                >
                  <Navigation className="w-3.5 h-3.5" />
                  <span>{expandedSection === 'reception' ? 'Ocultar Mapa' : 'Ver Mapa y Rutas'}</span>
                  <ChevronDown className={`w-3.5 h-3.5 transition-transform ${expandedSection === 'reception' ? 'rotate-180' : ''}`} />
                </button>

                {settings.receptionMapsUrl && (
                  <a
                    href={settings.receptionMapsUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    onClick={(e) => e.stopPropagation()}
                    className="text-xs sm:text-sm font-semibold text-amber-700 hover:text-amber-900 flex items-center gap-1.5 hover:underline"
                  >
                    <Compass className="w-4 h-4 text-amber-600 shrink-0" />
                    <span>Google Maps</span>
                  </a>
                )}
              </div>

              {/* Collapsible Map & GPS Container */}
              <AnimatePresence>
                {expandedSection === 'reception' && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    onClick={(e) => e.stopPropagation()}
                    className="mt-5 pt-4 border-t border-stone-200/40 dark:border-stone-700/40 space-y-3 overflow-hidden"
                  >
                    <div className="w-full h-52 sm:h-64 rounded-2xl overflow-hidden border shadow-inner">
                      <iframe title="Mapa Recepción" width="100%" height="100%" src={receptionEmbedUrl} className="w-full h-full border-0" loading="lazy" />
                    </div>
                    <div className="grid grid-cols-2 gap-2 pt-1">
                      <a
                        href={receptionDirectionsUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="p-2.5 rounded-xl text-xs font-bold text-center flex items-center justify-center gap-1.5 bg-amber-500 hover:bg-amber-600 text-stone-950 shadow-xs"
                      >
                        <Car className="w-3.5 h-3.5" />
                        <span>Cómo Llegar (GPS)</span>
                      </a>
                      <a
                        href={receptionWazeUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className={`p-2.5 rounded-xl text-xs font-semibold text-center flex items-center justify-center gap-1.5 border ${
                          isDark ? 'bg-stone-800 text-stone-200 border-stone-700' : 'bg-white text-stone-700 border-stone-300'
                        }`}
                      >
                        <Compass className="w-3.5 h-3.5" />
                        <span>Abrir en Waze</span>
                      </a>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* 3. ITINERARIO & CRONOGRAMA (Full Interactive Timeline Inline - Fully Clickable) */}
            {settings.showItinerary !== false && itineraryList.length > 0 && (
              <div
                onClick={() => toggleSection('itinerary')}
                className={`p-6 sm:p-8 transition-all flex flex-col justify-between border cursor-pointer select-none group relative ${theme.cardBgClass} ${theme.cardShapeClass || 'rounded-3xl'} ${theme.cardBorderDecoration || 'shadow-sm'} ${
                  expandedSection === 'itinerary' ? 'ring-2 ring-amber-400/50 scale-[1.01]' : 'hover:-translate-y-1 hover:shadow-xl'
                }`}
              >
                <CardOrnamentFrame cardStyle={settings.cardStyle} accentColor={theme.accentColorHex} />
                <div className="relative z-10">
                  <div className="flex items-center justify-between gap-3 mb-4">
                    <div className={`w-12 h-12 flex items-center justify-center border group-hover:scale-105 transition-transform ${theme.cardHeaderShapeClass || 'rounded-2xl'} ${theme.accentClass}`}>
                      <Clock className="w-6 h-6 shrink-0" />
                    </div>
                    <span className={`text-xs uppercase tracking-widest font-bold px-3 py-1 rounded-full border ${theme.accentClass}`}>
                      {itineraryList.length} Momentos Clave
                    </span>
                  </div>

                  <span className="text-xs uppercase tracking-widest font-semibold block mb-1 opacity-80" style={{ color: theme.accentColorHex }}>
                    Cronograma Oficial
                  </span>
                  <h3 className={`text-2xl sm:text-3xl font-semibold mb-2 ${theme.textPrimaryClass} ${theme.fontDisplay}`}>
                    Itinerario del Gran Día
                  </h3>
                  
                  {/* Summary Chips */}
                  <div className="mt-3 flex flex-wrap gap-2">
                    {itineraryList.slice(0, 3).map((item, idx) => (
                      <span
                        key={idx}
                        className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium border ${
                          isDark ? 'bg-stone-800/90 border-stone-600 text-stone-100' : 'bg-white border-stone-200 text-stone-800'
                        }`}
                      >
                        <span className="font-mono font-bold text-amber-400">{item.time}</span>
                        <span>{item.title}</span>
                      </span>
                    ))}
                    {itineraryList.length > 3 && (
                      <span className={`text-xs font-serif italic self-center ${isDark ? 'text-stone-300' : 'text-stone-400'}`}>
                        +{itineraryList.length - 3} más
                      </span>
                    )}
                  </div>
                </div>

                <div className="mt-6 pt-4 border-t border-stone-200/40 dark:border-stone-700/40 flex items-center justify-between">
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      toggleSection('itinerary');
                    }}
                    className={`inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-bold uppercase tracking-wider transition-all cursor-pointer ${
                      expandedSection === 'itinerary'
                        ? isDark ? 'bg-[#C5A059] text-stone-950' : 'bg-[#5A5A40] text-white'
                        : isDark ? 'bg-stone-800/90 text-stone-100 hover:text-white border-stone-600' : 'bg-white border border-stone-300 text-[#5A5A40]'
                    }`}
                  >
                    <span>{expandedSection === 'itinerary' ? 'Ocultar Horarios' : 'Ver Cronograma Completo'}</span>
                    <ChevronDown className={`w-3.5 h-3.5 transition-transform ${expandedSection === 'itinerary' ? 'rotate-180' : ''}`} />
                  </button>
                </div>

                {/* Full Premium Interactive Timeline with Curving Wave Line */}
                <AnimatePresence>
                  {expandedSection === 'itinerary' && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      exit={{ opacity: 0, height: 0 }}
                      onClick={(e) => e.stopPropagation()}
                      className="mt-6 pt-5 border-t border-stone-200/40 dark:border-stone-700/40 space-y-4 overflow-hidden"
                    >
                      <div className="relative pl-14 sm:pl-16 space-y-6">
                        {/* Organic Curving S-Wave SVG Connector */}
                        <svg
                          className="absolute left-4 sm:left-5 top-4 bottom-4 w-8 h-[calc(100%-32px)] pointer-events-none"
                          preserveAspectRatio="none"
                          viewBox="0 0 30 100"
                        >
                          <defs>
                            <linearGradient id="curveGradient" x1="0%" y1="0%" x2="0%" y2="100%">
                              <stop offset="0%" stopColor="#F59E0B" stopOpacity="0.9" />
                              <stop offset="35%" stopColor="#D97706" stopOpacity="0.85" />
                              <stop offset="70%" stopColor="#FBBF24" stopOpacity="0.95" />
                              <stop offset="100%" stopColor="#D97706" stopOpacity="0.8" />
                            </linearGradient>
                          </defs>
                          {/* Smooth undulating Bezier curve */}
                          <path
                            d="M 15,0 Q 26,12 15,25 T 15,50 T 15,75 T 15,100"
                            fill="none"
                            stroke="url(#curveGradient)"
                            strokeWidth="2.5"
                            strokeDasharray="4 3"
                            strokeLinecap="round"
                          />
                        </svg>

                        {itineraryList.map((item, idx) => {
                          // Gentle horizontal oscillation for each node to track the curve
                          const isOdd = idx % 2 === 1;
                          return (
                            <div key={idx} className="relative flex items-start gap-4 group">
                              {/* Animated SVG ring node with curving horizontal offset */}
                              <div
                                className={`absolute top-1 w-9 h-9 sm:w-10 sm:h-10 rounded-full bg-gradient-to-br from-amber-300 via-amber-400 to-amber-600 border-2 border-white dark:border-stone-900 shadow-md flex items-center justify-center text-stone-950 shrink-0 z-10 transition-transform duration-300 group-hover:scale-110 ${
                                  isOdd ? '-left-12 sm:-left-13' : '-left-14 sm:-left-15'
                                }`}
                              >
                                {getItineraryIcon(item.icon)}
                              </div>
                              <div className={`p-4 rounded-2xl border flex-1 shadow-xs transition-all hover:scale-[1.01] ${
                                isDark ? 'bg-stone-850 border-stone-600 hover:border-amber-400/70 shadow-lg' : 'bg-white border-stone-200 hover:border-amber-300'
                              }`}>
                                <div className="flex items-center justify-between gap-2 mb-1.5">
                                  <span className={`font-serif font-bold text-base ${isDark ? 'text-white' : 'text-stone-900'}`}>
                                    {item.title}
                                  </span>
                                  <span className="font-mono text-xs font-bold px-3 py-1 rounded-full bg-amber-500/15 text-amber-500 dark:text-amber-300 border border-amber-500/30">
                                    {item.time} hrs
                                  </span>
                                </div>
                                {item.desc && (
                                  <p className={`text-xs sm:text-sm leading-relaxed font-serif ${isDark ? 'text-stone-200' : 'text-stone-600'}`}>
                                    {item.desc}
                                  </p>
                                )}
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            )}

            {/* 4. MESA DE REGALOS & CUENTAS BANCARIAS (Interactive Card with Copyable Bank Accounts - Fully Clickable) */}
            {settings.showGiftRegistry !== false && (
              <div
                onClick={() => toggleSection('gifts')}
                className={`p-6 sm:p-8 transition-all flex flex-col justify-between border cursor-pointer select-none group relative ${theme.cardBgClass} ${theme.cardShapeClass || 'rounded-3xl'} ${theme.cardBorderDecoration || 'shadow-sm'} ${
                  expandedSection === 'gifts' ? 'ring-2 ring-amber-400/50 scale-[1.01]' : 'hover:-translate-y-1 hover:shadow-xl'
                }`}
              >
                <CardOrnamentFrame cardStyle={settings.cardStyle} accentColor={theme.accentColorHex} />
                <div className="relative z-10">
                  <div className="flex items-center justify-between gap-3 mb-4">
                    <div className={`w-12 h-12 flex items-center justify-center border group-hover:scale-105 transition-transform ${theme.cardHeaderShapeClass || 'rounded-2xl'} ${theme.accentClass}`}>
                      <AnimatedGiftBox className="w-8 h-8" />
                    </div>
                    <span className={`text-xs uppercase tracking-widest font-bold px-3 py-1 rounded-full border ${theme.accentClass}`}>
                      Mesa de Regalos
                    </span>
                  </div>

                  <span className="text-xs uppercase tracking-widest font-semibold block mb-1" style={{ color: theme.accentColorHex }}>
                    Muestra de Cariño
                  </span>
                  <h3 className={`text-2xl sm:text-3xl font-semibold mb-2 ${theme.textPrimaryClass} ${theme.fontDisplay}`}>
                    Mesa de Regalos & Cuentas
                  </h3>
                  <p className={`text-xs sm:text-sm leading-relaxed ${isDark ? 'text-stone-200' : 'text-stone-600'}`}>
                    {settings.giftRegistryMessage || 'El mejor regalo es tu presencia. Si deseas hacernos un presente o aportación para nuestra luna de miel, ponemos a tu disposición nuestras cuentas bancarias.'}
                  </p>

                  <div className="mt-3 flex flex-wrap gap-2">
                    {settings.enableBankTransfer !== false && (settings.bankName || settings.bankAccountNumber) && (
                      <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium border ${
                        isDark ? 'bg-stone-800/90 border-stone-600 text-stone-100' : 'bg-white border-stone-200 text-stone-800'
                      }`}>
                        <CreditCard className="w-3.5 h-3.5 text-amber-400" />
                        <span>{settings.bankName || 'Transferencia'}</span>
                      </span>
                    )}
                    {settings.enableEnvelopeGift !== false && (
                      <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium border ${
                        isDark ? 'bg-stone-800/90 border-stone-600 text-stone-100' : 'bg-white border-stone-200 text-stone-800'
                      }`}>
                        <Mail className="w-3.5 h-3.5 text-rose-400" />
                        <span>Lluvia de Sobres</span>
                      </span>
                    )}
                  </div>
                </div>

                <div className="mt-6 pt-4 border-t border-stone-200/40 dark:border-stone-700/40 flex items-center justify-between">
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      toggleSection('gifts');
                    }}
                    className={`inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-bold uppercase tracking-wider transition-all cursor-pointer ${
                      expandedSection === 'gifts'
                        ? 'bg-amber-500 text-stone-950 font-bold'
                        : isDark ? 'bg-stone-800/90 text-stone-100 hover:text-white border-stone-600' : 'bg-white border border-stone-300 text-amber-900'
                    }`}
                  >
                    <span>{expandedSection === 'gifts' ? 'Ocultar Cuentas' : 'Ver Cuentas y Opciones'}</span>
                    <ChevronDown className={`w-3.5 h-3.5 transition-transform ${expandedSection === 'gifts' ? 'rotate-180' : ''}`} />
                  </button>
                </div>

                {/* Collapsible Bank Accounts & External Registries */}
                <AnimatePresence>
                  {expandedSection === 'gifts' && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      exit={{ opacity: 0, height: 0 }}
                      className="mt-6 pt-5 border-t border-stone-200/40 dark:border-stone-700/40 space-y-4 overflow-hidden"
                    >
                      {settings.enableBankTransfer !== false && (settings.bankAccountNumber || settings.bankClabe) && (
                        <div className={`p-4 rounded-2xl border space-y-3 ${
                          isDark ? 'bg-stone-850 border-stone-600 text-stone-100' : 'bg-white border-amber-200/80 text-stone-800'
                        }`}>
                          <div className="flex items-center gap-2 text-amber-500 font-bold text-xs uppercase tracking-wider">
                            <Building2 className="w-4 h-4" />
                            <span>Datos de Transferencia Bancaria</span>
                          </div>
                          {settings.bankBeneficiary && (
                            <div className="text-xs">
                              <span className={`block text-[10px] uppercase ${isDark ? 'text-stone-300' : 'text-stone-400'}`}>Titular / Beneficiario:</span>
                              <span className={`font-semibold ${isDark ? 'text-white' : 'text-stone-900'}`}>{settings.bankBeneficiary}</span>
                            </div>
                          )}
                          {settings.bankName && (
                            <div className="text-xs">
                              <span className={`block text-[10px] uppercase ${isDark ? 'text-stone-300' : 'text-stone-400'}`}>Banco:</span>
                              <span className={`font-semibold ${isDark ? 'text-white' : 'text-stone-900'}`}>{settings.bankName}</span>
                            </div>
                          )}
                          {settings.bankAccountNumber && (
                            <div className={`flex items-center justify-between gap-2 p-2 rounded-xl ${isDark ? 'bg-stone-800 border border-stone-700' : 'bg-stone-100'}`}>
                              <div className="min-w-0">
                                <span className={`text-[10px] block uppercase ${isDark ? 'text-stone-300' : 'text-stone-400'}`}>No. de Cuenta:</span>
                                <span className={`font-mono font-bold text-xs ${isDark ? 'text-white' : 'text-stone-900'}`}>{settings.bankAccountNumber}</span>
                              </div>
                              <button
                                type="button"
                                onClick={() => handleCopy(settings.bankAccountNumber || '', 'acc')}
                                className="px-3 py-1 rounded-lg bg-amber-500 text-stone-950 text-xs font-bold shrink-0 cursor-pointer"
                              >
                                {copiedKey === 'acc' ? '¡Copiado!' : 'Copiar'}
                              </button>
                            </div>
                          )}
                          {settings.bankClabe && (
                            <div className={`flex items-center justify-between gap-2 p-2 rounded-xl ${isDark ? 'bg-stone-800 border border-stone-700' : 'bg-stone-100'}`}>
                              <div className="min-w-0">
                                <span className={`text-[10px] block uppercase ${isDark ? 'text-stone-300' : 'text-stone-400'}`}>CLABE / CCI:</span>
                                <span className={`font-mono font-bold text-xs ${isDark ? 'text-white' : 'text-stone-900'}`}>{settings.bankClabe}</span>
                              </div>
                              <button
                                type="button"
                                onClick={() => handleCopy(settings.bankClabe || '', 'clabe')}
                                className="px-3 py-1 rounded-lg bg-amber-500 text-stone-950 text-xs font-bold shrink-0 cursor-pointer"
                              >
                                {copiedKey === 'clabe' ? '¡Copiado!' : 'Copiar'}
                              </button>
                            </div>
                          )}
                        </div>
                      )}

                      {registryItems.map((reg, idx) => (
                        <div key={idx} className={`p-4 rounded-2xl border flex items-center justify-between gap-3 ${
                          isDark ? 'bg-stone-850 border-stone-600' : 'bg-white border-stone-200'
                        }`}>
                          <div>
                            <p className={`font-serif font-bold text-sm ${isDark ? 'text-white' : 'text-stone-900'}`}>{reg.title}</p>
                            <p className={`text-xs ${isDark ? 'text-stone-300' : 'text-stone-500'}`}>{reg.description || 'Mesa de regalos en tienda'}</p>
                          </div>
                          {reg.url && (
                            <a
                              href={reg.url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="px-4 py-2 rounded-xl bg-amber-500 text-stone-950 font-bold text-xs flex items-center gap-1.5 shrink-0"
                            >
                              <span>Ver Mesa</span>
                              <ExternalLink className="w-3.5 h-3.5" />
                            </a>
                          )}
                        </div>
                      ))}
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            )}
          </div>

          {/* 5. DRESS CODE INTERACTIVE CARD & VISUAL FASHION GUIDE WITH COLOR PALETTE SELECTION (Fully Clickable) */}
          {settings.showDressCode !== false && (
            <div
              onClick={() => toggleSection('dresscode')}
              className={`p-6 sm:p-8 max-w-5xl 2xl:max-w-6xl mx-auto my-8 text-center border cursor-pointer select-none transition-all group relative ${theme.cardBgClass} ${theme.cardShapeClass || 'rounded-3xl'} ${theme.cardBorderDecoration || 'shadow-md'} ${
                expandedSection === 'dresscode' ? 'ring-2 ring-amber-400/50 scale-[1.01]' : 'hover:-translate-y-1 hover:shadow-xl'
              }`}
            >
              <CardOrnamentFrame cardStyle={settings.cardStyle} accentColor={theme.accentColorHex} />
              <div className="relative z-10">
                <div className={`w-12 h-12 flex items-center justify-center mx-auto mb-3 border shadow-xs group-hover:scale-105 transition-transform ${theme.cardHeaderShapeClass || 'rounded-2xl'} ${theme.accentClass}`}>
                  <Shirt className="w-6 h-6" style={{ color: theme.accentColorHex }} />
                </div>
                
                <span className="text-xs uppercase tracking-[0.25em] font-semibold block mb-1" style={{ color: theme.accentColorHex }}>
                  Código de Vestimenta
                </span>
                <p className={`text-2xl sm:text-3xl font-bold ${theme.textPrimaryClass} ${theme.fontDisplay}`}>
                  {settings.dressCode || 'Formal / Rigurosa Etiqueta'}
                </p>
                {settings.dressCodeDescription && (
                  <p className={`text-sm sm:text-base mt-2 max-w-xl mx-auto italic ${isDark ? 'text-stone-300' : 'text-stone-600'}`}>
                    "{settings.dressCodeDescription}"
                  </p>
                )}

                {/* Suggested Palette Swatches Banner */}
                {paletteList.length > 0 && (
                  <div className="mt-5 flex flex-col sm:flex-row items-center justify-center gap-3" onClick={(e) => e.stopPropagation()}>
                    <span className={`text-xs font-serif italic ${isDark ? 'text-stone-300' : 'text-stone-600'}`}>
                      Paleta de colores sugerida:
                    </span>
                    <div className="flex items-center gap-2 p-1.5 rounded-full border bg-black/5 dark:bg-white/5 backdrop-blur-xs shadow-xs">
                      {paletteList.map((hex, idx) => (
                        <button
                          key={idx}
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            setSelectedPaletteIndex(idx);
                            if (expandedSection !== 'dresscode') setExpandedSection('dresscode');
                          }}
                          className={`w-7 h-7 sm:w-8 sm:h-8 rounded-full shadow-md border-2 transition-all cursor-pointer ${
                            selectedPaletteIndex === idx
                              ? 'scale-115 border-white ring-2 ring-amber-400'
                              : 'border-white/70 hover:scale-110 opacity-90'
                          }`}
                          style={{ backgroundColor: hex }}
                          title={`Elegir color ${hex}`}
                        />
                      ))}
                    </div>
                  </div>
                )}

                <div className="mt-5 flex justify-center">
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      toggleSection('dresscode');
                    }}
                    className={`inline-flex items-center gap-2 px-6 py-2.5 rounded-full text-xs font-bold uppercase tracking-wider transition-all cursor-pointer shadow-sm ${
                      expandedSection === 'dresscode'
                        ? isDark ? 'bg-[#C5A059] text-stone-950' : 'bg-[#5A5A40] text-white'
                        : isDark ? 'bg-stone-800 text-stone-200 hover:text-white' : 'bg-white border border-stone-300 text-[#5A5A40]'
                    }`}
                  >
                    <Sparkles className="w-3.5 h-3.5" />
                    <span>{expandedSection === 'dresscode' ? 'Ocultar Guía Visual' : 'Ver Guía Visual & Colores'}</span>
                    <ChevronDown className={`w-3.5 h-3.5 transition-transform ${expandedSection === 'dresscode' ? 'rotate-180' : ''}`} />
                  </button>
                </div>

                {/* Collapsible SVG Fashion Mockups & Dress Guidelines with interactive color switches */}
                <AnimatePresence>
                  {expandedSection === 'dresscode' && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      exit={{ opacity: 0, height: 0 }}
                      onClick={(e) => e.stopPropagation()}
                      className="mt-8 pt-6 border-t border-stone-200/40 dark:border-stone-700/40 overflow-hidden text-left"
                    >
                      {/* View Switcher: Pareja / Damas / Caballeros */}
                      <div className="flex items-center justify-center gap-2 mb-6">
                        {[
                          { id: 'both' as const, label: 'Pareja' },
                          { id: 'women' as const, label: 'Damas' },
                          { id: 'men' as const, label: 'Caballeros' },
                        ].map((tab) => (
                          <button
                            key={tab.id}
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              setActiveGenderView(tab.id);
                            }}
                            className={`px-4 py-1.5 rounded-full text-xs font-serif font-bold transition-all cursor-pointer ${
                              activeGenderView === tab.id
                                ? isDark ? 'bg-amber-400 text-stone-950 shadow-md' : 'bg-[#5A5A40] text-white shadow-md'
                                : isDark ? 'bg-stone-800 text-stone-300 hover:text-white' : 'bg-stone-100 text-stone-600 hover:bg-stone-200'
                            }`}
                          >
                            {tab.label}
                          </button>
                        ))}
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-8 items-center max-w-3xl mx-auto">
                        {/* Woman Mockup */}
                        {(activeGenderView === 'both' || activeGenderView === 'women') && (
                          <div className="flex flex-col items-center">
                            <WomanFashionMockup
                              dressColor={activePaletteColor}
                              accessoryColor="#D4AF37"
                              outfitType={activeWomanOutfit}
                            />
                            <p className="font-serif font-bold text-sm mt-3 text-center text-stone-900 dark:text-stone-100">
                              Vestido de Gala / Dama
                            </p>
                            <div className="mt-2 flex justify-center">
                              <select
                                value={activeWomanOutfit}
                                onChange={(e) => {
                                  e.stopPropagation();
                                  setActiveWomanOutfit(e.target.value as any);
                                }}
                                className={`text-[11px] rounded-lg px-2.5 py-1 font-medium shadow-2xs cursor-pointer focus:outline-none border ${
                                  isDark
                                    ? 'bg-[#282B25] border-[#5A5A40] text-[#FDFCF0] focus:border-[#C5A059]'
                                    : 'bg-white border-[#E5E2D0] text-[#3D3D3D] focus:border-[#5A5A40]'
                                }`}
                              >
                                <option value="long-gown">Gala / Vestido Largo</option>
                                <option value="cocktail">Cóctel / Midi</option>
                                <option value="jumpsuit">Enterizo / Palazzo</option>
                                <option value="boho">Bohemio / Fluido</option>
                              </select>
                            </div>
                          </div>
                        )}

                        {/* Man Mockup */}
                        {(activeGenderView === 'both' || activeGenderView === 'men') && (
                          <div className="flex flex-col items-center">
                            <ManFashionMockup
                              suitColor={activePaletteColor}
                              shirtColor="#FFFFFF"
                              tieColor={activePaletteColor}
                              outfitType={activeManOutfit}
                            />
                            <p className="font-serif font-bold text-sm mt-3 text-center text-stone-900 dark:text-stone-100">
                              Traje Formal / Caballero
                            </p>
                            <div className="mt-2 flex justify-center">
                              <select
                                value={activeManOutfit}
                                onChange={(e) => {
                                  e.stopPropagation();
                                  setActiveManOutfit(e.target.value as any);
                                }}
                                className={`text-[11px] rounded-lg px-2.5 py-1 font-medium shadow-2xs cursor-pointer focus:outline-none border ${
                                  isDark
                                    ? 'bg-[#282B25] border-[#5A5A40] text-[#FDFCF0] focus:border-[#C5A059]'
                                    : 'bg-white border-[#E5E2D0] text-[#3D3D3D] focus:border-[#5A5A40]'
                                }`}
                              >
                                <option value="tuxedo">Esmoquin / Smoking</option>
                                <option value="suit">Traje Clásico</option>
                                <option value="guayabera">Guayabera Formal</option>
                                <option value="blazer">Blazer & Pantalón</option>
                              </select>
                            </div>
                          </div>
                        )}
                      </div>

                      {/* Palette Swatches Bar Inside Simulator */}
                      <div className="mt-8 pt-4 border-t border-stone-200/40 dark:border-stone-700/40 text-center">
                        <p className="text-xs text-stone-500 dark:text-stone-400 mb-3 font-serif">
                          Toca un color para probarlo en las prendas:
                        </p>
                        <div className="flex flex-wrap items-center justify-center gap-2.5">
                          {paletteList.map((hex, idx) => (
                            <button
                              key={idx}
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                setSelectedPaletteIndex(idx);
                              }}
                              className={`w-9 h-9 rounded-xl shadow-md border-2 transition-all cursor-pointer flex items-center justify-center ${
                                selectedPaletteIndex === idx
                                  ? 'scale-115 border-white ring-2 ring-amber-400'
                                  : 'border-white/70 hover:scale-110 opacity-90'
                              }`}
                              style={{ backgroundColor: hex }}
                            >
                              {selectedPaletteIndex === idx && (
                                <Check className="w-4 h-4 text-white drop-shadow" />
                              )}
                            </button>
                          ))}
                        </div>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>

                <p className="text-xs text-amber-600 dark:text-amber-400 font-medium mt-6 pt-4 border-t border-stone-200/40 dark:border-stone-700/40">
                  Favor de confirmar asistencia antes del <strong>{settings.rsvpDeadline || '15 de Noviembre'}</strong>
                </p>
              </div>
            </div>
          )}

          {/* 6. TIPS & RECOMENDACIONES DE LOS NOVIOS (Configurable Interactive Section - Fully Clickable) */}
          {settings.showTips !== false && tipsList.length > 0 && (
            <div
              onClick={() => toggleSection('tips')}
              className={`p-6 sm:p-8 max-w-5xl 2xl:max-w-6xl mx-auto my-8 text-center border cursor-pointer select-none transition-all group relative ${theme.cardBgClass} ${theme.cardShapeClass || 'rounded-3xl'} ${theme.cardBorderDecoration || 'shadow-md'} ${
                expandedSection === 'tips' ? 'ring-2 ring-amber-400/50 scale-[1.01]' : 'hover:-translate-y-1 hover:shadow-xl'
              }`}
            >
              <CardOrnamentFrame cardStyle={settings.cardStyle} accentColor={theme.accentColorHex} />
              <div className="relative z-10">
                <div className={`w-12 h-12 flex items-center justify-center mx-auto mb-3 border shadow-xs group-hover:scale-105 transition-transform ${theme.cardHeaderShapeClass || 'rounded-2xl'} ${theme.accentClass}`}>
                  <Lightbulb className="w-6 h-6" style={{ color: theme.accentColorHex }} />
                </div>

                <span className="text-xs uppercase tracking-[0.25em] font-semibold block mb-1" style={{ color: theme.accentColorHex }}>
                  Guía del Evento
                </span>
                <h3 className={`text-2xl sm:text-3xl font-bold ${theme.textPrimaryClass} ${theme.fontDisplay}`}>
                  {settings.tipsTitle || 'Tips & Recomendaciones para la Fiesta'}
                </h3>
                <p className={`text-xs sm:text-sm mt-2 max-w-xl mx-auto leading-relaxed ${isDark ? 'text-stone-300' : 'text-stone-600'}`}>
                  Información y sugerencias clave preparadas con cariño para que disfrutes al máximo cada momento de mis XV años.
                </p>

                {/* Summary Tips Pills */}
                <div className="mt-4 flex flex-wrap justify-center gap-2">
                  {tipsList.map((tip, idx) => (
                    <span
                      key={idx}
                      className={`inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-medium border ${
                        isDark ? 'bg-stone-800/90 border-stone-600 text-stone-100' : 'bg-white border-stone-200 text-stone-800'
                      }`}
                    >
                      <span className="text-amber-400 font-bold">•</span>
                      <span>{tip.title}</span>
                    </span>
                  ))}
                </div>

                <div className="mt-6 flex justify-center">
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      toggleSection('tips');
                    }}
                    className={`inline-flex items-center gap-2 px-6 py-2.5 rounded-full text-xs font-bold uppercase tracking-wider transition-all cursor-pointer shadow-sm ${
                      expandedSection === 'tips'
                        ? isDark ? 'bg-[#C5A059] text-stone-950' : 'bg-[#5A5A40] text-white'
                        : isDark ? 'bg-stone-800/90 text-stone-100 hover:text-white border-stone-600' : 'bg-white border border-stone-300 text-[#5A5A40]'
                    }`}
                  >
                    <Sparkles className="w-3.5 h-3.5" />
                    <span>{expandedSection === 'tips' ? 'Ocultar Recomendaciones' : 'Ver Todos los Tips & Detalles'}</span>
                    <ChevronDown className={`w-3.5 h-3.5 transition-transform ${expandedSection === 'tips' ? 'rotate-180' : ''}`} />
                  </button>
                </div>

                {/* Collapsible Tips Grid */}
                <AnimatePresence>
                  {expandedSection === 'tips' && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      exit={{ opacity: 0, height: 0 }}
                      onClick={(e) => e.stopPropagation()}
                      className="mt-8 pt-6 border-t border-stone-200/40 dark:border-stone-700/40 overflow-hidden text-left"
                    >
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        {tipsList.map((tip, idx) => (
                          <div
                            key={idx}
                            className={`p-4 sm:p-5 rounded-2xl border transition-all flex items-start gap-3.5 ${
                              isDark ? 'bg-stone-850/95 border-stone-600 shadow-md' : 'bg-white border-stone-200 shadow-xs'
                            }`}
                          >
                            <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 border ${theme.accentClass}`}>
                              {getTipIcon(tip.icon)}
                            </div>
                            <div>
                              <h4 className={`font-serif font-bold text-sm sm:text-base ${isDark ? 'text-white' : 'text-stone-900'}`}>
                                {tip.title}
                              </h4>
                              <p className={`text-xs sm:text-sm mt-1 leading-relaxed ${isDark ? 'text-stone-200' : 'text-stone-600'}`}>
                                {tip.desc}
                              </p>
                            </div>
                          </div>
                        ))}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </div>
          )}
        </div>
      </section>
    </div>
  );
};
