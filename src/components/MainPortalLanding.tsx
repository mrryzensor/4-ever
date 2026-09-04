import React, { useState } from 'react';
import { motion } from 'motion/react';
import {
  Heart,
  Crown,
  Sparkles,
  PartyPopper,
  Calendar,
  Baby,
  GraduationCap,
  Cake,
  ArrowRight,
  CheckCircle2,
  Users,
  Eye,
  ShieldCheck,
  ChevronRight,
  Music,
  Camera,
  MapPin,
  Gift
} from 'lucide-react';
import { UserProfile } from '../types.ts';

export interface EventTypeOption {
  id: string;
  name: string;
  badge: string;
  tagline: string;
  description: string;
  icon: React.ElementType;
  gradient: string;
  accentHex: string;
  borderClass: string;
  bgGlass: string;
  coverImage: string;
  isAvailable: boolean;
  features: string[];
}

export const EVENT_TYPES: EventTypeOption[] = [
  {
    id: 'bodas',
    name: 'Bodas & Enlaces Nupciales',
    badge: 'Alta Costura Nupcial',
    tagline: 'El inicio de su "Para Siempre"',
    description: 'Invitaciones con sobre interactivo 3D, música romántica personalizada, RSVP en tiempo real, cortejo nupcial y mesa de regalos.',
    icon: Heart,
    gradient: 'from-amber-600 via-amber-700 to-amber-950',
    accentHex: '#C5A059',
    borderClass: 'border-amber-200/80 hover:border-amber-400',
    bgGlass: 'bg-white/80 hover:bg-white/95',
    coverImage: 'https://images.unsplash.com/photo-1519741497674-611481863552?auto=format&fit=crop&w=900&q=80',
    isAvailable: true,
    features: ['Sobre interactivo con lacre 3D', 'Música y galería colaborativa', 'RSVP por WhatsApp & Web', '12 estilos de diseño'],
  },
  {
    id: 'xv',
    name: 'Fiestas de XV Años',
    badge: 'Gala & Quinceañera Real',
    tagline: 'Una noche mágica de ensueño',
    description: 'Tiaras reales animadas, zapatilla de cristal, cronograma de vals y coronación, simulador de vestidos de gala y lluvia de sobres.',
    icon: Crown,
    gradient: 'from-pink-600 via-rose-600 to-purple-950',
    accentHex: '#B85D83',
    borderClass: 'border-pink-200/80 hover:border-pink-400',
    bgGlass: 'bg-white/80 hover:bg-white/95',
    coverImage: 'https://images.unsplash.com/photo-1566737236500-c8ac43014a67?auto=format&fit=crop&w=900&q=80',
    isAvailable: true,
    features: ['Tiara y cristales animados', 'Vals, cambio de zapatilla y corte', 'Paletas Rosa Gold, Lavanda & Zafiro', 'Mesa de regalos & lluvia de sobres'],
  },
  {
    id: 'bautizos',
    name: 'Bautizos & Primeras Comuniones',
    badge: 'Sacramento & Pureza',
    tagline: 'Bendición y amor en familia',
    description: 'Diseños delicados en tonos blanco, marfil, celeste y dorado para celebraciones sacramentales de tus pequeños.',
    icon: Baby,
    gradient: 'from-sky-500 via-blue-600 to-indigo-950',
    accentHex: '#38BDF8',
    borderClass: 'border-sky-200/80 hover:border-sky-400',
    bgGlass: 'bg-white/80 hover:bg-white/95',
    coverImage: 'https://images.unsplash.com/photo-1516627145497-ae6968895b74?auto=format&fit=crop&w=900&q=80',
    isAvailable: false,
    features: ['Padrinos de honor', 'Misa de bendición', 'Álbum familiar de recuerdos', 'Mesa de regalos tierna'],
  },
  {
    id: 'graduaciones',
    name: 'Graduaciones & Galas Académicas',
    badge: 'Éxito & Celebración',
    tagline: 'El logro que marca el futuro',
    description: 'Invitaciones formales de gala para egresados, orlas académicas, confirmación de mesas y fiesta de generación.',
    icon: GraduationCap,
    gradient: 'from-emerald-600 via-teal-700 to-slate-950',
    accentHex: '#10B981',
    borderClass: 'border-emerald-200/80 hover:border-emerald-400',
    bgGlass: 'bg-white/80 hover:bg-white/95',
    coverImage: 'https://images.unsplash.com/photo-1523240795612-9a054b0db644?auto=format&fit=crop&w=900&q=80',
    isAvailable: false,
    features: ['Lista de graduados', 'Protocolo y cena de gala', 'Código de vestimenta riguroso', 'Galería fotográfica de grupo'],
  },
  {
    id: 'cumpleanos',
    name: 'Cumpleaños & Fiestas Temáticas',
    badge: 'Diversión & Estilo',
    tagline: 'Celebra un año más de vida',
    description: 'Invitaciones dinámicas con cuenta regresiva, playlist interactiva, temática neón, retro o cóctel para todas las edades.',
    icon: Cake,
    gradient: 'from-amber-500 via-orange-600 to-red-950',
    accentHex: '#F59E0B',
    borderClass: 'border-amber-200/80 hover:border-amber-400',
    bgGlass: 'bg-white/80 hover:bg-white/95',
    coverImage: 'https://images.unsplash.com/photo-1464349095431-e9a21285b5f3?auto=format&fit=crop&w=900&q=80',
    isAvailable: false,
    features: ['Cuenta regresiva animada', 'Petición de canciones al DJ', 'Mapa interactivo de ubicación', 'Filtro dinámico de confirmación'],
  },
  {
    id: 'aniversarios',
    name: 'Bodas de Plata & Oro / Aniversarios',
    badge: 'Amor Eterno',
    tagline: 'Décadas construyendo una gran historia',
    description: 'Renovación de votos, homenajes familiares y celebraciones de aniversario con sobriedad y máxima distinción.',
    icon: PartyPopper,
    gradient: 'from-violet-600 via-purple-700 to-stone-950',
    accentHex: '#8B5CF6',
    borderClass: 'border-purple-200/80 hover:border-purple-400',
    bgGlass: 'bg-white/80 hover:bg-white/95',
    coverImage: 'https://images.unsplash.com/photo-1511285560929-80b456fea0bc?auto=format&fit=crop&w=900&q=80',
    isAvailable: false,
    features: ['Línea de tiempo de la pareja', 'Renovación de votos', 'Libro de firmas virtual', 'Música de recuerdo de su época'],
  },
];

