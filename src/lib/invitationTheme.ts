import { CardStyleId, CardThemeConfig } from '../types.ts';
const DARK_PALETTE_STYLES = new Set(['dark-luxury', 'royal-navy', 'emerald-botanical']);

export interface InvitationThemeSettings {
  cardStyle?: string;
  colorPaletteStyle?: string;
  customAccentColor?: string;
  customBgColor?: string;
  fontPairStyle?: string;
}

export type ResolvedInvitationTheme = CardThemeConfig & {
  isDark: boolean;
  paletteStyle: string;
};

/** Resolve the same base, palette, custom color, and font choices for every invitation section. */
export const resolveInvitationTheme = (
  settings: InvitationThemeSettings,
  themes: Record<CardStyleId, CardThemeConfig>,
  fallbackStyle: CardStyleId,
): ResolvedInvitationTheme => {
  const baseStyle = settings.cardStyle && themes[settings.cardStyle as CardStyleId] ? settings.cardStyle : fallbackStyle;
  const baseTheme = themes[baseStyle as CardStyleId] || themes[fallbackStyle];
  const paletteStyle = settings.colorPaletteStyle && settings.colorPaletteStyle !== 'auto' && themes[settings.colorPaletteStyle as CardStyleId]
    ? settings.colorPaletteStyle
    : baseStyle;
  const paletteTheme = themes[paletteStyle as CardStyleId] || baseTheme;
  const fontTheme = settings.fontPairStyle && settings.fontPairStyle !== 'auto' && themes[settings.fontPairStyle as CardStyleId]
    ? themes[settings.fontPairStyle as CardStyleId]
    : baseTheme;
  const bgHex = settings.customBgColor || paletteTheme.bgHex;
  const accentColorHex = settings.customAccentColor || paletteTheme.accentColorHex;

  return {
    ...baseTheme,
    bgHex,
    secondaryBgHex: paletteTheme.secondaryBgHex,
    primaryColorHex: paletteTheme.primaryColorHex,
    accentColorHex,
    itineraryAccentColorHex: settings.customAccentColor || paletteTheme.itineraryAccentColorHex || paletteTheme.accentColorHex,
    bgClass: paletteTheme.bgClass,
    cardBgClass: paletteTheme.cardBgClass,
    textPrimaryClass: paletteTheme.textPrimaryClass,
    textSecondaryClass: paletteTheme.textSecondaryClass,
    accentClass: paletteTheme.accentClass,
    borderClass: paletteTheme.borderClass,
    fontDisplay: fontTheme.fontDisplay,
    fontBody: fontTheme.fontBody,
    isDark: DARK_PALETTE_STYLES.has(paletteStyle),
    paletteStyle,
  };
};
