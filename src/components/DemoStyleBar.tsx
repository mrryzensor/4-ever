import React, { useState } from 'react';
import { motion } from 'motion/react';
import {
  Sparkles,
  Palette,
  Check,
  ArrowLeft,
  ChevronDown,
  Heart,
  Sparkle,
  X
} from 'lucide-react';
import { CardStyleId } from '../types.ts';

interface DemoStyleBarProps {
  currentStyle: CardStyleId;
  coupleNames?: string;
  onSelectStyle: (style: CardStyleId) => void;
  onChooseDesign: (style: CardStyleId) => void;
  onOpenLogin?: () => void;
  onBackToLanding: () => void;
}

interface StyleOption {
  id: CardStyleId;
  name: string;
  badge: string;
  tag: string;
  dotColor: string;
  bgHex: string;
  accentHex: string;
}

const STYLE_OPTIONS: StyleOption[] = [
  {
    id: 'classic-gold',
    name: 'Classic Gold & Marfil',
    badge: 'Olivo & Marfil',
    tag: 'Elegancia Clásica',
    dotColor: '#5A5A40',
    bgHex: '#FDFCF0',
    accentHex: '#5A5A40',
  },
  {
    id: 'romantic-floral',
    name: 'Romantic Floral Rosé',
    badge: 'Acuarela Floral',
    tag: 'Romántico & Delicado',
    dotColor: '#8A6D65',
    bgHex: '#FAF7F5',
    accentHex: '#8A6D65',
  },
  {
    id: 'boho-chic',
    name: 'Boho Terracota',
    badge: 'Pampas & Salvia',
    tag: 'Cálido & Orgánico',
    dotColor: '#B26E59',
    bgHex: '#FAF8F2',
    accentHex: '#B26E59',
  },
  {
    id: 'minimal-editorial',
    name: 'Minimalist Editorial',
    badge: 'Vogue & Lino',
    tag: 'Alta Costura',
    dotColor: '#141414',
    bgHex: '#F9F7EF',
    accentHex: '#141414',
  },
  {
    id: 'dark-luxury',
    name: 'Dark Velvet Luxury',
    badge: 'Gala & Oro',
    tag: 'Nocturno Exclusivo',
    dotColor: '#D4AF37',
    bgHex: '#141412',
    accentHex: '#D4AF37',
  },
  {
    id: 'watercolor-garden',
    name: 'Watercolor Garden',
    badge: 'Jardín & Salvia',
    tag: 'Fresco & Campestre',
    dotColor: '#3F6253',
    bgHex: '#F4F7F4',
    accentHex: '#3F6253',
  },
  {
    id: 'royal-navy',
    name: 'Royal Navy & Gold',
    badge: 'Realeza & Gala',
    tag: 'Azul Zafiro Imperial',
    dotColor: '#D4AF37',
    bgHex: '#0B1320',
    accentHex: '#D4AF37',
  },
  {
    id: 'terracotta-sunset',
    name: 'Terracotta Sunset',
    badge: 'Atardecer Cobre',
    tag: 'Calidez Crepuscular',
    dotColor: '#E07A5F',
    bgHex: '#FAF4EE',
    accentHex: '#E07A5F',
  },
  {
    id: 'lavender-provence',
    name: 'Lavender Provence',
    badge: 'Provenza & Lino',
    tag: 'Violeta Empolvado',
    dotColor: '#7B6D8D',
    bgHex: '#F8F6FB',
    accentHex: '#7B6D8D',
  },
  {
    id: 'emerald-botanical',
    name: 'Emerald & Gold',
    badge: 'Selva & Esmeralda',
    tag: 'Tropical Exuberante',
    dotColor: '#52B788',
    bgHex: '#081710',
    accentHex: '#52B788',
  },
  {
    id: 'coastal-breeze',
    name: 'Coastal Breeze',
    badge: 'Brisa & Olas',
    tag: 'Azul Mediterráneo',
    dotColor: '#2B6CB0',
    bgHex: '#F2F8FA',
    accentHex: '#2B6CB0',
  },
  {
    id: 'champagne-glam',
    name: 'Champagne Glam',
    badge: 'Art Déco & Perlas',
    tag: 'Destello Años 20',
    dotColor: '#C39B60',
    bgHex: '#FAF7F0',
    accentHex: '#C39B60',
  },
];

