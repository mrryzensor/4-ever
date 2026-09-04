import React from 'react';
import { motion } from 'motion/react';

/**
 * Style 9: Lavender Provence - Animated Lavender Sprigs & Butterfly Divider
 */
export const AnimatedLavenderDivider: React.FC<{ className?: string; color?: string }> = ({
  className = 'w-56 sm:w-72 h-10',
  color = '#7B6D8D',
}) => {
  return (
    <div className={`mx-auto flex items-center justify-center my-4 ${className}`}>
      <svg viewBox="0 0 320 45" fill="none" className="w-full h-full">
        {/* Left Lavender Stem */}
        <motion.path
          d="M15 24 Q 70 14, 135 22"
          stroke={color}
          strokeWidth="1.5"
          strokeLinecap="round"
          fill="none"
          initial={{ pathLength: 0 }}
          animate={{ pathLength: 1 }}
          transition={{ duration: 2, repeat: Infinity, repeatType: 'reverse' }}
        />
        {/* Left Lavender Blossom Florets */}
        {[
          { cx: 50, cy: 19 },
          { cx: 70, cy: 16 },
          { cx: 90, cy: 18 },
          { cx: 110, cy: 20 },
        ].map((floret, i) => (
          <motion.ellipse
            key={i}
            cx={floret.cx}
            cy={floret.cy}
            rx="4"
            ry="2.5"
            fill="#B5A8C8"
            animate={{ scale: [0.85, 1.15, 0.85], opacity: [0.7, 1, 0.7] }}
            transition={{ duration: 2.2, repeat: Infinity, delay: i * 0.2 }}
          />
        ))}

        {/* Center Animated Provence Butterfly */}
        <motion.g
          animate={{
            y: [-3, 3, -3],
            rotate: [-4, 4, -4],
          }}
          transition={{ duration: 2.5, repeat: Infinity, ease: 'easeInOut' }}
          style={{ transformOrigin: '160px 20px' }}
        >
          {/* Butterfly Body */}
          <line x1="160" y1="14" x2="160" y2="26" stroke="#4A3E56" strokeWidth="1.5" strokeLinecap="round" />
          {/* Left Wings */}
          <motion.path
            d="M160 16 C152 8, 146 16, 160 20 C150 22, 152 28, 160 24"
            fill="#9D8BB0"
            animate={{ scaleX: [1, 0.4, 1] }}
            transition={{ duration: 0.8, repeat: Infinity, ease: 'easeInOut' }}
            style={{ transformOrigin: '160px 20px' }}
          />
          {/* Right Wings */}
          <motion.path
            d="M160 16 C168 8, 174 16, 160 20 C170 22, 168 28, 160 24"
            fill="#9D8BB0"
            animate={{ scaleX: [1, 0.4, 1] }}
            transition={{ duration: 0.8, repeat: Infinity, ease: 'easeInOut' }}
            style={{ transformOrigin: '160px 20px' }}
          />
        </motion.g>

        {/* Right Lavender Stem */}
        <motion.path
          d="M305 24 Q 250 14, 185 22"
          stroke={color}
          strokeWidth="1.5"
          strokeLinecap="round"
          fill="none"
          initial={{ pathLength: 0 }}
          animate={{ pathLength: 1 }}
          transition={{ duration: 2, repeat: Infinity, repeatType: 'reverse' }}
        />
        {/* Right Lavender Blossom Florets */}
        {[
          { cx: 270, cy: 19 },
          { cx: 250, cy: 16 },
          { cx: 230, cy: 18 },
          { cx: 210, cy: 20 },
        ].map((floret, i) => (
          <motion.ellipse
            key={i}
            cx={floret.cx}
            cy={floret.cy}
            rx="4"
            ry="2.5"
            fill="#B5A8C8"
            animate={{ scale: [0.85, 1.15, 0.85], opacity: [0.7, 1, 0.7] }}
            transition={{ duration: 2.2, repeat: Infinity, delay: i * 0.2 }}
          />
        ))}
      </svg>
    </div>
  );
};

/**
 * Style 9: Lavender Provence - Flapping Butterfly & Lavender Sprig Emblem
 */
export const AnimatedLavenderButterflyEmblem: React.FC<{ className?: string; color?: string }> = ({
  className = 'w-16 h-16',
  color = '#7B6D8D',
}) => {
  return (
    <div className={`relative flex items-center justify-center ${className}`}>
      <svg viewBox="0 0 100 100" className="w-full h-full overflow-visible">
        {/* Lavender Sprig Arc */}
        <motion.path
          d="M20 80 Q 35 40, 75 25"
          stroke={color}
          strokeWidth="2"
          strokeLinecap="round"
          fill="none"
          initial={{ pathLength: 0 }}
          animate={{ pathLength: 1 }}
          transition={{ duration: 2.5, repeat: Infinity, repeatType: 'reverse' }}
        />
        {[0.2, 0.4, 0.6, 0.8].map((t, idx) => (
          <motion.ellipse
            key={idx}
            cx={25 + idx * 14}
            cy={70 - idx * 13}
            rx="5"
            ry="3"
            fill="#9D8BB0"
            transform={`rotate(-35 ${25 + idx * 14} ${70 - idx * 13})`}
            animate={{ scale: [0.9, 1.15, 0.9] }}
            transition={{ duration: 2, repeat: Infinity, delay: idx * 0.2 }}
          />
        ))}

        {/* Dancing Butterfly */}
        <motion.g
          animate={{
            x: [0, 4, -4, 0],
            y: [0, -4, 2, 0],
          }}
          transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
          style={{ transformOrigin: '70px 30px' }}
        >
          <path d="M70 25 C64 16, 58 24, 70 30 C58 34, 62 42, 70 36" fill="#B5A8C8" />
          <path d="M70 25 C76 16, 82 24, 70 30 C82 34, 78 42, 70 36" fill="#7B6D8D" />
          <line x1="70" y1="22" x2="70" y2="38" stroke="#4A3E56" strokeWidth="1.5" strokeLinecap="round" />
        </motion.g>
      </svg>
    </div>
  );
};
