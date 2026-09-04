import React, { useState } from 'react';
import { motion } from 'motion/react';
import {
  Sparkles,
  Palette,
  Check,
  ArrowLeft,
  ChevronDown,
  ChevronUp,
  Heart,
  Sparkle
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
  const [isExpanded, setIsExpanded] = useState(false);

  return (
    <header className="sticky top-0 z-50 w-full px-2 sm:px-4 py-2.5 bg-stone-950/85 backdrop-blur-xl border-b border-white/10 shadow-2xl transition-all select-none">
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-2 sm:gap-3">
        
        {/* Left Side: Back button & Demo Badge */}
        <div className="flex items-center justify-between w-full md:w-auto gap-3">
          <button
            onClick={onBackToLanding}
            className="px-3 py-1.5 rounded-full bg-white/10 hover:bg-white/20 text-stone-200 hover:text-white border border-white/15 text-xs font-serif font-medium transition-all flex items-center gap-1.5 cursor-pointer shrink-0"
            title="Volver a la página principal"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Inicio</span>
          </button>

          <div className="flex items-center gap-2 min-w-0">
            <span className="px-2.5 py-0.5 rounded-full bg-pink-400/20 border border-pink-400/30 text-pink-300 font-mono text-[10px] uppercase font-bold tracking-wider flex items-center gap-1 shrink-0">
              <Sparkles className="w-3 h-3 animate-pulse" />
              XV de {coupleNames}
            </span>
            <span className="text-xs text-stone-400 font-serif italic hidden sm:inline truncate">
              (Modo Demostración)
            </span>
          </div>

          {/* Mobile toggle button for styles */}
          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className="md:hidden px-3 py-1 rounded-full bg-white/10 text-stone-200 border border-white/15 text-xs font-serif flex items-center gap-1.5 cursor-pointer shrink-0"
          >
            <Palette className="w-3.5 h-3.5 text-amber-300" />
            <span className="font-semibold text-[11px]">Estilos</span>
            {isExpanded ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
          </button>
        </div>

        {/* Center: Style Switcher Pills (Desktop always visible, Mobile in collapsible drawer) */}
        <div className={`w-full md:w-auto ${isExpanded ? 'flex' : 'hidden md:flex'} items-center justify-center gap-1 sm:gap-1.5 flex-wrap pt-2 md:pt-0 border-t md:border-t-0 border-white/10`}>
          {STYLE_OPTIONS.map((style) => {
            const isSelected = currentStyle === style.id;
            return (
              <button
                key={style.id}
                onClick={() => onSelectStyle(style.id)}
                className={`group px-3 py-1.5 rounded-full text-xs font-serif transition-all flex items-center gap-2 cursor-pointer ${
                  isSelected
                    ? 'bg-amber-300 text-stone-950 font-bold shadow-md ring-2 ring-amber-300/40 scale-102'
                    : 'bg-white/5 hover:bg-white/15 text-stone-300 hover:text-white border border-white/10'
                }`}
                title={style.tag}
              >
                <span
                  className="w-2.5 h-2.5 rounded-full aspect-square shrink-0 border border-black/20 shadow-xs"
                  style={{ backgroundColor: style.dotColor }}
                />
                <span className="text-[11px] sm:text-xs truncate max-w-[120px] sm:max-w-none">
                  {style.name}
                </span>
                {isSelected && <Check className="w-3 h-3 text-stone-950 stroke-[3]" />}
              </button>
            );
          })}
        </div>

        {/* Right Side: Iniciar Sesión link & Main CTA to choose this design */}
        <div className="w-full md:w-auto flex items-center justify-end gap-2.5 pt-1 md:pt-0">
          {onOpenLogin && (
            <button
              type="button"
              onClick={onOpenLogin}
              className="px-3.5 py-1.5 text-xs text-stone-300 hover:text-white font-serif transition-colors cursor-pointer hover:underline"
            >
              Iniciar Sesión
            </button>
          )}

          <motion.button
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.97 }}
            onClick={() => onChooseDesign(currentStyle)}
            className="w-full md:w-auto px-5 py-2 rounded-full bg-gradient-to-r from-amber-400 via-amber-300 to-amber-400 text-stone-950 font-serif font-bold text-xs sm:text-sm shadow-lg shadow-amber-400/20 hover:shadow-amber-400/40 border border-amber-200 transition-all flex items-center justify-center gap-2 cursor-pointer"
            id="btn-choose-demo-design"
          >
            <Heart className="w-4 h-4 fill-stone-950 text-stone-950" />
            <span>Elegir este diseño</span>
            <Sparkle className="w-3.5 h-3.5 fill-stone-950 text-stone-950" />
          </motion.button>
        </div>

      </div>
    </header>
  );
};
