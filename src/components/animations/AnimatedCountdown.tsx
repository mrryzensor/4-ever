import React, { useState, useEffect, useMemo } from 'react';
import { motion } from 'motion/react';
import { Heart, Check, Clock3 } from 'lucide-react';
import { CardStyleId, Guest, WeddingSettings } from '../../types.ts';
import { CARD_THEMES } from '../../lib/themes.ts';
import { formatHeroDate, parseEventTargetDate, calculateCountdownTimeLeft } from '../../lib/dateFormatters.ts';

interface AnimatedCountdownProps {
  settings: WeddingSettings;
  guest?: Guest | null;
  cardStyle?: CardStyleId | string;
  className?: string;
  customStyle?: string;
  customTitle?: string;
  showGuestsBadge?: boolean;
  compact?: boolean;
}

// ----------------------------------------------------------------------
// 1. Classic Gold & Olive - Concentric & 3D Orbital Golden Rings (Ref. Imagen 1)
// ----------------------------------------------------------------------
export const ClassicGoldCountdownSvg: React.FC<{ accentColor?: string }> = ({
  accentColor = '#C5A059',
}) => {
  return (
    <div className="absolute -inset-5 sm:-inset-8 pointer-events-none z-0 flex items-center justify-center">
      <svg
        viewBox="0 0 360 360"
        className="w-full h-full overflow-visible"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <defs>
          <linearGradient id="goldRingGrad1" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#ECC875" stopOpacity="0.9" />
            <stop offset="35%" stopColor="#C5A059" stopOpacity="0.65" />
            <stop offset="70%" stopColor="#F7E2A9" stopOpacity="0.95" />
            <stop offset="100%" stopColor="#9C7935" stopOpacity="0.6" />
          </linearGradient>
          <linearGradient id="goldRingGrad2" x1="100%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#E2C17C" stopOpacity="0.85" />
            <stop offset="50%" stopColor="#FAF0D7" stopOpacity="0.95" />
            <stop offset="100%" stopColor="#B38938" stopOpacity="0.5" />
          </linearGradient>
          <filter id="softGlowGold" x="-20%" y="-20%" width="140%" height="140%">
            <feGaussianBlur stdDeviation="3" result="blur" />
            <feComposite in="SourceGraphic" in2="blur" operator="over" />
          </filter>
        </defs>

        {/* Outer Orbit Ring 1 - Concentric Circle Rotating Clockwise around (180, 180) */}
        <g>
          <animateTransform
            attributeName="transform"
            type="rotate"
            from="0 180 180"
            to="360 180 180"
            dur="28s"
            repeatCount="indefinite"
          />
          <circle
            cx="180"
            cy="180"
            r="162"
            stroke="url(#goldRingGrad1)"
            strokeWidth="1.6"
            strokeDasharray="8 6 2 6"
            opacity="0.85"
          />
          {/* Orbital Sparkle Star 1 at exact radius 162 (342, 180) */}
          <g>
            <circle cx="342" cy="180" r="3.5" fill="#FFE8A3" filter="url(#softGlowGold)" />
            <path d="M342 173 L342 187 M335 180 L349 180" stroke="#FFE8A3" strokeWidth="1.2" />
          </g>
        </g>

        {/* Counter-Rotating Orbit Ring 2 - Concentric Circle Counter-Clockwise around (180, 180) */}
        <g>
          <animateTransform
            attributeName="transform"
            type="rotate"
            from="0 180 180"
            to="-360 180 180"
            dur="22s"
            repeatCount="indefinite"
          />
          <circle
            cx="180"
            cy="180"
            r="150"
            stroke="url(#goldRingGrad2)"
            strokeWidth="1.3"
            strokeDasharray="5 7"
            opacity="0.75"
          />
          {/* Orbital Sparkle Star 2 at exact radius 150 (180, 30) */}
          <g>
            <circle cx="180" cy="30" r="3" fill="#FFF" filter="url(#softGlowGold)" />
            <path d="M180 24 L180 36 M174 30 L186 30" stroke="#FFF" strokeWidth="1" />
          </g>
        </g>

        {/* Third Concentric Orbit Ring with Sparkle Node at radius 156 (180, 336) */}
        <g>
          <animateTransform
            attributeName="transform"
            type="rotate"
            from="0 180 180"
            to="360 180 180"
            dur="36s"
            repeatCount="indefinite"
          />
          <circle
            cx="180"
            cy="180"
            r="156"
            stroke="#D4AF37"
            strokeWidth="0.8"
            strokeDasharray="3 7"
            opacity="0.5"
          />
          <circle cx="180" cy="336" r="2.2" fill="#FFE8A3" opacity="0.85" />
        </g>

        {/* Inner Concentric Breathing Halo Ring */}
        <circle
          cx="180"
          cy="180"
          r="142"
          stroke={accentColor}
          strokeWidth="1.2"
          strokeDasharray="4 4"
          opacity="0.6"
        >
          <animate
            attributeName="opacity"
            values="0.4;0.75;0.4"
            dur="4s"
            repeatCount="indefinite"
          />
        </circle>
      </svg>
    </div>
  );
};

