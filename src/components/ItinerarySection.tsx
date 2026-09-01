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
import { WeddingSettings, ItineraryItem } from '../types.ts';
import { StyleSpecificDivider } from './AnimatedSvgs.tsx';
import { CARD_THEMES } from '../lib/themes.ts';

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

  return (
    <section className="w-full px-4 sm:px-8 md:px-12 lg:px-16 py-10 sm:py-14 bg-transparent" id="itinerario">
      {/* Itinerary Timeline Block */}
      {/* Section Title */}
      <div className="max-w-4xl mx-auto text-center mb-10 sm:mb-12">
        <div className="w-14 h-14 rounded-2xl bg-[#5A5A40]/10 text-[#5A5A40] flex items-center justify-center mx-auto mb-3 border border-[#E5E2D0]">
          <Clock className="w-7 h-7 shrink-0 text-[#5A5A40]" />
        </div>
        <span className="text-xs uppercase tracking-[0.3em] font-semibold text-[#7D8C7A] block mb-2">
          Cronograma del Gran Día
        </span>
        <h2 className="text-3xl sm:text-5xl font-serif text-[#3D3D2C] font-normal">
          Itinerario de la Celebración
        </h2>
        <StyleSpecificDivider
          cardStyle={settings.cardStyle}
          className="w-48 sm:w-60 h-8 mx-auto mt-2"
          color={CARD_THEMES[settings.cardStyle]?.accentColorHex}
        />
        <p className="text-sm text-stone-600 max-w-xl mx-auto mt-1">
          Te compartimos los horarios y momentos clave para que no te pierdas ningún detalle.
        </p>
      </div>

      {/* Itinerary Timeline */}
      <div className="relative max-w-4xl mx-auto my-12">
        {/* Central timeline line */}
        <div className="absolute left-6 sm:left-1/2 top-4 bottom-4 w-0.5 bg-gradient-to-b from-[#7D8C7A]/30 via-[#5A5A40]/40 to-[#7D8C7A]/30 sm:-translate-x-1/2" />

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
                      stroke="#D4A373"
                      strokeWidth="1.5"
                      strokeDasharray="4 4"
                      fill="none"
                      opacity="0.8"
                    />
                  </motion.svg>
                  <div className="w-11 h-11 rounded-full aspect-square shrink-0 circle-node bg-[#5A5A40] text-[#FDFCF0] flex items-center justify-center shadow-lg border-2 border-white">
                    {getIcon(item.icon)}
                  </div>
                </div>

                {/* Content Card */}
                <div
                  className={`ml-16 sm:ml-0 sm:w-1/2 ${
                    isEven ? 'sm:pl-12' : 'sm:pr-12'
                  } w-full`}
                >
                  <div className="p-6 rounded-3xl bg-white/90 backdrop-blur-sm border border-[#E5E2D0] shadow-sm hover:shadow-md transition-all">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-xs font-mono font-bold text-[#5A5A40] bg-[#FAF9F0] px-3 py-1 rounded-full border border-[#E5E2D0]">
                        {item.time} hrs
                      </span>
                    </div>
                    <h4 className="text-lg font-serif font-bold text-[#3D3D2C] mt-1">
                      {item.title}
                    </h4>
                    <p className="text-xs sm:text-sm text-stone-600 mt-1 leading-relaxed">
                      {item.desc}
                    </p>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
};
