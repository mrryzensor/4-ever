import React from 'react';
import { motion } from 'motion/react';

/**
 * Style 3: Boho Chic - Animated Pampas Grass Divider
 */
export const AnimatedPampasGrassDivider: React.FC<{ className?: string; color?: string }> = ({
  className = 'w-56 sm:w-72 h-10',
  color = '#B26E59',
}) => {
  return (
    <div className={`mx-auto flex items-center justify-center my-4 ${className}`}>
      <svg viewBox="0 0 320 45" fill="none" className="w-full h-full">
        {/* Terracotta Horizontal Baseline */}
        <line x1="20" y1="22" x2="300" y2="22" stroke={color} strokeWidth="1" strokeDasharray="3 3" opacity="0.6" />

        {/* Central Boho Sun Arch */}
        <motion.g
          animate={{ scale: [0.92, 1.08, 0.92] }}
          transition={{ duration: 3.5, repeat: Infinity, ease: 'easeInOut' }}
          style={{ transformOrigin: '160px 22px' }}
        >
          <path d="M145 22 A 15 15 0 0 1 175 22 Z" fill="#E8B4A2" opacity="0.85" />
          <circle cx="160" cy="14" r="3" fill="#B26E59" />
          {/* Sun Rays */}
          {[0, 30, 60, 90, 120, 150, 180].map((deg, i) => (
            <motion.line
              key={i}
              x1="160"
              y1="22"
              x2={160 + 20 * Math.cos(((deg - 180) * Math.PI) / 180)}
              y2={22 + 20 * Math.sin(((deg - 180) * Math.PI) / 180)}
              stroke="#B26E59"
              strokeWidth="1.2"
              opacity="0.7"
              animate={{ opacity: [0.3, 0.9, 0.3] }}
              transition={{ duration: 2, repeat: Infinity, delay: i * 0.15 }}
            />
          ))}
        </motion.g>

        {/* Left Pampas Plume */}
        <motion.path
          d="M80 22 Q 95 10, 110 22"
          stroke="#7D8C7A"
          strokeWidth="1.5"
          fill="none"
          animate={{ rotate: [-4, 4, -4] }}
          transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
          style={{ transformOrigin: '80px 22px' }}
        />
        {/* Right Pampas Plume */}
        <motion.path
          d="M240 22 Q 225 10, 210 22"
          stroke="#7D8C7A"
          strokeWidth="1.5"
          fill="none"
          animate={{ rotate: [4, -4, 4] }}
          transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut', delay: 0.4 }}
          style={{ transformOrigin: '240px 22px' }}
        />
      </svg>
    </div>
  );
};

/**
 * Style 3: Boho Chic - Animated Sun Mandala
 */
export const AnimatedBohoSunMandala: React.FC<{ className?: string }> = ({
  className = 'w-16 h-16',
}) => {
  return (
    <div className={`relative flex items-center justify-center ${className}`}>
      <svg viewBox="0 0 100 100" className="w-full h-full overflow-visible">
        {/* Outer Rotating Sun Rays Ring */}
        <motion.g
          animate={{ rotate: 360 }}
          transition={{ duration: 24, repeat: Infinity, ease: 'linear' }}
          style={{ transformOrigin: '50px 50px' }}
        >
          {Array.from({ length: 12 }).map((_, i) => {
            const angle = (i * 360) / 12;
            return (
              <line
                key={i}
                x1="50"
                y1="14"
                x2="50"
                y2="22"
                stroke="#B26E59"
                strokeWidth="2"
                strokeLinecap="round"
                transform={`rotate(${angle} 50 50)`}
              />
            );
          })}
        </motion.g>

        {/* Center terracotta disc */}
        <motion.circle
          cx="50"
          cy="50"
          r="18"
          fill="#FAF8F2"
          stroke="#B26E59"
          strokeWidth="2"
          animate={{ scale: [0.95, 1.05, 0.95] }}
          transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
        />
        <circle cx="50" cy="50" r="10" fill="#E8B4A2" />
        <circle cx="50" cy="50" r="4" fill="#7D8C7A" />
      </svg>
    </div>
  );
};
