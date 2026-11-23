import React from 'react';
import { motion } from 'motion/react';

/**
 * Style 5: Dark Luxury - Glimmering Constellations & Gold Starlight Divider
 */
export const AnimatedConstellationDivider: React.FC<{ className?: string; color?: string }> = ({
  className = 'w-56 sm:w-72 h-10',
  color = '#C5A059',
}) => {
  return (
    <div className={`mx-auto flex items-center justify-center my-4 ${className}`}>
      <svg viewBox="0 0 320 40" fill="none" className="w-full h-full">
        {/* Celestial Constellation Lines */}
        <motion.path
          d="M30 20 L80 14 L130 24 L160 12 L190 24 L240 14 L290 20"
          stroke={color}
          strokeWidth="1"
          strokeDasharray="2 3"
          opacity="0.6"
          initial={{ pathLength: 0 }}
          animate={{ pathLength: 1 }}
          transition={{ duration: 3, repeat: Infinity, repeatType: 'reverse' }}
        />

        {/* Center Golden Starburst */}
        <motion.g
          animate={{ scale: [0.8, 1.3, 0.8], rotate: [0, 90, 0] }}
          transition={{ duration: 3.5, repeat: Infinity, ease: 'easeInOut' }}
          style={{ transformOrigin: '160px 12px' }}
        >
          <path d="M160 4 L160 20 M152 12 L168 12" stroke={color} strokeWidth="1.8" strokeLinecap="round" />
          <circle cx="160" cy="12" r="3" fill="#FDFCF0" />
        </motion.g>

        {/* Twinkling Stars */}
        {[
          { cx: 80, cy: 14, delay: 0 },
          { cx: 130, cy: 24, delay: 0.5 },
          { cx: 190, cy: 24, delay: 0.8 },
          { cx: 240, cy: 14, delay: 1.2 },
        ].map((star, i) => (
          <motion.circle
            key={i}
            cx={star.cx}
            cy={star.cy}
            r="2.5"
            fill={color}
            animate={{ opacity: [0.2, 1, 0.2], scale: [0.7, 1.3, 0.7] }}
            transition={{ duration: 2, repeat: Infinity, delay: star.delay }}
          />
        ))}
      </svg>
    </div>
  );
};

/**
 * Style 5: Dark Luxury - Celestial Golden Compass / Starburst Emblem
 */
export const AnimatedCelestialStar: React.FC<{ className?: string; color?: string }> = ({
  className = 'w-16 h-16',
  color = '#C5A059',
}) => {
  return (
    <div className={`relative flex items-center justify-center ${className}`}>
      <svg viewBox="0 0 100 100" className="w-full h-full overflow-visible">
        <motion.g
          animate={{ rotate: 360 }}
          transition={{ duration: 20, repeat: Infinity, ease: 'linear' }}
          style={{ transformOrigin: '50px 50px' }}
        >
          <path d="M50 10 L54 44 L88 50 L54 56 L50 90 L46 56 L12 50 L46 44 Z" fill={color} opacity="0.85" />
          <path d="M50 25 L52 47 L74 50 L52 53 L50 75 L48 53 L26 50 L48 47 Z" fill="#FFF" opacity="0.9" />
        </motion.g>
        <circle cx="50" cy="50" r="4" fill="#FDFCF0" />
      </svg>
    </div>
  );
};
