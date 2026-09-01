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
import { WeddingSettings, Guest, UserProfile, PlanId } from './types.ts';
import { AudioPlayer } from './components/AudioPlayer.tsx';
import { EnvelopeCard } from './components/EnvelopeCard.tsx';
import { RsvpSection } from './components/RsvpSection.tsx';
import { PhotoGallery } from './components/PhotoGallery.tsx';
import { VideoSection } from './components/VideoSection.tsx';
import { ItinerarySection } from './components/ItinerarySection.tsx';
import { DressCodeSection } from './components/DressCodeSection.tsx';
import { LocationsSection } from './components/LocationsSection.tsx';
import { GiftRegistrySection } from './components/GiftRegistrySection.tsx';
import { GuestbookSection } from './components/GuestbookSection.tsx';
import { AdminDashboard } from './components/AdminDashboard.tsx';
import { LandingPage } from './components/LandingPage.tsx';
import { UserDashboard } from './components/UserDashboard.tsx';
import { CeoMasterDashboard } from './components/CeoMasterDashboard.tsx';
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
import { SUBSCRIPTION_PLANS } from './data/plans.ts';
import { DEFAULT_WEDDING_SETTINGS } from './data/defaultSettings.ts';
import { CardStyle } from './types.ts';

type AppView = 'landing' | 'dashboard' | 'invitation' | 'admin' | 'ceo';

