const HEX_COLOR_PATTERN = /^#(?:[\da-f]{3}|[\da-f]{6})$/i;

export function isDressCodeHexColor(value: unknown): value is string {
  return typeof value === 'string' && HEX_COLOR_PATTERN.test(value.trim());
}

/** Reads the palette whether it came from JSON storage or an unsaved editor array. */
export function parseDressCodePalette(value: unknown): string[] {
  let colors: unknown = value;

  if (typeof value === 'string') {
    try {
      colors = JSON.parse(value);
    } catch {
      const serialized = value.trim();
      const postgresArray = serialized.startsWith('{') && serialized.endsWith('}');
      const entries = postgresArray ? serialized.slice(1, -1) : serialized;
      colors = entries
        .split(',')
        .map((color) => color.trim().replace(/^"(.*)"$/, '$1'));
    }
  }

  if (!Array.isArray(colors)) return [];

  return colors
    .filter(isDressCodeHexColor)
    .map((color) => color.trim());
}

export function serializeDressCodePalette(value: unknown): string {
  return JSON.stringify(parseDressCodePalette(value));
}

/** Native color inputs require six-digit RGB; keep the stored palette value unchanged. */
export function toColorInputHex(value: string): string {
  const color = value.trim();
  if (/^#[\da-f]{6}$/i.test(color)) return color;
  if (/^#[\da-f]{3}$/i.test(color)) {
    return `#${color[1]}${color[1]}${color[2]}${color[2]}${color[3]}${color[3]}`;
  }
  return '#1C2D37';
}
