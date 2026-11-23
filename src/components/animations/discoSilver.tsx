import React, { useId } from 'react';
import { motion } from 'motion/react';

/**
 * Photorealistic 3D Faceted Silver Mirror Disco Ball
 * Recreates the iconic disco sphere with reflective tiles, specular glints, and hanging cord.
 */
export const DiscoBall: React.FC<{
  size?: number;
  className?: string;
  withString?: boolean;
  stringLength?: number;
  floatDelay?: number;
  interactive?: boolean;
}> = ({
  size = 140,
  className = '',
  withString = false,
  stringLength = 50,
  floatDelay = 0,
}) => {
  const ballId = useId().replace(/:/g, '');
  const sphereGradId = `disco-sphere-${ballId}`;
  const highlightGradId = `disco-highlight-${ballId}`;
  const rimGradId = `disco-rim-${ballId}`;

  // Facet rows to create the 3D spherical tiled mirror texture
  // 9 latitudinal rows with curved perspective
  const rows = [
    { cy: 22, height: 7, count: 8, r: 27 },
    { cy: 30, height: 8, count: 12, r: 37 },
    { cy: 40, height: 9, count: 14, r: 45 },
    { cy: 50, height: 10, count: 16, r: 48 },
    { cy: 60, height: 10, count: 16, r: 48 },
    { cy: 70, height: 9, count: 14, r: 45 },
    { cy: 80, height: 8, count: 12, r: 37 },
    { cy: 88, height: 7, count: 8, r: 27 },
  ];

  // Tile shades mimicking reflections of lights
  const tileFills = [
    '#FFFFFF', '#F1F5F9', '#E2E8F0', '#CBD5E1', 
    '#94A3B8', '#64748B', '#475569', '#334155',
    '#E2E8F0', '#F8FAFC', '#CBD5E1', '#64748B'
  ];

  return (
    <motion.div
      initial={{ y: 0, rotate: 0 }}
      animate={{ y: [-4, 5, -4], rotate: [-2, 2.5, -2] }}
      transition={{
        duration: 5.5,
        repeat: Infinity,
        ease: 'easeInOut',
        delay: floatDelay,
      }}
      className={`relative inline-block select-none pointer-events-none drop-shadow-[0_12px_24px_rgba(0,0,0,0.8)] ${className}`}
      style={{ width: size, height: withString ? size + stringLength : size }}
    >
      <svg
        viewBox={withString ? `0 -${stringLength} 100 ${100 + stringLength}` : '0 0 100 100'}
        className="w-full h-full overflow-visible"
        fill="none"
      >
        <defs>
          {/* Base spherical 3D shading */}
          <radialGradient id={sphereGradId} cx="35%" cy="30%" r="68%">
            <stop offset="0%" stopColor="#FFFFFF" />
            <stop offset="25%" stopColor="#CBD5E1" />
            <stop offset="60%" stopColor="#475569" />
            <stop offset="85%" stopColor="#1E293B" />
            <stop offset="100%" stopColor="#0F172A" />
          </radialGradient>

          {/* Specular mirror hot-spot */}
          <radialGradient id={highlightGradId} cx="30%" cy="25%" r="35%">
            <stop offset="0%" stopColor="#FFFFFF" stopOpacity="0.85" />
            <stop offset="60%" stopColor="#FFFFFF" stopOpacity="0.2" />
            <stop offset="100%" stopColor="#FFFFFF" stopOpacity="0" />
          </radialGradient>

          {/* Chrome rim light */}
          <radialGradient id={rimGradId} cx="50%" cy="50%" r="50%">
            <stop offset="90%" stopColor="#FFFFFF" stopOpacity="0" />
            <stop offset="98%" stopColor="#E2E8F0" stopOpacity="0.7" />
            <stop offset="100%" stopColor="#FFFFFF" stopOpacity="0.9" />
          </radialGradient>
        </defs>

        {/* Optional hanging string / cord */}
        {withString && (
          <g>
            <line
              x1="50"
              y1={-stringLength}
              x2="50"
              y2="2"
              stroke="#CBD5E1"
              strokeWidth="1.2"
              strokeDasharray="3 2"
              opacity="0.8"
            />
            {/* Top metallic loop */}
            <circle cx="50" cy="2" r="3" stroke="#E2E8F0" strokeWidth="1.2" fill="#334155" />
          </g>
        )}

        {/* Ambient Drop Shadow Sphere */}
        <circle cx="50" cy="52" r="47" fill="#000000" opacity="0.45" />

        {/* Base Sphere */}
        <circle cx="50" cy="50" r="47" fill={`url(#${sphereGradId})`} />

        {/* Mirror Grid Facets */}
        <g opacity="0.92">
          {rows.map((row, rIdx) => {
            const step = (row.r * 2) / row.count;
            return (
              <g key={rIdx}>
                {Array.from({ length: row.count }).map((_, cIdx) => {
                  const x = 50 - row.r + cIdx * step;
                  const w = step - 0.7;
                  const colorIdx = (rIdx * 5 + cIdx * 3) % tileFills.length;
                  return (
                    <rect
                      key={cIdx}
                      x={x}
                      y={row.cy - row.height / 2}
                      width={Math.max(1, w)}
                      height={row.height - 0.8}
                      rx="0.5"
                      fill={tileFills[colorIdx]}
                      stroke="#1E293B"
                      strokeWidth="0.45"
                      opacity={0.88}
                    />
                  );
                })}
              </g>
            );
          })}
        </g>

        {/* Specular Glint Highlight Overlay */}
        <circle cx="50" cy="50" r="47" fill={`url(#${highlightGradId})`} pointerEvents="none" />
        <circle cx="50" cy="50" r="47" fill={`url(#${rimGradId})`} pointerEvents="none" />

        {/* Sparkle Flares on facets (Star Glints) */}
        <motion.g
          animate={{ scale: [0.7, 1.3, 0.7], opacity: [0.3, 1, 0.3], rotate: [0, 45, 0] }}
          transition={{ duration: 2.8, repeat: Infinity, ease: 'easeInOut' }}
          style={{ transformOrigin: '32px 28px' }}
        >
          <path d="M32 20 L33.5 26.5 L40 28 L33.5 29.5 L32 36 L30.5 29.5 L24 28 L30.5 26.5 Z" fill="#FFFFFF" />
          <circle cx="32" cy="28" r="1.8" fill="#FFFFFF" />
        </motion.g>

        <motion.g
          animate={{ scale: [1.2, 0.6, 1.2], opacity: [1, 0.2, 1], rotate: [45, 0, 45] }}
          transition={{ duration: 3.2, repeat: Infinity, ease: 'easeInOut', delay: 1 }}
          style={{ transformOrigin: '68px 42px' }}
        >
          <path d="M68 36 L69 40.5 L74 42 L69 43.5 L68 48 L67 43.5 L62 42 L67 40.5 Z" fill="#FFFFFF" />
        </motion.g>

        <motion.g
          animate={{ scale: [0.5, 1.1, 0.5], opacity: [0.2, 0.9, 0.2] }}
          transition={{ duration: 2.4, repeat: Infinity, ease: 'easeInOut', delay: 1.6 }}
          style={{ transformOrigin: '28px 65px' }}
        >
          <path d="M28 61 L29 64 L32 65 L29 66 L28 69 L27 66 L24 65 L27 64 Z" fill="#E2E8F0" />
        </motion.g>
      </svg>
    </motion.div>
  );
};

