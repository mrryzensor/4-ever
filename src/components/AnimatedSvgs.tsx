import React from 'react';
import { motion } from 'motion/react';

/**
 * Animated floating rose petals & gold dust particles in SVG
 */
export const AnimatedFloatingPetals: React.FC<{ className?: string; count?: number }> = ({
  className = '',
  count = 14,
}) => {
  const petals = Array.from({ length: count }, (_, i) => ({
    id: i,
    x: (i * 100) / count + (i % 3) * 4,
    size: 14 + (i % 4) * 5,
    delay: (i * 0.9) % 7,
    duration: 8 + (i % 5) * 2.5,
    sway: 20 + (i % 3) * 15,
    rotation: i * 45,
    opacity: 0.35 + (i % 3) * 0.15,
    color: i % 3 === 0 ? '#E2B18E' : i % 3 === 1 ? '#D4A373' : '#C59B7E',
  }));

  return (
    <div className={`pointer-events-none absolute inset-0 overflow-hidden z-0 ${className}`}>
      {petals.map((p) => (
        <motion.svg
          key={p.id}
          viewBox="0 0 30 30"
          className="absolute"
          style={{
            left: `${p.x}%`,
            top: '-5%',
            width: p.size,
            height: p.size,
          }}
          initial={{ y: -30, opacity: 0, rotate: 0 }}
          animate={{
            y: ['0vh', '105vh'],
            x: [0, p.sway, -p.sway, 0],
            opacity: [0, p.opacity, p.opacity, 0],
            rotate: [p.rotation, p.rotation + 360],
          }}
          transition={{
            duration: p.duration,
            repeat: Infinity,
            delay: p.delay,
            ease: 'easeInOut',
          }}
        >
          {/* Organic petal shape */}
          <path
            d="M15 2 C22 5, 27 12, 25 20 C23 27, 15 28, 10 24 C5 20, 8 8, 15 2 Z"
            fill={p.color}
            opacity="0.75"
          />
          <path
            d="M15 4 C18 10, 18 18, 12 24"
            stroke="rgba(255,255,255,0.4)"
            strokeWidth="0.8"
            fill="none"
          />
        </motion.svg>
      ))}
    </div>
  );
};

/**
 * Botanical Floral Branch Divider with animated drawing paths
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
 * Animated Permanently Interlocking Wedding Rings with Intense Shimmer & Sparkle Effects
 */
