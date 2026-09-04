import React from 'react';
import { motion } from 'motion/react';

/**
 * Organic Animated Transition Wave Divider
 * Connects the Hero section seamlessly into the body with flowing SVG waves & theme-specific crest accents for all 12 designs!
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

        {/* 1. Classic Gold Accent */}
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

        {/* 2. Romantic Floral Accent */}
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

        {/* 3. Boho Chic Accent */}
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

        {/* 4. Minimal Editorial Accent */}
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

        {/* 5. Dark Luxury Accent */}
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

        {/* 6. Watercolor Garden Accent */}
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

        {/* 7. Royal Navy Accent */}
        {cardStyle === 'royal-navy' && (
          <g>
            <motion.path
              d="M710 85 L720 75 L730 85 L725 90 L715 90 Z"
              fill="#C5A059"
              animate={{ scale: [0.9, 1.15, 0.9] }}
              transition={{ duration: 3, repeat: Infinity }}
              style={{ transformOrigin: '720px 82px' }}
            />
            <motion.circle
              cx="720"
              cy="75"
              r="2"
              fill="#FFFFFF"
              animate={{ opacity: [0.3, 1, 0.3] }}
              transition={{ duration: 1.8, repeat: Infinity }}
            />
          </g>
        )}

        {/* 8. Terracotta Sunset Accent */}
        {cardStyle === 'terracotta-sunset' && (
          <g>
            <motion.circle
              cx="720"
              cy="85"
              r="8"
              fill="#DDA15E"
              opacity="0.8"
              animate={{ scale: [0.9, 1.1, 0.9] }}
              transition={{ duration: 3.5, repeat: Infinity }}
            />
            <motion.path
              d="M690 95 L720 85 L750 95"
              stroke="#E07A5F"
              strokeWidth="2"
              strokeLinecap="round"
              fill="none"
            />
          </g>
        )}

        {/* 9. Lavender Provence Accent */}
        {cardStyle === 'lavender-provence' && (
          <g>
            <motion.path
              d="M714 82 C710 76, 706 82, 714 86 C706 88, 708 94, 714 90"
              fill="#B5A8C8"
              animate={{ scaleX: [1, 0.5, 1] }}
              transition={{ duration: 1, repeat: Infinity }}
              style={{ transformOrigin: '714px 85px' }}
            />
            <motion.path
              d="M714 82 C718 76, 722 82, 714 86 C722 88, 720 94, 714 90"
              fill="#7B6D8D"
              animate={{ scaleX: [1, 0.5, 1] }}
              transition={{ duration: 1, repeat: Infinity }}
              style={{ transformOrigin: '714px 85px' }}
            />
          </g>
        )}

        {/* 10. Emerald Botanical Accent */}
        {cardStyle === 'emerald-botanical' && (
          <g>
            <motion.path
              d="M720 70 C710 80, 712 92, 720 95 C728 92, 730 80, 720 70 Z"
              fill="#2D6A4F"
              animate={{ scale: [0.9, 1.1, 0.9] }}
              transition={{ duration: 3, repeat: Infinity }}
              style={{ transformOrigin: '720px 85px' }}
            />
            <circle cx="720" cy="85" r="2" fill="#D4AF37" />
          </g>
        )}

        {/* 11. Coastal Breeze Accent */}
        {cardStyle === 'coastal-breeze' && (
          <g>
            <motion.path
              d="M700 90 C710 80, 720 95, 730 85 C735 80, 740 85, 745 82"
              stroke="#2B6CB0"
              strokeWidth="2"
              strokeLinecap="round"
              fill="none"
              animate={{ opacity: [0.4, 1, 0.4] }}
              transition={{ duration: 2.5, repeat: Infinity }}
            />
            <circle cx="720" cy="85" r="2.5" fill="#FFF" />
          </g>
        )}

        {/* 12. Champagne Glam Accent */}
        {cardStyle === 'champagne-glam' && (
          <g>
            <motion.rect
              x="715"
              y="80"
              width="10"
              height="10"
              fill="#C39B60"
              transform="rotate(45 720 85)"
              animate={{ rotate: [45, 135, 45], scale: [0.8, 1.2, 0.8] }}
              transition={{ duration: 4, repeat: Infinity }}
              style={{ transformOrigin: '720px 85px' }}
            />
            <circle cx="720" cy="85" r="2" fill="#FFF" />
          </g>
        )}
      </svg>
    </div>
  );
};