/**
 * 5-Point Silver Glitter Star matching the reference image.
 */
export const SilverGlitterStar: React.FC<{
  size?: number;
  className?: string;
  rotation?: number;
  twinkleDelay?: number;
  opacity?: number;
}> = ({
  size = 28,
  className = '',
  rotation = 0,
  twinkleDelay = 0,
  opacity = 0.9,
}) => {
  return (
    <motion.div
      initial={{ scale: 0.9, opacity: opacity * 0.7 }}
      animate={{
        scale: [0.85, 1.15, 0.85],
        opacity: [opacity * 0.5, opacity, opacity * 0.5],
        rotate: [rotation - 4, rotation + 4, rotation - 4],
      }}
      transition={{
        duration: 3.2,
        repeat: Infinity,
        ease: 'easeInOut',
        delay: twinkleDelay,
      }}
      className={`inline-block select-none pointer-events-none drop-shadow-[0_0_8px_rgba(255,255,255,0.6)] ${className}`}
      style={{ width: size, height: size }}
    >
      <svg viewBox="0 0 100 100" className="w-full h-full overflow-visible">
        <defs>
          <radialGradient id={`star-shine-${twinkleDelay}`} cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="#FFFFFF" />
            <stop offset="40%" stopColor="#E2E8F0" />
            <stop offset="75%" stopColor="#94A3B8" />
            <stop offset="100%" stopColor="#475569" />
          </radialGradient>
        </defs>
        {/* Star Polygon */}
        <polygon
          points="50,5 64,36 98,38 72,60 80,94 50,75 20,94 28,60 2,38 36,36"
          fill={`url(#star-shine-${twinkleDelay})`}
          stroke="#FFFFFF"
          strokeWidth="1.5"
        />
        {/* Inner Glitter Core */}
        <polygon
          points="50,22 58,40 76,41 62,54 67,72 50,61 33,72 38,54 24,41 42,40"
          fill="#FFFFFF"
          opacity="0.6"
        />
        <circle cx="50" cy="50" r="4" fill="#FFFFFF" />
      </svg>
    </motion.div>
  );
};

