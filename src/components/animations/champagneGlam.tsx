import React from 'react';
import { motion } from 'motion/react';

/**
 * Style 12: Champagne Glam & Pearls - Art Deco Fan & Pearl Divider
 */
export const AnimatedChampagneGlamDivider: React.FC<{ className?: string; color?: string }> = ({
  className = 'w-56 sm:w-72 h-10',
  color = '#C39B60',
}) => {
  return (
    <div className={`mx-auto flex items-center justify-center my-4 ${className}`}>
      <svg viewBox="0 0 320 45" fill="none" className="w-full h-full">
        {/* Left Art Deco Stepped Lines */}
        <motion.path
          d="M15 22 L70 22 L80 16 L120 16 L130 22 L140 22"
          stroke={color}
          strokeWidth="1.5"
          strokeLinecap="round"
          fill="none"
          initial={{ pathLength: 0 }}
          animate={{ pathLength: 1 }}
          transition={{ duration: 2, repeat: Infinity, repeatType: 'reverse' }}
        />

        {/* Center Art Deco Sunburst Fan with Pearls */}
        <motion.g
          animate={{ scale: [0.92, 1.1, 0.92], rotate: [0, 4, 0] }}
          transition={{ duration: 3.2, repeat: Infinity, ease: 'easeInOut' }}
          style={{ transformOrigin: '160px 22px' }}
        >
          {/* Fan Rays */}
          {[-45, -30, -15, 0, 15, 30, 45].map((deg, i) => (
            <line
              key={i}
              x1="160"
              y1="28"
              x2={160 + 16 * Math.sin((deg * Math.PI) / 180)}
              y2={28 - 16 * Math.cos((deg * Math.PI) / 180)}
              stroke={color}
              strokeWidth="1.2"
            />
          ))}
          {/* Concentric Arcs */}
          <path d="M148 28 A 12 12 0 0 1 172 28" stroke={color} strokeWidth="1.2" fill="none" />
          <path d="M152 28 A 8 8 0 0 1 168 28" stroke={color} strokeWidth="1.2" fill="none" />
          {/* Central Champagne Crystal Gem */}
          <rect x="156" y="24" width="8" height="8" fill="#FFFDF0" stroke={color} strokeWidth="1" transform="rotate(45 160 28)" />
          {/* Top Pearl Sparkle */}
          <circle cx="160" cy="10" r="2" fill="#FFFFFF" />
        </motion.g>

        {/* Right Art Deco Stepped Lines */}
        <motion.path
          d="M305 22 L250 22 L240 16 L200 16 L190 22 L180 22"
          stroke={color}
          strokeWidth="1.5"
          strokeLinecap="round"
          fill="none"
          initial={{ pathLength: 0 }}
          animate={{ pathLength: 1 }}
          transition={{ duration: 2, repeat: Infinity, repeatType: 'reverse' }}
        />

        {/* Floating Golden Champagne Sparkles */}
        {[
          { cx: 50, cy: 12, delay: 0 },
          { cx: 100, cy: 10, delay: 0.4 },
          { cx: 220, cy: 10, delay: 0.8 },
          { cx: 270, cy: 12, delay: 1.2 },
        ].map((sp, i) => (
          <motion.polygon
            key={i}
            points={`${sp.cx},${sp.cy - 3} ${sp.cx + 2},${sp.cy} ${sp.cx},${sp.cy + 3} ${sp.cx - 2},${sp.cy}`}
            fill="#FDE68A"
            animate={{ opacity: [0.2, 1, 0.2], scale: [0.7, 1.4, 0.7] }}
            transition={{ duration: 1.8, repeat: Infinity, delay: sp.delay }}
          />
        ))}
      </svg>
    </div>
  );
};

/**
 * Style 12: Champagne Glam & Pearls - Art Deco Diamond Sunburst Emblem
 */
export const AnimatedArtDecoFanEmblem: React.FC<{ className?: string; color?: string }> = ({
  className = 'w-16 h-16',
  color = '#C39B60',
}) => {
  return (
    <div className={`relative flex items-center justify-center ${className}`}>
      <svg viewBox="0 0 100 100" className="w-full h-full overflow-visible">
        <motion.g
          animate={{ rotate: 360 }}
          transition={{ duration: 28, repeat: Infinity, ease: 'linear' }}
          style={{ transformOrigin: '50px 50px' }}
        >
          <rect x="22" y="22" width="56" height="56" stroke={color} strokeWidth="1.5" fill="none" />
          <rect x="22" y="22" width="56" height="56" stroke={color} strokeWidth="1.2" fill="none" transform="rotate(45 50 50)" />
        </motion.g>

        {/* Center Champagne Pearl with Shimmer */}
        <motion.circle
          cx="50"
          cy="50"
          r="12"
          fill="#FCF9F2"
          stroke={color}
          strokeWidth="2"
          animate={{ scale: [0.92, 1.08, 0.92] }}
          transition={{ duration: 2.5, repeat: Infinity, ease: 'easeInOut' }}
        />
        <circle cx="50" cy="50" r="5" fill="#C39B60" />
        <circle cx="48" cy="48" r="2" fill="#FFFFFF" />
      </svg>
    </div>
  );
};
