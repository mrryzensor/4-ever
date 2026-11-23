import React from 'react';
import { motion, useReducedMotion } from 'motion/react';

const WAVE_PROFILES: Record<string, {
  cycles: number;
  amplitude: number;
  ripple: number;
  asymmetry: number;
}> = {
  'classic-gold': { cycles: 1, amplitude: 1, ripple: 0.14, asymmetry: 0 },
  'romantic-floral': { cycles: 1, amplitude: 0.84, ripple: 0.3, asymmetry: 12 },
  'boho-chic': { cycles: 0.5, amplitude: 1.2, ripple: 0.08, asymmetry: 24 },
  'minimal-editorial': { cycles: 0.5, amplitude: 0.42, ripple: 0.04, asymmetry: -4 },
  'dark-luxury': { cycles: 1, amplitude: 1.38, ripple: 0.24, asymmetry: -22 },
  'watercolor-garden': { cycles: 1.5, amplitude: 1.05, ripple: 0.22, asymmetry: 10 },
  'royal-navy': { cycles: 1, amplitude: 0.88, ripple: 0.3, asymmetry: -16 },
  'terracotta-sunset': { cycles: 0.5, amplitude: 1.2, ripple: 0.08, asymmetry: 22 },
  'lavender-provence': { cycles: 2, amplitude: 0.72, ripple: 0.12, asymmetry: 0 },
  'emerald-botanical': { cycles: 1.5, amplitude: 1.05, ripple: 0.2, asymmetry: -10 },
  'coastal-breeze': { cycles: 2, amplitude: 0.95, ripple: 0.1, asymmetry: 6 },
  'champagne-glam': { cycles: 2, amplitude: 0.68, ripple: 0.26, asymmetry: 4 },
};

const buildWavePath = (style: string, layer: number) => {
  const profile = WAVE_PROFILES[style] || WAVE_PROFILES['classic-gold'];
  const baselines = [92, 100, 108, 116];
  const amplitudes = [34, 31, 28, 25];
  const baseline = baselines[layer];
  const amplitude = amplitudes[layer] * profile.amplitude;
  const frequency = profile.cycles;
  const pointCount = 9;
  const points = Array.from({ length: pointCount }, (_, index) => {
    const progress = index / (pointCount - 1);
    const angle = progress * Math.PI * 2 * frequency;
    const y = baseline
      + Math.sin(angle) * amplitude
      + Math.sin(angle * 2) * amplitude * profile.ripple
      + Math.sin(progress * Math.PI * 2) * Math.sin(progress * Math.PI) * profile.asymmetry;
    return { x: progress * 1440, y };
  });

  let path = `M ${points[0].x} ${points[0].y}`;
  for (let index = 0; index < points.length - 1; index += 1) {
    const previous = points[Math.max(0, index - 1)];
    const start = points[index];
    const end = points[index + 1];
    const next = points[Math.min(points.length - 1, index + 2)];
    const control1 = {
      x: start.x + (end.x - previous.x) / 6,
      y: start.y + (end.y - previous.y) / 6,
    };
    const control2 = {
      x: end.x - (next.x - start.x) / 6,
      y: end.y - (next.y - start.y) / 6,
    };
    path += ` C ${control1.x} ${control1.y}, ${control2.x} ${control2.y}, ${end.x} ${end.y}`;
  }

  return `${path} L 1440 250 L 0 250 Z`;
};

/**
 * Organic Animated Transition Wave Divider
 * Connects the Hero section seamlessly into the body with flowing SVG waves & theme-specific crest accents for all 12 designs!
 */