/**
 * Organic Wavy Silver Glitter Border Frames
 * Simulates the exact stippled glitter curve seen framing the left and bottom right edges of the reference image.
 */
export const SilverGlitterWavyFrame: React.FC<{
  className?: string;
}> = ({ className = '' }) => {
  return (
    <div className={`absolute inset-0 pointer-events-none overflow-hidden z-0 ${className}`}>
      {/* Left Wavy Glitter Edge */}
      <svg
        className="absolute top-0 left-0 h-full w-[80px] xs:w-[100px] sm:w-[180px] md:w-[260px] opacity-75"
        viewBox="0 0 280 900"
        preserveAspectRatio="none"
        fill="none"
      >
        <defs>
          {/* Silver glitter pattern */}
          <pattern id="silver-glitter-left" x="0" y="0" width="20" height="20" patternUnits="userSpaceOnUse">
            <rect width="20" height="20" fill="#0D0E12" />
            <circle cx="3" cy="4" r="1.2" fill="#FFFFFF" opacity="0.9" />
            <circle cx="12" cy="7" r="0.8" fill="#CBD5E1" opacity="0.75" />
            <circle cx="8" cy="15" r="1" fill="#E2E8F0" opacity="0.85" />
            <circle cx="17" cy="16" r="1.4" fill="#FFFFFF" opacity="0.95" />
            <circle cx="16" cy="3" r="0.7" fill="#94A3B8" opacity="0.6" />
            <circle cx="5" cy="11" r="0.9" fill="#E2E8F0" opacity="0.8" />
          </pattern>
          <linearGradient id="glitter-fade-left" x1="0" y1="0" x2="1" y2="0">
            <stop offset="0%" stopColor="#FFFFFF" stopOpacity="0.95" />
            <stop offset="70%" stopColor="#E2E8F0" stopOpacity="0.7" />
            <stop offset="100%" stopColor="#94A3B8" stopOpacity="0" />
          </linearGradient>
        </defs>

        {/* Layer 1: Textured glitter background */}
        <path
          d="M0,0 L120,0 C90,140 180,260 130,420 C80,580 190,720 140,900 L0,900 Z"
          fill="url(#silver-glitter-left)"
        />

        {/* Layer 2: Shimmering wave border stroke */}
        <path
          d="M120,0 C90,140 180,260 130,420 C80,580 190,720 140,900"
          stroke="url(#glitter-fade-left)"
          strokeWidth="3.5"
          filter="drop-shadow(0 0 8px rgba(255,255,255,0.7))"
        />
        <path
          d="M116,0 C86,140 176,260 126,420 C76,580 186,720 136,900"
          stroke="#FFFFFF"
          strokeWidth="1.2"
          opacity="0.8"
        />
      </svg>

      {/* Bottom-Right Corner Wavy Glitter Edge */}
      <svg
        className="absolute bottom-0 right-0 h-[220px] sm:h-[380px] w-[130px] xs:w-[170px] sm:w-[260px] md:w-[320px] opacity-75 pointer-events-none"
        viewBox="0 0 320 380"
        preserveAspectRatio="none"
        fill="none"
      >
        <defs>
          <pattern id="silver-glitter-right" x="0" y="0" width="20" height="20" patternUnits="userSpaceOnUse">
            <rect width="20" height="20" fill="#0D0E12" />
            <circle cx="4" cy="5" r="1.1" fill="#FFFFFF" opacity="0.9" />
            <circle cx="13" cy="8" r="0.9" fill="#CBD5E1" opacity="0.8" />
            <circle cx="9" cy="16" r="1.3" fill="#FFFFFF" opacity="0.95" />
            <circle cx="18" cy="14" r="0.7" fill="#94A3B8" opacity="0.6" />
          </pattern>
        </defs>
        <path
          d="M120,382 C150,260 220,180 322,130 L322,382 Z"
          fill="url(#silver-glitter-right)"
        />
        <path
          d="M120,382 C150,260 220,180 322,130"
          stroke="#FFFFFF"
          strokeWidth="2.5"
          filter="drop-shadow(0 0 10px rgba(255,255,255,0.8))"
        />
      </svg>
    </div>
  );
};

