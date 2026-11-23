import React from 'react';
import { motion } from 'motion/react';

/**
 * Style 6: Watercolor Garden - Animated Eucalyptus & Dew Drops Divider
 */
export const AnimatedWatercolorBranchDivider: React.FC<{ className?: string; color?: string }> = ({
  className = 'w-56 sm:w-72 h-10',
  color = '#526B50',
}) => {
  return (
    <div className={`mx-auto flex items-center justify-center my-4 ${className}`}>
      <svg viewBox="0 0 320 45" fill="none" className="w-full h-full">
        {/* Soft Watercolor Stem */}
        <motion.path
          d="M15 25 C80 15, 140 30, 160 20 C180 10, 240 25, 305 18"
          stroke={color}
          strokeWidth="1.8"
          strokeLinecap="round"
          initial={{ pathLength: 0 }}
          animate={{ pathLength: 1 }}
          transition={{ duration: 2.2, repeat: Infinity, repeatType: 'reverse' }}
        />

        {/* Eucalyptus Round Leaves with Sway */}
        {[
          { cx: 65, cy: 18, rx: 7, ry: 5, rot: -20, delay: 0 },
          { cx: 115, cy: 26, rx: 8, ry: 6, rot: 30, delay: 0.3 },
          { cx: 160, cy: 18, rx: 9, ry: 7, rot: 0, delay: 0.6 },
          { cx: 205, cy: 14, rx: 8, ry: 6, rot: -30, delay: 0.9 },
          { cx: 255, cy: 22, rx: 7, ry: 5, rot: 20, delay: 1.2 },
        ].map((leaf, idx) => (
          <motion.ellipse
            key={idx}
            cx={leaf.cx}
            cy={leaf.cy}
            rx={leaf.rx}
            ry={leaf.ry}
            fill="#7D947B"
            opacity="0.8"
            transform={`rotate(${leaf.rot} ${leaf.cx} ${leaf.cy})`}
            animate={{ scale: [0.92, 1.08, 0.92], opacity: [0.7, 0.95, 0.7] }}
            transition={{ duration: 2.5, repeat: Infinity, delay: leaf.delay }}
          />
        ))}

        {/* Dew Drop Sparkling */}
        <motion.circle
          cx="160"
          cy="18"
          r="2.5"
          fill="#FFF"
          animate={{ opacity: [0.3, 1, 0.3] }}
          transition={{ duration: 1.8, repeat: Infinity }}
        />
      </svg>
    </div>
  );
};

/**
 * Style 6: Watercolor Garden - Botanical Eucalyptus Wreath Emblem
 */
export const AnimatedGardenWreath: React.FC<{ className?: string; color?: string }> = ({
  className = 'w-16 h-16',
  color = '#526B50',
}) => {
  return (
    <div className={`relative flex items-center justify-center ${className}`}>
      <svg viewBox="0 0 100 100" className="w-full h-full overflow-visible">
        <motion.circle
          cx="50"
          cy="50"
          r="36"
          stroke={color}
          strokeWidth="1.5"
          strokeDasharray="4 4"
          fill="none"
          animate={{ rotate: 360 }}
          transition={{ duration: 30, repeat: Infinity, ease: 'linear' }}
          style={{ transformOrigin: '50px 50px' }}
        />
        {[0, 60, 120, 180, 240, 300].map((deg, i) => (
          <motion.ellipse
            key={i}
            cx={50 + 36 * Math.cos((deg * Math.PI) / 180)}
            cy={50 + 36 * Math.sin((deg * Math.PI) / 180)}
            rx="6"
            ry="3.5"
            fill="#7D947B"
            opacity="0.85"
            animate={{ scale: [0.9, 1.15, 0.9] }}
            transition={{ duration: 2.5, repeat: Infinity, delay: i * 0.2 }}
          />
        ))}
        <circle cx="50" cy="50" r="5" fill={color} />
      </svg>
    </div>
  );
};
