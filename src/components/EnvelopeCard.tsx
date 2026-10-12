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
  ChevronLeft,
  ChevronRight,
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
  Users,
} from 'lucide-react';
import { CardStyleId, WeddingSettings, Guest, ItineraryItem, GiftRegistryItem, WeddingTipItem } from '../types.ts';
import { CARD_THEMES } from '../lib/themes.ts';
import { HeroCourtCard } from './HeroCourtCard.tsx';
import { getDetailSectionOrder } from '../lib/sectionOrder.ts';
import { getBankAccountBadgeText, getBankAccounts, hasBankAccountData } from '../lib/bankAccounts.ts';
import { getGiftRegistryCopy, getGiftRegistryMessage } from '../lib/giftRegistryCopy.ts';
import { getContrastTextColor } from '../lib/colorUtils.ts';
import { resolveInvitationTheme } from '../lib/invitationTheme.ts';
import { preserveViewportPosition } from '../lib/preserveViewportPosition.ts';
import { SocialVideoEmbed } from './SocialVideoEmbed.tsx';
import { getRsvpButtonPresentation, getThemeDisplayFontFamily } from '../lib/rsvpButtonStyle.ts';
import { resolveHeroNumberFontFamily } from '../lib/numberFonts.ts';
import { parseDressCodePalette } from '../lib/dressCodePalette.ts';
import { formatHeroDate, parseEventTargetDate, calculateCountdownTimeLeft } from '../lib/dateFormatters.ts';
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
  AnimatedCountdown,
  AnimatedAmbientParticles,
} from './AnimatedSvgs.tsx';
import { ManFashionMockup, WomanFashionMockup } from './DressCodeSection.tsx';
import { BankAccountDetails } from './BankAccountDetails.tsx';
import { HeroEmblem } from './HeroEmblem.tsx';
import { CardGroupDecorations } from './CardGroupDecorations.tsx';
import { NumeralText } from './NumeralText.tsx';

const WOMAN_OUTFIT_OPTIONS = [
  { id: 'long-gown', label: 'Gala / Vestido Largo' },
  { id: 'cocktail', label: 'Cóctel / Midi' },
  { id: 'jumpsuit', label: 'Enterizo / Palazzo' },
  { id: 'boho', label: 'Bohemio / Fluido' },
] as const;

const MAN_OUTFIT_OPTIONS = [
  { id: 'tuxedo', label: 'Esmoquin / Smoking' },
  { id: 'suit', label: 'Traje Clásico' },
  { id: 'guayabera', label: 'Guayabera Formal' },
  { id: 'blazer', label: 'Blazer & Pantalón' },
] as const;

interface EnvelopeCardProps {
  settings: WeddingSettings;
  guest?: Guest | null;
  onOpenRsvp?: () => void;
  onToggleInlineRsvp?: () => void;
  isInlineRsvpOpen?: boolean;
  inlineRsvp?: React.ReactNode;
  inlineGallery?: React.ReactNode;
}

const renderHeroEmblem = (heroIconStyle?: string, cardStyle: string = 'classic-gold', sparse = false, themeAccent?: string, emblemColor?: string, glowIntensity?: number, sparkleIntensity?: number, emblemScale?: number) => {
  const effectiveIcon = (heroIconStyle && heroIconStyle !== 'auto') ? heroIconStyle : cardStyle;
  const accentColor = themeAccent || CARD_THEMES[effectiveIcon as CardStyleId]?.accentColorHex || '#C5A059';
  return <HeroEmblem cardStyle={effectiveIcon} accentColor={accentColor} sparse={sparse} color={emblemColor} glowIntensity={glowIntensity} sparkleIntensity={sparkleIntensity} scale={emblemScale} />;
};

