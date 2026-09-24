import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  Heart,
  Calendar,
  MapPin,
  Clock,
  Sparkles,
  Users,
  Settings as SettingsIcon,
  Music,
  Camera,
  Film,
  Gift,
  MessageSquareHeart,
  ChevronUp,
  Menu,
  X,
  ArrowLeft,
  Crown,
  LogIn,
  LayoutDashboard,
  Eye,
  SlidersHorizontal,
  Share2,
  Maximize2,
  Minimize2
} from 'lucide-react';
import { WeddingSettings, Guest, UserProfile, PlanId, LandingSectionId } from './types.ts';
import { AudioPlayer } from './components/AudioPlayer.tsx';
import { EnvelopeCard } from './components/EnvelopeCard.tsx';
import { RsvpSection } from './components/RsvpSection.tsx';
import { PhotoGallery } from './components/PhotoGallery.tsx';
import { VideoSection } from './components/VideoSection.tsx';
import { ItinerarySection } from './components/ItinerarySection.tsx';
import { DressCodeSection } from './components/DressCodeSection.tsx';
import { LocationsSection } from './components/LocationsSection.tsx';
import { GiftRegistrySection } from './components/GiftRegistrySection.tsx';
import { HotelsSection } from './components/HotelsSection.tsx';
import { GuestbookSection } from './components/GuestbookSection.tsx';
import { AdminDashboard } from './components/AdminDashboard.tsx';
import { LandingPage } from './components/LandingPage.tsx';
import { UserDashboard } from './components/UserDashboard.tsx';
import { CeoMasterDashboard } from './components/CeoMasterDashboard.tsx';
import { MainPortalLanding } from './components/MainPortalLanding.tsx';

// Quince Años (XV Años) Specialized Components
import { EnvelopeCard as XvEnvelopeCard } from './xv/components/EnvelopeCard.tsx';
import { LandingPage as XvLandingPage } from './xv/components/LandingPage.tsx';
import { DemoStyleBar as XvDemoStyleBar } from './xv/components/DemoStyleBar.tsx';
import { PhotoGallery as XvPhotoGallery } from './xv/components/PhotoGallery.tsx';
import { VideoSection as XvVideoSection } from './xv/components/VideoSection.tsx';
import { RsvpSection as XvRsvpSection } from './xv/components/RsvpSection.tsx';
import { GuestbookSection as XvGuestbookSection } from './xv/components/GuestbookSection.tsx';
import { AdminDashboard as XvAdminDashboard } from './xv/components/AdminDashboard.tsx';
import { UserDashboard as XvUserDashboard } from './xv/components/UserDashboard.tsx';
import { AudioPlayer as XvAudioPlayer } from './xv/components/AudioPlayer.tsx';
import { DEFAULT_XV_SETTINGS } from './xv/defaultSettings.ts';
import { XV_CARD_THEMES, applyXvThemeScrollbar } from './xv/themes.ts';

import {
  AnimatedFloatingPetals,
  AnimatedFloralDivider,
  AnimatedWeddingRings,
} from './components/AnimatedSvgs.tsx';
import { AuthModal } from './components/AuthModal.tsx';
import { DemoStyleBar } from './components/DemoStyleBar.tsx';
import { ToastContainer } from './components/ToastContainer.tsx';
import { toast } from './lib/toast.ts';
import { CARD_THEMES, applyThemeScrollbar } from './lib/themes.ts';
import { formatHeroDate } from './lib/dateFormatters.ts';
import { DEMO_WEDDING_ID, DEMO_XV_ID, getEventPresentation, resolveEventType } from './lib/eventUtils.ts';
import { SUBSCRIPTION_PLANS } from './data/plans.ts';
import { getLandingSectionOrder } from './lib/sectionOrder.ts';
import { DEFAULT_WEDDING_SETTINGS } from './data/defaultSettings.ts';
import { CardStyle } from './types.ts';

type AppView = 'portal' | 'landing' | 'dashboard' | 'invitation' | 'admin' | 'ceo';
type EventCategory = 'bodas' | 'xv';

