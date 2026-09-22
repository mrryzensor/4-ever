import React from 'react';
import { motion } from 'motion/react';
import { CardThemeConfig, EventType, WeddingSettings } from '../types.ts';

interface HeroCourtCardProps {
  settings: WeddingSettings;
  theme: CardThemeConfig;
  eventType?: EventType;
  compact?: boolean;
}

export const HeroCourtCard: React.FC<HeroCourtCardProps> = ({
  settings,
  theme,
  eventType,
  compact = false,
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
  const spacing = compact ? 'my-2 px-3 py-2' : 'my-3 sm:my-4 px-4 py-3 sm:px-6 sm:py-4';
  const titleSize = compact ? 'text-[8px]' : 'text-[9px] sm:text-xs';
  const nameSize = compact ? 'text-[10px]' : 'text-xs sm:text-sm md:text-base';

  return (
    <motion.div
      initial={{ opacity: 0, y: compact ? 4 : 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: compact ? 0.45 : 0.85, delay: compact ? 0 : 0.28 }}
      aria-label={title}
      className={`relative isolate mx-auto w-full max-w-xl text-center ${spacing} ${
        theme.cardBgClass
      } ${theme.cardShapeClass || 'rounded-2xl border'} ${theme.cardBorderDecoration || 'shadow-xl'} ${
        theme.fontBody
      }`}
    >
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
                <p className={`mt-0.5 break-words font-medium italic leading-snug ${nameSize} ${theme.textPrimaryClass}`}>
                  {item.names}
                </p>
              </div>
            );
          })}
        </div>
      </div>

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
