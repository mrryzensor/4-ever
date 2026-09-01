import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  Shirt,
  Sparkles,
  Palette,
  AlertCircle,
  Check,
  Footprints,
  Info,
  Layers,
  ChevronRight,
  User,
  Eye,
  Sliders,
  Maximize2
} from 'lucide-react';
import { WeddingSettings } from '../types.ts';
import { StyleSpecificDivider } from './AnimatedSvgs.tsx';
import { CARD_THEMES } from '../lib/themes.ts';

interface DressCodeSectionProps {
  settings: WeddingSettings;
  className?: string;
}

// -------------------------------------------------------------
// Ultra-Realistic SVG Fashion Mockup for Caballero (Gentleman)
// -------------------------------------------------------------
export interface ManOutfitProps {
  suitColor: string;
  shirtColor?: string;
  tieColor?: string;
  outfitType: 'tuxedo' | 'suit' | 'guayabera' | 'blazer';
  fabricFinish?: 'matte' | 'satin' | 'linen' | 'velvet';
  showShoes?: boolean;
}

export const ManFashionMockup: React.FC<ManOutfitProps> = ({
  suitColor,
  shirtColor = '#FFFFFF',
  tieColor,
  outfitType,
  fabricFinish = 'satin',
}) => {
  const safeId = (suitColor || '#1C2D37').replace(/[^a-zA-Z0-9]/g, '');
  const darkShade = adjustColorBrightness(suitColor, -35);
  const midDark = adjustColorBrightness(suitColor, -18);
  const lightShade = adjustColorBrightness(suitColor, 22);
  const highlightShade = adjustColorBrightness(suitColor, 45);
  const resolvedTieColor = tieColor || (outfitType === 'tuxedo' ? '#0F172A' : '#334155');

  return (
    <div className="relative w-full max-w-[220px] sm:max-w-[240px] aspect-[1/2.05] mx-auto flex items-center justify-center filter drop-shadow-xl select-none">
      <svg
        viewBox="0 0 240 460"
        className="w-full h-full overflow-visible"
        xmlns="http://www.w3.org/2000/svg"
      >
        <defs>
          {/* Dimensional Fabric Gradient */}
          <linearGradient id={`man-suit-main-${safeId}`} x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor={lightShade} />
            <stop offset="35%" stopColor={suitColor} />
            <stop offset="70%" stopColor={midDark} />
            <stop offset="100%" stopColor={darkShade} />
          </linearGradient>

          {/* Torso volume / radial lighting */}
          <radialGradient id={`man-torso-vol-${safeId}`} cx="50%" cy="30%" r="70%">
            <stop offset="0%" stopColor={highlightShade} stopOpacity="0.4" />
            <stop offset="40%" stopColor={suitColor} stopOpacity="0.1" />
            <stop offset="100%" stopColor={darkShade} stopOpacity="0.6" />
          </radialGradient>

          {/* Satin Lapel Sheen */}
          <linearGradient id={`man-satin-lapel-${safeId}`} x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#0B0F19" />
            <stop offset="45%" stopColor="#2A3447" />
            <stop offset="70%" stopColor="#111827" />
            <stop offset="100%" stopColor="#030712" />
          </linearGradient>

          {/* Trouser Crease Light */}
          <linearGradient id={`man-leg-grad-${safeId}`} x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor={darkShade} />
            <stop offset="30%" stopColor={suitColor} />
            <stop offset="50%" stopColor={lightShade} />
            <stop offset="70%" stopColor={suitColor} />
            <stop offset="100%" stopColor={darkShade} />
          </linearGradient>

          {/* Realistic Skin Shader */}
          <linearGradient id="man-skin-tone" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#F5D0C0" />
            <stop offset="60%" stopColor="#E5B5A0" />
            <stop offset="100%" stopColor="#CA9480" />
          </linearGradient>

          {/* Neck Shadow */}
          <linearGradient id="man-neck-shadow" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#B37D6B" />
            <stop offset="100%" stopColor="#E5B5A0" />
          </linearGradient>

          {/* Hair Gradient */}
          <linearGradient id="man-hair" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#4A3B32" />
            <stop offset="50%" stopColor="#2B211B" />
            <stop offset="100%" stopColor="#15100D" />
          </linearGradient>

          {/* Shoe Leather Polish */}
          <linearGradient id="shoe-polish" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#382E2B" />
            <stop offset="30%" stopColor="#1A1513" />
            <stop offset="70%" stopColor="#0B0908" />
            <stop offset="100%" stopColor="#261E1A" />
          </linearGradient>

          <filter id="soft-depth" x="-15%" y="-15%" width="130%" height="130%">
            <feDropShadow dx="0" dy="6" stdDeviation="4" floodOpacity="0.22" />
          </filter>
        </defs>

        {/* Ambient Floor Shadow */}
        <ellipse cx="120" cy="432" rx="60" ry="8" fill="#000000" opacity="0.18" />

        {/* ========================================================= */}
        {/* 1. HEAD, HAIR, EARS & NECK (Anatomical Fashion Silhouette) */}
        {/* ========================================================= */}
        <g id="man-head-group">
          {/* Neck base with anatomical shadow */}
          <path
            d="M107 68 L133 68 L134 98 C134 102 128 106 120 106 C112 106 106 102 106 98 Z"
            fill="url(#man-skin-tone)"
          />
          {/* Sternocleidomastoid & neck shadow */}
          <path
            d="M110 70 Q120 90 120 104 Q120 90 130 70"
            fill="none"
            stroke="url(#man-neck-shadow)"
            strokeWidth="2.5"
            opacity="0.6"
          />

          {/* Head & Jawline */}
          <path
            d="M103 48 C103 26 110 22 120 22 C130 22 137 26 137 48 C137 64 130 74 120 74 C110 74 103 64 103 48 Z"
            fill="url(#man-skin-tone)"
          />

          {/* Ears */}
          <ellipse cx="102" cy="48" rx="3.5" ry="6.5" fill="url(#man-skin-tone)" />
          <ellipse cx="138" cy="48" rx="3.5" ry="6.5" fill="url(#man-skin-tone)" />

          {/* Modern Groomed Hairstyle */}
          <path
            d="M102 44 C100 24 112 16 123 16 C136 16 142 24 140 38 C138 34 130 30 122 31 C112 32 107 38 102 44 Z"
            fill="url(#man-hair)"
          />
          {/* Hair volume & side fade */}
          <path
            d="M103 36 C106 24 115 19 126 18 C136 18 140 25 139 34 C133 26 123 25 114 27 C108 28 104 32 103 36 Z"
            fill="#5E4C41"
            opacity="0.6"
          />
        </g>

        {/* ========================================================= */}
        {/* 2. GUAYABERA OUTFIT (Boda de Playa, Jardín o Clima Cálido) */}
        {/* ========================================================= */}
        {outfitType === 'guayabera' && (
          <g id="outfit-guayabera">
            {/* Crisp Linen Guayabera Body */}
            <path
              d="M84 98 L60 216 L108 222 L120 222 L132 222 L180 216 L156 98 L136 92 L104 92 Z"
              fill={shirtColor || '#FDFBF7'}
              stroke="#D6D1C7"
              strokeWidth="1.2"
              filter="url(#soft-depth)"
            />

            {/* Linen Weave Highlight Texture */}
            <path
              d="M84 98 L60 216 L108 222 L120 222 L132 222 L180 216 L156 98 Z"
              fill="url(#man-suit-main-FFF)"
              opacity="0.08"
            />

            {/* Cuban Camp Collar with Open Neckline */}
            <polygon points="104,92 120,114 112,94" fill="#EFECE6" stroke="#D1CCC2" strokeWidth="0.8" />
            <polygon points="136,92 120,114 128,94" fill="#E8E4DD" stroke="#D1CCC2" strokeWidth="0.8" />
            <polygon points="114,94 120,108 126,94" fill="url(#man-skin-tone)" />

            {/* Precision Presidential Vertical Alforzas (Pleats) */}
            <g stroke="#C2BBB0" strokeWidth="1" strokeDasharray="3.5 1.5">
              <line x1="98" y1="104" x2="98" y2="216" />
              <line x1="102" y1="104" x2="102" y2="216" />
              <line x1="106" y1="104" x2="106" y2="216" />
              <line x1="134" y1="104" x2="134" y2="216" />
              <line x1="138" y1="104" x2="138" y2="216" />
              <line x1="142" y1="104" x2="142" y2="216" />
            </g>

            {/* 4 Classic Guayabera Pockets with Triangular Flap & Buttons */}
            {/* Top Left */}
            <rect x="92" y="118" width="18" height="18" rx="2" fill="#FAF8F5" stroke="#D4CEC4" strokeWidth="0.8" />
            <circle cx="101" cy="122" r="1.5" fill="#E8E4DD" stroke="#B8B0A2" strokeWidth="0.5" />
            {/* Top Right */}
            <rect x="130" y="118" width="18" height="18" rx="2" fill="#FAF8F5" stroke="#D4CEC4" strokeWidth="0.8" />
            <circle cx="139" cy="122" r="1.5" fill="#E8E4DD" stroke="#B8B0A2" strokeWidth="0.5" />
            {/* Bottom Left */}
            <rect x="90" y="172" width="20" height="20" rx="2" fill="#FAF8F5" stroke="#D4CEC4" strokeWidth="0.8" />
            <circle cx="100" cy="176" r="1.5" fill="#E8E4DD" stroke="#B8B0A2" strokeWidth="0.5" />
            {/* Bottom Right */}
            <rect x="130" y="172" width="20" height="20" rx="2" fill="#FAF8F5" stroke="#D4CEC4" strokeWidth="0.8" />
            <circle cx="140" cy="176" r="1.5" fill="#E8E4DD" stroke="#B8B0A2" strokeWidth="0.5" />

            {/* Mother-of-Pearl Center Placket Buttons */}
            <circle cx="120" cy="132" r="1.8" fill="#F4F1EA" stroke="#A8A092" strokeWidth="0.6" />
            <circle cx="120" cy="154" r="1.8" fill="#F4F1EA" stroke="#A8A092" strokeWidth="0.6" />
            <circle cx="120" cy="176" r="1.8" fill="#F4F1EA" stroke="#A8A092" strokeWidth="0.6" />
            <circle cx="120" cy="198" r="1.8" fill="#F4F1EA" stroke="#A8A092" strokeWidth="0.6" />

            {/* Long Sleeves with French Cuffs */}
            <path d="M84 98 L56 195 L72 198 L86 128 Z" fill={shirtColor || '#FDFBF7'} stroke="#D6D1C7" strokeWidth="1" />
            <path d="M156 98 L184 195 L168 198 L154 128 Z" fill={shirtColor || '#FDFBF7'} stroke="#D6D1C7" strokeWidth="1" />
            {/* Cuffs */}
            <rect x="53" y="193" width="18" height="7" rx="1.5" fill="#F0EDE6" stroke="#D1CCC2" strokeWidth="0.8" transform="rotate(-6 53 193)" />
            <rect x="169" y="193" width="18" height="7" rx="1.5" fill="#F0EDE6" stroke="#D1CCC2" strokeWidth="0.8" transform="rotate(6 169 193)" />

            {/* Hands */}
            <path d="M56 199 L50 224 L60 226 L67 202 Z" fill="url(#man-skin-tone)" />
            <path d="M184 199 L190 224 L180 226 L173 202 Z" fill="url(#man-skin-tone)" />

            {/* Linen Trousers (Pantalón de Lino Fresco) */}
            <path
              d="M78 214 L84 395 L113 395 L120 262 L127 395 L156 395 L162 214 Z"
              fill={`url(#man-leg-grad-${safeId})`}
              filter="url(#soft-depth)"
            />
            {/* Trouser Center Crease */}
            <line x1="98" y1="230" x2="98" y2="390" stroke="#000000" strokeWidth="1.2" opacity="0.22" />
            <line x1="142" y1="230" x2="142" y2="390" stroke="#000000" strokeWidth="1.2" opacity="0.22" />
          </g>
        )}

        {/* ========================================================= */}
        {/* 3. TUXEDO / SUIT / BLAZER (Traje de Gala & Etiqueta) */}
        {/* ========================================================= */}
        {outfitType !== 'guayabera' && (
          <g id="outfit-tailored">
            {/* Crisp White Shirt Base & Pleated Marcella Bib */}
            <path d="M102 92 L138 92 L134 165 L106 165 Z" fill={shirtColor} />
            {/* Wing or Italian Spread Collar */}
            <polygon points="106,92 120,110 110,96" fill="#F8FAFC" stroke="#CBD5E1" strokeWidth="0.8" />
            <polygon points="134,92 120,110 130,96" fill="#E2E8F0" stroke="#CBD5E1" strokeWidth="0.8" />

            {/* Tie or Bowtie */}
            {outfitType === 'tuxedo' ? (
              // Luxury Satin Bowtie (Pajarita de Gala)
              <g id="tuxedo-bowtie">
                <path
                  d="M108 100 L98 94 C96 100 96 106 98 112 L108 106 Z"
                  fill={resolvedTieColor}
                  stroke="#000000"
                  strokeWidth="0.5"
                />
                <path
                  d="M132 100 L142 94 C144 100 144 106 142 112 L132 106 Z"
                  fill={resolvedTieColor}
                  stroke="#000000"
                  strokeWidth="0.5"
                />
                <rect x="115" y="98" width="10" height="8" rx="2" fill={resolvedTieColor} stroke="#000000" strokeWidth="0.6" />
                {/* Center knot highlight */}
                <path d="M117 99 L123 99 L121 105 L119 105 Z" fill="#FFFFFF" opacity="0.2" />
              </g>
            ) : (
              // Structured Silk Necktie with Windsor Knot & Dimple
              <g id="silk-necktie">
                {/* Knot */}
                <polygon points="116,102 124,102 126,111 114,111" fill={resolvedTieColor} stroke="#000000" strokeWidth="0.4" />
                <path d="M118 103 L122 103 L121 109 L119 109 Z" fill="#FFFFFF" opacity="0.2" />
                {/* Tie Body */}
                <polygon
                  points="115,111 125,111 128,175 120,186 112,175"
                  fill={resolvedTieColor}
                  stroke="#000000"
                  strokeWidth="0.5"
                />
                {/* Dimple Crease */}
                <line x1="120" y1="112" x2="120" y2="126" stroke="#000000" strokeWidth="1.2" opacity="0.35" />
                {/* Light highlight along tie blade */}
                <line x1="122" y1="114" x2="125" y2="172" stroke="#FFFFFF" strokeWidth="1" opacity="0.2" />
              </g>
            )}

            {/* Jacket Torso (Saco Estructurado con Hombros Definidos) */}
            <path
              d="M84 94 L56 220 L72 225 L82 170 L82 238 L118 242 L122 242 L158 238 L158 170 L168 225 L184 220 L156 94 L138 90 L102 90 Z"
              fill={`url(#man-suit-main-${safeId})`}
              filter="url(#soft-depth)"
            />

            {/* Torso volume lighting */}
            <path
              d="M84 94 L56 220 L72 225 L82 170 L82 238 L118 242 L122 242 L158 238 L158 170 L168 225 L184 220 L156 94 Z"
              fill={`url(#man-torso-vol-${safeId})`}
            />

            {/* LAPELS: Peaked or Notched Satin / Fabric Lapels */}
            {/* Left Lapel (Solapa Izquierda) */}
            <path
              d="M102 90 L82 148 L118 192 L120 142 L112 98 Z"
              fill={outfitType === 'tuxedo' ? `url(#man-satin-lapel-${safeId})` : `url(#man-suit-main-${safeId})`}
              stroke="#000000"
              strokeWidth="0.8"
              strokeOpacity="0.3"
            />
            {/* Right Lapel (Solapa Derecha) */}
            <path
              d="M138 90 L158 148 L122 192 L120 142 L128 98 Z"
              fill={outfitType === 'tuxedo' ? `url(#man-satin-lapel-${safeId})` : `url(#man-suit-main-${safeId})`}
              stroke="#000000"
              strokeWidth="0.8"
              strokeOpacity="0.3"
            />

            {/* Left Lapel Peak Notch Accent */}
            {outfitType === 'tuxedo' && (
              <polygon points="82,148 76,140 84,136" fill={`url(#man-satin-lapel-${safeId})`} stroke="#000000" strokeWidth="0.5" />
            )}
            {outfitType === 'tuxedo' && (
              <polygon points="158,148 164,140 156,136" fill={`url(#man-satin-lapel-${safeId})`} stroke="#000000" strokeWidth="0.5" />
            )}

            {/* Breast Welt Pocket & Silk Pocket Square */}
            <g id="pocket-square">
              {/* Pocket Welt */}
              <rect x="88" y="152" width="18" height="3" rx="1" fill="#0F172A" opacity="0.3" />
              {/* Pocket Square Fold (Two-Point or Presidential) */}
              <polygon points="91,152 95,142 99,152" fill="#FFFFFF" />
              <polygon points="97,152 101,145 105,152" fill={outfitType === 'tuxedo' ? '#F1F5F9' : lightShade} />
            </g>

            {/* Jacket Buttons (Botones Forrados o Cuerno) */}
            <circle cx="120" cy="198" r="2.8" fill="#0F172A" stroke="#475569" strokeWidth="0.6" />
            <circle cx="120" cy="216" r="2.8" fill="#0F172A" stroke="#475569" strokeWidth="0.6" />

            {/* Arms & French Cuffs */}
            <rect x="56" y="218" width="16" height="5" rx="1.5" fill="#FFFFFF" transform="rotate(-15 56 218)" />
            <rect x="168" y="218" width="16" height="5" rx="1.5" fill="#FFFFFF" transform="rotate(15 168 218)" />
            {/* Hands */}
            <path d="M57 222 L51 246 L60 248 L68 225 Z" fill="url(#man-skin-tone)" />
            <path d="M183 222 L189 246 L180 248 L172 225 Z" fill="url(#man-skin-tone)" />

            {/* Trousers (Pantalón de Vestir a Medida) */}
            <path
              d="M82 234 L84 395 L113 395 L120 262 L127 395 L156 395 L158 234 Z"
              fill={
                outfitType === 'blazer'
                  ? '#1E293B' // Contrasting charcoal trousers for blazer
                  : `url(#man-leg-grad-${safeId})`
              }
              filter="url(#soft-depth)"
            />

            {/* Satin Galon (Tuxedo side ribbon) */}
            {outfitType === 'tuxedo' && (
              <>
                <line x1="85" y1="236" x2="87" y2="395" stroke="#0F172A" strokeWidth="2.5" opacity="0.6" />
                <line x1="155" y1="236" x2="153" y2="395" stroke="#0F172A" strokeWidth="2.5" opacity="0.6" />
              </>
            )}

            {/* Ironed Center Creases (Raya Planchada Impecable) */}
            <line x1="98" y1="248" x2="98" y2="390" stroke="#000000" strokeWidth="1.2" opacity="0.25" />
            <line x1="142" y1="248" x2="142" y2="390" stroke="#000000" strokeWidth="1.2" opacity="0.25" />
          </g>
        )}

        {/* ========================================================= */}
        {/* 4. FORMAL LEATHER SHOES (Zapatos Oxford Pulidos con Brillo) */}
        {/* ========================================================= */}
        <g id="man-shoes-polished">
          {/* Left Oxford Shoe */}
          <path
            d="M80 394 C77 402 74 412 68 416 C64 418 78 422 110 422 C115 422 116 414 114 394 Z"
            fill="url(#shoe-polish)"
          />
          {/* Shoe Cap Toe Seam & Laces */}
          <path d="M72 414 Q90 416 108 414" fill="none" stroke="#000000" strokeWidth="1" opacity="0.6" />
          <line x1="90" y1="400" x2="98" y2="400" stroke="#475569" strokeWidth="1" />
          <line x1="91" y1="404" x2="97" y2="404" stroke="#475569" strokeWidth="1" />
          {/* Mirror Toe Gloss Reflection */}
          <ellipse cx="78" cy="415" rx="6" ry="2" fill="#FFFFFF" opacity="0.25" transform="rotate(-15 78 415)" />
          {/* Leather Sole Welt Edge */}
          <path d="M67 418 L111 418 L111 421 L67 421 Z" fill="#5C3A21" />

          {/* Right Oxford Shoe */}
          <path
            d="M160 394 C163 402 166 412 172 416 C176 418 162 422 130 422 C125 422 124 414 126 394 Z"
            fill="url(#shoe-polish)"
          />
          <path d="M168 414 Q150 416 132 414" fill="none" stroke="#000000" strokeWidth="1" opacity="0.6" />
          <line x1="150" y1="400" x2="142" y2="400" stroke="#475569" strokeWidth="1" />
          <line x1="149" y1="404" x2="143" y2="404" stroke="#475569" strokeWidth="1" />
          <ellipse cx="162" cy="415" rx="6" ry="2" fill="#FFFFFF" opacity="0.25" transform="rotate(15 162 415)" />
          <path d="M129 418 L173 418 L173 421 L129 421 Z" fill="#5C3A21" />
        </g>
      </svg>

      {/* Haute Couture Atelier Badge */}
      <div className="absolute -bottom-3 inset-x-0 flex justify-center">
        <span className="text-[10px] uppercase font-bold tracking-widest px-3 py-1 rounded-full bg-[#1E293B] text-white backdrop-blur-md border border-slate-700 shadow-md flex items-center gap-1">
          <Sparkles className="w-2.5 h-2.5 text-amber-400" />
          Caballero
        </span>
      </div>
    </div>
  );
};

