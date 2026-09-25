import React, { useId } from 'react';
import { motion } from 'motion/react';

interface HeroEmblemProps {
  cardStyle?: string;
  accentColor?: string;
  sparse?: boolean;
  quinceanera?: boolean;
}

/** Lightweight, shared line-art emblem used on wedding and quinceañera covers. */
export const HeroEmblem: React.FC<HeroEmblemProps> = ({
  cardStyle = 'classic-gold',
  accentColor = '#C5A059',
  sparse = false,
  quinceanera = false,
}) => {
  const emblemId = useId().replace(/:/g, '');
  const ringGradientId = `hero-ring-metal-${emblemId}`;
  const ringGlowId = `hero-ring-glow-${emblemId}`;

  const common = {
    fill: 'none',
    stroke: accentColor,
    strokeWidth: 1.7,
    strokeLinecap: 'round' as const,
    strokeLinejoin: 'round' as const,
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

  const weddingRingsArtwork = (
    <>
      <defs>
        <linearGradient id={ringGradientId} x1="24" y1="23" x2="152" y2="104" gradientUnits="userSpaceOnUse">
          <stop stopColor="#FFF7D1" />
          <stop offset="0.2" stopColor="#E6C66F" />
          <stop offset="0.42" stopColor="#9B7428" />
          <stop offset="0.62" stopColor="#FFF1B3" />
          <stop offset="0.82" stopColor="#C69A3A" />
          <stop offset="1" stopColor="#FFF9DF" />
        </linearGradient>
        <filter id={ringGlowId} x="-30%" y="-45%" width="160%" height="190%" colorInterpolationFilters="sRGB">
          <feGaussianBlur stdDeviation="3.2" result="softGlow" />
          <feMerge>
            <feMergeNode in="softGlow" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
      </defs>
      <g stroke={`url(#${ringGradientId})`} strokeLinecap="round" strokeLinejoin="round" filter={`url(#${ringGlowId})`}>
        {/* The Natural Olive wedding mark: two bright, interlocked wedding bands. */}
        <ellipse cx="69" cy="63" rx="39" ry="27" transform="rotate(-31 69 63)" strokeWidth="8" opacity="0.34" />
        <ellipse cx="111" cy="63" rx="39" ry="27" transform="rotate(31 111 63)" strokeWidth="8" opacity="0.34" />
        <ellipse cx="69" cy="63" rx="39" ry="27" transform="rotate(-31 69 63)" strokeWidth="5.2" />
        <ellipse cx="111" cy="63" rx="39" ry="27" transform="rotate(31 111 63)" strokeWidth="5.2" />
        <path d="M43 43c6-8 15-13 25-14" stroke="#FFFBE8" strokeWidth="1.8" opacity="0.9" />
        <path d="M112 97c10-1 19-6 25-14" stroke="#FFFBE8" strokeWidth="1.8" opacity="0.9" />
        <path d="m89 22 2.4 6.2 6.2 2.4-6.2 2.4-2.4 6.2-2.4-6.2-6.2-2.4 6.2-2.4L89 22Z" fill="#FFF5C4" stroke="none" />
      </g>
    </>
  );

  const artwork = (() => {
    switch (cardStyle) {
      case 'classic-gold':
      case 'wedding-rings':
        return quinceanera
          ? <g {...common}><path d="m32 61 5-24 15 13 8-24 10 24 15-13 5 24H32Z"/><path d="M38 68h44M45 74h30"/><circle cx="60" cy="25" r="3" fill={accentColor}/></g>
          : weddingRingsArtwork;
      case 'romantic-floral':
        return <g {...common}><path d="M60 74V43m0 13C47 54 42 45 41 36c12 1 19 7 19 20Zm0-8c2-13 11-20 22-20 0 11-7 20-22 22Z"/><path d="M60 40c-11-2-16-9-15-18 9 1 15 7 15 18Zm0-3c2-10 9-15 18-14-1 9-7 14-18 16Z"/><circle cx="60" cy="28" r="5"/></g>;
      case 'boho-chic':
        return <g {...common}><path d="M25 65a35 35 0 0 1 70 0M34 65a26 26 0 0 1 52 0M44 65a16 16 0 0 1 32 0"/><path d="M60 16v8m-27 3 6 6m48-6-6 6M22 48l9 2m67-2-9 2"/><circle cx="60" cy="65" r="3" fill={accentColor}/></g>;
      case 'dark-luxury':
      case 'royal-navy':
        return <g {...common}><path d="m34 61 5-27 18 15 13-21 12 33H34Z"/><path d="M40 68h40M46 75h28"/><circle cx="39" cy="31" r="3" fill={accentColor}/><circle cx="70" cy="25" r="3" fill={accentColor}/><circle cx="82" cy="58" r="2" fill={accentColor}/></g>;
      case 'terracotta-sunset':
        return <g {...common}><circle cx="60" cy="39" r="16"/><path d="M29 66c10-1 17-7 25-14 8 7 15 13 25 14 6 1 11 1 14 0M36 72h48M43 78h34"/><path d="M60 14v-5m-25 17-4-4m58 4 4-4"/></g>;
      case 'lavender-provence':
        return <g {...common}><path d="M60 74V39m0 12c-6-7-14-8-20-5 2 8 9 12 20 11m0-14c7-8 15-9 21-5-3 8-10 12-21 12"/><path d="M60 39c-9-4-12-12-9-19 8 2 12 8 12 16 4-9 12-11 18-7-3 8-9 12-17 13"/><circle cx="60" cy="37" r="4"/></g>;
      case 'emerald-botanical':
      case 'watercolor-garden':
        return <g {...common}><path d="M36 73c16-12 29-28 46-51M44 64c-13 0-19-7-20-17 11-1 19 5 21 15m4-10c0-12 7-19 17-20 2 11-4 19-15 22m4-11c2-11 10-16 20-14 0 10-7 17-18 18m-20 33h36"/></g>;
      case 'coastal-breeze':
        return <g {...common}><path d="M60 74V28m0 46L37 42m23 32 23-32M60 72 47 34m13 38 13-38M60 72 31 55m29 17 29-17"/><path d="M31 55a31 31 0 0 1 58 0M39 61h42"/><circle cx="60" cy="29" r="3" fill={accentColor}/></g>;
      case 'champagne-glam':
        return <g {...common}><path d="M32 73V43a28 28 0 0 1 56 0v30M41 73V45a19 19 0 0 1 38 0v28M50 73V47a10 10 0 0 1 20 0v26M28 77h64"/><circle cx="60" cy="32" r="2.5" fill={accentColor}/></g>;
      case 'minimal-editorial':
        return <g {...common}><path d="M20 49h28m24 0h28"/><circle cx="60" cy="49" r="8"/><path d="m56 49 3 3 6-7"/></g>;
      case 'none':
        return null;
      default:
        return quinceanera
          ? <g {...common}><path d="m32 61 5-24 15 13 8-24 10 24 15-13 5 24H32Z"/><path d="M38 68h44M45 74h30"/><circle cx="60" cy="25" r="3" fill={accentColor}/></g>
          : weddingRingsArtwork;
    }
  })();

  return (
    <motion.svg
      viewBox={usesWeddingRings ? '0 0 180 124' : '0 0 120 88'}
      data-hero-emblem="true"
      className={sparse
        ? usesWeddingRings
          ? 'mx-auto h-[clamp(5.5rem,21vw,8rem)] w-[clamp(8rem,34vw,12rem)] overflow-visible drop-shadow-[0_0_18px_rgba(246,211,120,0.6)] sm:h-32 sm:w-48 md:h-36 md:w-56'
          : 'mx-auto h-[clamp(4.75rem,20vw,8rem)] w-[clamp(6.5rem,28vw,11rem)] overflow-visible drop-shadow-md sm:h-32 sm:w-40 md:h-36 md:w-48'
        : usesWeddingRings
          ? 'mx-auto h-[clamp(4.5rem,17vw,6.5rem)] w-[clamp(7rem,28vw,10rem)] overflow-visible drop-shadow-[0_0_14px_rgba(246,211,120,0.55)] sm:h-24 sm:w-40 md:h-28 md:w-44'
          : 'mx-auto h-12 w-14 overflow-visible sm:h-14 sm:w-16'}
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
      initial={{ opacity: 0, y: 5, scale: 0.94 }}
      animate={{ opacity: 1, y: [0, -2, 0], scale: 1 }}
      transition={{ opacity: { duration: 0.5 }, scale: { duration: 0.5 }, y: { duration: 4, repeat: Infinity, ease: 'easeInOut' } }}
    >
      {artwork}
    </motion.svg>
  );
};
