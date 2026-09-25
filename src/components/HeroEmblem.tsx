import React, { useId } from 'react';
import { motion } from 'motion/react';

interface HeroEmblemProps {
  cardStyle?: string;
  accentColor?: string;
  sparse?: boolean;
  quinceanera?: boolean;
  color?: string;
  glowIntensity?: number;
  sparkleIntensity?: number;
  scale?: number;
}

const mixHex = (color: string, target: string, amount: number) => {
  const parse = (value: string) => {
    const normalized = value.replace('#', '');
    const hex = normalized.length === 3
      ? normalized.split('').map((part) => part + part).join('')
      : normalized;
    return /^[\da-f]{6}$/i.test(hex)
      ? [0, 2, 4].map((index) => Number.parseInt(hex.slice(index, index + 2), 16))
      : null;
  };
  const from = parse(color);
  const to = parse(target);
  if (!from || !to) return color;
  return `#${from.map((channel, index) =>
    Math.round(channel + (to[index] - channel) * amount).toString(16).padStart(2, '0'),
  ).join('')}`;
};

const HERO_MOTIF_COLORS: Record<string, string> = {
  'romantic-floral': '#D77F91',
  'boho-chic': '#D78A58',
  'dark-luxury': '#E1BB69',
  'royal-navy': '#F0CD72',
  'terracotta-sunset': '#E4775A',
  'lavender-provence': '#A68ACD',
  'emerald-botanical': '#67C58C',
  'watercolor-garden': '#8EAD80',
  'coastal-breeze': '#65B2D1',
  'champagne-glam': '#D8B66E',
  'minimal-editorial': '#9B916D',
};

