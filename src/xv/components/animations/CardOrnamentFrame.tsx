import React from 'react';
import { CardStyleId } from '../../../types.ts';

interface CardOrnamentProps {
  cardStyle?: CardStyleId | string;
  fallbackStyle?: CardStyleId | string;
  accentColor?: string;
  className?: string;
}

export const CardOrnamentFrame: React.FC<CardOrnamentProps> = ({
  cardStyle,
  fallbackStyle = 'classic-gold',
  accentColor = '#C5A059',
}) => {
  const effectiveStyle = (cardStyle && cardStyle !== 'auto') 
    ? cardStyle 
    : (fallbackStyle && fallbackStyle !== 'auto' ? fallbackStyle : 'classic-gold');

  switch (effectiveStyle) {
    case 'classic-gold':
      return (
        <div className="absolute inset-0 pointer-events-none z-0 overflow-hidden">
          <svg className="absolute top-2 left-2 w-7 h-7 text-[#C5A059]/70" viewBox="0 0 32 32" fill="none" stroke="currentColor" strokeWidth="1.2">
            <path d="M2 18 V6 C2 3.8 3.8 2 6 2 H18" />
            <path d="M6 14 V8 C6 6.9 6.9 6 8 6 H14" strokeWidth="0.8" opacity="0.7" />
            <circle cx="8" cy="8" r="1.5" fill="#C5A059" />
          </svg>
          <svg className="absolute top-2 right-2 w-7 h-7 text-[#C5A059]/70" viewBox="0 0 32 32" fill="none" stroke="currentColor" strokeWidth="1.2">
            <path d="M30 18 V6 C30 3.8 28.2 2 26 2 H14" />
            <path d="M26 14 V8 C26 6.9 25.1 6 24 6 H18" strokeWidth="0.8" opacity="0.7" />
            <circle cx="24" cy="8" r="1.5" fill="#C5A059" />
          </svg>
          <svg className="absolute bottom-2 left-2 w-7 h-7 text-[#C5A059]/70" viewBox="0 0 32 32" fill="none" stroke="currentColor" strokeWidth="1.2">
            <path d="M2 14 V26 C2 28.2 3.8 30 6 30 H18" />
            <path d="M6 18 V24 C6 25.1 6.9 26 8 26 H14" strokeWidth="0.8" opacity="0.7" />
            <circle cx="8" cy="24" r="1.5" fill="#C5A059" />
          </svg>
          <svg className="absolute bottom-2 right-2 w-7 h-7 text-[#C5A059]/70" viewBox="0 0 32 32" fill="none" stroke="currentColor" strokeWidth="1.2">
            <path d="M30 14 V26 C30 28.2 28.2 30 26 30 H14" />
            <path d="M26 18 V24 C26 25.1 25.1 26 24 26 H18" strokeWidth="0.8" opacity="0.7" />
            <circle cx="24" cy="24" r="1.5" fill="#C5A059" />
          </svg>
        </div>
      );

    case 'romantic-floral':
      return (
        <div className="absolute inset-0 pointer-events-none z-0 overflow-hidden">
          <svg className="absolute top-2 left-2 w-8 h-8 text-[#8A6D65]/60" viewBox="0 0 36 36" fill="none" stroke="currentColor" strokeWidth="1.2">
            <path d="M3 20 C4 10, 10 4, 20 3" />
            <circle cx="20" cy="5" r="3" fill="#F4C2C2" stroke="#8A6D65" strokeWidth="0.8" />
            <path d="M8 12 C10 10, 13 11, 14 13" fill="#D4A373" />
          </svg>
          <svg className="absolute top-2 right-2 w-8 h-8 text-[#8A6D65]/60" viewBox="0 0 36 36" fill="none" stroke="currentColor" strokeWidth="1.2">
            <path d="M33 20 C32 10, 26 4, 16 3" />
            <circle cx="16" cy="5" r="3" fill="#F4C2C2" stroke="#8A6D65" strokeWidth="0.8" />
            <path d="M28 12 C26 10, 23 11, 22 13" fill="#D4A373" />
          </svg>
          <svg className="absolute bottom-2 left-2 w-8 h-8 text-[#8A6D65]/60" viewBox="0 0 36 36" fill="none" stroke="currentColor" strokeWidth="1.2">
            <path d="M3 16 C4 26, 10 32, 20 33" />
            <circle cx="20" cy="31" r="3" fill="#F4C2C2" stroke="#8A6D65" strokeWidth="0.8" />
          </svg>
          <svg className="absolute bottom-2 right-2 w-8 h-8 text-[#8A6D65]/60" viewBox="0 0 36 36" fill="none" stroke="currentColor" strokeWidth="1.2">
            <path d="M33 16 C32 26, 26 32, 16 33" />
            <circle cx="16" cy="31" r="3" fill="#F4C2C2" stroke="#8A6D65" strokeWidth="0.8" />
          </svg>
        </div>
      );

    case 'boho-chic':
      return (
        <div className="absolute inset-0 pointer-events-none z-0 overflow-hidden">
          <svg className="absolute top-2 left-2 w-7 h-7 text-[#B26E59]/70" viewBox="0 0 28 28" fill="none" stroke="currentColor" strokeWidth="1.5">
            <path d="M2 14 L2 2 L14 2" />
            <path d="M6 10 L6 6 L10 6" strokeDasharray="1.5 1.5" />
            <polygon points="12,12 14,9 16,12 13,12" fill="#B26E59" />
          </svg>
          <svg className="absolute top-2 right-2 w-7 h-7 text-[#B26E59]/70" viewBox="0 0 28 28" fill="none" stroke="currentColor" strokeWidth="1.5">
            <path d="M26 14 L26 2 L14 2" />
            <path d="M22 10 L22 6 L18 6" strokeDasharray="1.5 1.5" />
          </svg>
          <svg className="absolute bottom-2 left-2 w-7 h-7 text-[#B26E59]/70" viewBox="0 0 28 28" fill="none" stroke="currentColor" strokeWidth="1.5">
            <path d="M2 14 L2 26 L14 26" />
            <path d="M6 18 L6 22 L10 22" strokeDasharray="1.5 1.5" />
          </svg>
          <svg className="absolute bottom-2 right-2 w-7 h-7 text-[#B26E59]/70" viewBox="0 0 28 28" fill="none" stroke="currentColor" strokeWidth="1.5">
            <path d="M26 14 L26 26 L14 26" />
            <path d="M22 18 L22 22 L18 22" strokeDasharray="1.5 1.5" />
          </svg>
        </div>
      );

    case 'minimal-editorial':
      return (
        <div className="absolute inset-0 pointer-events-none z-0 overflow-hidden">
          <div className="absolute top-2 left-2 w-3 h-3 border-t border-l border-[#1a1a1a]/40" />
          <div className="absolute top-2 right-2 w-3 h-3 border-t border-r border-[#1a1a1a]/40" />
          <div className="absolute bottom-2 left-2 w-3 h-3 border-b border-l border-[#1a1a1a]/40" />
          <div className="absolute bottom-2 right-2 w-3 h-3 border-b border-r border-[#1a1a1a]/40" />
          <span className="absolute top-1/2 left-1.5 -translate-y-1/2 text-[9px] text-[#1a1a1a]/30 font-mono select-none">+</span>
          <span className="absolute top-1/2 right-1.5 -translate-y-1/2 text-[9px] text-[#1a1a1a]/30 font-mono select-none">+</span>
        </div>
      );

    case 'dark-luxury':
      return (
        <div className="absolute inset-0 pointer-events-none z-0 overflow-hidden">
          <svg className="absolute top-2 left-2 w-6 h-6 text-[#D4AF37]/80" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1">
            <path d="M2 10 V2 H10" stroke="#D4AF37" />
            <polygon points="5,5 7,2 9,5 12,7 9,9 7,12 5,9 2,7" fill="#D4AF37" />
          </svg>
          <svg className="absolute top-2 right-2 w-6 h-6 text-[#D4AF37]/80" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1">
            <path d="M22 10 V2 H14" stroke="#D4AF37" />
            <polygon points="19,5 21,2 23,5 26,7 23,9 21,12 19,9 16,7" fill="#D4AF37" />
          </svg>
          <svg className="absolute bottom-2 left-2 w-6 h-6 text-[#D4AF37]/80" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1">
            <path d="M2 14 V22 H10" stroke="#D4AF37" />
            <circle cx="5" cy="19" r="1.5" fill="#D4AF37" />
          </svg>
          <svg className="absolute bottom-2 right-2 w-6 h-6 text-[#D4AF37]/80" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1">
            <path d="M22 14 V22 H14" stroke="#D4AF37" />
            <circle cx="19" cy="19" r="1.5" fill="#D4AF37" />
          </svg>
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-40 h-40 bg-[#D4AF37]/5 rounded-full blur-2xl pointer-events-none" />
        </div>
      );

    case 'watercolor-garden':
      return (
        <div className="absolute inset-0 pointer-events-none z-0 overflow-hidden">
          <svg className="absolute top-2 left-2 w-8 h-8 text-[#526B50]/60" viewBox="0 0 32 32" fill="none" stroke="currentColor" strokeWidth="1.2">
            <path d="M3 3 C12 6, 18 14, 20 22" />
            <ellipse cx="8" cy="5" rx="3" ry="1.5" transform="rotate(-30 8 5)" fill="#7D947B" />
            <ellipse cx="14" cy="9" rx="3" ry="1.5" transform="rotate(-15 14 9)" fill="#7D947B" />
          </svg>
          <svg className="absolute top-2 right-2 w-8 h-8 text-[#526B50]/60" viewBox="0 0 32 32" fill="none" stroke="currentColor" strokeWidth="1.2">
            <path d="M29 3 C20 6, 14 14, 12 22" />
            <ellipse cx="24" cy="5" rx="3" ry="1.5" transform="rotate(30 24 5)" fill="#7D947B" />
            <ellipse cx="18" cy="9" rx="3" ry="1.5" transform="rotate(15 18 9)" fill="#7D947B" />
          </svg>
        </div>
      );

    case 'royal-navy':
      return (
        <div className="absolute inset-0 pointer-events-none z-0 overflow-hidden">
          <svg className="absolute top-2 left-2 w-7 h-7 text-[#D4AF37]/60" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
            <path d="M2 2 H10 V4 H4 V10 H2 Z" />
            <circle cx="7" cy="7" r="1.5" fill="#D4AF37" />
          </svg>
          <svg className="absolute top-2 right-2 w-7 h-7 text-[#D4AF37]/60" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
            <path d="M22 2 H14 V4 H20 V10 H22 Z" />
            <circle cx="17" cy="7" r="1.5" fill="#D4AF37" />
          </svg>
          <svg className="absolute bottom-2 left-2 w-7 h-7 text-[#D4AF37]/60" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
            <path d="M2 22 H10 V20 H4 V14 H2 Z" />
            <circle cx="7" cy="17" r="1.5" fill="#D4AF37" />
          </svg>
          <svg className="absolute bottom-2 right-2 w-7 h-7 text-[#D4AF37]/60" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
            <path d="M22 22 H14 V20 H20 V14 H22 Z" />
            <circle cx="17" cy="17" r="1.5" fill="#D4AF37" />
          </svg>
          <div className="absolute -right-6 -bottom-6 w-32 h-32 opacity-5 pointer-events-none text-[#D4AF37]">
            <svg viewBox="0 0 100 100" fill="currentColor">
              <path d="M50 15 L60 38 L85 30 L75 58 L95 62 L50 90 L5 62 L25 58 L15 30 L40 38 Z" />
            </svg>
          </div>
        </div>
      );

    case 'terracotta-sunset':
      return (
        <div className="absolute inset-0 pointer-events-none z-0 overflow-hidden">
          <div className="absolute -left-3 top-1/2 -translate-y-1/2 w-6 h-6 rounded-full bg-[#FAF4EE] border-r-2 border-[#E07A5F]/70 shadow-inner" />
          <div className="absolute -right-3 top-1/2 -translate-y-1/2 w-6 h-6 rounded-full bg-[#FAF4EE] border-l-2 border-[#E07A5F]/70 shadow-inner" />
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
      return (
        <div className="absolute inset-0 pointer-events-none z-0 overflow-hidden">
          <div className="absolute top-0 left-0 right-0 h-8 bg-gradient-to-b from-[#7B6D8D]/10 to-transparent rounded-t-[4.5rem]" />
          <div className="absolute right-2 -bottom-2 opacity-15 text-[#7B6D8D]">
            <svg className="w-20 h-20" viewBox="0 0 60 60" fill="currentColor">
              <path d="M30 55 C 30 35, 45 20, 50 5 C 45 15, 30 25, 25 45 Z" opacity="0.6"/>
              <ellipse cx="48" cy="8" rx="3" ry="5" transform="rotate(25 48 8)" />
              <ellipse cx="42" cy="15" rx="3" ry="5" transform="rotate(35 42 15)" />
              <ellipse cx="46" cy="18" rx="3" ry="5" transform="rotate(-15 46 18)" />
            </svg>
          </div>
        </div>
      );

    case 'emerald-botanical':
      return (
        <div className="absolute inset-0 pointer-events-none z-0 overflow-hidden">
          <div className="absolute -top-10 -left-10 w-32 h-32 bg-[#52B788]/15 rounded-full blur-2xl" />
          <div className="absolute -bottom-10 -right-10 w-32 h-32 bg-[#52B788]/15 rounded-full blur-2xl" />
          <div className="absolute -right-4 -bottom-4 w-28 h-28 opacity-10 text-[#52B788]">
            <svg viewBox="0 0 100 100" fill="currentColor">
              <path d="M50 5 C75 5 95 25 95 50 C95 75 75 95 50 95 C25 95 5 75 5 50 C5 25 25 5 50 5 Z M48 20 C40 30 30 45 48 55 C52 40 58 30 48 20 Z" />
            </svg>
          </div>
        </div>
      );

    case 'coastal-breeze':
      return (
        <div className="absolute inset-0 pointer-events-none z-0 overflow-hidden">
          <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-[#2B6CB0] to-transparent opacity-80" />
          <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-[#2B6CB0] to-transparent opacity-80" />
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
      return (
        <div className="absolute inset-0 pointer-events-none z-0 overflow-hidden">
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
            <line x1="28" y1="28" x2="14" y2="16" strokeDasharray="2 2" />
          </svg>
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-48 h-48 bg-[#C39B60]/5 rounded-full blur-xl pointer-events-none" />
        </div>
      );

    default:
      return null;
  }
};
