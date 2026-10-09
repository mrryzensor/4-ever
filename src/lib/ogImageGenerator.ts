import { readFile } from 'node:fs/promises';
import { resolve } from 'node:path';
import sharp from 'sharp';
import { WeddingSettings, Guest, CardStyleId, CardThemeConfig } from '../types.ts';
import { formatHeroDate } from './dateFormatters.ts';
import { getDisplayedWaxSealText, getEventPresentation } from './eventUtils.ts';
import { CARD_THEMES } from './themes.ts';
import { XV_CARD_THEMES } from '../xv/themes.ts';
import { resolveInvitationTheme } from './invitationTheme.ts';
import { getEnvelopeTintMatrix, normalizeLetterShadow } from './letterAppearance.ts';

const escapeXml = (value: string): string => value
  .replace(/&/g, '&amp;')
  .replace(/</g, '&lt;')
  .replace(/>/g, '&gt;')
  .replace(/"/g, '&quot;')
  .replace(/'/g, '&apos;');

const safeColor = (value: string | undefined, fallback: string): string =>
  value && /^#[\da-f]{3}(?:[\da-f]{3})?$/i.test(value) ? value : fallback;

let closedLetterAsset: Promise<Buffer> | null = null;

const getSvgFont = (fontClass?: string, fallback = 'Georgia, serif') => {
  const family = fontClass?.match(/font-\["([^"]+)"\]/)?.[1]?.replaceAll('_', ' ');
  return family ? `'${escapeXml(family)}', ${fallback}` : fallback;
};

const wrapNames = (value: string, maxLength = 23): string[] => {
  const words = value.trim().split(/\s+/).filter(Boolean).flatMap((word) => {
    if (word.length <= maxLength) return [word];
    return Array.from({ length: Math.ceil(word.length / maxLength) }, (_, index) => word.slice(index * maxLength, (index + 1) * maxLength));
  });
  const lines: string[] = [];
  let line = '';
  for (const word of words) {
    const candidate = line ? `${line} ${word}` : word;
    if (line && candidate.length > maxLength) {
      lines.push(line);
      line = word;
    } else {
      line = candidate;
    }
  }
  if (line) lines.push(line);
  const visible = lines.slice(0, 3);
  if (lines.length > visible.length && visible.length) {
    visible[visible.length - 1] = `${visible[visible.length - 1].slice(0, maxLength - 1)}…`;
  }
  return visible.length ? visible : ['Nuestra celebración'];
};

const brighten = (hex: string, amount: number) => {
  const normalized = hex.slice(1);
  const full = normalized.length === 3 ? normalized.split('').map((part) => part + part).join('') : normalized;
  const parsed = Number.parseInt(full, 16);
  if (!Number.isFinite(parsed)) return '#5A5A40';
  const channel = (shift: number) => Math.min(255, Math.round(((parsed >> shift) & 255) + (255 - ((parsed >> shift) & 255)) * amount));
  return `rgb(${channel(16)},${channel(8)},${channel(0)})`;
};

const renderLetterImage = (
  settings: Partial<WeddingSettings>,
  guest: Partial<Guest> | null | undefined,
  closedEnvelopeDataUri: string,
) => {
  const presentation = getEventPresentation(settings.eventType, settings.slug);
  const eventType = presentation.type;
  const themes: Record<CardStyleId, CardThemeConfig> = eventType === 'xv' ? XV_CARD_THEMES : CARD_THEMES;
  const fallbackStyle = (eventType === 'xv' ? 'romantic-floral' : 'classic-gold') as CardStyleId;
  const baseStyle = settings.cardStyle && themes[settings.cardStyle as CardStyleId]
    ? settings.cardStyle
    : fallbackStyle;
  const theme = resolveInvitationTheme({ ...settings, cardStyle: baseStyle }, themes, fallbackStyle);
  const accent = safeColor(theme.accentColorHex, '#5A5A40');
  const background = safeColor(theme.bgHex, '#FDFCF0');
  const paper = safeColor(theme.secondaryBgHex, '#FFFFFF');
  const text = safeColor(theme.primaryColorHex, '#1A1A1A');
  const envelopeColor = safeColor(settings.envelopeColor, '#9F705A');
  const envelopeShadowColor = safeColor(settings.envelopeShadowColor, '#2C211B');
  const envelopeShadowIntensity = normalizeLetterShadow(settings.envelopeShadowIntensity, 36);
  const sealColor = safeColor(settings.waxSealColor, accent);
  const sealShadowColor = safeColor(settings.waxSealShadowColor, '#211A14');
  const sealShadowIntensity = normalizeLetterShadow(settings.waxSealShadowIntensity, 55);
  const selectedSealStyle = settings.sealStyle && settings.sealStyle !== 'auto'
    ? settings.sealStyle
    : baseStyle;
  const sealTheme = themes[selectedSealStyle as CardStyleId] || themes[baseStyle as CardStyleId];
  const name = settings.coupleNames?.trim() || presentation.defaultName;
  const lines = wrapNames(name);
  const fontDisplay = getSvgFont(theme.fontDisplay);
  const fontBody = getSvgFont(theme.fontBody, 'Arial, sans-serif');
  const eventDate = formatHeroDate(
    settings.eventDate || '2026-11-28',
    settings.heroDateFormat || 'dd.mm.aaaa',
    settings.heroCustomDateText,
  );
  const guestName = guest?.fullName?.trim();
  const reservedSeats = guest
    ? Math.max(1, Number(guest.allocatedPasses || guest.confirmedPasses || 1))
    : null;
  const sealText = getDisplayedWaxSealText(settings as Pick<WeddingSettings, 'coupleNames' | 'eventType' | 'waxSealText' | 'waxSealTextIsCustom'>);
  const eventHeading = eventType === 'xv' ? 'MIS XV AÑOS' : eventType === 'bodas' ? 'NUESTRA BODA' : 'NUESTRA CELEBRACIÓN';
  const longestNameLine = Math.max(...lines.map((line) => line.length), 1);
  const maxNameFontSize = lines.length > 2 ? 49 : lines.length > 1 ? 60 : 72;
  const nameFontSize = Math.max(38, Math.min(maxNameFontSize, Math.floor(575 / (longestNameLine * 0.58))));
  const namesMarkup = lines.map((line, index) =>
    `<tspan x="374"${index ? ` dy="${Math.round(nameFontSize * 1.08)}"` : ''}>${escapeXml(line)}</tspan>`
  ).join('');
  const nameStartY = 254 - ((lines.length - 1) * nameFontSize * 0.54);
  const floralSeal = ['floral', 'watercolor'].some((part) => sealTheme.ornamentStyle.toLowerCase().includes(part));
  const seatMarkup = reservedSeats
    ? `<text x="374" y="474" text-anchor="middle" font-family="${fontBody}" font-size="19" letter-spacing="3" fill="${accent}" opacity=".82">HEMOS RESERVADO</text>
       <rect x="349" y="492" width="50" height="50" rx="10" fill="none" stroke="${accent}" stroke-opacity=".6" stroke-width="1.5" />
       <text x="374" y="529" text-anchor="middle" font-family="${fontDisplay}" font-size="42" fill="${accent}">${reservedSeats}</text>
       <text x="374" y="563" text-anchor="middle" font-family="${fontBody}" font-size="16" letter-spacing="2" fill="${text}" opacity=".72">${reservedSeats === 1 ? 'LUGAR EN TU HONOR' : 'LUGARES EN TU HONOR'}</text>`
    : `<text x="374" y="503" text-anchor="middle" font-family="${fontBody}" font-size="22" font-style="italic" fill="${text}" opacity=".72">Nos encantará celebrar contigo</text>`;
  const personalMarkup = guestName
    ? `<text x="374" y="585" text-anchor="middle" font-family="${fontBody}" font-size="16" fill="${text}" opacity=".62">Para ${escapeXml(guestName)}</text>`
    : '';

  return `<svg xmlns="http://www.w3.org/2000/svg" width="1200" height="630" viewBox="0 0 1200 630">
    <defs>
      <linearGradient id="letter-paper" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="${paper}"/><stop offset="1" stop-color="${brighten(background, .11)}"/></linearGradient>
      <radialGradient id="letter-seal" cx="34%" cy="25%" r="78%"><stop offset="0" stop-color="${brighten(sealColor, .18)}"/><stop offset="1" stop-color="${brighten(sealColor, -.2)}"/></radialGradient>
      <filter id="letter-shadow" x="-20%" y="-20%" width="140%" height="150%"><feDropShadow dx="0" dy="14" stdDeviation="16" flood-color="#28231c" flood-opacity=".14"/></filter>
      <filter id="envelope-tint" x="-20%" y="-20%" width="140%" height="140%" color-interpolation-filters="sRGB"><feColorMatrix type="matrix" values="${getEnvelopeTintMatrix(envelopeColor)}"/></filter>
      <filter id="envelope-shadow" x="-25%" y="-25%" width="150%" height="160%"><feDropShadow dx="0" dy="${Math.round(3 + envelopeShadowIntensity * .11)}" stdDeviation="${(1 + envelopeShadowIntensity * .11).toFixed(1)}" flood-color="${envelopeShadowColor}" flood-opacity="${(envelopeShadowIntensity * .005).toFixed(2)}"/></filter>
      <filter id="seal-shadow" x="-40%" y="-40%" width="180%" height="180%"><feDropShadow dx="0" dy="${Math.round(2 + sealShadowIntensity * .07)}" stdDeviation="${(1 + sealShadowIntensity * .06).toFixed(1)}" flood-color="${sealShadowColor}" flood-opacity="${(sealShadowIntensity * .0055).toFixed(2)}"/></filter>
    </defs>
    <rect width="1200" height="630" fill="${background}"/>
    <g fill="${accent}" opacity=".08"><circle cx="1090" cy="35" r="155"/><circle cx="30" cy="600" r="125"/></g>
    <g fill="${accent}" fill-opacity=".14">
      <ellipse cx="1081" cy="56" rx="52" ry="18" transform="rotate(28 1081 56)"/><ellipse cx="1124" cy="91" rx="52" ry="18" transform="rotate(-13 1124 91)"/><ellipse cx="1060" cy="112" rx="46" ry="16" transform="rotate(-46 1060 112)"/>
      <ellipse cx="85" cy="554" rx="46" ry="16" transform="rotate(29 85 554)"/><ellipse cx="46" cy="586" rx="46" ry="16" transform="rotate(-18 46 586)"/>
    </g>
    <rect x="28" y="26" width="1144" height="578" rx="18" fill="url(#letter-paper)" stroke="${accent}" stroke-opacity=".28" stroke-width="1.5" filter="url(#letter-shadow)"/>
    <path d="M652 72v486" stroke="${accent}" stroke-opacity=".2"/>
    <text x="374" y="102" text-anchor="middle" font-family="${fontBody}" font-size="22" letter-spacing="6" fill="${accent}">${escapeXml(eventHeading)}</text>
    <path d="M292 124h164" stroke="${accent}" stroke-opacity=".48"/>
    <text x="374" y="${nameStartY}" text-anchor="middle" font-family="${fontDisplay}" font-size="${nameFontSize}" font-style="italic" fill="${text}">${namesMarkup}</text>
    <g transform="translate(374 397)"><circle cx="-9" cy="0" r="8" fill="none" stroke="${accent}" stroke-width="1.6"/><circle cx="9" cy="0" r="8" fill="none" stroke="${accent}" stroke-width="1.6"/></g>
    <text x="374" y="433" text-anchor="middle" font-family="${fontBody}" font-size="30" letter-spacing="2.5" fill="${text}" opacity=".78">${escapeXml(eventDate)}</text>
    ${seatMarkup}${personalMarkup}
    <text x="911" y="121" text-anchor="middle" font-family="${fontBody}" font-size="19" letter-spacing="3" fill="${accent}" opacity=".8">UNA INVITACIÓN ESPECIAL</text>
    <image href="${closedEnvelopeDataUri}" x="716" y="164" width="390" height="275" preserveAspectRatio="xMidYMid meet" filter="url(#envelope-tint) url(#envelope-shadow)"/>
    <g transform="translate(911 338) scale(.82) translate(-911 -307)" filter="url(#seal-shadow)">
      <circle cx="911" cy="307" r="52" fill="url(#letter-seal)" stroke="#fff" stroke-opacity=".4" stroke-width="2"/>
      <circle cx="911" cy="307" r="42" fill="none" stroke="#fff" stroke-opacity=".38" stroke-width="1.5" ${floralSeal ? '' : 'stroke-dasharray="2 4"'}/>
      ${floralSeal
        ? `<g fill="none" stroke="#fff" stroke-opacity=".53" stroke-width="1.4"><path d="M911 280c12 9 13 18 0 27-13-9-12-18 0-27Zm0 27c12 9 13 18 0 27-13-9-12-18 0-27Zm0-1c-9-12-18-13-27 0 9 13 18 12 27 0Zm0 0c9-12 18-13 27 0-9 13-18 12-27 0Z"/><circle cx="911" cy="307" r="3" fill="#fff"/></g>`
        : `<path d="m911 282 7 18 18 7-18 7-7 18-7-18-18-7 18-7Z" fill="none" stroke="#fff" stroke-opacity=".55" stroke-width="1.4"/>`}
      <text x="911" y="313" text-anchor="middle" font-family="${fontDisplay}" font-size="${sealText.length > 4 ? 12 : 16}" font-weight="700" fill="#fff">${escapeXml(sealText)}</text>
    </g>
    <path d="M796 475h230" stroke="${accent}" stroke-opacity=".25"/>
    <text x="911" y="515" text-anchor="middle" font-family="${fontBody}" font-size="24" font-style="italic" fill="${text}" opacity=".72">Toca para abrir la invitación</text>
    <text x="911" y="552" text-anchor="middle" font-family="${fontDisplay}" font-size="18" font-style="italic" fill="${accent}" opacity=".75">Con cariño, ${escapeXml(name)}</text>
    <text x="600" y="584" text-anchor="middle" font-family="${fontBody}" font-size="15" letter-spacing="2.5" fill="${accent}" opacity=".55">2DATE · INVITACIÓN DIGITAL</text>
  </svg>`;
};

/** Renders the same sealed invitation letter used as the first screen of the event. */
export async function generateWeddingOgImage(
  settings: Partial<WeddingSettings>,
  guest?: Partial<Guest> | null,
  _internalAssetOrigin?: string,
): Promise<Buffer> {
  closedLetterAsset ??= readFile(resolve(process.cwd(), 'public', 'carta-cerrada.svg'));
  const closedEnvelopeDataUri = `data:image/svg+xml;base64,${(await closedLetterAsset).toString('base64')}`;
  const svg = renderLetterImage(settings, guest, closedEnvelopeDataUri);
  return sharp(Buffer.from(svg)).png({ compressionLevel: 7 }).toBuffer();
}
