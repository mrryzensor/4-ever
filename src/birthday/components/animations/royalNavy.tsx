import React from 'react';
import { motion } from 'motion/react';

/**
 * Style 7: Royal Navy & Gold - Baroque Royal Filigree Divider
 */
export const AnimatedRoyalNavyDivider: React.FC<{ className?: string; color?: string }> = ({
  className = 'w-56 sm:w-72 h-10',
  color = '#C5A059',
}) => {
  return (
    <div className={`mx-auto flex items-center justify-center my-4 ${className}`}>
      <svg viewBox="0 0 320 45" fill="none" className="w-full h-full">
        {/* Left Baroque Flourish */}
        <motion.path
          d="M15 22 C60 10, 100 32, 135 22"
          stroke={color}
          strokeWidth="1.6"
          strokeLinecap="round"
          fill="none"
          initial={{ pathLength: 0 }}
          animate={{ pathLength: 1 }}
          transition={{ duration: 2, repeat: Infinity, repeatType: 'reverse' }}
        />
        <motion.path
          d="M75 16 C85 8, 95 18, 90 24"
          stroke={color}
          strokeWidth="1.2"
          fill="none"
          animate={{ opacity: [0.4, 1, 0.4] }}
          transition={{ duration: 2.2, repeat: Infinity }}
        />

        {/* Center Imperial Crown / Fleur-de-lis Crest */}
        <motion.g
          animate={{ scale: [0.92, 1.1, 0.92], y: [-1.5, 1.5, -1.5] }}
          transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
          style={{ transformOrigin: '160px 22px' }}
        >
          {/* Crown Base */}
          <path d="M148 28 L172 28 L170 31 L150 31 Z" fill={color} />
          {/* Crown Spikes */}
          <path
            d="M148 28 L145 16 L153 22 L160 12 L167 22 L175 16 L172 28 Z"
            fill={color}
            stroke="#96773B"
            strokeWidth="0.8"
          />
          {/* Crown Jewels */}
          <circle cx="160" cy="12" r="2" fill="#FFFFFF" />
          <circle cx="145" cy="16" r="1.5" fill="#FFFFFF" />
          <circle cx="175" cy="16" r="1.5" fill="#FFFFFF" />
        </motion.g>

        {/* Right Baroque Flourish */}
        <motion.path
          d="M305 22 C260 10, 220 32, 185 22"
          stroke={color}
          strokeWidth="1.6"
          strokeLinecap="round"
          fill="none"
          initial={{ pathLength: 0 }}
          animate={{ pathLength: 1 }}
          transition={{ duration: 2, repeat: Infinity, repeatType: 'reverse' }}
        />
        <motion.path
          d="M245 16 C235 8, 225 18, 230 24"
          stroke={color}
          strokeWidth="1.2"
          fill="none"
          animate={{ opacity: [0.4, 1, 0.4] }}
          transition={{ duration: 2.2, repeat: Infinity, delay: 0.3 }}
        />
      </svg>
    </div>
  );
};

/**
 * Style 7: Royal Navy & Gold - Imperial Heraldic Crest Emblem
 */
export const AnimatedRoyalCrownEmblem: React.FC<{ className?: string; color?: string }> = ({
  className = 'w-16 h-16',
  color = '#C5A059',
}) => {
  return (
    <div className={`relative flex items-center justify-center ${className}`}>
      <svg viewBox="0 0 100 100" className="w-full h-full overflow-visible">
        {/* Shield Frame with Golden Glow */}
        <motion.path
          d="M50 15 C75 15, 85 25, 80 55 C75 75, 50 90, 50 90 C50 90, 25 75, 20 55 C15 25, 25 15, 50 15 Z"
          stroke={color}
          strokeWidth="2"
          fill="#0D1B2A"
          animate={{ scale: [0.97, 1.03, 0.97] }}
          transition={{ duration: 3.5, repeat: Infinity, ease: 'easeInOut' }}
          style={{ transformOrigin: '50px 50px' }}
        />

        {/* Crown Motif inside shield */}
        <motion.g
          animate={{ y: [-2, 2, -2] }}
          transition={{ duration: 2.5, repeat: Infinity, ease: 'easeInOut' }}
        >
          <path
            d="M32 58 L68 58 L65 42 L57 50 L50 35 L43 50 L35 42 Z"
            fill={color}
            stroke="#FDE68A"
            strokeWidth="1"
          />
          <circle cx="50" cy="35" r="2.5" fill="#FFF" />
          <circle cx="35" cy="42" r="2" fill="#FFF" />
          <circle cx="65" cy="42" r="2" fill="#FFF" />
          <circle cx="50" cy="52" r="3" fill="#0D1B2A" stroke={color} strokeWidth="1" />
        </motion.g>
      </svg>
    </div>
  );
};
