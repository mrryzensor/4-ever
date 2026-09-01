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
import { WeddingSettings } from '../types.ts';
import { StyleSpecificDivider } from './AnimatedSvgs.tsx';
import { CARD_THEMES } from '../lib/themes.ts';

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

  return (
    <section className="w-full px-4 sm:px-8 md:px-12 lg:px-16 py-10 sm:py-14 bg-transparent" id="ubicaciones">
      {/* Section Title Header */}
      <div className="max-w-4xl mx-auto text-center mb-10 sm:mb-12">
        <div className="w-14 h-14 rounded-2xl bg-[#5A5A40]/10 text-[#5A5A40] flex items-center justify-center mx-auto mb-3 border border-[#E5E2D0]">
          <MapPin className="w-7 h-7 shrink-0 text-[#5A5A40]" />
        </div>
        <span className="text-xs uppercase tracking-[0.3em] font-semibold text-[#7D8C7A] block mb-2">
          Ubicaciones & Cómo Llegar
        </span>
        <h2 className="text-3xl sm:text-5xl font-serif text-[#3D3D2C] font-normal">
          Lugares de la Celebración
        </h2>
        <StyleSpecificDivider
          cardStyle={settings.cardStyle}
          className="w-48 sm:w-60 h-8 mx-auto mt-2"
          color={CARD_THEMES[settings.cardStyle]?.accentColorHex}
        />
        <p className="text-sm text-stone-600 max-w-xl mx-auto mt-1 leading-relaxed">
          Te facilitamos los mapas interactivos y rutas guiadas por Google Maps para acompañarnos puntualmente en cada momento.
        </p>
      </div>

      {/* Main Grid: Ceremonia & Recepción Cards with Google Maps */}
      <div className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* ==================================================================== */}
        {/* CARD 1: CEREMONIA RELIGIOSA / CIVIL */}
        {/* ==================================================================== */}
        <div className="bg-white/95 backdrop-blur-sm rounded-3xl p-6 sm:p-8 border border-[#E5E2D0] shadow-sm hover:shadow-md transition-all flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4">
              <span className="text-[11px] uppercase tracking-widest font-bold text-[#5A5A40] bg-[#FAF9F0] px-3 py-1 rounded-full border border-[#E5E2D0]">
                Paso 1 • Ceremonia
              </span>
              <div className="flex items-center gap-1.5 text-xs font-mono font-semibold text-[#5A5A40]">
                <Clock className="w-3.5 h-3.5" />
                <span>{settings.ceremonyTime || '17:00'} hrs</span>
              </div>
            </div>

            <h3 className="text-2xl font-serif font-bold text-[#3D3D2C] mb-2">
              {settings.ceremonyVenue || 'Parroquia San Francisco de Asís'}
            </h3>

            <div className="flex items-start gap-2 text-stone-600 text-xs sm:text-sm mb-6">
              <MapPin className="w-4 h-4 text-[#7D8C7A] shrink-0 mt-0.5" />
              <span>{settings.ceremonyAddress || 'Dirección de la ceremonia'}</span>
            </div>

            {/* Embedded Google Map */}
            <div className="w-full h-56 sm:h-64 rounded-2xl overflow-hidden border border-[#E5E2D0] shadow-inner mb-6 relative bg-stone-100">
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
          <div className="space-y-2.5 pt-2 border-t border-[#E5E2D0]/60">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              {/* Primary: Abrir en Google Maps */}
              <a
                href={ceremonySearchUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="px-4 py-3 rounded-2xl bg-[#5A5A40] hover:bg-[#484833] text-white text-xs font-semibold shadow-xs flex items-center justify-center gap-2 transition-all cursor-pointer"
              >
                <Navigation className="w-4 h-4 shrink-0" />
                <span>Abrir en Google Maps</span>
              </a>

              {/* Route: Cómo Llegar */}
              <a
                href={ceremonyDirectionsUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="px-4 py-3 rounded-2xl bg-[#FAF9F0] hover:bg-[#F0EEDC] text-[#5A5A40] border border-[#E5E2D0] text-xs font-semibold flex items-center justify-center gap-2 transition-all cursor-pointer"
              >
                <Car className="w-4 h-4 text-[#7D8C7A] shrink-0" />
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
                className="px-3 py-1.5 rounded-xl bg-stone-50 hover:bg-stone-100 text-stone-600 text-[11px] font-medium border border-stone-200 flex items-center gap-1.5 transition-colors cursor-pointer"
              >
                {copiedType === 'ceremony-address' ? (
                  <>
                    <Check className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                    <span className="text-emerald-700 font-semibold">¡Dirección Copiada!</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-3.5 h-3.5 text-stone-500 shrink-0" />
                    <span>Copiar Dirección</span>
                  </>
                )}
              </button>

              <a
                href={ceremonyWazeUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="text-[11px] text-[#7D8C7A] hover:text-[#5A5A40] flex items-center gap-1 font-medium underline underline-offset-2"
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
        <div className="bg-white/95 backdrop-blur-sm rounded-3xl p-6 sm:p-8 border border-[#E5E2D0] shadow-sm hover:shadow-md transition-all flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4">
              <span className="text-[11px] uppercase tracking-widest font-bold text-[#5A5A40] bg-[#FAF9F0] px-3 py-1 rounded-full border border-[#E5E2D0]">
                Paso 2 • Recepción & Banquete
              </span>
              <div className="flex items-center gap-1.5 text-xs font-mono font-semibold text-[#5A5A40]">
                <Clock className="w-3.5 h-3.5" />
                <span>{settings.receptionTime || '19:30'} hrs</span>
              </div>
            </div>

            <h3 className="text-2xl font-serif font-bold text-[#3D3D2C] mb-2">
              {settings.receptionVenue || 'Hacienda Los Arcángeles'}
            </h3>

            <div className="flex items-start gap-2 text-stone-600 text-xs sm:text-sm mb-6">
              <MapPin className="w-4 h-4 text-[#7D8C7A] shrink-0 mt-0.5" />
              <span>{settings.receptionAddress || 'Dirección de la recepción'}</span>
            </div>

            {/* Embedded Google Map */}
            <div className="w-full h-56 sm:h-64 rounded-2xl overflow-hidden border border-[#E5E2D0] shadow-inner mb-6 relative bg-stone-100">
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
          <div className="space-y-2.5 pt-2 border-t border-[#E5E2D0]/60">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              {/* Primary: Abrir en Google Maps */}
              <a
                href={receptionSearchUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="px-4 py-3 rounded-2xl bg-[#5A5A40] hover:bg-[#484833] text-white text-xs font-semibold shadow-xs flex items-center justify-center gap-2 transition-all cursor-pointer"
              >
                <Navigation className="w-4 h-4 shrink-0" />
                <span>Abrir en Google Maps</span>
              </a>

              {/* Route: Cómo Llegar */}
              <a
                href={receptionDirectionsUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="px-4 py-3 rounded-2xl bg-[#FAF9F0] hover:bg-[#F0EEDC] text-[#5A5A40] border border-[#E5E2D0] text-xs font-semibold flex items-center justify-center gap-2 transition-all cursor-pointer"
              >
                <Car className="w-4 h-4 text-[#7D8C7A] shrink-0" />
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
                className="px-3 py-1.5 rounded-xl bg-stone-50 hover:bg-stone-100 text-stone-600 text-[11px] font-medium border border-stone-200 flex items-center gap-1.5 transition-colors cursor-pointer"
              >
                {copiedType === 'reception-address' ? (
                  <>
                    <Check className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                    <span className="text-emerald-700 font-semibold">¡Dirección Copiada!</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-3.5 h-3.5 text-stone-500 shrink-0" />
                    <span>Copiar Dirección</span>
                  </>
                )}
              </button>

              <a
                href={receptionWazeUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="text-[11px] text-[#7D8C7A] hover:text-[#5A5A40] flex items-center gap-1 font-medium underline underline-offset-2"
              >
                <Compass className="w-3.5 h-3.5" />
                <span>Abrir en Waze</span>
              </a>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