export default function App() {
  // Helper to extract path slug e.g. "/bodasergioylore" -> "bodasergioylore"
  const getPathSlug = () => {
    if (typeof window === 'undefined') return null;
    const segments = window.location.pathname.split('/').filter(Boolean);
    const reserved = [
      'api', 'uploads', 'src', 'assets', 'admin', 'dashboard', 'ceo', 'landing',
      'login', 'register', 'ingresar', 'registro', 'signin', 'signup',
      'demo', 'demostracion',
      'boda', 'bodas', 'xv', 'quince', 'quinceanera', 'portal', 'mis-eventos'
    ];
    if (segments.length === 1 && !reserved.includes(segments[0].toLowerCase())) {
      return decodeURIComponent(segments[0]);
    }
    return null;
  };

  // Helper to detect if URL points directly to demo
  const checkIsDemoUrl = () => {
    if (typeof window === 'undefined') return false;
    const pathname = window.location.pathname.toLowerCase();
    const search = new URLSearchParams(window.location.search);
    const hash = window.location.hash.toLowerCase();
    return (
      pathname === '/demo' ||
      pathname === '/demostracion' ||
      search.get('mode') === 'demo' ||
      search.get('demo') === 'true' ||
      search.get('demo') === '1' ||
      hash === '#demo'
    );
  };

  // Helper to detect if URL points directly to login or register
  const getInitialAuth = (): { isOpen: boolean; mode: 'login' | 'register' } => {
    if (typeof window === 'undefined') return { isOpen: false, mode: 'register' };
    const pathname = window.location.pathname.toLowerCase();
    const search = new URLSearchParams(window.location.search);
    const authQuery = search.get('auth') || search.get('mode');
    const hash = window.location.hash.toLowerCase();

    if (
      pathname === '/login' ||
      pathname === '/ingresar' ||
      pathname === '/signin' ||
      authQuery === 'login' ||
      authQuery === 'ingresar' ||
      hash === '#login'
    ) {
      return { isOpen: true, mode: 'login' };
    }

    if (
      pathname === '/register' ||
      pathname === '/registro' ||
      pathname === '/signup' ||
      authQuery === 'register' ||
      authQuery === 'registro' ||
      hash === '#register'
    ) {
      return { isOpen: true, mode: 'register' };
    }

    return { isOpen: false, mode: 'register' };
  };

  const initialAuth = getInitialAuth();

  // Navigation & View state
  const [currentView, setCurrentView] = useState<AppView>(() => {
    if (typeof window !== 'undefined') {
      if (checkIsDemoUrl()) return 'invitation';

      const search = new URLSearchParams(window.location.search);
      const mode = search.get('mode');
      const w = search.get('w') || search.get('wedding');
      if (mode === 'preview_embed' || mode === 'invitation') return 'invitation';
      if (mode === 'admin') return w ? 'admin' : 'dashboard';
      if (mode === 'dashboard') return 'dashboard';
      if (mode === 'ceo') return 'ceo';
      if (mode === 'portal') return 'portal';

      const pathname = window.location.pathname.toLowerCase();
      if (
        pathname === '/boda' ||
        pathname === '/bodas' ||
        pathname === '/xv' ||
        pathname === '/quince' ||
        pathname === '/quinceanera' ||
        pathname === '/landing'
      ) {
        return 'landing';
      }
      if (pathname === '/portal') {
        return 'portal';
      }

      const pathSlug = getPathSlug();
      if (pathSlug) return 'invitation';

      // If user directly specifies ?event=bodas or ?event=xv, go to that event landing
      const eventParam = search.get('event') || search.get('tipo');
      if (eventParam) return 'landing';

      // Default to portal view so user can choose event type
      return 'portal';
    }
    return 'portal';
  });

  // User & Auth state
  const [currentUser, setCurrentUser] = useState<UserProfile | null>(() => {
    try {
      const saved = localStorage.getItem('atelier_user_session');
      return saved ? JSON.parse(saved) : null;
    } catch {
      return null;
    }
  });
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(initialAuth.isOpen);
  const [authModalMode, setAuthModalMode] = useState<'login' | 'register'>(initialAuth.mode);
  const [authSelectedPlan, setAuthSelectedPlan] = useState<PlanId>('atelier');

  // Open & Close Auth with URL history updates
  const openAuth = (mode: 'login' | 'register', plan?: PlanId) => {
    setAuthModalMode(mode);
    if (plan) setAuthSelectedPlan(plan);
    setIsAuthModalOpen(true);
    if (typeof window !== 'undefined') {
      const targetPath = mode === 'login' ? '/login' : '/register';
      if (window.location.pathname !== targetPath) {
        window.history.pushState({ authMode: mode }, '', targetPath);
      }
    }
  };

  const closeAuth = () => {
    setIsAuthModalOpen(false);
    if (typeof window !== 'undefined') {
      const currentPath = window.location.pathname.toLowerCase();
      if (['/login', '/register', '/ingresar', '/registro', '/signin', '/signup'].includes(currentPath)) {
        window.history.pushState(null, '', '/');
      }
    }
  };

  // Event Domain Category ('bodas' | 'xv')
  const [eventCategory, setEventCategory] = useState<EventCategory>(() => {
    if (typeof window !== 'undefined') {
      const pathname = window.location.pathname.toLowerCase();
      // Explicit pathname takes precedence over previous localStorage
      if (pathname === '/boda' || pathname === '/bodas' || pathname.startsWith('/boda/') || pathname.startsWith('/bodas/')) {
        try { localStorage.setItem('atelier_event_category', 'bodas'); } catch (e) {}
        return 'bodas';
      }
      if (pathname === '/xv' || pathname === '/quince' || pathname === '/quinceanera' || pathname.startsWith('/xv/') || pathname.startsWith('/quince/')) {
        try { localStorage.setItem('atelier_event_category', 'xv'); } catch (e) {}
        return 'xv';
      }

      const params = new URLSearchParams(window.location.search);
      const cat = params.get('event') || params.get('tipo');
      if (cat && resolveEventType(cat) === 'xv') return 'xv';
      if (cat === 'bodas' || cat === 'boda') return 'bodas';

      const pathSlug = getPathSlug()?.toLowerCase();
      if (pathSlug && (pathSlug.startsWith('xv') || pathSlug.startsWith('quince') || pathSlug.includes('-xv-') || pathSlug.endsWith('-xv'))) {
        return 'xv';
      }
      const wParam = (params.get('w') || params.get('wedding') || '').toLowerCase();
      if (wParam.startsWith('xv') || wParam.startsWith('quince') || wParam.includes('-xv-') || wParam.endsWith('-xv')) {
        return 'xv';
      }
      const saved = localStorage.getItem('atelier_event_category');
      if (saved === 'xv') return 'xv';
    }
    return 'bodas';
  });

  const [currentWeddingId, setCurrentWeddingId] = useState<number>(() => {
    if (typeof window !== 'undefined') {
      const pathname = window.location.pathname.toLowerCase();
      if (pathname === '/xv' || pathname === '/quince' || pathname === '/quinceanera') return DEMO_XV_ID;
      if (pathname === '/boda' || pathname === '/bodas') return DEMO_WEDDING_ID;

      const params = new URLSearchParams(window.location.search);
      const cat = params.get('event') || params.get('tipo');
      const isXv = (cat ? resolveEventType(cat) === 'xv' : eventCategory === 'xv');
      const isDemo = checkIsDemoUrl();
      if (isDemo) return isXv ? DEMO_XV_ID : DEMO_WEDDING_ID;
      const w = params.get('w') || params.get('wedding');
      if (w && !isNaN(Number(w))) return Number(w);
    }
    return DEMO_WEDDING_ID;
  });

  // Active Event Settings State
  const [settings, setSettings] = useState<WeddingSettings>(() => {
    if (typeof window !== 'undefined') {
      const mode = new URLSearchParams(window.location.search).get('mode');
      if (mode === 'preview_embed') {
        try {
          const saved = sessionStorage.getItem('atelier_live_settings') || localStorage.getItem('atelier_live_settings');
          if (saved) {
            return JSON.parse(saved);
          }
        } catch (e) {}
      }
    }
    return eventCategory === 'xv' ? DEFAULT_XV_SETTINGS : DEFAULT_WEDDING_SETTINGS;
  });

  // Once an event is loaded, its persisted type is the source of truth for
  // the editor and invitation. URL/local state is only used while loading.
  const settingsEventCategory = resolveEventType(settings?.eventType, settings?.slug);

  const switchEventCategory = (category: EventCategory) => {
    setEventCategory(category);
    if (typeof window !== 'undefined') {
      localStorage.setItem('atelier_event_category', category);
      const targetPath = category === 'xv' ? '/xv' : '/boda';
      window.history.pushState({}, '', targetPath);
    }
    if (category === 'xv') {
      setCurrentWeddingId(DEMO_XV_ID);
      setSettings(DEFAULT_XV_SETTINGS);
      toast.info('Modo Quince Años (XV) activado', 'Atelier XV');
    } else {
      setCurrentWeddingId(DEMO_WEDDING_ID);
      setSettings(DEFAULT_WEDDING_SETTINGS);
      toast.info('Modo Bodas Nupciales activado', 'Atelier Nupcial');
    }
  };

  const [loadingWedding, setLoadingWedding] = useState(false);
  const [activeGuest, setActiveGuest] = useState<Guest | null>(null);
  const [isInlineRsvpOpen, setIsInlineRsvpOpen] = useState(false);
  const [showRsvpModal, setShowRsvpModal] = useState(false);
  const [showAdminDashboard, setShowAdminDashboard] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [showScrollTop, setShowScrollTop] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [showHostPill, setShowHostPill] = useState(true);
  const [isViewingDemo, setIsViewingDemo] = useState<boolean>(() => checkIsDemoUrl());

  // Listen to popstate and url changes for direct login/register, /demo, /boda, /xv routing
  useEffect(() => {
    const handleUrlAuthChange = () => {
      if (typeof window === 'undefined') return;
      const pathname = window.location.pathname.toLowerCase();
      const search = new URLSearchParams(window.location.search);
      const authQuery = search.get('auth') || search.get('mode');
      const hash = window.location.hash.toLowerCase();

      if (['/login', '/ingresar', '/signin'].includes(pathname) || authQuery === 'login' || hash === '#login') {
        setAuthModalMode('login');
        setIsAuthModalOpen(true);
      } else if (['/register', '/registro', '/signup'].includes(pathname) || authQuery === 'register' || hash === '#register') {
        setAuthModalMode('register');
        setIsAuthModalOpen(true);
      } else if (pathname === '/demo' || pathname === '/demostracion' || authQuery === 'demo' || hash === '#demo') {
        setIsViewingDemo(true);
        const eventParam = search.get('event') || search.get('tipo');
        const isXv = (eventParam ? resolveEventType(eventParam) === 'xv' : eventCategory === 'xv');
        const targetCategory = isXv ? 'xv' : 'bodas';
        setEventCategory(targetCategory);
        setCurrentWeddingId(isXv ? DEMO_XV_ID : DEMO_WEDDING_ID);
        setSettings(isXv ? DEFAULT_XV_SETTINGS : DEFAULT_WEDDING_SETTINGS);
        setCurrentView('invitation');
      } else if (pathname === '/boda' || pathname === '/bodas') {
        setEventCategory('bodas');
        try { localStorage.setItem('atelier_event_category', 'bodas'); } catch (e) {}
        setCurrentWeddingId(DEMO_WEDDING_ID);
        setSettings(DEFAULT_WEDDING_SETTINGS);
        setIsViewingDemo(false);
        setCurrentView('landing');
      } else if (pathname === '/xv' || pathname === '/quince' || pathname === '/quinceanera') {
        setEventCategory('xv');
        try { localStorage.setItem('atelier_event_category', 'xv'); } catch (e) {}
        setCurrentWeddingId(DEMO_XV_ID);
        setSettings(DEFAULT_XV_SETTINGS);
        setIsViewingDemo(false);
        setCurrentView('landing');
      } else if (pathname === '/portal' || pathname === '/') {
        setIsViewingDemo(false);
        setCurrentView('portal');
      }
    };

    window.addEventListener('popstate', handleUrlAuthChange);
    window.addEventListener('hashchange', handleUrlAuthChange);
    return () => {
      window.removeEventListener('popstate', handleUrlAuthChange);
      window.removeEventListener('hashchange', handleUrlAuthChange);
    };
  }, []);

  // Monitor browser fullscreen change events
  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(Boolean(document.fullscreenElement));
    };
    document.addEventListener('fullscreenchange', handleFullscreenChange);
    document.addEventListener('webkitfullscreenchange', handleFullscreenChange);
    return () => {
      document.removeEventListener('fullscreenchange', handleFullscreenChange);
      document.removeEventListener('webkitfullscreenchange', handleFullscreenChange);
    };
  }, []);

  // Update theme-reactive scrollbars whenever wedding style changes
  useEffect(() => {
    if (settings?.cardStyle) {
      if (settingsEventCategory === 'xv') {
        applyXvThemeScrollbar(settings.cardStyle);
      } else {
        applyThemeScrollbar(settings.cardStyle);
      }
    }
  }, [settings?.cardStyle, settingsEventCategory]);

  // Keep browser title and share metadata synchronized with the resolved event.
  useEffect(() => {
    if (typeof document === 'undefined') return;
    const presentation = getEventPresentation(settings?.eventType, settings?.slug);
    const coupleNames = settings?.coupleNames?.trim() || presentation.defaultName;
    const formattedDate = formatHeroDate(
      settings?.eventDate || '2026-11-28',
      settings?.heroDateFormat || 'literal-short',
      settings?.heroCustomDateText,
    );
    const location = settings?.receptionVenue || settings?.ceremonyVenue || 'nuestra celebración';
    const invitationDescription = `${settings?.welcomeSubtitle || 'Nos emociona compartir este día tan especial contigo.'} • ${formattedDate} en ${location}. Toca aquí para ver los detalles y confirmar tu asistencia.`;
    const previewEmbed = typeof window !== 'undefined' && new URLSearchParams(window.location.search).get('mode') === 'preview_embed';
    const demoMode = (isViewingDemo || (!currentUser && currentWeddingId === DEMO_WEDDING_ID && !getPathSlug())) && !previewEmbed;

    let title = '2date Atelier | Invitaciones Digitales & RSVP';
    let description = 'Invitaciones digitales interactivas con música, cuenta regresiva, confirmación RSVP, itinerario y galería para bodas y XV Años.';

    if (currentView === 'landing') {
      title = presentation.landingTitle;
      description = presentation.landingDescription;
    } else if (currentView === 'ceo') {
      title = 'Supervisión Centralizada Master — Atelier CEO';
      description = 'Supervisión y administración centralizada de eventos, usuarios e invitaciones.';
    } else if (currentView === 'admin') {
      title = `${presentation.label} — Atelier de Diseño & Configuración | ${coupleNames}`;
      description = `Edita la invitación de ${presentation.label.toLowerCase()} de ${coupleNames}.`;
    } else if (currentView === 'invitation') {
      title = presentation.invitationTitle(coupleNames, activeGuest?.fullName);
      description = invitationDescription;
    } else if (currentView === 'dashboard') {
      title = `Mis Eventos — ${coupleNames}`;
      description = 'Administra tus invitaciones, eventos, invitados y confirmaciones RSVP.';
    }

    document.title = title;

    const setMeta = (selector: string, content: string) => {
      const element = document.querySelector<HTMLMetaElement>(selector);
      if (element) element.setAttribute('content', content);
    };
    setMeta('meta[name="description"]', description);
    setMeta('meta[property="og:title"]', title);
    setMeta('meta[property="og:description"]', description);
    setMeta('meta[property="og:site_name"]', presentation.siteName(coupleNames));
    setMeta('meta[name="twitter:title"]', title);
    setMeta('meta[name="twitter:description"]', description);

    if (settings?.id && currentView === 'invitation' && !demoMode) {
      const identifier = settings.slug || String(settings.id);
      const ogImageUrl = `${window.location.origin}/api/og-image?wedding=${encodeURIComponent(identifier)}`;
      setMeta('meta[property="og:image"]', ogImageUrl);
      setMeta('meta[property="og:image:secure_url"]', ogImageUrl);
      setMeta('meta[name="twitter:image"]', ogImageUrl);
      setMeta('meta[property="og:url"]', window.location.href);
    }
  }, [currentView, settings?.id, settings?.slug, settings?.eventType, settings?.coupleNames, settings?.eventDate, settings?.eventTime, settings?.welcomeSubtitle, settings?.receptionVenue, settings?.ceremonyVenue, settings?.heroDateFormat, settings?.heroCustomDateText, activeGuest?.fullName, eventCategory, isViewingDemo, currentUser?.uid, currentWeddingId]);

  const toggleFullscreen = async () => {
    try {
      if (!document.fullscreenElement) {
        if (document.documentElement.requestFullscreen) {
          await document.documentElement.requestFullscreen();
        } else if ((document.documentElement as any).webkitRequestFullscreen) {
          await (document.documentElement as any).webkitRequestFullscreen();
        }
        setIsFullscreen(true);
      } else {
        if (document.exitFullscreen) {
          await document.exitFullscreen();
        } else if ((document as any).webkitExitFullscreen) {
          await (document as any).webkitExitFullscreen();
        }
        setIsFullscreen(false);
      }
    } catch (err) {
      console.warn('Fullscreen toggle not permitted or failed:', err);
    }
  };

  // Parse URL parameters on initial load
  useEffect(() => {
    const search = window.location.search;
    const params = new URLSearchParams(search);
    let weddingParam = params.get('w') || params.get('wedding') || getPathSlug();
    let guestCode = params.get('code');
    const modeParam = params.get('mode');

    // Fallback regex matching for ?w=slug?code=XYZ or combined queries
    if (!guestCode) {
      const codeMatch = search.match(/[?&]code=([^&?#]+)/i);
      if (codeMatch) guestCode = decodeURIComponent(codeMatch[1]);
    }
    if (!weddingParam) {
      const wMatch = search.match(/[?&]w=([^&?#]+)/i) || search.match(/[?&]wedding=([^&?#]+)/i);
      if (wMatch) weddingParam = decodeURIComponent(wMatch[1]);
    }

    const pathname = window.location.pathname.toLowerCase();
    const eventParam = params.get('event') || params.get('tipo');

    if (pathname === '/boda' || pathname === '/bodas') {
      setEventCategory('bodas');
      try { localStorage.setItem('atelier_event_category', 'bodas'); } catch (e) {}
      setCurrentWeddingId(DEMO_WEDDING_ID);
      setSettings(DEFAULT_WEDDING_SETTINGS);
      setIsViewingDemo(false);
      setCurrentView('landing');
      setLoadingWedding(false);
      return;
    }
    if (pathname === '/xv' || pathname === '/quince' || pathname === '/quinceanera') {
      setEventCategory('xv');
      try { localStorage.setItem('atelier_event_category', 'xv'); } catch (e) {}
      setCurrentWeddingId(5);
      setSettings(DEFAULT_XV_SETTINGS);
      setIsViewingDemo(false);
      setCurrentView('landing');
      setLoadingWedding(false);
      return;
    }
    if (pathname === '/portal' || (pathname === '/' && !eventParam && !weddingParam && !guestCode && !modeParam && !checkIsDemoUrl())) {
      setIsViewingDemo(false);
      setCurrentView('portal');
      setLoadingWedding(false);
      return;
    }

    // Check if URL is pointing to demo
    const isDemo = checkIsDemoUrl();
    if (isDemo) {
      const isXv = (eventParam ? resolveEventType(eventParam) === 'xv' : eventCategory === 'xv');
      const targetCategory = isXv ? 'xv' : 'bodas';
      setEventCategory(targetCategory);
      setCurrentWeddingId(isXv ? DEMO_XV_ID : DEMO_WEDDING_ID);
      setSettings(isXv ? DEFAULT_XV_SETTINGS : DEFAULT_WEDDING_SETTINGS);
      setIsViewingDemo(true);
      setCurrentView('invitation');
      setLoadingWedding(false);

      // Ensure URL has ?event=xv or ?event=bodas explicitly on /demo
      const currentUrl = new URL(window.location.href);
      if (currentUrl.searchParams.get('event') !== targetCategory) {
        currentUrl.searchParams.set('event', targetCategory);
        window.history.replaceState({}, '', currentUrl.toString());
      }
    } else if (modeParam === 'preview_embed') {
      setCurrentView('invitation');
      try {
        const saved = sessionStorage.getItem('atelier_live_settings') || localStorage.getItem('atelier_live_settings');
        if (saved) {
          setSettings(JSON.parse(saved));
        }
      } catch (err) {
        console.warn('Could not read saved preview settings:', err);
      }
      setLoadingWedding(false);
      try {
        window.parent.postMessage({ type: 'ATELIER_EMBED_READY' }, '*');
      } catch (err) {
        console.warn('PostMessage to parent failed:', err);
      }
    } else if (weddingParam || guestCode) {
      if (weddingParam && !isNaN(Number(weddingParam))) {
        setCurrentWeddingId(Number(weddingParam));
      }
      setCurrentView(modeParam === 'admin' ? 'admin' : 'invitation');
    } else if (modeParam === 'dashboard') {
      setCurrentView('dashboard');
    } else if (modeParam === 'invitation') {
      setCurrentView('invitation');
    } else if (modeParam === 'admin') {
      setCurrentView(weddingParam ? 'admin' : 'dashboard');
    } else if (eventParam) {
      const isXv = resolveEventType(eventParam) === 'xv';
      const targetCategory = isXv ? 'xv' : 'bodas';
      setEventCategory(targetCategory);
      setCurrentWeddingId(isXv ? DEMO_XV_ID : DEMO_WEDDING_ID);
      setSettings(isXv ? DEFAULT_XV_SETTINGS : DEFAULT_WEDDING_SETTINGS);
      setCurrentView('landing');
    } else {
      // Pure root URL default: Global Portal Landing
      setCurrentView('portal');
    }

    const handleScroll = () => {
      if (window.scrollY > 400) {
        setShowScrollTop(true);
      } else {
        setShowScrollTop(false);
      }
    };
    window.addEventListener('scroll', handleScroll);

    // Live settings synchronization listener (for real-time atelier canvas simulation)
    const handleMessage = (event: MessageEvent) => {
      if (event.data?.type === 'ATELIER_SYNC_SETTINGS' && event.data.settings) {
        setSettings(event.data.settings);
        setLoadingWedding(false);
      }
    };
    window.addEventListener('message', handleMessage);

    return () => {
      window.removeEventListener('scroll', handleScroll);
      window.removeEventListener('message', handleMessage);
    };
  }, []);

  // Fetch wedding configuration whenever currentWeddingId changes
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const isEmbed = params.get('mode') === 'preview_embed';

    // In preview embed mode, we receive settings directly from the parent Atelier
    if (isEmbed) {
      return;
    }

    let weddingParam = params.get('w') || params.get('wedding') || getPathSlug();
    const isDemo = checkIsDemoUrl();

    // Do NOT fetch specific wedding or mutate URL if user is simply browsing Portal or generic Landing
    const shouldFetch = currentView === 'invitation' || currentView === 'admin' || Boolean(weddingParam) || isDemo;
    if (!shouldFetch) {
      setLoadingWedding(false);
      return;
    }

    const fetchWeddingConfig = async () => {
      try {
        setLoadingWedding(true);
        const search = window.location.search;
        let guestCode = params.get('code');

        if (!weddingParam) {
          const wMatch = search.match(/[?&]w=([^&?#]+)/i) || search.match(/[?&]wedding=([^&?#]+)/i);
          if (wMatch) weddingParam = decodeURIComponent(wMatch[1]);
        }
        if (!guestCode) {
          const codeMatch = search.match(/[?&]code=([^&?#]+)/i);
          if (codeMatch) guestCode = decodeURIComponent(codeMatch[1]);
        }

        let url = `/api/wedding-config?weddingId=${currentWeddingId}`;
        if (weddingParam && isNaN(Number(weddingParam))) {
          url = `/api/wedding-config?slug=${encodeURIComponent(weddingParam)}`;
        }

        const res = await fetch(url);
        if (res.ok) {
          const data = await res.json();
          if (data && typeof data === 'object') {
            // Determine if the returned event data is XV or Bodas
            const resolvedCategory = resolveEventType(data.eventType ?? data.category, data.slug ?? weddingParam);
            const isXvData = resolvedCategory === 'xv';

            if (eventCategory !== resolvedCategory) {
              setEventCategory(resolvedCategory);
              try { localStorage.setItem('atelier_event_category', resolvedCategory); } catch (e) {}
            }

            // Cleanly fix conflicting URL event parameter ONLY if one was already present
            if (typeof window !== 'undefined') {
              const currentUrl = new URL(window.location.href);
              if (currentUrl.searchParams.has('event') && currentUrl.searchParams.get('event') !== resolvedCategory) {
                currentUrl.searchParams.set('event', resolvedCategory);
                window.history.replaceState({}, '', currentUrl.toString());
              }
            }

            const baseDefaults = isXvData ? DEFAULT_XV_SETTINGS : DEFAULT_WEDDING_SETTINGS;
            setSettings({ ...baseDefaults, ...data, eventType: resolvedCategory });
            if (data.id) {
              setCurrentWeddingId(data.id);
            }
          }

          // Check if guest code in URL
          if (guestCode && data?.id) {
            try {
              const guestRes = await fetch(`/api/rsvp/find?q=${encodeURIComponent(guestCode)}&weddingId=${data.id}`);
              if (guestRes.ok) {
                const guestData = await guestRes.json();
                setActiveGuest(guestData);
                try {
                  localStorage.setItem(`rsvp_guest_${data.id}`, JSON.stringify(guestData));
                } catch {}
              }
            } catch (guestErr) {
              console.warn('Could not find guest by code:', guestErr);
            }
          } else if (data?.id) {
            // General link: check if this user previously confirmed or filled RSVP on this device
            try {
              const savedGuestRaw = localStorage.getItem(`rsvp_guest_${data.id}`);
              if (savedGuestRaw) {
                const parsed = JSON.parse(savedGuestRaw);
                if (parsed?.accessCode) {
                  const guestRes = await fetch(`/api/rsvp/find?q=${encodeURIComponent(parsed.accessCode)}&weddingId=${data.id}`);
                  if (guestRes.ok) {
                    const freshGuest = await guestRes.json();
                    setActiveGuest(freshGuest);
                    try {
                      localStorage.setItem(`rsvp_guest_${data.id}`, JSON.stringify(freshGuest));
                    } catch {}
                  } else {
                    setActiveGuest(parsed);
                  }
                } else if (parsed?.fullName) {
                  setActiveGuest(parsed);
                }
              }
            } catch (storageErr) {
              console.warn('Could not restore saved guest session:', storageErr);
            }
          }
        }
      } catch (err) {
        console.warn('Could not fetch wedding config from server, using default settings:', err);
      } finally {
        setLoadingWedding(false);
      }
    };

    fetchWeddingConfig();
  }, [currentWeddingId]);

  // Sync user profile to backend & localStorage
  const handleAuthSuccess = async (user: UserProfile, directToAdmin = false) => {
    setCurrentUser(user);
    localStorage.setItem('atelier_user_session', JSON.stringify(user));
    setIsAuthModalOpen(false);

    if (directToAdmin) {
      setCurrentWeddingId(DEMO_WEDDING_ID);
      setCurrentView('admin');
      setShowAdminDashboard(false);
      window.scrollTo({ top: 0, behavior: 'smooth' });
      return;
    }

    // If CEO, redirect to CEO Master Dashboard
    if (user.role === 'ceo' || user.email === 'daviex14@gmail.com') {
      setCurrentView('ceo');
      window.scrollTo({ top: 0, behavior: 'smooth' });
      return;
    }

    // If on landing, redirect to user dashboard
    if (currentView === 'landing') {
      setCurrentView('dashboard');
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const handleLogout = () => {
    setCurrentUser(null);
    localStorage.removeItem('atelier_user_session');
    setCurrentView('portal');
    if (typeof window !== 'undefined') {
      window.history.pushState(null, '', '/');
    }
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleUpdatePlan = async (newPlan: PlanId) => {
    if (!currentUser) return;
    try {
      const res = await fetch('/api/user/plan', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ uid: currentUser.uid, plan: newPlan }),
      });
      if (res.ok) {
        const updated = await res.json();
        const newUser: UserProfile = { ...currentUser, plan: updated.plan };
        setCurrentUser(newUser);
        localStorage.setItem('atelier_user_session', JSON.stringify(newUser));
        toast.success(`¡Tu suscripción ha sido actualizada al ${SUBSCRIPTION_PLANS.find(p => p.id === newPlan)?.name}!`, 'Plan Actualizado');
      }
    } catch (err) {
      console.error('Error updating plan:', err);
      toast.error('Ocurrió un error al actualizar el plan');
    }
  };

  const handleSelectWedding = (weddingId: number, mode: 'invitation' | 'admin', eventType?: string) => {
    setIsViewingDemo(false);
    setCurrentWeddingId(weddingId);
    const resolvedCat = resolveEventType(eventType);
    setEventCategory(resolvedCat as EventCategory);
    try { localStorage.setItem('atelier_event_category', resolvedCat); } catch (e) {}

    setCurrentView(mode === 'admin' ? 'admin' : 'invitation');
    if (typeof window !== 'undefined') {
      const url = new URL(window.location.origin);
      url.pathname = '/';
      url.searchParams.set('w', String(weddingId));
      if (mode === 'admin') {
        url.searchParams.set('mode', 'admin');
      }
      url.searchParams.set('event', resolvedCat);
      window.history.pushState({}, '', url.toString());
    }
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleUpdateSettings = (updated: Partial<WeddingSettings>) => {
    if (settings) {
      setSettings({ ...settings, ...updated });
    }
  };

  const scrollToSection = (id: string) => {
    setMobileMenuOpen(false);
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  };

  // 1. CEO MASTER DASHBOARD VIEW
  if (currentView === 'ceo') {
    const ceoProfile: UserProfile = currentUser || {
      uid: 'ceo-daviex-master',
      email: 'daviex14@gmail.com',
      name: 'Daviex (CEO)',
      role: 'ceo',
      plan: 'ceo_unlimited',
    };

    return (
      <>
        <CeoMasterDashboard
          currentUser={ceoProfile}
          onSelectWedding={handleSelectWedding}
          onBackToUserDashboard={() => {
            setCurrentView('dashboard');
            window.scrollTo({ top: 0, behavior: 'smooth' });
          }}
          onLogout={handleLogout}
        />
        <ToastContainer />
      </>
    );
  }

  // 2. MAIN PORTAL LANDING VIEW (Multi-Event Hub)
  if (currentView === 'portal') {
    return (
      <>
        <MainPortalLanding
          currentUser={currentUser}
          onSelectEventType={(typeId) => {
            if (typeId === 'xv') {
              switchEventCategory('xv');
              setCurrentView('landing');
            } else if (typeId === 'bodas') {
              switchEventCategory('bodas');
              setCurrentView('landing');
            } else {
              toast.info(`La sección de ${typeId} se lanzará próximamente. ¡Mantente atento!`, 'Próximo lanzamiento');
            }
            window.scrollTo({ top: 0, behavior: 'smooth' });
          }}
          onOpenAuth={(mode) => openAuth(mode)}
          onOpenDashboard={() => {
            if (currentUser?.role === 'ceo' || currentUser?.email === 'daviex14@gmail.com') {
              setCurrentView('ceo');
            } else {
              setCurrentView('dashboard');
            }
            window.scrollTo({ top: 0, behavior: 'smooth' });
          }}
        />
        <AuthModal
          isOpen={isAuthModalOpen}
          onClose={closeAuth}
          initialMode={authModalMode}
          selectedPlan={authSelectedPlan}
          onAuthSuccess={handleAuthSuccess}
        />
        <ToastContainer />
      </>
    );
  }

  // 3. LANDING PAGE VIEW (Bodas vs XV Años)
  if (currentView === 'landing') {
    return (
      <>
        {eventCategory === 'xv' ? (
          <XvLandingPage
            user={currentUser}
            isLoggedIn={!!currentUser}
            userEmail={currentUser?.email}
            onBackToPortal={() => {
              setCurrentView('portal');
              if (typeof window !== 'undefined') {
                window.history.pushState(null, '', '/');
              }
              window.scrollTo({ top: 0, behavior: 'smooth' });
            }}
            onOpenAuth={(mode, plan) => openAuth(mode, plan)}
            onOpenDashboard={() => {
              if (currentUser?.role === 'ceo' || currentUser?.email === 'daviex14@gmail.com') {
                setCurrentView('ceo');
              } else {
                setCurrentView('dashboard');
              }
              window.scrollTo({ top: 0, behavior: 'smooth' });
            }}
            onGoToDashboard={() => {
              if (currentUser?.role === 'ceo' || currentUser?.email === 'daviex14@gmail.com') {
                setCurrentView('ceo');
              } else {
                setCurrentView('dashboard');
              }
              window.scrollTo({ top: 0, behavior: 'smooth' });
            }}
            onExploreDemo={(style) => {
              setCurrentWeddingId(DEMO_XV_ID);
              setIsViewingDemo(true);
              setSettings((prev) => ({ ...(prev?.eventType === 'xv' ? prev : DEFAULT_XV_SETTINGS), cardStyle: style || prev?.cardStyle || 'romantic-floral' }));
              setShowAdminDashboard(false);
              setCurrentView('invitation');
              if (typeof window !== 'undefined' && window.location.pathname !== '/demo') {
                window.history.pushState({ mode: 'demo' }, '', '/demo?event=xv');
              }
              window.scrollTo({ top: 0, behavior: 'smooth' });
            }}
            onViewDemo={(style) => {
              setCurrentWeddingId(DEMO_XV_ID);
              setIsViewingDemo(true);
              setSettings((prev) => ({ ...(prev?.eventType === 'xv' ? prev : DEFAULT_XV_SETTINGS), cardStyle: style || prev?.cardStyle || 'romantic-floral' }));
              setShowAdminDashboard(false);
              setCurrentView('invitation');
              if (typeof window !== 'undefined' && window.location.pathname !== '/demo') {
                window.history.pushState({ mode: 'demo' }, '', '/demo?event=xv');
              }
              window.scrollTo({ top: 0, behavior: 'smooth' });
            }}
          />
        ) : (
          <LandingPage
            user={currentUser}
            isLoggedIn={!!currentUser}
            userEmail={currentUser?.email}
            onBackToPortal={() => {
              setCurrentView('portal');
              if (typeof window !== 'undefined') {
                window.history.pushState(null, '', '/');
              }
              window.scrollTo({ top: 0, behavior: 'smooth' });
            }}
            onOpenAuth={(mode, plan) => openAuth(mode, plan)}
            onOpenDashboard={() => {
              if (currentUser?.role === 'ceo' || currentUser?.email === 'daviex14@gmail.com') {
                setCurrentView('ceo');
              } else {
                setCurrentView('dashboard');
              }
              window.scrollTo({ top: 0, behavior: 'smooth' });
            }}
            onGoToDashboard={() => {
              if (currentUser?.role === 'ceo' || currentUser?.email === 'daviex14@gmail.com') {
                setCurrentView('ceo');
              } else {
                setCurrentView('dashboard');
              }
              window.scrollTo({ top: 0, behavior: 'smooth' });
            }}
            onExploreDemo={(style) => {
              setCurrentWeddingId(DEMO_WEDDING_ID);
              setIsViewingDemo(true);
              if (style && settings) {
                setSettings({ ...settings, cardStyle: style });
              }
              setShowAdminDashboard(false);
              setCurrentView('invitation');
              if (typeof window !== 'undefined') {
                window.history.pushState({ mode: 'demo' }, '', '/demo?event=bodas');
              }
              window.scrollTo({ top: 0, behavior: 'smooth' });
            }}
            onViewDemo={(style) => {
              setCurrentWeddingId(DEMO_WEDDING_ID);
              setIsViewingDemo(true);
              if (style && settings) {
                setSettings({ ...settings, cardStyle: style });
              }
              setShowAdminDashboard(false);
              setCurrentView('invitation');
              if (typeof window !== 'undefined') {
                window.history.pushState({ mode: 'demo' }, '', '/demo?event=bodas');
              }
              window.scrollTo({ top: 0, behavior: 'smooth' });
            }}
          />
        )}

        <AuthModal
          isOpen={isAuthModalOpen}
          onClose={closeAuth}
          initialMode={authModalMode}
          selectedPlan={authSelectedPlan}
          onAuthSuccess={handleAuthSuccess}
        />
        <ToastContainer />
      </>
    );
  }

  // 3. USER DASHBOARD VIEW (CENTRAL MULTI-EVENT & PROJECTS HUB)
  if (currentView === 'dashboard') {
    const activeUser: UserProfile = currentUser || {
      uid: 'demo_user_123',
      email: 'organizador@atelier.com',
      name: 'David & Organizadores (Demo)',
      role: 'wedding_planner',
      plan: 'planner_starter',
    };

    return (
      <>
        <UserDashboard
          user={activeUser}
          onSelectWedding={handleSelectWedding}
          onLogout={handleLogout}
          onBackToLanding={() => {
            setCurrentView('portal');
            if (typeof window !== 'undefined') {
              window.history.pushState(null, '', '/');
            }
            window.scrollTo({ top: 0, behavior: 'smooth' });
          }}
          onUpdatePlan={handleUpdatePlan}
          onOpenCeoDashboard={() => setCurrentView('ceo')}
        />
        <AuthModal
          isOpen={isAuthModalOpen}
          onClose={closeAuth}
          initialMode={currentUser ? 'register' : 'login'}
          onAuthSuccess={handleAuthSuccess}
        />
        <ToastContainer />
      </>
    );
  }

  // 3. ADMIN / ATELIER FULL-PAGE VIEW
  if (currentView === 'admin') {
    const isXvAdmin = settingsEventCategory === 'xv';

    if (loadingWedding || !settings) {
      return (
        <div className="min-h-screen bg-[#FDFCF0] flex flex-col items-center justify-center text-[#3D3D3D]">
          <motion.div
            animate={{ scale: [1, 1.12, 1] }}
            transition={{ repeat: Infinity, duration: 1.6 }}
            className="w-16 h-16 rounded-full aspect-square shrink-0 circle-badge bg-[#FAF9F0] border border-[#E5E2D0] flex items-center justify-center text-[#5A5A40] mb-4 shadow-sm"
          >
            {isXvAdmin ? (
              <Crown className="w-8 h-8 text-pink-500" />
            ) : (
              <Heart className="w-8 h-8 fill-current text-[#7D8C7A]" />
            )}
          </motion.div>
          <p className="font-serif italic text-xl tracking-wider text-[#5A5A40]">
            {isXvAdmin ? 'Cargando Atelier XV Años...' : 'Cargando Atelier & Gestión...'}
          </p>
          <p className="text-[10px] uppercase tracking-widest text-[#7D8C7A] mt-1 font-bold">
            {isXvAdmin ? 'Atelier Quince Años Digital' : 'Atelier Nupcial Digital'}
          </p>
        </div>
      );
    }

    return (
      <>
        {isXvAdmin ? (
          <XvAdminDashboard
            settings={settings}
            onUpdateSettings={handleUpdateSettings}
            onBackToDashboard={() => {
              setCurrentView('dashboard');
              if (typeof window !== 'undefined') {
                window.history.pushState({}, '', '/?mode=dashboard');
              }
              window.scrollTo({ top: 0, behavior: 'smooth' });
            }}
            onBackToInvitation={() => {
              setCurrentView('invitation');
              setShowAdminDashboard(false);
              window.scrollTo({ top: 0, behavior: 'smooth' });
            }}
            currentUser={currentUser}
          />
        ) : (
          <AdminDashboard
            settings={settings}
            onUpdateSettings={handleUpdateSettings}
            onBackToDashboard={() => {
              setCurrentView('dashboard');
              if (typeof window !== 'undefined') {
                window.history.pushState({}, '', '/?mode=dashboard');
              }
              window.scrollTo({ top: 0, behavior: 'smooth' });
            }}
            onBackToInvitation={() => {
              setCurrentView('invitation');
              setShowAdminDashboard(false);
              window.scrollTo({ top: 0, behavior: 'smooth' });
            }}
            currentUser={currentUser}
          />
        )}
        <ToastContainer />
      </>
    );
  }

  // Loading state for wedding invitation view
  if (loadingWedding || !settings) {
    return (
      <div className="min-h-screen bg-[#FDFCF0] flex flex-col items-center justify-center text-[#3D3D3D]">
        <motion.div
          animate={{ scale: [1, 1.12, 1] }}
          transition={{ repeat: Infinity, duration: 1.6 }}
          className="w-16 h-16 rounded-full aspect-square shrink-0 circle-badge bg-[#FAF9F0] border border-[#E5E2D0] flex items-center justify-center text-[#5A5A40] mb-4 shadow-sm"
        >
          {settingsEventCategory === 'xv' ? (
            <Sparkles className="w-8 h-8 text-pink-500" />
          ) : (
            <Heart className="w-8 h-8 fill-current text-[#7D8C7A]" />
          )}
        </motion.div>
        <p className="font-serif italic text-xl tracking-wider text-[#5A5A40]">
          {settingsEventCategory === 'xv' ? 'Cargando Invitación de XV Años...' : 'Cargando Invitación de Boda...'}
        </p>
        <p className="text-[10px] uppercase tracking-widest text-[#7D8C7A] mt-1 font-bold">
          {settingsEventCategory === 'xv' ? 'Atelier XV Años Digital' : 'Atelier Nupcial Digital'}
        </p>
      </div>
    );
  }

  const activeTheme = settingsEventCategory === 'xv'
    ? (XV_CARD_THEMES[settings.cardStyle] || XV_CARD_THEMES['romantic-floral'])
    : (CARD_THEMES[settings.cardStyle] || CARD_THEMES['classic-gold']);

  const isPreviewEmbed = typeof window !== 'undefined' && new URLSearchParams(window.location.search).get('mode') === 'preview_embed';
  const isDemoMode = (isViewingDemo || (!currentUser && currentWeddingId === DEMO_WEDDING_ID && !getPathSlug())) && !isPreviewEmbed;
  const openInlineRsvp = () => document.getElementById('rsvp')?.scrollIntoView({ behavior: 'smooth' });
  const toggleInlineRsvp = () => setIsInlineRsvpOpen((isOpen) => !isOpen);
  const handleRsvpSuccess = (updated: Guest) => {
    setActiveGuest(updated);
    if (settings.id && updated) {
      try {
        localStorage.setItem(`rsvp_guest_${settings.id}`, JSON.stringify(updated));
      } catch (error) {
        console.warn('Could not save guest to localStorage:', error);
      }
    }
  };

  const gallerySection: React.ReactNode = settings.showPhotoGallery !== false ? (
    settingsEventCategory === 'xv' ? (
      <XvPhotoGallery
        key="gallery"
        weddingId={settings.id}
        guestName={activeGuest?.fullName}
        guestCode={activeGuest?.accessCode}
        cardStyle={settings.cardStyle}
        isAdmin={!isDemoMode && Boolean(currentUser)}
        settings={settings}
      />
    ) : (
      <PhotoGallery
        key="gallery"
        weddingId={settings.id}
        guestName={activeGuest?.fullName}
        guestCode={activeGuest?.accessCode}
        cardStyle={settings.cardStyle}
        isAdmin={!isDemoMode && Boolean(currentUser)}
        settings={settings}
      />
    )
  ) : null;
  const galleryInEventDetails = settings.galleryPlacement === 'event-details' && settings.showPhotoGallery !== false;
  const inlineRsvp = isInlineRsvpOpen && settings.showRsvpSection !== false
    ? settingsEventCategory === 'xv'
      ? <XvRsvpSection key="rsvp-inline" initialGuest={activeGuest} settings={settings} onRsvpSuccess={handleRsvpSuccess} inline />
      : <RsvpSection key="rsvp-inline" initialGuest={activeGuest} settings={settings} onRsvpSuccess={handleRsvpSuccess} inline />
    : null;

  const landingSections: Record<LandingSectionId, React.ReactNode> = {
    invitation: (
      <section id="seccion-invitacion" key="invitation">
        {settingsEventCategory === 'xv' ? (
          <XvEnvelopeCard settings={settings} guest={activeGuest} onOpenRsvp={openInlineRsvp} onToggleInlineRsvp={toggleInlineRsvp} isInlineRsvpOpen={isInlineRsvpOpen} inlineRsvp={inlineRsvp} inlineGallery={galleryInEventDetails ? gallerySection : undefined} />
        ) : (
          <EnvelopeCard settings={settings} guest={activeGuest} onOpenRsvp={openInlineRsvp} onToggleInlineRsvp={toggleInlineRsvp} isInlineRsvpOpen={isInlineRsvpOpen} inlineRsvp={inlineRsvp} inlineGallery={galleryInEventDetails ? gallerySection : undefined} />
        )}
      </section>
    ),
    gallery: galleryInEventDetails ? null : gallerySection,
    video: settings.showVideoMemories === true ? (
      settingsEventCategory === 'xv' ? (
        <XvVideoSection key="video" weddingId={settings.id} isAdmin={!isDemoMode && Boolean(currentUser)} cardStyle={settings.cardStyle} />
      ) : (
        <VideoSection key="video" weddingId={settings.id} isAdmin={!isDemoMode && Boolean(currentUser)} cardStyle={settings.cardStyle} />
      )
    ) : null,
    hotels: <HotelsSection key="hotels" settings={settings} eventType={settingsEventCategory} />,
    rsvp: settings.showRsvpSection !== false ? (
      settingsEventCategory === 'xv' ? (
        <XvRsvpSection key="rsvp" initialGuest={activeGuest} settings={settings} onRsvpSuccess={handleRsvpSuccess} />
      ) : (
        <RsvpSection key="rsvp" initialGuest={activeGuest} settings={settings} onRsvpSuccess={handleRsvpSuccess} />
      )
    ) : null,
    guestbook: settings.showGuestbook === true ? (
      settingsEventCategory === 'xv' ? (
        <XvGuestbookSection key="guestbook" weddingId={settings.id} defaultAuthor={activeGuest?.fullName} cardStyle={settings.cardStyle} />
      ) : (
        <GuestbookSection key="guestbook" weddingId={settings.id} defaultAuthor={activeGuest?.fullName} cardStyle={settings.cardStyle} />
      )
    ) : null,
  };

  return (
    <div
      className={`public-invitation min-h-screen w-full max-w-full overflow-x-clip ${activeTheme.bgClass} text-[#3D3D3D] selection:bg-[#7D8C7A]/20 selection:text-[#5A5A40] relative font-sans`}
      style={{ backgroundColor: activeTheme.bgHex }}
    >
      {/* Interactive Demo Style Selector Bar in Demo Mode */}
      {isDemoMode && (
        settingsEventCategory === 'xv' ? (
          <XvDemoStyleBar
            currentStyle={settings.cardStyle}
            coupleNames={settings.coupleNames}
            onSelectStyle={(newStyle) => {
              setSettings((prev) => ({ ...prev, cardStyle: newStyle }));
              toast.info(`Diseño cambiado a ${XV_CARD_THEMES[newStyle]?.name || newStyle}`, 'Estilo XV Actualizado');
            }}
            onChooseDesign={(chosenStyle) => {
              setSettings((prev) => ({ ...prev, cardStyle: chosenStyle }));
              openAuth('register', 'atelier');
            }}
            onOpenLogin={() => openAuth('login')}
            onBackToLanding={() => {
              setIsViewingDemo(false);
              setCurrentView('landing');
              if (typeof window !== 'undefined') {
                window.history.pushState(null, '', '/xv');
              }
              window.scrollTo({ top: 0, behavior: 'smooth' });
            }}
          />
        ) : (
          <DemoStyleBar
            currentStyle={settings.cardStyle}
            coupleNames={settings.coupleNames}
            onSelectStyle={(newStyle) => {
              setSettings((prev) => ({ ...prev, cardStyle: newStyle }));
              toast.info(`Diseño cambiado a ${CARD_THEMES[newStyle]?.name || newStyle}`, 'Estilo Actualizado');
            }}
            onChooseDesign={(chosenStyle) => {
              setSettings((prev) => ({ ...prev, cardStyle: chosenStyle }));
              openAuth('register', 'atelier');
            }}
            onOpenLogin={() => openAuth('login')}
            onBackToLanding={() => {
              setIsViewingDemo(false);
              setCurrentView('landing');
              if (typeof window !== 'undefined') {
                window.history.pushState(null, '', '/boda');
              }
              window.scrollTo({ top: 0, behavior: 'smooth' });
            }}
          />
        )
      )}

      {/* Floating Single Clean Fullscreen Control (Top Right, away from audio player) */}
      {!isPreviewEmbed && !isDemoMode && (
        <div className="fixed top-4 right-4 z-40 flex items-center gap-2">
          {currentUser && (
            <button
              onClick={() => {
                setCurrentView('admin');
                window.scrollTo({ top: 0, behavior: 'smooth' });
              }}
              className="px-3 py-1.5 rounded-full bg-[#FAF9F0]/90 hover:bg-white text-[#5A5A40] border border-[#E5E2D0] shadow-md backdrop-blur-md text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer hover:scale-105"
              title="Panel de Atelier & Gestión"
            >
              <SlidersHorizontal className="w-3.5 h-3.5 text-[#7D8C7A] shrink-0" />
              <span className="hidden sm:inline">Atelier</span>
            </button>
          )}

          <button
            onClick={toggleFullscreen}
            className="p-2.5 sm:px-3.5 sm:py-2 rounded-full bg-[#FAF9F0]/90 hover:bg-white text-[#5A5A40] border border-[#E5E2D0] shadow-md backdrop-blur-md text-xs font-medium flex items-center gap-1.5 transition-all cursor-pointer hover:scale-105"
            title={isFullscreen ? 'Salir de pantalla completa' : 'Ver en pantalla completa'}
            id="btn-single-fullscreen"
          >
            {isFullscreen ? (
              <>
                <Minimize2 className="w-4 h-4 text-[#5A5A40] shrink-0" />
                <span className="hidden sm:inline font-serif text-[11px]">Salir Pantalla Completa</span>
              </>
            ) : (
              <>
                <Maximize2 className="w-4 h-4 text-[#5A5A40] shrink-0" />
                <span className="hidden sm:inline font-serif text-[11px]">Pantalla Completa</span>
              </>
            )}
          </button>
        </div>
      )}

      {/* Floating Audio Player Widget (Bottom Left) */}
      {settingsEventCategory === 'xv' ? (
        <XvAudioPlayer
          settings={settings}
          audioUrl={settings?.audioUrl}
          songTitle={settings?.audioTitle || 'Vals de Ensueño'}
          artistName={settings?.coupleNames || 'Vals de Mis XV'}
          eventTitle="Música de XV Años"
          isAdmin={!isDemoMode && Boolean(currentUser)}
          onUpdateSettings={handleUpdateSettings}
          onAudioUpdated={(newUrl, newTitle) => {
            handleUpdateSettings({
              audioUrl: newUrl,
              audioTitle: newTitle || settings?.audioTitle,
            });
          }}
        />
      ) : (
        <AudioPlayer
          settings={settings}
          audioUrl={settings?.audioUrl}
          songTitle={settings?.audioTitle || 'Nuestra Canción'}
          artistName={settings?.coupleNames || 'Música de Boda'}
          eventTitle="Música de Boda"
          eventCategory={settingsEventCategory}
          isAdmin={!isDemoMode && Boolean(currentUser)}
          onUpdateSettings={handleUpdateSettings}
          onAudioUpdated={(newUrl, newTitle) => {
            handleUpdateSettings({
              audioUrl: newUrl,
              audioTitle: newTitle || settings?.audioTitle,
            });
          }}
        />
      )}

      <main id="inicio" className="w-full relative z-10" style={{ backgroundColor: activeTheme.bgHex }}>
        {getLandingSectionOrder(settings.landingSectionOrder).map((sectionId) => (
          <React.Fragment key={sectionId}>{landingSections[sectionId]}</React.Fragment>
        ))}
      </main>

      {/* Scroll to top button */}
      <AnimatePresence>
        {showScrollTop && (
          <motion.button
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.8 }}
            onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
            className="fixed bottom-6 right-6 z-30 w-12 h-12 rounded-full aspect-square shrink-0 circle-badge bg-[#5A5A40] text-[#FDFCF0] shadow-xl hover:bg-[#484833] transition-colors cursor-pointer border border-[#E5E2D0]/40 flex items-center justify-center"
            title="Volver arriba"
          >
            <ChevronUp className="w-5 h-5 shrink-0" />
          </motion.button>
        )}
      </AnimatePresence>

      {/* Auth Modal for Choosing Design or Logging in */}
      <AuthModal
        isOpen={isAuthModalOpen}
        onClose={closeAuth}
        initialMode={authModalMode}
        selectedPlan={authSelectedPlan}
        onAuthSuccess={handleAuthSuccess}
      />

      {/* Global Toast Notifications */}
      <ToastContainer />
    </div>
  );
}