// ----------------------------------------------------------------------
// 2. Romantic Floral - Watercolor Rose Blossom Spray & Foliage (Ref. Imagen 2)
// ----------------------------------------------------------------------
export const RomanticFloralCountdownSvg: React.FC<{ accentColor?: string }> = ({
  accentColor = '#B85D83',
}) => {
  return (
    <div className="absolute -inset-5 sm:-inset-8 pointer-events-none z-0 flex items-center justify-center">
      <svg
        viewBox="0 0 360 360"
        className="w-full h-full overflow-visible"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <defs>
          <linearGradient id="rosePedalGrad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#F9D4DD" />
            <stop offset="50%" stopColor="#EAA4B8" />
            <stop offset="100%" stopColor="#C46D89" />
          </linearGradient>
          <linearGradient id="roseLeafGrad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#A8C0A0" />
            <stop offset="100%" stopColor="#6E8E68" />
          </linearGradient>
          <linearGradient id="roseGoldRing" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#E8A5BF" stopOpacity="0.85" />
            <stop offset="50%" stopColor="#FAF0F4" stopOpacity="0.95" />
            <stop offset="100%" stopColor="#B85D83" stopOpacity="0.6" />
          </linearGradient>
        </defs>

        {/* Concentric Ring 1 - Delicate Rose Gold Circle Rotating around (180, 180) */}
        <g>
          <animateTransform
            attributeName="transform"
            type="rotate"
            from="0 180 180"
            to="360 180 180"
            dur="40s"
            repeatCount="indefinite"
          />
          <circle
            cx="180"
            cy="180"
            r="154"
            stroke="url(#roseGoldRing)"
            strokeWidth="1.2"
            strokeDasharray="6 4"
          />
          <circle cx="334" cy="180" r="2" fill="#E8A5BF" opacity="0.8" />
        </g>

        {/* Concentric Ring 2 - Counter-Rotating Circle around (180, 180) */}
        <g>
          <animateTransform
            attributeName="transform"
            type="rotate"
            from="0 180 180"
            to="-360 180 180"
            dur="35s"
            repeatCount="indefinite"
          />
          <circle
            cx="180"
            cy="180"
            r="148"
            stroke="#D895AC"
            strokeWidth="1"
            strokeDasharray="4 6"
            opacity="0.55"
          />
          <circle cx="180" cy="32" r="2" fill="#FAF0F4" opacity="0.85" />
        </g>

        {/* Top-Left Floral Garland Spray (Roses & Foliage anchored on the circle curve) */}
        <motion.g
          animate={{ rotate: [-1.5, 2, -1.5], y: [-1, 1, -1] }}
          transition={{ duration: 5.5, repeat: Infinity, ease: 'easeInOut' }}
          style={{ transformBox: 'fill-box', transformOrigin: 'center' }}
        >
          {/* Leaves */}
          <path
            d="M50 95 C40 85, 30 70, 36 54 C42 38, 58 35, 75 42 C62 55, 58 75, 50 95 Z"
            fill="url(#roseLeafGrad)"
            opacity="0.88"
          />
          <path
            d="M75 42 C85 30, 102 24, 118 28 C105 40, 95 52, 75 42 Z"
            fill="url(#roseLeafGrad)"
            opacity="0.75"
          />
          <path
            d="M32 115 C20 105, 18 90, 26 78 C35 88, 38 100, 32 115 Z"
            fill="#7B9974"
            opacity="0.7"
          />
          <path
            d="M125 32 C142 22, 160 22, 172 26 C155 35, 142 42, 125 32 Z"
            fill="#8EA886"
            opacity="0.7"
          />

          {/* Golden Twigs & Buds */}
          <path
            d="M60 80 Q35 50 70 35"
            stroke="#D4AF37"
            strokeWidth="1.2"
            strokeLinecap="round"
            opacity="0.7"
          />
          <circle cx="35" cy="50" r="3" fill="#F4BAC8" opacity="0.9" />
          <circle cx="70" cy="35" r="3.5" fill="#E8A5BF" opacity="0.95" />
          <circle cx="120" cy="24" r="2.5" fill="#D4AF37" opacity="0.85" />

          {/* Main Large English Garden Rose */}
          <g transform="translate(48, 48)">
            <path
              d="M30 10 C45 0, 60 10, 58 28 C56 42, 40 50, 25 46 C12 42, 5 30, 10 18 C14 8, 22 2, 30 10 Z"
              fill="url(#rosePedalGrad)"
              opacity="0.92"
            />
            <path
              d="M32 16 C42 12, 50 18, 48 30 C46 38, 36 42, 26 38 C18 34, 16 26, 20 20 C24 14, 28 12, 32 16 Z"
              fill="#E08EA5"
              opacity="0.9"
            />
            <path
              d="M30 22 C35 20, 40 24, 38 29 C36 33, 30 35, 27 32 C24 29, 26 25, 30 22 Z"
              fill="#B85D83"
            />
            <path
              d="M32 25 Q35 27 33 29"
              stroke="#FFF"
              strokeWidth="1"
              strokeLinecap="round"
              opacity="0.8"
            />
          </g>

          {/* Secondary Rosebud Accent */}
          <g transform="translate(100, 22) scale(0.68)">
            <path
              d="M25 8 C38 0, 48 10, 45 22 C42 32, 30 38, 20 34 C12 30, 8 20, 12 12 C15 5, 20 2, 25 8 Z"
              fill="url(#rosePedalGrad)"
              opacity="0.88"
            />
            <path
              d="M25 14 C32 10, 38 15, 35 23 C32 28, 24 30, 18 26 C14 22, 16 16, 25 14 Z"
              fill="#B85D83"
              opacity="0.85"
            />
          </g>
        </motion.g>

        {/* Floating Delicate Petals */}
        <motion.g
          animate={{
            y: [-3, 8, -3],
            x: [-3, 4, -3],
            rotate: [-8, 12, -8],
            opacity: [0.6, 0.95, 0.6],
          }}
          transition={{ duration: 4.5, repeat: Infinity, ease: 'easeInOut' }}
          style={{ transformBox: 'fill-box', transformOrigin: 'center' }}
        >
          <path
            d="M32 145 C38 138, 48 142, 44 150 C40 156, 32 154, 32 145 Z"
            fill="#F4BAC8"
            opacity="0.85"
          />
        </motion.g>

        <motion.g
          animate={{
            y: [5, -6, 5],
            x: [2, -4, 2],
            rotate: [10, -10, 10],
            opacity: [0.5, 0.9, 0.5],
          }}
          transition={{ duration: 5, repeat: Infinity, ease: 'easeInOut', delay: 1 }}
          style={{ transformBox: 'fill-box', transformOrigin: 'center' }}
        >
          <path
            d="M145 32 C150 25, 158 28, 155 35 C152 40, 145 38, 145 32 Z"
            fill="#EAA4B8"
            opacity="0.75"
          />
        </motion.g>
      </svg>
    </div>
  );
};

// ----------------------------------------------------------------------
// 3. Watercolor Garden - Geometric Crystal Polygon & Eucalyptus (Ref. Imagen 3)
// ----------------------------------------------------------------------
export const GeometricEucalyptusCountdownSvg: React.FC<{ accentColor?: string }> = ({
  accentColor = '#526B50',
}) => {
  return (
    <div className="absolute -inset-5 sm:-inset-8 pointer-events-none z-0 flex items-center justify-center">
      <svg
        viewBox="0 0 360 360"
        className="w-full h-full overflow-visible"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <defs>
          <linearGradient id="goldFacetGrad1" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#F5D77F" />
            <stop offset="50%" stopColor="#D4AF37" />
            <stop offset="100%" stopColor="#9C7935" />
          </linearGradient>
          <linearGradient id="goldFacetGrad2" x1="100%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#ECC875" />
            <stop offset="50%" stopColor="#FAF0D7" />
            <stop offset="100%" stopColor="#B38938" />
          </linearGradient>
          <linearGradient id="eucalyptusGrad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#8DA888" />
            <stop offset="50%" stopColor="#5B7856" />
            <stop offset="100%" stopColor="#3C5638" />
          </linearGradient>
        </defs>

        {/* Outer Faceted Geometric Gold Polygon - Symmetrically Centered at (180, 180) */}
        <polygon
          points="180,20 280,55 330,145 315,255 235,330 125,330 45,255 30,145 80,55"
          stroke="url(#goldFacetGrad1)"
          strokeWidth="1.8"
          opacity="0.85"
        />

        {/* Intersecting Tilted Facet Polygon - Symmetrically Centered at (180, 180) */}
        <polygon
          points="180,30 295,85 330,180 270,295 180,330 90,295 30,180 65,85"
          stroke="url(#goldFacetGrad2)"
          strokeWidth="1.4"
          opacity="0.7"
        />

        {/* Soft Concentric Circular Guide Wire at (180, 180) */}
        <circle
          cx="180"
          cy="180"
          r="148"
          stroke={accentColor}
          strokeWidth="0.8"
          strokeDasharray="3 4"
          opacity="0.4"
        />

        {/* Rotating Facet Sparkle Ring around (180, 180) */}
        <g>
          <animateTransform
            attributeName="transform"
            type="rotate"
            from="0 180 180"
            to="360 180 180"
            dur="45s"
            repeatCount="indefinite"
          />
          <circle
            cx="180"
            cy="180"
            r="152"
            stroke="url(#goldFacetGrad1)"
            strokeWidth="0.8"
            strokeDasharray="2 8"
            opacity="0.6"
          />
          <circle cx="332" cy="180" r="2.2" fill="#F5D77F" />
          <circle cx="28" cy="180" r="1.8" fill="#F5D77F" />
        </g>

        {/* Top-Right Eucalyptus Branch Cluster */}
        <motion.g
          animate={{ rotate: [-1.5, 2, -1.5], y: [-1, 1, -1] }}
          transition={{ duration: 5, repeat: Infinity, ease: 'easeInOut' }}
          style={{ transformBox: 'fill-box', transformOrigin: 'center' }}
        >
          <path
            d="M235 120 C255 100, 280 80, 320 60"
            stroke="#5B7856"
            strokeWidth="1.8"
            strokeLinecap="round"
          />
          <path
            d="M255 95 C245 80, 258 65, 272 75 C282 85, 270 102, 255 95 Z"
            fill="url(#eucalyptusGrad)"
            opacity="0.9"
          />
          <path
            d="M278 80 C275 63, 295 53, 308 65 C315 75, 302 90, 278 80 Z"
            fill="#73926E"
            opacity="0.85"
          />
          <path
            d="M305 68 C308 48, 330 46, 338 58 C342 68, 328 78, 305 68 Z"
            fill="url(#eucalyptusGrad)"
            opacity="0.9"
          />
        </motion.g>

        {/* Bottom-Left Eucalyptus Foliage Spray */}
        <motion.g
          animate={{ rotate: [1.5, -2, 1.5], y: [1, -1, 1] }}
          transition={{ duration: 5.8, repeat: Infinity, ease: 'easeInOut', delay: 0.5 }}
          style={{ transformBox: 'fill-box', transformOrigin: 'center' }}
        >
          <path
            d="M125 240 C105 260, 80 280, 40 300"
            stroke="#5B7856"
            strokeWidth="1.8"
            strokeLinecap="round"
          />
          <path
            d="M105 265 C115 280, 102 295, 88 285 C78 275, 90 258, 105 265 Z"
            fill="url(#eucalyptusGrad)"
            opacity="0.9"
          />
          <path
            d="M82 280 C85 297, 65 307, 52 295 C45 285, 58 270, 82 280 Z"
            fill="#73926E"
            opacity="0.85"
          />
          <path
            d="M55 292 C52 312, 30 314, 22 302 C18 292, 32 282, 55 292 Z"
            fill="url(#eucalyptusGrad)"
            opacity="0.9"
          />
        </motion.g>
      </svg>
    </div>
  );
};

