import React, { useState } from 'react';
import { motion } from 'motion/react';
import {
  Sparkles,
  Heart,
  Music,
  CheckCircle2,
  Users,
  Camera,
  Video,
  Gift,
  MapPin,
  ArrowRight,
  ShieldCheck,
  ChevronRight,
  Crown,
  Share2,
  Calendar,
  Smartphone,
  Star,
  Check,
  HelpCircle,
  Clock,
  Sparkle
} from 'lucide-react';
import { PlanId, CardStyle } from '../types.ts';
import { SUBSCRIPTION_PLANS } from '../data/plans.ts';

interface LandingPageProps {
  onOpenAuth: (mode: 'login' | 'register', planId?: PlanId) => void;
  onExploreDemo?: (style?: CardStyle) => void;
  onViewDemo?: (style?: CardStyle) => void;
  onOpenDashboard?: () => void;
  onGoToDashboard?: () => void;
  onBackToPortal?: () => void;
  user?: any;
  isLoggedIn?: boolean;
  userEmail?: string;
}

export const LandingPage: React.FC<LandingPageProps> = ({
  onOpenAuth,
  onExploreDemo,
  onViewDemo,
  onOpenDashboard,
  onGoToDashboard,
  onBackToPortal,
  user,
  isLoggedIn = false,
  userEmail,
}) => {
  const [activePreviewStyle, setActivePreviewStyle] = useState<CardStyle>('classic-gold');
  const [billingInterval, setBillingInterval] = useState<'one-time' | 'annual'>('one-time');
  const [pricingCategory, setPricingCategory] = useState<'couple' | 'planner'>('couple');
  const [openFaq, setOpenFaq] = useState<number | null>(0);

  const handleDemoClick = (style?: CardStyle) => {
    if (onExploreDemo) {
      onExploreDemo(style);
    } else if (onViewDemo) {
      onViewDemo(style);
    }
  };

  const handleDashboardClick = () => {
    if (onOpenDashboard) {
      onOpenDashboard();
    } else if (onGoToDashboard) {
      onGoToDashboard();
    }
  };

  const isUserAuthenticated = isLoggedIn || !!user;

  const styleShowcase = [
    {
      id: 'classic-gold' as CardStyle,
      name: 'Classic Gold & Marfil',
      tag: 'Elegancia Atemporal',
      bgClass: 'bg-[#faf8f5] border-amber-300/60',
      accentColor: '#92702c',
      description: 'Filigranas doradas, tonos marfil y tipografía clásica de alta costura.',
    },
    {
      id: 'romantic-floral' as CardStyle,
      name: 'Romantic Floral Rosé',
      tag: 'Naturaleza & Delicadeza',
      bgClass: 'bg-[#fdf7f7] border-rose-200',
      accentColor: '#9f5b6b',
      description: 'Ilustraciones botánicas en acuarela, toques rosáceos y follaje suave.',
    },
    {
      id: 'boho-chic' as CardStyle,
      name: 'Boho Terracotta',
      tag: 'Cálido & Orgánico',
      bgClass: 'bg-[#faf3ee] border-amber-400/40',
      accentColor: '#b45309',
      description: 'Acentos terracota, hojas secas de pampa y calidez rústica moderna.',
    },
    {
      id: 'minimal-editorial' as CardStyle,
      name: 'Minimalist Editorial',
      tag: 'Vogue & Sofisticación',
      bgClass: 'bg-[#ffffff] border-stone-300',
      accentColor: '#1c1917',
      description: 'Composición limpia con espacios generosos y tipografía serif editorial.',
    },
    {
      id: 'dark-luxury' as CardStyle,
      name: 'Dark Velvet Luxury',
      tag: 'Gala Nocturna & Oro',
      bgClass: 'bg-[#1c1917] text-stone-100 border-amber-700/50',
      accentColor: '#d4af37',
      description: 'Fondo negro terciopelo con acentos en oro brillante para eventos de noche.',
    },
    {
      id: 'watercolor-garden' as CardStyle,
      name: 'Watercolor Garden',
      tag: 'Fresco & Campestre',
      bgClass: 'bg-[#f4f7f4] border-emerald-200',
      accentColor: '#2d6a4f',
      description: 'Tonos salvia, eucalipto y texturas de papel artesanal hecho a mano.',
    },
    {
      id: 'royal-navy' as CardStyle,
      name: 'Royal Navy & Gold',
      tag: 'Realeza & Gala Imperial',
      bgClass: 'bg-[#0B1320] text-stone-100 border-[#D4AF37]/50',
      accentColor: '#D4AF37',
      description: 'Azul zafiro de medianoche con filigranas heráldicas y orlas reales de gala.',
    },
    {
      id: 'terracotta-sunset' as CardStyle,
      name: 'Terracotta Sunset',
      tag: 'Atardecer & Dunas',
      bgClass: 'bg-[#FAF4EE] border-[#EACEC1]',
      accentColor: '#E07A5F',
      description: 'Cálidos atardeceres de terracota, agaves del desierto y tonos cobrizos envolventes.',
    },
    {
      id: 'lavender-provence' as CardStyle,
      name: 'Lavender Provence',
      tag: 'Provenza Francesa',
      bgClass: 'bg-[#F8F6FB] border-[#DDD6E8]',
      accentColor: '#7B6D8D',
      description: 'Campos de lavanda provenzal, mariposas etéreas y lila empolvado romántico.',
    },
    {
      id: 'emerald-botanical' as CardStyle,
      name: 'Emerald & Gold',
      tag: 'Selva Tropical & Oro',
      bgClass: 'bg-[#081710] text-stone-100 border-[#52B788]/50',
      accentColor: '#52B788',
      description: 'Hojas exuberantes de monstera y palmas esmeralda con ribetes en oro reluciente.',
    },
    {
      id: 'coastal-breeze' as CardStyle,
      name: 'Coastal Breeze',
      tag: 'Mediterráneo & Nácar',
      bgClass: 'bg-[#F2F8FA] border-[#CCE3ED]',
      accentColor: '#2B6CB0',
      description: 'Olas marinas en azul mediterráneo, conchas perladas y brisa costera serena.',
    },
    {
      id: 'champagne-glam' as CardStyle,
      name: 'Champagne Glam',
      tag: 'Art Déco & Años 20',
      bgClass: 'bg-[#FAF7F0] border-[#E8DEC8]',
      accentColor: '#C39B60',
      description: 'Gala Art Déco con destellos de perlas, champagne efervescente y geometría dorada.',
    },
  ];

  const faqs = [
    {
      q: '¿Cómo funciona la confirmación de asistencia (RSVP) en tiempo real?',
      a: 'Cada invitado o familia recibe un código de acceso único o enlace personalizado. Al ingresar, el sistema le muestra exactamente cuántos pases tiene asignados, puede confirmar o declinar, registrar acompañantes, indicar restricciones alimentarias y sugerir canciones para la fiesta. Todos los cambios se reflejan inmediatamente en tu panel de control.',
    },
    {
      q: '¿Puedo subir mi propia música de fondo para la invitación?',
      a: '¡Sí! Puedes cargar tu archivo de audio favorito (MP3) directamente en nuestro almacenamiento seguro o elegir entre piezas acústicas y clásicas preconfiguradas. Los invitados podrán escucharla al abrir el sobre digital.',
    },
    {
      q: '¿Los invitados pueden subir fotos y videos durante la boda?',
      a: 'Totalmente. La invitación incluye un Módulo de Galería Interactiva donde tus invitados pueden subir fotos desde sus teléfonos celulares en tiempo real, dejar comentarios y dar "Me Gusta", creando un álbum digital inolvidable.',
    },
    {
      q: '¿Es compatible con celulares y computadoras?',
      a: 'Nuestras invitaciones son 100% responsivas y están diseñadas para verse impecables en cualquier smartphone, tablet o computadora, optimizadas para compartirse fácilmente por WhatsApp.',
    },
    {
      q: '¿Qué formas de pago aceptan para los planes?',
      a: 'Aceptamos transferencias bancarias, tarjetas de débito/crédito, PayPal y Mercado Pago con activación instantánea de todas las funciones.',
    },
  ];

  return (
    <div id="landing-page-root" className="min-h-screen bg-[#faf8f5] text-stone-800 selection:bg-amber-200/60 font-sans">
      {/* 1. Header / Navigation */}
      <header className="sticky top-0 z-40 bg-[#faf8f5]/90 backdrop-blur-md border-b border-stone-200/70 transition-all">
        <div className="w-full px-4 sm:px-6 lg:px-8 xl:px-12 2xl:px-16 h-20 flex items-center justify-between">
          {/* Logo */}
          <div className="flex items-center gap-2 sm:gap-3 min-w-0">
            <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-full aspect-square shrink-0 circle-badge bg-amber-800/10 border border-amber-800/20 flex items-center justify-center text-amber-900 shadow-inner">
              <Heart className="w-4 h-4 sm:w-5 sm:h-5 fill-amber-800/30 text-amber-800 shrink-0" />
            </div>
            <div className="min-w-0">
              <span className="font-serif text-base sm:text-xl lg:text-2xl font-bold tracking-tight text-stone-900 block leading-tight truncate">
                Atelier Nupcial
              </span>
              <span className="text-[8px] sm:text-[10px] tracking-wider uppercase text-stone-500 font-medium block truncate">
                Invitaciones Digitales & RSVP
              </span>
            </div>
          </div>

          {/* Desktop Nav Links */}
          <nav className="hidden md:flex items-center gap-8 text-sm font-medium text-stone-600">
            <a href="#caracteristicas" className="hover:text-stone-900 transition-colors">
              Características
            </a>
            <a href="#modelos" className="hover:text-stone-900 transition-colors">
              Modelos de Tarjetas
            </a>
            <a href="#planes" className="hover:text-stone-900 transition-colors">
              Planes & Precios
            </a>
            <a href="#faq" className="hover:text-stone-900 transition-colors">
              Preguntas Frecuentes
            </a>
          </nav>

          {/* Actions */}
          <div className="flex items-center gap-3">
            {onBackToPortal && (
              <button
                type="button"
                onClick={onBackToPortal}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium text-stone-600 hover:text-stone-950 bg-stone-100/80 hover:bg-stone-200/80 border border-stone-200 transition-all cursor-pointer"
                title="Volver al catálogo de todos los tipos de eventos"
              >
                <Sparkles className="w-3.5 h-3.5 text-amber-600" />
                <span className="hidden sm:inline">Todos los Eventos</span>
                <span className="sm:hidden">Eventos</span>
              </button>
            )}

            {isUserAuthenticated ? (
              <button
                id="btn-nav-dashboard"
                onClick={handleDashboardClick}
                className="inline-flex items-center gap-2 px-4 py-2 bg-stone-900 hover:bg-stone-800 text-stone-50 text-xs font-semibold rounded-full shadow-sm transition-all cursor-pointer"
              >
                <Users className="w-4 h-4 text-amber-400 shrink-0" />
                <span>Mis Eventos & Panel</span>
              </button>
            ) : (
              <>
                <button
                  id="btn-nav-login"
                  onClick={() => onOpenAuth('login')}
                  className="hidden sm:inline-flex px-3.5 py-1.5 text-stone-700 hover:text-stone-900 text-xs font-semibold rounded-lg transition-colors cursor-pointer"
                >
                  Iniciar Sesión
                </button>
                <button
                  id="btn-nav-register"
                  onClick={() => onOpenAuth('register')}
                  className="inline-flex items-center gap-2 px-4 py-2 bg-stone-900 hover:bg-stone-800 text-stone-50 text-xs font-semibold rounded-full shadow-sm hover:shadow transition-all cursor-pointer"
                >
                  <span>Crear Boda</span>
                  <ArrowRight className="w-4 h-4 shrink-0" />
                </button>
              </>
            )}
          </div>
        </div>
      </header>

      {/* 2. Hero Section - Full Viewport Height & Generous Scale */}
      <section className="relative overflow-hidden min-h-[calc(100vh-5rem)] flex items-center py-10 sm:py-14 lg:py-16">
        {/* Subtle Decorative Background Circles */}
        <div className="absolute top-10 left-1/2 -translate-x-1/2 w-[850px] h-[850px] bg-amber-100/35 rounded-full blur-3xl pointer-events-none -z-10" />
        <div className="absolute -bottom-20 right-10 w-[550px] h-[550px] bg-rose-100/35 rounded-full blur-3xl pointer-events-none -z-10" />

        <div className="w-full px-4 sm:px-6 lg:px-8 xl:px-12 2xl:px-16">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 xl:gap-14 items-center">
            {/* Left Column: Copy & CTAs */}
            <div className="lg:col-span-7 text-center lg:text-left space-y-6 sm:space-y-8">
              {/* Badge */}
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-amber-800/10 border border-amber-800/20 text-amber-900 text-xs sm:text-sm font-medium shadow-2xs">
                <Sparkles className="w-4 h-4 text-amber-700 shrink-0" />
                <span>Plataforma SaaS Multiusuario para Bodas Inolvidables</span>
              </div>

              {/* Headline */}
              <h1 className="text-4xl sm:text-5xl lg:text-6xl xl:text-7xl font-serif font-bold text-stone-900 tracking-tight leading-[1.12]">
                La invitación digital que tus invitados <span className="italic font-normal text-amber-900">recordarán para siempre</span>
              </h1>

              {/* Subtitle */}
              <p className="text-base sm:text-lg lg:text-xl text-stone-600 leading-relaxed max-w-2xl mx-auto lg:mx-0 font-sans">
                Sobre interactivo con lacre de cera 3D, música de fondo personalizada, control de asistencia RSVP en tiempo real, galería colaborativa de fotos y mesa de regalos integrada.
              </p>

              {/* CTAs */}
              <div className="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-4 pt-2">
                <button
                  id="btn-hero-start"
                  onClick={() => onOpenAuth('register', 'atelier')}
                  className="w-full sm:w-auto px-8 py-4 bg-stone-900 hover:bg-stone-800 text-stone-50 font-semibold text-sm sm:text-base rounded-full shadow-xl hover:shadow-2xl transition-all flex items-center justify-center gap-3 group cursor-pointer hover:scale-[1.02]"
                >
                  <Crown className="w-5 h-5 text-amber-400 shrink-0" />
                  <span>Comenzar mi Boda Ahora</span>
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-1.5 transition-transform shrink-0" />
                </button>

                <button
                  id="btn-hero-demo"
                  onClick={() => handleDemoClick()}
                  className="w-full sm:w-auto px-7 py-4 bg-white hover:bg-stone-100/90 text-stone-800 border border-stone-300/90 font-semibold text-sm sm:text-base rounded-full shadow-sm hover:shadow-md transition-all flex items-center justify-center gap-2.5 cursor-pointer"
                >
                  <Sparkles className="w-4 h-4 text-amber-600 shrink-0" />
                  <span>Ver Invitación Interactiva Demo</span>
                </button>
              </div>

              {/* Social Proof Stats */}
              <div className="pt-6 sm:pt-8 border-t border-stone-200/80 grid grid-cols-3 gap-6 max-w-lg mx-auto lg:mx-0 text-center lg:text-left">
                <div>
                  <div className="text-2xl sm:text-3xl lg:text-4xl font-serif font-bold text-stone-900">100%</div>
                  <div className="text-xs sm:text-sm text-stone-500 font-medium mt-0.5">RSVP en Tiempo Real</div>
                </div>
                <div>
                  <div className="text-2xl sm:text-3xl lg:text-4xl font-serif font-bold text-stone-900">12</div>
                  <div className="text-xs sm:text-sm text-stone-500 font-medium mt-0.5">Estilos de Tarjeta</div>
                </div>
                <div>
                  <div className="text-2xl sm:text-3xl lg:text-4xl font-serif font-bold text-stone-900">4.9 ★</div>
                  <div className="text-xs sm:text-sm text-stone-500 font-medium mt-0.5">+1,200 Parejas Felices</div>
                </div>
              </div>
            </div>

            {/* Right Column: Interactive Mockup Card */}
            <div className="lg:col-span-5 flex justify-center">
              <div className="relative w-full max-w-md lg:max-w-lg">
                {/* Decorative glowing card */}
                <div className="relative bg-white/95 backdrop-blur-md rounded-3xl border border-amber-900/10 shadow-2xl p-7 sm:p-9 overflow-hidden text-center">
                  {/* Top stamp */}
                  <div className="inline-flex items-center gap-2 px-3.5 py-1.5 bg-amber-50 text-amber-900 border border-amber-200/60 rounded-full text-xs sm:text-sm font-semibold mb-5 shadow-2xs">
                    <Heart className="w-4 h-4 fill-amber-700/40 text-amber-700" />
                    <span>Nuestra Boda</span>
                  </div>

                  <h3 className="font-serif text-3xl sm:text-4xl font-bold text-stone-900 mb-1.5 tracking-tight">
                    Sofía & Alejandro
                  </h3>
                  <p className="text-xs sm:text-sm text-amber-900 font-medium mb-6">
                    Sábado, 28 de Noviembre, 2026 • Hacienda Los Laureles
                  </p>

                  {/* Envelope Visual Preview */}
                  <div className="relative my-5 p-6 rounded-2xl bg-gradient-to-b from-[#fbf8f3] to-[#f4eee5] border border-amber-300/40 shadow-inner flex flex-col items-center justify-center">
                    <div
                      className="w-18 h-18 sm:w-20 sm:h-20 rounded-full aspect-square shrink-0 circle-seal bg-gradient-to-br from-amber-600 via-amber-700 to-amber-900 flex items-center justify-center shadow-xl border-2 border-amber-400/40 mb-3 cursor-pointer hover:scale-110 transition-transform"
                      onClick={() => handleDemoClick()}
                    >
                      <span className="font-serif font-bold text-xl sm:text-2xl text-amber-100">S&A</span>
                    </div>
                    <span className="text-xs sm:text-sm font-semibold text-stone-700">
                      Toca para romper el sello de cera
                    </span>
                  </div>

                  {/* Feature pills in mockup */}
                  <div className="grid grid-cols-2 gap-3 mt-5 text-left">
                    <div className="p-3 rounded-2xl bg-stone-50 border border-stone-200/70 flex items-center gap-2.5">
                      <div className="w-8 h-8 rounded-xl bg-amber-100/70 flex items-center justify-center shrink-0">
                        <Music className="w-4 h-4 text-amber-800" />
                      </div>
                      <div className="text-xs">
                        <span className="font-bold block text-stone-800">Música MP3</span>
                        <span className="text-stone-500 text-[11px]">Hasta mi final</span>
                      </div>
                    </div>
                    <div className="p-3 rounded-2xl bg-stone-50 border border-stone-200/70 flex items-center gap-2.5">
                      <div className="w-8 h-8 rounded-xl bg-emerald-100/70 flex items-center justify-center shrink-0">
                        <CheckCircle2 className="w-4 h-4 text-emerald-700" />
                      </div>
                      <div className="text-xs">
                        <span className="font-bold block text-stone-800">RSVP Activo</span>
                        <span className="text-stone-500 text-[11px]">142 confirmados</span>
                      </div>
                    </div>
                  </div>

                  {/* Interactive Button */}
                  <button
                    id="btn-mockup-open-demo"
                    onClick={() => handleDemoClick()}
                    className="w-full mt-6 py-3.5 bg-amber-800/10 hover:bg-amber-800/20 text-amber-950 text-xs sm:text-sm font-bold rounded-2xl transition-all flex items-center justify-center gap-2 cursor-pointer shadow-2xs hover:shadow-xs"
                  >
                    <span>Abrir Demo en Vivo Completo</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </div>

                {/* Floating pill badge */}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 3. Features Section */}
      <section id="caracteristicas" className="py-20 bg-white border-y border-stone-200/80">
        <div className="w-full px-4 sm:px-6 lg:px-8 xl:px-12 2xl:px-16">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <span className="text-xs font-bold uppercase tracking-widest text-amber-800 block mb-2">
              Todo lo que necesitas
            </span>
            <h2 className="text-3xl sm:text-4xl font-serif font-bold text-stone-900 tracking-tight mb-4">
              Diseñada para emocionar a tus invitados y hacerte la vida fácil
            </h2>
            <p className="text-stone-600 text-base">
              Olvídate de las listas de Excel desactualizadas y de imprimir cientos de tarjetas de papel costosas.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {/* Feature 1 */}
            <div className="p-7 rounded-2xl bg-stone-50 border border-stone-200/70 hover:border-amber-400/50 hover:shadow-md transition-all">
              <div className="w-12 h-12 rounded-xl bg-amber-100/70 text-amber-800 flex items-center justify-center mb-5 shrink-0">
                <Heart className="w-6 h-6 shrink-0" />
              </div>
              <h3 className="font-serif text-lg font-bold text-stone-900 mb-2">
                Sobre Digital con Lacre 3D
              </h3>
              <p className="text-sm text-stone-600 leading-relaxed">
                Una experiencia inmersiva donde el invitado rompe el sello de cera personalizado para desplegar la tarjeta con animaciones fluidas.
              </p>
            </div>

            {/* Feature 2 */}
            <div className="p-7 rounded-2xl bg-stone-50 border border-stone-200/70 hover:border-amber-400/50 hover:shadow-md transition-all">
              <div className="w-12 h-12 rounded-xl bg-amber-100/70 text-amber-800 flex items-center justify-center mb-5 shrink-0">
                <CheckCircle2 className="w-6 h-6 text-emerald-700 shrink-0" />
              </div>
              <h3 className="font-serif text-lg font-bold text-stone-900 mb-2">
                Control RSVP con Pases Asignados
              </h3>
              <p className="text-sm text-stone-600 leading-relaxed">
                Asigna pases individuales o familiares con código de acceso. Recibe confirmaciones, menú especial, acompañantes y canciones sugeridas.
              </p>
            </div>

            {/* Feature 3 */}
            <div className="p-7 rounded-2xl bg-stone-50 border border-stone-200/70 hover:border-amber-400/50 hover:shadow-md transition-all">
              <div className="w-12 h-12 rounded-xl bg-amber-100/70 text-amber-800 flex items-center justify-center mb-5 shrink-0">
                <Music className="w-6 h-6 text-amber-800 shrink-0" />
              </div>
              <h3 className="font-serif text-lg font-bold text-stone-900 mb-2">
                Música & Audio Personalizado
              </h3>
              <p className="text-sm text-stone-600 leading-relaxed">
                Carga tu propia canción de amor en MP3 con reproductor flotante minimalista que acompaña la lectura de la invitación.
              </p>
            </div>

            {/* Feature 4 */}
            <div className="p-7 rounded-2xl bg-stone-50 border border-stone-200/70 hover:border-amber-400/50 hover:shadow-md transition-all">
              <div className="w-12 h-12 rounded-xl bg-amber-100/70 text-amber-800 flex items-center justify-center mb-5 shrink-0">
                <Camera className="w-6 h-6 text-rose-700 shrink-0" />
              </div>
              <h3 className="font-serif text-lg font-bold text-stone-900 mb-2">
                Galería de Fotos Colaborativa
              </h3>
              <p className="text-sm text-stone-600 leading-relaxed">
                Tus invitados pueden subir fotos en vivo desde sus teléfonos durante la ceremonia y la fiesta, con sistema de "Me Gusta" y filtros por categoría.
              </p>
            </div>

            {/* Feature 5 */}
            <div className="p-7 rounded-2xl bg-stone-50 border border-stone-200/70 hover:border-amber-400/50 hover:shadow-md transition-all">
              <div className="w-12 h-12 rounded-xl bg-amber-100/70 text-amber-800 flex items-center justify-center mb-5 shrink-0">
                <Video className="w-6 h-6 text-blue-700 shrink-0" />
              </div>
              <h3 className="font-serif text-lg font-bold text-stone-900 mb-2">
                Videos YouTube & Reels Integrados
              </h3>
              <p className="text-sm text-stone-600 leading-relaxed">
                Embebe tu video "Save the Date", el reel de la pedida de mano en Instagram o tu video de agradecimiento en alta definición.
              </p>
            </div>

            {/* Feature 6 */}
            <div className="p-7 rounded-2xl bg-stone-50 border border-stone-200/70 hover:border-amber-400/50 hover:shadow-md transition-all">
              <div className="w-12 h-12 rounded-xl bg-amber-100/70 text-amber-800 flex items-center justify-center mb-5 shrink-0">
                <Gift className="w-6 h-6 text-amber-800 shrink-0" />
              </div>
              <h3 className="font-serif text-lg font-bold text-stone-900 mb-2">
                Mesa de Regalos & Transferencia CLABE
              </h3>
              <p className="text-sm text-stone-600 leading-relaxed">
                Integra enlaces a tiendas departamentales, datos bancarios para sobres virtuales y fondos para la Luna de Miel con un solo clic.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* 4. Showcase of Card Design Styles */}
      <section id="modelos" className="py-20 bg-[#faf8f5]">
        <div className="w-full px-4 sm:px-6 lg:px-8 xl:px-12 2xl:px-16">
          <div className="text-center max-w-3xl mx-auto mb-12">
            <span className="text-xs font-bold uppercase tracking-widest text-amber-800 block mb-2">
              Estilos Exclusivos
            </span>
            <h2 className="text-3xl sm:text-4xl font-serif font-bold text-stone-900 tracking-tight mb-4">
              12 Modelos de Tarjetas de Alta Costura
            </h2>
            <p className="text-stone-600 text-base">
              Selecciona el estilo que mejor combine con la temática y colores de tu boda. Puedes cambiarlo cuando quieras desde tu panel.
            </p>
          </div>

          {/* Style Selector Chips */}
          <div className="flex flex-wrap items-center justify-center gap-2 mb-10">
            {styleShowcase.map((style) => (
              <button
                key={style.id}
                onClick={() => setActivePreviewStyle(style.id)}
                className={`px-4 py-2 rounded-full text-xs font-semibold transition-all cursor-pointer ${activePreviewStyle === style.id
                  ? 'bg-stone-900 text-white shadow-md scale-105'
                  : 'bg-white text-stone-700 border border-stone-300/80 hover:bg-stone-100'
                  }`}
              >
                {style.name}
              </button>
            ))}
          </div>

          {/* Preview Box */}
          {(() => {
            const current = styleShowcase.find((s) => s.id === activePreviewStyle) || styleShowcase[0];
            return (
              <div className="max-w-3xl mx-auto bg-white rounded-3xl border border-stone-200/90 shadow-xl overflow-hidden p-8 sm:p-12">
                <div className={`p-8 sm:p-10 rounded-2xl border ${current.bgClass} text-center transition-all`}>
                  <div className="inline-block px-3 py-1 bg-white/70 rounded-full text-[11px] font-bold uppercase tracking-wider mb-4 border border-stone-200/50">
                    {current.tag}
                  </div>
                  <h3 className="text-3xl sm:text-4xl font-serif font-bold mb-2">
                    Sofía & Alejandro
                  </h3>
                  <p className="text-sm font-medium tracking-wide uppercase opacity-80 mb-6">
                    Nos Casamos • 18 de Octubre, 2025
                  </p>
                  <p className="text-xs sm:text-sm max-w-lg mx-auto opacity-90 leading-relaxed mb-6 font-serif italic">
                    "El amor no consiste en mirarse el uno al otro, sino en mirar juntos en la misma dirección."
                  </p>

                  <div className="flex justify-center gap-3">
                    <button
                      onClick={() => handleDemoClick(current.id)}
                      className="px-5 py-2 bg-stone-900 text-white text-xs font-semibold rounded-full shadow hover:bg-stone-800 transition-colors cursor-pointer"
                    >
                      Probar este Estilo en Vivo
                    </button>
                    <button
                      onClick={() => onOpenAuth('register', 'atelier')}
                      className="px-5 py-2 bg-white text-stone-900 border border-stone-300 text-xs font-semibold rounded-full shadow-xs hover:bg-stone-50 transition-colors cursor-pointer"
                    >
                      Usar para mi Boda
                    </button>
                  </div>
                </div>

                <div className="mt-6 text-center text-xs text-stone-500">
                  {current.description}
                </div>
              </div>
            );
          })()}
        </div>
      </section>

      {/* 5. Plans & Pricing Section */}
      <section id="planes" className="py-20 bg-white border-t border-stone-200/80">
        <div className="w-full px-4 sm:px-6 lg:px-8 xl:px-12 2xl:px-16">
          <div className="text-center max-w-3xl mx-auto mb-12">
            <span className="text-xs font-bold uppercase tracking-widest text-amber-800 block mb-2">
              Planes Transparentes & Profesionales
            </span>
            <h2 className="text-3xl sm:text-4xl font-serif font-bold text-stone-900 tracking-tight mb-4">
              Elige el plan ideal para tu celebración o agencia
            </h2>
            <p className="text-stone-600 text-base">
              Planes individuales para una boda o licencias multi-boda para Wedding Planners y coordinadores de eventos.
            </p>

            {/* Category Toggle */}
            <div className="inline-flex bg-stone-100 p-1.5 rounded-2xl mt-6 border border-stone-200 shadow-2xs">
              <button
                type="button"
                onClick={() => setPricingCategory('couple')}
                className={`px-5 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${pricingCategory === 'couple'
                  ? 'bg-white text-stone-900 shadow-xs'
                  : 'text-stone-600 hover:text-stone-900'
                  }`}
              >
                💖 Planes para Parejas
              </button>
              <button
                type="button"
                onClick={() => setPricingCategory('planner')}
                className={`px-5 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${pricingCategory === 'planner'
                  ? 'bg-stone-900 text-white shadow-xs'
                  : 'text-stone-600 hover:text-stone-900'
                  }`}
              >
                💼 Planes para Wedding Planners & Agencias
              </button>
            </div>
          </div>

          {/* Pricing Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-stretch max-w-7xl mx-auto">
            {SUBSCRIPTION_PLANS.filter((p) => p.category === pricingCategory && p.id !== 'ceo_unlimited').map((plan) => {
              const isPopular = plan.popular;
              return (
                <div
                  key={plan.id}
                  id={`card-plan-${plan.id}`}
                  className={`relative rounded-3xl p-8 flex flex-col justify-between transition-all ${isPopular
                    ? 'bg-stone-900 text-stone-100 shadow-2xl ring-2 ring-amber-400/50 scale-100 lg:-translate-y-2'
                    : 'bg-stone-50 text-stone-800 border border-stone-200/90 shadow-sm hover:shadow-md'
                    }`}
                >
                  {/* Popular Badge */}
                  {isPopular && (
                    <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 bg-gradient-to-r from-amber-400 to-amber-500 text-stone-950 text-[11px] font-extrabold uppercase tracking-wider py-1 px-3.5 rounded-full shadow-md">
                      {plan.badge}
                    </div>
                  )}

                  <div>
                    {/* Header */}
                    <div className="mb-6">
                      <h3
                        className={`text-2xl font-serif font-bold ${isPopular ? 'text-white' : 'text-stone-900'
                          }`}
                      >
                        {plan.name}
                      </h3>
                      <p
                        className={`text-xs mt-1 ${isPopular ? 'text-stone-300' : 'text-stone-500'
                          }`}
                      >
                        {plan.description}
                      </p>
                    </div>

                    {/* Price */}
                    <div className="mb-6 pb-6 border-b border-stone-200/20">
                      <div className="flex items-baseline gap-2">
                        <span
                          className={`text-4xl font-serif font-bold ${isPopular ? 'text-amber-300' : 'text-stone-900'
                            }`}
                        >
                          {plan.price}
                        </span>
                        {plan.originalPrice && (
                          <span className="text-sm line-through text-stone-400">
                            {plan.originalPrice}
                          </span>
                        )}
                      </div>
                      <span
                        className={`text-xs ${isPopular ? 'text-stone-400' : 'text-stone-500'
                          }`}
                      >
                        {plan.billingPeriod}
                      </span>
                    </div>

                    {/* Features List */}
                    <ul className="space-y-3 mb-8">
                      {plan.features.map((feat, idx) => (
                        <li key={idx} className="flex items-start gap-2.5 text-xs sm:text-sm">
                          <Check
                            className={`w-4 h-4 shrink-0 mt-0.5 ${isPopular ? 'text-amber-400' : 'text-emerald-700'
                              }`}
                          />
                          <span className={isPopular ? 'text-stone-200' : 'text-stone-700'}>
                            {feat}
                          </span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  {/* CTA Button */}
                  <button
                    id={`btn-choose-plan-${plan.id}`}
                    onClick={() => onOpenAuth('register', plan.id)}
                    className={`w-full py-3 px-4 rounded-xl font-semibold text-xs sm:text-sm transition-all flex items-center justify-center gap-2 cursor-pointer ${isPopular
                      ? 'bg-amber-400 hover:bg-amber-300 text-stone-950 shadow-md font-bold'
                      : 'bg-stone-900 hover:bg-stone-800 text-white shadow-xs'
                      }`}
                  >
                    <span>{plan.ctaText}</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </div>
              );
            })}
          </div>

          {/* Guarantee pill */}
          <div className="mt-12 text-center flex items-center justify-center gap-2 text-xs text-stone-500">
            <ShieldCheck className="w-4 h-4 text-emerald-600" />
            <span>Garantía de satisfacción y soporte técnico directo durante la organización de tu boda</span>
          </div>
        </div>
      </section>

      {/* 6. Testimonials */}
      <section className="py-20 bg-[#faf8f5]">
        <div className="w-full px-4 sm:px-6 lg:px-8 xl:px-12 2xl:px-16">
          <div className="text-center max-w-2xl mx-auto mb-14">
            <span className="text-xs font-bold uppercase tracking-widest text-amber-800 block mb-2">
              Historias de Amor
            </span>
            <h2 className="text-3xl sm:text-4xl font-serif font-bold text-stone-900">
              Lo que dicen nuestras parejas
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="p-7 rounded-2xl bg-white border border-stone-200/70 shadow-xs">
              <div className="flex text-amber-500 mb-3">
                {'★'.repeat(5)}
              </div>
              <p className="text-stone-700 text-xs sm:text-sm italic leading-relaxed mb-4">
                "Nuestros invitados quedaron fascinados con el sobre y la música cuando abrían el enlace. El control de confirmaciones nos ahorró semanas de llamadas."
              </p>
              <div className="text-xs font-bold text-stone-900">Camila & Mateo</div>
              <div className="text-[11px] text-stone-500">Boda en Lima (San Isidro) • Plan Atelier</div>
            </div>

            <div className="p-7 rounded-2xl bg-white border border-stone-200/70 shadow-xs">
              <div className="flex text-amber-500 mb-3">
                {'★'.repeat(5)}
              </div>
              <p className="text-stone-700 text-xs sm:text-sm italic leading-relaxed mb-4">
                "Poder subir las fotos de la fiesta en tiempo real fue lo mejor. Tenemos recuerdos que nuestro fotógrafo oficial no alcanzó a capturar."
              </p>
              <div className="text-xs font-bold text-stone-900">Lucía & Daniel</div>
              <div className="text-[11px] text-stone-500">Boda en Cusco (Valle Sagrado) • Plan Élite</div>
            </div>

            <div className="p-7 rounded-2xl bg-white border border-stone-200/70 shadow-xs">
              <div className="flex text-amber-500 mb-3">
                {'★'.repeat(5)}
              </div>
              <p className="text-stone-700 text-xs sm:text-sm italic leading-relaxed mb-4">
                "La asignación de pases individuales con código evitó que se nos colaran acompañantes no contemplados. Súper elegante y formal."
              </p>
              <div className="text-xs font-bold text-stone-900">Renata & Jorge</div>
              <div className="text-[11px] text-stone-500">Boda en Arequipa (Yanahuara) • Plan Atelier</div>
            </div>
          </div>
        </div>
      </section>

      {/* 7. FAQ Section */}
      <section id="faq" className="py-20 bg-white border-t border-stone-200/80">
        <div className="w-full px-4 sm:px-6 lg:px-8 xl:px-12 2xl:px-16 max-w-5xl mx-auto">
          <div className="text-center mb-12">
            <span className="text-xs font-bold uppercase tracking-widest text-amber-800 block mb-2">
              Resolvemos tus dudas
            </span>
            <h2 className="text-3xl font-serif font-bold text-stone-900">
              Preguntas Frecuentes
            </h2>
          </div>

          <div className="space-y-4">
            {faqs.map((faq, idx) => (
              <div
                key={idx}
                className="border border-stone-200/90 rounded-2xl overflow-hidden transition-colors"
              >
                <button
                  onClick={() => setOpenFaq(openFaq === idx ? null : idx)}
                  className="w-full p-5 text-left font-serif font-bold text-stone-900 text-base sm:text-lg flex items-center justify-between hover:bg-stone-50/80 cursor-pointer"
                >
                  <span>{faq.q}</span>
                  <ChevronRight
                    className={`w-5 h-5 text-stone-500 transition-transform ${openFaq === idx ? 'rotate-90 text-amber-800' : ''
                      }`}
                  />
                </button>
                {openFaq === idx && (
                  <div className="px-5 pb-5 text-stone-600 text-xs sm:text-sm leading-relaxed border-t border-stone-100 pt-3">
                    {faq.a}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 8. Bottom Final CTA Banner */}
      <section className="py-16 bg-stone-900 text-stone-100">
        <div className="w-full px-4 sm:px-6 lg:px-8 xl:px-12 2xl:px-16 max-w-6xl mx-auto text-center">
          <Heart className="w-8 h-8 mx-auto text-amber-400 mb-4 fill-amber-400/20" />
          <h2 className="text-3xl sm:text-4xl font-serif font-bold mb-4 tracking-tight">
            Comienza a diseñar tu invitación en menos de 2 minutos
          </h2>
          <p className="text-stone-400 text-sm sm:text-base max-w-xl mx-auto mb-8">
            Únete a cientos de parejas que ya están organizando su gran día con la máxima elegancia y tecnología.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <button
              id="btn-footer-register"
              onClick={() => onOpenAuth('register', 'atelier')}
              className="w-full sm:w-auto px-8 py-3.5 bg-amber-400 hover:bg-amber-300 text-stone-950 font-bold text-sm rounded-full shadow-lg transition-all flex items-center justify-center gap-2 cursor-pointer"
            >
              <span>Crear mi Boda Ahora</span>
              <ArrowRight className="w-4 h-4" />
            </button>
            <button
              id="btn-footer-demo"
              onClick={() => handleDemoClick()}
              className="w-full sm:w-auto px-7 py-3.5 bg-stone-800 hover:bg-stone-700 text-stone-200 border border-stone-700 font-medium text-sm rounded-full transition-all cursor-pointer"
            >
              Explorar Demo
            </button>
          </div>
        </div>
      </section>

      {/* 9. Footer */}
      <footer className="py-8 bg-stone-950 text-stone-500 text-xs border-t border-stone-800">
        <div className="w-full px-4 sm:px-6 lg:px-8 xl:px-12 2xl:px-16 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div>
            © {new Date().getFullYear()} Atelier Nupcial SaaS. Todos los derechos reservados.
          </div>
          <div className="flex items-center gap-6">
            <a href="#caracteristicas" className="hover:text-stone-300 transition-colors">
              Características
            </a>
            <a href="#planes" className="hover:text-stone-300 transition-colors">
              Planes
            </a>
            <a href="#faq" className="hover:text-stone-300 transition-colors">
              Ayuda
            </a>
            <button
              onClick={() => onOpenAuth('login')}
              className="hover:text-stone-300 transition-colors"
            >
              Acceso Organizadores
            </button>
          </div>
        </div>
      </footer>
    </div>
  );
};
