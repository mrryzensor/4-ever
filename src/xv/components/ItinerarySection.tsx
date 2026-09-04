import React from 'react';
import { motion } from 'motion/react';
import {
  Church,
  GlassWater,
  Utensils,
  Music2,
  Moon,
  Sparkles,
  Shirt,
  Palette,
  Clock
} from 'lucide-react';
import { WeddingSettings, ItineraryItem } from '../../types.ts';
import { StyleSpecificDivider } from './AnimatedSvgs.tsx';
import { CARD_THEMES } from '../../lib/themes.ts';

interface ItinerarySectionProps {
  settings: WeddingSettings;
}

const getIcon = (iconName: string) => {
  switch (iconName) {
    case 'church':
      return <Church className="w-6 h-6 shrink-0" />;
    case 'cocktail':
      return <GlassWater className="w-6 h-6 shrink-0" />;
    case 'utensils':
      return <Utensils className="w-6 h-6 shrink-0" />;
    case 'music':
      return <Music2 className="w-6 h-6 shrink-0" />;
    case 'moon':
      return <Moon className="w-6 h-6 shrink-0" />;
    default:
      return <Sparkles className="w-6 h-6 shrink-0" />;
  }
};

export const ItinerarySection: React.FC<ItinerarySectionProps> = ({ settings }) => {
  const [isExpanded, setIsExpanded] = React.useState(false);
  const showItinerary = settings.showItinerary !== false;

  if (!showItinerary) {
    return null;
  }

  let itineraryList: ItineraryItem[] = [];
  try {
    itineraryList = JSON.parse(settings.itinerary || '[]');
  } catch {
    itineraryList = [];
  }

  const isDark = settings.cardStyle === 'dark-luxury';
  const activeTheme = CARD_THEMES[settings.cardStyle] || CARD_THEMES['classic-gold'];

  // In compact preview, show the first 2-3 key highlights or summary badges
  const previewItems = itineraryList.slice(0, 3);
  const hasMore = itineraryList.length > 3;

  return (
    <section className="w-full px-4 sm:px-8 md:px-12 lg:px-16 py-10 sm:py-14 bg-transparent" id="itinerario">
      {/* Section Title */}
      <div className="max-w-4xl mx-auto text-center mb-8 sm:mb-10">
        <div className={`w-14 h-14 rounded-2xl flex items-center justify-center mx-auto mb-3 border shadow-xs ${
          isDark
            ? 'bg-[#C5A059]/15 text-[#C5A059] border-[#5A5A40]/60'
            : 'bg-[#5A5A40]/10 text-[#5A5A40] border-[#E5E2D0]'
        }`}>
          <Clock className="w-7 h-7 shrink-0" />
        </div>
        <span className={`text-xs uppercase tracking-[0.3em] font-semibold block mb-2 ${
          isDark ? 'text-[#C5A059]' : 'text-[#7D8C7A]'
        }`}>
          Cronograma del Gran Día
        </span>
        <h2 className={`text-3xl sm:text-5xl font-serif font-normal ${
          isDark ? 'text-[#FDFCF0]' : 'text-[#3D3D2C]'
        }`}>
          Itinerario de la Celebración
        </h2>
        <StyleSpecificDivider
          cardStyle={settings.cardStyle}
          className="w-48 sm:w-60 h-8 mx-auto mt-2"
          color={activeTheme?.accentColorHex}
        />
        <p className={`text-sm max-w-xl mx-auto mt-1 leading-relaxed font-serif italic ${
          isDark ? 'text-stone-300' : 'text-stone-600'
        }`}>
          Te compartimos los horarios y momentos clave para que no te pierdas ningún detalle.
        </p>

        {/* Inline Quick Summary Chips when collapsed - Larger & Premium Styling */}
        {!isExpanded && itineraryList.length > 0 && (
          <div className="mt-6 flex flex-wrap items-center justify-center gap-3 max-w-3xl mx-auto">
            {previewItems.map((item, idx) => (
              <span
                key={idx}
                className={`inline-flex items-center gap-2.5 px-5 py-2.5 rounded-full text-sm sm:text-base font-serif font-medium border shadow-sm transition-all duration-300 hover:scale-105 ${
                  isDark
                    ? 'bg-[#282B25] border-[#5A5A40]/80 text-stone-100 shadow-black/40'
                    : 'bg-white/95 border-[#E5E2D0] text-[#3D3D2C] shadow-stone-200/60'
                }`}
              >
                <span className={`font-mono font-bold text-sm sm:text-base ${isDark ? 'text-[#C5A059]' : 'text-[#5A5A40]'}`}>
                  {item.time} hrs
                </span>
                <span className="text-stone-400 font-sans">•</span>
                <span className="tracking-wide">{item.title}</span>
              </span>
            ))}
            {hasMore && (
              <span className={`text-xs sm:text-sm font-serif font-medium px-4 py-2 rounded-full border border-dashed ${
                isDark ? 'border-[#5A5A40] text-stone-300 bg-stone-900/40' : 'border-[#E5E2D0] text-stone-600 bg-[#FAF9F0]/80'
              }`}>
                +{itineraryList.length - 3} momentos más
              </span>
            )}
          </div>
        )}

        {/* Toggle Button for More Details */}
        <div className="mt-7 flex justify-center">
          <button
            type="button"
            onClick={() => setIsExpanded(!isExpanded)}
            className={`inline-flex items-center gap-2.5 px-7 py-3 rounded-full text-xs sm:text-sm font-serif font-bold uppercase tracking-wider transition-all duration-300 shadow-md cursor-pointer hover:scale-105 active:scale-95 ${
              isDark
                ? 'bg-[#C5A059] text-stone-950 hover:bg-[#d8b46d]'
                : 'bg-[#5A5A40] text-[#FDFCF0] hover:bg-[#484833]'
            }`}
          >
            <span>{isExpanded ? 'Ver Menos Detalles' : 'Ver Itinerario Completo'}</span>
            <span className={`transition-transform duration-300 text-xs ${isExpanded ? 'rotate-180' : ''}`}>
              ▼
            </span>
          </button>
        </div>
      </div>

      {/* Itinerary Timeline - Expands / Collapses smoothly */}
      <motion.div
        initial={false}
        animate={{
          height: isExpanded ? 'auto' : 0,
          opacity: isExpanded ? 1 : 0,
        }}
        transition={{ duration: 0.4, ease: 'easeInOut' }}
        className="overflow-hidden"
      >
        <div className="relative max-w-4xl mx-auto my-6 sm:my-8 pt-4">
          {/* Central timeline line */}
          <div className={`absolute left-6 sm:left-1/2 top-4 bottom-4 w-0.5 sm:-translate-x-1/2 ${
            isDark
              ? 'bg-gradient-to-b from-[#C5A059]/30 via-[#C5A059]/50 to-[#C5A059]/30'
              : 'bg-gradient-to-b from-[#7D8C7A]/30 via-[#5A5A40]/40 to-[#7D8C7A]/30'
          }`} />

          <div className="space-y-10">
            {itineraryList.map((item, index) => {
              const isEven = index % 2 === 0;
              return (
                <div
                  key={index}
                  className={`relative flex items-center ${
                    isEven ? 'sm:flex-row-reverse' : 'sm:flex-row'
                  } flex-row`}
                >
                  {/* Timeline Icon Node with Animated SVG halo */}
                  <div className="absolute left-6 sm:left-1/2 -translate-x-1/2 w-14 h-14 flex items-center justify-center z-10">
                    <motion.svg
                      viewBox="0 0 60 60"
                      className="absolute inset-0 w-full h-full pointer-events-none"
                      animate={{ rotate: 360 }}
                      transition={{ duration: 12 + index * 2, repeat: Infinity, ease: 'linear' }}
                    >
                      <circle
                        cx="30"
                        cy="30"
                        r="27"
                        stroke={isDark ? '#C5A059' : '#D4A373'}
                        strokeWidth="1.5"
                        strokeDasharray="4 4"
                        fill="none"
                        opacity="0.8"
                      />
                    </motion.svg>
                    <div className={`w-11 h-11 rounded-full aspect-square shrink-0 circle-node flex items-center justify-center shadow-lg border-2 ${
                      isDark
                        ? 'bg-[#C5A059] text-stone-950 border-[#1F211D]'
                        : 'bg-[#5A5A40] text-[#FDFCF0] border-white'
                    }`}>
                      {getIcon(item.icon)}
                    </div>
                  </div>

                  {/* Content Card */}
                  <div
                    className={`ml-16 sm:ml-0 sm:w-1/2 ${
                      isEven ? 'sm:pl-12' : 'sm:pr-12'
                    } w-full`}
                  >
                    <div className={`p-6 rounded-3xl backdrop-blur-sm border shadow-sm hover:shadow-md transition-all ${
                      isDark
                        ? 'bg-[#282B25]/95 border-[#5A5A40]/60 text-[#FDFCF0]'
                        : 'bg-white/90 border-[#E5E2D0] text-[#3D3D2C]'
                    }`}>
                      <div className="flex items-center justify-between mb-2">
                        <span className={`text-xs font-mono font-bold px-3 py-1 rounded-full border ${
                          isDark
                            ? 'bg-[#1F211D] text-[#C5A059] border-[#5A5A40]'
                            : 'bg-[#FAF9F0] text-[#5A5A40] border-[#E5E2D0]'
                        }`}>
                          {item.time} hrs
                        </span>
                      </div>
                      <h4 className={`text-lg font-serif font-bold mt-1 ${
                        isDark ? 'text-[#FDFCF0]' : 'text-[#3D3D2C]'
                      }`}>
                        {item.title}
                      </h4>
                      <p className={`text-xs sm:text-sm mt-1 leading-relaxed ${
                        isDark ? 'text-stone-300' : 'text-stone-600'
                      }`}>
                        {item.desc}
                      </p>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </motion.div>
    </section>
  );
};