// ----------------------------------------------------------------------
// 4. Boho Chic - Sunburst Mandala & Dried Pampas Plumes
// ----------------------------------------------------------------------
export const BohoMandalaCountdownSvg: React.FC<{ accentColor?: string }> = ({
  accentColor = '#B26E59',
}) => {
  return (
    <div className="absolute -inset-5 sm:-inset-8 pointer-events-none z-0 flex items-center justify-center">
      <svg
        viewBox="0 0 360 360"
        className="w-full h-full overflow-visible"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <defs>
          <linearGradient id="bohoSunGrad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#E5A67C" />
            <stop offset="50%" stopColor="#B26E59" />
            <stop offset="100%" stopColor="#7D8C7A" />
          </linearGradient>
        </defs>

        {/* Rotating Sunburst Mandala on Exact Center (180, 180) */}
        <g>
          <animateTransform
            attributeName="transform"
            type="rotate"
            from="0 180 180"
            to="360 180 180"
            dur="45s"
            repeatCount="indefinite"
          />
          <circle
            cx="180"
            cy="180"
            r="154"
            stroke="url(#bohoSunGrad)"
            strokeWidth="1.5"
            strokeDasharray="6 8"
            opacity="0.75"
          />
          {/* Sunburst Beams radiating from center (180, 180) */}
          {[0, 30, 60, 90, 120, 150, 180, 210, 240, 270, 300, 330].map((deg) => (
            <line
              key={deg}
              x1="180"
              y1="18"
              x2="180"
              y2="28"
              stroke="#B26E59"
              strokeWidth="1.6"
              strokeLinecap="round"
              opacity="0.7"
              transform={`rotate(${deg} 180 180)`}
            />
          ))}
        </g>

        {/* Counter-Rotating Dashed Accent Circle around (180, 180) */}
        <g>
          <animateTransform
            attributeName="transform"
            type="rotate"
            from="0 180 180"
            to="-360 180 180"
            dur="35s"
            repeatCount="indefinite"
          />
          <circle
            cx="180"
            cy="180"
            r="146"
            stroke="#E5A67C"
            strokeWidth="1"
            strokeDasharray="4 6"
            opacity="0.5"
          />
          <circle cx="180" cy="34" r="2.2" fill="#E5A67C" />
        </g>

        {/* Dried Pampas Grass Fronds at Bottom */}
        <motion.g
          animate={{ rotate: [-1.5, 2, -1.5], y: [-1, 1, -1] }}
          transition={{ duration: 5, repeat: Infinity, ease: 'easeInOut' }}
          style={{ transformBox: 'fill-box', transformOrigin: 'center' }}
        >
          <path
            d="M180 340 Q160 310 140 280 Q165 290 180 320 Q195 290 220 280 Q200 310 180 340 Z"
            fill="#DDA15E"
            opacity="0.75"
          />
          <path
            d="M180 340 Q145 325 115 315 Q140 315 165 330 Z"
            fill="#C87D55"
            opacity="0.7"
          />
          <path
            d="M180 340 Q215 325 245 315 Q220 315 195 330 Z"
            fill="#C87D55"
            opacity="0.7"
          />
        </motion.g>
      </svg>
    </div>
  );
};

// ----------------------------------------------------------------------
// 5. Dark Luxury - Gyroscopic Celestial Starlight & Planet Nodes
// ----------------------------------------------------------------------
export const DarkLuxuryCountdownSvg: React.FC<{ accentColor?: string }> = ({
  accentColor = '#E5C07B',
}) => {
  return (
    <div className="absolute -inset-5 sm:-inset-8 pointer-events-none z-0 flex items-center justify-center">
      <svg
        viewBox="0 0 360 360"
        className="w-full h-full overflow-visible"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <defs>
          <radialGradient id="cosmicGlow" cx="50%" cy="50%" r="50%">
            <stop offset="60%" stopColor="#E5C07B" stopOpacity="0" />
            <stop offset="100%" stopColor="#C5A059" stopOpacity="0.25" />
          </radialGradient>
        </defs>

        <circle cx="180" cy="180" r="162" fill="url(#cosmicGlow)" />

        {/* Ring 1 - True Circular Celestial Orbit Clockwise around (180, 180) */}
        <g>
          <animateTransform
            attributeName="transform"
            type="rotate"
            from="0 180 180"
            to="360 180 180"
            dur="25s"
            repeatCount="indefinite"
          />
          <circle
            cx="180"
            cy="180"
            r="158"
            stroke="#E5C07B"
            strokeWidth="1.2"
            opacity="0.8"
          />
          {/* Planet Nodes at exact radius 158: (338, 180) and (22, 180) */}
          <circle cx="338" cy="180" r="3.5" fill="#FFE8A3" />
          <circle cx="22" cy="180" r="2.5" fill="#FFE8A3" opacity="0.8" />
        </g>

        {/* Ring 2 - True Circular Celestial Orbit Counter-Clockwise around (180, 180) */}
        <g>
          <animateTransform
            attributeName="transform"
            type="rotate"
            from="0 180 180"
            to="-360 180 180"
            dur="32s"
            repeatCount="indefinite"
          />
          <circle
            cx="180"
            cy="180"
            r="148"
            stroke="#D4AF37"
            strokeWidth="1"
            strokeDasharray="4 6"
            opacity="0.65"
          />
          {/* Planet Nodes at exact radius 148: (180, 32) and (180, 328) */}
          <circle cx="180" cy="32" r="3" fill="#FFF" />
          <circle cx="180" cy="328" r="2" fill="#FAF0D7" opacity="0.75" />
        </g>
      </svg>
    </div>
  );
};

// ----------------------------------------------------------------------
// 6. Minimal Editorial - Swiss Horlogerie Haute-Couture Precision Arc
// ----------------------------------------------------------------------
export const MinimalEditorialCountdownSvg: React.FC<{ accentColor?: string }> = ({
  accentColor = '#141414',
}) => {
  return (
    <div className="absolute -inset-5 sm:-inset-8 pointer-events-none z-0 flex items-center justify-center">
      <svg
        viewBox="0 0 360 360"
        className="w-full h-full overflow-visible"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <circle cx="180" cy="180" r="154" stroke={accentColor} strokeWidth="1.8" opacity="0.85" />
        <circle
          cx="180"
          cy="180"
          r="146"
          stroke={accentColor}
          strokeWidth="0.8"
          strokeDasharray="2 6"
          opacity="0.5"
        />

        {/* Rotating Precision Sweep Line around exact center (180, 180) */}
        <g>
          <animateTransform
            attributeName="transform"
            type="rotate"
            from="0 180 180"
            to="360 180 180"
            dur="12s"
            repeatCount="indefinite"
          />
          <circle cx="180" cy="26" r="2.5" fill={accentColor} />
          <line
            x1="180"
            y1="20"
            x2="180"
            y2="34"
            stroke={accentColor}
            strokeWidth="1.5"
            strokeLinecap="square"
          />
        </g>
      </svg>
    </div>
  );
};