/**
 * 3D Metallic Chrome Silver Foil Balloon Text
 * Recreates the inflated helium balloon letters & numbers ("ISA 15") with specular highlights and inflated pillow relief.
 */
export const SilverFoilBalloonText: React.FC<{
  text: string;
  className?: string;
  sizeClass?: string;
}> = ({
  text,
  className = '',
  sizeClass = 'text-5xl sm:text-7xl md:text-8xl',
}) => {
  return (
    <div className={`relative inline-flex items-center justify-center flex-wrap gap-x-2 py-2 select-none ${className}`}>
      <span
        className={`font-black tracking-wider uppercase font-sans ${sizeClass}`}
        style={{
          background: 'linear-gradient(135deg, #FFFFFF 0%, #F8FAFC 12%, #CBD5E1 28%, #FFFFFF 44%, #64748B 62%, #E2E8F0 78%, #334155 100%)',
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent',
          filter: `
            drop-shadow(0 3px 0 #1E293B)
            drop-shadow(0 8px 16px rgba(0,0,0,0.85))
            drop-shadow(0 0 20px rgba(255,255,255,0.45))
          `,
          textShadow: '0 0 10px rgba(255,255,255,0.3)',
          letterSpacing: '0.04em',
        }}
      >
        {text}
      </span>
    </div>
  );
};

/**
 * Animated Disco Divider with central mirror ball and star rays.
 */
export const AnimatedDiscoDivider: React.FC<{
  className?: string;
  color?: string;
}> = ({
  className = 'w-64 sm:w-80 h-10',
  color = '#E2E8F0',
}) => {
  return (
    <div className={`mx-auto flex items-center justify-center my-4 ${className}`}>
      <svg viewBox="0 0 320 40" fill="none" className="w-full h-full overflow-visible">
        {/* Left beam line */}
        <motion.path
          d="M10 20 L135 20"
          stroke={color}
          strokeWidth="1.5"
          strokeDasharray="4 3"
          initial={{ pathLength: 0 }}
          animate={{ pathLength: 1 }}
          transition={{ duration: 2, repeat: Infinity, repeatType: 'reverse' }}
        />

        {/* Right beam line */}
        <motion.path
          d="M185 20 L310 20"
          stroke={color}
          strokeWidth="1.5"
          strokeDasharray="4 3"
          initial={{ pathLength: 0 }}
          animate={{ pathLength: 1 }}
          transition={{ duration: 2, repeat: Infinity, repeatType: 'reverse' }}
        />

        {/* Center Disco Ball Icon */}
        <g data-divider-center transform="translate(145, 5)">
          <circle cx="15" cy="15" r="14" fill="#1E293B" stroke={color} strokeWidth="1.5" />
          {/* Facets grid */}
          <path d="M5 15 H25 M15 5 V25 M7 10 H23 M7 20 H23 M10 7 V23 M20 7 V23" stroke="#FFFFFF" strokeWidth="0.8" opacity="0.75" />
          {/* Center flare */}
          <motion.circle
            cx="12"
            cy="11"
            r="2"
            fill="#FFFFFF"
            animate={{ scale: [0.8, 1.4, 0.8], opacity: [0.4, 1, 0.4] }}
            transition={{ duration: 1.8, repeat: Infinity }}
          />
        </g>

        {/* Twinkling Stars */}
        {[
          { cx: 50, cy: 20, delay: 0 },
          { cx: 95, cy: 20, delay: 0.6 },
          { cx: 225, cy: 20, delay: 0.3 },
          { cx: 270, cy: 20, delay: 0.9 },
        ].map((star, idx) => (
          <motion.g
            key={idx}
            animate={{ scale: [0.7, 1.3, 0.7], opacity: [0.3, 1, 0.3] }}
            transition={{ duration: 2, repeat: Infinity, delay: star.delay }}
            style={{ transformOrigin: `${star.cx}px ${star.cy}px` }}
          >
            <path
              d={`M${star.cx} ${star.cy - 5} L${star.cx + 1} ${star.cy - 1} L${star.cx + 5} ${star.cy} L${star.cx + 1} ${star.cy + 1} L${star.cx} ${star.cy + 5} L${star.cx - 1} ${star.cy + 1} L${star.cx - 5} ${star.cy} L${star.cx - 1} ${star.cy - 1} Z`}
              fill="#FFFFFF"
            />
          </motion.g>
        ))}
      </svg>
    </div>
  );
};
