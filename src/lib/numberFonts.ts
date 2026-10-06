import type { CardStyleId, WeddingSettings } from '../types.ts';
import { CARD_THEMES } from './themes.ts';
import { getThemeDisplayFontFamily } from './rsvpButtonStyle.ts';

export const NUMBER_FONT_OPTIONS = [
  { value: 'theme', label: 'Automática (según el tema)', family: null },
  { value: 'playfair-display', label: 'Playfair Display', family: '"Playfair Display", Georgia, serif' },
  { value: 'cormorant-garamond', label: 'Cormorant Garamond', family: '"Cormorant Garamond", Georgia, serif' },
  { value: 'cinzel', label: 'Cinzel', family: '"Cinzel", Georgia, serif' },
  { value: 'lora', label: 'Lora', family: '"Lora", Georgia, serif' },
  { value: 'marcellus', label: 'Marcellus', family: '"Marcellus", Georgia, serif' },
  { value: 'prata', label: 'Prata', family: '"Prata", Georgia, serif' },
  { value: 'italiana', label: 'Italiana', family: '"Italiana", Georgia, serif' },
  { value: 'montserrat', label: 'Montserrat', family: '"Montserrat", Arial, sans-serif' },
] as const;

export type NumberFont = (typeof NUMBER_FONT_OPTIONS)[number]['value'];

export function resolveNumberFontFamily(
  selectedFont: WeddingSettings['typographyNumberFont'],
  settings: Pick<WeddingSettings, 'cardStyle' | 'fontPairStyle'>,
  themeFontFallback?: string,
): string {
  const option = NUMBER_FONT_OPTIONS.find(({ value }) => value === selectedFont);
  if (option?.family) return option.family;
  if (themeFontFallback) return themeFontFallback;

  const themeId = settings.fontPairStyle && settings.fontPairStyle !== 'auto'
    ? settings.fontPairStyle
    : settings.cardStyle;
  const theme = CARD_THEMES[themeId as CardStyleId] || CARD_THEMES['classic-gold'];
  return getThemeDisplayFontFamily(theme.fontDisplay);
}
