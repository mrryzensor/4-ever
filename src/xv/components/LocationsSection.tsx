import React, { useState } from 'react';
import { motion } from 'motion/react';
import {
  MapPin,
  Navigation,
  ExternalLink,
  Copy,
  Check,
  Calendar,
  Clock,
  Car,
  Compass,
  Sparkles
} from 'lucide-react';
import { WeddingSettings } from '../../types.ts';
import { StyleSpecificDivider } from './AnimatedSvgs.tsx';
import { CARD_THEMES } from '../../lib/themes.ts';

interface LocationsSectionProps {
  settings: WeddingSettings;
}

export const LocationsSection: React.FC<LocationsSectionProps> = ({ settings }) => {
  const [activeVenue, setActiveVenue] = useState<'ceremony' | 'reception'>('ceremony');
  const [copiedType, setCopiedType] = useState<string | null>(null);

  const handleCopy = (text: string, type: string) => {
    if (!text) return;
    navigator.clipboard.writeText(text);
    setCopiedType(type);
    setTimeout(() => setCopiedType(null), 2000);
  };

  const getMapsSearchUrl = (venue: string, address: string, customUrl?: string) => {
    if (customUrl && customUrl.trim() !== '') {
      return customUrl;
    }
    const query = encodeURIComponent(`${venue} ${address}`.trim());
    return `https://www.google.com/maps/search/?api=1&query=${query}`;
  };

  const getMapsDirectionsUrl = (venue: string, address: string) => {
    const destination = encodeURIComponent(`${venue} ${address}`.trim());
    return `https://www.google.com/maps/dir/?api=1&destination=${destination}`;
  };

  const getWazeUrl = (venue: string, address: string) => {
    const query = encodeURIComponent(`${venue} ${address}`.trim());
    return `https://waze.com/ul?q=${query}&navigate=yes`;
  };

  const getEmbedUrl = (venue: string, address: string, customEmbed?: string) => {
    if (customEmbed && customEmbed.trim() !== '') {
      return customEmbed;
    }
    const query = encodeURIComponent(`${venue} ${address}`.trim());
    return `https://maps.google.com/maps?q=${query}&t=&z=15&ie=UTF8&iwloc=&output=embed`;
  };

  const ceremonySearchUrl = getMapsSearchUrl(
    settings.ceremonyVenue || 'Ceremonia Religiosa',
    settings.ceremonyAddress || '',
    settings.ceremonyMapsUrl
  );
  const ceremonyDirectionsUrl = getMapsDirectionsUrl(
    settings.ceremonyVenue || 'Ceremonia Religiosa',
    settings.ceremonyAddress || ''
  );
  const ceremonyWazeUrl = getWazeUrl(
    settings.ceremonyVenue || 'Ceremonia Religiosa',
    settings.ceremonyAddress || ''
  );
  const ceremonyEmbedUrl = getEmbedUrl(
    settings.ceremonyVenue || 'Ceremonia Religiosa',
    settings.ceremonyAddress || '',
    settings.ceremonyEmbedUrl
  );

  const receptionSearchUrl = getMapsSearchUrl(
    settings.receptionVenue || 'Recepción & Banquete',
    settings.receptionAddress || '',
    settings.receptionMapsUrl
  );
  const receptionDirectionsUrl = getMapsDirectionsUrl(
    settings.receptionVenue || 'Recepción & Banquete',
    settings.receptionAddress || ''
  );
  const receptionWazeUrl = getWazeUrl(
    settings.receptionVenue || 'Recepción & Banquete',
    settings.receptionAddress || ''
  );
  const receptionEmbedUrl = getEmbedUrl(
    settings.receptionVenue || 'Recepción & Banquete',
    settings.receptionAddress || '',
    settings.receptionEmbedUrl
  );

  const isDark = settings.cardStyle === 'dark-luxury';
  const activeTheme = CARD_THEMES[settings.cardStyle] || CARD_THEMES['classic-gold'];
  const [isExpanded, setIsExpanded] = useState(false);

  return (
    <section className="w-full px-4 sm:px-8 md:px-12 lg:px-16 py-10 sm:py-14 bg-transparent" id="ubicaciones">
      {/* Section Title Header */}
      <div className="max-w-4xl mx-auto text-center mb-8 sm:mb-10">
        <div className={`w-14 h-14 rounded-2xl flex items-center justify-center mx-auto mb-3 border shadow-xs ${
          isDark
            ? 'bg-[#C5A059]/15 text-[#C5A059] border-[#5A5A40]/60'
            : 'bg-[#5A5A40]/10 text-[#5A5A40] border-[#E5E2D0]'
        }`}>
          <MapPin className="w-7 h-7 shrink-0" />
        </div>
        <span className={`text-xs uppercase tracking-[0.3em] font-semibold block mb-2 ${
          isDark ? 'text-[#C5A059]' : 'text-[#7D8C7A]'
        }`}>
          Ubicaciones & Cómo Llegar
        </span>
        <h2 className={`text-3xl sm:text-5xl font-serif font-normal ${
          isDark ? 'text-[#FDFCF0]' : 'text-[#3D3D2C]'
        }`}>
          Lugares de la Celebración
        </h2>
        <StyleSpecificDivider
          cardStyle={settings.cardStyle}
          className="w-48 sm:w-60 h-8 mx-auto mt-2"
          color={activeTheme?.accentColorHex}
        />
        <p className={`text-sm max-w-xl mx-auto mt-1 leading-relaxed font-serif italic ${
          isDark ? 'text-stone-300' : 'text-stone-600'
        }`}>
          Te facilito los mapas interactivos y rutas guiadas por Google Maps para acompañarme puntualmente en cada momento de mi fiesta.
        </p>

        {/* Quick Venue Cards Preview (when collapsed) - Larger & Premium Styling */}
        {!isExpanded && (
          <div className="mt-6 grid grid-cols-1 sm:grid-cols-2 gap-4 max-w-3xl mx-auto text-left">
            <div className={`p-4 sm:p-5 rounded-3xl border shadow-sm flex items-center gap-3.5 transition-all hover:scale-[1.02] ${
              isDark ? 'bg-[#282B25] border-[#5A5A40]/80' : 'bg-white/95 border-[#E5E2D0]'
            }`}>
              <div className={`w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 border ${
                isDark ? 'bg-[#1F211D] border-[#5A5A40] text-[#C5A059]' : 'bg-[#FAF9F0] border-[#E5E2D0] text-[#5A5A40]'
              }`}>
                <MapPin className="w-6 h-6" />
              </div>
              <div className="min-w-0">
                <span className={`text-xs uppercase tracking-wider font-bold block ${isDark ? 'text-[#C5A059]' : 'text-[#7D8C7A]'}`}>
                  Ceremonia • {settings.ceremonyTime || '17:00'} hrs
                </span>
                <p className={`text-sm sm:text-base font-serif font-bold truncate mt-0.5 ${isDark ? 'text-stone-100' : 'text-stone-800'}`}>
                  {settings.ceremonyVenue || 'Parroquia Principal'}
                </p>
              </div>
            </div>

            <div className={`p-4 sm:p-5 rounded-3xl border shadow-sm flex items-center gap-3.5 transition-all hover:scale-[1.02] ${
              isDark ? 'bg-[#282B25] border-[#5A5A40]/80' : 'bg-white/95 border-[#E5E2D0]'
            }`}>
              <div className={`w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 border ${
                isDark ? 'bg-[#1F211D] border-[#5A5A40] text-[#C5A059]' : 'bg-[#FAF9F0] border-[#E5E2D0] text-[#5A5A40]'
              }`}>
                <MapPin className="w-6 h-6" />
              </div>
              <div className="min-w-0">
                <span className={`text-xs uppercase tracking-wider font-bold block ${isDark ? 'text-[#C5A059]' : 'text-[#7D8C7A]'}`}>
                  Recepción • {settings.receptionTime || '19:30'} hrs
                </span>
                <p className={`text-sm sm:text-base font-serif font-bold truncate mt-0.5 ${isDark ? 'text-stone-100' : 'text-stone-800'}`}>
                  {settings.receptionVenue || 'Hacienda / Salón'}
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Toggle Button for Maps and Full Details */}
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
            <span>{isExpanded ? 'Ocultar Mapas y Rutas' : 'Ver Mapas y Cómo Llegar'}</span>
            <span className={`transition-transform duration-300 text-xs ${isExpanded ? 'rotate-180' : ''}`}>
              ▼
            </span>
          </button>
        </div>
      </div>

      {/* Main Grid: Ceremonia & Recepción Cards with Google Maps (Collapsible) */}
      <motion.div
        initial={false}
        animate={{
          height: isExpanded ? 'auto' : 0,
          opacity: isExpanded ? 1 : 0,
        }}
        transition={{ duration: 0.4, ease: 'easeInOut' }}
        className="overflow-hidden"
      >
        <div className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-8 pt-4">
        {/* ==================================================================== */}
        {/* CARD 1: CEREMONIA RELIGIOSA / CIVIL */}
        {/* ==================================================================== */}
        <div className={`backdrop-blur-sm rounded-3xl p-6 sm:p-8 border shadow-sm hover:shadow-md transition-all flex flex-col justify-between ${
          isDark
            ? 'bg-[#282B25]/95 border-[#5A5A40]/60 text-[#FDFCF0]'
            : 'bg-white/95 border-[#E5E2D0] text-[#3D3D2C]'
        }`}>
          <div>
            <div className="flex items-center justify-between mb-4">
              <span className={`text-[11px] uppercase tracking-widest font-bold px-3 py-1 rounded-full border ${
                isDark
                  ? 'bg-[#1F211D] text-[#C5A059] border-[#5A5A40]'
                  : 'bg-[#FAF9F0] text-[#5A5A40] border-[#E5E2D0]'
              }`}>
                Paso 1 • Ceremonia
              </span>
              <div className={`flex items-center gap-1.5 text-xs font-mono font-semibold ${
                isDark ? 'text-[#C5A059]' : 'text-[#5A5A40]'
              }`}>
                <Clock className="w-3.5 h-3.5" />
                <span>{settings.ceremonyTime || '17:00'} hrs</span>
              </div>
            </div>

            <h3 className={`text-2xl font-serif font-bold mb-2 ${
              isDark ? 'text-[#FDFCF0]' : 'text-[#3D3D2C]'
            }`}>
              {settings.ceremonyVenue || 'Parroquia San Francisco de Asís'}
            </h3>

            <div className={`flex items-start gap-2 text-xs sm:text-sm mb-6 ${
              isDark ? 'text-stone-300' : 'text-stone-600'
            }`}>
              <MapPin className={`w-4 h-4 shrink-0 mt-0.5 ${isDark ? 'text-[#C5A059]' : 'text-[#7D8C7A]'}`} />
              <span>{settings.ceremonyAddress || 'Dirección de la ceremonia'}</span>
            </div>

            {/* Embedded Google Map */}
            <div className={`w-full h-56 sm:h-64 rounded-2xl overflow-hidden border shadow-inner mb-6 relative ${
              isDark ? 'bg-stone-900 border-[#5A5A40]' : 'bg-stone-100 border-[#E5E2D0]'
            }`}>
              <iframe
                title="Google Maps Ceremonia"
                width="100%"
                height="100%"
                frameBorder="0"
                scrolling="no"
                marginHeight={0}
                marginWidth={0}
                src={ceremonyEmbedUrl}
                className="w-full h-full border-0"
                loading="lazy"
              />
              <div className="absolute top-2 right-2 z-10">
                <span className="text-[10px] font-semibold bg-white/90 backdrop-blur-xs text-[#5A5A40] px-2 py-1 rounded-lg border border-[#E5E2D0] shadow-xs flex items-center gap-1">
                  <MapPin className="w-3 h-3 text-red-500" /> Google Maps
                </span>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className={`space-y-2.5 pt-2 border-t ${isDark ? 'border-[#5A5A40]/50' : 'border-[#E5E2D0]/60'}`}>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              {/* Primary: Abrir en Google Maps */}
              <a
                href={ceremonySearchUrl}
                target="_blank"
                rel="noopener noreferrer"
                className={`px-4 py-3 rounded-2xl text-xs font-semibold shadow-xs flex items-center justify-center gap-2 transition-all cursor-pointer ${
                  isDark
                    ? 'bg-[#C5A059] text-stone-950 hover:bg-[#d8b46d] font-bold'
                    : 'bg-[#5A5A40] hover:bg-[#484833] text-white'
                }`}
              >
                <Navigation className="w-4 h-4 shrink-0" />
                <span>Abrir en Google Maps</span>
              </a>

              {/* Route: Cómo Llegar */}
              <a
                href={ceremonyDirectionsUrl}
                target="_blank"
                rel="noopener noreferrer"
                className={`px-4 py-3 rounded-2xl text-xs font-semibold flex items-center justify-center gap-2 transition-all cursor-pointer border ${
                  isDark
                    ? 'bg-[#1F211D] hover:bg-[#282B25] text-stone-200 border-[#5A5A40]'
                    : 'bg-[#FAF9F0] hover:bg-[#F0EEDC] text-[#5A5A40] border-[#E5E2D0]'
                }`}
              >
                <Car className={`w-4 h-4 shrink-0 ${isDark ? 'text-[#C5A059]' : 'text-[#7D8C7A]'}`} />
                <span>Cómo Llegar (Ruta)</span>
              </a>
            </div>

            {/* Secondary actions: Waze & Copiar Dirección */}
            <div className="flex items-center justify-between gap-2 pt-1">
              <button
                type="button"
                onClick={() =>
                  handleCopy(
                    `${settings.ceremonyVenue} - ${settings.ceremonyAddress}`,
                    'ceremony-address'
                  )
                }
                className={`px-3 py-1.5 rounded-xl text-[11px] font-medium border flex items-center gap-1.5 transition-colors cursor-pointer ${
                  isDark
                    ? 'bg-[#1F211D] hover:bg-[#282B25] text-stone-300 border-[#5A5A40]'
                    : 'bg-stone-50 hover:bg-stone-100 text-stone-600 border-stone-200'
                }`}
              >
                {copiedType === 'ceremony-address' ? (
                  <>
                    <Check className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                    <span className="text-emerald-400 font-semibold">¡Dirección Copiada!</span>
                  </>
                ) : (
                  <>
                    <Copy className={`w-3.5 h-3.5 shrink-0 ${isDark ? 'text-stone-400' : 'text-stone-500'}`} />
                    <span>Copiar Dirección</span>
                  </>
                )}
              </button>

              <a
                href={ceremonyWazeUrl}
                target="_blank"
                rel="noopener noreferrer"
                className={`text-[11px] flex items-center gap-1 font-medium underline underline-offset-2 ${
                  isDark ? 'text-[#C5A059] hover:text-[#d8b46d]' : 'text-[#7D8C7A] hover:text-[#5A5A40]'
                }`}
              >
                <Compass className="w-3.5 h-3.5" />
                <span>Abrir en Waze</span>
              </a>
            </div>
          </div>
        </div>

        {/* ==================================================================== */}
        {/* CARD 2: RECEPCIÓN, BANQUETE & FIESTA */}
        {/* ==================================================================== */}
        <div className={`backdrop-blur-sm rounded-3xl p-6 sm:p-8 border shadow-sm hover:shadow-md transition-all flex flex-col justify-between ${
          isDark
            ? 'bg-[#282B25]/95 border-[#5A5A40]/60 text-[#FDFCF0]'
            : 'bg-white/95 border-[#E5E2D0] text-[#3D3D2C]'
        }`}>
          <div>
            <div className="flex items-center justify-between mb-4">
              <span className={`text-[11px] uppercase tracking-widest font-bold px-3 py-1 rounded-full border ${
                isDark
                  ? 'bg-[#1F211D] text-[#C5A059] border-[#5A5A40]'
                  : 'bg-[#FAF9F0] text-[#5A5A40] border-[#E5E2D0]'
              }`}>
                Paso 2 • Recepción & Banquete
              </span>
              <div className={`flex items-center gap-1.5 text-xs font-mono font-semibold ${
                isDark ? 'text-[#C5A059]' : 'text-[#5A5A40]'
              }`}>
                <Clock className="w-3.5 h-3.5" />
                <span>{settings.receptionTime || '19:30'} hrs</span>
              </div>
            </div>

            <h3 className={`text-2xl font-serif font-bold mb-2 ${
              isDark ? 'text-[#FDFCF0]' : 'text-[#3D3D2C]'
            }`}>
              {settings.receptionVenue || 'Hacienda Los Arcángeles'}
            </h3>

            <div className={`flex items-start gap-2 text-xs sm:text-sm mb-6 ${
              isDark ? 'text-stone-300' : 'text-stone-600'
            }`}>
              <MapPin className={`w-4 h-4 shrink-0 mt-0.5 ${isDark ? 'text-[#C5A059]' : 'text-[#7D8C7A]'}`} />
              <span>{settings.receptionAddress || 'Dirección de la recepción'}</span>
            </div>

            {/* Embedded Google Map */}
            <div className={`w-full h-56 sm:h-64 rounded-2xl overflow-hidden border shadow-inner mb-6 relative ${
              isDark ? 'bg-stone-900 border-[#5A5A40]' : 'bg-stone-100 border-[#E5E2D0]'
            }`}>
              <iframe
                title="Google Maps Recepción"
                width="100%"
                height="100%"
                frameBorder="0"
                scrolling="no"
                marginHeight={0}
                marginWidth={0}
                src={receptionEmbedUrl}
                className="w-full h-full border-0"
                loading="lazy"
              />
              <div className="absolute top-2 right-2 z-10">
                <span className="text-[10px] font-semibold bg-white/90 backdrop-blur-xs text-[#5A5A40] px-2 py-1 rounded-lg border border-[#E5E2D0] shadow-xs flex items-center gap-1">
                  <MapPin className="w-3 h-3 text-red-500" /> Google Maps
                </span>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className={`space-y-2.5 pt-2 border-t ${isDark ? 'border-[#5A5A40]/50' : 'border-[#E5E2D0]/60'}`}>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              {/* Primary: Abrir en Google Maps */}
              <a
                href={receptionSearchUrl}
                target="_blank"
                rel="noopener noreferrer"
                className={`px-4 py-3 rounded-2xl text-xs font-semibold shadow-xs flex items-center justify-center gap-2 transition-all cursor-pointer ${
                  isDark
                    ? 'bg-[#C5A059] text-stone-950 hover:bg-[#d8b46d] font-bold'
                    : 'bg-[#5A5A40] hover:bg-[#484833] text-white'
                }`}
              >
                <Navigation className="w-4 h-4 shrink-0" />
                <span>Abrir en Google Maps</span>
              </a>

              {/* Route: Cómo Llegar */}
              <a
                href={receptionDirectionsUrl}
                target="_blank"
                rel="noopener noreferrer"
                className={`px-4 py-3 rounded-2xl text-xs font-semibold flex items-center justify-center gap-2 transition-all cursor-pointer border ${
                  isDark
                    ? 'bg-[#1F211D] hover:bg-[#282B25] text-stone-200 border-[#5A5A40]'
                    : 'bg-[#FAF9F0] hover:bg-[#F0EEDC] text-[#5A5A40] border-[#E5E2D0]'
                }`}
              >
                <Car className={`w-4 h-4 shrink-0 ${isDark ? 'text-[#C5A059]' : 'text-[#7D8C7A]'}`} />
                <span>Cómo Llegar (Ruta)</span>
              </a>
            </div>

            {/* Secondary actions: Waze & Copiar Dirección */}
            <div className="flex items-center justify-between gap-2 pt-1">
              <button
                type="button"
                onClick={() =>
                  handleCopy(
                    `${settings.receptionVenue} - ${settings.receptionAddress}`,
                    'reception-address'
                  )
                }
                className={`px-3 py-1.5 rounded-xl text-[11px] font-medium border flex items-center gap-1.5 transition-colors cursor-pointer ${
                  isDark
                    ? 'bg-[#1F211D] hover:bg-[#282B25] text-stone-300 border-[#5A5A40]'
                    : 'bg-stone-50 hover:bg-stone-100 text-stone-600 border-stone-200'
                }`}
              >
                {copiedType === 'reception-address' ? (
                  <>
                    <Check className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                    <span className="text-emerald-400 font-semibold">¡Dirección Copiada!</span>
                  </>
                ) : (
                  <>
                    <Copy className={`w-3.5 h-3.5 shrink-0 ${isDark ? 'text-stone-400' : 'text-stone-500'}`} />
                    <span>Copiar Dirección</span>
                  </>
                )}
              </button>

              <a
                href={receptionWazeUrl}
                target="_blank"
                rel="noopener noreferrer"
                className={`text-[11px] flex items-center gap-1 font-medium underline underline-offset-2 ${
                  isDark ? 'text-[#C5A059] hover:text-[#d8b46d]' : 'text-[#7D8C7A] hover:text-[#5A5A40]'
                }`}
              >
                <Compass className="w-3.5 h-3.5" />
                <span>Abrir en Waze</span>
              </a>
            </div>
          </div>
        </div>
      </div>
      </motion.div>
    </section>
  );
};