export const AnimatedWeddingRings: React.FC<{ className?: string; color?: string }> = ({
  className = 'w-28 h-20',
}) => {
  return (
    <div className={`relative flex items-center justify-center overflow-visible ${className}`}>
      <svg viewBox="0 0 160 85" className="w-full h-full overflow-visible">
        <defs>
          <linearGradient id="goldRing1" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#FFF7C2" />
            <stop offset="20%" stopColor="#F5D77F" />
            <stop offset="45%" stopColor="#E5B25D" />
            <stop offset="70%" stopColor="#AA7A44" />
            <stop offset="90%" stopColor="#FDE68A" />
            <stop offset="100%" stopColor="#8C5E28" />
          </linearGradient>
          <linearGradient id="goldRing2" x1="100%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#FFF7C2" />
            <stop offset="25%" stopColor="#F5D77F" />
            <stop offset="50%" stopColor="#E5B25D" />
            <stop offset="75%" stopColor="#AA7A44" />
            <stop offset="92%" stopColor="#FDE68A" />
            <stop offset="100%" stopColor="#8C5E28" />
          </linearGradient>
          <linearGradient id="diamondShine" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#FFFFFF" />
            <stop offset="35%" stopColor="#E0F2FE" />
            <stop offset="70%" stopColor="#BAE6FD" />
            <stop offset="100%" stopColor="#7DD3FC" />
          </linearGradient>
          <filter id="intenseRingGlow" x="-30%" y="-30%" width="160%" height="160%">
            <feGaussianBlur stdDeviation="2.5" result="blur" />
            <feDropShadow dx="0" dy="2" stdDeviation="4" floodColor="#E5B25D" floodOpacity="0.45" />
          </filter>
        </defs>

        {/* Global Floating & Heartbeat Pulse */}
        <motion.g
          animate={{
            y: [-2, 2, -2],
            scale: [1, 1.03, 0.99, 1.02, 1],
          }}
          transition={{
            duration: 3,
            repeat: Infinity,
            ease: 'easeInOut',
          }}
          style={{ transformOrigin: '76px 45px' }}
        >
          {/* Subtle Golden Aura Behind United Rings */}
          <motion.ellipse
            cx="76"
            cy="46"
            rx="42"
            ry="24"
            fill="#FDE68A"
            opacity={0.15}
            animate={{
              scale: [0.95, 1.15, 0.95],
              opacity: [0.12, 0.28, 0.12],
            }}
            transition={{
              duration: 2,
              repeat: Infinity,
              ease: 'easeInOut',
            }}
            filter="url(#intenseRingGlow)"
            style={{ transformOrigin: '76px 46px' }}
          />

          {/* Ring 1 (Left - Band) Permanently Interlocked */}
          <motion.g
            animate={{
              rotate: [-5, 6, -3, 5, -5],
            }}
            transition={{
              duration: 2.8,
              repeat: Infinity,
              ease: 'easeInOut',
            }}
            style={{ transformOrigin: '62px 46px' }}
          >
            {/* Outer Ring */}
            <ellipse
              cx="62"
              cy="46"
              rx="23"
              ry="23"
              stroke="url(#goldRing1)"
              strokeWidth="5.5"
              fill="none"
              filter="url(#intenseRingGlow)"
            />
            {/* Inner Shimmer Reflection */}
            <ellipse
              cx="62"
              cy="46"
              rx="20.5"
              ry="20.5"
              stroke="#FFFDF0"
              strokeWidth="1"
              strokeOpacity="0.9"
              fill="none"
            />
            {/* Dynamic Light Sweep */}
            <motion.circle
              cx="45"
              cy="32"
              r="2.5"
              fill="#FFFFFF"
              animate={{
                opacity: [0.2, 1, 0.2],
                scale: [0.8, 1.4, 0.8],
              }}
              transition={{
                duration: 1.8,
                repeat: Infinity,
                ease: 'easeInOut',
              }}
            />
          </motion.g>

          {/* Ring 2 (Right - Solitaire with Diamond) Permanently Interlocked */}
          <motion.g
            animate={{
              rotate: [5, -6, 3, -5, 5],
            }}
            transition={{
              duration: 2.8,
              repeat: Infinity,
              ease: 'easeInOut',
            }}
            style={{ transformOrigin: '90px 46px' }}
          >
            {/* Outer Ring */}
            <ellipse
              cx="90"
              cy="46"
              rx="23"
              ry="23"
              stroke="url(#goldRing2)"
              strokeWidth="5.5"
              fill="none"
              filter="url(#intenseRingGlow)"
            />
            {/* Inner Shimmer Reflection */}
            <ellipse
              cx="90"
              cy="46"
              rx="20.5"
              ry="20.5"
              stroke="#FFFDF0"
              strokeWidth="1"
              strokeOpacity="0.9"
              fill="none"
            />

            {/* Solitaire Diamond Mount */}
            <g>
              {/* Prongs */}
              <path
                d="M87 23 L90 26 L93 23 L90 28 Z"
                fill="#E5B25D"
                stroke="#926227"
                strokeWidth="0.6"
              />
              {/* Diamond Gemstone */}
              <polygon
                points="90,12 99,21 90,28 81,21"
                fill="url(#diamondShine)"
                stroke="#38BDF8"
                strokeWidth="0.9"
                filter="drop-shadow(0 0 4px rgba(56, 189, 248, 0.6))"
              />
              {/* Diamond Facet lines */}
              <line x1="90" y1="12" x2="90" y2="28" stroke="#FFFFFF" strokeWidth="0.8" strokeOpacity="0.95" />
              <line x1="81" y1="21" x2="99" y2="21" stroke="#FFFFFF" strokeWidth="0.8" strokeOpacity="0.95" />
              <line x1="85" y1="16" x2="95" y2="25" stroke="#FFFFFF" strokeWidth="0.5" strokeOpacity="0.75" />
              <line x1="95" y1="16" x2="85" y2="25" stroke="#FFFFFF" strokeWidth="0.5" strokeOpacity="0.75" />

              {/* Main Diamond Super Starburst */}
              <motion.g
                animate={{
                  scale: [0.7, 1.45, 0.8, 1.3, 0.7],
                  rotate: [0, 90, 180, 270, 360],
                  opacity: [0.6, 1, 0.5, 1, 0.6],
                }}
                transition={{
                  duration: 2.2,
                  repeat: Infinity,
                  ease: 'easeInOut',
                }}
                style={{ transformOrigin: '90px 12px' }}
              >
                <path
                  d="M90 3 L90 21 M81 12 L99 12"
                  stroke="#FFFFFF"
                  strokeWidth="1.8"
                  strokeLinecap="round"
                />
                <path
                  d="M84 6 L96 18 M96 6 L84 18"
                  stroke="#E0F2FE"
                  strokeWidth="1"
                  strokeLinecap="round"
                />
                <circle cx="90" cy="12" r="2" fill="#FFFFFF" />
              </motion.g>

              {/* Secondary Sparkle Glint */}
              <motion.path
                d="M97 18 L97 24 M94 21 L100 21"
                stroke="#FFFFFF"
                strokeWidth="1.2"
                strokeLinecap="round"
                animate={{
                  scale: [0, 1.2, 0],
                  opacity: [0, 1, 0],
                }}
                transition={{
                  duration: 1.5,
                  repeat: Infinity,
                  ease: 'easeInOut',
                  delay: 0.6,
                }}
                style={{ transformOrigin: '97px 21px' }}
              />

              {/* Third Sparkle on Interlock point */}
              <motion.path
                d="M76 36 L76 42 M73 39 L79 39"
                stroke="#FFF7C2"
                strokeWidth="1.2"
                strokeLinecap="round"
                animate={{
                  scale: [0, 1.3, 0],
                  opacity: [0, 1, 0],
                }}
                transition={{
                  duration: 1.6,
                  repeat: Infinity,
                  ease: 'easeInOut',
                  delay: 0.2,
                }}
                style={{ transformOrigin: '76px 39px' }}
              />
            </g>
          </motion.g>
        </motion.g>
      </svg>
    </div>
  );
};

