import React from 'react';
import { motion } from 'motion/react';

/**
 * Style 11: Coastal Breeze - Ocean Wave & Pearl Seashell Divider
 */
export const AnimatedCoastalBreezeDivider: React.FC<{ className?: string; color?: string }> = ({
  className = 'w-56 sm:w-72 h-10',
  color = '#2B6CB0',
}) => {
  return (
    <div className={`mx-auto flex items-center justify-center my-4 ${className}`}>
      <svg viewBox="0 0 320 45" fill="none" className="w-full h-full">
        {/* Left Rolling Wave */}
        <motion.path
          d="M15 26 C45 15, 65 35, 95 24 C115 16, 130 26, 140 22"
          stroke={color}
          strokeWidth="1.8"
          strokeLinecap="round"
          fill="none"
          initial={{ pathLength: 0 }}
          animate={{ pathLength: 1 }}
          transition={{ duration: 2.5, repeat: Infinity, repeatType: 'reverse' }}
        />
        {/* Wave Foam Sprays */}
        <motion.circle
          cx="60"
          cy="18"
          r="1.8"
          fill="#90CDF4"
          animate={{ y: [-3, 3, -3], opacity: [0.3, 0.9, 0.3] }}
          transition={{ duration: 1.8, repeat: Infinity }}
        />
        <motion.circle
          cx="100"
          cy="16"
          r="1.5"
          fill="#90CDF4"
          animate={{ y: [3, -3, 3], opacity: [0.4, 1, 0.4] }}
          transition={{ duration: 2, repeat: Infinity, delay: 0.3 }}
        />

        {/* Center Pearl Seashell with Glowing Core */}
        <motion.g
          animate={{ scale: [0.92, 1.08, 0.92], y: [-2, 2, -2] }}
          transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
          style={{ transformOrigin: '160px 22px' }}
        >
          {/* Fan Shell */}
          <path
            d="M148 28 C144 18, 154 12, 160 12 C166 12, 176 18, 172 28 Z"
            fill="#D4A373"
            opacity="0.85"
          />
          {/* Shell ribs */}
          <line x1="160" y1="28" x2="152" y2="16" stroke="#FFFFFF" strokeWidth="0.8" opacity="0.8" />
          <line x1="160" y1="28" x2="160" y2="13" stroke="#FFFFFF" strokeWidth="0.8" opacity="0.8" />
          <line x1="160" y1="28" x2="168" y2="16" stroke="#FFFFFF" strokeWidth="0.8" opacity="0.8" />
          {/* Glowing Pearl */}
          <circle cx="160" cy="24" r="3" fill="#FFFFFF" filter="drop-shadow(0 0 4px #90CDF4)" />
        </motion.g>

        {/* Right Rolling Wave */}
        <motion.path
          d="M305 26 C275 15, 255 35, 225 24 C205 16, 190 26, 180 22"
          stroke={color}
          strokeWidth="1.8"
          strokeLinecap="round"
          fill="none"
          initial={{ pathLength: 0 }}
          animate={{ pathLength: 1 }}
          transition={{ duration: 2.5, repeat: Infinity, repeatType: 'reverse' }}
        />
        {/* Right Foam Sprays */}
        <motion.circle
          cx="260"
          cy="18"
          r="1.8"
          fill="#90CDF4"
          animate={{ y: [-3, 3, -3], opacity: [0.3, 0.9, 0.3] }}
          transition={{ duration: 1.8, repeat: Infinity, delay: 0.5 }}
        />
        <motion.circle
          cx="220"
          cy="16"
          r="1.5"
          fill="#90CDF4"
          animate={{ y: [3, -3, 3], opacity: [0.4, 1, 0.4] }}
          transition={{ duration: 2, repeat: Infinity, delay: 0.8 }}
        />
      </svg>
    </div>
  );
};

/**
 * Style 11: Coastal Breeze - Nautical Compass & Pearl Emblem
 */
export const AnimatedSeashellPearlEmblem: React.FC<{ className?: string; color?: string }> = ({
  className = 'w-16 h-16',
  color = '#2B6CB0',
}) => {
  return (
    <div className={`relative flex items-center justify-center ${className}`}>
      <svg viewBox="0 0 100 100" className="w-full h-full overflow-visible">
        {/* Wave Ring */}
        <motion.circle
          cx="50"
          cy="50"
          r="38"
          stroke={color}
          strokeWidth="2"
          strokeDasharray="6 4"
          fill="none"
          animate={{ rotate: 360 }}
          transition={{ duration: 24, repeat: Infinity, ease: 'linear' }}
          style={{ transformOrigin: '50px 50px' }}
        />

        {/* Seashell with pearl */}
        <motion.g
          animate={{ scale: [0.95, 1.05, 0.95] }}
          transition={{ duration: 2.8, repeat: Infinity, ease: 'easeInOut' }}
          style={{ transformOrigin: '50px 50px' }}
        >
          <path
            d="M30 65 C22 40, 40 28, 50 28 C60 28, 78 40, 70 65 Z"
            fill="#D4A373"
          />
          <path d="M50 65 L36 38 M50 65 L50 30 M50 65 L64 38" stroke="#FFFFFF" strokeWidth="1.5" strokeLinecap="round" />
          <circle cx="50" cy="58" r="6" fill="#FFFFFF" stroke="#90CDF4" strokeWidth="1" />
        </motion.g>
      </svg>
    </div>
  );
};