/** Shared, theme-reactive line-art emblem for wedding and quinceañera covers. */
export const HeroEmblem: React.FC<HeroEmblemProps> = ({
  cardStyle = 'classic-gold',
  accentColor = '#5A5A40',
  sparse = false,
  quinceanera = false,
  color = '',
  glowIntensity = 72,
  sparkleIntensity = 78,
  scale = 100,
}) => {
  const emblemId = useId().replace(/:/g, '');
  const ringGradientId = `hero-ring-metal-${emblemId}`;
  const ringGlowId = `hero-ring-glow-${emblemId}`;
  const accentGradientId = `hero-accent-metal-${emblemId}`;
  const accentGlowId = `hero-accent-glow-${emblemId}`;
  const safePercent = (value: number, fallback: number) => Number.isFinite(value)
    ? Math.max(0, Math.min(100, value))
    : fallback;
  const glow = safePercent(glowIntensity, 72) / 100;
  const sparkle = safePercent(sparkleIntensity, 78) / 100;
  const emblemScale = Math.max(70, Math.min(150, Number.isFinite(scale) ? scale : 100)) / 100;
  const hasCustomColor = /^#[\da-f]{3}(?:[\da-f]{3})?$/i.test(color);
  const motifColor = hasCustomColor
    ? color
    : mixHex(HERO_MOTIF_COLORS[cardStyle] || accentColor, accentColor, 0.2);
  const accentLight = mixHex(motifColor, '#FFFDF4', 0.64);
  const accentShade = mixHex(motifColor, '#171510', 0.28);
  const leafColor = mixHex('#83A783', accentColor, 0.24);
  const motifTint = mixHex(motifColor, '#FFFDF4', 0.45);
  const glowBlur = 4.4 * glow;
  const rootGlow = glow > 0 ? `drop-shadow(0 0 ${10 * glow}px ${accentLight})` : 'none';

  const common = {
    fill: 'none',
    stroke: `url(#${accentGradientId})`,
    strokeWidth: 3,
    strokeLinecap: 'round' as const,
    strokeLinejoin: 'round' as const,
    filter: `url(#${accentGlowId})`,
  };

  const usesWeddingRings = !quinceanera && (
    cardStyle === 'classic-gold'
    || cardStyle === 'wedding-rings'
    || ![
      'romantic-floral', 'boho-chic', 'dark-luxury', 'royal-navy',
      'terracotta-sunset', 'lavender-provence', 'emerald-botanical',
      'watercolor-garden', 'coastal-breeze', 'champagne-glam',
      'minimal-editorial', 'none',
    ].includes(cardStyle)
  );
  const centerX = usesWeddingRings ? 90 : 60;
  const centerY = usesWeddingRings ? 62 : 44;
  const contentTransform = `translate(${centerX} ${centerY}) scale(${emblemScale}) translate(${-centerX} ${-centerY})`;
  const ringGold = hasCustomColor ? mixHex(color, '#E6C66F', 0.42) : '#E6C66F';
  const ringGoldDark = hasCustomColor ? mixHex(color, '#9B7428', 0.5) : '#9B7428';
  const ringHighlight = hasCustomColor ? mixHex(color, '#FFF7D1', 0.72) : '#FFF7D1';

  const weddingRingsArtwork = (
    <>
      <defs>
        <linearGradient id={ringGradientId} x1="24" y1="23" x2="152" y2="104" gradientUnits="userSpaceOnUse">
          <stop stopColor={ringHighlight} />
          <stop offset="0.2" stopColor={ringGold} />
          <stop offset="0.42" stopColor={ringGoldDark} />
          <stop offset="0.62" stopColor={hasCustomColor ? mixHex(color, '#FFF1B3', 0.68) : '#FFF1B3'} />
          <stop offset="0.82" stopColor={hasCustomColor ? mixHex(color, '#C69A3A', 0.46) : '#C69A3A'} />
          <stop offset="1" stopColor={hasCustomColor ? ringHighlight : '#FFF9DF'} />
        </linearGradient>
        <filter id={ringGlowId} x="-30%" y="-45%" width="160%" height="190%" colorInterpolationFilters="sRGB">
          <feGaussianBlur stdDeviation={glowBlur} result="softGlow" />
          <feMerge>
            <feMergeNode in="softGlow" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
      </defs>
      <g stroke={`url(#${ringGradientId})`} strokeLinecap="round" strokeLinejoin="round" filter={`url(#${ringGlowId})`}>
        {/* Preserve Natural Olive's original interlocked rings and warm gold finish. */}
        <ellipse cx="69" cy="63" rx="39" ry="27" transform="rotate(-31 69 63)" strokeWidth="8" opacity="0.34" />
        <ellipse cx="111" cy="63" rx="39" ry="27" transform="rotate(31 111 63)" strokeWidth="8" opacity="0.34" />
        <ellipse cx="69" cy="63" rx="39" ry="27" transform="rotate(-31 69 63)" strokeWidth="5.2" />
        <ellipse cx="111" cy="63" rx="39" ry="27" transform="rotate(31 111 63)" strokeWidth="5.2" />
        <path d="M43 43c6-8 15-13 25-14" stroke="#FFFBE8" strokeWidth="1.8" opacity="0.9" />
        <path d="M112 97c10-1 19-6 25-14" stroke="#FFFBE8" strokeWidth="1.8" opacity="0.9" />
        <motion.path
          d="m89 22 2.4 6.2 6.2 2.4-6.2 2.4-2.4 6.2-2.4-6.2-6.2-2.4 6.2-2.4L89 22Z"
          fill={hasCustomColor ? mixHex(color, '#FFFDF4', 0.68) : '#FFF5C4'}
          stroke="none"
          opacity={sparkle}
          animate={{ opacity: [0.55 * sparkle, sparkle, 0.55 * sparkle], scale: [0.86, 1.12, 0.86] }}
          style={{ transformOrigin: '89px 31px' }}
          transition={{ duration: 2.8, repeat: Infinity, ease: 'easeInOut' }}
        />
      </g>
    </>
  );

  const artwork = (() => {
    switch (cardStyle) {
      case 'classic-gold':
      case 'wedding-rings':
        return quinceanera
          ? <g {...common}><path d="m32 61 5-24 15 13 8-24 10 24 15-13 5 24H32Z"/><path d="M38 68h44M45 74h30"/><circle cx="60" cy="25" r="3" fill={`url(#${accentGradientId})`}/></g>
          : weddingRingsArtwork;
      case 'romantic-floral':
        return <g {...common}>
          <path d="M60 74V42" />
          <path d="M60 57C47 54 42 45 41 36c11 1 18 7 19 21Z" fill={leafColor} fillOpacity="0.72" />
          <path d="M60 52c2-13 11-20 22-20 0 11-7 20-22 22Z" fill={leafColor} fillOpacity="0.58" />
          <path d="M60 42c-11-2-16-9-15-18 9 1 15 7 15 18Z" fill={leafColor} fillOpacity="0.58" />
          <path d="M60 39c2-10 9-15 18-14-1 9-7 14-18 16Z" fill={leafColor} fillOpacity="0.72" />
          <circle cx="60" cy="27" r="6.5" fill={motifTint} stroke={`url(#${accentGradientId})`} strokeWidth="2" />
          <circle cx="60" cy="27" r="2" fill={motifColor} stroke="none" />
        </g>;
      case 'boho-chic':
        return <g {...common}><circle cx="60" cy="39" r="13" fill={motifTint} fillOpacity="0.82"/><path d="M25 65a35 35 0 0 1 70 0M34 65a26 26 0 0 1 52 0M44 65a16 16 0 0 1 32 0"/><path d="M60 16v8m-27 3 6 6m48-6-6 6M22 48l9 2m67-2-9 2"/><circle cx="60" cy="65" r="3.5" fill={motifColor} stroke="none"/></g>;
      case 'dark-luxury':
      case 'royal-navy':
        return <g {...common}><path d="m34 61 5-27 18 15 13-21 12 33H34Z" fill={motifTint} fillOpacity="0.66"/><path d="M40 68h40M46 75h28"/><circle cx="39" cy="31" r="3.5" fill={motifColor} stroke="none"/><circle cx="70" cy="25" r="3.5" fill={motifTint} stroke="none"/><circle cx="82" cy="58" r="2.5" fill={motifColor} stroke="none"/></g>;
      case 'terracotta-sunset':
        return <g {...common}><circle cx="60" cy="39" r="16" fill={motifTint} fillOpacity="0.88"/><path d="M29 66c10-1 17-7 25-14 8 7 15 13 25 14 6 1 11 1 14 0M36 72h48M43 78h34"/><path d="M60 14v-5m-25 17-4-4m58 4 4-4"/></g>;
      case 'lavender-provence':
        return <g {...common}><path d="M60 74V39"/><path d="M60 54c-6-7-14-8-20-5 2 8 9 12 20 11m0-14c7-8 15-9 21-5-3 8-10 12-21 12" fill={leafColor} fillOpacity="0.58"/><path d="M60 39c-9-4-12-12-9-19 8 2 12 8 12 16 4-9 12-11 18-7-3 8-9 12-17 13" fill={motifTint} fillOpacity="0.82"/><circle cx="60" cy="37" r="4.5" fill={motifColor} stroke="none"/></g>;
      case 'emerald-botanical':
      case 'watercolor-garden':
        return <g {...common}>
          <path d="M36 73c16-12 29-28 46-51" />
          <path d="M44 64c-13 0-19-7-20-17 11-1 19 5 21 15Z" fill={leafColor} fillOpacity="0.75" />
          <path d="M49 52c0-12 7-19 17-20 2 11-4 19-15 22Z" fill={motifTint} fillOpacity="0.75" />
          <path d="M58 41c2-11 10-16 20-14 0 10-7 17-18 18Z" fill={leafColor} fillOpacity="0.82" />
          <path d="M40 78h36" />
        </g>;
      case 'coastal-breeze':
        return <g {...common}><circle cx="60" cy="30" r="8" fill={motifTint} fillOpacity="0.72"/><path d="M60 74V28m0 46L37 42m23 32 23-32M60 72 47 34m13 38 13-38M60 72 31 55m29 17 29-17"/><path d="M31 55a31 31 0 0 1 58 0M39 61h42"/><circle cx="60" cy="29" r="3" fill={motifColor} stroke="none"/></g>;
      case 'champagne-glam':
        return <g {...common}><path d="M32 73V43a28 28 0 0 1 56 0v30M41 73V45a19 19 0 0 1 38 0v28M50 73V47a10 10 0 0 1 20 0v26M28 77h64"/><circle cx="60" cy="32" r="4" fill={motifTint} stroke={`url(#${accentGradientId})`} strokeWidth="1.8"/></g>;
      case 'minimal-editorial':
        return <g {...common}><path d="M20 49h28m24 0h28"/><circle cx="60" cy="49" r="9" fill={motifTint} fillOpacity="0.72"/><path d="m56 49 3 3 6-7" strokeWidth="3.4"/></g>;
      case 'none':
        return null;
      default:
        return quinceanera
          ? <g {...common}><path d="m32 61 5-24 15 13 8-24 10 24 15-13 5 24H32Z"/><path d="M38 68h44M45 74h30"/><circle cx="60" cy="25" r="3" fill={`url(#${accentGradientId})`}/></g>
          : weddingRingsArtwork;
    }
  })();

  if (!artwork) return null;

  return (
    <motion.svg
      viewBox={usesWeddingRings ? '0 0 180 124' : '0 0 120 88'}
      data-hero-emblem="true"
      className={sparse
        ? 'mx-auto h-[clamp(5.5rem,21vw,8rem)] w-[clamp(8rem,34vw,12rem)] overflow-visible drop-shadow-[0_0_18px_rgba(246,211,120,0.6)] sm:h-32 sm:w-48 md:h-36 md:w-56'
        : 'mx-auto h-[clamp(4.5rem,17vw,6.5rem)] w-[clamp(7rem,28vw,10rem)] overflow-visible drop-shadow-[0_0_14px_rgba(246,211,120,0.42)] sm:h-24 sm:w-40 md:h-28 md:w-44'}
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
      style={{ filter: rootGlow }}
      initial={{ opacity: 0, y: 5, scale: 0.94 }}
      animate={{ opacity: 1, y: [0, -2, 0], scale: [1, 1.015, 1] }}
      transition={{ opacity: { duration: 0.5 }, scale: { duration: 3.6, repeat: Infinity, ease: 'easeInOut' }, y: { duration: 4, repeat: Infinity, ease: 'easeInOut' } }}
    >
      <defs>
        <linearGradient id={accentGradientId} x1="0" y1="0" x2="1" y2="1" gradientUnits="objectBoundingBox">
          <stop stopColor="#FFFDF4" />
          <stop offset="0.2" stopColor={accentLight} />
          <stop offset="0.48" stopColor={motifColor} />
          <stop offset="0.7" stopColor={accentShade} />
          <stop offset="0.88" stopColor={accentLight} />
          <stop offset="1" stopColor="#FFFDF4" />
        </linearGradient>
        <filter id={accentGlowId} x="-45%" y="-45%" width="190%" height="190%" colorInterpolationFilters="sRGB">
          <feGaussianBlur in="SourceGraphic" stdDeviation={glowBlur} result="softGlow" />
          <feComponentTransfer in="softGlow" result="brightGlow">
            <feFuncA type="linear" slope={0.8 + glow * 1.2} />
          </feComponentTransfer>
          <feMerge>
            <feMergeNode in="brightGlow" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
      </defs>
      <g transform={contentTransform}>
        {usesWeddingRings ? artwork : <g transform="translate(-12 -9) scale(1.2)">{artwork}</g>}
        {!usesWeddingRings && (
          <g aria-hidden="true">
          <motion.path
            d="m101 10 2.1 5.3 5.3 2.1-5.3 2.1-2.1 5.3-2.1-5.3-5.3-2.1 5.3-2.1 2.1-5.3Z"
            fill="#FFFDF4"
            stroke="none"
            animate={{ opacity: [0.35 * sparkle, sparkle, 0.35 * sparkle], scale: [0.72, 1.08, 0.72] }}
            style={{ transformOrigin: '101px 17px' }}
            transition={{ duration: 2.8, repeat: Infinity, ease: 'easeInOut' }}
          />
          <motion.circle
            cx="20"
            cy="70"
            r="1.8"
            fill={accentLight}
            animate={{ opacity: [0.3 * sparkle, 0.95 * sparkle, 0.3 * sparkle], scale: [0.7, 1.15, 0.7] }}
            style={{ transformOrigin: '20px 70px' }}
            transition={{ duration: 3.4, repeat: Infinity, ease: 'easeInOut', delay: 0.8 }}
          />
          </g>
        )}
      </g>
    </motion.svg>
  );
};
