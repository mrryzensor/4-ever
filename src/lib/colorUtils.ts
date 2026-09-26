/** Returns a readable foreground color for a solid hexadecimal background. */
export const getContrastTextColor = (hexColor: string): '#1a1a1a' | '#ffffff' => {
  const hex = hexColor.trim().replace(/^#/, '');
  if (!/^[\da-f]{6}$/i.test(hex)) return '#ffffff';

  const [red, green, blue] = [0, 2, 4].map((offset) => parseInt(hex.slice(offset, offset + 2), 16) / 255);
  const linearize = (channel: number) => channel <= 0.04045 ? channel / 12.92 : ((channel + 0.055) / 1.055) ** 2.4;
  const luminance = 0.2126 * linearize(red) + 0.7152 * linearize(green) + 0.0722 * linearize(blue);

  return luminance > 0.179 ? '#1a1a1a' : '#ffffff';
};