/**
 * Animated Church Bells for Ceremony Card
 */
export const AnimatedChurchBells: React.FC<{ className?: string; color?: string }> = ({
  className = 'w-12 h-12',
  color = '#5A5A40',
}) => {
  return (
    <div className={`relative flex items-center justify-center ${className}`}>
      <svg viewBox="0 0 60 60" className="w-full h-full overflow-visible">
        {/* Sound Wave Waves */}
        <motion.path
          d="M12 28 C8 32, 8 40, 12 44"
          stroke={color}
          strokeWidth="1.5"
          strokeLinecap="round"
          fill="none"
          animate={{ opacity: [0, 0.8, 0], scale: [0.9, 1.15, 0.9] }}
          transition={{ duration: 1.8, repeat: Infinity, ease: 'easeInOut' }}
          style={{ transformOrigin: '12px 36px' }}
        />
        <motion.path
          d="M48 28 C52 32, 52 40, 48 44"
          stroke={color}
          strokeWidth="1.5"
          strokeLinecap="round"
          fill="none"
          animate={{ opacity: [0, 0.8, 0], scale: [0.9, 1.15, 0.9] }}
          transition={{ duration: 1.8, repeat: Infinity, delay: 0.3, ease: 'easeInOut' }}
          style={{ transformOrigin: '48px 36px' }}
        />

        {/* Bell Body Swinging */}
        <motion.g
          animate={{ rotate: [-14, 14, -14] }}
          transition={{ duration: 2.2, repeat: Infinity, ease: 'easeInOut' }}
          style={{ transformOrigin: '30px 10px' }}
        >
          {/* Top Hook */}
          <circle cx="30" cy="10" r="3" stroke={color} strokeWidth="2" fill="none" />
          {/* Bell Dome */}
          <path
            d="M24 16 C24 16, 22 28, 16 38 C15 40, 16 42, 19 42 L41 42 C44 42, 45 40, 44 38 C38 28, 36 16, 36 16 Z"
            fill={color}
            opacity="0.9"
          />
          {/* Clapper */}
          <motion.circle
            cx="30"
            cy="46"
            r="3.5"
            fill="#D4A373"
            animate={{ x: [-3, 3, -3] }}
            transition={{ duration: 2.2, repeat: Infinity, ease: 'easeInOut' }}
          />
          <path d="M20 38 Q30 36 40 38" stroke="rgba(255,255,255,0.4)" strokeWidth="1.2" fill="none" />
        </motion.g>
      </svg>
    </div>
  );
};

/**
 * Animated Clinking Champagne Flutes for Reception Card
 */
export const AnimatedChampagneGlasses: React.FC<{ className?: string }> = ({
  className = 'w-12 h-12',
}) => {
  return (
    <div className={`relative flex items-center justify-center ${className}`}>
      <svg viewBox="0 0 60 60" className="w-full h-full overflow-visible">
        {/* Bubbles floating up */}
        <motion.circle
          cx="30"
          cy="18"
          r="1.8"
          fill="#F5D77F"
          animate={{ y: [0, -10, -18], opacity: [0, 1, 0] }}
          transition={{ duration: 1.4, repeat: Infinity, ease: 'easeOut' }}
        />
        <motion.circle
          cx="27"
          cy="15"
          r="1.2"
          fill="#F5D77F"
          animate={{ y: [0, -8, -14], opacity: [0, 0.9, 0] }}
          transition={{ duration: 1.6, repeat: Infinity, delay: 0.4, ease: 'easeOut' }}
        />
        <motion.circle
          cx="33"
          cy="14"
          r="1.4"
          fill="#F5D77F"
          animate={{ y: [0, -9, -16], opacity: [0, 1, 0] }}
          transition={{ duration: 1.5, repeat: Infinity, delay: 0.8, ease: 'easeOut' }}
        />

        {/* Sparkle Clink star */}
        <motion.path
          d="M30 18 L30 24 M27 21 L33 21"
          stroke="#F5D77F"
          strokeWidth="1.8"
          strokeLinecap="round"
          animate={{ scale: [0, 1.4, 0], opacity: [0, 1, 0] }}
          transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
          style={{ transformOrigin: '30px 21px' }}
        />

        {/* Left Flute */}
        <motion.g
          animate={{ rotate: [0, 14, 0] }}
          transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
          style={{ transformOrigin: '20px 50px' }}
        >
          <path d="M16 16 L24 16 L22 32 C22 34 18 34 18 32 Z" fill="#D4A373" opacity="0.85" />
          <path d="M20 34 L20 48 M15 48 L25 48" stroke="#B8860B" strokeWidth="1.8" strokeLinecap="round" />
        </motion.g>

        {/* Right Flute */}
        <motion.g
          animate={{ rotate: [0, -14, 0] }}
          transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
          style={{ transformOrigin: '40px 50px' }}
        >
          <path d="M36 16 L44 16 L42 32 C42 34 38 34 38 32 Z" fill="#D4A373" opacity="0.85" />
          <path d="M40 34 L40 48 M35 48 L45 48" stroke="#B8860B" strokeWidth="1.8" strokeLinecap="round" />
        </motion.g>
      </svg>
    </div>
  );
};