export const FixDateAnimatedTransitionDivider: React.FC<{
  className?: string;
  svgClassName?: string;
  fillColor?: string;
  accentColor?: string;
  cardStyle?: string;
  effect?: string;
}> = ({
  className = 'w-full',
  svgClassName = 'w-full h-32 sm:h-44 md:h-56 lg:h-64 block preserve-3d',
  fillColor = '#FDFCF0',
  accentColor = '#7D8C7A',
  cardStyle: rawCardStyle = 'classic-gold',
  effect: rawEffect = 'wave',
}) => {
  const cardStyle = (rawCardStyle && rawCardStyle !== 'auto') ? rawCardStyle : 'classic-gold';
  const wavePaths = [0, 1, 2, 3].map((layer) => buildWavePath(cardStyle, layer));
  const reducedMotion = useReducedMotion();
  const effect = ['wave', 'petals', 'sparkles', 'drape', 'orbit', 'cascade', 'ribbons', 'bloom'].includes(rawEffect) ? rawEffect : 'wave';

  if (effect !== 'wave') {
    const effectPaths: Record<string, string> = {
      petals: 'M0 116 C170 102 250 84 390 100 C540 118 620 139 770 119 C940 96 1030 79 1180 94 C1300 106 1360 120 1440 108 L1440 240 L0 240 Z',
      sparkles: 'M0 108 C260 108 390 119 610 108 C810 98 1000 88 1180 101 C1290 110 1370 108 1440 102 L1440 240 L0 240 Z',
      drape: 'M0 76 C160 76 170 142 360 142 C550 142 550 75 720 75 C890 75 890 142 1080 142 C1270 142 1280 76 1440 76 L1440 240 L0 240 Z',
      orbit: 'M0 126 C260 126 340 74 720 74 C1100 74 1180 126 1440 126 L1440 240 L0 240 Z',
      cascade: 'M0 82 C95 82 90 145 180 145 C270 145 270 82 360 82 C450 82 450 145 540 145 C630 145 630 82 720 82 C810 82 810 145 900 145 C990 145 990 82 1080 82 C1170 82 1170 145 1260 145 C1350 145 1350 82 1440 82 L1440 240 L0 240 Z',
      ribbons: 'M0 112 C210 38 330 164 540 94 C750 24 870 160 1080 92 C1230 44 1320 62 1440 110 L1440 240 L0 240 Z',
      bloom: 'M0 126 C90 126 70 56 160 56 C250 56 230 126 320 126 C410 126 390 56 480 56 C570 56 550 126 640 126 C730 126 710 56 800 56 C890 56 870 126 960 126 C1050 126 1030 56 1120 56 C1210 56 1190 126 1280 126 C1370 126 1350 56 1440 56 L1440 240 L0 240 Z',
    };
    const shape = effectPaths[effect];
    const petals = Array.from({ length: 16 }, (_, index) => ({
      x: 54 + ((index * 173) % 1332),
      y: 18 + ((index * 37) % 72),
      delay: (index % 8) * 0.35,
      rotation: (index * 41) % 180,
    }));
    const sparkles = Array.from({ length: 18 }, (_, index) => ({
      x: 42 + ((index * 157) % 1356),
      y: 18 + ((index * 29) % 76),
      delay: (index % 9) * 0.22,
    }));
    const cascadeLeaves = Array.from({ length: 14 }, (_, index) => ({
      x: 48 + ((index * 103) % 1344),
      y: 8 + ((index * 41) % 72),
      delay: (index % 7) * 0.42,
      rotation: (index * 37) % 160 - 80,
    }));
    const bloomFlowers = Array.from({ length: 7 }, (_, index) => ({
      x: 118 + index * 201,
      y: 41 + (index % 2) * 13,
      delay: index * 0.28,
    }));

    return (
      <div className={`relative w-full overflow-hidden leading-none z-10 ${className}`} data-transition-effect={effect}>
        <svg
          viewBox="0 0 1440 240"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className={svgClassName}
          preserveAspectRatio="none"
          data-wave-style={cardStyle}
          data-transition-effect={effect}
        >
          {effect === 'drape' && (
            <motion.path
              d="M0 87 C160 87 170 153 360 153 C550 153 550 86 720 86 C890 86 890 153 1080 153 C1270 153 1280 87 1440 87 L1440 240 L0 240 Z"
              fill={accentColor}
              fillOpacity="0.12"
              animate={reducedMotion ? undefined : { y: [-3, 3, -3] }}
              transition={{ duration: 7, repeat: Infinity, ease: 'easeInOut' }}
            />
          )}
          <motion.path
            d={shape}
            fill={fillColor}
            animate={reducedMotion ? undefined : { y: [-2, 2, -2] }}
            transition={{ duration: effect === 'drape' ? 8 : 6, repeat: Infinity, ease: 'easeInOut' }}
          />
          <path
            d={effect === 'drape'
              ? 'M0 76 C160 76 170 142 360 142 C550 142 550 75 720 75 C890 75 890 142 1080 142 C1270 142 1280 76 1440 76'
              : effect === 'orbit'
                ? 'M0 126 C260 126 340 74 720 74 C1100 74 1180 126 1440 126'
                : effect === 'sparkles'
                  ? 'M0 108 C260 108 390 119 610 108 C810 98 1000 88 1180 101 C1290 110 1370 108 1440 102'
                  : effect === 'cascade'
                    ? 'M0 82 C95 82 90 145 180 145 C270 145 270 82 360 82 C450 82 450 145 540 145 C630 145 630 82 720 82 C810 82 810 145 900 145 C990 145 990 82 1080 82 C1170 82 1170 145 1260 145 C1350 145 1350 82 1440 82'
                    : effect === 'ribbons'
                      ? 'M0 112 C210 38 330 164 540 94 C750 24 870 160 1080 92 C1230 44 1320 62 1440 110'
                      : effect === 'bloom'
                        ? 'M0 126 C90 126 70 56 160 56 C250 56 230 126 320 126 C410 126 390 56 480 56 C570 56 550 126 640 126 C730 126 710 56 800 56 C890 56 870 126 960 126 C1050 126 1030 56 1120 56 C1210 56 1190 126 1280 126 C1370 126 1350 56 1440 56'
                        : 'M0 116 C170 102 250 84 390 100 C540 118 620 139 770 119 C940 96 1030 79 1180 94 C1300 106 1360 120 1440 108'}
            stroke={accentColor}
            strokeWidth="2"
            strokeOpacity="0.38"
          />
          <path
            d={wavePaths[1].replace(/ L 1440 250 L 0 250 Z$/, '')}
            fill="none"
            stroke={accentColor}
            strokeWidth="1.25"
            strokeOpacity="0.2"
            strokeDasharray="3 8"
            data-template-silhouette={cardStyle}
          />

          {effect === 'petals' && petals.map((petal, index) => (
            <motion.g
              key={`petal-${index}`}
              animate={reducedMotion ? undefined : { y: [0, -18, 8, 0], x: [0, 8, -5, 0], rotate: [0, 28, -18, 0], opacity: [0.35, 0.9, 0.55, 0.35] }}
              transition={{ duration: 5 + (index % 4), delay: petal.delay, repeat: Infinity, ease: 'easeInOut' }}
            >
              <path
                d="M0 0 C-8 -5 -5 -14 0 -18 C5 -14 8 -5 0 0 Z"
                transform={`translate(${petal.x} ${petal.y}) rotate(${petal.rotation})`}
                fill={index % 3 === 0 ? accentColor : '#D8A69A'}
                fillOpacity="0.78"
              />
            </motion.g>
          ))}

          {effect === 'sparkles' && sparkles.map((sparkle, index) => (
            <motion.g
              key={`sparkle-${index}`}
              animate={reducedMotion ? undefined : { opacity: [0.25, 1, 0.35], scale: [0.72, 1.2, 0.72], y: [0, -5, 0] }}
              transition={{ duration: 2.4 + (index % 3) * 0.6, delay: sparkle.delay, repeat: Infinity, ease: 'easeInOut' }}
              style={{ transformOrigin: `${sparkle.x}px ${sparkle.y}px` }}
            >
              <path d={`M${sparkle.x} ${sparkle.y - 7} L${sparkle.x + 2} ${sparkle.y - 2} L${sparkle.x + 7} ${sparkle.y} L${sparkle.x + 2} ${sparkle.y + 2} L${sparkle.x} ${sparkle.y + 7} L${sparkle.x - 2} ${sparkle.y + 2} L${sparkle.x - 7} ${sparkle.y} L${sparkle.x - 2} ${sparkle.y - 2} Z`} fill={index % 3 === 0 ? '#D4A373' : accentColor} />
            </motion.g>
          ))}

          {effect === 'cascade' && cascadeLeaves.map((leaf, index) => (
            <motion.path
              key={`cascade-leaf-${index}`}
              d="M0 0 C-8 -5 -7 -15 0 -20 C7 -15 8 -5 0 0 Z"
              transform={`translate(${leaf.x} ${leaf.y}) rotate(${leaf.rotation})`}
              fill={index % 2 === 0 ? accentColor : '#D8A69A'}
              fillOpacity="0.78"
              animate={reducedMotion ? undefined : { y: [0, 30, 5], rotate: [leaf.rotation, leaf.rotation + 32, leaf.rotation - 18], opacity: [0.4, 0.9, 0.4] }}
              transition={{ duration: 6 + (index % 4), delay: leaf.delay, repeat: Infinity, ease: 'easeInOut' }}
            />
          ))}

          {effect === 'ribbons' && (
            <g fill="none" stroke={accentColor} strokeLinecap="round">
              <motion.path d="M0 113 C210 42 330 166 540 96 C750 26 870 162 1080 94 C1230 46 1320 64 1440 112" strokeWidth="5" strokeOpacity="0.32" animate={reducedMotion ? undefined : { y: [-5, 7, -5] }} transition={{ duration: 7, repeat: Infinity, ease: 'easeInOut' }} />
              <motion.path d="M0 126 C220 62 340 178 550 111 C760 44 890 178 1090 108 C1240 62 1330 78 1440 126" strokeWidth="2" strokeOpacity="0.62" animate={reducedMotion ? undefined : { y: [6, -6, 6] }} transition={{ duration: 8, repeat: Infinity, ease: 'easeInOut' }} />
            </g>
          )}

          {effect === 'bloom' && bloomFlowers.map((flower, index) => (
            <motion.g
              key={`bloom-flower-${index}`}
              transform={`translate(${flower.x} ${flower.y})`}
              animate={reducedMotion ? undefined : { scale: [0.82, 1.12, 0.82], rotate: [0, 18, 0], opacity: [0.4, 0.9, 0.4] }}
              transition={{ duration: 5 + (index % 3), delay: flower.delay, repeat: Infinity, ease: 'easeInOut' }}
              style={{ transformOrigin: '0px 0px' }}
            >
              {[0, 60, 120, 180, 240, 300].map((angle) => (
                <ellipse key={angle} cx="0" cy="-7" rx="3.5" ry="7" transform={`rotate(${angle})`} fill={index % 2 ? accentColor : '#D8A69A'} fillOpacity="0.72" />
              ))}
              <circle r="2.5" fill="#D4A373" />
            </motion.g>
          ))}

          {effect === 'orbit' && (
            <g>
              <motion.ellipse
                cx="720" cy="98" rx="175" ry="39" stroke={accentColor} strokeWidth="1.5" strokeOpacity="0.34" strokeDasharray="5 8"
                animate={reducedMotion ? undefined : { rotate: [0, 360] }} transition={{ duration: 32, repeat: Infinity, ease: 'linear' }}
                style={{ transformOrigin: '720px 98px' }}
              />
              <motion.ellipse
                cx="720" cy="98" rx="125" ry="28" stroke={accentColor} strokeWidth="1" strokeOpacity="0.3"
                animate={reducedMotion ? undefined : { rotate: [360, 0] }} transition={{ duration: 24, repeat: Infinity, ease: 'linear' }}
                style={{ transformOrigin: '720px 98px' }}
              />
              <motion.circle cx="895" cy="98" r="4" fill={accentColor} animate={reducedMotion ? undefined : { opacity: [0.4, 1, 0.4], scale: [0.8, 1.2, 0.8] }} transition={{ duration: 2.5, repeat: Infinity }} />
            </g>
          )}
        </svg>
      </div>
    );
  }

  return (
    <div className={`relative w-full overflow-hidden leading-none z-10 ${className}`}>
      {/* Dynamic Animated Multi-layered SVG Wave */}
      <svg
        viewBox="0 0 1440 240"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className={svgClassName}
        preserveAspectRatio="none"
        data-wave-style={cardStyle}
        data-transition-effect="wave"
      >
        <defs>
          <linearGradient id={`waveSoftTint-${cardStyle}`} x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor={accentColor} stopOpacity="0.2" />
            <stop offset="50%" stopColor={accentColor} stopOpacity="0.1" />
            <stop offset="100%" stopColor={fillColor} stopOpacity="0.02" />
          </linearGradient>
          <filter id={`waveShadow-${cardStyle}`} x="-5%" y="-10%" width="110%" height="130%">
            <feDropShadow dx="0" dy="8" stdDeviation="10" floodColor="#000000" floodOpacity="0.08" />
          </filter>
        </defs>

        {/* Layer 1: Background gentle translucent flowing wave into Hero */}
        <motion.path
          d={wavePaths[0]}
          fill={fillColor}
          fillOpacity="0.3"
          animate={{
            y: [-6, 6, -6],
            scaleY: [0.95, 1.05, 0.95],
          }}
          transition={{ duration: 8, repeat: Infinity, ease: 'easeInOut' }}
        />

        {/* Layer 2: Mid wave with accent shimmer & delicate line contour */}
        <motion.path
          d={wavePaths[1]}
          fill={fillColor}
          fillOpacity="0.48"
          stroke={accentColor}
          strokeWidth="1.5"
          strokeOpacity="0.22"
          animate={{
            y: [5, -5, 5],
            scaleY: [1.04, 0.96, 1.04],
          }}
          transition={{ duration: 6.5, repeat: Infinity, ease: 'easeInOut', delay: 0.5 }}
        />

        {/* Layer 3: Contrast Wave reaching down into Content Section with soft tint */}
        <motion.path
          d={wavePaths[2]}
          fill={`url(#waveSoftTint-${cardStyle})`}
          stroke={accentColor}
          strokeWidth="1"
          strokeOpacity="0.16"
          animate={{
            y: [-4, 4, -4],
          }}
          transition={{ duration: 7, repeat: Infinity, ease: 'easeInOut', delay: 0.2 }}
        />

        {/* Layer 4: Main Solid Wave blending 100% seamlessly into Content */}
        <motion.path
          d={wavePaths[3]}
          fill={fillColor}
          animate={{
            y: [-3, 3, -3],
          }}
          transition={{ duration: 5, repeat: Infinity, ease: 'easeInOut' }}
        />

        {/* 1. Classic Gold Accent */}
        {cardStyle === 'classic-gold' && (
          <g>
            <motion.circle
              cx="720"
              cy="115"
              r="4"
              fill="#D4A373"
              animate={{ scale: [1, 1.3, 1], opacity: [0.7, 1, 0.7] }}
              transition={{ duration: 2.5, repeat: Infinity }}
            />
            <motion.path
              d="M700 115 C710 110, 715 110, 720 115 C725 110, 730 110, 740 115"
              stroke="#5A5A40"
              strokeWidth="1.5"
              strokeLinecap="round"
              fill="none"
              animate={{ opacity: [0.6, 1, 0.6] }}
              transition={{ duration: 3, repeat: Infinity }}
            />
          </g>
        )}

        {/* 2. Romantic Floral Accent */}
        {cardStyle === 'romantic-floral' && (
          <g>
            <motion.circle
              cx="450"
              cy="90"
              r="4"
              fill="#E2B18E"
              animate={{ y: [-4, 4, -4], opacity: [0.5, 1, 0.5] }}
              transition={{ duration: 3, repeat: Infinity }}
            />
            <motion.circle
              cx="980"
              cy="75"
              r="3.5"
              fill="#C59B7E"
              animate={{ y: [4, -4, 4], opacity: [0.6, 1, 0.6] }}
              transition={{ duration: 3.5, repeat: Infinity, delay: 0.5 }}
            />
            <motion.g
              animate={{ scale: [0.95, 1.05, 0.95] }}
              transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
              style={{ transformOrigin: '720px 90px' }}
            >
              <circle cx="720" cy="90" r="6" fill="#F4D3C4" opacity="0.9" />
              <circle cx="720" cy="90" r="3" fill="#FFF" opacity="0.8" />
            </motion.g>
          </g>
        )}

        {/* 3. Boho Chic Accent */}
        {cardStyle === 'boho-chic' && (
          <g>
            <motion.path
              d="M320 85 Q330 65 340 85"
              stroke="#B26E59"
              strokeWidth="1.5"
              fill="none"
              animate={{ rotate: [-5, 5, -5] }}
              transition={{ duration: 3, repeat: Infinity }}
              style={{ transformOrigin: '330px 85px' }}
            />
            <motion.path
              d="M1100 80 Q1110 60 1120 80"
              stroke="#7D8C7A"
              strokeWidth="1.5"
              fill="none"
              animate={{ rotate: [5, -5, 5] }}
              transition={{ duration: 3.2, repeat: Infinity, delay: 0.4 }}
              style={{ transformOrigin: '1110px 80px' }}
            />
            <motion.circle
              cx="720"
              cy="85"
              r="4.5"
              fill="#B26E59"
              animate={{ scale: [1, 1.2, 1] }}
              transition={{ duration: 2.8, repeat: Infinity }}
            />
          </g>
        )}

        {/* 4. Minimal Editorial Accent */}
        {cardStyle === 'minimal-editorial' && (
          <g>
            <motion.path
              d="M680 95 L720 75 L760 95"
              stroke="#4A4A3A"
              strokeWidth="1"
              fill="none"
              animate={{ opacity: [0.5, 1, 0.5] }}
              transition={{ duration: 3, repeat: Infinity }}
            />
            <motion.rect
              x="717"
              y="92"
              width="6"
              height="6"
              fill="#4A4A3A"
              transform="rotate(45 720 95)"
              animate={{ scale: [0.9, 1.15, 0.9] }}
              transition={{ duration: 2.5, repeat: Infinity }}
            />
          </g>
        )}

        {/* 5. Dark Luxury Accent */}
        {cardStyle === 'dark-luxury' && (
          <g>
            <motion.path
              d="M720 70 L720 80 M715 75 L725 75"
              stroke="#C5A059"
              strokeWidth="1.5"
              strokeLinecap="round"
              animate={{ scale: [0.6, 1.4, 0.6], opacity: [0.3, 1, 0.3] }}
              transition={{ duration: 2, repeat: Infinity }}
              style={{ transformOrigin: '720px 75px' }}
            />
            <motion.circle
              cx="1150"
              cy="80"
              r="2"
              fill="#FDFCF0"
              animate={{ opacity: [0.2, 0.9, 0.2] }}
              transition={{ duration: 1.8, repeat: Infinity }}
            />
            <motion.circle
              cx="380"
              cy="70"
              r="2.5"
              fill="#C5A059"
              animate={{ opacity: [0.3, 1, 0.3], scale: [0.8, 1.2, 0.8] }}
              transition={{ duration: 2.2, repeat: Infinity, delay: 0.3 }}
            />
          </g>
        )}

        {/* 6. Watercolor Garden Accent */}
        {cardStyle === 'watercolor-garden' && (
          <g>
            <motion.path
              d="M700 90 Q710 80 720 90 Q730 80 740 90"
              stroke="#526B50"
              strokeWidth="1.5"
              strokeLinecap="round"
              fill="none"
              animate={{ opacity: [0.6, 1, 0.6] }}
              transition={{ duration: 2.5, repeat: Infinity }}
            />
            <motion.ellipse
              cx="710"
              cy="84"
              rx="4"
              ry="2"
              fill="#7D947B"
              transform="rotate(-25 710 84)"
              animate={{ scale: [0.9, 1.1, 0.9] }}
              transition={{ duration: 2.2, repeat: Infinity }}
            />
            <motion.ellipse
              cx="730"
              cy="84"
              rx="4"
              ry="2"
              fill="#7D947B"
              transform="rotate(25 730 84)"
              animate={{ scale: [0.9, 1.1, 0.9] }}
              transition={{ duration: 2.2, repeat: Infinity, delay: 0.3 }}
            />
          </g>
        )}

        {/* 7. Royal Navy Accent */}
        {cardStyle === 'royal-navy' && (
          <g>
            <motion.path
              d="M710 85 L720 75 L730 85 L725 90 L715 90 Z"
              fill="#C5A059"
              animate={{ scale: [0.9, 1.15, 0.9] }}
              transition={{ duration: 3, repeat: Infinity }}
              style={{ transformOrigin: '720px 82px' }}
            />
            <motion.circle
              cx="720"
              cy="75"
              r="2"
              fill="#FFFFFF"
              animate={{ opacity: [0.3, 1, 0.3] }}
              transition={{ duration: 1.8, repeat: Infinity }}
            />
          </g>
        )}

        {/* 8. Terracotta Sunset Accent */}
        {cardStyle === 'terracotta-sunset' && (
          <g>
            <motion.circle
              cx="720"
              cy="85"
              r="8"
              fill="#DDA15E"
              opacity="0.8"
              animate={{ scale: [0.9, 1.1, 0.9] }}
              transition={{ duration: 3.5, repeat: Infinity }}
            />
            <motion.path
              d="M690 95 L720 85 L750 95"
              stroke="#E07A5F"
              strokeWidth="2"
              strokeLinecap="round"
              fill="none"
            />
          </g>
        )}

        {/* 9. Lavender Provence Accent */}
        {cardStyle === 'lavender-provence' && (
          <g>
            <motion.path
              d="M714 82 C710 76, 706 82, 714 86 C706 88, 708 94, 714 90"
              fill="#B5A8C8"
              animate={{ scaleX: [1, 0.5, 1] }}
              transition={{ duration: 1, repeat: Infinity }}
              style={{ transformOrigin: '714px 85px' }}
            />
            <motion.path
              d="M714 82 C718 76, 722 82, 714 86 C722 88, 720 94, 714 90"
              fill="#7B6D8D"
              animate={{ scaleX: [1, 0.5, 1] }}
              transition={{ duration: 1, repeat: Infinity }}
              style={{ transformOrigin: '714px 85px' }}
            />
          </g>
        )}

        {/* 10. Emerald Botanical Accent */}
        {cardStyle === 'emerald-botanical' && (
          <g>
            <motion.path
              d="M720 70 C710 80, 712 92, 720 95 C728 92, 730 80, 720 70 Z"
              fill="#2D6A4F"
              animate={{ scale: [0.9, 1.1, 0.9] }}
              transition={{ duration: 3, repeat: Infinity }}
              style={{ transformOrigin: '720px 85px' }}
            />
            <circle cx="720" cy="85" r="2" fill="#D4AF37" />
          </g>
        )}

        {/* 11. Coastal Breeze Accent */}
        {cardStyle === 'coastal-breeze' && (
          <g>
            <motion.path
              d="M700 90 C710 80, 720 95, 730 85 C735 80, 740 85, 745 82"
              stroke="#2B6CB0"
              strokeWidth="2"
              strokeLinecap="round"
              fill="none"
              animate={{ opacity: [0.4, 1, 0.4] }}
              transition={{ duration: 2.5, repeat: Infinity }}
            />
            <circle cx="720" cy="85" r="2.5" fill="#FFF" />
          </g>
        )}

        {/* 12. Champagne Glam Accent */}
        {cardStyle === 'champagne-glam' && (
          <g>
            <motion.rect
              x="715"
              y="80"
              width="10"
              height="10"
              fill="#C39B60"
              transform="rotate(45 720 85)"
              animate={{ rotate: [45, 135, 45], scale: [0.8, 1.2, 0.8] }}
              transition={{ duration: 4, repeat: Infinity }}
              style={{ transformOrigin: '720px 85px' }}
            />
            <circle cx="720" cy="85" r="2" fill="#FFF" />
          </g>
        )}
      </svg>
    </div>
  );
};
