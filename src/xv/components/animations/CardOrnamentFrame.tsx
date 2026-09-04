import React from 'react';
import { motion } from 'motion/react';
import { CardStyleId } from '../../../types.ts';

interface CardOrnamentProps {
  cardStyle?: CardStyleId | string;
  accentColor?: string;
  className?: string;
}

export const CardOrnamentFrame: React.FC<CardOrnamentProps> = ({
  cardStyle,
  accentColor = '#C5A059',
}) => {
  if (!cardStyle) return null;

  switch (cardStyle) {
    case 'royal-navy':
      // Baroque Crown Heraldic Corners & Royal Crest Header Accent
      return (
        <div className="absolute inset-0 pointer-events-none z-0 overflow-hidden">
          {/* Top-Left Royal Filigree */}
          <svg className="absolute top-2 left-2 w-7 h-7 text-[#D4AF37]/60" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
            <path d="M2 2 H10 V4 H4 V10 H2 Z" />
            <circle cx="7" cy="7" r="1.5" fill="#D4AF37" />
          </svg>
          {/* Top-Right Royal Filigree */}
          <svg className="absolute top-2 right-2 w-7 h-7 text-[#D4AF37]/60" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
            <path d="M22 2 H14 V4 H20 V10 H22 Z" />
            <circle cx="17" cy="7" r="1.5" fill="#D4AF37" />
          </svg>
          {/* Bottom-Left Royal Filigree */}
          <svg className="absolute bottom-2 left-2 w-7 h-7 text-[#D4AF37]/60" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
            <path d="M2 22 H10 V20 H4 V14 H2 Z" />
            <circle cx="7" cy="17" r="1.5" fill="#D4AF37" />
          </svg>
          {/* Bottom-Right Royal Filigree */}
          <svg className="absolute bottom-2 right-2 w-7 h-7 text-[#D4AF37]/60" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
            <path d="M22 22 H14 V20 H20 V14 H22 Z" />
            <circle cx="17" cy="17" r="1.5" fill="#D4AF37" />
          </svg>
          {/* Gold Crest watermark */}
          <div className="absolute -right-6 -bottom-6 w-32 h-32 opacity-5 pointer-events-none text-[#D4AF37]">
            <svg viewBox="0 0 100 100" fill="currentColor">
              <path d="M50 15 L60 38 L85 30 L75 58 L95 62 L50 90 L5 62 L25 58 L15 30 L40 38 Z" />
            </svg>
          </div>
        </div>
      );

    case 'terracotta-sunset':
      // Desert Ticket Stamp & Perforated Cutouts
      return (
        <div className="absolute inset-0 pointer-events-none z-0 overflow-hidden">
          {/* Ticket notch cutouts left and right */}
          <div className="absolute -left-3 top-1/2 -translate-y-1/2 w-6 h-6 rounded-full bg-[#FAF4EE] border-r-2 border-[#E07A5F]/70 shadow-inner" />
          <div className="absolute -right-3 top-1/2 -translate-y-1/2 w-6 h-6 rounded-full bg-[#FAF4EE] border-l-2 border-[#E07A5F]/70 shadow-inner" />
          
          {/* Desert Sun Ray Watermark in Corner */}
          <div className="absolute right-3 top-3 opacity-15 text-[#E07A5F]">
            <svg className="w-14 h-14 animate-spin-slow" viewBox="0 0 100 100" fill="none" stroke="currentColor" strokeWidth="2.5">
              <circle cx="50" cy="50" r="18" strokeDasharray="3 3" />
              {[0, 30, 60, 90, 120, 150, 180, 210, 240, 270, 300, 330].map((deg) => (
                <line
                  key={deg}
                  x1="50"
                  y1="22"
                  x2="50"
                  y2="12"
                  transform={`rotate(${deg} 50 50)`}
                  strokeLinecap="round"
                />
              ))}
            </svg>
          </div>
        </div>
      );

    case 'lavender-provence':
      // Provençal Arch Archway & Delicate Botanical Corner Stamps
      return (
        <div className="absolute inset-0 pointer-events-none z-0 overflow-hidden">
          {/* Top Arch Contour Overlay */}
          <div className="absolute top-0 left-0 right-0 h-8 bg-gradient-to-b from-[#7B6D8D]/10 to-transparent rounded-t-[4.5rem]" />
          {/* Lavender sprig watermark */}
          <div className="absolute right-2 -bottom-2 opacity-15 text-[#7B6D8D]">
            <svg className="w-20 h-20" viewBox="0 0 60 60" fill="currentColor">
              <path d="M30 55 C 30 35, 45 20, 50 5 C 45 15, 30 25, 25 45 Z" opacity="0.6"/>
              <ellipse cx="48" cy="8" rx="3" ry="5" transform="rotate(25 48 8)" />
              <ellipse cx="42" cy="15" rx="3" ry="5" transform="rotate(35 42 15)" />
              <ellipse cx="46" cy="18" rx="3" ry="5" transform="rotate(-15 46 18)" />
              <ellipse cx="38" cy="24" rx="3" ry="5" transform="rotate(40 38 24)" />
              <ellipse cx="42" cy="27" rx="3" ry="5" transform="rotate(-20 42 27)" />
            </svg>
          </div>
        </div>
      );

    case 'emerald-botanical':
      // Exotic Palm & Monstera Glow Geometry with Emerald Glint
      return (
        <div className="absolute inset-0 pointer-events-none z-0 overflow-hidden">
          {/* Subtle Emerald Neon Border Glow Accent */}
          <div className="absolute -top-10 -left-10 w-32 h-32 bg-[#52B788]/15 rounded-full blur-2xl" />
          <div className="absolute -bottom-10 -right-10 w-32 h-32 bg-[#52B788]/15 rounded-full blur-2xl" />
          
          {/* Monstera leaf outline in background */}
          <div className="absolute -right-4 -bottom-4 w-28 h-28 opacity-10 text-[#52B788]">
            <svg viewBox="0 0 100 100" fill="currentColor">
              <path d="M50 5 C75 5 95 25 95 50 C95 75 75 95 50 95 C25 95 5 75 5 50 C5 25 25 5 50 5 Z M48 20 C40 30 30 45 48 55 C52 40 58 30 48 20 Z" />
            </svg>
          </div>
        </div>
      );

    case 'coastal-breeze':
      // Nautical Curved Passport Header & Wave Ripple Corners
      return (
        <div className="absolute inset-0 pointer-events-none z-0 overflow-hidden">
          {/* Top Nautical Border Wave */}
          <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-[#2B6CB0] to-transparent opacity-80" />
          {/* Bottom Nautical Border Wave */}
          <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-[#2B6CB0] to-transparent opacity-80" />
          {/* Compass / Wave watermark */}
          <div className="absolute -right-3 -top-3 opacity-10 text-[#2B6CB0]">
            <svg className="w-20 h-20" viewBox="0 0 100 100" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="50" cy="50" r="40" strokeDasharray="4 2" />
              <circle cx="50" cy="50" r="28" />
              <polygon points="50,15 55,45 85,50 55,55 50,85 45,55 15,50 45,45" fill="currentColor" fillOpacity="0.3" />
            </svg>
          </div>
        </div>
      );

    case 'champagne-glam':
      // 1920s Art Déco Chevron Stepped Corners & Diamond Line Grid
      return (
        <div className="absolute inset-0 pointer-events-none z-0 overflow-hidden">
          {/* Art Déco Stepped Corner Ornaments */}
          <svg className="absolute top-2 left-2 w-8 h-8 text-[#C39B60]/70" viewBox="0 0 30 30" fill="none" stroke="currentColor" strokeWidth="1.5">
            <path d="M2 2 H14 V6 H6 V14 H2 Z" fill="#C39B60" fillOpacity="0.15" />
            <line x1="2" y1="2" x2="16" y2="16" strokeDasharray="2 2" />
          </svg>
          <svg className="absolute top-2 right-2 w-8 h-8 text-[#C39B60]/70" viewBox="0 0 30 30" fill="none" stroke="currentColor" strokeWidth="1.5">
            <path d="M28 2 H16 V6 H24 V14 H28 Z" fill="#C39B60" fillOpacity="0.15" />
            <line x1="28" y1="2" x2="14" y2="16" strokeDasharray="2 2" />
          </svg>
          <svg className="absolute bottom-2 left-2 w-8 h-8 text-[#C39B60]/70" viewBox="0 0 30 30" fill="none" stroke="currentColor" strokeWidth="1.5">
            <path d="M2 28 H14 V24 H6 V16 H2 Z" fill="#C39B60" fillOpacity="0.15" />
            <line x1="2" y1="28" x2="16" y2="14" strokeDasharray="2 2" />
          </svg>
          <svg className="absolute bottom-2 right-2 w-8 h-8 text-[#C39B60]/70" viewBox="0 0 30 30" fill="none" stroke="currentColor" strokeWidth="1.5">
            <path d="M28 28 H16 V24 H24 V16 H28 Z" fill="#C39B60" fillOpacity="0.15" />
            <line x1="28" y1="28" x2="14" y2="14" strokeDasharray="2 2" />
          </svg>
          {/* Gold Pearl Diamond Center Glow */}
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-48 h-48 bg-[#C39B60]/5 rounded-full blur-xl pointer-events-none" />
        </div>
      );

    default:
      return null;
  }
};