// ----------------------------------------------------------------------
// 7. Royal Navy - Imperial Baroque Filigree & Royal Crown Crest
// ----------------------------------------------------------------------
export const RoyalNavyCountdownSvg: React.FC<{ accentColor?: string }> = ({
  accentColor = '#F3CF68',
}) => {
  return (
    <div className="absolute -inset-5 sm:-inset-8 pointer-events-none z-0 flex items-center justify-center">
      <svg
        viewBox="0 0 360 360"
        className="w-full h-full overflow-visible"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        {/* Double Royal Gold Border */}
        <circle cx="180" cy="180" r="154" stroke="#D4AF37" strokeWidth="2" opacity="0.85" />
        <circle
          cx="180"
          cy="180"
          r="146"
          stroke="#F3CF68"
          strokeWidth="1"
          strokeDasharray="4 4"
          opacity="0.65"
        />

        {/* Rotating Royal Star Orbit around (180, 180) */}
        <g>
          <animateTransform
            attributeName="transform"
            type="rotate"
            from="0 180 180"
            to="360 180 180"
            dur="35s"
            repeatCount="indefinite"
          />
          <circle
            cx="180"
            cy="180"
            r="150"
            stroke="#ECC875"
            strokeWidth="0.8"
            strokeDasharray="3 9"
            opacity="0.6"
          />
          <circle cx="330" cy="180" r="2.5" fill="#FFE8A3" />
          <circle cx="30" cy="180" r="2.5" fill="#FFE8A3" />
        </g>

        {/* Royal Crown Crest at Top Center */}
        <g transform="translate(0, 0)">
          <path
            d="M162 30 L166 18 L174 24 L180 14 L186 24 L194 18 L198 30 Z"
            fill="#F3CF68"
            stroke="#D4AF37"
            strokeWidth="1.2"
          />
          <circle cx="180" cy="13" r="2" fill="#FFF" />
          <circle cx="166" cy="17" r="1.5" fill="#FFE8A3" />
          <circle cx="194" cy="17" r="1.5" fill="#FFE8A3" />
        </g>
      </svg>
    </div>
  );
};

// ----------------------------------------------------------------------
// 8. Terracotta Sunset - Crepuscular Sunburst & Copper Arches
// ----------------------------------------------------------------------
export const TerracottaSunsetCountdownSvg: React.FC<{ accentColor?: string }> = ({
  accentColor = '#E07A5F',
}) => {
  return (
    <div className="absolute -inset-5 sm:-inset-8 pointer-events-none z-0 flex items-center justify-center">
      <svg
        viewBox="0 0 360 360"
        className="w-full h-full overflow-visible"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        {/* Rotating Sunbeams and Ring around exact center (180, 180) */}
        <g>
          <animateTransform
            attributeName="transform"
            type="rotate"
            from="0 180 180"
            to="360 180 180"
            dur="38s"
            repeatCount="indefinite"
          />
          <circle
            cx="180"
            cy="180"
            r="155"
            stroke="#E07A5F"
            strokeWidth="1.6"
            strokeDasharray="6 6"
          />
          <circle cx="335" cy="180" r="2.5" fill="#E07A5F" />
          {[15, 45, 75, 105, 135, 165, 195, 225, 255, 285, 315, 345].map((deg) => (
            <line
              key={deg}
              x1="180"
              y1="16"
              x2="180"
              y2="25"
              stroke="#E07A5F"
              strokeWidth="1.4"
              strokeLinecap="round"
              transform={`rotate(${deg} 180 180)`}
            />
          ))}
        </g>
        <circle
          cx="180"
          cy="180"
          r="147"
          stroke="#F4A261"
          strokeWidth="1"
          strokeDasharray="3 5"
          opacity="0.6"
        />
      </svg>
    </div>
  );
};

// ----------------------------------------------------------------------
// 9. Lavender Provence - French Lavender Sprigs & Fluttering Butterfly
// ----------------------------------------------------------------------
export const LavenderProvenceCountdownSvg: React.FC<{ accentColor?: string }> = ({
  accentColor = '#7B6D8D',
}) => {
  return (
    <div className="absolute -inset-5 sm:-inset-8 pointer-events-none z-0 flex items-center justify-center">
      <svg
        viewBox="0 0 360 360"
        className="w-full h-full overflow-visible"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        {/* Concentric Lavender Rings */}
        <circle cx="180" cy="180" r="154" stroke="#9D8BB0" strokeWidth="1.2" opacity="0.6" />
        <circle
          cx="180"
          cy="180"
          r="146"
          stroke="#7B6D8D"
          strokeWidth="1"
          strokeDasharray="5 5"
          opacity="0.45"
        />

        {/* Rotating Delicate Lavender Sparkle Ring around (180, 180) */}
        <g>
          <animateTransform
            attributeName="transform"
            type="rotate"
            from="0 180 180"
            to="360 180 180"
            dur="42s"
            repeatCount="indefinite"
          />
          <circle
            cx="180"
            cy="180"
            r="150"
            stroke="#C4B7D7"
            strokeWidth="0.8"
            strokeDasharray="4 8"
            opacity="0.7"
          />
          <circle cx="330" cy="180" r="2.2" fill="#E8DDF5" />
          <circle cx="30" cy="180" r="2.2" fill="#E8DDF5" />
        </g>

        {/* Animated Fluttering 3D Butterfly on Top-Right */}
        <motion.g
          animate={{ y: [-2, 3, -2], x: [1, -2, 1] }}
          transition={{ duration: 3.5, repeat: Infinity, ease: 'easeInOut' }}
          style={{ transformBox: 'fill-box', transformOrigin: 'center' }}
        >
          <motion.g
            animate={{ scaleX: [1, 0.25, 1] }}
            transition={{ duration: 0.45, repeat: Infinity, ease: 'easeInOut' }}
            style={{ transformBox: 'fill-box', transformOrigin: 'center' }}
          >
            <path
              d="M290 70 C280 55, 265 60, 272 75 C275 82, 285 78, 290 70 Z"
              fill="#B4A4C8"
              opacity="0.9"
            />
            <path
              d="M290 70 C300 55, 315 60, 308 75 C305 82, 295 78, 290 70 Z"
              fill="#7B6D8D"
              opacity="0.9"
            />
          </motion.g>
          <line x1="290" y1="65" x2="290" y2="76" stroke="#4A3E56" strokeWidth="1.5" strokeLinecap="round" />
        </motion.g>
      </svg>
    </div>
  );
};

