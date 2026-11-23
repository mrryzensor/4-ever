import React from 'react';
import { motion } from 'motion/react';

/**
 * Style 4: Minimal Editorial - Geometric Modernist Line Divider
 */
export const AnimatedEditorialLineDivider: React.FC<{ className?: string; color?: string }> = ({
  className = 'w-56 sm:w-72 h-8',
  color = '#1a1a1a',
}) => {
  return (
    <div className={`mx-auto flex items-center justify-center my-4 ${className}`}>
      <svg viewBox="0 0 320 30" fill="none" className="w-full h-full">
        {/* Left Fine Line */}
        <motion.line
          x1="20"
          y1="15"
          x2="135"
          y2="15"
          stroke={color}
          strokeWidth="1"
          initial={{ pathLength: 0 }}
          animate={{ pathLength: 1 }}
          transition={{ duration: 1.5, repeat: Infinity, repeatType: 'reverse' }}
        />

        {/* Center Diamond & Monogram Square */}
        <motion.rect
          x="153"
          y="8"
          width="14"
          height="14"
          stroke={color}
          strokeWidth="1.2"
          fill="none"
          transform="rotate(45 160 15)"
          animate={{ rotate: [45, 135, 45] }}
          transition={{ duration: 8, repeat: Infinity, ease: 'easeInOut' }}
        />
        <circle cx="160" cy="15" r="2" fill={color} />

        {/* Right Fine Line */}
        <motion.line
          x1="185"
          y1="15"
          x2="300"
          y2="15"
          stroke={color}
          strokeWidth="1"
          initial={{ pathLength: 0 }}
          animate={{ pathLength: 1 }}
          transition={{ duration: 1.5, repeat: Infinity, repeatType: 'reverse' }}
        />
      </svg>
    </div>
  );
};

/**
 * Style 4: Minimal Editorial - Minimalist Vogue Monogram Emblem
 */
export const AnimatedEditorialEmblem: React.FC<{ className?: string; color?: string }> = ({
  className = 'w-16 h-16',
  color = '#1a1a1a',
}) => {
  return (
    <div className={`relative flex items-center justify-center ${className}`}>
      <svg viewBox="0 0 100 100" className="w-full h-full overflow-visible">
        <motion.rect
          x="15"
          y="15"
          width="70"
          height="70"
          stroke={color}
          strokeWidth="1.5"
          fill="none"
          animate={{ rotate: [0, 90, 0] }}
          transition={{ duration: 16, repeat: Infinity, ease: 'easeInOut' }}
          style={{ transformOrigin: '50px 50px' }}
        />
        <motion.rect
          x="25"
          y="25"
          width="50"
          height="50"
          stroke={color}
          strokeWidth="1"
          strokeDasharray="3 3"
          fill="none"
          animate={{ rotate: [0, -90, 0] }}
          transition={{ duration: 16, repeat: Infinity, ease: 'easeInOut' }}
          style={{ transformOrigin: '50px 50px' }}
        />
        <circle cx="50" cy="50" r="4" fill={color} />
      </svg>
    </div>
  );
};
