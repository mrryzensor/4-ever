import React from 'react';
import { motion } from 'motion/react';
import { CardThemeConfig, EventType, WeddingSettings } from '../types.ts';
import { getThemeDisplayFontFamily } from '../lib/rsvpButtonStyle.ts';

interface HeroCourtCardProps {
  settings: WeddingSettings;
  theme: CardThemeConfig;
  eventType?: EventType;
  compact?: boolean;
  fullPage?: boolean;
}

export const HeroCourtCard: React.FC<HeroCourtCardProps> = ({
  settings,
  theme,
  eventType,
  compact = false,
  fullPage = false,
}) => {
  const isXv = (eventType || settings.eventType) === 'xv';
  const courtItems = [
    settings.heroShowBrideParents && settings.heroBrideParents?.trim()
      ? {
          title: settings.heroBrideParentsTitle?.trim() || (isXv ? 'Mis padres' : 'Padres de la Novia'),
          names: settings.heroBrideParents.trim(),
        }
      : null,
    settings.heroShowGroomParents && settings.heroGroomParents?.trim()
      ? {
          title: settings.heroGroomParentsTitle?.trim() || (isXv ? 'Padres de la quinceañera' : 'Padres del Novio'),
          names: settings.heroGroomParents.trim(),
        }
      : null,
    settings.heroShowPadrinos && settings.heroPadrinos?.trim()
      ? {
          title: settings.heroPadrinosTitle?.trim() || (isXv ? 'Mis Padrinos' : 'Nuestros Padrinos'),
          names: settings.heroPadrinos.trim(),
        }
      : null,
    settings.heroShowWitnesses && settings.heroWitnesses?.trim()
      ? {
          title: settings.heroWitnessesTitle?.trim() || (isXv ? 'Mis Testigos' : 'Testigos'),
          names: settings.heroWitnesses.trim(),
        }
      : null,
  ].filter((item): item is { title: string; names: string } => Boolean(item));

  if (courtItems.length === 0) return null;

  const title = settings.heroCourtTitle?.trim() || (
    isXv ? 'Con la bendición de mi familia' : 'Con la bendición de Dios y de nuestras familias'
  );
  const pageHeading = settings.heroCourtPageHeading?.trim() || (
    isXv ? 'Con quienes celebramos mis XV' : 'Con quienes celebramos este día'
  );
  const displayFontFamily = getThemeDisplayFontFamily(theme.fontDisplay);
  const spacing = compact ? 'my-2 px-3 py-2' : 'my-3 sm:my-4 px-4 py-3 sm:px-6 sm:py-4';
  const titleSize = compact ? 'text-[8px]' : 'text-[9px] sm:text-xs';
  const nameSize = compact ? 'text-[10px]' : 'text-xs sm:text-sm md:text-base';
  const fullPageGridColumns = courtItems.length === 1
    ? 'xl:grid-cols-1'
    : courtItems.length === 2
      ? 'xl:grid-cols-2'
      : courtItems.length === 3
        ? 'xl:grid-cols-3'
        : 'xl:grid-cols-4';

  return (
    <motion.div
      initial={{ opacity: 0, y: compact ? 4 : 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: compact ? 0.45 : 0.85, delay: compact ? 0 : 0.28 }}
      aria-label={title}
      className={`relative isolate mx-auto w-full text-center ${fullPage ? 'flex min-h-[76vh] max-w-[1600px] flex-col justify-center px-1 py-10 sm:px-5 sm:py-12' : `max-w-xl ${spacing} ${theme.cardBgClass} ${theme.cardShapeClass || 'rounded-2xl border'} ${theme.cardBorderDecoration || 'shadow-xl'}`} ${theme.fontBody}`}
    >
      {fullPage ? (
        <div className="relative z-10 mx-auto w-full">
          <p className="mb-3 text-xs font-semibold uppercase tracking-[0.35em]" style={{ color: theme.accentColorHex }}>
            {isXv ? 'Familia y padrinos de honor' : 'Familia y cortejo de honor'}
          </p>
          <h2 style={{ fontFamily: displayFontFamily }} className={`mx-auto max-w-5xl text-4xl leading-tight sm:text-5xl md:text-6xl lg:text-7xl ${theme.textPrimaryClass} ${theme.fontDisplay}`}>
            {pageHeading}
          </h2>
          <p className={`mx-auto mt-4 max-w-3xl text-lg font-medium italic sm:text-xl ${theme.textSecondaryClass} ${theme.fontBody}`}>
            {title}
          </p>
          <div className={`mx-auto mt-8 grid w-full max-w-[1500px] gap-4 sm:mt-10 sm:gap-5 ${courtItems.length === 1 ? 'grid-cols-1' : 'grid-cols-1 sm:grid-cols-2'} ${fullPageGridColumns}`}>
            {courtItems.map((item, index) => (
              <article
                key={`${item.title}-${index}`}
                className={`flex min-h-44 flex-col items-center justify-center rounded-3xl border px-5 py-7 shadow-lg sm:min-h-56 sm:px-7 sm:py-9 md:min-h-64 md:px-9 ${theme.cardBgClass} ${theme.cardShapeClass || 'rounded-3xl'} ${theme.cardBorderDecoration || ''}`}
                style={{ borderColor: `${theme.accentColorHex}66` }}
              >
                <span className="text-sm font-semibold uppercase tracking-[0.14em] sm:text-sm sm:tracking-[0.22em]" style={{ color: theme.accentColorHex }}>
                  {item.title}
                </span>
                <p data-typography-role="heading" style={{ fontFamily: displayFontFamily }} className={`mt-3 break-words text-2xl font-medium italic leading-snug sm:text-3xl md:text-4xl lg:text-5xl ${theme.textPrimaryClass} ${theme.fontDisplay}`}>
                  {item.names}
                </p>
              </article>
            ))}
          </div>
        </div>
      ) : (
        <div className="relative z-10">
          <span
            className={`mx-auto mb-2 inline-flex max-w-full items-center justify-center gap-2 px-3 py-1.5 uppercase tracking-[0.2em] ${titleSize} ${
              theme.cardHeaderShapeClass || 'rounded-full border'
            }`}
          >
            <span aria-hidden="true" style={{ color: theme.accentColorHex }}>✦</span>
            <span>{title}</span>
            <span aria-hidden="true" style={{ color: theme.accentColorHex }}>✦</span>
          </span>

          <div className={`grid grid-cols-1 sm:grid-cols-2 ${compact ? 'gap-1' : 'gap-2 sm:gap-3'}`}>
            {courtItems.map((item, index) => {
              const isAloneOnRow = courtItems.length % 2 !== 0 && index === courtItems.length - 1;

              return (
                <div
                  key={`${item.title}-${index}`}
                  className={`min-w-0 px-2 ${compact ? 'py-1' : 'py-1.5'} ${
                    isAloneOnRow ? 'sm:col-span-2 sm:mx-auto sm:w-2/3' : ''
                  } ${index > 1 ? 'border-t sm:border-t-0' : ''}`}
                  style={{ borderColor: `${theme.accentColorHex}55` }}
                >
                  <span
                    className={`block uppercase tracking-[0.14em] ${compact ? 'text-[7px]' : 'text-[9px] sm:text-[10px]'} ${theme.textSecondaryClass}`}
                    style={{ color: theme.accentColorHex }}
                  >
                    {item.title}
                  </span>
                  <p data-typography-role="heading" style={{ fontFamily: displayFontFamily }} className={`mt-0.5 break-words font-medium italic leading-snug ${nameSize} ${theme.textPrimaryClass} ${theme.fontDisplay}`}>
                    {item.names}
                  </p>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {theme.cardLayoutVariant === 'royal-crest' && (
        <span
          aria-hidden="true"
          className="pointer-events-none absolute left-1/2 top-0 h-1 w-1 -translate-x-1/2 -translate-y-1/2 rotate-45"
          style={{ backgroundColor: theme.accentColorHex }}
        />
      )}
      {theme.cardLayoutVariant === 'artdeco-plaque' && (
        <span
          aria-hidden="true"
          className="pointer-events-none absolute inset-1 border border-current opacity-20"
        />
      )}
    </motion.div>
  );
};
