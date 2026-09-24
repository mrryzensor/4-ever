import type { CSSProperties } from 'react';
import type { CardStyleId, WeddingSettings } from '../types.ts';

export type RsvpButtonStyle = NonNullable<WeddingSettings['rsvpButtonStyle']>;

export const RSVP_BUTTON_STYLE_OPTIONS: Array<{ value: RsvpButtonStyle; label: string }> = [
  { value: 'auto', label: 'Automático según la plantilla' },
  { value: 'soft', label: 'Suave con esquinas amplias' },
  { value: 'outline', label: 'Contorno editorial' },
  { value: 'editorial', label: 'Sólido editorial' },
  { value: 'art-deco', label: 'Art déco con doble borde' },
];

export interface RsvpButtonPresentation {
  className: string;
  style: CSSProperties;
}

function getReadableTextColor(hexColor: string): string {
  const normalized = hexColor.replace('#', '');
  if (!/^[\da-f]{6}$/i.test(normalized)) return '#ffffff';

  const channels = [0, 2, 4].map((offset) => {
    const channel = parseInt(normalized.slice(offset, offset + 2), 16) / 255;
    return channel <= 0.04045 ? channel / 12.92 : ((channel + 0.055) / 1.055) ** 2.4;
  });
  const luminance = 0.2126 * channels[0] + 0.7152 * channels[1] + 0.0722 * channels[2];
  return luminance > 0.48 ? '#211f18' : '#ffffff';
}

function resolveAutomaticStyle(cardStyle: CardStyleId): Exclude<RsvpButtonStyle, 'auto'> {
  if (cardStyle === 'champagne-glam') return 'art-deco';
  if (cardStyle === 'minimal-editorial' || cardStyle === 'coastal-breeze') return 'outline';
  if (cardStyle === 'boho-chic' || cardStyle === 'terracotta-sunset' || cardStyle === 'watercolor-garden') return 'soft';
  return 'editorial';
}

export function getRsvpButtonPresentation(
  requestedStyle: RsvpButtonStyle | string | undefined,
  cardStyle: CardStyleId,
  accentColor: string,
): RsvpButtonPresentation {
  const selectedStyle: Exclude<RsvpButtonStyle, 'auto'> =
    requestedStyle === 'auto' || !requestedStyle
      ? resolveAutomaticStyle(cardStyle)
      : requestedStyle === 'soft' || requestedStyle === 'outline' || requestedStyle === 'art-deco'
        ? requestedStyle
        : 'editorial';
  const baseClassName = 'inline-flex min-h-14 items-center justify-center gap-2 px-10 py-4 text-base font-bold shadow-lg transition-all hover:-translate-y-0.5 hover:brightness-105 hover:shadow-xl cursor-pointer sm:px-14 sm:py-5 sm:text-lg focus-visible:outline-2 focus-visible:outline-offset-4';

  if (selectedStyle === 'outline') {
    return {
      className: `${baseClassName} rounded-lg border-2 bg-transparent`,
      style: { color: accentColor, borderColor: accentColor, outlineColor: accentColor },
    };
  }

  if (selectedStyle === 'soft') {
    return {
      className: `${baseClassName} rounded-2xl border-2`,
      style: {
        color: getReadableTextColor(accentColor),
        backgroundColor: `color-mix(in srgb, ${accentColor} 88%, white)`,
        borderColor: accentColor,
        outlineColor: accentColor,
      },
    };
  }

  if (selectedStyle === 'art-deco') {
    return {
      className: `${baseClassName} rounded-lg border-[3px] border-double uppercase tracking-[0.12em]`,
      style: { color: getReadableTextColor(accentColor), backgroundColor: accentColor, borderColor: accentColor, outlineColor: accentColor },
    };
  }

  return {
    className: `${baseClassName} rounded-xl border uppercase tracking-[0.08em]`,
    style: { color: getReadableTextColor(accentColor), backgroundColor: accentColor, borderColor: accentColor, outlineColor: accentColor },
  };
}

export function getThemeDisplayFontFamily(fontDisplayClass: string): string {
  const match = fontDisplayClass.match(/font-\["([^\"]+)"\]/);
  if (!match) return 'Georgia, serif';
  const family = match[1].replaceAll('_', ' ');
  return `"${family}", serif`;
}
