const SOURCE_ENVELOPE_RGB = { r: 159, g: 112, b: 90 };

const readHexColor = (hex: string) => {
  const normalized = hex.replace('#', '');
  const value = normalized.length === 3
    ? normalized.split('').map((part) => `${part}${part}`).join('')
    : normalized;
  const parsed = Number.parseInt(value, 16);
  if (!Number.isFinite(parsed)) return { r: 90, g: 90, b: 64 };
  return { r: (parsed >> 16) & 255, g: (parsed >> 8) & 255, b: parsed & 255 };
};

export function getEnvelopeTintMatrix(color: string): string {
  const target = readHexColor(color);
  const red = target.r / SOURCE_ENVELOPE_RGB.r;
  const green = target.g / SOURCE_ENVELOPE_RGB.g;
  const blue = target.b / SOURCE_ENVELOPE_RGB.b;

  return [red, 0, 0, 0, 0, 0, green, 0, 0, 0, 0, 0, blue, 0, 0, 0, 0, 1, 0]
    .map((value) => Number(value.toFixed(4)))
    .join(' ');
}

export function normalizeLetterShadow(value: number | undefined, fallback: number): number {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? Math.max(0, Math.min(100, parsed)) : fallback;
}

export function getHexColorWithAlpha(color: string, alpha: number): string {
  const { r, g, b } = readHexColor(color);
  return `rgba(${r}, ${g}, ${b}, ${Math.max(0, Math.min(1, alpha))})`;
}

export function getLetterShadowStyle(color: string, intensity: number, scale = 1): string {
  if (intensity <= 0) return 'none';
  const strength = intensity / 100;
  const offset = Math.round((3 + strength * 11) * scale);
  const blur = Math.round((5 + strength * 18) * scale);
  return `drop-shadow(0 ${offset}px ${blur}px ${getHexColorWithAlpha(color, strength * 0.5)})`;
}

export function getLetterBoxShadowStyle(color: string, intensity: number): string {
  if (intensity <= 0) return 'none';
  const strength = intensity / 100;
  const offset = Math.round(2 + strength * 4);
  const blur = Math.round(4 + strength * 10);
  return `0 ${offset}px ${blur}px ${getHexColorWithAlpha(color, strength * 0.55)}`;
}