/**
 * Animated Gift Box with Shimmering Ribbon for Gift Registry
 */
export const AnimatedGiftBox: React.FC<{ className?: string }> = ({
  className = 'w-12 h-12',
}) => {
  return (
    <div className={`relative flex items-center justify-center ${className}`}>
      <svg viewBox="0 0 60 60" className="w-full h-full overflow-visible">
        {/* Floating Sparkles around box */}
        <motion.path
          d="M12 18 L12 22 M10 20 L14 20"
          stroke="#D4A373"
          strokeWidth="1.2"
          strokeLinecap="round"
          animate={{ opacity: [0.2, 1, 0.2], scale: [0.8, 1.2, 0.8] }}
          transition={{ duration: 1.8, repeat: Infinity }}
        />
        <motion.path
          d="M48 38 L48 42 M46 40 L50 40"
          stroke="#D4A373"
          strokeWidth="1.2"
          strokeLinecap="round"
          animate={{ opacity: [0.2, 1, 0.2], scale: [0.8, 1.2, 0.8] }}
          transition={{ duration: 1.8, repeat: Infinity, delay: 0.6 }}
        />

        {/* Main Box Body */}
        <rect x="14" y="26" width="32" height="24" rx="4" fill="#5A5A40" />
        {/* Box Lid with subtle float */}
        <motion.g
          animate={{ y: [0, -2.5, 0] }}
          transition={{ duration: 2.2, repeat: Infinity, ease: 'easeInOut' }}
        >
          <rect x="11" y="20" width="38" height="8" rx="2" fill="#7D8C7A" />
          {/* Vertical Ribbon on Lid */}
          <rect x="28" y="20" width="4" height="8" fill="#D4A373" />
          {/* Ribbon Bow Loops */}
          <motion.path
            d="M30 20 C24 14, 20 18, 28 20 C36 18, 36 14, 30 20"
            fill="#D4A373"
            stroke="#AA7A44"
            strokeWidth="0.8"
            animate={{ scale: [1, 1.08, 1] }}
            transition={{ duration: 2.2, repeat: Infinity, ease: 'easeInOut' }}
            style={{ transformOrigin: '30px 18px' }}
          />
        </motion.g>

        {/* Vertical and Horizontal Ribbons on Box */}
        <rect x="28" y="26" width="4" height="24" fill="#D4A373" />
        <rect x="14" y="36" width="32" height="4" fill="#D4A373" />
      </svg>
    </div>
  );
};

/**
 * Animated Quill Writing Pen for Guestbook Section
 */
export const AnimatedQuillPen: React.FC<{ className?: string }> = ({
  className = 'w-12 h-12',
}) => {
  return (
    <div className={`relative flex items-center justify-center ${className}`}>
      <svg viewBox="0 0 60 60" className="w-full h-full overflow-visible">
        {/* Animated written line under pen */}
        <motion.path
          d="M12 48 Q24 45, 34 49 T46 48"
          stroke="#7D8C7A"
          strokeWidth="1.8"
          strokeLinecap="round"
          fill="none"
          initial={{ pathLength: 0 }}
          animate={{ pathLength: [0, 1, 0] }}
          transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
        />

        {/* Feather Quill Pen with writing movement */}
        <motion.g
          animate={{
            x: [0, 6, -4, 0],
            y: [0, -2, 1, 0],
            rotate: [0, 8, -4, 0],
          }}
          transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
          style={{ transformOrigin: '28px 46px' }}
        >
          {/* Feather Body */}
          <path
            d="M28 46 L36 28 C42 16, 46 8, 48 6 C42 14, 38 24, 28 38 Z"
            fill="#5A5A40"
          />
          <path
            d="M36 28 C30 20, 24 16, 22 18 C26 24, 30 30, 28 38"
            fill="#7D8C7A"
            opacity="0.85"
          />
          {/* Quill Shaft */}
          <path
            d="M28 46 L48 6"
            stroke="#D4A373"
            strokeWidth="1.2"
            strokeLinecap="round"
          />
          {/* Gold Nib Tip */}
          <polygon points="28,46 25,50 30,48" fill="#AA7A44" />
        </motion.g>
      </svg>
    </div>
  );
};

