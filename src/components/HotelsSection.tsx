import React from 'react';
import { Building2, ExternalLink, MapPin, Phone } from 'lucide-react';
import { CardThemeConfig, EventType, HotelRecommendation, WeddingSettings } from '../types.ts';
import { CARD_THEMES } from '../lib/themes.ts';
import { XV_CARD_THEMES } from '../xv/themes.ts';
import { StyleSpecificDivider } from './AnimatedSvgs.tsx';

interface HotelsSectionProps {
  settings: WeddingSettings;
  eventType: EventType;
}

const parseHotels = (value?: string): HotelRecommendation[] => {
  try {
    const parsed = value ? JSON.parse(value) : [];
    return Array.isArray(parsed)
      ? parsed.filter((hotel): hotel is HotelRecommendation => Boolean(
          hotel && typeof hotel === 'object' && typeof hotel.name === 'string' && hotel.name.trim(),
        ))
      : [];
  } catch {
    return [];
  }
};

const safeWebUrl = (value?: string) => {
  if (!value) return undefined;
  try {
    const url = new URL(value);
    return url.protocol === 'https:' || url.protocol === 'http:' ? url.toString() : undefined;
  } catch {
    return undefined;
  }
};

export const HotelsSection: React.FC<HotelsSectionProps> = ({ settings, eventType }) => {
  if (settings.showHotels !== true) return null;

  const hotels = parseHotels(settings.hotelRecommendations);
  if (hotels.length === 0) return null;

  const theme: CardThemeConfig = eventType === 'xv'
    ? (XV_CARD_THEMES[settings.cardStyle] || XV_CARD_THEMES['romantic-floral'])
    : (CARD_THEMES[settings.cardStyle] || CARD_THEMES['classic-gold']);
  const darkStyles = ['dark-luxury', 'royal-navy', 'emerald-botanical'];
  const palette = settings.colorPaletteStyle && settings.colorPaletteStyle !== 'auto'
    ? settings.colorPaletteStyle
    : settings.cardStyle;
  const isDark = darkStyles.includes(palette);

  return (
    <section id="hoteles" className="w-full px-4 py-12 sm:px-8 sm:py-16 lg:px-12" style={{ backgroundColor: theme.bgHex }}>
      <div className="mx-auto w-full max-w-6xl">
        <header className="mb-8 text-center sm:mb-10">
          <div className={`mx-auto mb-3 flex h-14 w-14 items-center justify-center rounded-2xl border ${theme.accentClass}`}>
            <Building2 className="h-7 w-7" />
          </div>
          <span className="block text-xs font-semibold uppercase tracking-[0.3em]" style={{ color: theme.accentColorHex }}>
            Alojamiento
          </span>
          <h2 className={`mt-2 font-serif text-3xl sm:text-5xl ${theme.textPrimaryClass} ${theme.fontDisplay}`}>
            {settings.hotelsTitle?.trim() || 'Hospedaje recomendado'}
          </h2>
          <StyleSpecificDivider cardStyle={settings.cardStyle} className="mx-auto mt-3 h-8 w-52" color={theme.accentColorHex} />
          <p className={`mx-auto mt-2 max-w-2xl text-sm sm:text-base ${isDark ? 'text-stone-300' : 'text-stone-600'}`}>
            Opciones de hospedaje cercanas para acompañarnos y disfrutar de la celebración.
          </p>
        </header>

        <div className="flex flex-wrap justify-center gap-4">
          {hotels.map((hotel, index) => (
            <article
              key={`${hotel.name}-${index}`}
              className={`w-full sm:w-[calc(50%-0.5rem)] lg:w-[calc(33.333333%-0.667rem)] flex h-full flex-col rounded-3xl border p-5 shadow-sm ${theme.cardBgClass} ${theme.cardShapeClass || 'rounded-3xl'} ${theme.cardBorderDecoration || ''}`}
            >
              <div className="mb-4 flex items-start gap-3">
                <div className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl border ${theme.cardHeaderShapeClass || theme.accentClass}`}>
                  <Building2 className="h-5 w-5" style={{ color: theme.accentColorHex }} />
                </div>
                <h3 className={`pt-1 font-serif text-xl font-semibold ${theme.textPrimaryClass}`}>{hotel.name}</h3>
              </div>

              {hotel.address && (
                <p className={`mb-2 flex items-start gap-2 text-sm ${isDark ? 'text-stone-200' : 'text-stone-600'}`}>
                  <MapPin className="mt-0.5 h-4 w-4 shrink-0" style={{ color: theme.accentColorHex }} />
                  <span>{hotel.address}</span>
                </p>
              )}
              {hotel.notes && <p className={`mb-4 text-sm italic ${isDark ? 'text-stone-300' : 'text-stone-600'}`}>{hotel.notes}</p>}

              <div className="mt-auto flex flex-wrap gap-2 pt-3">
                {safeWebUrl(hotel.mapsUrl) && (
                  <a href={safeWebUrl(hotel.mapsUrl)} target="_blank" rel="noreferrer" className={`inline-flex cursor-pointer items-center gap-1.5 rounded-xl border px-3 py-2 text-xs font-semibold ${theme.accentClass}`}>
                    <MapPin className="h-3.5 w-3.5" /> Ver mapa
                  </a>
                )}
                {safeWebUrl(hotel.bookingUrl) && (
                  <a href={safeWebUrl(hotel.bookingUrl)} target="_blank" rel="noreferrer" className={`inline-flex cursor-pointer items-center gap-1.5 rounded-xl border px-3 py-2 text-xs font-semibold ${theme.accentClass}`}>
                    <ExternalLink className="h-3.5 w-3.5" /> Reservar
                  </a>
                )}
                {hotel.phone && (
                  <a href={`tel:${hotel.phone}`} className={`inline-flex cursor-pointer items-center gap-1.5 rounded-xl border px-3 py-2 text-xs font-semibold ${theme.accentClass}`}>
                    <Phone className="h-3.5 w-3.5" /> Llamar
                  </a>
                )}
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
};
