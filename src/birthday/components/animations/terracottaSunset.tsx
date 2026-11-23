import React from 'react';
import { motion } from 'motion/react';

/**
 * Style 8: Terracotta Sunset - Desert Sunset Dunes & Horizon Divider
 */
export const AnimatedTerracottaSunsetDivider: React.FC<{ className?: string; color?: string }> = ({
  className = 'w-56 sm:w-72 h-10',
  color = '#E07A5F',
}) => {
  return (
    <div className={`mx-auto flex items-center justify-center my-4 ${className}`}>
      <svg viewBox="0 0 320 45" fill="none" className="w-full h-full">
        {/* Mountain Silhouette Baseline */}
        <motion.path
          d="M10 32 L70 20 L130 30 L160 22 L190 30 L250 20 L310 32"
          stroke={color}
          strokeWidth="1.5"
          strokeLinecap="round"
          initial={{ pathLength: 0 }}
          animate={{ pathLength: 1 }}
          transition={{ duration: 2.2, repeat: Infinity, repeatType: 'reverse' }}
        />

        {/* Setting Sun with Glowing Gradient Rings */}
        <motion.g
          animate={{ scale: [0.9, 1.12, 0.9], y: [-2, 2, -2] }}
          transition={{ duration: 3.5, repeat: Infinity, ease: 'easeInOut' }}
          style={{ transformOrigin: '160px 22px' }}
        >
          {/* Half Sun Arch */}
          <path d="M142 22 A 18 18 0 0 1 178 22 Z" fill="#DDA15E" opacity="0.9" />
          <path d="M148 22 A 12 12 0 0 1 172 22 Z" fill="#E07A5F" />
          <circle cx="160" cy="16" r="3" fill="#FFF" opacity="0.8" />
        </motion.g>

        {/* Floating warm sparkles / evening dust */}
        {[
          { cx: 80, cy: 12, delay: 0 },
          { cx: 120, cy: 8, delay: 0.4 },
          { cx: 200, cy: 8, delay: 0.8 },
          { cx: 240, cy: 12, delay: 1.2 },
        ].map((pt, i) => (
          <motion.circle
            key={i}
            cx={pt.cx}
            cy={pt.cy}
            r="2"
            fill="#DDA15E"
            animate={{ opacity: [0.2, 1, 0.2], scale: [0.7, 1.3, 0.7] }}
            transition={{ duration: 2, repeat: Infinity, delay: pt.delay }}
          />
        ))}
      </svg>
    </div>
  );
};

/**
 * Style 8: Terracotta Sunset - Sun & Desert Agave Emblem
 */
export const AnimatedSunsetDesertEmblem: React.FC<{ className?: string; color?: string }> = ({
  className = 'w-16 h-16',
  color = '#E07A5F',
}) => {
  return (
    <div className={`relative flex items-center justify-center ${className}`}>
      <svg viewBox="0 0 100 100" className="w-full h-full overflow-visible">
        {/* Outer Warm Arch */}
        <motion.circle
          cx="50"
          cy="50"
          r="38"
          stroke={color}
          strokeWidth="2"
          fill="none"
          strokeDasharray="5 4"
          animate={{ rotate: 360 }}
          transition={{ duration: 26, repeat: Infinity, ease: 'linear' }}
          style={{ transformOrigin: '50px 50px' }}
        />

        {/* Central Sun & Desert Horizon */}
        <path d="M22 62 L78 62" stroke="#3D231E" strokeWidth="2" strokeLinecap="round" />
        <motion.path
          d="M32 62 A 18 18 0 0 1 68 62 Z"
          fill="#DDA15E"
          animate={{ scaleY: [0.95, 1.08, 0.95] }}
          transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
          style={{ transformOrigin: '50px 62px' }}
        />
        {/* Desert Flora/Sun rays */}
        <motion.g
          animate={{ rotate: [-3, 3, -3] }}
          transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
          style={{ transformOrigin: '50px 62px' }}
        >
          <path d="M50 62 L50 40" stroke="#E07A5F" strokeWidth="2" strokeLinecap="round" />
          <path d="M50 50 Q 42 42, 38 46" stroke="#E07A5F" strokeWidth="1.5" strokeLinecap="round" fill="none" />
          <path d="M50 50 Q 58 42, 62 46" stroke="#E07A5F" strokeWidth="1.5" strokeLinecap="round" fill="none" />
        </motion.g>
      </svg>
    </div>
  );
};