// ----------------------------------------------------------------------
// 10. Emerald Botanical - Deep Jungle Palms & Monstera Gold
// ----------------------------------------------------------------------
export const EmeraldBotanicalCountdownSvg: React.FC<{ accentColor?: string }> = ({
  accentColor = '#52B788',
}) => {
  return (
    <div className="absolute -inset-5 sm:-inset-8 pointer-events-none z-0 flex items-center justify-center">
      <svg
        viewBox="0 0 360 360"
        className="w-full h-full overflow-visible"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <circle cx="180" cy="180" r="154" stroke="#52B788" strokeWidth="1.4" opacity="0.65" />

        {/* Rotating Dashed Emerald Ring around exact center (180, 180) */}
        <g>
          <animateTransform
            attributeName="transform"
            type="rotate"
            from="0 180 180"
            to="-360 180 180"
            dur="40s"
            repeatCount="indefinite"
          />
          <circle
            cx="180"
            cy="180"
            r="146"
            stroke="#74C69D"
            strokeWidth="1"
            strokeDasharray="4 6"
            opacity="0.6"
          />
          <circle cx="180" cy="34" r="2.5" fill="#B7E4C7" />
          <circle cx="180" cy="326" r="2" fill="#B7E4C7" />
        </g>

        {/* Tropical Monstera Accent Leaf on Top-Left */}
        <motion.g
          animate={{ rotate: [-1.5, 2, -1.5] }}
          transition={{ duration: 5, repeat: Infinity, ease: 'easeInOut' }}
          style={{ transformBox: 'fill-box', transformOrigin: 'center' }}
        >
          <path
            d="M60 90 C45 70, 48 45, 75 48 C95 50, 95 80, 60 90 Z"
            fill="#2D6A4F"
            opacity="0.85"
          />
          <path d="M60 90 L75 48" stroke="#74C69D" strokeWidth="1" opacity="0.7" />
        </motion.g>
      </svg>
    </div>
  );
};

// ----------------------------------------------------------------------
// 11. Coastal Breeze - Marine Ripple Rings & Pearl Shell Crest
// ----------------------------------------------------------------------
export const CoastalBreezeCountdownSvg: React.FC<{ accentColor?: string }> = ({
  accentColor = '#2B6CB0',
}) => {
  return (
    <div className="absolute -inset-5 sm:-inset-8 pointer-events-none z-0 flex items-center justify-center">
      <svg
        viewBox="0 0 360 360"
        className="w-full h-full overflow-visible"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        {/* Concentric Ripple Rings */}
        <circle
          cx="180"
          cy="180"
          r="154"
          stroke="#63B3ED"
          strokeWidth="1.4"
          opacity="0.6"
        />
        <circle
          cx="180"
          cy="180"
          r="146"
          stroke="#2B6CB0"
          strokeWidth="1"
          strokeDasharray="5 5"
          opacity="0.5"
        />

        {/* Rotating Sea Spray Ripple Ring around (180, 180) */}
        <g>
          <animateTransform
            attributeName="transform"
            type="rotate"
            from="0 180 180"
            to="360 180 180"
            dur="35s"
            repeatCount="indefinite"
          />
          <circle
            cx="180"
            cy="180"
            r="150"
            stroke="#90CDF4"
            strokeWidth="0.9"
            strokeDasharray="3 7"
            opacity="0.65"
          />
          <circle cx="330" cy="180" r="2.5" fill="#FAF5FF" />
          <circle cx="30" cy="180" r="2.5" fill="#FAF5FF" />
        </g>

        {/* Pearl Beads on Top */}
        <circle cx="180" cy="24" r="3.5" fill="#FAF5FF" stroke="#63B3ED" strokeWidth="1" />
        <circle cx="166" cy="26" r="2.5" fill="#FAF5FF" stroke="#63B3ED" strokeWidth="0.8" />
        <circle cx="194" cy="26" r="2.5" fill="#FAF5FF" stroke="#63B3ED" strokeWidth="0.8" />
      </svg>
    </div>
  );
};

// ----------------------------------------------------------------------
// 12. Champagne Glam - Art Déco Sunburst Fan & Pearl Sparkles
// ----------------------------------------------------------------------
export const ChampagneGlamCountdownSvg: React.FC<{ accentColor?: string }> = ({
  accentColor = '#C39B60',
}) => {
  return (
    <div className="absolute -inset-5 sm:-inset-8 pointer-events-none z-0 flex items-center justify-center">
      <svg
        viewBox="0 0 360 360"
        className="w-full h-full overflow-visible"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <circle cx="180" cy="180" r="154" stroke="#C39B60" strokeWidth="1.8" opacity="0.8" />
        <circle
          cx="180"
          cy="180"
          r="146"
          stroke="#E5C992"
          strokeWidth="1"
          strokeDasharray="3 3"
          opacity="0.7"
        />

        {/* Rotating Glamour Sparkle Orbit around exact center (180, 180) */}
        <g>
          <animateTransform
            attributeName="transform"
            type="rotate"
            from="0 180 180"
            to="360 180 180"
            dur="30s"
            repeatCount="indefinite"
          />
          <circle
            cx="180"
            cy="180"
            r="150"
            stroke="#F7E2A9"
            strokeWidth="0.9"
            strokeDasharray="4 8"
            opacity="0.75"
          />
          <circle cx="330" cy="180" r="3" fill="#FFF" />
          <circle cx="30" cy="180" r="2" fill="#FFE8A3" />
        </g>

        {/* 1920s Art Déco Fan Crest on Top */}
        <g transform="translate(0, 0)">
          <path
            d="M155 35 L180 18 L205 35 L180 28 Z"
            fill="#E5C992"
            stroke="#C39B60"
            strokeWidth="1"
            opacity="0.9"
          />
        </g>
      </svg>
    </div>
  );
};

/** Every card theme has a matching countdown surround. Keeping this registry
 * typed makes adding a new card style fail at compile time until its artwork
 * is implemented as well. */
export const COUNTDOWN_STYLE_IDS = [
  'classic-gold',
  'romantic-floral',
  'boho-chic',
  'minimal-editorial',
  'dark-luxury',
  'watercolor-garden',
  'royal-navy',
  'terracotta-sunset',
  'lavender-provence',
  'emerald-botanical',
  'coastal-breeze',
  'champagne-glam',
] as const satisfies readonly CardStyleId[];

const COUNTDOWN_STYLE_RENDERERS: Record<CardStyleId, React.FC<{ accentColor?: string }>> = {
  'classic-gold': ClassicGoldCountdownSvg,
  'romantic-floral': RomanticFloralCountdownSvg,
  'boho-chic': BohoMandalaCountdownSvg,
  'minimal-editorial': MinimalEditorialCountdownSvg,
  'dark-luxury': DarkLuxuryCountdownSvg,
  'watercolor-garden': GeometricEucalyptusCountdownSvg,
  'royal-navy': RoyalNavyCountdownSvg,
  'terracotta-sunset': TerracottaSunsetCountdownSvg,
  'lavender-provence': LavenderProvenceCountdownSvg,
  'emerald-botanical': EmeraldBotanicalCountdownSvg,
  'coastal-breeze': CoastalBreezeCountdownSvg,
  'champagne-glam': ChampagneGlamCountdownSvg,
};

function resolveCountdownStyle(...candidates: Array<string | undefined>): CardStyleId {
  for (const candidate of candidates) {
    if (candidate && candidate !== 'auto' && candidate in COUNTDOWN_STYLE_RENDERERS) {
      return candidate as CardStyleId;
    }
  }
  return 'classic-gold';
}

