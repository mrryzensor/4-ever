import React from 'react';
import { motion } from 'motion/react';

/**
 * Style 2: Romantic Floral - Animated Rose Arch Divider with Blooming Petals
 */
export const AnimatedRoseArchDivider: React.FC<{ className?: string; color?: string }> = ({
  className = 'w-56 sm:w-72 h-10',
  color = '#8A6D65',
}) => {
  return (
    <div className={`mx-auto flex items-center justify-center my-4 ${className}`}>
      <svg viewBox="0 0 320 45" fill="none" className="w-full h-full">
        {/* Graceful Curved Vine */}
        <motion.path
          d="M10 22 Q 80 5, 160 22 T 310 22"
          stroke={color}
          strokeWidth="1.5"
          strokeLinecap="round"
          initial={{ pathLength: 0 }}
          animate={{ pathLength: 1 }}
          transition={{ duration: 2, repeat: Infinity, repeatType: 'reverse' }}
        />

        {/* Center Blooming Rose */}
        <motion.g
          animate={{ scale: [0.9, 1.12, 0.9] }}
          transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
          style={{ transformOrigin: '160px 22px' }}
        >
          <circle cx="160" cy="22" r="8" fill="#E2B18E" opacity="0.9" />
          <path
            d="M156 18 C158 14, 162 14, 164 18 C166 22, 160 26, 156 22"
            fill="#C59B7E"
          />
          <circle cx="160" cy="22" r="3" fill="#FFF" opacity="0.8" />
        </motion.g>

        {/* Left Rose Buds */}
        <motion.circle
          cx="80"
          cy="16"
          r="4.5"
          fill="#E2B18E"
          animate={{ y: [-2, 2, -2] }}
          transition={{ duration: 2.2, repeat: Infinity }}
        />
        {/* Right Rose Buds */}
        <motion.circle
          cx="240"
          cy="16"
          r="4.5"
          fill="#E2B18E"
          animate={{ y: [2, -2, 2] }}
          transition={{ duration: 2.2, repeat: Infinity, delay: 0.4 }}
        />
      </svg>
    </div>
  );
};

/**
 * Style 2: Romantic Floral - Animated Twin Swans Heart
 */
export const AnimatedTwinSwans: React.FC<{ className?: string }> = ({
  className = 'w-16 h-16',
}) => {
  return (
    <div className={`relative flex items-center justify-center ${className}`}>
      <svg viewBox="0 0 100 80" className="w-full h-full overflow-visible">
        {/* Water Ripple Lines */}
        <motion.path
          d="M10 65 Q 50 62, 90 65"
          stroke="#E8DFD8"
          strokeWidth="1.5"
          strokeLinecap="round"
          animate={{ opacity: [0.3, 0.9, 0.3] }}
          transition={{ duration: 2.5, repeat: Infinity }}
        />

        {/* Left Swan */}
        <motion.g
          animate={{ rotate: [-2, 2, -2] }}
          transition={{ duration: 3.5, repeat: Infinity, ease: 'easeInOut' }}
          style={{ transformOrigin: '35px 60px' }}
        >
          <ellipse cx="35" cy="52" rx="16" ry="10" fill="#FFF" stroke="#E8DFD8" strokeWidth="1.2" />
          <path
            d="M45 50 C45 30, 48 18, 43 18 C38 18, 38 28, 48 38"
            stroke="#8A6D65"
            strokeWidth="2.5"
            fill="none"
            strokeLinecap="round"
          />
          <polygon points="49,20 54,22 49,24" fill="#D4A373" />
        </motion.g>

        {/* Right Swan */}
        <motion.g
          animate={{ rotate: [2, -2, 2] }}
          transition={{ duration: 3.5, repeat: Infinity, ease: 'easeInOut', delay: 0.3 }}
          style={{ transformOrigin: '65px 60px' }}
        >
          <ellipse cx="65" cy="52" rx="16" ry="10" fill="#FFF" stroke="#E8DFD8" strokeWidth="1.2" />
          <path
            d="M55 50 C55 30, 52 18, 57 18 C62 18, 62 28, 52 38"
            stroke="#8A6D65"
            strokeWidth="2.5"
            fill="none"
            strokeLinecap="round"
          />
          <polygon points="51,20 46,22 51,24" fill="#D4A373" />
        </motion.g>

        {/* Center Heart Sparkle */}
        <motion.path
          d="M50 12 L50 16 M48 14 L52 14"
          stroke="#E2B18E"
          strokeWidth="1.5"
          strokeLinecap="round"
          animate={{ scale: [0.8, 1.4, 0.8], opacity: [0.4, 1, 0.4] }}
          transition={{ duration: 2, repeat: Infinity }}
          style={{ transformOrigin: '50px 14px' }}
        />
      </svg>
    </div>
  );
};
