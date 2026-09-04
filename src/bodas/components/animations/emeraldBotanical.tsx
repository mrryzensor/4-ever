import React from 'react';
import { motion } from 'motion/react';

/**
 * Style 10: Emerald Botanical - Tropical Palm & Monstera Frond Divider
 */
export const AnimatedEmeraldBotanicalDivider: React.FC<{ className?: string; color?: string }> = ({
  className = 'w-56 sm:w-72 h-10',
  color = '#2D6A4F',
}) => {
  return (
    <div className={`mx-auto flex items-center justify-center my-4 ${className}`}>
      <svg viewBox="0 0 320 45" fill="none" className="w-full h-full">
        {/* Left Palm Frond Spine */}
        <motion.path
          d="M15 26 C60 14, 100 30, 140 22"
          stroke={color}
          strokeWidth="1.8"
          strokeLinecap="round"
          fill="none"
          initial={{ pathLength: 0 }}
          animate={{ pathLength: 1 }}
          transition={{ duration: 2.2, repeat: Infinity, repeatType: 'reverse' }}
        />
        {/* Left Palm Leaves */}
        {[
          { x1: 45, y1: 22, x2: 40, y2: 12 },
          { x1: 75, y1: 21, x2: 70, y2: 10 },
          { x1: 105, y1: 23, x2: 100, y2: 12 },
          { x1: 125, y1: 23, x2: 125, y2: 14 },
        ].map((leaf, i) => (
          <motion.path
            key={i}
            d={`M${leaf.x1} ${leaf.y1} Q ${leaf.x2 + 5} ${(leaf.y1 + leaf.y2) / 2}, ${leaf.x2} ${leaf.y2}`}
            stroke="#52B788"
            strokeWidth="1.5"
            strokeLinecap="round"
            fill="none"
            animate={{ rotate: [-4, 4, -4] }}
            transition={{ duration: 2.5, repeat: Infinity, delay: i * 0.2 }}
            style={{ transformOrigin: `${leaf.x1}px ${leaf.y1}px` }}
          />
        ))}

        {/* Center Emerald Gold Palm Diamond */}
        <motion.g
          animate={{ scale: [0.9, 1.15, 0.9], rotate: [0, 45, 0] }}
          transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
          style={{ transformOrigin: '160px 22px' }}
        >
          <rect x="153" y="15" width="14" height="14" fill="#D4AF37" transform="rotate(45 160 22)" opacity="0.9" />
          <circle cx="160" cy="22" r="3" fill="#0B2017" />
        </motion.g>

        {/* Right Palm Frond Spine */}
        <motion.path
          d="M305 26 C260 14, 220 30, 180 22"
          stroke={color}
          strokeWidth="1.8"
          strokeLinecap="round"
          fill="none"
          initial={{ pathLength: 0 }}
          animate={{ pathLength: 1 }}
          transition={{ duration: 2.2, repeat: Infinity, repeatType: 'reverse' }}
        />
        {/* Right Palm Leaves */}
        {[
          { x1: 275, y1: 22, x2: 280, y2: 12 },
          { x1: 245, y1: 21, x2: 250, y2: 10 },
          { x1: 215, y1: 23, x2: 220, y2: 12 },
          { x1: 195, y1: 23, x2: 195, y2: 14 },
        ].map((leaf, i) => (
          <motion.path
            key={i}
            d={`M${leaf.x1} ${leaf.y1} Q ${leaf.x2 - 5} ${(leaf.y1 + leaf.y2) / 2}, ${leaf.x2} ${leaf.y2}`}
            stroke="#52B788"
            strokeWidth="1.5"
            strokeLinecap="round"
            fill="none"
            animate={{ rotate: [4, -4, 4] }}
            transition={{ duration: 2.5, repeat: Infinity, delay: i * 0.2 }}
            style={{ transformOrigin: `${leaf.x1}px ${leaf.y1}px` }}
          />
        ))}
      </svg>
    </div>
  );
};

/**
 * Style 10: Emerald Botanical - Animated Monstera Leaf Emblem
 */
export const AnimatedMonsteraEmblem: React.FC<{ className?: string; color?: string }> = ({
  className = 'w-16 h-16',
  color = '#2D6A4F',
}) => {
  return (
    <div className={`relative flex items-center justify-center ${className}`}>
      <svg viewBox="0 0 100 100" className="w-full h-full overflow-visible">
        <motion.g
          animate={{
            rotate: [-3, 3, -3],
            scale: [0.96, 1.04, 0.96],
          }}
          transition={{ duration: 3.5, repeat: Infinity, ease: 'easeInOut' }}
          style={{ transformOrigin: '50px 85px' }}
        >
          {/* Main Leaf Body */}
          <path
            d="M50 15 C30 25, 20 50, 25 75 C30 85, 45 90, 50 90 C55 90, 70 85, 75 75 C80 50, 70 25, 50 15 Z"
            fill={color}
          />
          {/* Leaf Rib Main */}
          <line x1="50" y1="20" x2="50" y2="88" stroke="#D4AF37" strokeWidth="2" strokeLinecap="round" />
          {/* Leaf Cutouts */}
          <ellipse cx="36" cy="40" rx="4" ry="12" fill="#FAFBF7" transform="rotate(-30 36 40)" />
          <ellipse cx="64" cy="40" rx="4" ry="12" fill="#FAFBF7" transform="rotate(30 64 40)" />
          <ellipse cx="34" cy="62" rx="4" ry="10" fill="#FAFBF7" transform="rotate(-40 34 62)" />
          <ellipse cx="66" cy="62" rx="4" ry="10" fill="#FAFBF7" transform="rotate(40 66 62)" />
        </motion.g>
      </svg>
    </div>
  );
};