/**
 * Animated Camera Lens with Shutter Rotation & Flash for Gallery
 */
export const AnimatedCameraLens: React.FC<{ className?: string }> = ({
  className = 'w-12 h-12',
}) => {
  return (
    <div className={`relative flex items-center justify-center ${className}`}>
      <svg viewBox="0 0 60 60" className="w-full h-full overflow-visible">
        {/* Flash Burst */}
        <motion.circle
          cx="42"
          cy="18"
          r="4"
          fill="#FFF"
          animate={{ opacity: [0, 1, 0], scale: [0.5, 1.8, 0.5] }}
          transition={{ duration: 2.2, repeat: Infinity, ease: 'easeOut' }}
        />

        {/* Camera Body */}
        <rect x="10" y="18" width="40" height="30" rx="6" fill="#5A5A40" />
        <path d="M22 18 L25 14 L35 14 L38 18 Z" fill="#484833" />
        <circle cx="44" cy="24" r="2.5" fill="#D4A373" />

        {/* Lens Ring */}
        <circle cx="30" cy="33" r="11" fill="#333322" stroke="#E5E2D0" strokeWidth="1.5" />

        {/* Aperture blades rotating */}
        <motion.g
          animate={{ rotate: 360 }}
          transition={{ duration: 8, repeat: Infinity, ease: 'linear' }}
          style={{ transformOrigin: '30px 33px' }}
        >
          <circle cx="30" cy="33" r="6" fill="#1C1C14" />
          <path d="M30 27 L33 33 L27 35 Z" fill="#7D8C7A" opacity="0.8" />
          <path d="M36 33 L30 36 L32 30 Z" fill="#7D8C7A" opacity="0.8" />
          <path d="M24 33 L30 30 L28 36 Z" fill="#7D8C7A" opacity="0.8" />
        </motion.g>

        {/* Reflection shimmer */}
        <path
          d="M26 29 C28 27, 32 27, 34 29"
          stroke="rgba(255,255,255,0.7)"
          strokeWidth="1.2"
          strokeLinecap="round"
          fill="none"
        />
      </svg>
    </div>
  );
};

/**
 * Animated Film Reel for Video Section
 */
export const AnimatedFilmReel: React.FC<{ className?: string }> = ({
  className = 'w-12 h-12',
}) => {
  return (
    <div className={`relative flex items-center justify-center ${className}`}>
      <svg viewBox="0 0 60 60" className="w-full h-full overflow-visible">
        {/* Outer Reel Frame */}
        <circle cx="30" cy="30" r="22" stroke="#5A5A40" strokeWidth="3" fill="#FAF9F0" />

        {/* Rotating Sprocket Wheel */}
        <motion.g
          animate={{ rotate: 360 }}
          transition={{ duration: 6, repeat: Infinity, ease: 'linear' }}
          style={{ transformOrigin: '30px 30px' }}
        >
          <circle cx="30" cy="30" r="8" fill="#5A5A40" />
          <circle cx="30" cy="30" r="3" fill="#FAF9F0" />
          {/* Film Holes */}
          <circle cx="30" cy="14" r="3.5" fill="#7D8C7A" />
          <circle cx="44" cy="24" r="3.5" fill="#7D8C7A" />
          <circle cx="40" cy="40" r="3.5" fill="#7D8C7A" />
          <circle cx="20" cy="40" r="3.5" fill="#7D8C7A" />
          <circle cx="16" cy="24" r="3.5" fill="#7D8C7A" />
        </motion.g>

        {/* Play Icon in center */}
        <polygon points="28,26 35,30 28,34" fill="#FDFCF0" />
      </svg>
    </div>
  );
};

/**
 * FixDate-inspired Organic Animated Transition Wave Divider
 * Connects the Hero section seamlessly into the body with flowing SVG waves & theme-specific crest accents
 */