export const EnvelopeCard: React.FC<EnvelopeCardProps> = ({
  settings,
  guest,
  onOpenRsvp,
  onToggleInlineRsvp,
  isInlineRsvpOpen = false,
  inlineRsvp,
  inlineGallery,
}) => {
  const heroContainerRef = useRef<HTMLDivElement>(null);
  
  const theme = resolveInvitationTheme(settings, CARD_THEMES, 'classic-gold');
  const accentContrastColor = getContrastTextColor(theme.accentColorHex);
  const themeDisplayFontFamily = getThemeDisplayFontFamily(theme.fontDisplay);
  const heroNumberFontFamily = resolveHeroNumberFontFamily(
    settings.typographyHeroNumberFont,
    settings.typographyNumberFont,
    settings,
    themeDisplayFontFamily,
  );
  const rsvpButtonPresentation = getRsvpButtonPresentation(settings.rsvpButtonStyle, settings.cardStyle, theme.accentColorHex);
  const detailSectionOrder = getDetailSectionOrder(settings.detailSectionOrder);
  const bankAccounts = getBankAccounts(settings);
  const giftCopy = getGiftRegistryCopy(settings.giftRegistryCopy);
  const giftMessage = getGiftRegistryMessage(settings.giftRegistryMessage, settings.eventType);
  const hasVisibleBankAccounts = settings.enableBankTransfer === true && bankAccounts.some(hasBankAccountData);
  const showBankAccountsWhenCollapsed = settings.showBankAccountsWhenCollapsed !== false;
  const ceremonyCardOrder = detailSectionOrder.indexOf('ceremony') * 2;
  const receptionCardOrder = detailSectionOrder.indexOf('reception') * 2;
  const sharedLocationCardOrder = Math.min(ceremonyCardOrder, receptionCardOrder);
  const rsvpButtonOrder = detailSectionOrder.indexOf('rsvp') * 2;
  const isDark = theme.isDark;

  const activeFrameStyle = (settings.frameOrnamentStyle && settings.frameOrnamentStyle !== 'auto')
    ? settings.frameOrnamentStyle
    : settings.cardStyle;
  const activeDividerStyle = (settings.dividerStyle && settings.dividerStyle !== 'auto')
    ? settings.dividerStyle
    : settings.cardStyle;
  const activeWaveStyle = (settings.transitionWaveStyle && settings.transitionWaveStyle !== 'auto')
    ? settings.transitionWaveStyle
    : settings.cardStyle;
  const activeWaveTheme = CARD_THEMES[activeWaveStyle as CardStyleId] || theme;
  const activeWaveAccentColor = settings.customAccentColor
    || ((settings.colorPaletteStyle && settings.colorPaletteStyle !== 'auto')
      ? theme.accentColorHex
      : activeWaveTheme.accentColorHex);

  const [expandedSection, setExpandedSection] = useState<'none' | 'ceremony' | 'reception' | 'itinerary' | 'dresscode' | 'gifts' | 'tips'>('none');
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  // Dress Code interactive visualizer state
  let paletteList = parseDressCodePalette(settings.dressCodePalette);
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
  const [activeWomanOutfit, setActiveWomanOutfit] = useState<'long-gown' | 'cocktail' | 'jumpsuit' | 'boho'>(settings.dressCodeWomanOutfit || 'long-gown');
  const [activeManOutfit, setActiveManOutfit] = useState<'tuxedo' | 'suit' | 'guayabera' | 'blazer'>(settings.dressCodeManOutfit || 'tuxedo');
  const [activeGenderView, setActiveGenderView] = useState<'both' | 'women' | 'men'>('both');

  const activeWomanOutfitIndex = WOMAN_OUTFIT_OPTIONS.findIndex((option) => option.id === activeWomanOutfit);
  const activeManOutfitIndex = MAN_OUTFIT_OPTIONS.findIndex((option) => option.id === activeManOutfit);
  const activeWomanOutfitLabel = WOMAN_OUTFIT_OPTIONS[activeWomanOutfitIndex]?.label || WOMAN_OUTFIT_OPTIONS[0].label;
  const activeManOutfitLabel = MAN_OUTFIT_OPTIONS[activeManOutfitIndex]?.label || MAN_OUTFIT_OPTIONS[0].label;
  const stepWomanOutfit = (direction: -1 | 1) => setActiveWomanOutfit((current) => {
    const index = WOMAN_OUTFIT_OPTIONS.findIndex((option) => option.id === current);
    return WOMAN_OUTFIT_OPTIONS[(index + direction + WOMAN_OUTFIT_OPTIONS.length) % WOMAN_OUTFIT_OPTIONS.length].id;
  });
  const stepManOutfit = (direction: -1 | 1) => setActiveManOutfit((current) => {
    const index = MAN_OUTFIT_OPTIONS.findIndex((option) => option.id === current);
    return MAN_OUTFIT_OPTIONS[(index + direction + MAN_OUTFIT_OPTIONS.length) % MAN_OUTFIT_OPTIONS.length].id;
  });
  useEffect(() => setActiveWomanOutfit(settings.dressCodeWomanOutfit || 'long-gown'), [settings.dressCodeWomanOutfit]);
  useEffect(() => setActiveManOutfit(settings.dressCodeManOutfit || 'tuxedo'), [settings.dressCodeManOutfit]);

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

  const toggleSection = (section: 'ceremony' | 'reception' | 'itinerary' | 'dresscode' | 'gifts' | 'tips', trigger?: HTMLElement | null) => {
    preserveViewportPosition(trigger);
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
  let customStoreItems: GiftRegistryItem[] = [];
  try {
    const configuredItems = settings.customStoreItems;
    if (Array.isArray(configuredItems)) {
      customStoreItems = configuredItems;
    } else if (typeof configuredItems === 'string') {
      const parsedItems = JSON.parse(configuredItems);
      if (Array.isArray(parsedItems)) customStoreItems = parsedItems;
    }
  } catch {
    customStoreItems = [];
  }
  const visibleRegistryItems = [...registryItems, ...customStoreItems].filter((item) => {
    const itemTitle = typeof item.title === 'string' ? item.title.trim().toLocaleLowerCase('es') : '';
    if (hasVisibleBankAccounts && (item.type === 'bank' || (!item.url && itemTitle.includes('transferencia bancaria')))) return false;
    if (item.type === 'bank') return settings.enableBankTransfer === true && !hasVisibleBankAccounts;
    if (item.type === 'envelope') return settings.enableEnvelopeGift === true;
    return settings.enableStoreRegistry === true;
  });
  const hasAdditionalGiftOptions = visibleRegistryItems.length > 0
    || (hasVisibleBankAccounts && !showBankAccountsWhenCollapsed);

  let tipsList: WeddingTipItem[] = [];
  let useDefaultTips = settings.tipsList == null;
  try {
    if (typeof settings.tipsList === 'string') {
      tipsList = JSON.parse(settings.tipsList || '[]');
    } else if (Array.isArray(settings.tipsList)) {
      tipsList = settings.tipsList;
    }
  } catch {
    tipsList = [];
    useDefaultTips = true;
  }
  if (useDefaultTips) {
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
  const receptionLocationName = settings.receptionSameAsCeremony ? settings.ceremonyVenue || 'Ceremonia' : settings.receptionVenue || 'Recepción';
  const receptionLocationAddress = settings.receptionSameAsCeremony ? settings.ceremonyAddress || '' : settings.receptionAddress || '';
  const receptionMapsSourceUrl = settings.receptionSameAsCeremony ? settings.ceremonyMapsUrl : settings.receptionMapsUrl;
  const receptionEmbedSourceUrl = settings.receptionSameAsCeremony ? settings.ceremonyEmbedUrl : settings.receptionEmbedUrl;
  const receptionArrivalVideoUrl = settings.receptionSameAsCeremony ? settings.ceremonyArrivalVideoUrl : settings.receptionArrivalVideoUrl;
  const receptionEmbedUrl = getEmbedUrl(receptionLocationName, receptionLocationAddress, receptionEmbedSourceUrl);
  const ceremonyMapsUrl = getMapsSearchUrl(settings.ceremonyVenue || 'Ceremonia', settings.ceremonyAddress || '', settings.ceremonyMapsUrl);
  const receptionMapsUrl = getMapsSearchUrl(receptionLocationName, receptionLocationAddress, receptionMapsSourceUrl);
  const ceremonyDirectionsUrl = getMapsDirectionsUrl(settings.ceremonyVenue || 'Ceremonia', settings.ceremonyAddress || '');
  const receptionDirectionsUrl = getMapsDirectionsUrl(receptionLocationName, receptionLocationAddress);
  const ceremonyWazeUrl = getWazeUrl(settings.ceremonyVenue || 'Ceremonia', settings.ceremonyAddress || '');
  const receptionWazeUrl = getWazeUrl(receptionLocationName, receptionLocationAddress);

  const { scrollY } = useScroll();
  const heroTransitionEnabled = settings.heroEnableScrollBlur !== false;
  const heroBgScale = useTransform(scrollY, [0, 480], [1, heroTransitionEnabled ? 1.06 : 1]);
  const heroBgOpacity = useTransform(scrollY, [0, 300, 600], heroTransitionEnabled ? [1, 0.9, 0.72] : [1, 1, 1]);
  const heroContentOpacity = useTransform(scrollY, [0, 260], [1, 0]);
  const heroContentY = useTransform(scrollY, [0, 320], ['0px', '-35px']);

  const [timeLeft, setTimeLeft] = useState({ days: 0, hours: 0, minutes: 0, seconds: 0 });

  useEffect(() => {
    const calculateTimeLeft = () => {
      const targetDate = parseEventTargetDate(
        settings.eventDate,
        settings.eventTime,
        settings.heroCustomDateText
      );
      const res = calculateCountdownTimeLeft(targetDate);
      setTimeLeft({ days: res.days, hours: res.hours, minutes: res.minutes, seconds: res.seconds });
    };
    calculateTimeLeft();
    const interval = setInterval(calculateTimeLeft, 1000);
    return () => clearInterval(interval);
  }, [settings.eventDate, settings.eventTime, settings.heroCustomDateText]);

  const coupleNamesSafe = settings.coupleNames || 'Sofía & Alejandro';
  const heroHasFamilyContent = (settings.heroCourtPlacement || 'hero') === 'hero' && Boolean(
    (settings.heroShowBrideParents && settings.heroBrideParents?.trim())
    || (settings.heroShowGroomParents && settings.heroGroomParents?.trim())
    || (settings.heroShowPadrinos && settings.heroPadrinos?.trim())
    || (settings.heroShowWitnesses && settings.heroWitnesses?.trim())
  );
  const heroIsSparse = !heroHasFamilyContent
    && !settings.heroShowRsvpButton
    && !settings.heroShowCountdown
    && !settings.heroShowGuestPill
    && (settings.heroQuote || '').trim().length < 110;
  const heroCountdownEnabled = settings.showCountdown !== false && Boolean(settings.heroShowCountdown);
  const heroGuestPillEnabled = Boolean(settings.heroShowGuestPill && guest?.fullName?.trim());
  const heroNameFontSize = coupleNamesSafe.length > 18
    ? (heroIsSparse ? 'clamp(2.5rem, 8vw, 6.5rem)' : 'clamp(2.25rem, 6vw, 5.5rem)')
    : (heroIsSparse ? 'clamp(3rem, 10vw, 7.5rem)' : 'clamp(2.5rem, 7vw, 6rem)');
  const targetDateObj = useMemo(() => {
    return parseEventTargetDate(settings.eventDate, settings.eventTime, settings.heroCustomDateText);
  }, [settings.eventDate, settings.eventTime, settings.heroCustomDateText]);

  const googleCalendarUrl = useMemo(() => {
    const pad = (n: number) => String(n).padStart(2, '0');
    const y = targetDateObj.getFullYear();
    const m = pad(targetDateObj.getMonth() + 1);
    const d = pad(targetDateObj.getDate());
    const h = pad(targetDateObj.getHours());
    const min = pad(targetDateObj.getMinutes());
    const startStr = `${y}${m}${d}T${h}${min}00Z`;
    const endStr = `${y}${m}${d}T235900Z`;
    return `https://calendar.google.com/calendar/render?action=TEMPLATE&text=Boda+de+${encodeURIComponent(coupleNamesSafe)}&dates=${startStr}/${endStr}&details=Celebraci%C3%B3n+de+nuestra+boda.&location=${encodeURIComponent(receptionLocationName)}`;
  }, [targetDateObj, coupleNamesSafe, receptionLocationName]);

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
  const [displayedCoverImage, setDisplayedCoverImage] = useState(currentCoverImage);

  useEffect(() => {
    let isCurrentImage = true;
    const image = new Image();
    const displayLoadedImage = () => {
      if (isCurrentImage && image.naturalWidth > 0) setDisplayedCoverImage(currentCoverImage);
    };
    image.onload = () => {
      if (typeof image.decode === 'function') {
        void image.decode().then(displayLoadedImage).catch(displayLoadedImage);
      } else {
        displayLoadedImage();
      }
    };
    image.src = currentCoverImage;
    if (image.complete && image.naturalWidth > 0) displayLoadedImage();
    return () => {
      isCurrentImage = false;
      image.onload = null;
    };
  }, [currentCoverImage]);

  const scrollToContent = () => document.getElementById('detalles-boda')?.scrollIntoView({ behavior: 'smooth' });

  const familyPlacement = settings.heroCourtPlacement || 'hero';
  const hasCourtInfo = Boolean(
    (settings.heroShowBrideParents && settings.heroBrideParents?.trim())
    || (settings.heroShowGroomParents && settings.heroGroomParents?.trim())
    || (settings.heroShowPadrinos && settings.heroPadrinos?.trim())
    || (settings.heroShowWitnesses && settings.heroWitnesses?.trim())
  );
  const familyPageStartsAfterHero = hasCourtInfo && (
    familyPlacement === 'after-hero'
    || (familyPlacement === 'after-countdown' && (settings.showCountdown === false || settings.heroShowCountdown))
  );
  const countdownPageStartsAfterHero = settings.countdownPlacement === 'after-hero'
    && settings.showCountdown !== false
    && !settings.heroShowCountdown
    && !familyPageStartsAfterHero;
  const renderHeroTransitionDivider = () => (
    <div className="pointer-events-none absolute left-0 right-0 -top-16 z-0 w-full overflow-hidden leading-none sm:-top-22 md:-top-28 lg:-top-32">
      <FixDateAnimatedTransitionDivider
        fillColor={theme.bgHex}
        accentColor={activeWaveAccentColor}
        cardStyle={activeWaveStyle}
        effect={settings.transitionEffect || 'wave'}
      />
    </div>
  );
  const renderCourtCard = () => familyPlacement === 'hero' && hasCourtInfo
    ? <HeroCourtCard settings={settings} theme={theme} />
    : null;
  const renderFamilyPage = (showHeroTransition = false) => familyPlacement !== 'hero' && hasCourtInfo ? (
    <section
      id="familia-de-honor"
      className="relative left-1/2 z-10 flex min-h-screen w-screen max-w-none -translate-x-1/2 items-center justify-center px-4 py-16 sm:py-20"
      style={{ backgroundColor: theme.bgHex }}
    >
      {showHeroTransition && renderHeroTransitionDivider()}
      <HeroCourtCard settings={settings} theme={theme} fullPage />
    </section>
  ) : null;
  const renderCountdownPage = (showHeroTransition = false) => (
    <section
      id="cuenta-regresiva"
      className={`relative z-10 flex min-h-screen w-full items-center justify-center px-4 py-16 sm:py-20 ${showHeroTransition ? 'overflow-visible' : 'overflow-hidden'}`}
      style={{ backgroundColor: theme.bgHex }}
    >
      <AnimatedAmbientParticles variant={settings.ambientParticleStyle} cardStyle={settings.cardStyle} count={12} />
      {showHeroTransition && renderHeroTransitionDivider()}
      <div className="relative z-10 w-full">
        <AnimatedCountdown
          settings={settings}
          guest={guest}
          cardStyle={settings.cardStyle}
          customStyle={settings.countdownStyle}
          customTitle={settings.countdownTitle}
          showGuestsBadge={settings.showCountdownGuestsBadge}
          themeNumberFontFallback={themeDisplayFontFamily}
        />
      </div>
    </section>
  );

  return (
    <div className="w-full relative transition-colors duration-500" style={{ backgroundColor: theme.bgHex }}>
      <div
        ref={heroContainerRef}
        data-invitation-hero=""
        style={{ '--invitation-font-hero-numbers': heroNumberFontFamily } as React.CSSProperties}
        className="sticky top-0 h-[100svh] min-h-[560px] w-full overflow-hidden flex flex-col justify-between items-center text-center px-4 py-6 sm:py-10 select-none z-0"
      >
        <motion.div style={{ opacity: heroBgOpacity }} className="absolute inset-0 w-full h-full pointer-events-none will-change-[opacity]">
          {settings.heroImageFit === 'contain' && (
            <div className="absolute inset-0 bg-cover bg-center filter blur-xl scale-110 opacity-60" style={{ backgroundImage: `url(${displayedCoverImage})` }} />
          )}
          
          <AnimatePresence mode="sync">
            <motion.div
              key={displayedCoverImage}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 1.2, ease: 'easeInOut' }}
              className="absolute inset-0 bg-no-repeat will-change-transform"
              style={{
                backgroundImage: `url(${displayedCoverImage})`,
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

          <AnimatedAmbientParticles variant={settings.ambientParticleStyle} cardStyle={settings.cardStyle} count={8} />
        </motion.div>

        <motion.div style={{ opacity: heroContentOpacity, y: heroContentY }} className="relative z-10 w-full h-full flex flex-col justify-between items-center will-change-[opacity,transform] pt-4 sm:pt-10 pb-14 sm:pb-16">
          <div className={`mx-auto my-auto flex w-full max-w-5xl flex-col items-center justify-center px-3 text-center text-white ${heroIsSparse ? 'gap-3 sm:gap-5' : 'gap-1 sm:gap-2'}`}>
            {settings.heroShowIcon && (
              <motion.div initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.8 }} className="mb-1 sm:mb-2">
                {renderHeroEmblem(settings.heroIconStyle, settings.cardStyle, heroIsSparse, theme.accentColorHex, settings.heroEmblemColor, settings.heroEmblemGlow, settings.heroEmblemSparkle, settings.heroEmblemScale)}
              </motion.div>
            )}
            <motion.p initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8, delay: 0.1 }} className={`max-w-full text-balance tracking-[0.18em] sm:tracking-[0.25em] uppercase text-stone-200 drop-shadow-md font-serif font-medium ${heroIsSparse ? 'text-xl sm:text-2xl md:text-3xl' : 'text-base sm:text-xl md:text-2xl'}`}><NumeralText>{formatHeroDate(settings.eventDate, settings.heroDateFormat || 'dd.mm.aaaa', settings.heroCustomDateText)}</NumeralText></motion.p>
            {settings.heroCourtPosition === 'above-names' && renderCourtCard()}
            <motion.h1 initial={{ opacity: 0, scale: 0.94 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.9, delay: 0.2 }} style={{ fontSize: heroNameFontSize }} className={`max-w-full text-balance break-words italic leading-tight tracking-tight text-white my-1 sm:my-2 font-normal ${theme.fontDisplay}`}><NumeralText>{coupleNamesSafe}</NumeralText></motion.h1>
            {(!settings.heroCourtPosition || settings.heroCourtPosition === 'below-names') && renderCourtCard()}
            {heroGuestPillEnabled && guest && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.55, delay: 0.28 }}
                className="mt-1 inline-flex max-w-full flex-wrap items-center justify-center gap-x-2 gap-y-1 rounded-full border bg-black/30 px-4 py-2 text-xs text-white shadow-sm backdrop-blur-md sm:text-sm"
                style={{ borderColor: `${theme.accentColorHex}CC` }}
              >
                <Users className="h-4 w-4 shrink-0" style={{ color: theme.accentColorHex }} aria-hidden="true" />
                <span className="max-w-full break-words font-semibold">{guest.fullName}</span>
                <span className="text-white/80">· <NumeralText>{Math.max(1, guest.allocatedPasses || guest.confirmedPasses || 1)}</NumeralText> {Math.max(1, guest.allocatedPasses || guest.confirmedPasses || 1) === 1 ? 'pase' : 'pases'}</span>
              </motion.div>
            )}
            <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.9, delay: 0.35 }} className="w-full max-w-2xl mx-auto mt-2">
              <p className={`font-serif italic text-white/95 leading-relaxed drop-shadow-md ${heroIsSparse ? 'text-lg sm:text-xl md:text-2xl' : 'text-base sm:text-lg md:text-xl'}`}><NumeralText>{settings.heroQuote || 'El amor todo lo sufre, todo lo cree, todo lo espera, todo lo soporta.'}</NumeralText></p>

              {(settings.heroVerse ?? '1 Corintios 13:7').trim() && (
                <p className={`mt-2 w-full text-xs sm:text-sm font-sans font-semibold uppercase tracking-[0.2em] text-amber-100 drop-shadow-md ${settings.heroVersePosition === 'left' ? 'text-left' : settings.heroVersePosition === 'right' ? 'text-right' : 'text-center'}`}>
                  <NumeralText>{(settings.heroVerse ?? '1 Corintios 13:7').trim()}</NumeralText>
                </p>
              )}
            </motion.div>
            {heroCountdownEnabled && (
              <div className="mt-2 w-full px-1 sm:mt-3">
                <AnimatedCountdown
                  settings={settings}
                  guest={guest}
                  cardStyle={settings.cardStyle}
                  customStyle={settings.countdownStyle}
                  customTitle={settings.countdownTitle}
                  showGuestsBadge={false}
                  themeNumberFontFallback={themeDisplayFontFamily}
                  compact
                />
              </div>
            )}
            {settings.heroCourtPosition === 'below-quote' && renderCourtCard()}
            {settings.heroShowRsvpButton && settings.showRsvpSection !== false && onOpenRsvp && (
              <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8, delay: 0.7 }} className="flex gap-3 mt-6">
                <button data-typography-role="button" onClick={onOpenRsvp} className="invitation-card-action px-8 py-3 rounded-full bg-gradient-to-r from-amber-600 to-amber-700 text-white font-serif font-semibold text-sm uppercase shadow-xl hover:brightness-110 transition-all flex items-center gap-2">
                  <Heart className="w-4 h-4 fill-white" /> {settings.rsvpButtonText?.trim() || 'Confirmar asistencia'}
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

      {(familyPlacement === 'after-hero' || (familyPlacement === 'after-countdown' && (settings.showCountdown === false || settings.heroShowCountdown))) && renderFamilyPage(familyPageStartsAfterHero)}
      {settings.countdownPlacement === 'after-hero' && settings.showCountdown !== false && !settings.heroShowCountdown && renderCountdownPage(countdownPageStartsAfterHero)}
      {familyPlacement === 'after-countdown' && settings.countdownPlacement === 'after-hero' && settings.showCountdown !== false && !settings.heroShowCountdown && renderFamilyPage()}

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
            accentColor={activeWaveAccentColor}
            cardStyle={activeWaveStyle}
            effect={settings.transitionEffect || 'wave'}
          />
        </div>

        <div className="relative z-10 w-full max-w-7xl 2xl:max-w-[1600px] mx-auto text-center overflow-visible">
          {/* Animated SVG Countdown Section sitting right on the transition wave */}
          {settings.showCountdown !== false && !settings.heroShowCountdown && settings.countdownPlacement !== 'after-hero' && (
            <div className="-mt-28 sm:-mt-36 md:-mt-44 mb-6 sm:mb-12 relative z-20 flex justify-center">
              <AnimatedCountdown
                settings={settings}
                guest={guest}
                cardStyle={settings.cardStyle}
                customStyle={settings.countdownStyle}
                customTitle={settings.countdownTitle}
                showGuestsBadge={settings.showCountdownGuestsBadge}
                themeNumberFontFallback={themeDisplayFontFamily}
              />
            </div>
          )}
          {familyPlacement === 'after-countdown' && settings.countdownPlacement !== 'after-hero' && settings.showCountdown !== false && !settings.heroShowCountdown && renderFamilyPage()}

          {/* Section Header: Story & Quote Banner */}
          <div className="mb-8 sm:mb-12 flex flex-col items-center overflow-visible">
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
              className="mb-4 sm:mb-5 overflow-visible"
            >
              <AnimatedWeddingRings className="w-32 h-20 sm:w-40 sm:h-24 md:w-48 md:h-28 mx-auto" color={theme.accentColorHex} />
            </motion.div>

            <div className={`inline-flex items-center gap-2 px-5 py-2 rounded-full border mb-4 shadow-2xs ${theme.accentClass}`}>
              <Sparkles className="w-3.5 h-3.5" />
              <span data-typography-role="badge" className="text-xs uppercase tracking-[0.25em] font-semibold font-serif">
                Boda de <NumeralText>{settings.coupleNames || 'Sofía & Alejandro'}</NumeralText>
              </span>
            </div>

            <h2 style={{ fontFamily: themeDisplayFontFamily }} className={`text-2xl sm:text-4xl md:text-5xl italic leading-tight max-w-4xl mx-auto font-normal ${theme.textPrimaryClass} ${theme.fontDisplay}`}>
              "<NumeralText>{settings.welcomeMessage || '¡Nos casamos! Nos hace inmensa ilusión celebrar nuestro amor'}</NumeralText>"
            </h2>
            
            <StyleSpecificDivider
              cardStyle={activeDividerStyle}
              className="w-56 sm:w-72 h-10 mx-auto mt-6"
              color={theme.accentColorHex}
            />
            
            <p data-typography-role="subtitle" className={`text-base font-serif max-w-2xl mx-auto mt-3 leading-relaxed ${isDark ? 'text-stone-200' : 'text-stone-700'}`}>
              <NumeralText>{settings.welcomeSubtitle || 'Nos emociona compartir este día tan especial contigo. Toca los botones de cada tarjeta para ver la información completa de manera interactiva.'}</NumeralText>
            </p>
          </div>

          {/* Ordered flexible cards keep the integrated gallery at its selected position. */}
          <CardGroupDecorations
            settings={settings}
            accentColor={theme.accentColorHex}
            className="flex flex-col md:flex-row md:flex-wrap justify-center gap-8 text-left my-8 items-start"
          >
            
            {/* 1. CEREMONIA RELIGIOSA (Interactive Card with Embedded Map, GPS and Waze - Fully Clickable) */}
            <div
              style={{ order: settings.receptionSameAsCeremony ? sharedLocationCardOrder : ceremonyCardOrder, display: settings.showLocations === false ? 'none' : undefined }}
              data-invitation-card="true"
              className={`w-full min-w-0 max-w-full ${settings.receptionSameAsCeremony ? 'md:w-full md:max-w-4xl mx-auto overflow-hidden' : 'md:w-[calc(50%-1rem)]'} p-6 sm:p-8 transition-all flex flex-col justify-between ${settings.borderlessCards ? '!border-0 !ring-0' : 'border'} select-none group relative ${theme.cardBgClass} ${theme.cardShapeClass || 'rounded-3xl'} ${theme.cardBorderDecoration || 'shadow-sm'} ${settings.transparentCards ? '!bg-transparent !bg-none !shadow-none' : ''} ${
                expandedSection === 'ceremony' ? 'ring-2 ring-amber-400/50' : 'hover:-translate-y-1 hover:shadow-xl'
              }`}
            >
              <CardOrnamentFrame cardStyle={activeFrameStyle} accentColor={theme.accentColorHex} />
              <div className="relative z-10">
                <div className="flex items-center justify-between gap-3 mb-4">
                  <div className={`w-12 h-12 flex items-center justify-center border group-hover:scale-105 transition-transform ${theme.cardHeaderShapeClass || 'rounded-2xl'} ${theme.accentClass}`}>
                    {settings.receptionSameAsCeremony ? (
                      <span className="flex items-center">
                        <AnimatedChurchBells className="w-6 h-6" color={theme.accentColorHex} />
                        <AnimatedChampagneGlasses className="-ml-1 w-6 h-6" color={theme.accentColorHex} />
                      </span>
                    ) : <AnimatedChurchBells className="w-9 h-9" color={theme.accentColorHex} />}
                  </div>
                  {settings.receptionSameAsCeremony ? (
                    <div className="flex flex-col items-end gap-1">
                      <span data-typography-role="badge" className={`rounded-full border px-2.5 py-1 text-xs font-mono font-bold ${theme.accentClass}`}>Ceremonia · <NumeralText>{settings.ceremonyTime || '17:00'}</NumeralText> hrs</span>
                      <span data-typography-role="badge" className={`rounded-full border px-2.5 py-1 text-xs font-mono font-bold ${theme.accentClass}`}>Recepción · <NumeralText>{settings.receptionTime || '19:30'}</NumeralText> hrs</span>
                    </div>
                  ) : (
                    <span data-typography-role="badge" className={`text-xs sm:text-sm font-mono font-bold px-3.5 py-1.5 rounded-full border ${theme.accentClass}`}>
                      <NumeralText>{settings.ceremonyTime || '17:00'}</NumeralText> hrs
                    </span>
                  )}
                </div>

                <span data-typography-role="detail" className="text-sm uppercase tracking-[0.12em] sm:tracking-widest font-semibold block mb-1" style={{ color: theme.accentColorHex }}>
                  {settings.receptionSameAsCeremony ? 'Ceremonia & Celebración' : 'Momento Sagrado'}
                </span>
                <h3 className={`text-2xl sm:text-3xl font-semibold mb-2 ${theme.textPrimaryClass} ${theme.fontDisplay}`}>
                  {settings.receptionSameAsCeremony ? 'Ceremonia y Recepción' : 'Ceremonia Religiosa'}
                </h3>
                <p className={`text-base sm:text-lg font-medium ${isDark ? 'text-white' : 'text-stone-900'}`}><NumeralText>{settings.ceremonyVenue || 'Parroquia Principal'}</NumeralText></p>
                <p className={`text-sm mt-2 flex items-start gap-2 leading-relaxed ${isDark ? 'text-stone-200' : 'text-stone-700'}`}>
                  <MapPin className="w-4 h-4 shrink-0 mt-0.5" style={{ color: theme.accentColorHex }} />
                  <span className="min-w-0 break-words [overflow-wrap:anywhere]"><NumeralText>{settings.ceremonyAddress || 'Dirección de la ceremonia'}</NumeralText></span>
                </p>
              </div>

              {/* Action Toolbar */}
              <div className={`mt-6 pt-4 border-t ${isDark ? 'border-stone-700/40' : 'border-stone-200/40'} flex flex-wrap items-center justify-between gap-2`}>
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    toggleSection('ceremony', e.currentTarget);
                  }}
                  className={`invitation-card-action inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-semibold border transition-all cursor-pointer ${
                    expandedSection === 'ceremony'
                      ? 'font-bold'
                      : isDark ? 'bg-stone-800/90 text-stone-100 hover:text-white border-stone-600' : 'bg-white hover:bg-stone-100'
                  }`}
                  style={{
                    color: expandedSection === 'ceremony' ? accentContrastColor : theme.accentColorHex,
                    borderColor: theme.accentColorHex,
                    ...(expandedSection === 'ceremony' ? { backgroundColor: theme.accentColorHex } : {}),
                  }}
                >
                  <Navigation className="w-3.5 h-3.5" />
                  <span>{expandedSection === 'ceremony' ? 'Ocultar Mapa' : settings.receptionSameAsCeremony ? 'Ver ubicación y cómo llegar' : 'Ver Mapa y Rutas'}</span>
                  <ChevronDown className={`w-3.5 h-3.5 transition-transform ${expandedSection === 'ceremony' ? 'rotate-180' : ''}`} />
                </button>

                {settings.ceremonyMapsUrl && (
                  <a
                    data-typography-role="button"
                    href={settings.ceremonyMapsUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    onClick={(e) => e.stopPropagation()}
                    className="text-sm font-semibold flex items-center gap-1.5 hover:underline"
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
                    className={`mt-5 pt-4 border-t ${isDark ? 'border-stone-700/40' : 'border-stone-200/40'} space-y-3 overflow-hidden`}
                  >
                    <div className="invitation-responsive-map w-full h-52 sm:h-64 rounded-2xl overflow-hidden border shadow-inner">
                      <iframe title="Mapa Ceremonia" width="100%" height="100%" src={ceremonyEmbedUrl} className="w-full h-full border-0" loading="lazy" />
                    </div>
                    <div className="grid grid-cols-2 gap-2 pt-1">
                      <a data-typography-role="button"
                        href={ceremonyDirectionsUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="invitation-card-action invitation-card-action-compact w-full min-w-0 p-2.5 rounded-xl text-xs font-bold text-center flex items-center justify-center gap-1.5 border"
                        style={{ backgroundColor: theme.accentColorHex, borderColor: theme.accentColorHex, color: accentContrastColor }}
                      >
                        <Car className="w-3.5 h-3.5" />
                        <span>Cómo Llegar (GPS)</span>
                      </a>
                      <a data-typography-role="button"
                        href={ceremonyWazeUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className={`invitation-card-action invitation-card-action-compact w-full min-w-0 p-2.5 rounded-xl text-xs font-semibold text-center flex items-center justify-center gap-1.5 border ${
                          isDark ? 'bg-stone-800 text-stone-100 border-stone-600' : 'bg-white text-stone-700 border-stone-300'
                        }`}
                      >
                        <Compass className="w-3.5 h-3.5" />
                        <span>Abrir en Waze</span>
                      </a>
                    </div>
                    <SocialVideoEmbed url={settings.ceremonyArrivalVideoUrl} title={settings.receptionSameAsCeremony ? 'Video para llegar a la ceremonia y recepción' : 'Video para llegar a la ceremonia'} />
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* 2. RECEPCIÓN & BANQUETE (Interactive Card with Embedded Map, GPS and Waze - Fully Clickable) */}
            {!settings.receptionSameAsCeremony && (
            <div
              style={{ order: receptionCardOrder, display: settings.showLocations === false ? 'none' : undefined }}
              data-invitation-card="true"
              className={`w-full md:w-[calc(50%-1rem)] p-6 sm:p-8 transition-all flex flex-col justify-between ${settings.borderlessCards ? '!border-0 !ring-0' : 'border'} select-none group relative ${theme.cardBgClass} ${theme.cardShapeClass || 'rounded-3xl'} ${theme.cardBorderDecoration || 'shadow-sm'} ${settings.transparentCards ? '!bg-transparent !bg-none !shadow-none' : ''} ${
                expandedSection === 'reception' ? 'ring-2 ring-amber-400/50 scale-[1.01]' : 'hover:-translate-y-1 hover:shadow-xl'
              }`}
            >
              <CardOrnamentFrame cardStyle={activeFrameStyle} accentColor={theme.accentColorHex} />
              <div className="relative z-10">
                <div className="flex items-center justify-between gap-3 mb-4">
                  <div className={`w-12 h-12 flex items-center justify-center border group-hover:scale-105 transition-transform ${theme.cardHeaderShapeClass || 'rounded-2xl'} ${theme.accentClass}`}>
                    <AnimatedChampagneGlasses className="w-9 h-9" color={theme.accentColorHex} />
                  </div>
                  <span data-typography-role="badge" className={`text-xs sm:text-sm font-mono font-bold px-3.5 py-1.5 rounded-full border ${theme.accentClass}`}>
                    <NumeralText>{settings.receptionTime || '19:30'}</NumeralText> hrs
                  </span>
                </div>

                <span data-typography-role="detail" className="text-xs uppercase tracking-widest font-semibold block mb-1" style={{ color: theme.accentColorHex }}>
                  Celebración & Fiesta
                </span>
                <h3 className={`text-2xl sm:text-3xl font-semibold mb-2 ${theme.textPrimaryClass} ${theme.fontDisplay}`}>
                  Recepción & Brindis
                </h3>
                <p className={`text-base sm:text-lg font-medium ${isDark ? 'text-white' : 'text-stone-900'}`}>{receptionLocationName}</p>
                <p className={`text-sm mt-2 flex items-start gap-2 leading-relaxed ${isDark ? 'text-stone-200' : 'text-stone-700'}`}>
                  <MapPin className="w-4 h-4 text-amber-500 shrink-0 mt-0.5" />
                  <span className="min-w-0 break-words [overflow-wrap:anywhere]">{receptionLocationAddress || 'Dirección de la recepción'}</span>
                </p>
              </div>

              {/* Action Toolbar */}
              <div className={`mt-6 pt-4 border-t ${isDark ? 'border-stone-700/40' : 'border-stone-200/40'} flex items-center justify-between gap-2`}>
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    toggleSection('reception', e.currentTarget);
                  }}
                  className={`invitation-card-action inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-semibold border transition-all cursor-pointer ${
                    expandedSection === 'reception'
                      ? 'font-bold'
                      : isDark ? 'bg-stone-800/90 text-stone-100 hover:text-white border-stone-600' : 'bg-white hover:bg-stone-100'
                  }`}
                  style={{
                    color: expandedSection === 'reception' ? accentContrastColor : theme.accentColorHex,
                    borderColor: theme.accentColorHex,
                    ...(expandedSection === 'reception' ? { backgroundColor: theme.accentColorHex } : {}),
                  }}
                >
                  <Navigation className="w-3.5 h-3.5" />
                  <span>{expandedSection === 'reception' ? 'Ocultar Mapa' : 'Ver Mapa y Rutas'}</span>
                  <ChevronDown className={`w-3.5 h-3.5 transition-transform ${expandedSection === 'reception' ? 'rotate-180' : ''}`} />
                </button>

                {(settings.receptionSameAsCeremony ? settings.ceremonyMapsUrl : settings.receptionMapsUrl) && (
                  <a
                    data-typography-role="button"
                    href={receptionMapsUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    onClick={(e) => e.stopPropagation()}
                    className="text-xs sm:text-sm font-semibold flex items-center gap-1.5 hover:underline"
                    style={{ color: theme.accentColorHex }}
                  >
                    <Compass className="w-4 h-4 shrink-0" style={{ color: theme.accentColorHex }} />
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
                    className={`mt-5 pt-4 border-t ${isDark ? 'border-stone-700/40' : 'border-stone-200/40'} space-y-3 overflow-hidden`}
                  >
                    <div className="invitation-responsive-map w-full h-52 sm:h-64 rounded-2xl overflow-hidden border shadow-inner">
                      <iframe title="Mapa Recepción" width="100%" height="100%" src={receptionEmbedUrl} className="w-full h-full border-0" loading="lazy" />
                    </div>
                    <div className="grid grid-cols-2 gap-2 pt-1">
                      <a data-typography-role="button"
                        href={receptionDirectionsUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="invitation-card-action invitation-card-action-compact w-full min-w-0 p-2.5 rounded-xl text-xs font-bold text-center flex items-center justify-center gap-1.5 border shadow-xs"
                        style={{ backgroundColor: theme.accentColorHex, borderColor: theme.accentColorHex, color: accentContrastColor }}
                      >
                        <Car className="w-3.5 h-3.5" />
                        <span>Cómo Llegar (GPS)</span>
                      </a>
                      <a data-typography-role="button"
                        href={receptionWazeUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className={`invitation-card-action invitation-card-action-compact w-full min-w-0 p-2.5 rounded-xl text-xs font-semibold text-center flex items-center justify-center gap-1.5 border ${
                          isDark ? 'bg-stone-800 text-stone-200 border-stone-700' : 'bg-white text-stone-700 border-stone-300'
                        }`}
                      >
                        <Compass className="w-3.5 h-3.5" />
                        <span>Abrir en Waze</span>
                      </a>
                    </div>
                    <SocialVideoEmbed url={receptionArrivalVideoUrl} title="Video para llegar a la recepción" />
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
            )}
            {settings.showRsvpSection !== false && onToggleInlineRsvp && (
              <div
                style={{ order: rsvpButtonOrder, display: settings.showLocations === false ? 'none' : undefined }}
                className="flex w-full flex-col items-center gap-4 text-center"
              >
                <button data-typography-role="button"
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    onToggleInlineRsvp();
                  }}
                  aria-expanded={isInlineRsvpOpen}
                  aria-controls="rsvp-inline"
                  className={rsvpButtonPresentation.className}
                  style={rsvpButtonPresentation.style}
                >
                  <Heart className="h-5 w-5 fill-current" />
                  {isInlineRsvpOpen ? 'Cerrar confirmación' : settings.rsvpButtonText?.trim() || 'Confirmar asistencia'}
                </button>
                <AnimatePresence>
                  {isInlineRsvpOpen && inlineRsvp && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      exit={{ opacity: 0, height: 0 }}
                      onClick={(e) => e.stopPropagation()}
                      className="w-full overflow-hidden text-left"
                    >
                      {inlineRsvp}
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            )}

            {/* 3. ITINERARIO & CRONOGRAMA (Full Interactive Timeline Inline - Fully Clickable) */}
            {settings.showItinerary !== false && itineraryList.length > 0 && (
              <div
                style={{ order: detailSectionOrder.indexOf('itinerary') * 2 }}
                data-invitation-card="true"
                className={`w-full md:w-[calc(50%-1rem)] p-6 sm:p-8 transition-all flex flex-col justify-between ${settings.borderlessCards ? '!border-0 !ring-0' : 'border'} select-none group relative ${theme.cardBgClass} ${theme.cardShapeClass || 'rounded-3xl'} ${theme.cardBorderDecoration || 'shadow-sm'} ${settings.transparentCards ? '!bg-transparent !bg-none !shadow-none' : ''} ${
                  expandedSection === 'itinerary' ? 'ring-2 ring-amber-400/50 scale-[1.01]' : 'hover:-translate-y-1 hover:shadow-xl'
                }`}
              >
                <CardOrnamentFrame cardStyle={activeFrameStyle} accentColor={theme.accentColorHex} />
                <div className="relative z-10">
                  <div className="flex items-center justify-between gap-3 mb-4">
                    <div className={`w-12 h-12 flex items-center justify-center border group-hover:scale-105 transition-transform ${theme.cardHeaderShapeClass || 'rounded-2xl'} ${theme.accentClass}`}>
                      <Clock className="w-6 h-6 shrink-0" />
                    </div>
                    <span data-typography-role="badge" className={`text-xs uppercase tracking-widest font-bold px-3 py-1 rounded-full border ${theme.accentClass}`}>
                      <NumeralText>{itineraryList.length}</NumeralText> Momentos Clave
                    </span>
                  </div>

                  <span data-typography-role="detail" className="text-xs uppercase tracking-widest font-semibold block mb-1 opacity-80" style={{ color: theme.accentColorHex }}>
                    Cronograma Oficial
                  </span>
                  <h3 className={`text-2xl sm:text-3xl font-semibold mb-2 ${theme.textPrimaryClass} ${theme.fontDisplay}`}>
                    Itinerario del Gran Día
                  </h3>
                  
                  {/* Summary Chips */}
                  <div className="mt-3 flex flex-wrap gap-2">
                    {itineraryList.slice(0, 3).map((item, idx) => (
                      <span data-typography-role="badge"
                        key={idx}
                        className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium border ${
                          isDark ? 'bg-stone-800/90 border-stone-600 text-stone-100' : 'bg-white border-stone-200 text-stone-800'
                        }`}
                      >
                        <span className="font-mono font-bold" style={{ color: theme.itineraryAccentColorHex }}><NumeralText>{item.time}</NumeralText></span>
                        <span><NumeralText>{item.title}</NumeralText></span>
                      </span>
                    ))}
                    {itineraryList.length > 3 && (
                      <span data-typography-role="badge" className={`text-xs font-serif italic self-center ${isDark ? 'text-stone-300' : 'text-stone-400'}`}>
                        +<NumeralText>{itineraryList.length - 3}</NumeralText> más
                      </span>
                    )}
                  </div>
                </div>

                <div className={`mt-6 pt-4 border-t ${isDark ? 'border-stone-700/40' : 'border-stone-200/40'} flex justify-center`}>
                  <button data-typography-role="button"
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      toggleSection('itinerary', e.currentTarget);
                    }}
                    className={`invitation-card-action inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-full text-xs font-bold uppercase tracking-wider transition-all cursor-pointer ${
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
                      className={`mt-6 pt-5 border-t ${isDark ? 'border-stone-700/40' : 'border-stone-200/40'} space-y-4 overflow-hidden`}
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
                                style={{ backgroundImage: `linear-gradient(135deg, color-mix(in srgb, ${theme.itineraryAccentColorHex} 62%, white), ${theme.itineraryAccentColorHex}, color-mix(in srgb, ${theme.itineraryAccentColorHex} 78%, black))` }}
                                className={`absolute top-1 w-9 h-9 sm:w-10 sm:h-10 rounded-full border-2 ${isDark ? 'border-stone-900' : 'border-white'} shadow-md flex items-center justify-center text-stone-950 shrink-0 z-10 transition-transform duration-300 group-hover:scale-110 ${
                                  isOdd ? '-left-12 sm:-left-13' : '-left-14 sm:-left-15'
                                }`}
                              >
                                {getItineraryIcon(item.icon)}
                              </div>
                              <div className={`p-4 rounded-2xl border flex-1 shadow-xs transition-all hover:scale-[1.01] ${
                                  isDark ? 'bg-stone-850 border-stone-600 hover:border-stone-400 shadow-lg' : 'bg-white border-stone-200 hover:border-stone-400'
                              }`}>
                                <div className="flex items-center justify-between gap-2 mb-1.5">
                                  <span data-typography-role="heading" className={`font-serif font-bold text-base ${isDark ? 'text-white' : 'text-stone-900'}`}>
                                    <NumeralText>{item.title}</NumeralText>
                                  </span>
                                  <span data-typography-role="badge" style={{
                                    color: theme.itineraryAccentColorHex,
                                    backgroundColor: `color-mix(in srgb, ${theme.itineraryAccentColorHex} 14%, transparent)`,
                                    borderColor: `color-mix(in srgb, ${theme.itineraryAccentColorHex} 42%, transparent)`,
                                  }} className="font-mono text-xs font-bold px-3 py-1 rounded-full border">
                                    <NumeralText>{item.time}</NumeralText> hrs
                                  </span>
                                </div>
                                {item.desc && (
                                  <p className={`text-xs sm:text-sm leading-relaxed font-serif ${isDark ? 'text-stone-200' : 'text-stone-600'}`}>
                                    <NumeralText>{item.desc}</NumeralText>
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
            {settings.showGiftRegistry === true && (
              <div
                style={{ order: detailSectionOrder.indexOf('gifts') * 2 }}
                data-invitation-card="true"
                className={`w-full md:w-[calc(50%-1rem)] p-6 sm:p-8 transition-all flex flex-col justify-between ${settings.borderlessCards ? '!border-0 !ring-0' : 'border'} select-none group relative ${theme.cardBgClass} ${theme.cardShapeClass || 'rounded-3xl'} ${theme.cardBorderDecoration || 'shadow-sm'} ${settings.transparentCards ? '!bg-transparent !bg-none !shadow-none' : ''} ${
                  expandedSection === 'gifts' ? 'ring-2 ring-amber-400/50 scale-[1.01]' : 'hover:-translate-y-1 hover:shadow-xl'
                }`}
              >
                <CardOrnamentFrame cardStyle={activeFrameStyle} accentColor={theme.accentColorHex} />
                <div className="relative z-10">
                  <div className="flex items-center justify-between gap-3 mb-4">
                    <div className={`w-12 h-12 flex items-center justify-center border group-hover:scale-105 transition-transform ${theme.cardHeaderShapeClass || 'rounded-2xl'} ${theme.accentClass}`}>
                      <AnimatedGiftBox className="w-8 h-8" color={theme.accentColorHex} />
                    </div>
                    <span data-typography-role="badge" className={`text-xs uppercase tracking-widest font-bold px-3 py-1 rounded-full border ${theme.accentClass}`}>
                      {giftCopy.badgeText}
                    </span>
                  </div>

                  <span data-typography-role="detail" className="text-xs uppercase tracking-widest font-semibold block mb-1" style={{ color: theme.accentColorHex }}>
                    {giftCopy.eyebrow}
                  </span>
                  <h3 className={`text-2xl sm:text-3xl font-semibold mb-2 ${theme.textPrimaryClass} ${theme.fontDisplay}`}>
                    {giftCopy.cardTitle}
                  </h3>
                  <p className={`invitation-card-copy text-xs sm:text-sm leading-relaxed ${isDark ? 'text-stone-200' : 'text-stone-600'}`}>
                    {giftMessage}
                  </p>

                  <div className="mt-3 flex flex-wrap gap-2">
                    {settings.enableBankTransfer === true && bankAccounts.some(hasBankAccountData) && (
                      <span data-typography-role="badge" className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium border ${
                        isDark ? 'bg-stone-800/90 border-stone-600 text-stone-100' : 'bg-white border-stone-200 text-stone-800'
                      }`}>
                        <CreditCard className="w-3.5 h-3.5 text-amber-400" />
                        <span><NumeralText>{getBankAccountBadgeText(bankAccounts[0], giftCopy.bankBadgeFallbackText, giftCopy)}</NumeralText></span>
                      </span>
                    )}
                    {settings.enableEnvelopeGift === true && (
                      <span data-typography-role="badge" className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium border ${
                        isDark ? 'bg-stone-800/90 border-stone-600 text-stone-100' : 'bg-white border-stone-200 text-stone-800'
                      }`}>
                        <Mail className="w-3.5 h-3.5 text-rose-400" />
                        <span>{giftCopy.envelopeGiftTitle}</span>
                      </span>
                    )}
                  </div>
                  {hasVisibleBankAccounts && showBankAccountsWhenCollapsed && (
                    <BankAccountDetails
                      accounts={bankAccounts}
                      isDark={isDark}
                      copiedKey={copiedKey}
                      onCopy={handleCopy}
                      className="mt-4"
                      copy={giftCopy}
                    />
                  )}
                </div>

                {hasAdditionalGiftOptions && <div className={`mt-6 pt-4 border-t ${isDark ? 'border-stone-700/40' : 'border-stone-200/40'} flex items-center justify-between`}>
                <button data-typography-role="button"
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      toggleSection('gifts', e.currentTarget);
                    }}
                    className={`inline-flex w-full items-center justify-center gap-2 px-6 py-2.5 rounded-full text-xs font-bold uppercase tracking-wider transition-all cursor-pointer shadow-sm ${
                      expandedSection === 'gifts'
                        ? isDark ? 'bg-[#C5A059] text-stone-950' : 'bg-[#5A5A40] text-white'
                        : isDark ? 'bg-stone-800/90 text-stone-100 hover:text-white border-stone-600' : 'bg-white border border-stone-300 text-[#5A5A40]'
                    }`}
                  >
                    <Sparkles className="w-3.5 h-3.5" />
                    <span>{expandedSection === 'gifts'
                      ? giftCopy.hideOptionsButtonText
                      : hasVisibleBankAccounts && !showBankAccountsWhenCollapsed
                        ? giftCopy.showAccountsButtonText
                        : giftCopy.showOptionsButtonText}</span>
                    <ChevronDown className={`w-3.5 h-3.5 transition-transform ${expandedSection === 'gifts' ? 'rotate-180' : ''}`} />
                  </button>
                </div>}

                {/* Collapsible Bank Accounts & External Registries */}
                {hasAdditionalGiftOptions && <AnimatePresence>
                  {expandedSection === 'gifts' && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      exit={{ opacity: 0, height: 0 }}
                      className={`mt-6 pt-5 border-t ${isDark ? 'border-stone-700/40' : 'border-stone-200/40'} space-y-4 overflow-hidden`}
                    >
                      {false && settings.enableBankTransfer !== false && (settings.bankAccountNumber || settings.bankClabe) && (
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
                                <span className={`font-mono font-bold text-xs ${isDark ? 'text-white' : 'text-stone-900'}`}><NumeralText>{settings.bankAccountNumber}</NumeralText></span>
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
                                <span className={`font-mono font-bold text-xs ${isDark ? 'text-white' : 'text-stone-900'}`}><NumeralText>{settings.bankClabe}</NumeralText></span>
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

                      {hasVisibleBankAccounts && !showBankAccountsWhenCollapsed && (
                        <BankAccountDetails
                          accounts={bankAccounts}
                          isDark={isDark}
                          copiedKey={copiedKey}
                          onCopy={handleCopy}
                          copy={giftCopy}
                        />
                      )}
                      {visibleRegistryItems.map((reg, idx) => (
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
                </AnimatePresence>}
              </div>
            )}
          {/* 5. DRESS CODE INTERACTIVE CARD & VISUAL FASHION GUIDE WITH COLOR PALETTE SELECTION (Fully Clickable) */}
          {settings.showDressCode !== false && (
            <div
              style={{ order: detailSectionOrder.indexOf('dress-code') * 2 }}
              data-invitation-card="true"
              className={`w-full md:w-[calc(50%-1rem)] p-6 sm:p-8 max-w-5xl 2xl:max-w-6xl mx-auto my-8 text-center ${settings.borderlessCards ? '!border-0 !ring-0' : 'border'} select-none transition-all group relative ${theme.cardBgClass} ${theme.cardShapeClass || 'rounded-3xl'} ${theme.cardBorderDecoration || 'shadow-md'} ${settings.transparentCards ? '!bg-transparent !bg-none !shadow-none' : ''} ${
                expandedSection === 'dresscode' ? 'ring-2 ring-amber-400/50 scale-[1.01]' : 'hover:-translate-y-1 hover:shadow-xl'
              }`}
            >
              <CardOrnamentFrame cardStyle={activeFrameStyle} accentColor={theme.accentColorHex} />
              <div className="relative z-10">
                <div className={`w-12 h-12 flex items-center justify-center mx-auto mb-3 border shadow-xs group-hover:scale-105 transition-transform ${theme.cardHeaderShapeClass || 'rounded-2xl'} ${theme.accentClass}`}>
                  <Shirt className="w-6 h-6" style={{ color: theme.accentColorHex }} />
                </div>
                
                <span className="text-xs uppercase tracking-[0.25em] font-semibold block mb-1" style={{ color: theme.accentColorHex }}>
                  Código de Vestimenta
                </span>
                <h3 className={`text-2xl sm:text-3xl font-bold ${theme.textPrimaryClass} ${theme.fontDisplay}`}>
                  {settings.dressCode || 'Formal / Rigurosa Etiqueta'}
                </h3>
                {settings.dressCodeDescription && (
                  <p className={`text-sm sm:text-base mt-2 max-w-xl mx-auto italic ${isDark ? 'text-stone-300' : 'text-stone-600'}`}>
                    "{settings.dressCodeDescription}"
                  </p>
                )}

                {/* Suggested Palette Swatches Banner */}
                {paletteList.length > 0 && (
                  <div className="mt-5 flex flex-col sm:flex-row items-center justify-center gap-3" onClick={(e) => e.stopPropagation()}>
                    <span data-typography-role="detail" className={`text-xs font-serif italic ${isDark ? 'text-stone-300' : 'text-stone-600'}`}>
                      Paleta de colores sugerida:
                    </span>
                    <div className={`flex items-center gap-2 p-1.5 rounded-full border ${isDark ? 'bg-white/5' : 'bg-black/5'} backdrop-blur-xs shadow-xs`}>
                      {paletteList.map((hex, idx) => (
                        <button
                          key={idx}
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            setSelectedPaletteIndex(idx);
                            if (expandedSection !== 'dresscode') toggleSection('dresscode', e.currentTarget);
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
                      toggleSection('dresscode', e.currentTarget);
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
                      className={`mt-8 pt-6 border-t ${isDark ? 'border-stone-700/40' : 'border-stone-200/40'} overflow-hidden text-left`}
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
                            <div className="relative mx-auto w-full max-w-[280px]">
                              <AnimatePresence mode="wait" initial={false}>
                                <motion.div className="mx-auto w-full max-w-[240px]" key={`woman-${activeWomanOutfit}`} initial={{ opacity: 0, x: 18 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -18 }} transition={{ duration: 0.2 }}>
                                  <WomanFashionMockup dressColor={activePaletteColor} accessoryColor="#D4AF37" outfitType={activeWomanOutfit} />
                                </motion.div>
                              </AnimatePresence>
                              <button type="button" aria-label={`Estilo anterior para damas, ${activeWomanOutfitIndex + 1} de ${WOMAN_OUTFIT_OPTIONS.length}`} onClick={(e) => { e.stopPropagation(); stepWomanOutfit(-1); }} className={`absolute left-0 top-1/2 z-10 grid h-9 w-9 -translate-y-1/2 place-items-center rounded-full border shadow-md transition-transform hover:scale-105 ${isDark ? 'bg-[#282B25]' : 'bg-white'}`} style={{ borderColor: theme.accentColorHex, color: theme.accentColorHex }}>
                                <ChevronLeft className="h-5 w-5" />
                              </button>
                              <button type="button" aria-label={`Siguiente estilo para damas, ${activeWomanOutfitIndex + 1} de ${WOMAN_OUTFIT_OPTIONS.length}`} onClick={(e) => { e.stopPropagation(); stepWomanOutfit(1); }} className={`absolute right-0 top-1/2 z-10 grid h-9 w-9 -translate-y-1/2 place-items-center rounded-full border shadow-md transition-transform hover:scale-105 ${isDark ? 'bg-[#282B25]' : 'bg-white'}`} style={{ borderColor: theme.accentColorHex, color: theme.accentColorHex }}>
                                <ChevronRight className="h-5 w-5" />
                              </button>
                            </div>
                            <p aria-live="polite" data-typography-role="detail" className={`font-serif font-bold text-sm mt-3 text-center ${isDark ? 'text-stone-100' : 'text-stone-900'}`}>
                              {activeWomanOutfitLabel} · Damas
                            </p>
                          </div>
                        )}

                        {/* Man Mockup */}
                        {(activeGenderView === 'both' || activeGenderView === 'men') && (
                          <div className="flex flex-col items-center">
                            <div className="relative mx-auto w-full max-w-[280px]">
                              <AnimatePresence mode="wait" initial={false}>
                                <motion.div className="mx-auto w-full max-w-[240px]" key={`man-${activeManOutfit}`} initial={{ opacity: 0, x: 18 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -18 }} transition={{ duration: 0.2 }}>
                                  <ManFashionMockup suitColor={activePaletteColor} shirtColor="#FFFFFF" tieColor={activePaletteColor} outfitType={activeManOutfit} />
                                </motion.div>
                              </AnimatePresence>
                              <button type="button" aria-label={`Estilo anterior para caballeros, ${activeManOutfitIndex + 1} de ${MAN_OUTFIT_OPTIONS.length}`} onClick={(e) => { e.stopPropagation(); stepManOutfit(-1); }} className={`absolute left-0 top-1/2 z-10 grid h-9 w-9 -translate-y-1/2 place-items-center rounded-full border shadow-md transition-transform hover:scale-105 ${isDark ? 'bg-[#282B25]' : 'bg-white'}`} style={{ borderColor: theme.accentColorHex, color: theme.accentColorHex }}>
                                <ChevronLeft className="h-5 w-5" />
                              </button>
                              <button type="button" aria-label={`Siguiente estilo para caballeros, ${activeManOutfitIndex + 1} de ${MAN_OUTFIT_OPTIONS.length}`} onClick={(e) => { e.stopPropagation(); stepManOutfit(1); }} className={`absolute right-0 top-1/2 z-10 grid h-9 w-9 -translate-y-1/2 place-items-center rounded-full border shadow-md transition-transform hover:scale-105 ${isDark ? 'bg-[#282B25]' : 'bg-white'}`} style={{ borderColor: theme.accentColorHex, color: theme.accentColorHex }}>
                                <ChevronRight className="h-5 w-5" />
                              </button>
                            </div>
                            <p aria-live="polite" data-typography-role="detail" className={`font-serif font-bold text-sm mt-3 text-center ${isDark ? 'text-stone-100' : 'text-stone-900'}`}>
                              {activeManOutfitLabel} · Caballeros
                            </p>
                          </div>
                        )}
                      </div>

                      {/* Palette Swatches Bar Inside Simulator */}
                      <div className={`mt-8 pt-4 pb-2 border-t ${isDark ? 'border-stone-700/40' : 'border-stone-200/40'} text-center`}>
                        <p className={`text-xs ${isDark ? 'text-stone-400' : 'text-stone-500'} mb-3 font-serif`}>
                          Toca un color para probarlo en las prendas:
                        </p>
                        <div className="flex flex-wrap items-center justify-center gap-2.5 p-2">
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

              </div>
            </div>
          )}

          {/* 6. TIPS & RECOMENDACIONES DE LOS NOVIOS (Configurable Interactive Section - Fully Clickable) */}
          {settings.showTips !== false && tipsList.length > 0 && (
            <div
              style={{ order: detailSectionOrder.indexOf('tips') * 2 }}
              data-invitation-card="true"
              className={`w-full md:w-[calc(50%-1rem)] p-6 sm:p-8 max-w-5xl 2xl:max-w-6xl mx-auto my-8 text-center ${settings.borderlessCards ? '!border-0 !ring-0' : 'border'} select-none transition-all group relative ${theme.cardBgClass} ${theme.cardShapeClass || 'rounded-3xl'} ${theme.cardBorderDecoration || 'shadow-md'} ${settings.transparentCards ? '!bg-transparent !bg-none !shadow-none' : ''} ${
                expandedSection === 'tips' ? 'ring-2 ring-amber-400/50 scale-[1.01]' : 'hover:-translate-y-1 hover:shadow-xl'
              }`}
            >
              <CardOrnamentFrame cardStyle={activeFrameStyle} accentColor={theme.accentColorHex} />
              <div className="relative z-10">
                <div className={`w-12 h-12 flex items-center justify-center mx-auto mb-3 border shadow-xs group-hover:scale-105 transition-transform ${theme.cardHeaderShapeClass || 'rounded-2xl'} ${theme.accentClass}`}>
                  <Lightbulb className="w-6 h-6" style={{ color: theme.accentColorHex }} />
                </div>

                <span data-typography-role="detail" className="text-xs uppercase tracking-[0.25em] font-semibold block mb-1" style={{ color: theme.accentColorHex }}>
                  Guía del Evento
                </span>
                <h3 className={`text-2xl sm:text-3xl font-bold ${theme.textPrimaryClass} ${theme.fontDisplay}`}>
                  {settings.tipsTitle || 'Tips & Recomendaciones de los Novios'}
                </h3>
                <p className={`invitation-card-copy text-xs sm:text-sm mt-2 max-w-xl mx-auto leading-relaxed ${isDark ? 'text-stone-300' : 'text-stone-600'}`}>
                  Información y sugerencias clave preparadas con cariño para que disfrutes al máximo cada momento de nuestra boda.
                </p>

                {/* Summary Tips Pills */}
                <div className="mt-4 flex flex-wrap justify-center gap-2">
                  {tipsList.map((tip, idx) => (
                    <span data-typography-role="badge"
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
                  <button data-typography-role="button"
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      toggleSection('tips', e.currentTarget);
                    }}
                    className={`invitation-card-action inline-flex items-center gap-2 px-6 py-2.5 rounded-full text-xs font-bold uppercase tracking-wider transition-all cursor-pointer shadow-sm ${
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
                      className={`mt-8 pt-6 border-t ${isDark ? 'border-stone-700/40' : 'border-stone-200/40'} overflow-hidden text-left`}
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
                              <p className={`invitation-card-copy text-xs sm:text-sm mt-1 leading-relaxed ${isDark ? 'text-stone-200' : 'text-stone-600'}`}>
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
          {inlineGallery && settings.showPhotoGallery !== false && (
            <div
              style={{ order: (detailSectionOrder.indexOf(settings.galleryAfterDetailSection || 'reception') * 2) + 1 }}
              className="w-full md:basis-full min-w-0"
            >
              {inlineGallery}
            </div>
          )}
          </CardGroupDecorations>
        </div>
      </section>
    </div>
  );
};
