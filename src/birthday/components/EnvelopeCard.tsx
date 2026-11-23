import React, { useState, useEffect, useRef, useMemo } from 'react';
import { motion, AnimatePresence, useScroll, useTransform } from 'motion/react';
import {
  MapPin,
  Heart,
  Cake,
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
  MessageCircle,
} from 'lucide-react';
import { CardStyleId, WeddingSettings, Guest, ItineraryItem, GiftRegistryItem, WeddingTipItem } from '../../types.ts';
import { CARD_THEMES } from '../themes.ts';
import { formatHeroDate, parseEventTargetDate, calculateCountdownTimeLeft } from '../../lib/dateFormatters.ts';
import { getBankAccountBadgeText, getBankAccounts, hasBankAccountData } from '../../lib/bankAccounts.ts';
import { getGiftRegistryCopy, getGiftRegistryMessage } from '../../lib/giftRegistryCopy.ts';
import { getContrastTextColor } from '../../lib/colorUtils.ts';
import { parseDressCodePalette } from '../../lib/dressCodePalette.ts';
import { preserveViewportPosition } from '../../lib/preserveViewportPosition.ts';
import { SocialVideoEmbed } from '../../components/SocialVideoEmbed.tsx';
import { getWhatsappRsvpUrl } from '../../lib/whatsappRsvp.ts';
import { getThemeDisplayFontFamily } from '../../lib/rsvpButtonStyle.ts';
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
import { BankAccountDetails } from '../../components/BankAccountDetails.tsx';
import { NumeralText } from '../../components/NumeralText.tsx';
import { HeroEmblem } from '../../components/HeroEmblem.tsx';
import {
  DiscoBall,
  SilverGlitterStar,
  SilverGlitterWavyFrame,
  SilverFoilBalloonText,
} from '../../components/animations/discoSilver.tsx';

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
}

const renderHeroEmblem = (heroIconStyle?: string, cardStyle: string = 'classic-gold', sparse = false, themeAccent?: string, emblemColor?: string, glowIntensity?: number, sparkleIntensity?: number, emblemScale?: number) => {
  const effectiveIcon = (heroIconStyle && heroIconStyle !== 'auto') ? heroIconStyle : cardStyle;
  const accentColor = themeAccent || CARD_THEMES[effectiveIcon as CardStyleId]?.accentColorHex || '#C5A059';
  return <HeroEmblem cardStyle={effectiveIcon} accentColor={accentColor} sparse={sparse} color={emblemColor} glowIntensity={glowIntensity} sparkleIntensity={sparkleIntensity} scale={emblemScale} birthday />;
};