// -------------------------------------------------------------
// Ultra-Realistic SVG Fashion Mockup for Dama (Lady / Woman)
// -------------------------------------------------------------
export interface WomanOutfitProps {
  dressColor: string;
  accessoryColor?: string;
  outfitType: 'long-gown' | 'cocktail' | 'jumpsuit' | 'boho';
  fabricFinish?: 'matte' | 'satin' | 'linen' | 'velvet';
  showShoes?: boolean;
}

export const WomanFashionMockup: React.FC<WomanOutfitProps> = ({
  dressColor,
  accessoryColor = '#D4AF37',
  outfitType,
  fabricFinish = 'satin',
}) => {
  const safeId = (dressColor || '#8A6D3B').replace(/[^a-zA-Z0-9]/g, '');
  const darkShade = adjustColorBrightness(dressColor, -32);
  const midDark = adjustColorBrightness(dressColor, -15);
  const lightShade = adjustColorBrightness(dressColor, 28);
  const highlightShade = adjustColorBrightness(dressColor, 55);

  return (
    <div className="relative w-full max-w-[220px] sm:max-w-[240px] aspect-[1/2.05] mx-auto flex items-center justify-center filter drop-shadow-xl select-none">
      <svg
        viewBox="0 0 240 460"
        className="w-full h-full overflow-visible"
        xmlns="http://www.w3.org/2000/svg"
      >
        <defs>
          {/* Multi-Dimensional Silk / Gown Gradient */}
          <linearGradient id={`woman-dress-main-${safeId}`} x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor={lightShade} />
            <stop offset="35%" stopColor={dressColor} />
            <stop offset="70%" stopColor={midDark} />
            <stop offset="100%" stopColor={darkShade} />
          </linearGradient>

          {/* Cascading Drapery Folds Gradient */}
          <linearGradient id={`woman-folds-${safeId}`} x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor={darkShade} />
            <stop offset="25%" stopColor={dressColor} />
            <stop offset="45%" stopColor={highlightShade} stopOpacity="0.9" />
            <stop offset="65%" stopColor={dressColor} />
            <stop offset="100%" stopColor={darkShade} />
          </linearGradient>

          {/* High-Luster Satin Sheen */}
          <linearGradient id={`woman-satin-sheen-${safeId}`} x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#FFFFFF" stopOpacity="0.45" />
            <stop offset="30%" stopColor="#FFFFFF" stopOpacity="0.0" />
            <stop offset="70%" stopColor="#000000" stopOpacity="0.25" />
            <stop offset="100%" stopColor="#000000" stopOpacity="0.5" />
          </linearGradient>

          {/* Skin Tone & Décolletage Shading */}
          <linearGradient id="woman-skin-tone" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#FCE7DE" />
            <stop offset="60%" stopColor="#F5D0C0" />
            <stop offset="100%" stopColor="#E2B19E" />
          </linearGradient>

          <linearGradient id="woman-hair" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#4A3728" />
            <stop offset="50%" stopColor="#2E2016" />
            <stop offset="100%" stopColor="#170F0A" />
          </linearGradient>

          {/* Metallic Gold / Champagne Jewelry */}
          <linearGradient id="gold-metal" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#FFF1B8" />
            <stop offset="40%" stopColor="#E5C158" />
            <stop offset="70%" stopColor="#B38B22" />
            <stop offset="100%" stopColor="#8A6711" />
          </linearGradient>

          <filter id="woman-depth" x="-15%" y="-15%" width="130%" height="130%">
            <feDropShadow dx="0" dy="6" stdDeviation="4" floodOpacity="0.2" />
          </filter>
        </defs>

        {/* Floor Shadow */}
        <ellipse cx="120" cy="432" rx="55" ry="8" fill="#000000" opacity="0.16" />

        {/* ========================================================= */}
        {/* 1. HEAD, UPDO HAIRSTYLE, EARRINGS & SLENDER NECK */}
        {/* ========================================================= */}
        <g id="woman-head-group">
          {/* Slender Swan Neck */}
          <path
            d="M112 64 L128 64 L128 98 C128 102 124 105 120 105 C116 105 112 102 112 98 Z"
            fill="url(#woman-skin-tone)"
          />
          {/* Neck shade & collarbone hollow */}
          <path
            d="M114 66 Q120 84 120 98 Q120 84 126 66"
            fill="none"
            stroke="#D69F8B"
            strokeWidth="1.8"
            opacity="0.45"
          />

          {/* Elegant Oval Face */}
          <path
            d="M107 46 C107 28 113 22 120 22 C127 22 133 28 133 46 C133 60 127 70 120 70 C113 70 107 60 107 46 Z"
            fill="url(#woman-skin-tone)"
          />

          {/* Haute Couture Braided Chignon / Evening Updo */}
          <ellipse cx="120" cy="24" rx="14" ry="11" fill="url(#woman-hair)" />
          <path
            d="M106 42 C106 24 113 18 122 18 C131 18 135 24 134 42 C131 38 126 36 120 37 C114 38 109 40 106 42 Z"
            fill="url(#woman-hair)"
          />
          {/* Hair shine strand */}
          <path
            d="M112 28 Q120 22 128 28"
            fill="none"
            stroke="#7A5E48"
            strokeWidth="1.5"
            opacity="0.6"
          />

          {/* Crystal / Gold Drop Chandelier Earrings */}
          <g id="earrings">
            <circle cx="106" cy="48" r="1.8" fill="url(#gold-metal)" />
            <line x1="106" y1="50" x2="106" y2="58" stroke="url(#gold-metal)" strokeWidth="1" />
            <polygon points="104,58 108,58 106,63" fill="url(#gold-metal)" />
            <circle cx="106" cy="61" r="1" fill="#FFFFFF" />

            <circle cx="134" cy="48" r="1.8" fill="url(#gold-metal)" />
            <line x1="134" y1="50" x2="134" y2="58" stroke="url(#gold-metal)" strokeWidth="1" />
            <polygon points="132,58 136,58 134,63" fill="url(#gold-metal)" />
            <circle cx="134" cy="61" r="1" fill="#FFFFFF" />
          </g>
        </g>

        {/* ========================================================= */}
        {/* 2. DÉCOLLETAGE, COLLARBONES & ARMS */}
        {/* ========================================================= */}
        <g id="woman-body-base">
          {/* Graceful Bare Shoulders & Arms */}
          <path
            d="M92 98 C96 90 108 90 120 90 C132 90 144 90 148 98 L168 195 L156 197 L140 134 L134 162 L106 162 L100 134 L84 197 L72 195 Z"
            fill="url(#woman-skin-tone)"
          />
          {/* Delicate Collarbone Shadows */}
          <path d="M102 98 Q111 103 118 101" fill="none" stroke="#D19782" strokeWidth="1.2" opacity="0.6" />
          <path d="M138 98 Q129 103 122 101" fill="none" stroke="#D19782" strokeWidth="1.2" opacity="0.6" />

          {/* Fine Layered Necklace */}
          <path d="M112 88 Q120 102 128 88" fill="none" stroke="url(#gold-metal)" strokeWidth="1" />
          <circle cx="120" cy="99" r="1.8" fill="url(#gold-metal)" />
          <circle cx="120" cy="99" r="0.8" fill="#FFFFFF" />
        </g>

        {/* ========================================================= */}
        {/* 3. OUTFIT: LONG GOWN (Vestido Largo de Noche / Gala) */}
        {/* ========================================================= */}
        {outfitType === 'long-gown' && (
          <g id="outfit-long-gown">
            {/* Sculpted Sweetheart Bodice / Corset */}
            <path
              d="M98 108 C106 102 114 104 120 108 C126 104 134 102 142 108 L136 168 C130 178 125 180 120 180 C115 180 110 178 104 168 Z"
              fill={`url(#woman-dress-main-${safeId})`}
              filter="url(#woman-depth)"
            />

            {/* Bust contouring & satin sheen */}
            <path
              d="M98 108 C106 102 114 104 120 108 C126 104 134 102 142 108 L138 138 C130 144 110 144 102 138 Z"
              fill="url(#woman-satin-sheen)"
              opacity="0.35"
            />

            {/* Fitted Waistband with Gold Buckle / Sash Accent */}
            <path d="M106 165 L134 165 L135 174 L105 174 Z" fill={midDark} />
            <rect x="117" y="167" width="6" height="5" rx="1" fill="url(#gold-metal)" />

            {/* Flowing Floor-Length Silk Maxi Skirt */}
            <path
              d="M105 174 C90 260 62 360 52 418 C74 426 166 426 188 418 C178 360 150 260 135 174 Z"
              fill={`url(#woman-dress-main-${safeId})`}
              filter="url(#woman-depth)"
            />

            {/* Dynamic Cascading Silk Folds (Realistic Drapery Physics) */}
            {/* Center cascading pleat */}
            <path
              d="M116 175 Q110 290 98 420 Q106 421 120 422 Q128 290 124 175 Z"
              fill={`url(#woman-folds-${safeId})`}
              opacity="0.8"
            />
            {/* Left drape shadow */}
            <path
              d="M105 174 Q88 280 72 418 Q84 420 98 420 Q110 290 116 175 Z"
              fill={darkShade}
              opacity="0.4"
            />
            {/* Right highlight fold */}
            <path
              d="M124 175 Q128 290 144 420 Q158 420 168 418 Q145 280 135 174 Z"
              fill={highlightShade}
              opacity="0.35"
            />

            {/* Slit Shadow & Graceful Hem Movement */}
            <path d="M52 418 Q120 430 188 418" fill="none" stroke="#000000" strokeWidth="1.5" opacity="0.3" />

            {/* Evening Minaudière Hard-Case Clutch in Hand */}
            <g id="evening-clutch">
              <rect x="156" y="184" width="22" height="14" rx="3.5" fill="url(#gold-metal)" stroke="#997314" strokeWidth="0.8" />
              {/* Jewel clasp */}
              <circle cx="167" cy="183" r="2" fill="#FFFFFF" stroke="url(#gold-metal)" strokeWidth="0.8" />
              {/* Metallic reflection line */}
              <line x1="158" y1="189" x2="176" y2="189" stroke="#FFFFFF" strokeWidth="1" opacity="0.6" />
            </g>
          </g>
        )}

        {/* ========================================================= */}
        {/* 4. OUTFIT: COCKTAIL / MIDI DRESS (Vestido Cóctel / Midi) */}
        {/* ========================================================= */}
        {outfitType === 'cocktail' && (
          <g id="outfit-cocktail">
            {/* Boatneck / Sleeveless Bodice */}
            <path
              d="M100 102 L140 102 L135 168 L105 168 Z"
              fill={`url(#woman-dress-main-${safeId})`}
              filter="url(#woman-depth)"
            />
            {/* Bodice Highlights */}
            <path d="M108 104 L114 166" stroke="#FFFFFF" strokeWidth="1" opacity="0.2" />
            <path d="M132 104 L126 166" stroke="#000000" strokeWidth="1" opacity="0.2" />

            {/* Gold Belt */}
            <rect x="105" y="165" width="30" height="5" rx="1" fill="url(#gold-metal)" />

            {/* Chic A-Line Midi Skirt (Termina debajo de la rodilla) */}
            <path
              d="M105 170 C92 220 76 295 70 338 C90 346 150 346 170 338 C164 295 148 220 135 170 Z"
              fill={`url(#woman-dress-main-${safeId})`}
              filter="url(#woman-depth)"
            />

            {/* Skirt pleat shadows */}
            <path d="M112 172 Q102 260 92 342" stroke={darkShade} strokeWidth="2.5" fill="none" opacity="0.5" />
            <path d="M128 172 Q138 260 148 342" stroke={darkShade} strokeWidth="2.5" fill="none" opacity="0.5" />
            <path d="M120 172 Q120 260 120 344" stroke={highlightShade} strokeWidth="2" fill="none" opacity="0.4" />

            {/* Slender Calves & Legs */}
            <path d="M102 338 L104 405 L116 405 L118 338 Z" fill="url(#woman-skin-tone)" />
            <path d="M122 338 L124 405 L136 405 L138 338 Z" fill="url(#woman-skin-tone)" />

            {/* Evening Clutch */}
            <g id="cocktail-clutch">
              <rect x="156" y="184" width="22" height="14" rx="3.5" fill="url(#gold-metal)" stroke="#997314" strokeWidth="0.8" />
              <circle cx="167" cy="183" r="2" fill="#FFFFFF" stroke="url(#gold-metal)" strokeWidth="0.8" />
            </g>
          </g>
        )}

        {/* ========================================================= */}
        {/* 5. OUTFIT: JUMPSUIT / ENTERIZO ELEGANTE (Palazzo) */}
        {/* ========================================================= */}
        {outfitType === 'jumpsuit' && (
          <g id="outfit-jumpsuit">
            {/* Wrap V-Neck Bodice with Cowl Drapery */}
            <path
              d="M96 104 L120 136 L144 104 L136 170 L104 170 Z"
              fill={`url(#woman-dress-main-${safeId})`}
              filter="url(#woman-depth)"
            />
            {/* Decollete V-Skin */}
            <polygon points="106,98 120,130 134,98" fill="url(#woman-skin-tone)" />

            {/* Metallic Waist Sash with Tie */}
            <rect x="104" y="166" width="32" height="7" rx="1.5" fill="url(#gold-metal)" />
            <path d="M110 173 L108 205 L114 207 L116 173 Z" fill="url(#gold-metal)" opacity="0.9" />

            {/* Flowing Palazzo Wide Legs (Pantalón Palazzo de Gala) */}
            <path
              d="M104 173 L74 415 L108 415 L120 248 L132 415 L166 415 L136 173 Z"
              fill={`url(#woman-dress-main-${safeId})`}
              filter="url(#woman-depth)"
            />

            {/* Center Creases and Pleats */}
            <line x1="92" y1="195" x2="92" y2="412" stroke="#000000" strokeWidth="1.2" opacity="0.22" />
            <line x1="148" y1="195" x2="148" y2="412" stroke="#000000" strokeWidth="1.2" opacity="0.22" />
            <line x1="88" y1="200" x2="88" y2="412" stroke="#FFFFFF" strokeWidth="1" opacity="0.18" />

            {/* Clutch */}
            <rect x="156" y="184" width="22" height="14" rx="3.5" fill="url(#gold-metal)" stroke="#997314" strokeWidth="0.8" />
          </g>
        )}

        {/* ========================================================= */}
        {/* 6. OUTFIT: BOHO CHIC & FLUIDO (Vestido Romántico) */}
        {/* ========================================================= */}
        {outfitType === 'boho' && (
          <g id="outfit-boho">
            {/* Off-the-Shoulder Bardot Ruffle Flounce */}
            <path
              d="M84 104 Q120 115 156 104 Q150 134 120 134 Q90 134 84 104 Z"
              fill={`url(#woman-dress-main-${safeId})`}
              filter="url(#woman-depth)"
            />
            {/* Ruffle gathers */}
            <path d="M96 106 Q100 130 104 106" stroke={darkShade} strokeWidth="1.2" fill="none" opacity="0.4" />
            <path d="M116 108 Q120 132 124 108" stroke={darkShade} strokeWidth="1.2" fill="none" opacity="0.4" />
            <path d="M136 106 Q140 130 144 106" stroke={darkShade} strokeWidth="1.2" fill="none" opacity="0.4" />

            {/* Midriff */}
            <path d="M104 128 L136 128 L134 172 L106 172 Z" fill={`url(#woman-dress-main-${safeId})`} />

            {/* Multi-Tiered Bohemian Ruffled Skirt (Faldas Escalonadas) */}
            {/* Tier 1 */}
            <path
              d="M106 172 C94 220 84 265 78 280 C98 288 142 288 162 280 C156 265 146 220 134 172 Z"
              fill={`url(#woman-dress-main-${safeId})`}
            />
            {/* Tier 2 */}
            <path
              d="M78 280 C70 335 60 405 54 418 C76 426 164 426 186 418 C180 405 170 335 162 280 Z"
              fill={midDark}
              filter="url(#woman-depth)"
            />

            {/* Tier hem lace trim */}
            <path d="M78 280 Q120 292 162 280" stroke="#FFFFFF" strokeWidth="1.5" strokeDasharray="3 2" fill="none" opacity="0.6" />
            <path d="M54 418 Q120 430 186 418" stroke="#FFFFFF" strokeWidth="1.5" strokeDasharray="3 2" fill="none" opacity="0.6" />

            {/* Floral Hair Vine */}
            <circle cx="112" cy="20" r="2.5" fill="#F472B6" />
            <circle cx="120" cy="18" r="3" fill="#FBBF24" />
            <circle cx="128" cy="20" r="2.5" fill="#34D399" />
          </g>
        )}

        {/* ========================================================= */}
        {/* 7. STILETTO HIGH HEELS (Zapatillas de Tacón Fino de Gala) */}
        {/* ========================================================= */}
        <g id="woman-heels-luxury">
          {/* Left Sandal / Stiletto */}
          <path
            d="M102 405 C100 412 96 420 92 422 C90 423 104 424 116 424 C118 424 118 416 116 405 Z"
            fill="url(#gold-metal)"
          />
          {/* Stiletto Heel Pin */}
          <line x1="92" y1="416" x2="92" y2="426" stroke="url(#gold-metal)" strokeWidth="1.8" />
          {/* Ankle Cross Strap */}
          <path d="M100 408 Q109 412 118 408" fill="none" stroke="url(#gold-metal)" strokeWidth="1.5" />

          {/* Right Sandal / Stiletto */}
          <path
            d="M138 405 C140 412 144 420 148 422 C150 423 136 424 124 424 C122 424 122 416 124 405 Z"
            fill="url(#gold-metal)"
          />
          <line x1="148" y1="416" x2="148" y2="426" stroke="url(#gold-metal)" strokeWidth="1.8" />
          <path d="M122 408 Q131 412 140 408" fill="none" stroke="url(#gold-metal)" strokeWidth="1.5" />
        </g>
      </svg>

      {/* Haute Couture Atelier Badge */}
      <div className="absolute -bottom-3 inset-x-0 flex justify-center">
        <span className="text-[10px] uppercase font-bold tracking-widest px-3 py-1 rounded-full bg-[#3B1E2B] text-white backdrop-blur-md border border-rose-900 shadow-md flex items-center gap-1">
          <Sparkles className="w-2.5 h-2.5 text-rose-300" />
          Dama
        </span>
      </div>
    </div>
  );
};