interface MainPortalLandingProps {
  onSelectEventType: (eventTypeId: string) => void;
  onOpenAuth: (mode: 'login' | 'register') => void;
  onOpenDashboard?: () => void;
  currentUser?: UserProfile | null;
}

export const MainPortalLanding: React.FC<MainPortalLandingProps> = ({
  onSelectEventType,
  onOpenAuth,
  onOpenDashboard,
  currentUser,
}) => {
  const [filterCategory, setFilterCategory] = useState<'all' | 'available' | 'upcoming'>('all');

  const filteredEvents = EVENT_TYPES.filter((e) => {
    if (filterCategory === 'available') return e.isAvailable;
    if (filterCategory === 'upcoming') return !e.isAvailable;
    return true;
  });

  return (
    <div className="min-h-screen w-full bg-[#FAF9F6] text-stone-800 font-sans selection:bg-amber-200 selection:text-stone-900 relative overflow-x-hidden">
      {/* Dynamic Background Ambient Blobs */}
      <div className="absolute top-0 left-1/4 w-[600px] h-[600px] bg-amber-100/40 rounded-full blur-[140px] pointer-events-none -z-10" />
      <div className="absolute top-1/3 right-10 w-[550px] h-[550px] bg-pink-100/40 rounded-full blur-[140px] pointer-events-none -z-10" />
      <div className="absolute bottom-10 left-10 w-[500px] h-[500px] bg-purple-100/30 rounded-full blur-[140px] pointer-events-none -z-10" />

      {/* 1. Header / Navigation */}
      <header className="sticky top-0 z-40 bg-[#FAF9F6]/90 backdrop-blur-md border-b border-stone-200/80 transition-all">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">
          {/* Brand Logo */}
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-amber-500 via-pink-500 to-purple-600 flex items-center justify-center text-white shadow-md">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <span className="font-serif text-xl sm:text-2xl font-bold tracking-tight text-stone-900 block leading-tight">
                4-EVER Atelier
              </span>
              <span className="text-[10px] tracking-wider uppercase text-stone-500 font-bold block">
                Plataforma Integral de Invitaciones & RSVP
              </span>
            </div>
          </div>

          {/* User / Action Buttons */}
          <div className="flex items-center gap-3">
            {currentUser ? (
              <button
                type="button"
                onClick={onOpenDashboard}
                className="px-5 py-2.5 rounded-full bg-stone-900 text-white text-xs sm:text-sm font-semibold hover:bg-stone-800 transition-all shadow-sm flex items-center gap-2 cursor-pointer"
              >
                <Users className="w-4 h-4 text-amber-300" />
                <span>Mi Panel</span>
              </button>
            ) : (
              <>
                <button
                  type="button"
                  onClick={() => onOpenAuth('login')}
                  className="hidden sm:inline-flex px-4 py-2 text-xs sm:text-sm font-semibold text-stone-700 hover:text-stone-950 transition-colors cursor-pointer"
                >
                  Iniciar Sesión
                </button>
                <button
                  type="button"
                  onClick={() => onOpenAuth('register')}
                  className="px-5 py-2.5 rounded-full bg-gradient-to-r from-amber-600 to-pink-600 text-white text-xs sm:text-sm font-semibold shadow-md hover:brightness-110 transition-all cursor-pointer flex items-center gap-2"
                >
                  <span>Crear Invitación</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </>
            )}
          </div>
        </div>
      </header>

      {/* 2. Hero Section */}
      <section className="relative pt-12 pb-16 sm:pt-16 sm:pb-24 px-4 sm:px-6 lg:px-8 text-center max-w-5xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white border border-stone-200 shadow-xs mb-6"
        >
          <Sparkles className="w-4 h-4 text-amber-500" />
          <span className="text-xs uppercase tracking-widest font-bold text-stone-700">
            Invitaciones Digitales Exclusivas para Todo Tipo de Evento
          </span>
        </motion.div>

        <motion.h1
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.1 }}
          className="text-4xl sm:text-6xl md:text-7xl font-serif font-bold text-stone-950 tracking-tight leading-[1.15]"
        >
          Elige la celebración perfecta para tu{' '}
          <span className="italic font-normal bg-gradient-to-r from-amber-600 via-pink-600 to-purple-600 bg-clip-text text-transparent">
            día inolvidable
          </span>
        </motion.h1>

        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.2 }}
          className="text-base sm:text-xl text-stone-600 max-w-3xl mx-auto mt-6 leading-relaxed font-serif"
        >
          Cada momento único merece su propio arte. Explora nuestras experiencias diseñadas a la medida: desde la solemnidad de una <strong>Boda</strong> hasta el glamour deslumbrante de los <strong>XV Años</strong> y futuras celebraciones.
        </motion.p>

        {/* Filter Tabs */}
        <div className="mt-10 flex items-center justify-center gap-2 flex-wrap">
          {[
            { id: 'all' as const, label: 'Todos los Eventos' },
            { id: 'available' as const, label: '✨ Disponibles Ahora' },
            { id: 'upcoming' as const, label: 'Próximamente' },
          ].map((tab) => (
            <button
              key={tab.id}
              type="button"
              onClick={() => setFilterCategory(tab.id)}
              className={`px-5 py-2 rounded-full text-xs font-semibold transition-all cursor-pointer ${
                filterCategory === tab.id
                  ? 'bg-stone-900 text-white shadow-md'
                  : 'bg-white text-stone-600 hover:bg-stone-100 border border-stone-200'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </section>

      {/* 3. Event Types Grid */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-24">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 items-stretch">
          {filteredEvents.map((evt, idx) => {
            const Icon = evt.icon;
            return (
              <motion.div
                key={evt.id}
                initial={{ opacity: 0, y: 25 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: idx * 0.08 }}
                onClick={() => {
                  if (evt.isAvailable) {
                    onSelectEventType(evt.id);
                  }
                }}
                className={`group rounded-3xl border ${evt.borderClass} ${evt.bgGlass} shadow-md hover:shadow-2xl transition-all duration-300 flex flex-col justify-between overflow-hidden relative ${
                  evt.isAvailable ? 'cursor-pointer hover:-translate-y-1.5' : 'opacity-85 cursor-default'
                }`}
              >
                {/* Cover Image Header */}
                <div className="relative h-52 w-full overflow-hidden">
                  <img
                    src={evt.coverImage}
                    alt={evt.name}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-stone-950/80 via-stone-950/20 to-transparent" />

                  {/* Availability Badge */}
                  <div className="absolute top-4 left-4">
                    <span className="px-3 py-1 rounded-full text-[11px] font-bold uppercase tracking-wider backdrop-blur-md bg-stone-950/60 text-white border border-white/20">
                      {evt.badge}
                    </span>
                  </div>

                  {!evt.isAvailable && (
                    <div className="absolute top-4 right-4">
                      <span className="px-3 py-1 rounded-full text-[11px] font-bold uppercase tracking-wider bg-amber-400 text-stone-950 shadow-md">
                        Próximamente
                      </span>
                    </div>
                  )}

                  {/* Title overlay on image */}
                  <div className="absolute bottom-4 left-4 right-4 text-white">
                    <div className="flex items-center gap-2 mb-1">
                      <div className="w-7 h-7 rounded-lg bg-white/20 backdrop-blur-md flex items-center justify-center text-white">
                        <Icon className="w-4 h-4" />
                      </div>
                      <span className="text-xs uppercase tracking-widest font-mono text-amber-200 font-semibold">
                        {evt.tagline}
                      </span>
                    </div>
                    <h3 className="font-serif text-2xl font-bold leading-tight drop-shadow">
                      {evt.name}
                    </h3>
                  </div>
                </div>

                {/* Body Content */}
                <div className="p-6 flex-1 flex flex-col justify-between">
                  <p className="text-xs sm:text-sm text-stone-600 leading-relaxed mb-5 font-serif">
                    {evt.description}
                  </p>

                  {/* Feature Bullets */}
                  <div className="space-y-2 mb-6 border-t border-stone-100 pt-4">
                    {evt.features.map((feat, fIdx) => (
                      <div key={fIdx} className="flex items-center gap-2 text-xs text-stone-700">
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                        <span>{feat}</span>
                      </div>
                    ))}
                  </div>

                  {/* Action CTA Button */}
                  <div>
                    {evt.isAvailable ? (
                      <button
                        type="button"
                        onClick={() => onSelectEventType(evt.id)}
                        className="w-full py-3 px-4 rounded-xl bg-stone-900 hover:bg-stone-800 text-white text-xs sm:text-sm font-semibold transition-all flex items-center justify-center gap-2 group-hover:bg-gradient-to-r group-hover:from-amber-600 group-hover:to-pink-600 shadow-sm cursor-pointer"
                      >
                        <span>Explorar Atelier & Invitaciones</span>
                        <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                      </button>
                    ) : (
                      <div className="w-full py-2.5 px-4 rounded-xl bg-stone-100 text-stone-500 text-xs font-medium text-center border border-stone-200">
                        En fase de desarrollo editorial
                      </div>
                    )}
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>
      </section>

      {/* 4. Platform Benefits Banner */}
      <section className="bg-white border-y border-stone-200 py-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="text-center max-w-3xl mx-auto mb-12">
            <span className="text-xs uppercase tracking-widest font-bold text-amber-700 block mb-2">
              Tecnología de Vanguardia
            </span>
            <h2 className="text-3xl sm:text-4xl font-serif font-bold text-stone-900">
              ¿Por qué elegir nuestra plataforma de eventos?
            </h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
            <div className="p-6 rounded-2xl bg-[#FAF9F6] border border-stone-200/80 text-center">
              <div className="w-12 h-12 rounded-2xl bg-amber-100 text-amber-800 flex items-center justify-center mx-auto mb-4">
                <Music className="w-6 h-6" />
              </div>
              <h4 className="font-serif font-bold text-base text-stone-900 mb-1">Música & Multimedia</h4>
              <p className="text-xs text-stone-600 leading-relaxed">
                Reproductor flotante para vals o canción representativa y galerías fotográficas en tiempo real.
              </p>
            </div>

            <div className="p-6 rounded-2xl bg-[#FAF9F6] border border-stone-200/80 text-center">
              <div className="w-12 h-12 rounded-2xl bg-pink-100 text-pink-800 flex items-center justify-center mx-auto mb-4">
                <CheckCircle2 className="w-6 h-6" />
              </div>
              <h4 className="font-serif font-bold text-base text-stone-900 mb-1">RSVP Inteligente</h4>
              <p className="text-xs text-stone-600 leading-relaxed">
                Control de pases asignados, acompañantes, confirmación instantánea y recordatorios por WhatsApp.
              </p>
            </div>

            <div className="p-6 rounded-2xl bg-[#FAF9F6] border border-stone-200/80 text-center">
              <div className="w-12 h-12 rounded-2xl bg-purple-100 text-purple-800 flex items-center justify-center mx-auto mb-4">
                <MapPin className="w-6 h-6" />
              </div>
              <h4 className="font-serif font-bold text-base text-stone-900 mb-1">Mapas & Rutas GPS</h4>
              <p className="text-xs text-stone-600 leading-relaxed">
                Integración directa con Google Maps y Waze para que ningún invitado se pierda en el camino.
              </p>
            </div>

            <div className="p-6 rounded-2xl bg-[#FAF9F6] border border-stone-200/80 text-center">
              <div className="w-12 h-12 rounded-2xl bg-emerald-100 text-emerald-800 flex items-center justify-center mx-auto mb-4">
                <Gift className="w-6 h-6" />
              </div>
              <h4 className="font-serif font-bold text-base text-stone-900 mb-1">Mesa & Lluvia de Sobres</h4>
              <p className="text-xs text-stone-600 leading-relaxed">
                Cuentas bancarias CLABE, tiendas departamentales y buzón de sobres con mensajes personalizados.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* 5. Footer */}
      <footer className="py-12 px-4 sm:px-6 lg:px-8 bg-stone-950 text-stone-400 text-center text-xs">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-amber-400" />
            <span className="font-serif text-sm font-bold text-white">4-EVER Atelier Multieventos</span>
          </div>
          <p>© {new Date().getFullYear()} 4-EVER Inc. Todos los derechos reservados.</p>
          <div className="flex items-center gap-4">
            <button type="button" onClick={() => onSelectEventType('bodas')} className="hover:text-white transition-colors cursor-pointer">Bodas</button>
            <button type="button" onClick={() => onSelectEventType('xv')} className="hover:text-white transition-colors cursor-pointer">XV Años</button>
            <button type="button" onClick={() => onOpenAuth('login')} className="hover:text-white transition-colors cursor-pointer">Ingresar</button>
          </div>
        </div>
      </footer>
    </div>
  );
};
