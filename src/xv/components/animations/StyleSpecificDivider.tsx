import React from 'react';
import { AnimatedFloralDivider } from './classicGold.tsx';
import { AnimatedRoseArchDivider } from './romanticFloral.tsx';
import { AnimatedPampasGrassDivider } from './bohoChic.tsx';
import { AnimatedEditorialLineDivider } from './minimalEditorial.tsx';
import { AnimatedConstellationDivider } from './darkLuxury.tsx';
import { AnimatedWatercolorBranchDivider } from './watercolorGarden.tsx';
import { AnimatedRoyalNavyDivider } from './royalNavy.tsx';
import { AnimatedTerracottaSunsetDivider } from './terracottaSunset.tsx';
import { AnimatedLavenderDivider } from './lavenderProvence.tsx';
import { AnimatedEmeraldBotanicalDivider } from './emeraldBotanical.tsx';
import { AnimatedCoastalBreezeDivider } from './coastalBreeze.tsx';
import { AnimatedChampagneGlamDivider } from './champagneGlam.tsx';

/**
 * Universal Dynamic Theme Divider Dispatcher
 * Automatically renders the tailored animated SVG divider for all 12 styles!
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
    case 'royal-navy':
      return <AnimatedRoyalNavyDivider className={className} color={color || '#C5A059'} />;
    case 'terracotta-sunset':
      return <AnimatedTerracottaSunsetDivider className={className} color={color || '#E07A5F'} />;
    case 'lavender-provence':
      return <AnimatedLavenderDivider className={className} color={color || '#7B6D8D'} />;
    case 'emerald-botanical':
      return <AnimatedEmeraldBotanicalDivider className={className} color={color || '#2D6A4F'} />;
    case 'coastal-breeze':
      return <AnimatedCoastalBreezeDivider className={className} color={color || '#2B6CB0'} />;
    case 'champagne-glam':
      return <AnimatedChampagneGlamDivider className={className} color={color || '#C39B60'} />;
    case 'classic-gold':
    default:
      return <AnimatedFloralDivider className={className} color={color || '#7D8C7A'} />;
  }
};