export const FixDateAnimatedTransitionDivider: React.FC<{
  className?: string;
  svgClassName?: string;
  fillColor?: string;
  accentColor?: string;
  cardStyle?: string;
}> = ({
  className = 'w-full',
  svgClassName = 'w-full h-32 sm:h-44 md:h-56 lg:h-64 block preserve-3d',
  fillColor = '#FDFCF0',
  accentColor = '#7D8C7A',
  cardStyle = 'classic-gold',
}) => {
  return (
    <div className={`relative w-full overflow-hidden leading-none z-10 ${className}`}>
      {/* Dynamic Animated Multi-layered SVG Wave */}
      <svg
        viewBox="0 0 1440 240"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className={svgClassName}
        preserveAspectRatio="none"
      >
        <defs>
          {/* Subtle depth gradient for wave visibility across light and dark backgrounds */}
          <linearGradient id={`waveSoftTint-${cardStyle}`} x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor={accentColor} stopOpacity="0.28" />
            <stop offset="50%" stopColor={accentColor} stopOpacity="0.14" />
            <stop offset="100%" stopColor={fillColor} stopOpacity="0.05" />
          </linearGradient>
          <filter id={`waveShadow-${cardStyle}`} x="-5%" y="-10%" width="110%" height="130%">
            <feDropShadow dx="0" dy="8" stdDeviation="10" floodColor="#000000" floodOpacity="0.08" />
          </filter>
        </defs>

        {/* Layer 1: Background gentle translucent flowing wave into Hero */}
        <motion.path
          d="M0 60 C 320 130, 640 20, 960 80 C 1200 120, 1360 40, 1440 55 L 1440 250 L 0 250 Z"
          fill={fillColor}
          fillOpacity="0.4"
          animate={{
            y: [-6, 6, -6],
            scaleY: [0.95, 1.05, 0.95],
          }}
          transition={{ duration: 8, repeat: Infinity, ease: 'easeInOut' }}
        />

        {/* Layer 2: Mid wave with accent shimmer & delicate line contour */}
        <motion.path
          d="M0 95 C 260 45, 540 145, 880 75 C 1140 35, 1320 115, 1440 90 L 1440 250 L 0 250 Z"
          fill={fillColor}
          fillOpacity="0.65"
          stroke={accentColor}
          strokeWidth="1.5"
          strokeOpacity="0.35"
          animate={{
            y: [5, -5, 5],
            scaleY: [1.04, 0.96, 1.04],
          }}
          transition={{ duration: 6.5, repeat: Infinity, ease: 'easeInOut', delay: 0.5 }}
        />

        {/* Layer 3: Contrast Wave reaching down into Content Section with soft tint */}
        <motion.path
          d="M0 135 C 340 85, 680 185, 1020 120 C 1220 90, 1360 155, 1440 130 L 1440 250 L 0 250 Z"
          fill={`url(#waveSoftTint-${cardStyle})`}
          stroke={accentColor}
          strokeWidth="1"
          strokeOpacity="0.25"
          animate={{
            y: [-4, 4, -4],
          }}
          transition={{ duration: 7, repeat: Infinity, ease: 'easeInOut', delay: 0.2 }}
        />

        {/* Layer 4: Main Solid Wave blending 100% seamlessly into Content */}
        <motion.path
          d="M0 120 C 380 65, 760 155, 1140 100 C 1280 80, 1380 125, 1440 115 L 1440 250 L 0 250 Z"
          fill={fillColor}
          animate={{
            y: [-3, 3, -3],
          }}
          transition={{ duration: 5, repeat: Infinity, ease: 'easeInOut' }}
        />

        {/* Decorative Animated Crest Highlights (Style-specific touches for all 6 designs) */}
        {cardStyle === 'classic-gold' && (
          <g>
            <motion.circle
              cx="720"
              cy="115"
              r="4"
              fill="#D4A373"
              animate={{ scale: [1, 1.3, 1], opacity: [0.7, 1, 0.7] }}
              transition={{ duration: 2.5, repeat: Infinity }}
            />
            <motion.path
              d="M700 115 C710 110, 715 110, 720 115 C725 110, 730 110, 740 115"
              stroke="#5A5A40"
              strokeWidth="1.5"
              strokeLinecap="round"
              fill="none"
              animate={{ opacity: [0.6, 1, 0.6] }}
              transition={{ duration: 3, repeat: Infinity }}
            />
          </g>
        )}

        {cardStyle === 'romantic-floral' && (
          <g>
            <motion.circle
              cx="450"
              cy="90"
              r="4"
              fill="#E2B18E"
              animate={{ y: [-4, 4, -4], opacity: [0.5, 1, 0.5] }}
              transition={{ duration: 3, repeat: Infinity }}
            />
            <motion.circle
              cx="980"
              cy="75"
              r="3.5"
              fill="#C59B7E"
              animate={{ y: [4, -4, 4], opacity: [0.6, 1, 0.6] }}
              transition={{ duration: 3.5, repeat: Infinity, delay: 0.5 }}
            />
            <motion.g
              animate={{ scale: [0.95, 1.05, 0.95] }}
              transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
              style={{ transformOrigin: '720px 90px' }}
            >
              <circle cx="720" cy="90" r="6" fill="#F4D3C4" opacity="0.9" />
              <circle cx="720" cy="90" r="3" fill="#FFF" opacity="0.8" />
            </motion.g>
          </g>
        )}

        {cardStyle === 'dark-luxury' && (
          <g>
            <motion.path
              d="M720 70 L720 80 M715 75 L725 75"
              stroke="#C5A059"
              strokeWidth="1.5"
              strokeLinecap="round"
              animate={{ scale: [0.6, 1.4, 0.6], opacity: [0.3, 1, 0.3] }}
              transition={{ duration: 2, repeat: Infinity }}
              style={{ transformOrigin: '720px 75px' }}
            />
            <motion.circle
              cx="1150"
              cy="80"
              r="2"
              fill="#FDFCF0"
              animate={{ opacity: [0.2, 0.9, 0.2] }}
              transition={{ duration: 1.8, repeat: Infinity }}
            />
            <motion.circle
              cx="380"
              cy="70"
              r="2.5"
              fill="#C5A059"
              animate={{ opacity: [0.3, 1, 0.3], scale: [0.8, 1.2, 0.8] }}
              transition={{ duration: 2.2, repeat: Infinity, delay: 0.3 }}
            />
          </g>
        )}

        {cardStyle === 'boho-chic' && (
          <g>
            <motion.path
              d="M320 85 Q330 65 340 85"
              stroke="#B26E59"
              strokeWidth="1.5"
              fill="none"
              animate={{ rotate: [-5, 5, -5] }}
              transition={{ duration: 3, repeat: Infinity }}
              style={{ transformOrigin: '330px 85px' }}
            />
            <motion.path
              d="M1100 80 Q1110 60 1120 80"
              stroke="#7D8C7A"
              strokeWidth="1.5"
              fill="none"
              animate={{ rotate: [5, -5, 5] }}
              transition={{ duration: 3.2, repeat: Infinity, delay: 0.4 }}
              style={{ transformOrigin: '1110px 80px' }}
            />
            <motion.circle
              cx="720"
              cy="85"
              r="4.5"
              fill="#B26E59"
              animate={{ scale: [1, 1.2, 1] }}
              transition={{ duration: 2.8, repeat: Infinity }}
            />
          </g>
        )}

        {cardStyle === 'minimal-editorial' && (
          <g>
            <motion.path
              d="M680 95 L720 75 L760 95"
              stroke="#4A4A3A"
              strokeWidth="1"
              fill="none"
              animate={{ opacity: [0.5, 1, 0.5] }}
              transition={{ duration: 3, repeat: Infinity }}
            />
            <motion.rect
              x="717"
              y="92"
              width="6"
              height="6"
              fill="#4A4A3A"
              transform="rotate(45 720 95)"
              animate={{ scale: [0.9, 1.15, 0.9] }}
              transition={{ duration: 2.5, repeat: Infinity }}
            />
          </g>
        )}

        {cardStyle === 'watercolor-garden' && (
          <g>
            <motion.path
              d="M700 90 Q710 80 720 90 Q730 80 740 90"
              stroke="#526B50"
              strokeWidth="1.5"
              strokeLinecap="round"
              fill="none"
              animate={{ opacity: [0.6, 1, 0.6] }}
              transition={{ duration: 2.5, repeat: Infinity }}
            />
            <motion.ellipse
              cx="710"
              cy="84"
              rx="4"
              ry="2"
              fill="#7D947B"
              transform="rotate(-25 710 84)"
              animate={{ scale: [0.9, 1.1, 0.9] }}
              transition={{ duration: 2.2, repeat: Infinity }}
            />
            <motion.ellipse
              cx="730"
              cy="84"
              rx="4"
              ry="2"
              fill="#7D947B"
              transform="rotate(25 730 84)"
              animate={{ scale: [0.9, 1.1, 0.9] }}
              transition={{ duration: 2.2, repeat: Infinity, delay: 0.3 }}
            />
          </g>
        )}
      </svg>
    </div>
  );
};

