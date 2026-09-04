import React from 'react';
import { motion } from 'motion/react';

/**
 * Animated Majestic Quinceañera Tiara / Princess Crown
 * Designed specifically for 15 Años celebrations with shimmering diamonds and crystals
 */
export const AnimatedQuinceaneraTiara: React.FC<{ className?: string; color?: string }> = ({
  className = 'w-36 h-24 sm:w-44 sm:h-28 md:w-52 md:h-32',
  color = '#E5B25D',
}) => {
  return (
    <div className={`relative flex items-center justify-center overflow-visible ${className}`}>
      <svg viewBox="0 0 200 120" className="w-full h-full overflow-visible">
        <defs>
          <linearGradient id="tiaraGold" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#FFF9D2" />
            <stop offset="25%" stopColor="#F7DF94" />
            <stop offset="50%" stopColor="#E5B25D" />
            <stop offset="75%" stopColor="#B38038" />
            <stop offset="100%" stopColor="#FDF0A6" />
          </linearGradient>

          <linearGradient id="crystalShine" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#FFFFFF" />
            <stop offset="40%" stopColor="#FDE2EC" />
            <stop offset="80%" stopColor="#F472B6" />
            <stop offset="100%" stopColor="#DB2777" />
          </linearGradient>

          <filter id="tiaraGlow" x="-20%" y="-20%" width="140%" height="140%">
            <feGaussianBlur stdDeviation="3" result="blur" />
            <feComposite in="SourceGraphic" in2="blur" operator="over" />
          </filter>
        </defs>

        {/* Tiara Base Arch */}
        <motion.path
          d="M20 95 Q100 82, 180 95"
          stroke="url(#tiaraGold)"
          strokeWidth="4"
          strokeLinecap="round"
          fill="none"
          filter="url(#tiaraGlow)"
        />
        <path
          d="M26 101 Q100 88, 174 101"
          stroke="#FFF"
          strokeWidth="1.2"
          strokeOpacity="0.75"
          fill="none"
        />

        {/* Floating Halo Pearls on base */}
        {[35, 55, 75, 95, 105, 125, 145, 165].map((cx, idx) => (
          <circle key={idx} cx={cx} cy={91 - Math.sin((idx / 7) * Math.PI) * 4} r="2.2" fill="#FFFFFF" />
        ))}

        {/* Tiara Main Filigree Peaks */}
        <motion.g
          animate={{ scale: [0.98, 1.02, 0.98], y: [-1, 1, -1] }}
          transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
          style={{ transformOrigin: '100px 90px' }}
        >
          {/* Outer Left Peak */}
          <path
            d="M30 95 C35 70, 50 65, 58 50 C62 65, 50 82, 46 95 Z"
            fill="url(#tiaraGold)"
            stroke="#96773B"
            strokeWidth="0.8"
          />
          {/* Mid Left Peak */}
          <path
            d="M56 93 C62 60, 78 52, 82 35 C88 55, 78 78, 72 92 Z"
            fill="url(#tiaraGold)"
            stroke="#96773B"
            strokeWidth="0.8"
          />
          {/* Center Majestic Peak (The Tallest) */}
          <path
            d="M85 90 C92 48, 95 32, 100 15 C105 32, 108 48, 115 90 Z"
            fill="url(#tiaraGold)"
            stroke="#96773B"
            strokeWidth="0.9"
            filter="drop-shadow(0 2px 5px rgba(229,178,93,0.4))"
          />
          {/* Mid Right Peak */}
          <path
            d="M118 92 C122 78, 112 55, 118 35 C122 52, 138 60, 144 93 Z"
            fill="url(#tiaraGold)"
            stroke="#96773B"
            strokeWidth="0.8"
          />
          {/* Outer Right Peak */}
          <path
            d="M154 95 C150 82, 138 65, 142 50 C150 65, 165 70, 170 95 Z"
            fill="url(#tiaraGold)"
            stroke="#96773B"
            strokeWidth="0.8"
          />

          {/* Heart Emblem in the Center of the Tiara */}
          <path
            d="M100 48 C97 42, 88 42, 88 50 C88 58, 100 68, 100 68 C100 68, 112 58, 112 50 C112 42, 103 42, 100 48 Z"
            fill="url(#crystalShine)"
            stroke="#FFF"
            strokeWidth="0.8"
          />

          {/* Top Diamond Gems on Spikes */}
          <polygon points="100,12 104,17 100,22 96,17" fill="#FFF" stroke="#F472B6" strokeWidth="0.8" />
          <polygon points="82,32 85,36 82,40 79,36" fill="#FFF" stroke="#E5B25D" strokeWidth="0.6" />
          <polygon points="118,32 121,36 118,40 115,36" fill="#FFF" stroke="#E5B25D" strokeWidth="0.6" />
          <polygon points="58,47 61,51 58,55 55,51" fill="#FFF" stroke="#E5B25D" strokeWidth="0.6" />
          <polygon points="142,47 145,51 142,55 139,51" fill="#FFF" stroke="#E5B25D" strokeWidth="0.6" />

          {/* Sparkling Star on the Highest Gem */}
          <motion.g
            animate={{ scale: [0, 1.4, 0], opacity: [0, 1, 0], rotate: [0, 90, 180] }}
            transition={{ duration: 2.2, repeat: Infinity, ease: 'easeInOut' }}
            style={{ transformOrigin: '100px 12px' }}
          >
            <line x1="100" y1="2" x2="100" y2="22" stroke="#FFF" strokeWidth="1.5" strokeLinecap="round" />
            <line x1="90" y1="12" x2="110" y2="12" stroke="#FFF" strokeWidth="1.5" strokeLinecap="round" />
            <line x1="93" y1="5" x2="107" y2="19" stroke="#FDE2EC" strokeWidth="1" strokeLinecap="round" />
            <line x1="93" y1="19" x2="107" y2="5" stroke="#FDE2EC" strokeWidth="1" strokeLinecap="round" />
          </motion.g>
        </motion.g>

        {/* Floating Sparkles Around the Tiara */}
        <motion.circle
          cx="45"
          cy="40"
          r="1.8"
          fill="#FFF"
          animate={{ opacity: [0, 1, 0], scale: [0.5, 1.5, 0.5] }}
          transition={{ duration: 1.8, repeat: Infinity, delay: 0.3 }}
        />
        <motion.circle
          cx="155"
          cy="40"
          r="1.8"
          fill="#FFF"
          animate={{ opacity: [0, 1, 0], scale: [0.5, 1.5, 0.5] }}
          transition={{ duration: 1.8, repeat: Infinity, delay: 0.9 }}
        />
      </svg>
    </div>
  );
};

