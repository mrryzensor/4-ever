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
  X,
  Crown
} from 'lucide-react';
import { CardStyleId } from '../../types.ts';
import { XV_CARD_THEMES } from '../themes.ts';

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
    id: 'romantic-floral',
    name: 'Rose Gold & Princesa',
    badge: 'Corona & Palo de Rosa',
    tag: 'Princesa Romántica',
    dotColor: '#B85D83',
    bgHex: '#FDF7F9',
    accentHex: '#B85D83',
  },
  {
    id: 'classic-gold',
    name: 'Dorado Real & Tiara',
    badge: 'Corona & Gala',
    tag: 'Gala Imperial',
    dotColor: '#B38B38',
    bgHex: '#FDFBF7',
    accentHex: '#B38B38',
  },
  {
    id: 'lavender-provence',
    name: 'Sweet Lavanda & Hadas',
    badge: 'Lilas & Ensueño',
    tag: 'Mágico & Juvenil',
    dotColor: '#7C5EA0',
    bgHex: '#F8F6FC',
    accentHex: '#7C5EA0',
  },
  {
    id: 'royal-navy',
    name: 'Noche de Estrellas & Tiara',
    badge: 'Midnight Fantasy',
    tag: 'Gala de Noche',
    dotColor: '#255085',
    bgHex: '#F4F7FB',
    accentHex: '#255085',
  },
  {
    id: 'emerald-botanical',
    name: 'Esmeralda de Gala & Oro',
    badge: 'Alta Costura XV',
    tag: 'Elegancia Contemporánea',
    dotColor: '#2D6E54',
    bgHex: '#F5F9F7',
    accentHex: '#2D6E54',
  },
  {
    id: 'champagne-glam',
    name: 'Rose Gold Glamour',
    badge: 'Chic & Champagne',
    tag: 'Brillo & Cristales',
    dotColor: '#A37750',
    bgHex: '#FBF9F7',
    accentHex: '#A37750',
  },
  {
    id: 'watercolor-garden',
    name: 'Jardín de Hadas Pastel',
    badge: 'Acuarela Floral',
    tag: 'Fresco & Ensueño',
    dotColor: '#528B62',
    bgHex: '#F8FBF8',
    accentHex: '#528B62',
  },
  {
    id: 'dark-luxury',
    name: 'Diamante Negro & Oro',
    badge: 'Noche Glamour',
    tag: 'Vanguardia & Glamour',
    dotColor: '#E2B874',
    bgHex: '#121214',
    accentHex: '#E2B874',
  },
];

export const DemoStyleBar: React.FC<DemoStyleBarProps> = ({
  currentStyle,
  coupleNames = 'Valeria Montserrat',
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
        
        {/* Left: Back button & XV Demo Badge (Responsive) */}
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
            <span className="px-2 py-0.5 sm:py-1 rounded-full bg-pink-500/20 border border-pink-400/30 text-pink-300 font-mono text-[9px] sm:text-[11px] uppercase font-bold tracking-wider flex items-center gap-1 shrink-0">
              <Crown className="w-2.5 h-2.5 sm:w-3 sm:h-3 text-pink-300" />
              <span className="truncate max-w-[80px] xs:max-w-[110px] sm:max-w-none">
                XV {coupleNames}
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
            className="w-full px-2 sm:px-3.5 py-1 sm:py-1.5 rounded-full bg-stone-900/90 hover:bg-stone-800 border border-pink-400/30 hover:border-pink-400/60 text-white transition-all flex items-center justify-between gap-1 sm:gap-2 shadow-inner cursor-pointer"
            title="Cambiar diseño de la invitación"
          >
            <div className="flex items-center gap-1.5 sm:gap-2 min-w-0">
              <Palette className="w-3 h-3 sm:w-3.5 sm:h-3.5 text-pink-400 shrink-0" />
              <span
                className="w-2 h-2 sm:w-2.5 sm:h-2.5 rounded-full aspect-square shrink-0 border border-black/30 shadow-xs"
                style={{ backgroundColor: activeStyleObj.dotColor }}
              />
              <span className="text-[11px] sm:text-xs font-serif font-medium truncate text-stone-100">
                {activeStyleObj.name}
              </span>
            </div>
            <div className="flex items-center gap-0.5 sm:gap-1 shrink-0 text-stone-400">
              <span className="text-[9px] sm:text-[10px] uppercase font-mono tracking-wider hidden lg:inline text-pink-400/80">
                Cambiar
              </span>
              <ChevronDown className={`w-3 h-3 sm:w-3.5 sm:h-3.5 transition-transform duration-200 ${isMenuOpen ? 'rotate-180 text-pink-400' : ''}`} />
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
              <div className="absolute top-full left-1/2 -translate-x-1/2 sm:left-auto sm:translate-x-0 mt-2 z-50 w-72 sm:w-84 max-w-[92vw] bg-stone-900/95 backdrop-blur-2xl border border-pink-500/30 rounded-2xl shadow-2xl p-2 max-h-[70vh] overflow-y-auto no-scrollbar animate-in fade-in zoom-in-95 duration-150">
                <div className="px-3 py-2 border-b border-white/10 flex items-center justify-between mb-1.5">
                  <span className="text-[11px] uppercase font-mono tracking-widest text-pink-400/90 font-bold flex items-center gap-1.5">
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
                            ? 'bg-pink-500/20 border border-pink-400/50 text-white font-bold'
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
                          <div className="w-5 h-5 rounded-full bg-pink-500 text-white flex items-center justify-center shrink-0 shadow-xs">
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
            className="px-2.5 sm:px-4 lg:px-5 py-1 sm:py-1.5 rounded-full bg-gradient-to-r from-pink-500 via-rose-400 to-pink-500 text-white font-serif font-bold text-[11px] sm:text-xs shadow-md shadow-pink-500/20 hover:shadow-pink-500/40 border border-pink-300 transition-all flex items-center justify-center gap-1 cursor-pointer whitespace-nowrap shrink-0"
            id="btn-choose-demo-design-xv"
          >
            <Heart className="w-3 h-3 sm:w-3.5 sm:h-3.5 fill-white text-white shrink-0" />
            <span className="hidden sm:inline">Elegir este diseño</span>
            <span className="sm:hidden">Elegir</span>
            <Sparkle className="w-2.5 h-2.5 sm:w-3 sm:h-3 fill-white text-white shrink-0" />
          </motion.button>
        </div>

      </div>
    </header>
  );
};