// ----------------------------------------------------------------------
// MASTER COUNTDOWN COMPONENT
// ----------------------------------------------------------------------
export const AnimatedCountdown: React.FC<AnimatedCountdownProps> = ({
  settings,
  guest,
  cardStyle,
  className = '',
  customStyle,
  customTitle,
  showGuestsBadge,
  compact = false,
}) => {
  const activeStyleId = resolveCountdownStyle(
    customStyle,
    settings.countdownStyle,
    cardStyle,
    settings.cardStyle,
  );
  const resolvedTheme = CARD_THEMES[activeStyleId] || CARD_THEMES['classic-gold'];
  const isDark = activeStyleId === 'dark-luxury' || activeStyleId === 'royal-navy' || activeStyleId === 'emerald-botanical';

  // Sincronized Real-Time Countdown Engine
  const [timeLeft, setTimeLeft] = useState({
    days: 0,
    hours: 0,
    minutes: 0,
    seconds: 0,
    isExpired: false,
  });

  useEffect(() => {
    const calculateTimeLeft = () => {
      const targetDate = parseEventTargetDate(
        settings.eventDate,
        settings.eventTime,
        settings.heroCustomDateText
      );
      setTimeLeft(calculateCountdownTimeLeft(targetDate));
    };

    calculateTimeLeft();
    const interval = setInterval(calculateTimeLeft, 1000);
    return () => clearInterval(interval);
  }, [settings.eventDate, settings.eventTime, settings.heroCustomDateText]);

  // Title selection ("Faltan", "Falta", or custom)
  const displayTitle = customTitle || settings.countdownTitle || (timeLeft.days === 1 ? 'Falta' : 'Faltan');

  // Select the appropriate animated SVG surround
  const renderSvgSurround = () => {
    const CountdownSurround = COUNTDOWN_STYLE_RENDERERS[activeStyleId];
    return <CountdownSurround accentColor={resolvedTheme.accentColorHex} />;
  };

  // Companion names parsing - only computed when a real guest exists
  const companionList = useMemo(() => {
    if (!guest) {
      return [];
    }
    const list: string[] = [];
    if (guest.fullName) {
      list.push(guest.fullName);
    }
    if (guest.companionNames) {
      try {
        const parsed = JSON.parse(guest.companionNames);
        if (Array.isArray(parsed)) {
          for (const c of parsed) {
            const trimmed = typeof c === 'string' ? c.trim() : '';
            if (trimmed && !list.some((existing) => existing.toLowerCase() === trimmed.toLowerCase())) {
              list.push(trimmed);
            }
          }
        }
      } catch {
        if (typeof guest.companionNames === 'string' && guest.companionNames.includes(',')) {
          for (const c of guest.companionNames.split(',')) {
            const trimmed = c.trim();
            if (trimmed && !list.some((existing) => existing.toLowerCase() === trimmed.toLowerCase())) {
              list.push(trimmed);
            }
          }
        }
      }
    }
    return list;
  }, [guest]);

  const passesCount = guest ? (guest.confirmedPasses || guest.allocatedPasses || 1) : 0;
  const companionsCount = Math.max(0, passesCount - 1);
  const shouldShowGuestBadge = Boolean(guest) && (showGuestsBadge !== undefined ? showGuestsBadge : (settings.showCountdownGuestsBadge !== false));
  const requestedLayout = settings.countdownLayout || 'circle';
  const countdownLayout = ['circle', 'editorial', 'tiles', 'banner', 'ribbon', 'spotlight', 'timeline', 'flip', 'stacked', 'arch'].includes(requestedLayout)
    ? requestedLayout
    : 'circle';
  const formattedEventDate = formatHeroDate(
    settings.eventDate,
    settings.heroDateFormat || 'dd.mm.aaaa',
    settings.heroCustomDateText,
  );
  const formattedEventTime = useMemo(() => {
    const match = /^(\d{1,2}):(\d{2})$/.exec(settings.eventTime?.trim() || '');
    if (!match) return settings.eventTime?.trim() || '';
    const time = new Date(2000, 0, 1, Number(match[1]), Number(match[2]));
    return new Intl.DateTimeFormat('es-PE', { hour: 'numeric', minute: '2-digit' }).format(time);
  }, [settings.eventTime]);
  const timeUnits = [
    { key: 'days', value: timeLeft.days, label: 'días' },
    { key: 'hours', value: timeLeft.hours, label: 'horas' },
    { key: 'minutes', value: timeLeft.minutes, label: 'min' },
    { key: 'seconds', value: timeLeft.seconds, label: 'seg' },
  ];
  const renderTimeUnits = (layout: string) => (
    <div className={`mx-auto grid w-full grid-cols-4 items-center justify-items-center ${layout === 'circle' ? 'px-1 sm:px-2' : layout === 'tiles' ? 'gap-2 sm:gap-3' : 'gap-1 sm:gap-2'}`}>
      {timeUnits.map((unit, index) => (
        <div
          key={unit.key}
          className={`flex w-full min-w-0 flex-col items-center justify-center text-center ${layout === 'tiles'
            ? `rounded-xl border px-1.5 py-2 sm:py-3 ${isDark ? 'border-white/10 bg-white/5' : 'border-stone-200/80 bg-white/70'}`
            : index > 0
              ? `border-l ${isDark ? 'border-white/15' : 'border-stone-300/70'}`
              : ''}`}
        >
          <motion.span
            key={`${unit.key}-${unit.value}`}
            initial={{ opacity: 0.75, y: -2 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.25 }}
            className={`font-bold font-serif tabular-nums leading-none ${layout === 'hero' ? 'text-2xl sm:text-3xl' : 'text-3xl sm:text-4xl md:text-5xl'} ${layout === 'hero' ? 'text-white' : unit.key === 'seconds' && !isDark ? 'text-stone-800' : isDark ? 'text-white' : 'text-stone-900'}`}
            style={unit.key === 'seconds' && isDark ? { color: resolvedTheme.accentColorHex } : undefined}
          >
            {unit.key === 'days' ? unit.value : String(unit.value).padStart(2, '0')}
          </motion.span>
          <span className={`mt-1 font-sans uppercase tracking-[0.16em] ${layout === 'hero' ? 'text-[8px] text-white/75 sm:text-[9px]' : 'text-[9px] text-stone-500 sm:text-[10px]'}`}>
            {unit.label}
          </span>
        </div>
      ))}
    </div>
  );
  const renderCountdownHeading = (layout: string) => (
    <div className="mx-auto flex w-full flex-col items-center text-center">
      <time
        dateTime={settings.eventDate || undefined}
        className={`max-w-[min(100%,22rem)] text-balance leading-snug font-sans font-medium tracking-wide ${layout === 'circle' ? 'text-sm sm:text-base md:text-lg' : 'text-base sm:text-lg'} ${isDark ? 'text-stone-200' : 'text-stone-700'}`}
      >
        {formattedEventDate}
      </time>
      {formattedEventTime && (
        <span className={`mt-1 inline-flex items-center gap-1.5 font-sans text-xs tracking-wide sm:text-sm ${isDark ? 'text-stone-400' : 'text-stone-500'}`}>
          <Clock3 className="h-3.5 w-3.5" style={{ color: resolvedTheme.accentColorHex }} aria-hidden="true" />
          {formattedEventTime}
        </span>
      )}
      <span
        className={`mt-1 font-serif italic tracking-wide text-3xl sm:text-4xl md:text-5xl ${isDark ? 'text-amber-200' : 'text-stone-800'}`}
        style={{ fontFamily: '"Playfair Display", "Cinzel", Georgia, serif' }}
      >
        {displayTitle}
      </span>
      <svg viewBox="0 0 60 8" className={`mt-1 h-2 overflow-visible ${layout === 'circle' ? 'w-12 sm:w-14' : 'w-14 sm:w-16'}`} fill="none" aria-hidden="true">
        <path d="M5 4 C20 1, 25 7, 30 4 C35 1, 40 7, 55 4" stroke={resolvedTheme.accentColorHex} strokeWidth="1.2" strokeLinecap="round" />
        <circle cx="30" cy="4" r="1.5" fill={resolvedTheme.accentColorHex} />
      </svg>
    </div>
  );
  const renderCountdownHeart = () => (
    <motion.div
      animate={{ scale: [1, 1.18, 1] }}
      transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
      className="mt-2 flex items-center justify-center"
      aria-hidden="true"
    >
      <Heart className="h-4 w-4" style={{ fill: resolvedTheme.accentColorHex, color: resolvedTheme.accentColorHex }} />
    </motion.div>
  );

  return (
    <div className={`relative flex w-full flex-col items-center justify-center select-none ${className}`}>
      {compact ? (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="mx-auto w-full max-w-md rounded-2xl border border-white/30 bg-black/30 px-3 py-3 text-white shadow-lg backdrop-blur-md sm:px-5 sm:py-4"
          style={{ borderColor: `${resolvedTheme.accentColorHex}AA` }}
        >
          <div className="mb-2 text-center font-serif text-lg italic text-white sm:text-xl">{displayTitle}</div>
          {formattedEventTime && (
            <div className="mb-2 flex items-center justify-center gap-1.5 font-sans text-xs text-white/80">
              <Clock3 className="h-3.5 w-3.5" style={{ color: resolvedTheme.accentColorHex }} aria-hidden="true" />
              {formattedEventTime}
            </div>
          )}
          {renderTimeUnits('hero')}
        </motion.div>
      ) : countdownLayout === 'circle' ? (
        <div className="relative mx-auto flex aspect-square h-auto w-full max-w-[22rem] items-center justify-center sm:max-w-[24rem] md:max-w-[26rem]">
          {renderSvgSurround()}
          <motion.div
            initial={{ opacity: 0, scale: 0.94 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.8 }}
            className={`relative z-10 flex h-[90%] w-[90%] flex-col items-center justify-center rounded-full border p-4 text-center shadow-2xl transition-all ${isDark
              ? 'bg-stone-900/95 border-amber-400/40 text-white shadow-black/60'
              : 'bg-white/95 border-stone-200/80 text-stone-800 shadow-stone-400/25'}`}
            style={{ backdropFilter: 'blur(8px)' }}
          >
            {renderCountdownHeading('circle')}
            <div className="mt-3 w-full">{renderTimeUnits('circle')}</div>
            {renderCountdownHeart()}
          </motion.div>
        </div>
      ) : countdownLayout === 'editorial' ? (
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.65 }}
          className={`w-full max-w-4xl rounded-3xl border px-5 py-6 shadow-xl sm:px-8 sm:py-8 ${isDark ? 'border-amber-400/30 bg-stone-900/95 text-white' : 'border-stone-200 bg-white/95 text-stone-800'}`}
          style={{ borderTopColor: resolvedTheme.accentColorHex, borderTopWidth: 3, backdropFilter: 'blur(8px)' }}
        >
          <div className="mx-auto flex w-full max-w-3xl flex-col items-center gap-6 text-center">
            {renderCountdownHeading('editorial')}
            <div className="w-full flex-1">{renderTimeUnits('editorial')}</div>
          </div>
          {renderCountdownHeart()}
        </motion.div>
      ) : countdownLayout === 'tiles' ? (
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.65 }}
          className={`mx-auto w-full max-w-3xl rounded-3xl border p-5 text-center shadow-xl sm:p-8 ${isDark ? 'border-white/10 bg-stone-900/95 text-white' : 'border-stone-200 bg-white/95 text-stone-800'}`}
          style={{ borderColor: `${resolvedTheme.accentColorHex}55`, backdropFilter: 'blur(8px)' }}
        >
          {renderCountdownHeading('tiles')}
          <div className="mt-6">{renderTimeUnits('tiles')}</div>
          {renderCountdownHeart()}
        </motion.div>
      ) : countdownLayout === 'ribbon' ? (
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.65 }}
          className={`mx-auto w-full max-w-6xl rounded-[2rem] border px-4 py-6 text-center shadow-xl sm:px-10 sm:py-8 ${isDark ? 'border-amber-300/30 bg-stone-900/95 text-white' : 'border-stone-200 bg-white/95 text-stone-800'}`}
          style={{ borderColor: `${resolvedTheme.accentColorHex}66`, backdropFilter: 'blur(8px)' }}
        >
          {renderCountdownHeading('ribbon')}
          <div className={`mx-auto mt-6 w-full max-w-5xl rounded-2xl border px-2 py-4 sm:px-8 sm:py-6 ${isDark ? 'border-white/10 bg-white/5' : 'border-stone-200/80 bg-stone-50/80'}`}>
            {renderTimeUnits('ribbon')}
          </div>
          {renderCountdownHeart()}
        </motion.div>
      ) : countdownLayout === 'spotlight' ? (
        <motion.div
          initial={{ opacity: 0, scale: 0.97 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.65 }}
          className={`mx-auto flex w-full max-w-5xl flex-col items-center rounded-[2.5rem] border px-4 py-6 text-center shadow-xl sm:px-8 sm:py-9 ${isDark ? 'border-white/10 bg-stone-900/95 text-white' : 'border-stone-200 bg-white/95 text-stone-800'}`}
          style={{ borderTopColor: resolvedTheme.accentColorHex, borderTopWidth: 4, backdropFilter: 'blur(8px)' }}
        >
          {renderCountdownHeading('spotlight')}
          <div className="mt-6 grid w-full max-w-4xl grid-cols-1 items-center gap-5 sm:grid-cols-[1fr_2fr] sm:gap-8">
            <div className={`flex flex-col items-center justify-center rounded-3xl border px-4 py-5 ${isDark ? 'border-white/10 bg-white/5' : 'border-stone-200 bg-stone-50/80'}`}>
              <motion.span
                key={`spotlight-days-${timeLeft.days}`}
                initial={{ opacity: 0.7, y: -3 }}
                animate={{ opacity: 1, y: 0 }}
                className={`font-serif text-7xl font-bold leading-none tabular-nums sm:text-8xl ${isDark ? 'text-white' : 'text-stone-900'}`}
              >
                {timeLeft.days}
              </motion.span>
              <span className="mt-2 text-xs uppercase tracking-[0.22em] text-stone-500">días</span>
            </div>
            <div className="grid w-full grid-cols-3 items-center justify-items-center">
              {timeUnits.slice(1).map((unit, index) => (
                <div key={unit.key} className={`flex w-full flex-col items-center justify-center px-1 text-center ${index > 0 ? `border-l ${isDark ? 'border-white/15' : 'border-stone-300/70'}` : ''}`}>
                  <motion.span
                    key={`spotlight-${unit.key}-${unit.value}`}
                    initial={{ opacity: 0.7, y: -2 }}
                    animate={{ opacity: 1, y: 0 }}
                    className={`font-serif text-3xl font-bold leading-none tabular-nums sm:text-5xl ${isDark ? 'text-white' : 'text-stone-900'}`}
                  >
                    {String(unit.value).padStart(2, '0')}
                  </motion.span>
                  <span className="mt-2 text-[9px] uppercase tracking-[0.15em] text-stone-500 sm:text-[10px]">{unit.label}</span>
                </div>
              ))}
            </div>
          </div>
          {renderCountdownHeart()}
        </motion.div>
      ) : countdownLayout === 'timeline' ? (
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.65 }}
          className={`mx-auto w-full max-w-6xl rounded-3xl border px-3 py-6 text-center shadow-xl sm:px-8 sm:py-9 ${isDark ? 'border-white/10 bg-stone-900/95 text-white' : 'border-stone-200 bg-white/95 text-stone-800'}`}
          style={{ borderColor: `${resolvedTheme.accentColorHex}55`, backdropFilter: 'blur(8px)' }}
        >
          {renderCountdownHeading('timeline')}
          <div className="relative mx-auto mt-8 grid w-full max-w-5xl grid-cols-4 items-start">
            <div className="absolute left-[12.5%] right-[12.5%] top-1.5 h-px" style={{ backgroundColor: `${resolvedTheme.accentColorHex}88` }} />
            {timeUnits.map((unit) => (
              <div key={unit.key} className="relative flex min-w-0 flex-col items-center px-1 text-center">
                <span className="z-10 h-3 w-3 rounded-full border-2 bg-white" style={{ borderColor: resolvedTheme.accentColorHex }} />
                <motion.span
                  key={`timeline-${unit.key}-${unit.value}`}
                  initial={{ opacity: 0.7, y: -2 }}
                  animate={{ opacity: 1, y: 0 }}
                  className={`mt-3 font-serif text-2xl font-bold leading-none tabular-nums sm:text-4xl ${isDark ? 'text-white' : 'text-stone-900'}`}
                >
                  {unit.key === 'days' ? unit.value : String(unit.value).padStart(2, '0')}
                </motion.span>
                <span className="mt-1 text-[8px] uppercase tracking-[0.13em] text-stone-500 sm:text-[10px] sm:tracking-[0.18em]">{unit.label}</span>
              </div>
            ))}
          </div>
          {renderCountdownHeart()}
        </motion.div>
      ) : countdownLayout === 'flip' ? (
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.65 }}
          className={`mx-auto w-full max-w-5xl rounded-3xl border p-4 text-center shadow-xl sm:p-8 ${isDark ? 'border-white/10 bg-stone-900/95 text-white' : 'border-stone-200 bg-white/95 text-stone-800'}`}
          style={{ borderColor: `${resolvedTheme.accentColorHex}66`, backdropFilter: 'blur(8px)' }}
        >
          {renderCountdownHeading('flip')}
          <div className="mx-auto mt-6 grid w-full max-w-4xl grid-cols-2 gap-2 sm:grid-cols-4 sm:gap-4">
            {timeUnits.map((unit) => (
              <div key={unit.key} className={`overflow-hidden rounded-2xl border shadow-sm ${isDark ? 'border-white/15' : 'border-stone-200'}`}>
                <motion.div
                  key={`flip-${unit.key}-${unit.value}`}
                  initial={{ rotateX: -24, opacity: 0.65 }}
                  animate={{ rotateX: 0, opacity: 1 }}
                  transition={{ duration: 0.35 }}
                  className={`relative flex min-h-20 items-center justify-center font-serif text-4xl font-bold leading-none tabular-nums sm:min-h-28 sm:text-6xl ${isDark ? 'text-white' : 'text-stone-900'}`}
                  style={{
                    background: isDark
                      ? 'linear-gradient(to bottom, rgba(255,255,255,.1) 0 49.5%, rgba(0,0,0,.18) 50% 100%)'
                      : 'linear-gradient(to bottom, rgba(255,255,255,.96) 0 49.5%, rgba(231,229,220,.48) 50% 100%)',
                    transformPerspective: 500,
                  }}
                >
                  {unit.key === 'days' ? unit.value : String(unit.value).padStart(2, '0')}
                  <span className="absolute inset-x-0 top-1/2 border-t border-black/10" />
                </motion.div>
                <div className={`py-1.5 text-[9px] uppercase tracking-[0.18em] sm:py-2 sm:text-[10px] ${isDark ? 'bg-white/5 text-stone-300' : 'bg-stone-50 text-stone-500'}`}>
                  {unit.label}
                </div>
              </div>
            ))}
          </div>
          {renderCountdownHeart()}
        </motion.div>
      ) : countdownLayout === 'stacked' ? (
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.65 }}
          className={`mx-auto w-full max-w-3xl rounded-3xl border px-5 py-6 text-center shadow-xl sm:px-9 sm:py-8 ${isDark ? 'border-white/10 bg-stone-900/95 text-white' : 'border-stone-200 bg-white/95 text-stone-800'}`}
          style={{ borderColor: `${resolvedTheme.accentColorHex}55`, backdropFilter: 'blur(8px)' }}
        >
          {renderCountdownHeading('stacked')}
          <div className={`mx-auto mt-5 w-full max-w-xl divide-y ${isDark ? 'divide-white/15' : 'divide-stone-200'}`}>
            {timeUnits.map((unit) => (
              <div key={unit.key} className="grid grid-cols-[1fr_auto_1fr] items-center gap-3 py-2.5 sm:py-3">
                <span className={`text-right font-sans text-[10px] uppercase tracking-[0.2em] sm:text-xs ${isDark ? 'text-stone-400' : 'text-stone-500'}`}>{unit.label}</span>
                <motion.span
                  key={`stacked-${unit.key}-${unit.value}`}
                  initial={{ opacity: 0.65, x: 5 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.25 }}
                  className={`min-w-[3ch] text-center font-serif text-4xl font-bold leading-none tabular-nums sm:text-5xl ${isDark ? 'text-white' : 'text-stone-900'}`}
                >
                  {unit.key === 'days' ? unit.value : String(unit.value).padStart(2, '0')}
                </motion.span>
                <span className="text-left text-[10px] uppercase tracking-[0.12em] text-stone-400 sm:text-xs">restantes</span>
              </div>
            ))}
          </div>
          {renderCountdownHeart()}
        </motion.div>
      ) : countdownLayout === 'arch' ? (
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.65 }}
          className={`mx-auto w-full max-w-5xl rounded-t-[180px] rounded-b-3xl border px-4 pb-5 pt-8 text-center shadow-xl sm:px-10 sm:pb-8 sm:pt-10 ${isDark ? 'border-amber-300/30 bg-stone-900/95 text-white' : 'border-stone-200 bg-white/95 text-stone-800'}`}
          style={{ borderColor: `${resolvedTheme.accentColorHex}66`, backdropFilter: 'blur(8px)' }}
        >
          {renderCountdownHeading('arch')}
          <div className={`mx-auto mt-6 w-full max-w-4xl rounded-full border px-2 py-4 sm:px-8 sm:py-6 ${isDark ? 'border-white/10 bg-white/5' : 'border-stone-200/80 bg-stone-50/80'}`}>
            {renderTimeUnits('arch')}
          </div>
          {renderCountdownHeart()}
        </motion.div>
      ) : (
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.65 }}
          className="mx-auto w-full max-w-4xl px-2 py-5 text-center sm:px-6 sm:py-7"
        >
          {renderCountdownHeading('banner')}
          <div className={`mx-auto mt-5 max-w-3xl border-y py-4 sm:py-5 ${isDark ? 'border-white/20' : 'border-stone-300/80'}`}>
            {renderTimeUnits('banner')}
          </div>
          {renderCountdownHeart()}
        </motion.div>
      )}

      {/* Guest Information & Passes Badge - Only shown when guest is identified (via link or returning session) */}
      {shouldShowGuestBadge && guest && (
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.2 }}
          className="mt-2 sm:mt-3 flex flex-col items-center text-center space-y-1.5 z-10"
        >
          {/* Circular Badge with Passes Count */}
          <div
            className="w-7 h-7 sm:w-8 sm:h-8 rounded-full flex items-center justify-center text-white font-bold font-serif text-xs sm:text-sm shadow-md"
            style={{ backgroundColor: resolvedTheme.accentColorHex }}
          >
            {passesCount}
          </div>

          {/* Text Title */}
          <span
            className={`text-xs sm:text-sm font-serif font-extrabold uppercase tracking-widest ${
              isDark ? 'text-white' : 'text-stone-800'
            }`}
          >
            {passesCount === 1 ? 'Pase Personal' : 'Invitados'}
          </span>

          {/* Subtitle with Companions Count */}
          {companionsCount > 0 && (
            <span className="text-[11px] sm:text-xs text-stone-500 font-serif italic">
              ({companionsCount} {companionsCount === 1 ? 'acompañante' : 'acompañantes'})
            </span>
          )}

          {/* Companion Name Pills */}
          {companionList.length > 0 && (
            <div className="flex flex-wrap items-center justify-center gap-1.5 mt-1 max-w-xs sm:max-w-md">
              {companionList.map((name, idx) => (
                <span
                  key={idx}
                  className={`px-3 py-1 rounded-lg text-[11px] sm:text-xs font-serif font-medium border shadow-2xs ${
                    isDark
                      ? 'bg-stone-850/90 border-stone-700 text-stone-200'
                      : 'bg-white/90 border-stone-200 text-stone-700'
                  }`}
                >
                  {name}
                </span>
              ))}
            </div>
          )}

          {/* Confirmation Status Tag */}
          {guest.status === 'confirmed' && (
            <div className="inline-flex items-center gap-1 px-2.5 py-0.5 mt-1 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-700 text-[10px] font-sans font-semibold tracking-wide">
              <Check className="w-3 h-3 text-emerald-600" />
              <span>Asistencia Confirmada</span>
            </div>
          )}
        </motion.div>
      )}
    </div>
  );
};