export const DemoStyleBar: React.FC<DemoStyleBarProps> = ({
  currentStyle,
  coupleNames = 'Sofía & Alejandro',
  onSelectStyle,
  onChooseDesign,
  onOpenLogin,
  onBackToLanding,
}) => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const activeStyleObj = STYLE_OPTIONS.find((s) => s.id === currentStyle) || STYLE_OPTIONS[0];

  return (
    <header className="sticky top-0 z-50 w-full px-2 sm:px-4 lg:px-8 py-2 bg-stone-950/95 backdrop-blur-xl border-b border-white/10 shadow-2xl transition-all select-none">
      <div className="w-full flex items-center justify-between gap-1.5 sm:gap-3">
        
        {/* Left: Back button & Demo Badge (Responsive) */}
        <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
          <button
            onClick={onBackToLanding}
            className="px-2 sm:px-3 py-1 sm:py-1.5 rounded-full bg-white/10 hover:bg-white/20 text-stone-200 hover:text-white border border-white/15 text-[11px] sm:text-xs font-serif font-medium transition-all flex items-center gap-1 cursor-pointer shrink-0"
            title="Volver a la página principal"
          >
            <ArrowLeft className="w-3 h-3 sm:w-3.5 sm:h-3.5" />
            <span className="hidden md:inline">Inicio</span>
          </button>

          <div className="flex items-center gap-1 shrink-0">
            <span className="px-2 py-0.5 sm:py-1 rounded-full bg-amber-400/20 border border-amber-400/30 text-amber-300 font-mono text-[9px] sm:text-[11px] uppercase font-bold tracking-wider flex items-center gap-1 shrink-0">
              <Sparkles className="w-2.5 h-2.5 sm:w-3 sm:h-3 text-amber-300 animate-pulse" />
              <span className="truncate max-w-[80px] xs:max-w-[110px] sm:max-w-none">
                {coupleNames}
              </span>
            </span>
            <span className="text-[10px] text-stone-400 font-serif italic hidden xl:inline shrink-0">
              (Demostración)
            </span>
          </div>
        </div>

        {/* Center: Interactive Elegant Dropdown Menu for Styles */}
        <div className="relative flex-1 max-w-[160px] xs:max-w-[210px] sm:max-w-xs md:max-w-sm mx-auto flex justify-center">
          <button
            type="button"
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            className="w-full px-2 sm:px-3.5 py-1 sm:py-1.5 rounded-full bg-stone-900/90 hover:bg-stone-800 border border-amber-400/30 hover:border-amber-400/60 text-white transition-all flex items-center justify-between gap-1 sm:gap-2 shadow-inner cursor-pointer"
            title="Cambiar diseño de la invitación"
          >
            <div className="flex items-center gap-1.5 sm:gap-2 min-w-0">
              <Palette className="w-3 h-3 sm:w-3.5 sm:h-3.5 text-amber-400 shrink-0" />
              <span
                className="w-2 h-2 sm:w-2.5 sm:h-2.5 rounded-full aspect-square shrink-0 border border-black/30 shadow-xs"
                style={{ backgroundColor: activeStyleObj.dotColor }}
              />
              <span className="text-[11px] sm:text-xs font-serif font-medium truncate text-stone-100">
                {activeStyleObj.name}
              </span>
            </div>
            <div className="flex items-center gap-0.5 sm:gap-1 shrink-0 text-stone-400">
              <span className="text-[9px] sm:text-[10px] uppercase font-mono tracking-wider hidden lg:inline text-amber-400/80">
                Cambiar
              </span>
              <ChevronDown className={`w-3 h-3 sm:w-3.5 sm:h-3.5 transition-transform duration-200 ${isMenuOpen ? 'rotate-180 text-amber-400' : ''}`} />
            </div>
          </button>

          {/* Dropdown Menu Modal / Popover */}
          {isMenuOpen && (
            <>
              {/* Backdrop */}
              <div
                className="fixed inset-0 z-40 bg-black/40 backdrop-blur-xs"
                onClick={() => setIsMenuOpen(false)}
              />

              {/* Menu Container */}
              <div className="absolute top-full left-1/2 -translate-x-1/2 sm:left-auto sm:translate-x-0 mt-2 z-50 w-72 sm:w-84 max-w-[92vw] bg-stone-900/95 backdrop-blur-2xl border border-amber-500/30 rounded-2xl shadow-2xl p-2 max-h-[70vh] overflow-y-auto no-scrollbar animate-in fade-in zoom-in-95 duration-150">
                <div className="px-3 py-2 border-b border-white/10 flex items-center justify-between mb-1.5">
                  <span className="text-[11px] uppercase font-mono tracking-widest text-amber-400/90 font-bold flex items-center gap-1.5">
                    <Palette className="w-3.5 h-3.5" />
                    Elige un estilo ({STYLE_OPTIONS.length})
                  </span>
                  <button
                    type="button"
                    onClick={() => setIsMenuOpen(false)}
                    className="text-stone-400 hover:text-white p-1 rounded-md cursor-pointer"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                </div>

                <div className="space-y-1">
                  {STYLE_OPTIONS.map((style) => {
                    const isSelected = currentStyle === style.id;
                    return (
                      <button
                        key={style.id}
                        type="button"
                        onClick={() => {
                          onSelectStyle(style.id);
                          setIsMenuOpen(false);
                        }}
                        className={`w-full px-3 py-2 rounded-xl text-left transition-all flex items-center justify-between gap-3 cursor-pointer ${
                          isSelected
                            ? 'bg-amber-400/15 border border-amber-400/50 text-white font-bold'
                            : 'hover:bg-white/5 border border-transparent text-stone-300 hover:text-white'
                        }`}
                      >
                        <div className="flex items-center gap-2.5 min-w-0">
                          <span
                            className="w-3 h-3 rounded-full aspect-square shrink-0 border border-black/20 shadow-xs ring-1 ring-white/20"
                            style={{ backgroundColor: style.dotColor }}
                          />
                          <div className="min-w-0">
                            <p className="text-xs font-serif leading-snug truncate">
                              {style.name}
                            </p>
                            <p className="text-[10px] text-stone-400 font-sans truncate">
                              {style.tag}
                            </p>
                          </div>
                        </div>
                        {isSelected && (
                          <div className="w-5 h-5 rounded-full bg-amber-400 text-stone-950 flex items-center justify-center shrink-0 shadow-xs">
                            <Check className="w-3 h-3 stroke-[3]" />
                          </div>
                        )}
                      </button>
                    );
                  })}
                </div>
              </div>
            </>
          )}
        </div>

        {/* Right: Login link & Main CTA button */}
        <div className="flex items-center gap-1.5 sm:gap-3 shrink-0">
          {onOpenLogin && (
            <button
              type="button"
              onClick={onOpenLogin}
              className="hidden lg:inline-block px-2.5 py-1 text-xs text-stone-300 hover:text-white font-serif transition-colors cursor-pointer hover:underline whitespace-nowrap"
            >
              Iniciar Sesión
            </button>
          )}

          <motion.button
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.97 }}
            onClick={() => onChooseDesign(currentStyle)}
            className="px-2.5 sm:px-4 lg:px-5 py-1 sm:py-1.5 rounded-full bg-gradient-to-r from-amber-400 via-amber-300 to-amber-400 text-stone-950 font-serif font-bold text-[11px] sm:text-xs shadow-md shadow-amber-400/20 hover:shadow-amber-400/40 border border-amber-200 transition-all flex items-center justify-center gap-1 cursor-pointer whitespace-nowrap shrink-0"
            id="btn-choose-demo-design"
          >
            <Heart className="w-3 h-3 sm:w-3.5 sm:h-3.5 fill-stone-950 text-stone-950 shrink-0" />
            <span className="hidden sm:inline">Elegir este diseño</span>
            <span className="sm:hidden">Elegir</span>
            <Sparkle className="w-2.5 h-2.5 sm:w-3 sm:h-3 fill-stone-950 text-stone-950 shrink-0" />
          </motion.button>
        </div>

      </div>
    </header>
  );
};