export const EnvelopeCard: React.FC<EnvelopeCardProps> = ({
  settings,
  guest,
  onOpenRsvp,
}) => {
  const heroContainerRef = useRef<HTMLDivElement>(null);
  
  // Composite Theme Resolution: inherit base, overlay custom colors and typography
  const baseTheme = CARD_THEMES[settings.cardStyle] || CARD_THEMES['classic-gold'];
  const colorTheme = (settings.colorPaletteStyle && settings.colorPaletteStyle !== 'auto')
    ? (CARD_THEMES[settings.colorPaletteStyle as CardStyleId] || baseTheme)
    : baseTheme;
  const fontTheme = (settings.fontPairStyle && settings.fontPairStyle !== 'auto')
    ? (CARD_THEMES[settings.fontPairStyle as CardStyleId] || baseTheme)
    : baseTheme;

  const theme = {
    ...baseTheme,
    bgHex: settings.customBgColor || colorTheme.bgHex,
    secondaryBgHex: colorTheme.secondaryBgHex,
    accentColorHex: settings.customAccentColor || colorTheme.accentColorHex,
    itineraryAccentColorHex: settings.customAccentColor || colorTheme.itineraryAccentColorHex || colorTheme.accentColorHex,
    primaryColorHex: colorTheme.primaryColorHex,
    cardBgClass: colorTheme.cardBgClass,
    textPrimaryClass: colorTheme.textPrimaryClass,
    textSecondaryClass: colorTheme.textSecondaryClass,
    accentClass: colorTheme.accentClass,
    borderClass: colorTheme.borderClass,
    fontDisplay: fontTheme.fontDisplay,
    fontBody: fontTheme.fontBody,
  };
  const themeDisplayFontFamily = getThemeDisplayFontFamily(theme.fontDisplay);
  const accentContrastColor = getContrastTextColor(theme.accentColorHex);
  const isDark = (settings.colorPaletteStyle && settings.colorPaletteStyle !== 'auto')
    ? (settings.colorPaletteStyle === 'dark-luxury' || settings.colorPaletteStyle === 'royal-navy' || settings.colorPaletteStyle === 'emerald-botanical')
    : (settings.cardStyle === 'dark-luxury' || settings.cardStyle === 'royal-navy' || settings.cardStyle === 'emerald-botanical');

  const activeFrameStyle = (settings.frameOrnamentStyle && settings.frameOrnamentStyle !== 'auto')
    ? settings.frameOrnamentStyle
    : settings.cardStyle;
  const activeDividerStyle = (settings.dividerStyle && settings.dividerStyle !== 'auto')
    ? settings.dividerStyle
    : settings.cardStyle;
  const activeWaveStyle = (settings.transitionWaveStyle && settings.transitionWaveStyle !== 'auto')
    ? settings.transitionWaveStyle
    : settings.cardStyle;
  const activeWaveTheme = CARD_THEMES[activeWaveStyle as CardStyleId] || baseTheme;
  const activeWaveAccentColor = settings.customAccentColor
    || ((settings.colorPaletteStyle && settings.colorPaletteStyle !== 'auto')
      ? colorTheme.accentColorHex
      : activeWaveTheme.accentColorHex);

  const [expandedSection, setExpandedSection] = useState<'none' | 'ceremony' | 'reception' | 'itinerary' | 'dresscode' | 'gifts' | 'tips'>('none');
  const [copiedKey, setCopiedKey] = useState<string | null>(null);
  const bankAccounts = getBankAccounts(settings);
  const giftCopy = getGiftRegistryCopy(settings.giftRegistryCopy);
  const giftMessage = getGiftRegistryMessage(settings.giftRegistryMessage, settings.eventType);
  const hasVisibleBankAccounts = settings.enableBankTransfer === true && bankAccounts.some(hasBankAccountData);

  const whatsappRsvpUrl = useMemo(() => getWhatsappRsvpUrl(settings, guest), [settings, guest]);
  const heroVenueName = (settings.receptionVenue || settings.ceremonyVenue || '').trim();
  const heroVenueAddress = (settings.receptionAddress || settings.ceremonyAddress || '').trim();
  const heroMapsUrl = (settings.receptionMapsUrl || settings.ceremonyMapsUrl || '').trim();
  const isDirectWhatsappRsvp = settings.rsvpActionType === 'whatsapp' && Boolean(whatsappRsvpUrl);
  const isBothRsvp = settings.rsvpActionType === 'both' && Boolean(whatsappRsvpUrl);
  const showBankAccountsWhenCollapsed = settings.showBankAccountsWhenCollapsed !== false;

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
      case 'disco-silver':
        paletteList = ['#FFFFFF', '#E2E8F0', '#94A3B8', '#334155', '#08080A'];
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
  const heroBgBlur = useTransform(scrollY, [0, 80, 240, 480], ['blur(0px)', 'blur(4px)', 'blur(14px)', 'blur(28px)']);
  const heroBgScale = useTransform(scrollY, [0, 480], [1, 1.1]);
  const heroBgOpacity = useTransform(scrollY, [0, 300, 600], [1, 0.85, 0.4]);
  const heroContentOpacity = useTransform(scrollY, [0, 260], [1, 0]);
  const heroContentY = useTransform(scrollY, [0, 320], ['0px', '-35px']);
  const heroContentBlur = useTransform(scrollY, [0, 80, 260], ['blur(0px)', 'blur(0px)', 'blur(6px)']);

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

  const coupleNamesSafe = settings.coupleNames || 'Lucas Martín';
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
  const hasVisibleContentSections = Boolean(
    settings.showWelcomeSection !== false ||
    settings.showItinerary !== false ||
    settings.showLocations !== false ||
    settings.showDressCode !== false ||
    settings.showGiftRegistry !== false ||
    settings.showPhotoGallery !== false ||
    Boolean(settings.showVideoMemories) ||
    Boolean(settings.showGuestbook) ||
    Boolean(settings.showHotels) ||
    Boolean(settings.showTips) ||
    settings.showRsvpSection !== false
  );
  const isStandaloneHero = !hasVisibleContentSections && (settings.showCountdown === false || heroCountdownEnabled);
  const heroGuestPillEnabled = Boolean(settings.heroShowGuestPill && guest?.fullName?.trim());
  const heroHasManyElements = Boolean(
    settings.heroShowLocation ||
    settings.heroShowRsvpButton ||
    heroCountdownEnabled ||
    heroGuestPillEnabled ||
    heroHasFamilyContent
  );
  const heroNameFontSize = coupleNamesSafe.length > 18
    ? (heroHasManyElements ? 'clamp(1.75rem, 5vw, 4rem)' : (heroIsSparse ? 'clamp(2.5rem, 8vw, 6.5rem)' : 'clamp(2rem, 6vw, 5rem)'))
    : (heroHasManyElements ? 'clamp(2rem, 6vw, 4.5rem)' : (heroIsSparse ? 'clamp(2.75rem, 9vw, 7rem)' : 'clamp(2.25rem, 7vw, 5.5rem)'));
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
    return `https://calendar.google.com/calendar/render?action=TEMPLATE&text=Cumplea%C3%B1os+de+${encodeURIComponent(coupleNamesSafe)}&dates=${startStr}/${endStr}&details=Celebraci%C3%B3n+de+mi+cumplea%C3%B1os.&location=${encodeURIComponent(receptionLocationName)}`;
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

  const scrollToContent = () => (document.getElementById('detalles-cumpleanos') || document.getElementById('detalles-boda'))?.scrollIntoView({ behavior: 'smooth' });

  const renderCourtCard = () => {
    const activeCourtItems = [
      settings.heroShowBrideParents && settings.heroBrideParents?.trim()
        ? { title: settings.heroBrideParentsTitle?.trim() || 'Padres de la Novia', names: settings.heroBrideParents.trim() }
        : null,
      settings.heroShowGroomParents && settings.heroGroomParents?.trim()
        ? { title: settings.heroGroomParentsTitle?.trim() || 'Padres del Novio', names: settings.heroGroomParents.trim() }
        : null,
      settings.heroShowPadrinos && settings.heroPadrinos?.trim()
        ? { title: settings.heroPadrinosTitle?.trim() || (settings.eventType === 'xv' ? 'Mis Padrinos' : 'Nuestros Padrinos'), names: settings.heroPadrinos.trim() }
        : null,
      settings.heroShowWitnesses && settings.heroWitnesses?.trim()
        ? { title: settings.heroWitnessesTitle?.trim() || 'Testigos', names: settings.heroWitnesses.trim() }
        : null,
    ].filter(Boolean) as { title: string; names: string }[];

    if (activeCourtItems.length === 0) return null;

    const cardTitle = settings.heroCourtTitle?.trim() || (settings.eventType === 'xv' ? 'Con la bendición de mi familia' : 'Con la bendición de Dios y de nuestras familias');

    return (
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.85, delay: 0.28 }}
        className="my-3 sm:my-4 w-full max-w-xl mx-auto px-5 py-3 sm:py-4 rounded-2xl bg-black/40 backdrop-blur-md border border-amber-200/30 text-center shadow-xl"
      >
        <span className="text-[9px] sm:text-xs uppercase tracking-[0.25em] text-amber-200/90 font-serif font-medium block mb-2 sm:mb-3 drop-shadow-xs">
          ✦ {cardTitle} ✦
        </span>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4 text-center">
          {activeCourtItems.map((item, idx) => {
            const isAloneOnRow =
              activeCourtItems.length % 2 !== 0 && idx === activeCourtItems.length - 1;
            return (
              <div
                key={idx}
                className={`flex flex-col items-center text-center ${
                  isAloneOnRow ? 'sm:col-span-2 max-w-md mx-auto' : ''
                }`}
              >
                <span className="text-[9px] sm:text-[11px] uppercase tracking-wider text-amber-200/80 font-serif font-semibold">
                  {item.title}
                </span>
                <p className="text-xs sm:text-sm md:text-base font-serif italic text-white tracking-wide mt-0.5 drop-shadow-sm">
                  {item.names}
                </p>
              </div>
            );
          })}
        </div>
      </motion.div>
    );
  };

  return (
    <div className={`w-full relative transition-colors duration-500 ${isStandaloneHero ? 'h-full max-h-[100svh] overflow-hidden' : ''}`} style={{ backgroundColor: theme.bgHex }}>
      <div
        ref={heroContainerRef}
        className={`w-full text-center px-3 sm:px-6 select-none z-0 flex flex-col justify-between items-center ${
          isStandaloneHero
            ? 'relative h-[100svh] max-h-[100svh] overflow-hidden py-1 sm:py-2'
            : 'sticky top-0 h-[100svh] min-h-[560px] overflow-hidden py-2 sm:py-4'
        }`}
      >
        <motion.div
          style={{
            opacity: isStandaloneHero ? 1 : heroBgOpacity,
            filter: !isStandaloneHero && settings.heroEnableScrollBlur !== false ? heroBgBlur : undefined
          }}
          className="absolute inset-0 w-full h-full pointer-events-none will-change-[opacity,filter]"
        >
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
              className="absolute inset-0 bg-no-repeat"
              style={{
                backgroundImage: `url(${displayedCoverImage})`,
                backgroundSize: settings.heroImageFit || 'cover',
                backgroundPosition: settings.heroImagePosition === 'top' ? 'center top' : 'center center',
                scale: heroBgScale,
              }}
            >
              {(() => {
                const baseAlpha = (settings.heroOverlayOpacity !== undefined ? settings.heroOverlayOpacity : 50) / 100;
                const alpha = settings.cardStyle === 'disco-silver' ? Math.max(0.72, baseAlpha) : baseAlpha;
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

          <AnimatedAmbientParticles variant={settings.ambientParticleStyle} cardStyle={settings.cardStyle} count={14} />

          {/* Disco Silver Party Specific Corner Decorations */}
          {settings.cardStyle === 'disco-silver' && (
            <div className="absolute inset-0 pointer-events-none z-10 overflow-hidden">
              <SilverGlitterWavyFrame />
              {/* Top-Right Hanging Disco Ball */}
              <div className="absolute top-1 right-1 sm:top-2 sm:right-4 z-20 pointer-events-none">
                <div className="block sm:hidden">
                  <DiscoBall size={80} withString stringLength={22} floatDelay={0} />
                </div>
                <div className="hidden sm:block">
                  <DiscoBall size={135} withString stringLength={45} floatDelay={0} />
                </div>
              </div>
              {/* Secondary Right Disco Ball */}
              <div className="absolute top-24 right-1 sm:top-36 sm:right-6 z-20 pointer-events-none opacity-85">
                <div className="block sm:hidden">
                  <DiscoBall size={50} floatDelay={1.5} />
                </div>
                <div className="hidden sm:block">
                  <DiscoBall size={80} floatDelay={1.5} />
                </div>
              </div>
              {/* Bottom-Left Disco Ball */}
              <div className="absolute bottom-2 left-1 sm:bottom-4 sm:left-4 z-20 pointer-events-none">
                <div className="block sm:hidden">
                  <DiscoBall size={70} floatDelay={0.8} />
                </div>
                <div className="hidden sm:block">
                  <DiscoBall size={120} floatDelay={0.8} />
                </div>
              </div>

              {/* Scattered Glitter Stars */}
              <SilverGlitterStar size={20} className="absolute top-20 left-4 sm:left-14" rotation={15} twinkleDelay={0.2} />
              <SilverGlitterStar size={28} className="absolute top-40 right-10 sm:right-28" rotation={-25} twinkleDelay={0.7} />
              <SilverGlitterStar size={18} className="absolute bottom-36 left-8 sm:left-24" rotation={20} twinkleDelay={1.2} />
              <SilverGlitterStar size={30} className="absolute bottom-20 right-6 sm:right-20" rotation={-12} twinkleDelay={1.8} />
              <SilverGlitterStar size={24} className="absolute top-1/2 left-3 sm:left-10" rotation={45} twinkleDelay={2.2} />
            </div>
          )}
        </motion.div>

        <motion.div
          style={{
            opacity: isStandaloneHero ? 1 : heroContentOpacity,
            y: isStandaloneHero ? 0 : heroContentY,
            filter: isStandaloneHero ? undefined : heroContentBlur
          }}
          className={`relative z-10 w-full flex flex-col justify-between items-center will-change-[opacity,filter,transform] ${
            isStandaloneHero ? 'h-full max-h-full overflow-hidden pt-1 pb-2 sm:pb-3' : 'h-full pt-1 sm:pt-4 pb-2 sm:pb-3'
          }`}
        >
          {settings.cardStyle === 'disco-silver' ? (
            <div className={`w-full max-w-xl mx-auto flex flex-col items-center justify-center my-auto px-2 sm:px-3 text-center text-white z-20 ${heroHasManyElements ? 'py-0.5 sm:py-1' : 'py-1 sm:py-2'}`}>
              {/* 1. Motivo Vectorial Animado en Portada (heroShowIcon) */}
              {settings.heroShowIcon && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.8 }}
                  className={heroHasManyElements ? "mb-0.5" : "mb-1 sm:mb-2"}
                >
                  {renderHeroEmblem(
                    settings.heroIconStyle,
                    settings.cardStyle,
                    heroIsSparse,
                    theme.accentColorHex,
                    settings.heroEmblemColor,
                    settings.heroEmblemGlow,
                    settings.heroEmblemSparkle,
                    heroHasManyElements ? Math.min(settings.heroEmblemScale || 0.85, 0.85) : settings.heroEmblemScale
                  )}
                </motion.div>
              )}

              {/* Image 1 Cursive Script Intro & Heading */}
              {(() => {
                const effectiveHeading = (
                  settings.heroHeadingText?.trim() ||
                  (settings.letterHeadingText?.trim() && !/^it['’]s\s*my/i.test(settings.letterHeadingText.trim()) ? settings.letterHeadingText.trim() : '') ||
                  'Birthday'
                );

                let introText: string = '';
                if (settings.heroIntroText !== undefined) {
                  introText = settings.heroIntroText.trim();
                } else {
                  introText = /^it['’]s\s*my/i.test(effectiveHeading) ? '' : "It's my";
                }

                if (/^it['’]s\s*my/i.test(effectiveHeading) && /^it['’]s\s*my/i.test(introText)) {
                  introText = '';
                }

                return (
                  <>
                    {introText ? (
                      <motion.p
                        initial={{ opacity: 0, y: -8 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.8 }}
                        className={`font-great-vibes text-stone-300 drop-shadow-md italic leading-tight ${
                          heroHasManyElements ? 'text-lg sm:text-2xl mb-0' : 'text-xl sm:text-2xl md:text-3xl'
                        }`}
                      >
                        {introText}
                      </motion.p>
                    ) : null}
                    <motion.p
                      initial={{ opacity: 0, scale: 0.92 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ duration: 0.8, delay: 0.15 }}
                      className={`font-great-vibes text-white leading-tight font-normal drop-shadow-[0_4px_20px_rgba(255,255,255,0.4)] drop-shadow-[0_4px_16px_rgba(0,0,0,0.95)] ${
                        heroHasManyElements ? 'text-3xl sm:text-5xl md:text-6xl my-0' : 'text-4xl sm:text-6xl md:text-7xl my-0 sm:my-0.5'
                      }`}
                    >
                      {effectiveHeading}
                    </motion.p>
                  </>
                );
              })()}

              {/* Roman Serif Eyebrow: Configurable with fallback */}
              <motion.p
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: 0.2 }}
                className={`font-cinzel tracking-[0.2em] sm:tracking-[0.25em] uppercase text-stone-300 drop-shadow-md font-semibold ${
                  heroHasManyElements ? 'text-[9px] sm:text-xs my-0.5' : 'text-[10px] sm:text-xs md:text-sm mt-1 sm:mt-1.5 mb-0.5 sm:mb-1'
                }`}
              >
                {settings.heroInvitationText?.trim() || (settings.eventType === 'xv' ? 'TE INVITO A CELEBRAR MIS XV' : settings.eventType === 'boda' || settings.eventType === 'wedding' ? 'TE INVITAMOS A CELEBRAR NUESTRA BODA' : 'TE INVITO A CELEBRAR MI CUMPLEAÑOS')}
              </motion.p>

              {/* Celebrant Name using dynamic theme.fontDisplay */}
              <motion.h1
                initial={{ opacity: 0, scale: 0.94 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.9, delay: 0.28 }}
                style={{ fontSize: heroNameFontSize, fontFamily: themeDisplayFontFamily }}
                className={`max-w-full text-balance break-words text-white leading-tight tracking-tight drop-shadow-[0_4px_24px_rgba(255,255,255,0.45)] drop-shadow-[0_4px_16px_rgba(0,0,0,0.95)] ${theme.fontDisplay} ${
                  heroHasManyElements ? 'my-0.5 sm:my-1' : 'my-1 sm:my-1.5'
                }`}
              >
                {coupleNamesSafe}
              </motion.h1>

              {/* 2. Píldora de Pases del Invitado en Portada (heroShowGuestPill) */}
              {heroGuestPillEnabled && guest && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.55, delay: 0.28 }}
                  className={`inline-flex max-w-full flex-wrap items-center justify-center gap-x-2 gap-y-1 rounded-full border border-white/30 bg-black/40 px-3 sm:px-4 py-0.5 sm:py-1 text-xs text-white shadow-sm backdrop-blur-md ${
                    heroHasManyElements ? 'my-0.5' : 'my-1'
                  }`}
                >
                  <Users className="h-3.5 w-3.5 shrink-0 text-white/90" aria-hidden="true" />
                  <span className="max-w-full break-words font-semibold">{guest.fullName}</span>
                </motion.div>
              )}

              {/* 3. Framed Date Block */}
              <motion.div
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: 0.35 }}
                className={`w-full max-w-xs sm:max-w-sm mx-auto ${heroHasManyElements ? 'my-0.5 sm:my-1' : 'my-1 sm:my-2'}`}
              >
                <div className="flex items-center justify-center gap-2 sm:gap-3 text-white">
                  <div className="h-[1px] flex-1 bg-white/40" />
                  <span className={`font-serif tracking-wider uppercase font-semibold ${
                    heroHasManyElements ? 'text-[11px] sm:text-xs' : 'text-xs sm:text-sm'
                  }`}>
                    {settings.eventDate ? new Date(settings.eventDate + 'T12:00:00').toLocaleDateString('es-ES', { weekday: 'long' }) : 'Viernes'}
                  </span>
                  <span className={`font-sans font-black tracking-tight text-white drop-shadow-[0_0_10px_rgba(255,255,255,0.7)] ${
                    heroHasManyElements ? 'text-xl sm:text-2xl' : 'text-2xl sm:text-3xl'
                  }`}>
                    {settings.eventDate ? new Date(settings.eventDate + 'T12:00:00').getDate() : '17'}
                  </span>
                  <span className={`font-mono font-medium tracking-wide ${
                    heroHasManyElements ? 'text-[11px] sm:text-xs' : 'text-xs sm:text-sm'
                  }`}>
                    {settings.eventTime || '20:00'}
                  </span>
                  <div className="h-[1px] flex-1 bg-white/40" />
                </div>
                <p className={`uppercase tracking-[0.25em] sm:tracking-[0.35em] text-white/80 font-bold text-center ${
                  heroHasManyElements ? 'text-[9px] sm:text-[10px] mt-0.5' : 'text-[10px] sm:text-xs mt-0.5 sm:mt-1'
                }`}>
                  {settings.eventDate ? new Date(settings.eventDate + 'T12:00:00').toLocaleString('es-ES', { month: 'long' }).toUpperCase() : 'JULIO'}
                </p>
              </motion.div>

              {/* 4. Contador Regresivo en Portada (heroShowCountdown) */}
              {heroCountdownEnabled && (
                <div className={`w-full max-w-sm sm:max-w-md mx-auto px-1 sm:px-2 ${
                  heroHasManyElements ? 'mt-0.5 mb-1' : 'mt-1 mb-2'
                }`}>
                  <AnimatedCountdown
                    settings={settings}
                    guest={guest}
                    cardStyle={settings.cardStyle}
                    customStyle={settings.countdownStyle}
                    customTitle={settings.countdownTitle}
                    showGuestsBadge={false}
                    compact
                  />
                </div>
              )}

              {/* 5. Location venue & full address in Disco Silver */}
              {settings.heroShowLocation && (heroVenueName || heroVenueAddress) && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ duration: 0.8, delay: 0.45 }}
                  className={`flex flex-col items-center justify-center text-center text-stone-200 max-w-md mx-auto px-2 ${
                    heroHasManyElements ? 'text-[11px] sm:text-xs mt-0.5 mb-0.5' : 'text-xs mt-1 mb-1'
                  }`}
                >
                  {heroVenueName && (
                    <div className="flex items-center justify-center gap-1.5 font-semibold text-white drop-shadow">
                      <MapPin className="w-3.5 h-3.5 text-white/90 shrink-0" />
                      <span>{heroVenueName}</span>
                    </div>
                  )}
                  {heroVenueAddress && (
                    <p className="text-[10px] sm:text-[11px] text-stone-300 mt-0.5 leading-snug drop-shadow font-sans">
                      {heroVenueAddress}
                    </p>
                  )}
                </motion.div>
              )}

              {/* 6. Action Pills in Disco Silver: UBICACIÓN y ASISTENCIA */}
              {(settings.heroShowLocation || settings.heroShowRsvpButton) && (
                <motion.div
                  initial={{ opacity: 0, y: 15 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.8, delay: 0.55 }}
                  className={`flex items-center justify-center gap-2 sm:gap-3 flex-wrap z-20 ${
                    heroHasManyElements ? 'mt-1 sm:mt-1.5' : 'mt-1 sm:mt-2'
                  }`}
                >
                  {settings.heroShowLocation && (
                    heroMapsUrl ? (
                      <a
                        href={heroMapsUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className={`rounded-full bg-white text-black font-sans font-black uppercase tracking-wider shadow-xl hover:bg-stone-100 hover:scale-105 active:scale-95 transition-all flex items-center gap-1.5 cursor-pointer ${
                          heroHasManyElements
                            ? 'px-3.5 sm:px-5 py-1.5 sm:py-2 text-[10px] sm:text-xs'
                            : 'px-4 sm:px-6 py-2 sm:py-2.5 text-[11px] sm:text-xs'
                        }`}
                        title="Ver ubicación en Google Maps"
                      >
                        <MapPin className="w-3.5 h-3.5 text-black" />
                        UBICACIÓN
                      </a>
                    ) : (
                      <span
                        className={`rounded-full bg-white/70 text-black/60 font-sans font-black uppercase tracking-wider shadow-md flex items-center gap-1.5 cursor-default select-none ${
                          heroHasManyElements
                            ? 'px-3.5 sm:px-5 py-1.5 sm:py-2 text-[10px] sm:text-xs'
                            : 'px-4 sm:px-6 py-2 sm:py-2.5 text-[11px] sm:text-xs'
                        }`}
                        title="Sin enlace de mapa configurado"
                      >
                        <MapPin className="w-3.5 h-3.5 text-black/50" />
                        UBICACIÓN
                      </span>
                    )
                  )}

                  {settings.heroShowRsvpButton && (
                    isDirectWhatsappRsvp ? (
                      <a
                        href={whatsappRsvpUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className={`rounded-full bg-[#25D366] text-white font-sans font-black uppercase tracking-wider shadow-xl hover:bg-[#20ba59] hover:scale-105 active:scale-95 transition-all flex items-center gap-1.5 cursor-pointer ${
                          heroHasManyElements
                            ? 'px-3.5 sm:px-5 py-1.5 sm:py-2 text-[10px] sm:text-xs'
                            : 'px-4 sm:px-6 py-2 sm:py-2.5 text-[11px] sm:text-xs'
                        }`}
                        title="Confirmar asistencia por WhatsApp"
                      >
                        <MessageCircle className="w-3.5 h-3.5 text-white fill-white" />
                        ASISTENCIA
                      </a>
                    ) : isBothRsvp ? (
                      <>
                        <a
                          href={whatsappRsvpUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className={`rounded-full bg-[#25D366] text-white font-sans font-black uppercase tracking-wider shadow-xl hover:bg-[#20ba59] hover:scale-105 active:scale-95 transition-all flex items-center gap-1.5 cursor-pointer ${
                            heroHasManyElements
                              ? 'px-3.5 sm:px-4 py-1.5 sm:py-2 text-[10px] sm:text-xs'
                              : 'px-4 sm:px-5 py-2 sm:py-2.5 text-[11px] sm:text-xs'
                          }`}
                          title="Confirmar directamente por WhatsApp"
                        >
                          <MessageCircle className="w-3.5 h-3.5 text-white fill-white" />
                          WHATSAPP
                        </a>
                        <button
                          type="button"
                          onClick={onOpenRsvp || (() => document.getElementById('rsvp')?.scrollIntoView({ behavior: 'smooth' }))}
                          className={`rounded-full bg-white text-black font-sans font-black uppercase tracking-wider shadow-xl hover:bg-stone-100 hover:scale-105 active:scale-95 transition-all flex items-center gap-1.5 cursor-pointer ${
                            heroHasManyElements
                              ? 'px-3.5 sm:px-4 py-1.5 sm:py-2 text-[10px] sm:text-xs'
                              : 'px-4 sm:px-5 py-2 sm:py-2.5 text-[11px] sm:text-xs'
                          }`}
                        >
                          <Heart className="w-3.5 h-3.5 text-black fill-black" />
                          FORMULARIO
                        </button>
                      </>
                    ) : (
                      <button
                        type="button"
                        onClick={onOpenRsvp || (() => document.getElementById('rsvp')?.scrollIntoView({ behavior: 'smooth' }))}
                        className={`rounded-full bg-white text-black font-sans font-black uppercase tracking-wider shadow-xl hover:bg-stone-100 hover:scale-105 active:scale-95 transition-all flex items-center gap-1.5 cursor-pointer ${
                          heroHasManyElements
                            ? 'px-3.5 sm:px-5 py-1.5 sm:py-2 text-[10px] sm:text-xs'
                            : 'px-4 sm:px-6 py-2 sm:py-2.5 text-[11px] sm:text-xs'
                        }`}
                      >
                        <Heart className="w-3.5 h-3.5 text-black fill-black" />
                        {settings.rsvpButtonText?.trim() || 'ASISTENCIA'}
                      </button>
                    )
                  )}
                </motion.div>
              )}
            </div>
          ) : (
          <div className={`mx-auto my-auto flex w-full max-w-5xl flex-col items-center justify-center px-3 text-center text-white ${heroIsSparse ? 'gap-3 sm:gap-5' : heroHasManyElements ? 'gap-0.5 sm:gap-1.5' : 'gap-1 sm:gap-2'}`}>
            {settings.heroShowIcon && (
              <motion.div initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.8 }} className={heroHasManyElements ? "mb-0.5" : "mb-1 sm:mb-2"}>
                {renderHeroEmblem(settings.heroIconStyle, settings.cardStyle, heroIsSparse, theme.accentColorHex, settings.heroEmblemColor, settings.heroEmblemGlow, settings.heroEmblemSparkle, heroHasManyElements ? Math.min(settings.heroEmblemScale || 0.85, 0.85) : settings.heroEmblemScale)}
              </motion.div>
            )}
            <motion.p initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8, delay: 0.1 }} className={`max-w-full text-balance tracking-[0.18em] sm:tracking-[0.25em] uppercase text-stone-200 drop-shadow-md font-serif font-medium ${heroIsSparse ? 'text-xl sm:text-2xl md:text-3xl' : heroHasManyElements ? 'text-sm sm:text-lg md:text-xl' : 'text-base sm:text-xl md:text-2xl'}`}>{formatHeroDate(settings.eventDate, settings.heroDateFormat || 'dd.mm.aaaa', settings.heroCustomDateText)}</motion.p>
            {(settings.heroInvitationText?.trim() || settings.eventType === 'birthday' || settings.eventType === 'xv') && (
              <motion.p
                initial={{ opacity: 0, y: -8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.7 }}
                className={`font-sans tracking-[0.22em] uppercase text-stone-200 drop-shadow-md font-medium ${heroHasManyElements ? 'text-[11px] sm:text-xs mb-0.5' : 'text-xs sm:text-sm mb-1'}`}
              >
                {settings.heroInvitationText?.trim() || (settings.eventType === 'xv' ? 'TE INVITO A CELEBRAR MIS XV' : 'TE INVITO A CELEBRAR MI CUMPLEAÑOS')}
              </motion.p>
            )}
            {settings.heroCourtPosition === 'above-names' && renderCourtCard()}
            <motion.h1 initial={{ opacity: 0, scale: 0.94 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.9, delay: 0.2 }} style={{ fontSize: heroNameFontSize, fontFamily: themeDisplayFontFamily }} className={`max-w-full text-balance break-words leading-tight tracking-tight text-white font-normal ${theme.fontDisplay} ${heroHasManyElements ? 'my-0.5 sm:my-1' : 'my-1 sm:my-2'}`}>{coupleNamesSafe}</motion.h1>
            {(!settings.heroCourtPosition || settings.heroCourtPosition === 'below-names') && renderCourtCard()}
            {heroGuestPillEnabled && guest && (
              <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.55, delay: 0.28 }} className={`inline-flex max-w-full flex-wrap items-center justify-center gap-x-2 gap-y-1 rounded-full border bg-black/30 px-3 sm:px-4 py-1 text-xs text-white shadow-sm backdrop-blur-md sm:text-sm ${heroHasManyElements ? 'my-0.5' : 'mt-1'}`} style={{ borderColor: `${theme.accentColorHex}CC` }}>
                <Users className="h-3.5 w-3.5 sm:h-4 sm:w-4 shrink-0" style={{ color: theme.accentColorHex }} aria-hidden="true" />
                <span className="max-w-full break-words font-semibold">{guest.fullName}</span>
                <span className="text-white/80">· {Math.max(1, guest.allocatedPasses || guest.confirmedPasses || 1)} {Math.max(1, guest.allocatedPasses || guest.confirmedPasses || 1) === 1 ? 'pase' : 'pases'}</span>
              </motion.div>
            )}
            <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.9, delay: 0.35 }} className={`w-full max-w-2xl mx-auto ${heroHasManyElements ? 'mt-1' : 'mt-2'}`}>
              <p className={`font-serif italic text-white/95 leading-relaxed drop-shadow-md ${heroIsSparse ? 'text-lg sm:text-xl md:text-2xl' : heroHasManyElements ? 'text-sm sm:text-base md:text-lg' : 'text-base sm:text-lg md:text-xl'}`}>{settings.heroQuote || 'El amor todo lo sufre, todo lo cree, todo lo espera, todo lo soporta.'}</p>

              {(settings.heroVerse ?? '1 Corintios 13:7').trim() && (
                <p className={`mt-1 sm:mt-2 w-full text-xs sm:text-sm font-sans font-semibold uppercase tracking-[0.2em] text-amber-100 drop-shadow-md ${settings.heroVersePosition === 'left' ? 'text-left' : settings.heroVersePosition === 'right' ? 'text-right' : 'text-center'}`}>
                  {(settings.heroVerse ?? '1 Corintios 13:7').trim()}
                </p>
              )}
            </motion.div>
            {heroCountdownEnabled && (
              <div className={`w-full px-1 ${heroHasManyElements ? 'mt-1 mb-0.5' : 'mt-2 mb-1 sm:mt-3'}`}>
                <AnimatedCountdown settings={settings} guest={guest} cardStyle={settings.cardStyle} customStyle={settings.countdownStyle} customTitle={settings.countdownTitle} showGuestsBadge={false} compact />
              </div>
            )}
            {settings.heroCourtPosition === 'below-quote' && renderCourtCard()}
            {/* Location venue & address in standard hero */}
            {settings.heroShowLocation && (heroVenueName || heroVenueAddress) && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: 0.5 }}
                className={`flex flex-col items-center justify-center text-center text-xs sm:text-sm text-stone-200 max-w-md mx-auto px-4 ${heroHasManyElements ? 'mt-1 mb-0.5' : 'mt-3'}`}
              >
                {heroVenueName && (
                  <div className="flex items-center justify-center gap-1.5 font-semibold text-white drop-shadow-md">
                    <MapPin className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-amber-300 shrink-0" />
                    <span>{heroVenueName}</span>
                  </div>
                )}
                {heroVenueAddress && (
                  <p className="text-[11px] sm:text-xs text-stone-200/90 mt-0.5 leading-snug drop-shadow-sm font-sans">
                    {heroVenueAddress}
                  </p>
                )}
              </motion.div>
            )}

            {/* Standard Hero Action Buttons: UBICACIÓN y RSVP */}
            {(settings.heroShowLocation || settings.heroShowRsvpButton) && (
              <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8, delay: 0.65 }} className={`flex flex-wrap items-center justify-center gap-2 sm:gap-3 ${heroHasManyElements ? 'mt-1.5 sm:mt-2.5' : 'mt-4 sm:mt-6'}`}>
                {settings.heroShowLocation && (
                  heroMapsUrl ? (
                    <a
                      href={heroMapsUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className={`rounded-full bg-white/95 text-stone-900 font-sans font-bold uppercase tracking-wider shadow-xl hover:bg-white hover:scale-105 active:scale-95 transition-all flex items-center gap-1.5 cursor-pointer ${
                        heroHasManyElements ? 'px-4 sm:px-5 py-1.5 sm:py-2 text-[11px] sm:text-xs' : 'px-6 py-2.5 text-xs'
                      }`}
                      title="Ver ubicación en Google Maps"
                    >
                      <MapPin className="w-3.5 h-3.5 text-stone-900" /> Ubicación
                    </a>
                  ) : (
                    <span
                      className={`rounded-full bg-white/70 text-stone-900/60 font-sans font-bold uppercase tracking-wider shadow-md flex items-center gap-1.5 cursor-default select-none ${
                        heroHasManyElements ? 'px-4 sm:px-5 py-1.5 sm:py-2 text-[11px] sm:text-xs' : 'px-6 py-2.5 text-xs'
                      }`}
                      title="Sin enlace de mapa configurado"
                    >
                      <MapPin className="w-3.5 h-3.5 text-stone-900/50" /> Ubicación
                    </span>
                  )
                )}

                {settings.heroShowRsvpButton && (
                  isDirectWhatsappRsvp ? (
                    <a
                      href={whatsappRsvpUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className={`rounded-full bg-[#25D366] text-white font-sans font-bold uppercase tracking-wider shadow-xl hover:brightness-110 hover:scale-105 active:scale-95 transition-all flex items-center gap-1.5 cursor-pointer ${
                        heroHasManyElements ? 'px-4 sm:px-5 py-1.5 sm:py-2 text-[11px] sm:text-xs' : 'px-6 py-2.5 text-xs'
                      }`}
                    >
                      <MessageCircle className="w-4 h-4 fill-white text-white" /> Confirmar por WhatsApp
                    </a>
                  ) : isBothRsvp ? (
                    <>
                      <a
                        href={whatsappRsvpUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className={`rounded-full bg-[#25D366] text-white font-sans font-bold uppercase tracking-wider shadow-xl hover:brightness-110 hover:scale-105 active:scale-95 transition-all flex items-center gap-1.5 cursor-pointer ${
                          heroHasManyElements ? 'px-3.5 sm:px-4 py-1.5 sm:py-2 text-[10px] sm:text-xs' : 'px-5 py-2.5 text-xs'
                        }`}
                      >
                        <MessageCircle className="w-3.5 h-3.5 fill-white text-white" /> WhatsApp
                      </a>
                      {onOpenRsvp && (
                        <button onClick={onOpenRsvp} className={`rounded-full bg-gradient-to-r from-amber-600 to-amber-700 text-white font-sans font-bold uppercase tracking-wider shadow-xl hover:brightness-110 hover:scale-105 active:scale-95 transition-all flex items-center gap-1.5 cursor-pointer ${
                          heroHasManyElements ? 'px-3.5 sm:px-4 py-1.5 sm:py-2 text-[10px] sm:text-xs' : 'px-5 py-2.5 text-xs'
                        }`}>
                          <Heart className="w-3.5 h-3.5 fill-white" /> Formulario
                        </button>
                      )}
                    </>
                  ) : onOpenRsvp ? (
                    <button onClick={onOpenRsvp} className={`rounded-full bg-gradient-to-r from-amber-600 to-amber-700 text-white font-sans font-bold uppercase tracking-wider shadow-xl hover:brightness-110 hover:scale-105 active:scale-95 transition-all flex items-center gap-1.5 cursor-pointer ${
                      heroHasManyElements ? 'px-4 sm:px-5 py-1.5 sm:py-2 text-[11px] sm:text-xs' : 'px-6 py-2.5 text-xs'
                    }`}>
                      <Heart className="w-4 h-4 fill-white" /> Confirmar Asistencia
                    </button>
                  ) : null
                )}
              </motion.div>
            )}
          </div>
          )}
          {(hasVisibleContentSections || (settings.showCountdown !== false && !heroCountdownEnabled)) && (
            <motion.div
              animate={{ y: [0, 4, 0] }}
              transition={{ repeat: Infinity, duration: 2 }}
              onClick={scrollToContent}
              className="cursor-pointer flex flex-col items-center text-stone-300 hover:text-white transition-colors pt-1 pb-1 sm:pb-2 shrink-0 z-20"
            >
              <span className="text-[9px] sm:text-[10px] uppercase tracking-[0.25em] font-medium drop-shadow-sm">Ver Invitación</span>
              <ChevronDown className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-amber-200/90" />
            </motion.div>
          )}
        </motion.div>
      </div>

      {/* 2. INVITATION DETAILS SECTION - FUSED INTERACTIVE SECTION WITH INLINE EXPANSIONS */}
      {(hasVisibleContentSections || (settings.showCountdown !== false && !heroCountdownEnabled)) && (
      <section
        id="detalles-cumpleanos"
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
          {settings.showCountdown !== false && (
            <div className="-mt-28 sm:-mt-36 md:-mt-44 mb-6 sm:mb-12 relative z-20 flex justify-center">
              <AnimatedCountdown
                settings={settings}
                guest={guest}
                cardStyle={settings.cardStyle}
                customStyle={settings.countdownStyle}
                customTitle={settings.countdownTitle}
                showGuestsBadge={settings.showCountdownGuestsBadge}
              />
            </div>
          )}

          {/* Section Header: Story & Quote Banner */}
          {settings.showWelcomeSection !== false && (
          <div className="mb-8 sm:mb-12 flex flex-col items-center overflow-visible">
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
              className="mb-4 sm:mb-5 overflow-visible"
            >
              <HeroEmblem cardStyle={activeFrameStyle} accentColor={theme.accentColorHex} birthday={true} eventType="birthday" scale={1.1} />
            </motion.div>

            <div className={`inline-flex items-center gap-2 px-5 py-2 rounded-full border mb-4 shadow-2xs ${theme.accentClass}`}>
              <Sparkles className="w-3.5 h-3.5" />
              <span className="text-xs uppercase tracking-[0.25em] font-semibold font-serif">
                Cumpleaños de {settings.coupleNames || 'Lucas Martín'}
              </span>
            </div>

            <h2 style={{ fontFamily: themeDisplayFontFamily }} className={`text-2xl sm:text-4xl md:text-5xl italic leading-tight max-w-4xl mx-auto font-normal ${theme.textPrimaryClass} ${theme.fontDisplay}`}>
              "{(settings.welcomeMessage && !/casam|boda|novi|matrimoni/i.test(settings.welcomeMessage) ? settings.welcomeMessage : '¡Celebremos juntos! Un año más de vida y momentos inolvidables')}"
            </h2>
            
            <StyleSpecificDivider
              cardStyle={activeDividerStyle}
              className="w-56 sm:w-72 h-10 mx-auto mt-6"
              color={theme.accentColorHex}
            />
            
            <p data-typography-role="subtitle" className={`text-sm sm:text-base font-serif max-w-2xl mx-auto mt-3 leading-relaxed ${isDark ? 'text-stone-300' : 'text-stone-600'}`}>
              {settings.welcomeSubtitle || 'Nos emociona compartir este día tan especial contigo. Toca los botones de cada tarjeta para ver la información completa de manera interactiva.'}
            </p>
          </div>
          )}

          {/* FUSED INTERACTIVE CARDS GRID - items-start ensures expanding one card only expands that single card without stretching siblings */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 text-left my-8 items-start">
            
            {/* 1. CEREMONIA RELIGIOSA (Interactive Card with Embedded Map, GPS and Waze - Fully Clickable) */}
            {settings.showLocations !== false && (
            <div
              className={`w-full ${settings.receptionSameAsCeremony ? 'md:col-span-2 max-w-4xl mx-auto' : ''} p-6 sm:p-8 transition-shadow flex flex-col justify-between border select-none group relative ${theme.cardBgClass} ${theme.cardShapeClass || 'rounded-3xl'} ${theme.cardBorderDecoration || 'shadow-sm'} ${
                expandedSection === 'ceremony' ? 'ring-2 ring-amber-400/50' : 'hover:shadow-xl'
              }`}
            >
              <CardOrnamentFrame cardStyle={activeFrameStyle} accentColor={theme.accentColorHex} />
              <div className="relative z-10">
                <div className="flex items-center justify-between gap-3 mb-4">
                  <div className={`w-12 h-12 flex items-center justify-center border group-hover:scale-105 transition-transform ${theme.cardHeaderShapeClass || 'rounded-2xl'} ${theme.accentClass}`}>
                    {settings.receptionSameAsCeremony ? (
                      <span className="flex items-center gap-0.5">
                        <Cake className="w-6 h-6" style={{ color: theme.accentColorHex }} />
                        <AnimatedChampagneGlasses className="-ml-1 w-6 h-6" />
                      </span>
                    ) : <Cake className="w-7 h-7" style={{ color: theme.accentColorHex }} />}
                  </div>
                  {settings.receptionSameAsCeremony ? (
                    <div className="flex flex-col items-end gap-1">
                      <span data-typography-role="badge" className={`rounded-full border px-2.5 py-1 text-[10px] font-mono font-bold sm:text-xs ${theme.accentClass}`}>Ceremonia · {settings.ceremonyTime || '17:00'} hrs</span>
                      <span data-typography-role="badge" className={`rounded-full border px-2.5 py-1 text-[10px] font-mono font-bold sm:text-xs ${theme.accentClass}`}>Recepción · {settings.receptionTime || '19:30'} hrs</span>
                    </div>
                  ) : (
                    <span data-typography-role="badge" className={`text-xs sm:text-sm font-mono font-bold px-3.5 py-1.5 rounded-full border ${theme.accentClass}`}>
                      {settings.ceremonyTime || '17:00'} hrs
                    </span>
                  )}
                </div>

                <span className="text-xs uppercase tracking-widest font-semibold block mb-1" style={{ color: theme.accentColorHex }}>
                  {settings.receptionSameAsCeremony ? 'Celebración & Fiesta' : 'Recepción de Cumpleaños'}
                </span>
                <h3 style={{ fontFamily: themeDisplayFontFamily }} className={`text-2xl sm:text-3xl font-semibold mb-2 ${theme.textPrimaryClass} ${theme.fontDisplay}`}>
                  {settings.receptionSameAsCeremony ? 'Celebración y Fiesta' : 'Fiesta de Cumpleaños'}
                </h3>
                <p className={`text-base sm:text-lg font-medium ${isDark ? 'text-white' : 'text-stone-900'}`}>{settings.ceremonyVenue || 'Parroquia Principal'}</p>
                <p className={`text-xs sm:text-sm mt-2 flex items-start gap-2 ${isDark ? 'text-stone-200' : 'text-stone-600'}`}>
                  <MapPin className="w-4 h-4 shrink-0 mt-0.5" style={{ color: theme.accentColorHex }} />
                  <span className="min-w-0 break-words [overflow-wrap:anywhere]">{settings.ceremonyAddress || 'Dirección de la ceremonia'}</span>
                </p>
              </div>

              {/* Action Toolbar */}
              <div className={`mt-6 pt-4 border-t ${isDark ? 'border-stone-700/40' : 'border-stone-200/40'} flex items-center justify-between gap-2`}>
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
                    className={`mt-5 pt-4 border-t ${isDark ? 'border-stone-700/40' : 'border-stone-200/40'} space-y-3 overflow-hidden`}
                  >
                    <div className="invitation-responsive-map w-full h-52 sm:h-64 rounded-2xl overflow-hidden border shadow-inner">
                      <iframe title="Mapa Ceremonia" width="100%" height="100%" src={ceremonyEmbedUrl} className="w-full h-full border-0" loading="lazy" />
                    </div>
                    <div className="grid grid-cols-2 gap-2 pt-1">
                      <a
                        href={ceremonyDirectionsUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="invitation-card-action invitation-card-action-compact w-full min-w-0 p-2.5 rounded-xl text-xs font-bold text-center flex items-center justify-center gap-1.5 border"
                        style={{ backgroundColor: theme.accentColorHex, borderColor: theme.accentColorHex, color: accentContrastColor }}
                      >
                        <Car className="w-3.5 h-3.5" />
                        <span>Cómo Llegar (GPS)</span>
                      </a>
                      <a
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
            )}

            {/* 2. RECEPCIÓN & BANQUETE (Interactive Card with Embedded Map, GPS and Waze - Fully Clickable) */}
            {!settings.receptionSameAsCeremony && settings.showLocations !== false && (
            <div
              className={`p-6 sm:p-8 transition-shadow flex flex-col justify-between border select-none group relative ${theme.cardBgClass} ${theme.cardShapeClass || 'rounded-3xl'} ${theme.cardBorderDecoration || 'shadow-sm'} ${
                expandedSection === 'reception' ? 'ring-2 ring-amber-400/50' : 'hover:shadow-xl'
              }`}
            >
              <CardOrnamentFrame cardStyle={activeFrameStyle} accentColor={theme.accentColorHex} />
              <div className="relative z-10">
                <div className="flex items-center justify-between gap-3 mb-4">
                  <div className={`w-12 h-12 flex items-center justify-center border group-hover:scale-105 transition-transform ${theme.cardHeaderShapeClass || 'rounded-2xl'} ${theme.accentClass}`}>
                    <AnimatedChampagneGlasses className="w-9 h-9" />
                  </div>
                  <span data-typography-role="badge" className={`text-xs sm:text-sm font-mono font-bold px-3.5 py-1.5 rounded-full border ${theme.accentClass}`}>
                    {settings.receptionTime || '19:30'} hrs
                  </span>
                </div>

                <span className="text-xs uppercase tracking-widest font-semibold block mb-1" style={{ color: theme.accentColorHex }}>
                  Celebración & Fiesta
                </span>
                <h3 style={{ fontFamily: themeDisplayFontFamily }} className={`text-2xl sm:text-3xl font-semibold mb-2 ${theme.textPrimaryClass} ${theme.fontDisplay}`}>
                  Recepción & Brindis
                </h3>
                <p className={`text-base sm:text-lg font-medium ${isDark ? 'text-white' : 'text-stone-900'}`}>{receptionLocationName}</p>
                <p className={`text-xs sm:text-sm mt-2 flex items-start gap-2 ${isDark ? 'text-stone-200' : 'text-stone-600'}`}>
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
                      <a
                        href={receptionDirectionsUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="invitation-card-action invitation-card-action-compact w-full min-w-0 p-2.5 rounded-xl text-xs font-bold text-center flex items-center justify-center gap-1.5 border shadow-xs"
                        style={{ backgroundColor: theme.accentColorHex, borderColor: theme.accentColorHex, color: accentContrastColor }}
                      >
                        <Car className="w-3.5 h-3.5" />
                        <span>Cómo Llegar (GPS)</span>
                      </a>
                      <a
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

            {/* 3. ITINERARIO & CRONOGRAMA (Full Interactive Timeline Inline - Fully Clickable) */}
            {settings.showItinerary !== false && itineraryList.length > 0 && (
              <div
                className={`p-6 sm:p-8 transition-shadow flex flex-col justify-between border select-none group relative ${theme.cardBgClass} ${theme.cardShapeClass || 'rounded-3xl'} ${theme.cardBorderDecoration || 'shadow-sm'} ${
                  expandedSection === 'itinerary' ? 'ring-2 ring-amber-400/50' : 'hover:shadow-xl'
                }`}
              >
                <CardOrnamentFrame cardStyle={activeFrameStyle} accentColor={theme.accentColorHex} />
                <div className="relative z-10">
                  <div className="flex items-center justify-between gap-3 mb-4">
                    <div className={`w-12 h-12 flex items-center justify-center border group-hover:scale-105 transition-transform ${theme.cardHeaderShapeClass || 'rounded-2xl'} ${theme.accentClass}`}>
                      <Clock className="w-6 h-6 shrink-0" />
                    </div>
                    <span data-typography-role="badge" className={`text-xs uppercase tracking-widest font-bold px-3 py-1 rounded-full border ${theme.accentClass}`}>
                      {itineraryList.length} Momentos Clave
                    </span>
                  </div>

                  <span data-typography-role="detail" className="text-xs uppercase tracking-widest font-semibold block mb-1 opacity-80" style={{ color: theme.accentColorHex }}>
                    Cronograma Oficial
                  </span>
                  <h3 style={{ fontFamily: themeDisplayFontFamily }} className={`text-2xl sm:text-3xl font-semibold mb-2 ${theme.textPrimaryClass} ${theme.fontDisplay}`}>
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
                        <span className="font-mono font-bold" style={{ color: theme.itineraryAccentColorHex }}>{item.time}</span>
                        <span>{item.title}</span>
                      </span>
                    ))}
                    {itineraryList.length > 3 && (
                      <span data-typography-role="badge" className={`text-xs font-serif italic self-center ${isDark ? 'text-stone-300' : 'text-stone-400'}`}>
                        +{itineraryList.length - 3} más
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
                                    {item.title}
                                  </span>
                                  <span data-typography-role="badge" style={{
                                    color: theme.itineraryAccentColorHex,
                                    backgroundColor: `color-mix(in srgb, ${theme.itineraryAccentColorHex} 14%, transparent)`,
                                    borderColor: `color-mix(in srgb, ${theme.itineraryAccentColorHex} 42%, transparent)`,
                                  }} className="font-mono text-xs font-bold px-3 py-1 rounded-full border">
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
            {settings.showGiftRegistry === true && (
              <div
                className={`p-6 sm:p-8 transition-shadow flex flex-col justify-between border select-none group relative ${theme.cardBgClass} ${theme.cardShapeClass || 'rounded-3xl'} ${theme.cardBorderDecoration || 'shadow-sm'} ${
                  expandedSection === 'gifts' ? 'ring-2 ring-amber-400/50' : 'hover:shadow-xl'
                }`}
              >
                <CardOrnamentFrame cardStyle={activeFrameStyle} accentColor={theme.accentColorHex} />
                <div className="relative z-10">
                  <div className="flex items-center justify-between gap-3 mb-4">
                    <div className={`w-12 h-12 flex items-center justify-center border group-hover:scale-105 transition-transform ${theme.cardHeaderShapeClass || 'rounded-2xl'} ${theme.accentClass}`}>
                      <AnimatedGiftBox className="w-8 h-8" />
                    </div>
                    <span className={`text-xs uppercase tracking-widest font-bold px-3 py-1 rounded-full border ${theme.accentClass}`}>
                      {giftCopy.badgeText}
                    </span>
                  </div>

                  <span className="text-xs uppercase tracking-widest font-semibold block mb-1" style={{ color: theme.accentColorHex }}>
                    {giftCopy.eyebrow}
                  </span>
                  <h3 style={{ fontFamily: themeDisplayFontFamily }} className={`text-2xl sm:text-3xl font-semibold mb-2 ${theme.textPrimaryClass} ${theme.fontDisplay}`}>
                    {giftCopy.cardTitle}
                  </h3>
                  <p className={`invitation-card-copy text-xs sm:text-sm leading-relaxed ${isDark ? 'text-stone-200' : 'text-stone-600'}`}>
                    {giftMessage}
                  </p>

                  <div className="mt-3 flex flex-wrap gap-2">
                    {settings.enableBankTransfer === true && bankAccounts.some(hasBankAccountData) && (
                      <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium border ${
                        isDark ? 'bg-stone-800/90 border-stone-600 text-stone-100' : 'bg-white border-stone-200 text-stone-800'
                      }`}>
                        <CreditCard className="w-3.5 h-3.5 text-amber-400" />
                        <span><NumeralText>{getBankAccountBadgeText(bankAccounts[0], giftCopy.bankBadgeFallbackText, giftCopy)}</NumeralText></span>
                      </span>
                    )}
                    {settings.enableEnvelopeGift === true && (
                      <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium border ${
                        isDark ? 'bg-stone-800/90 border-stone-600 text-stone-100' : 'bg-white border-stone-200 text-stone-800'
                      }`}>
                        <Mail className="w-3.5 h-3.5 text-rose-400" />
                        <span>{giftCopy.envelopeGiftTitle}</span>
                      </span>
                    )}
                  </div>
                  {hasVisibleBankAccounts && showBankAccountsWhenCollapsed && (
                    <BankAccountDetails accounts={bankAccounts} isDark={isDark} copiedKey={copiedKey} onCopy={handleCopy} className="mt-4" copy={giftCopy} />
                  )}
                </div>

                {hasAdditionalGiftOptions && <div className={`mt-6 pt-4 border-t ${isDark ? 'border-stone-700/40' : 'border-stone-200/40'} flex items-center justify-between`}>
                  <button
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

                      {hasVisibleBankAccounts && !showBankAccountsWhenCollapsed && (
                        <BankAccountDetails accounts={bankAccounts} isDark={isDark} copiedKey={copiedKey} onCopy={handleCopy} copy={giftCopy} />
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
          </div>

          {/* 5. DRESS CODE INTERACTIVE CARD & VISUAL FASHION GUIDE WITH COLOR PALETTE SELECTION (Fully Clickable) */}
          {settings.showDressCode !== false && (
            <div
              className={`p-6 sm:p-8 max-w-5xl 2xl:max-w-6xl mx-auto my-8 text-center border select-none transition-shadow group relative ${theme.cardBgClass} ${theme.cardShapeClass || 'rounded-3xl'} ${theme.cardBorderDecoration || 'shadow-md'} ${
                expandedSection === 'dresscode' ? 'ring-2 ring-amber-400/50' : 'hover:shadow-xl'
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
                <h3 style={{ fontFamily: themeDisplayFontFamily }} className={`text-2xl sm:text-3xl font-bold ${theme.textPrimaryClass} ${theme.fontDisplay}`}>
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
                    <span className={`text-xs font-serif italic ${isDark ? 'text-stone-300' : 'text-stone-600'}`}>
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

                <p className={`text-xs ${isDark ? 'text-amber-400' : 'text-amber-600'} font-medium mt-6 pt-4 border-t ${isDark ? 'border-stone-700/40' : 'border-stone-200/40'}`}>
                  Favor de confirmar asistencia antes del <strong>{settings.rsvpDeadline || '15 de Noviembre'}</strong>
                </p>
              </div>
            </div>
          )}

          {/* 6. TIPS & RECOMENDACIONES DE LOS NOVIOS (Configurable Interactive Section - Fully Clickable) */}
          {settings.showTips !== false && tipsList.length > 0 && (
            <div
              className={`p-6 sm:p-8 max-w-5xl 2xl:max-w-6xl mx-auto my-8 text-center border select-none transition-shadow group relative ${theme.cardBgClass} ${theme.cardShapeClass || 'rounded-3xl'} ${theme.cardBorderDecoration || 'shadow-md'} ${
                expandedSection === 'tips' ? 'ring-2 ring-amber-400/50' : 'hover:shadow-xl'
              }`}
            >
              <CardOrnamentFrame cardStyle={activeFrameStyle} accentColor={theme.accentColorHex} />
              <div className="relative z-10">
                <div className={`w-12 h-12 flex items-center justify-center mx-auto mb-3 border shadow-xs group-hover:scale-105 transition-transform ${theme.cardHeaderShapeClass || 'rounded-2xl'} ${theme.accentClass}`}>
                  <Lightbulb className="w-6 h-6" style={{ color: theme.accentColorHex }} />
                </div>

                <span className="text-xs uppercase tracking-[0.25em] font-semibold block mb-1" style={{ color: theme.accentColorHex }}>
                  Guía del Evento
                </span>
                <h3 style={{ fontFamily: themeDisplayFontFamily }} className={`text-2xl sm:text-3xl font-bold ${theme.textPrimaryClass} ${theme.fontDisplay}`}>
                  {settings.tipsTitle || 'Tips & Recomendaciones para la Fiesta'}
                </h3>
                <p className={`invitation-card-copy text-xs sm:text-sm mt-2 max-w-xl mx-auto leading-relaxed ${isDark ? 'text-stone-300' : 'text-stone-600'}`}>
                  Información y sugerencias clave preparadas con cariño para que disfrutes al máximo cada momento de nuestro cumpleaños.
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
        </div>
      </section>
      )}
    </div>
  );
};
