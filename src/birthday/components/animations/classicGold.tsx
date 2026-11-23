import React from 'react';
import { motion } from 'motion/react';

/**
 * Style 1: Classic Gold & Olive - Botanical Olive Branch Divider
 */
export const AnimatedFloralDivider: React.FC<{ className?: string; color?: string }> = ({
  className = 'w-48 sm:w-64 h-10',
  color = '#7D8C7A',
}) => {
  return (
    <div className={`mx-auto flex items-center justify-center my-4 ${className}`}>
      <svg viewBox="0 0 300 40" fill="none" className="w-full h-full">
        {/* Left Vine */}
        <motion.path
          d="M10 20 C60 15, 90 28, 135 20"
          stroke={color}
          strokeWidth="1.5"
          strokeLinecap="round"
          initial={{ pathLength: 0, opacity: 0 }}
          animate={{ pathLength: 1, opacity: 0.8 }}
          transition={{ duration: 1.8, repeat: Infinity, repeatType: 'reverse', ease: 'easeInOut' }}
        />
        {/* Left Leaves */}
        <motion.path
          d="M45 18 C40 10, 52 8, 55 17"
          fill={color}
          initial={{ scale: 0, opacity: 0 }}
          animate={{ scale: 1, opacity: 0.7 }}
          transition={{ duration: 1.5, repeat: Infinity, repeatType: 'reverse', delay: 0.3 }}
        />
        <motion.path
          d="M80 23 C76 31, 88 33, 90 24"
          fill={color}
          initial={{ scale: 0, opacity: 0 }}
          animate={{ scale: 1, opacity: 0.7 }}
          transition={{ duration: 1.5, repeat: Infinity, repeatType: 'reverse', delay: 0.5 }}
        />
        <motion.path
          d="M110 20 C108 12, 120 10, 122 19"
          fill={color}
          initial={{ scale: 0, opacity: 0 }}
          animate={{ scale: 1, opacity: 0.7 }}
          transition={{ duration: 1.5, repeat: Infinity, repeatType: 'reverse', delay: 0.7 }}
        />

        {/* Center Heart / Blossom */}
        <motion.g
          initial={{ scale: 0.8 }}
          animate={{ scale: [0.85, 1.15, 0.85] }}
          transition={{ duration: 2.2, repeat: Infinity, ease: 'easeInOut' }}
          style={{ transformOrigin: '150px 20px' }}
        >
          <path
            d="M150 25 C146 20, 140 18, 140 14 C140 10, 144 7, 148 9 C149 10, 150 12, 150 13 C150 12, 151 10, 152 9 C156 7, 160 10, 160 14 C160 18, 154 20, 150 25 Z"
            fill="#D4A373"
          />
          <circle cx="150" cy="15" r="1.5" fill="#FFF" opacity="0.8" />
        </motion.g>

        {/* Right Vine */}
        <motion.path
          d="M290 20 C240 15, 210 28, 165 20"
          stroke={color}
          strokeWidth="1.5"
          strokeLinecap="round"
          initial={{ pathLength: 0, opacity: 0 }}
          animate={{ pathLength: 1, opacity: 0.8 }}
          transition={{ duration: 1.8, repeat: Infinity, repeatType: 'reverse', ease: 'easeInOut' }}
        />
        {/* Right Leaves */}
        <motion.path
          d="M255 18 C260 10, 248 8, 245 17"
          fill={color}
          initial={{ scale: 0, opacity: 0 }}
          animate={{ scale: 1, opacity: 0.7 }}
          transition={{ duration: 1.5, repeat: Infinity, repeatType: 'reverse', delay: 0.3 }}
        />
        <motion.path
          d="M220 23 C224 31, 212 33, 210 24"
          fill={color}
          initial={{ scale: 0, opacity: 0 }}
          animate={{ scale: 1, opacity: 0.7 }}
          transition={{ duration: 1.5, repeat: Infinity, repeatType: 'reverse', delay: 0.5 }}
        />
        <motion.path
          d="M190 20 C192 12, 180 10, 178 19"
          fill={color}
          initial={{ scale: 0, opacity: 0 }}
          animate={{ scale: 1, opacity: 0.7 }}
          transition={{ duration: 1.5, repeat: Infinity, repeatType: 'reverse', delay: 0.7 }}
        />
      </svg>
    </div>
  );
};

/**
 * Style 1: Classic Gold & Olive - Animated Olive Branch Laurel Wreath
 */
export const AnimatedOliveWreath: React.FC<{ className?: string; color?: string }> = ({
  className = 'w-16 h-16',
  color = '#5A5A40',
}) => {
  return (
    <div className={`relative flex items-center justify-center ${className}`}>
      <svg viewBox="0 0 100 100" className="w-full h-full overflow-visible">
        {/* Left Laurel Branch */}
        <motion.path
          d="M50 90 C25 80, 15 50, 30 20"
          stroke={color}
          strokeWidth="2"
          strokeLinecap="round"
          fill="none"
          initial={{ pathLength: 0 }}
          animate={{ pathLength: 1 }}
          transition={{ duration: 2, ease: 'easeInOut' }}
        />
        {/* Left Olive Leaves */}
        {[
          { cx: 38, cy: 80, rx: 7, ry: 3, rot: -40 },
          { cx: 24, cy: 65, rx: 8, ry: 3.5, rot: -60 },
          { cx: 20, cy: 45, rx: 8, ry: 3.5, rot: -80 },
          { cx: 24, cy: 30, rx: 7, ry: 3, rot: -110 },
        ].map((leaf, idx) => (
          <motion.ellipse
            key={`left-${idx}`}
            cx={leaf.cx}
            cy={leaf.cy}
            rx={leaf.rx}
            ry={leaf.ry}
            fill="#7D8C7A"
            transform={`rotate(${leaf.rot} ${leaf.cx} ${leaf.cy})`}
            animate={{ scale: [0.9, 1.1, 0.9] }}
            transition={{ duration: 2 + idx * 0.4, repeat: Infinity, ease: 'easeInOut' }}
          />
        ))}

        {/* Right Laurel Branch */}
        <motion.path
          d="M50 90 C75 80, 85 50, 70 20"
          stroke={color}
          strokeWidth="2"
          strokeLinecap="round"
          fill="none"
          initial={{ pathLength: 0 }}
          animate={{ pathLength: 1 }}
          transition={{ duration: 2, ease: 'easeInOut' }}
        />
        {/* Right Olive Leaves */}
        {[
          { cx: 62, cy: 80, rx: 7, ry: 3, rot: 40 },
          { cx: 76, cy: 65, rx: 8, ry: 3.5, rot: 60 },
          { cx: 80, cy: 45, rx: 8, ry: 3.5, rot: 80 },
          { cx: 76, cy: 30, rx: 7, ry: 3, rot: 110 },
        ].map((leaf, idx) => (
          <motion.ellipse
            key={`right-${idx}`}
            cx={leaf.cx}
            cy={leaf.cy}
            rx={leaf.rx}
            ry={leaf.ry}
            fill="#7D8C7A"
            transform={`rotate(${leaf.rot} ${leaf.cx} ${leaf.cy})`}
            animate={{ scale: [0.9, 1.1, 0.9] }}
            transition={{ duration: 2 + idx * 0.4, repeat: Infinity, ease: 'easeInOut', delay: 0.3 }}
          />
        ))}

        {/* Golden Central Knot */}
        <motion.circle
          cx="50"
          cy="90"
          r="4"
          fill="#D4A373"
          animate={{ scale: [1, 1.25, 1] }}
          transition={{ duration: 2.5, repeat: Infinity }}
        />
      </svg>
    </div>
  );
};