/**
 * Style: Classic Gold & Olive - Animated Olive Branch Laurel Wreath
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
        {/* Left Olive Leaves with breathing sway */}
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

        {/* Golden Central Knot / Ribbon */}
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

/**
 * Style: Romantic Floral - Animated Rose Arch Divider with Blooming Petals
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
 * Style: Romantic Floral - Animated Twin Swans Heart
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

        {/* Left Swan (Graceful curved neck forming left heart loop) */}
        <motion.g
          animate={{ rotate: [-2, 2, -2] }}
          transition={{ duration: 3.5, repeat: Infinity, ease: 'easeInOut' }}
          style={{ transformOrigin: '35px 60px' }}
        >
          {/* Body */}
          <ellipse cx="35" cy="52" rx="16" ry="10" fill="#FFF" stroke="#E8DFD8" strokeWidth="1.2" />
          {/* Neck curve */}
          <path
            d="M45 50 C45 30, 48 18, 43 18 C38 18, 38 28, 48 38"
            stroke="#8A6D65"
            strokeWidth="2.5"
            fill="none"
            strokeLinecap="round"
          />
          {/* Head & Beak */}
          <polygon points="49,20 54,22 49,24" fill="#D4A373" />
        </motion.g>

        {/* Right Swan (Mirror forming heart apex) */}
        <motion.g
          animate={{ rotate: [2, -2, 2] }}
          transition={{ duration: 3.5, repeat: Infinity, ease: 'easeInOut', delay: 0.3 }}
          style={{ transformOrigin: '65px 60px' }}
        >
          {/* Body */}
          <ellipse cx="65" cy="52" rx="16" ry="10" fill="#FFF" stroke="#E8DFD8" strokeWidth="1.2" />
          {/* Neck curve */}
          <path
            d="M55 50 C55 30, 52 18, 57 18 C62 18, 62 28, 52 38"
            stroke="#8A6D65"
            strokeWidth="2.5"
            fill="none"
            strokeLinecap="round"
          />
          {/* Head & Beak */}
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