/**
 * Animated Crystal Slipper / Glass Slipper for Quinceañera Change of Shoes
 */
export const AnimatedGlassSlipper: React.FC<{ className?: string; color?: string }> = ({
  className = 'w-10 h-10',
  color = '#E5B25D',
}) => {
  return (
    <div className={`relative flex items-center justify-center ${className}`}>
      <svg viewBox="0 0 60 60" className="w-full h-full overflow-visible">
        <motion.path
          d="M12 38 C18 36, 26 34, 34 26 C38 22, 42 16, 46 16 C48 16, 50 18, 48 24 L45 36 C44 40, 38 42, 28 42 L12 42 Z"
          fill="none"
          stroke={color}
          strokeWidth="1.8"
          strokeLinecap="round"
          strokeLinejoin="round"
          animate={{ strokeDashoffset: [0, 40, 0] }}
          transition={{ duration: 3, repeat: Infinity }}
        />
        {/* Heel */}
        <line x1="45" y1="36" x2="48" y2="48" stroke={color} strokeWidth="2" strokeLinecap="round" />
        {/* Sparkle on the shoe toe */}
        <motion.circle
          cx="14"
          cy="40"
          r="2"
          fill="#FFFFFF"
          animate={{ scale: [0.8, 1.6, 0.8], opacity: [0.4, 1, 0.4] }}
          transition={{ duration: 1.5, repeat: Infinity }}
        />
      </svg>
    </div>
  );
};
