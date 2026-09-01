export type CardStyleId = 
  | 'classic-gold'
  | 'romantic-floral'
  | 'boho-chic'
  | 'minimal-editorial'
  | 'dark-luxury'
  | 'watercolor-garden';

export type CardStyle = CardStyleId;

export type PlanCategory = 'couple' | 'planner' | 'ceo';

export type PlanId = 
  | 'free' 
  | 'atelier' 
  | 'elite' 
  | 'planner_starter' 
  | 'planner_pro' 
  | 'ceo_unlimited';

export type UserRole = 'ceo' | 'wedding_planner' | 'couple' | 'admin';

export interface PlanDetails {
  id: PlanId;
  category: PlanCategory;
  name: string;
  badge: string;
  price: string;
  originalPrice?: string;
  billingPeriod: string;
  description: string;
  features: string[];
  highlight?: boolean;
  popular?: boolean;
  ctaText: string;
  maxWeddings: number | 'unlimited';
  limits: {
    maxGuests: number | 'unlimited';
    allowedThemes: number | 'all';
    customAudio: boolean;
    photoGallery: boolean;
    csvExport: boolean;
    customSlug: boolean;
    whatsappDirect: boolean;
    rsvpAnalytics: boolean;
    multiClientAccess?: boolean;
    whiteLabel?: boolean;
    prioritySupport?: boolean;
    ceoControls?: boolean;
  };
}

export interface UserProfile {
  id?: number;
  uid: string;
  email: string;
  name?: string | null;
  role?: UserRole | string | null;
  plan: PlanId;
  agencyName?: string | null;
  phone?: string | null;
  weddingsCount?: number;
  createdAt?: string;
}

export interface WeddingSettings {
  id: number;
  userId?: number | null;
  ownerUid?: string | null;
  slug?: string | null;
  isPublished?: boolean;
  coupleNames: string;
  hashtag: string;
  eventDate: string;
  eventTime: string;
  ceremonyVenue: string;
  ceremonyAddress: string;
  ceremonyMapsUrl: string;
  ceremonyEmbedUrl?: string;
  ceremonyPlaceQuery?: string;
  ceremonyTime: string;
  receptionVenue: string;
  receptionAddress: string;
  receptionMapsUrl: string;
  receptionEmbedUrl?: string;
  receptionPlaceQuery?: string;
  receptionTime: string;
  dressCode: string;
  dressCodeDescription: string;
  dressCodePalette: string; // JSON array of colors
  dressCodeMenTitle?: string;
  dressCodeMenDescription?: string;
  dressCodeWomenTitle?: string;
  dressCodeWomenDescription?: string;
  dressCodeFootwearNote?: string;
  dressCodeProhibitedColors?: string;
  dressCodeStylePreset?: string;
  dressCodeWomanOutfit?: 'long-gown' | 'cocktail' | 'jumpsuit' | 'boho';
  dressCodeManOutfit?: 'tuxedo' | 'suit' | 'guayabera' | 'blazer';
  itinerary: string; // JSON array of ItineraryItem
  giftRegistry: string; // JSON array of GiftRegistryItem
  coverPhoto: string;
  secondaryPhoto: string;
  heroImageFit?: 'cover' | 'contain' | 'fill' | 'original'; // Display mode: cover, contain, fill (stretch), original
  heroImagePosition?: 'center' | 'top' | 'bottom'; // Alignment
  heroOverlayOpacity?: number; // 0 to 100 percentage (e.g. 40)
  heroEnableScrollBlur?: boolean; // Progressive scroll blur toggle
  cardStyle: CardStyleId;
  envelopeColor: string;
  waxSealText: string;
  waxSealColor: string;
  audioUrl: string;
  audioTitle: string;
  audioAutoplay: boolean;
  welcomeMessage: string;
  welcomeSubtitle?: string;
  heroDateFormat?: string; // e.g. 'dd.mm.aaaa', 'dd / mm / aaaa', 'literal-full', 'custom'
  heroCustomDateText?: string; // custom date string if heroDateFormat === 'custom'
  heroQuote?: string; // e.g. 'El amor todo lo sufre, todo lo cree, todo lo espera, todo lo soporta.'
  heroVerse?: string; // e.g. '1 Corintios 13:7'
  heroShowCountdown?: boolean; // false by default for minimal hero
  heroShowRsvpButton?: boolean; // false by default
  heroShowIcon?: boolean; // false by default
  heroShowGuestPill?: boolean; // false by default
  // Section Visibility Toggles (Atelier / Design)
  showItinerary?: boolean; // Cronograma del evento
  showLocations?: boolean; // Lugares & Cómo llegar (Google Maps)
  showDressCode?: boolean; // Código de vestimenta y paleta
  showGiftRegistry?: boolean; // Mesa de regalos y cuentas bancarias
  showPhotoGallery?: boolean; // Galería colaborativa de fotos
  galleryExternalAlbumUrl?: string; // Link a álbum en Google Photos, Instagram, Facebook, X, etc.
  galleryExternalAlbumTitle?: string; // Título del álbum externo
  galleryExternalAlbumType?: 'google_photos' | 'instagram' | 'facebook' | 'x' | 'drive' | 'custom';
  showVideoMemories?: boolean; // Recuerdos en video
  showGuestbook?: boolean; // Libro de firmas y deseos
  showHotels?: boolean; // Hospedaje y hoteles recomendados
  showRsvpSection?: boolean; // Confirmación de asistencia
  // Bank Account & Transfer Quick Settings (Perú & Latam)
  bankName?: string;
  bankBeneficiary?: string;
  bankAccountNumber?: string;
  bankClabe?: string;
  bankCci?: string; // Código de Cuenta Interbancario (CCI - 20 dígitos)
  bankYapePhone?: string; // Número para Yape
  bankPlinPhone?: string; // Número para Plin
  bankCardNumber?: string;
  bankConcept?: string;
  bankCurrency?: string;
  enableBankTransfer?: boolean;
  enableStoreRegistry?: boolean;
  enableEnvelopeGift?: boolean;
  envelopeGiftMessage?: string;
  customStoreItems?: GiftRegistryItem[] | string;
  rsvpDeadline: string;
  contactPhone: string;
  contactEmail: string;
  updatedAt?: string;
}