/**
 * Style: Boho Chic - Animated Pampas Grass Divider
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
 * Style: Boho Chic - Animated Sun Mandala
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

/**
 * Style: Minimal Editorial - Geometric Modernist Line Divider
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
 * Style: Dark Luxury - Glimmering Constellations & Gold Starlight Divider
 */
export const AnimatedConstellationDivider: React.FC<{ className?: string; color?: string }> = ({
  className = 'w-56 sm:w-72 h-10',
  color = '#C5A059',
}) => {
  return (
    <div className={`mx-auto flex items-center justify-center my-4 ${className}`}>
      <svg viewBox="0 0 320 40" fill="none" className="w-full h-full">
        {/* Celestial Constellation Lines */}
        <motion.path
          d="M30 20 L80 14 L130 24 L160 12 L190 24 L240 14 L290 20"
          stroke={color}
          strokeWidth="1"
          strokeDasharray="2 3"
          opacity="0.6"
          initial={{ pathLength: 0 }}
          animate={{ pathLength: 1 }}
          transition={{ duration: 3, repeat: Infinity, repeatType: 'reverse' }}
        />

        {/* Center Golden Starburst */}
        <motion.g
          animate={{ scale: [0.8, 1.3, 0.8], rotate: [0, 90, 0] }}
          transition={{ duration: 3.5, repeat: Infinity, ease: 'easeInOut' }}
          style={{ transformOrigin: '160px 12px' }}
        >
          <path d="M160 4 L160 20 M152 12 L168 12" stroke={color} strokeWidth="1.8" strokeLinecap="round" />
          <circle cx="160" cy="12" r="3" fill="#FDFCF0" />
        </motion.g>

        {/* Twinkling Stars */}
        {[
          { cx: 80, cy: 14, delay: 0 },
          { cx: 130, cy: 24, delay: 0.5 },
          { cx: 190, cy: 24, delay: 0.8 },
          { cx: 240, cy: 14, delay: 1.2 },
        ].map((star, i) => (
          <motion.circle
            key={i}
            cx={star.cx}
            cy={star.cy}
            r="2.5"
            fill={color}
            animate={{ opacity: [0.2, 1, 0.2], scale: [0.7, 1.3, 0.7] }}
            transition={{ duration: 2, repeat: Infinity, delay: star.delay }}
          />
        ))}
      </svg>
    </div>
  );
};

/**
 * Style: Watercolor Garden - Animated Eucalyptus & Dew Drops Divider
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
 * Universal Dynamic Theme Divider Dispatcher
 * Automatically renders the correct animated SVG tailored for the active cardStyle!
 */
export const StyleSpecificDivider: React.FC<{
  cardStyle?: string;
  className?: string;
  color?: string;
}> = ({ cardStyle = 'classic-gold', className = '', color }) => {
  switch (cardStyle) {
    case 'romantic-floral':
      return <AnimatedRoseArchDivider className={className} color={color || '#8A6D65'} />;
    case 'boho-chic':
      return <AnimatedPampasGrassDivider className={className} color={color || '#B26E59'} />;
    case 'minimal-editorial':
      return <AnimatedEditorialLineDivider className={className} color={color || '#1a1a1a'} />;
    case 'dark-luxury':
      return <AnimatedConstellationDivider className={className} color={color || '#C5A059'} />;
    case 'watercolor-garden':
      return <AnimatedWatercolorBranchDivider className={className} color={color || '#526B50'} />;
    case 'classic-gold':
    default:
      return <AnimatedFloralDivider className={className} color={color || '#7D8C7A'} />;
  }
};