export default function App() {
  // Helper to extract path slug e.g. "/bodasergioylore" -> "bodasergioylore"
  const getPathSlug = () => {
    if (typeof window === 'undefined') return null;
    const segments = window.location.pathname.split('/').filter(Boolean);
    const reserved = [
      'api', 'uploads', 'src', 'assets', 'admin', 'dashboard', 'ceo', 'landing',
      'login', 'register', 'ingresar', 'registro', 'signin', 'signup',
      'demo', 'demostracion'
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

      const mode = new URLSearchParams(window.location.search).get('mode');
      if (mode === 'preview_embed' || mode === 'invitation') return 'invitation';
      if (mode === 'admin') return 'admin';
      if (mode === 'dashboard') return 'dashboard';
      if (mode === 'ceo') return 'ceo';

      const pathSlug = getPathSlug();
      if (pathSlug) return 'invitation';
    }
    return 'landing';
  });
  const [currentWeddingId, setCurrentWeddingId] = useState<number>(1);

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

  // Active Wedding State
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
    return DEFAULT_WEDDING_SETTINGS;
  });
  const [loadingWedding, setLoadingWedding] = useState(false);
  const [activeGuest, setActiveGuest] = useState<Guest | null>(null);
  const [showRsvpModal, setShowRsvpModal] = useState(false);
  const [showAdminDashboard, setShowAdminDashboard] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [showScrollTop, setShowScrollTop] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [showHostPill, setShowHostPill] = useState(true);
  const [isViewingDemo, setIsViewingDemo] = useState<boolean>(() => checkIsDemoUrl());

  // Listen to popstate and url changes for direct login/register and /demo routing
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
        setCurrentWeddingId(1);
        setCurrentView('invitation');
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
      applyThemeScrollbar(settings.cardStyle);
    }
  }, [settings?.cardStyle]);

  // Update dynamic browser tab title & client meta description
  useEffect(() => {
    if (typeof document === 'undefined') return;
    if (currentView === 'landing') {
      document.title = 'Atelier Nupcial Digital | Invitaciones de Boda Elegantes e Interactivas';
    } else if (currentView === 'admin' || currentView === 'dashboard') {
      document.title = `Panel de Administración — Boda de ${settings?.coupleNames || 'los Novios'}`;
    } else {
      const coupleNames = settings?.coupleNames || 'Sofía & Alejandro';
      if (activeGuest?.fullName) {
        document.title = `💌 ¡${activeGuest.fullName}, invitación a la Boda de ${coupleNames}!`;
      } else {
        document.title = `💍 Boda de ${coupleNames} — Invitación Oficial`;
      }
    }
  }, [currentView, settings?.coupleNames, activeGuest?.fullName]);

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

    // Check if URL is pointing to demo
    const isDemo = checkIsDemoUrl();
    if (isDemo) {
      setCurrentWeddingId(1);
      setIsViewingDemo(true);
      setCurrentView('invitation');
      setLoadingWedding(false);
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
      setCurrentView('admin');
    } else {
      // Default to landing page
      setCurrentView('landing');
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

    const fetchWeddingConfig = async () => {
      try {
        setLoadingWedding(true);
        const search = window.location.search;
        const params = new URLSearchParams(search);
        let weddingParam = params.get('w') || params.get('wedding') || getPathSlug();
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
            setSettings({ ...DEFAULT_WEDDING_SETTINGS, ...data });
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
              }
            } catch (guestErr) {
              console.warn('Could not find guest by code:', guestErr);
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
      setCurrentWeddingId(1);
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
    setCurrentView('landing');
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

  const handleSelectWedding = (weddingId: number, mode: 'invitation' | 'admin') => {
    setIsViewingDemo(false);
    setCurrentWeddingId(weddingId);
    setCurrentView(mode === 'admin' ? 'admin' : 'invitation');
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

  // 2. LANDING PAGE VIEW
  if (currentView === 'landing') {
    return (
      <>
        <LandingPage
          user={currentUser}
          isLoggedIn={!!currentUser}
          userEmail={currentUser?.email}
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
            setCurrentWeddingId(1);
            setIsViewingDemo(true);
            if (style && settings) {
              setSettings({ ...settings, cardStyle: style });
            }
            setShowAdminDashboard(false);
            setCurrentView('invitation');
            if (typeof window !== 'undefined' && window.location.pathname !== '/demo') {
              window.history.pushState({ mode: 'demo' }, '', '/demo');
            }
            window.scrollTo({ top: 0, behavior: 'smooth' });
          }}
          onViewDemo={(style) => {
            setCurrentWeddingId(1);
            setIsViewingDemo(true);
            if (style && settings) {
              setSettings({ ...settings, cardStyle: style });
            }
            setShowAdminDashboard(false);
            setCurrentView('invitation');
            if (typeof window !== 'undefined' && window.location.pathname !== '/demo') {
              window.history.pushState({ mode: 'demo' }, '', '/demo');
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

  // 3. USER DASHBOARD VIEW
  if (currentView === 'dashboard') {
    // If not logged in, show demo user or trigger auth
    if (!currentUser) {
      const demoUser: UserProfile = {
        uid: 'demo_user_123',
        email: 'organizador@atelier.com',
        name: 'Ana & Carlos (Demo)',
        role: 'couple',
        plan: 'atelier',
      };
      return (
        <>
          <UserDashboard
            user={demoUser}
            onSelectWedding={handleSelectWedding}
            onLogout={() => setCurrentView('landing')}
            onBackToLanding={() => setCurrentView('landing')}
            onUpdatePlan={handleUpdatePlan}
            onOpenCeoDashboard={() => setCurrentView('ceo')}
          />
          <AuthModal
            isOpen={isAuthModalOpen}
            onClose={closeAuth}
            initialMode="login"
            onAuthSuccess={handleAuthSuccess}
          />
          <ToastContainer />
        </>
      );
    }

    return (
      <>
        <UserDashboard
          user={currentUser}
          onSelectWedding={handleSelectWedding}
          onLogout={handleLogout}
          onBackToLanding={() => setCurrentView('landing')}
          onUpdatePlan={handleUpdatePlan}
          onOpenCeoDashboard={() => setCurrentView('ceo')}
        />
        <AuthModal
          isOpen={isAuthModalOpen}
          onClose={closeAuth}
          initialMode="register"
          onAuthSuccess={handleAuthSuccess}
        />
        <ToastContainer />
      </>
    );
  }

  // 3. ADMIN / ATELIER FULL-PAGE VIEW
  if (currentView === 'admin') {
    if (loadingWedding || !settings) {
      return (
        <div className="min-h-screen bg-[#FDFCF0] flex flex-col items-center justify-center text-[#3D3D3D]">
          <motion.div
            animate={{ scale: [1, 1.12, 1] }}
            transition={{ repeat: Infinity, duration: 1.6 }}
            className="w-16 h-16 rounded-full aspect-square shrink-0 circle-badge bg-[#FAF9F0] border border-[#E5E2D0] flex items-center justify-center text-[#5A5A40] mb-4 shadow-sm"
          >
            <Heart className="w-8 h-8 fill-current text-[#7D8C7A]" />
          </motion.div>
          <p className="font-serif italic text-xl tracking-wider text-[#5A5A40]">
            Cargando Atelier & Gestión...
          </p>
          <p className="text-[10px] uppercase tracking-widest text-[#7D8C7A] mt-1 font-bold">
            Atelier Nupcial Digital
          </p>
        </div>
      );
    }

    return (
      <>
        <AdminDashboard
          settings={settings}
          onUpdateSettings={handleUpdateSettings}
          onBackToDashboard={() => {
            setCurrentView('dashboard');
            window.scrollTo({ top: 0, behavior: 'smooth' });
          }}
          onBackToInvitation={() => {
            setCurrentView('invitation');
            setShowAdminDashboard(false);
            window.scrollTo({ top: 0, behavior: 'smooth' });
          }}
          currentUser={currentUser}
        />
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
          <Heart className="w-8 h-8 fill-current text-[#7D8C7A]" />
        </motion.div>
        <p className="font-serif italic text-xl tracking-wider text-[#5A5A40]">
          Cargando Invitación de Boda...
        </p>
        <p className="text-[10px] uppercase tracking-widest text-[#7D8C7A] mt-1 font-bold">
          Atelier Nupcial Digital
        </p>
      </div>
    );
  }

  const activeTheme = CARD_THEMES[settings.cardStyle] || CARD_THEMES['classic-gold'];

  const isPreviewEmbed = typeof window !== 'undefined' && new URLSearchParams(window.location.search).get('mode') === 'preview_embed';
  const isDemoMode = (isViewingDemo || (!currentUser && currentWeddingId === 1 && !getPathSlug())) && !isPreviewEmbed;

  return (
    <div
      className={`min-h-screen w-full max-w-full overflow-x-clip ${activeTheme.bgClass} text-[#3D3D3D] selection:bg-[#7D8C7A]/20 selection:text-[#5A5A40] relative font-sans`}
      style={{ backgroundColor: activeTheme.bgHex }}
    >
      {/* Interactive Demo Style Selector Bar in Demo Mode */}
      {isDemoMode && (
        <DemoStyleBar
          currentStyle={settings.cardStyle}
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
              const currentPath = window.location.pathname.toLowerCase();
              if (currentPath === '/demo' || currentPath === '/demostracion') {
                window.history.pushState(null, '', '/');
              }
            }
            window.scrollTo({ top: 0, behavior: 'smooth' });
          }}
        />
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
      <AudioPlayer
        settings={settings}
        audioUrl={settings?.audioUrl}
        songTitle={settings?.audioTitle || 'Nuestra Canción'}
        artistName={settings?.coupleNames || 'Música de Boda'}
        isAdmin={!isDemoMode && Boolean(currentUser)}
        onUpdateSettings={handleUpdateSettings}
        onAudioUpdated={(newUrl, newTitle) => {
          handleUpdateSettings({
            audioUrl: newUrl,
            audioTitle: newTitle || settings?.audioTitle,
          });
        }}
      />

      {/* Hero / Main Envelope Section - Full Viewport Landing Flow */}
      <main id="inicio" className="w-full relative z-10" style={{ backgroundColor: activeTheme.bgHex }}>
        {/* 1. Portada y sobre interactivo */}
        <EnvelopeCard
          settings={settings}
          guest={activeGuest}
          onOpenRsvp={() => {
            const el = document.getElementById('rsvp');
            if (el) {
              el.scrollIntoView({ behavior: 'smooth' });
            }
          }}
        />

        {/* 2. Itinerario */}
        {settings.showItinerary !== false && (
          <ItinerarySection settings={settings} />
        )}

        {/* 3. Cómo llegar / Ubicaciones & Maps */}
        {settings.showLocations !== false && (
          <LocationsSection settings={settings} />
        )}

        {/* 4. Código de Vestimenta */}
        {settings.showDressCode !== false && (
          <DressCodeSection settings={settings} />
        )}

        {/* 5. Regalos & Cuentas Bancarias */}
        {settings.showGiftRegistry !== false && (
          <GiftRegistrySection settings={settings} />
        )}

        {/* 6. Galería Interactiva de Fotos (Subida AVIF 95% + Enlaces externos) */}
        {settings.showPhotoGallery !== false && (
          <PhotoGallery
            weddingId={settings.id}
            guestName={activeGuest?.fullName}
            guestCode={activeGuest?.accessCode}
            cardStyle={settings.cardStyle}
          />
        )}

        {/* Video Memories Section (Opcional) */}
        {settings.showVideoMemories === true && (
          <VideoSection
            weddingId={settings.id}
            isAdmin={!isDemoMode && Boolean(currentUser)}
            cardStyle={settings.cardStyle}
          />
        )}

        {/* 7. Confirmación de Asistencia Inline (Amplio, elegante, sin modales) */}
        <RsvpSection
          initialGuest={activeGuest}
          settings={settings}
          onRsvpSuccess={(updated) => {
            setActiveGuest(updated);
          }}
        />

        {/* Guestbook & Wishes (Opcional) */}
        {settings.showGuestbook !== false && (
          <GuestbookSection
            weddingId={settings.id}
            defaultAuthor={activeGuest?.fullName}
            cardStyle={settings.cardStyle}
          />
        )}
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

      {/* Final Romantic Sign-off & RSVP Banner (FixDate style - No platform footers) */}
      <section className="py-20 px-4 text-center bg-transparent">
        <div className="max-w-2xl mx-auto space-y-6">
          <div className="w-16 h-16 rounded-2xl bg-[#5A5A40]/10 text-[#5A5A40] border border-[#E5E2D0] flex items-center justify-center mx-auto mb-3">
            <AnimatedWeddingRings className="w-12 h-12" />
          </div>

          <span className="text-xs uppercase tracking-[0.3em] text-[#7D8C7A] font-semibold block">
            ¡Nos vemos muy pronto!
          </span>

          <h3 className="text-4xl sm:text-5xl font-serif italic text-[#3D3D2C]">
            {settings.coupleNames}
          </h3>

          <AnimatedFloralDivider className="w-48 sm:w-60 h-8 mx-auto" color="#7D8C7A" />

          <p className="text-xs uppercase tracking-[0.25em] text-[#7D8C7A] font-semibold font-mono">
            {settings.eventDate} • {settings.receptionVenue}
          </p>

          <p className="text-sm text-stone-600 max-w-md mx-auto italic font-serif leading-relaxed">
            "Gracias por ser parte de nuestra historia y acompañarnos en el día más feliz de nuestras vidas."
          </p>

          <div className="pt-4">
            <motion.button
              whileHover={{ scale: 1.04 }}
              whileTap={{ scale: 0.96 }}
              onClick={() => {
                const el = document.getElementById('rsvp');
                if (el) {
                  el.scrollIntoView({ behavior: 'smooth' });
                }
              }}
              className="px-8 py-3.5 rounded-full bg-stone-900 text-stone-100 hover:bg-stone-800 font-serif font-semibold text-sm shadow-xl cursor-pointer inline-flex items-center gap-2"
            >
              <Heart className="w-4 h-4 fill-current text-rose-300 shrink-0" />
              <span>Confirmar Asistencia (RSVP)</span>
            </motion.button>
          </div>
        </div>
      </section>

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