export interface WeddingSummary {
  id: number;
  coupleNames: string;
  hashtag: string;
  eventDate: string;
  slug: string;
  cardStyle: CardStyleId;
  isPublished: boolean;
  totalGuests: number;
  confirmedGuests: number;
  coverPhoto?: string;
}

export interface ItineraryItem {
  time: string;
  title: string;
  desc: string;
  icon: string;
}

export interface GiftRegistryItem {
  id?: string;
  type: 'bank' | 'store' | 'honeymoon' | 'other' | 'envelope';
  title: string;
  storeName?: string;
  accountNumber?: string;
  clabe?: string;
  cci?: string;
  yapePhone?: string;
  plinPhone?: string;
  cardNumber?: string;
  bankName?: string;
  beneficiary?: string;
  concept?: string;
  currency?: string;
  url?: string;
  eventNumber?: string;
  description?: string;
}

export interface Guest {
  id: number;
  weddingId?: number;
  accessCode: string;
  fullName: string;
  email?: string | null;
  phone?: string | null;
  groupName?: string | null;
  allocatedPasses: number;
  confirmedPasses: number;
  status: 'pending' | 'confirmed' | 'declined';
  attendingCeremony: boolean;
  attendingReception: boolean;
  dietaryRestrictions?: string | null;
  companionNames?: string; // JSON array of string
  suggestedSong?: string | null;
  message?: string | null;
  confirmedAt?: string | null;
  viewedAt?: string | null;
  createdAt?: string;
}

export interface PhotoComment {
  id: number;
  photoId: number;
  weddingId?: number;
  guestName: string;
  guestCode?: string | null;
  message: string;
  createdAt: string;
}

export interface GalleryPhoto {
  id: number;
  weddingId?: number;
  url: string;
  thumbnailUrl?: string | null;
  caption?: string | null;
  authorName: string;
  guestCode?: string | null;
  category: 'preparativos' | 'ceremonia' | 'brindis' | 'fiesta' | 'photobooth' | 'recuerdos';
  likesCount: number;
  commentsCount?: number;
  approved: boolean;
  createdAt: string;
}

export interface WeddingVideo {
  id: number;
  weddingId?: number;
  title: string;
  platform: 'youtube' | 'instagram' | 'facebook' | 'tiktok' | 'vimeo' | 'direct';
  videoUrl: string;
  embedId?: string | null;
  description?: string | null;
  authorName?: string | null;
  createdAt: string;
}

export interface GuestWish {
  id: number;
  weddingId?: number;
  guestName: string;
  relationship?: string | null;
  message: string;
  avatarUrl?: string | null;
  isHighlighted: boolean;
  createdAt: string;
}

export interface GuestStats {
  totalGuests: number;
  totalAllocatedPasses: number;
  totalConfirmedPasses: number;
  declinedGuests: number;
  pendingGuests: number;
  confirmedCount: number;
}

export interface CardThemeConfig {
  id: CardStyleId;
  name: string;
  badge: string;
  description?: string;
  bgHex: string;
  secondaryBgHex: string;
  primaryColorHex: string;
  accentColorHex: string;
  bgClass: string;
  cardBgClass: string;
  textPrimaryClass: string;
  textSecondaryClass: string;
  accentClass: string;
  borderClass: string;
  envelopeClass: string;
  envelopeLidClass: string;
  sealBg: string;
  sealText: string;
  fontDisplay: string;
  fontBody: string;
  ornamentStyle: string;
  transitionType?: 'organic-wave' | 'floral-arch' | 'boho-pampas' | 'minimal-editorial' | 'celestial-night' | 'watercolor-garden';
  scrollbarTrackHex?: string;
  scrollbarThumbHex?: string;
  scrollbarThumbHoverHex?: string;
}