// Helper to adjust hex brightness
export function adjustColorBrightness(hex: string, percent: number) {
  try {
    if (!hex || typeof hex !== 'string') return '#333333';
    let cleanHex = hex.replace('#', '');
    if (cleanHex.length === 3) {
      cleanHex = cleanHex.split('').map((c) => c + c).join('');
    }
    let num = parseInt(cleanHex, 16);
    let amt = Math.round(2.55 * percent);
    let R = (num >> 16) + amt;
    let G = ((num >> 8) & 0x00ff) + amt;
    let B = (num & 0x0000ff) + amt;
    return (
      '#' +
      (
        0x1000000 +
        (R < 255 ? (R < 1 ? 0 : R) : 255) * 0x10000 +
        (G < 255 ? (G < 1 ? 0 : G) : 255) * 0x100 +
        (B < 255 ? (B < 1 ? 0 : B) : 255)
      )
        .toString(16)
        .slice(1)
    );
  } catch {
    return hex;
  }
}

// -------------------------------------------------------------
// Main DressCodeSection Component
// -------------------------------------------------------------
export const DressCodeSection: React.FC<DressCodeSectionProps> = ({
  settings,
  className = '',
}) => {
  const showDressCode = settings.showDressCode !== false;
  if (!showDressCode) {
    return null;
  }

  // Parse color palette
  let paletteList: string[] = [];
  try {
    paletteList = JSON.parse(settings.dressCodePalette || '[]');
  } catch {
    paletteList = ['#1C2D37', '#9E7D47', '#D4AF37', '#D8C7B8', '#4A5B52'];
  }

  if (!Array.isArray(paletteList) || paletteList.length === 0) {
    paletteList = ['#1C2D37', '#9E7D47', '#D4AF37', '#D8C7B8', '#4A5B52'];
  }

  // Active preview states
  const [selectedPaletteIndex, setSelectedPaletteIndex] = useState<number>(0);
  const [activeWomanOutfit, setActiveWomanOutfit] = useState<'long-gown' | 'cocktail' | 'jumpsuit' | 'boho'>(
    settings.dressCodeWomanOutfit || 'long-gown'
  );
  const [activeManOutfit, setActiveManOutfit] = useState<'tuxedo' | 'suit' | 'guayabera' | 'blazer'>(
    settings.dressCodeManOutfit || 'suit'
  );
  const [activeGenderView, setActiveGenderView] = useState<'both' | 'women' | 'men'>('both');

  const activePaletteColor = paletteList[selectedPaletteIndex] || paletteList[0];
  const activeTheme = CARD_THEMES[settings.cardStyle] || CARD_THEMES['classic-gold'];
  const isDark = settings.cardStyle === 'dark-luxury';

  // Identify general style to adjust default recommendation texts
  const dressCodeTitle = settings.dressCode || 'Formal Riguroso';
  const dressCodeDesc = settings.dressCodeDescription || 'Agradecemos su puntualidad y apego al código de vestimenta.';

  // Women guidelines
  const womenTitle = settings.dressCodeWomenTitle || 'Para Ellas (Damas)';
  const womenDesc =
    settings.dressCodeWomenDescription ||
    (dressCodeTitle.toLowerCase().includes('playa') || dressCodeTitle.toLowerCase().includes('guayabera')
      ? 'Vestido largo o midi en telas vaporosas, lino o seda con estampados sutiles o colores lisos. Calzado: tacón corrido o cuña para jardín/playa.'
      : dressCodeTitle.toLowerCase().includes('cóctel') || dressCodeTitle.toLowerCase().includes('cocktail')
      ? 'Vestido a la rodilla, midi elegante o enterizo sofisticado (jumpsuit de fiesta) con accesorios distinguidos y zapatillas.'
      : 'Vestido largo de noche o gala en telas finas (satén, crepé, seda). Evitar tonos blancos, marfil o perla reservados para la novia.');

  // Men guidelines
  const menTitle = settings.dressCodeMenTitle || 'Para Ellos (Caballeros)';
  const menDesc =
    settings.dressCodeMenDescription ||
    (dressCodeTitle.toLowerCase().includes('playa') || dressCodeTitle.toLowerCase().includes('guayabera')
      ? 'Guayabera formal de lino (manga larga preferente) en tonos claros, pantalón de lino o vestir y zapatos o mocasines sin calcetines visibles.'
      : dressCodeTitle.toLowerCase().includes('etiqueta') || dressCodeTitle.toLowerCase().includes('black tie')
      ? 'Esmoquin clásico (tuxedo) negro o azul noche con solapas de seda, camisa de cuello pajarita, fajín o chaleco y moño negro.'
      : 'Traje formal completo en tonos oscuros (marino, carbón, gris oxford), camisa de vestir, corbata o moño y calzado formal de piel.');

  const prohibitedColors =
    settings.dressCodeProhibitedColors ||
    'El color blanco, marfil, perla y champaña claro están reservados exclusivamente para la novia.';

  return (
    <section
      className={`w-full px-4 sm:px-8 md:px-12 lg:px-16 py-10 sm:py-14 bg-transparent relative z-10 ${className}`}
      id="codigo-vestimenta"
    >
      <div className="max-w-5xl mx-auto text-center">
        
        {/* Section Header */}
        <div className="mb-10 sm:mb-12">
          <div className={`w-14 h-14 rounded-2xl flex items-center justify-center mx-auto mb-3 border shadow-xs ${
            isDark
              ? 'bg-[#C5A059]/15 text-[#C5A059] border-[#5A5A40]/60'
              : 'bg-[#5A5A40]/10 text-[#5A5A40] border-[#E5E2D0]'
          }`}>
            <Shirt className="w-7 h-7 shrink-0" />
          </div>

          <span className={`text-xs uppercase tracking-[0.3em] font-semibold block mb-2 ${
            isDark ? 'text-[#C5A059]' : 'text-[#7D8C7A]'
          }`}>
            Guía de Estilo & Etiqueta
          </span>

          <h2 className={`text-3xl sm:text-5xl font-serif font-normal ${
            isDark ? 'text-[#FDFCF0]' : 'text-[#3D3D2C]'
          }`}>
            Código de Vestimenta
          </h2>

          <StyleSpecificDivider
            cardStyle={settings.cardStyle}
            className="w-48 sm:w-60 h-8 mx-auto mt-2"
            color={activeTheme?.accentColorHex}
          />

          <p className={`text-xl sm:text-2xl font-serif italic font-medium mt-3 ${
            isDark ? 'text-[#C5A059]' : 'text-[#5A5A40]'
          }`}>
            {dressCodeTitle}
          </p>

          {dressCodeDesc && (
            <p className={`text-sm max-w-xl mx-auto mt-2 leading-relaxed font-serif ${
              isDark ? 'text-stone-300' : 'text-stone-600'
            }`}>
              "{dressCodeDesc}"
            </p>
          )}
        </div>

        {/* ============================================================== */}
        {/* INTERACTIVE FASHION MOCKUP CARD (CABALLERO & DAMA VISUALIZER) */}
        {/* ============================================================== */}
        <div className={`backdrop-blur-md rounded-3xl sm:rounded-[36px] p-6 sm:p-10 border shadow-xl max-w-4xl mx-auto my-8 text-left relative overflow-hidden ${
          isDark
            ? 'bg-[#282B25]/95 border-[#5A5A40]/60 text-[#FDFCF0]'
            : 'bg-white/95 border-[#E5E2D0] text-[#3D3D2C]'
        }`}>
          
          {/* Top Bar: Visualizer Mode & View Filter */}
          <div className={`flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b pb-5 mb-8 ${
            isDark ? 'border-[#5A5A40]/50' : 'border-[#E5E2D0]'
          }`}>
            <div>
              <span className={`text-xs uppercase tracking-wider font-bold flex items-center gap-2 ${
                isDark ? 'text-[#C5A059]' : 'text-[#5A5A40]'
              }`}>
                <Sparkles className={`w-4 h-4 ${isDark ? 'text-[#C5A059]' : 'text-[#7D8C7A]'}`} />
                Simulador Visual de Atuendos
              </span>
              <p className={`text-xs mt-0.5 ${isDark ? 'text-stone-400' : 'text-stone-500'}`}>
                Toca cualquier color de la paleta para ver cómo lucen las prendas en vivo.
              </p>
            </div>

            {/* View Selector Tabs */}
            <div className={`flex items-center p-1 rounded-full border self-start sm:self-auto ${
              isDark ? 'bg-[#1F211D] border-[#5A5A40]' : 'bg-[#FAF9F0] border-[#E5E2D0]'
            }`}>
              <button
                type="button"
                onClick={() => setActiveGenderView('both')}
                className={`px-3 py-1.5 rounded-full text-xs font-semibold transition-all cursor-pointer ${
                  activeGenderView === 'both'
                    ? isDark
                      ? 'bg-[#C5A059] text-stone-950 font-bold shadow-xs'
                      : 'bg-[#5A5A40] text-white shadow-xs'
                    : isDark
                      ? 'text-stone-400 hover:text-stone-200'
                      : 'text-[#7D8C7A] hover:text-[#1a1a1a]'
                }`}
              >
                Pareja
              </button>
              <button
                type="button"
                onClick={() => setActiveGenderView('women')}
                className={`px-3 py-1.5 rounded-full text-xs font-semibold transition-all cursor-pointer ${
                  activeGenderView === 'women'
                    ? isDark
                      ? 'bg-[#C5A059] text-stone-950 font-bold shadow-xs'
                      : 'bg-[#5A5A40] text-white shadow-xs'
                    : isDark
                      ? 'text-stone-400 hover:text-stone-200'
                      : 'text-[#7D8C7A] hover:text-[#1a1a1a]'
                }`}
              >
                Damas
              </button>
              <button
                type="button"
                onClick={() => setActiveGenderView('men')}
                className={`px-3 py-1.5 rounded-full text-xs font-semibold transition-all cursor-pointer ${
                  activeGenderView === 'men'
                    ? isDark
                      ? 'bg-[#C5A059] text-stone-950 font-bold shadow-xs'
                      : 'bg-[#5A5A40] text-white shadow-xs'
                    : isDark
                      ? 'text-stone-400 hover:text-stone-200'
                      : 'text-[#7D8C7A] hover:text-[#1a1a1a]'
                }`}
              >
                Caballeros
              </button>
            </div>
          </div>

          {/* Center Display: The Mockups */}
          <div className="grid grid-cols-1 md:grid-cols-12 gap-8 items-center">
            
            {/* Visual Mannequins Container */}
            <div className={`${
              activeGenderView === 'both' ? 'md:col-span-7' : 'md:col-span-6'
            } rounded-3xl p-6 border flex flex-col items-center justify-center relative overflow-hidden shadow-inner ${
              isDark ? 'bg-[#1F211D] border-[#5A5A40]' : 'bg-[#FAF9F0] border-[#E5E2D0]'
            }`}>
              
              {/* Radial backdrop highlight */}
              <div
                className="absolute inset-0 opacity-20 pointer-events-none transition-all duration-700"
                style={{
                  background: `radial-gradient(circle at 50% 40%, ${activePaletteColor} 0%, transparent 70%)`,
                }}
              />

              <div className="flex items-center justify-center gap-4 sm:gap-8 w-full z-10 py-2">
                
                {/* Lady Fashion Mockup */}
                {(activeGenderView === 'both' || activeGenderView === 'women') && (
                  <motion.div
                    key={`woman-${activeWomanOutfit}-${activePaletteColor}`}
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.35 }}
                    className="flex-1 max-w-[200px]"
                  >
                    <WomanFashionMockup
                      dressColor={activePaletteColor}
                      accessoryColor="#D4AF37"
                      outfitType={activeWomanOutfit}
                    />

                    {/* Quick outfit style switch */}
                    <div className="mt-6 flex justify-center">
                      <select
                        value={activeWomanOutfit}
                        onChange={(e) => setActiveWomanOutfit(e.target.value as any)}
                        className={`text-[11px] rounded-lg px-2.5 py-1 font-medium shadow-2xs cursor-pointer focus:outline-none border ${
                          isDark
                            ? 'bg-[#282B25] border-[#5A5A40] text-[#FDFCF0] focus:border-[#C5A059]'
                            : 'bg-white border-[#E5E2D0] text-[#3D3D3D] focus:border-[#5A5A40]'
                        }`}
                      >
                        <option value="long-gown">Gala / Vestido Largo</option>
                        <option value="cocktail">Cóctel / Midi</option>
                        <option value="jumpsuit">Enterizo / Palazzo</option>
                        <option value="boho">Bohemio / Fluido</option>
                      </select>
                    </div>
                  </motion.div>
                )}

                {/* Gentleman Fashion Mockup */}
                {(activeGenderView === 'both' || activeGenderView === 'men') && (
                  <motion.div
                    key={`man-${activeManOutfit}-${activePaletteColor}`}
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.35 }}
                    className="flex-1 max-w-[200px]"
                  >
                    <ManFashionMockup
                      suitColor={activePaletteColor}
                      shirtColor="#FFFFFF"
                      tieColor={activePaletteColor}
                      outfitType={activeManOutfit}
                    />

                    {/* Quick outfit style switch */}
                    <div className="mt-6 flex justify-center">
                      <select
                        value={activeManOutfit}
                        onChange={(e) => setActiveManOutfit(e.target.value as any)}
                        className={`text-[11px] rounded-lg px-2.5 py-1 font-medium shadow-2xs cursor-pointer focus:outline-none border ${
                          isDark
                            ? 'bg-[#282B25] border-[#5A5A40] text-[#FDFCF0] focus:border-[#C5A059]'
                            : 'bg-white border-[#E5E2D0] text-[#3D3D3D] focus:border-[#5A5A40]'
                        }`}
                      >
                        <option value="suit">Traje Clásico</option>
                        <option value="tuxedo">Esmoquin / Smoking</option>
                        <option value="guayabera">Guayabera Formal</option>
                        <option value="blazer">Blazer & Pantalón</option>
                      </select>
                    </div>
                  </motion.div>
                )}
              </div>
            </div>

            {/* Interactive Palette Controls & Style Notes */}
            <div className={`${
              activeGenderView === 'both' ? 'md:col-span-5' : 'md:col-span-6'
            } space-y-6`}>
              
              {/* Palette Swatches */}
              <div>
                <span className={`text-xs uppercase font-bold tracking-wider block mb-2 flex items-center gap-1.5 ${
                  isDark ? 'text-[#C5A059]' : 'text-[#5A5A40]'
                }`}>
                  <Palette className={`w-3.5 h-3.5 ${isDark ? 'text-[#C5A059]' : 'text-[#7D8C7A]'}`} />
                  Paleta de Colores Sugerida:
                </span>
                
                <div className="flex flex-wrap gap-2.5">
                  {paletteList.map((hex, idx) => (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => setSelectedPaletteIndex(idx)}
                      className={`group relative w-10 h-10 rounded-xl transition-all cursor-pointer flex items-center justify-center shadow-xs ${
                        selectedPaletteIndex === idx
                          ? isDark
                            ? 'ring-2 ring-[#C5A059] ring-offset-2 ring-offset-[#282B25] scale-110'
                            : 'ring-2 ring-[#5A5A40] ring-offset-2 scale-110'
                          : 'hover:scale-105 opacity-90 hover:opacity-100'
                      }`}
                      style={{ backgroundColor: hex }}
                      title={`Aplicar color ${hex}`}
                    >
                      {selectedPaletteIndex === idx && (
                        <Check
                          className={`w-4 h-4 ${
                            isLightColor(hex) ? 'text-stone-900' : 'text-white'
                          }`}
                        />
                      )}
                    </button>
                  ))}
                </div>

                <div className={`flex items-center gap-2 mt-2 text-[11px] font-mono ${isDark ? 'text-stone-400' : 'text-stone-500'}`}>
                  <span>Color activo:</span>
                  <span className={`font-bold ${isDark ? 'text-[#C5A059]' : 'text-[#1a1a1a]'}`}>{activePaletteColor}</span>
                </div>
              </div>

              {/* Specific Recommendations for Women */}
              <div className={`p-4 rounded-2xl border space-y-1 ${
                isDark ? 'bg-[#1F211D] border-[#5A5A40]' : 'bg-[#FAF9F0] border-[#E5E2D0]'
              }`}>
                <div className="flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-full bg-rose-400 shrink-0" />
                  <h4 className={`text-xs font-bold ${isDark ? 'text-[#FDFCF0]' : 'text-[#1a1a1a]'}`}>{womenTitle}</h4>
                </div>
                <p className={`text-xs leading-relaxed pl-4 ${isDark ? 'text-stone-300' : 'text-stone-600'}`}>
                  {womenDesc}
                </p>
              </div>

              {/* Specific Recommendations for Men */}
              <div className={`p-4 rounded-2xl border space-y-1 ${
                isDark ? 'bg-[#1F211D] border-[#5A5A40]' : 'bg-[#FAF9F0] border-[#E5E2D0]'
              }`}>
                <div className="flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-full bg-sky-500 shrink-0" />
                  <h4 className={`text-xs font-bold ${isDark ? 'text-[#FDFCF0]' : 'text-[#1a1a1a]'}`}>{menTitle}</h4>
                </div>
                <p className={`text-xs leading-relaxed pl-4 ${isDark ? 'text-stone-300' : 'text-stone-600'}`}>
                  {menDesc}
                </p>
              </div>

              {/* Footwear Note */}
              {settings.dressCodeFootwearNote && (
                <div className={`flex items-start gap-2 p-3 rounded-xl border text-xs ${
                  isDark ? 'bg-[#1F211D] border-[#5A5A40] text-stone-300' : 'bg-white border-[#E5E2D0] text-stone-600'
                }`}>
                  <Footprints className={`w-4 h-4 shrink-0 mt-0.5 ${isDark ? 'text-[#C5A059]' : 'text-[#7D8C7A]'}`} />
                  <span>
                    <strong className={`font-semibold ${isDark ? 'text-[#FDFCF0]' : 'text-[#1a1a1a]'}`}>Calzado: </strong>
                    {settings.dressCodeFootwearNote}
                  </span>
                </div>
              )}
            </div>
          </div>

          {/* Prohibited Colors Banner (Novia) */}
          <div className={`mt-8 pt-5 border-t flex items-start sm:items-center gap-3 text-xs p-4 rounded-2xl border ${
            isDark
              ? 'border-[#5A5A40]/50 bg-[#1F211D] text-amber-200/90 border-amber-900/40'
              : 'border-[#E5E2D0] bg-amber-50/70 text-amber-900 border-amber-200/60'
          }`}>
            <AlertCircle className={`w-4 h-4 shrink-0 mt-0.5 sm:mt-0 ${isDark ? 'text-[#C5A059]' : 'text-amber-700'}`} />
            <p className="leading-relaxed">
              <strong className="font-bold">Colores Reservados: </strong>
              {prohibitedColors}
            </p>
          </div>
        </div>

      </div>
    </section>
  );
};

// Helper to determine if color is light or dark
function isLightColor(hex: string): boolean {
  try {
    let cleanHex = hex.replace('#', '');
    if (cleanHex.length === 3) {
      cleanHex = cleanHex.split('').map((c) => c + c).join('');
    }
    const r = parseInt(cleanHex.substring(0, 2), 16);
    const g = parseInt(cleanHex.substring(2, 4), 16);
    const b = parseInt(cleanHex.substring(4, 6), 16);
    const yiq = (r * 299 + g * 587 + b * 114) / 1000;
    return yiq >= 128;
  } catch {
    return false;
  }
}
