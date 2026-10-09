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
import { getWaxSealMotifPaths } from './waxSealAppearance.ts';

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
  const accent = safeColor(settings.letterAccentColor, safeColor(theme.accentColorHex, '#5A5A40'));
  const background = safeColor(settings.letterBackgroundColor, safeColor(theme.bgHex, '#FDFCF0'));
  const paper = safeColor(settings.letterPaperColor, safeColor(theme.secondaryBgHex, '#FFFFFF'));
  const text = safeColor(settings.letterTextColor, safeColor(theme.primaryColorHex, '#1A1A1A'));
  const heroColor = safeColor(settings.letterHeroColor, text);
  const motifColor = safeColor(settings.letterMotifColor, accent);
  const frameColor = safeColor(settings.letterFrameColor, accent);
  const dividerColor = safeColor(settings.letterDividerColor, accent);
  const arrowColor = safeColor(settings.letterArrowColor, accent);
  const showCornerMotifs = settings.letterShowCornerMotifs !== false;
  const cardBorder = settings.letterShowCardBorder === false ? 'stroke="none"' : `stroke="${frameColor}" stroke-opacity=".42" stroke-width="1.5"`;
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
  const name = settings.letterNamesText?.trim() || settings.coupleNames?.trim() || presentation.defaultName;
  const lines = wrapNames(name);
  const fontDisplay = settings.letterDisplayFont && settings.letterDisplayFont !== 'auto' && /^[\w -]+$/.test(settings.letterDisplayFont)
    ? `'${escapeXml(settings.letterDisplayFont)}', ${['Montserrat', 'Plus Jakarta Sans'].includes(settings.letterDisplayFont) ? 'Arial, sans-serif' : settings.letterDisplayFont === 'Alex Brush' ? 'cursive' : 'Georgia, serif'}`
    : getSvgFont(theme.fontDisplay);
  const fontBody = settings.letterBodyFont && settings.letterBodyFont !== 'auto' && /^[\w -]+$/.test(settings.letterBodyFont)
    ? `'${escapeXml(settings.letterBodyFont)}', ${['Montserrat', 'Plus Jakarta Sans'].includes(settings.letterBodyFont) ? 'Arial, sans-serif' : settings.letterBodyFont === 'Alex Brush' ? 'cursive' : 'Georgia, serif'}`
    : getSvgFont(theme.fontBody, 'Arial, sans-serif');
  const eventDate = settings.letterDateText?.trim() || formatHeroDate(
    settings.eventDate || '2026-11-28',
    settings.heroDateFormat || 'dd.mm.aaaa',
    settings.heroCustomDateText,
  );
  const guestName = guest?.fullName?.trim();
  const reservedSeats = guest
    ? Math.max(1, Number(guest.allocatedPasses || guest.confirmedPasses || 1))
    : null;
  const sealText = getDisplayedWaxSealText(settings as Pick<WeddingSettings, 'coupleNames' | 'eventType' | 'waxSealText' | 'waxSealTextIsCustom'>);
  const eventHeading = settings.letterHeadingText?.trim() || (eventType === 'xv' ? 'MIS XV AÑOS' : eventType === 'bodas' ? 'NUESTRA BODA' : 'NUESTRA CELEBRACIÓN');
  const reservationHeading = settings.letterReservationHeadingText?.trim() || 'HEMOS RESERVADO';
  const reservationUnit = reservedSeats === 1
    ? settings.letterReservationSingleText?.trim() || 'LUGAR EN TU HONOR'
    : settings.letterReservationPluralText?.trim() || 'LUGARES EN TU HONOR';
  const guestLabel = settings.letterGuestLabelText?.trim() || 'Para';
  const messageText = settings.letterMessageText?.trim() || 'Nos encantará celebrar contigo';
  const ctaText = settings.letterCtaText?.trim() || 'Toca el sobre para abrir la invitación';
  const signoffText = settings.letterSignoffText?.trim() || 'Con cariño,';
  const longestNameLine = Math.max(...lines.map((line) => line.length), 1);
  const maxNameFontSize = lines.length > 2 ? 49 : lines.length > 1 ? 60 : 72;
  const nameFontSize = Math.max(38, Math.min(maxNameFontSize, Math.floor(575 / (longestNameLine * 0.58))));
  const namesMarkup = lines.map((line, index) =>
    `<tspan x="374"${index ? ` dy="${Math.round(nameFontSize * 1.08)}"` : ''}>${escapeXml(line)}</tspan>`
  ).join('');
  const nameStartY = 254 - ((lines.length - 1) * nameFontSize * 0.54);
  const waxSealMotif = getWaxSealMotifPaths(sealTheme.ornamentStyle)
    .map((path) => `<path d="${escapeXml(path)}"/>`)
    .join('');
  const letterFrameStyle = settings.letterFrameStyle && settings.letterFrameStyle !== 'auto' ? settings.letterFrameStyle : baseStyle;
  const frameRadius = letterFrameStyle === 'minimal-editorial' || letterFrameStyle === 'dark-luxury' ? 4 : letterFrameStyle === 'romantic-floral' ? 30 : 18;
  const frameCorner = ['romantic-floral', 'watercolor-garden', 'lavender-provence', 'emerald-botanical'].includes(letterFrameStyle)
    ? `<path d="M48 87c4-21 18-35 39-39m-27 25c10-4 19-4 28 1"/><circle cx="89" cy="48" r="5"/><circle cx="1118" cy="48" r="5"/><circle cx="48" cy="582" r="5"/><circle cx="1118" cy="582" r="5"/>`
    : ['dark-luxury', 'royal-navy', 'champagne-glam'].includes(letterFrameStyle)
      ? `<path d="M48 88V48h40m1024 0h40v40M48 542v40h40m1024 0h40v-40"/><path d="m88 55 7 13 13 7-13 7-7 13-7-13-13-7 13-7 7-13Zm1024 0 7 13 13 7-13 7-7 13-7-13-13-7 13-7 7-13Z"/>`
      : ['boho-chic', 'terracotta-sunset'].includes(letterFrameStyle)
        ? `<path d="M48 88V48h40m1024 0h40v40M48 542v40h40m1024 0h40v-40"/><path d="m78 48 10 10-10 10-10-10 10-10Zm1044 0 10 10-10 10-10-10 10-10Z"/>`
        : `<path d="M48 88V58q0-10 10-10h30m1024 0h30q10 0 10 10v30M48 542v30q0 10 10 10h30m1024 0h30q10 0 10-10v-30M57 78V62q0-4 5-4h16m1044 0h16q4 0 4 4v16M57 552v16q0 4 5 4h16m1044 0h16q4 0 4-4v-16"/><circle cx="62" cy="62" r="3"/><circle cx="1138" cy="62" r="3"/><circle cx="62" cy="568" r="3"/><circle cx="1138" cy="568" r="3"/>`;
  const letterMotifStyle = settings.letterMotifStyle && settings.letterMotifStyle !== 'auto'
    ? settings.letterMotifStyle
    : settings.countdownStyle && settings.countdownStyle !== 'auto' ? settings.countdownStyle : baseStyle;
  const motifDecoration = ['dark-luxury', 'royal-navy', 'champagne-glam'].includes(letterMotifStyle)
    ? `<path d="M1080 28l7 18 18 7-18 7-7 18-7-18-18-7 18-7 7-18ZM1126 98l5 12 12 5-12 5-5 12-5-12-12-5 12-5 5-12Z"/><circle cx="1052" cy="94" r="4"/><circle cx="1152" cy="52" r="3"/>`
    : ['minimal-editorial'].includes(letterMotifStyle)
      ? `<path d="M1030 30h155M1160 30v138M1030 98h88" fill="none" stroke="${motifColor}" stroke-width="2"/><circle cx="1160" cy="30" r="4"/>`
      : ['boho-chic', 'terracotta-sunset'].includes(letterMotifStyle)
        ? `<path d="M1088 20c-24 46-23 84 0 127m0-88c-25-19-44-23-64-19m64 54c22-22 45-29 67-23m-67 53c-20-15-40-17-57-11" fill="none" stroke="${motifColor}" stroke-width="3" stroke-linecap="round"/><ellipse cx="1024" cy="38" rx="18" ry="7" transform="rotate(24 1024 38)"/><ellipse cx="1158" cy="71" rx="19" ry="7" transform="rotate(-20 1158 71)"/>`
        : `<ellipse cx="1081" cy="56" rx="52" ry="18" transform="rotate(28 1081 56)"/><ellipse cx="1124" cy="91" rx="52" ry="18" transform="rotate(-13 1124 91)"/><ellipse cx="1060" cy="112" rx="46" ry="16" transform="rotate(-46 1060 112)"/><ellipse cx="85" cy="554" rx="46" ry="16" transform="rotate(29 85 554)"/><ellipse cx="46" cy="586" rx="46" ry="16" transform="rotate(-18 46 586)"/>`;
  const seatMarkup = reservedSeats
    ? `<text x="374" y="474" text-anchor="middle" font-family="${fontBody}" font-size="19" letter-spacing="3" fill="${accent}" opacity=".82">${escapeXml(reservationHeading)}</text>
       <rect x="349" y="492" width="50" height="50" rx="10" fill="none" stroke="${accent}" stroke-opacity=".6" stroke-width="1.5" />
       <text x="374" y="529" text-anchor="middle" font-family="${fontDisplay}" font-size="42" fill="${accent}">${reservedSeats}</text>
       <text x="374" y="563" text-anchor="middle" font-family="${fontBody}" font-size="16" letter-spacing="2" fill="${text}" opacity=".72">${escapeXml(reservationUnit)}</text>`
    : `<text x="374" y="503" text-anchor="middle" font-family="${fontBody}" font-size="22" font-style="italic" fill="${text}" opacity=".72">${escapeXml(messageText)}</text>`;
  const personalMarkup = guestName
    ? `<text x="374" y="585" text-anchor="middle" font-family="${fontBody}" font-size="16" fill="${text}" opacity=".62">${escapeXml(guestLabel)} ${escapeXml(guestName)}</text>`
    : '';

  return `<svg xmlns="http://www.w3.org/2000/svg" width="1200" height="630" viewBox="0 0 1200 630">
    <defs>
      <radialGradient id="letter-seal" cx="34%" cy="25%" r="78%"><stop offset="0" stop-color="${brighten(sealColor, .18)}"/><stop offset="1" stop-color="${brighten(sealColor, -.2)}"/></radialGradient>
      <filter id="letter-shadow" x="-20%" y="-20%" width="140%" height="150%"><feDropShadow dx="0" dy="14" stdDeviation="16" flood-color="#28231c" flood-opacity=".14"/></filter>
      <filter id="envelope-tint" x="-20%" y="-20%" width="140%" height="140%" color-interpolation-filters="sRGB"><feColorMatrix type="matrix" values="${getEnvelopeTintMatrix(envelopeColor)}"/></filter>
      <filter id="envelope-shadow" x="-25%" y="-25%" width="150%" height="160%"><feDropShadow dx="0" dy="${Math.round(3 + envelopeShadowIntensity * .11)}" stdDeviation="${(1 + envelopeShadowIntensity * .11).toFixed(1)}" flood-color="${envelopeShadowColor}" flood-opacity="${(envelopeShadowIntensity * .005).toFixed(2)}"/></filter>
      <filter id="seal-shadow" x="-40%" y="-40%" width="180%" height="180%"><feDropShadow dx="0" dy="${Math.round(2 + sealShadowIntensity * .07)}" stdDeviation="${(1 + sealShadowIntensity * .06).toFixed(1)}" flood-color="${sealShadowColor}" flood-opacity="${(sealShadowIntensity * .0055).toFixed(2)}"/></filter>
    </defs>
    <rect width="1200" height="630" fill="${background}"/>
    ${showCornerMotifs ? `<g fill="${motifColor}" opacity=".08"><circle cx="1090" cy="35" r="155"/><circle cx="30" cy="600" r="125"/></g><g fill="${motifColor}" fill-opacity=".14">${motifDecoration}</g>` : ''}
    <rect x="28" y="26" width="1144" height="578" rx="${frameRadius}" fill="${paper}" ${cardBorder} filter="url(#letter-shadow)"/>
    ${showCornerMotifs ? `<g fill="none" stroke="${frameColor}" stroke-opacity=".68" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round">${frameCorner}</g>` : ''}
    <path d="M652 72v486" stroke="${dividerColor}" stroke-opacity=".3"/>
    <text x="374" y="102" text-anchor="middle" font-family="${fontBody}" font-size="22" letter-spacing="6" fill="${accent}">${escapeXml(eventHeading)}</text>
    <path d="M292 124h164" stroke="${dividerColor}" stroke-opacity=".58"/>
    <text x="374" y="${nameStartY}" text-anchor="middle" font-family="${fontDisplay}" font-size="${nameFontSize}" font-style="italic" fill="${heroColor}">${namesMarkup}</text>
    <g transform="translate(374 397)"><circle cx="-9" cy="0" r="8" fill="none" stroke="${accent}" stroke-width="1.6"/><circle cx="9" cy="0" r="8" fill="none" stroke="${accent}" stroke-width="1.6"/></g>
    <text x="374" y="433" text-anchor="middle" font-family="${fontBody}" font-size="30" letter-spacing="2.5" fill="${text}" opacity=".78">${escapeXml(eventDate)}</text>
    ${seatMarkup}${personalMarkup}
    <text x="911" y="121" text-anchor="middle" font-family="${fontBody}" font-size="19" letter-spacing="3" fill="${accent}" opacity=".8">UNA INVITACIÓN ESPECIAL</text>
    <image href="${closedEnvelopeDataUri}" x="716" y="164" width="390" height="275" preserveAspectRatio="xMidYMid meet" filter="url(#envelope-tint) url(#envelope-shadow)"/>
    <g transform="translate(911 338) scale(.82) translate(-911 -307)" filter="url(#seal-shadow)">
      <circle cx="911" cy="307" r="52" fill="url(#letter-seal)" stroke="#fff" stroke-opacity=".4" stroke-width="2"/>
      <circle cx="911" cy="307" r="42" fill="none" stroke="#fff" stroke-opacity=".46" stroke-width="1.4"/>
      <g transform="translate(861 257)" fill="none" stroke="#fff" stroke-opacity=".62" stroke-width="1.35" stroke-linecap="round" stroke-linejoin="round">${waxSealMotif}</g>
      <text x="911" y="313" text-anchor="middle" font-family="${fontDisplay}" font-size="${sealText.length > 4 ? 12 : 16}" font-weight="700" fill="#fff">${escapeXml(sealText)}</text>
    </g>
    <path d="M796 475h230" stroke="${dividerColor}" stroke-opacity=".4"/>
    <path d="M823 493 C811 482 817 466 829 466 C841 466 844 481 832 481 C824 481 824 470 834 465 C846 459 850 447 856 434" fill="none" stroke="${arrowColor}" stroke-width="2.5" stroke-linecap="round" stroke-dasharray="1.2 7"/>
    <path d="M850 439l7-12 4 13-5-3Z" fill="${arrowColor}"/>
    <text x="911" y="515" text-anchor="middle" font-family="${fontBody}" font-size="24" font-style="italic" fill="${text}" opacity=".72">${escapeXml(ctaText)}</text>
    <text x="911" y="552" text-anchor="middle" font-family="${fontDisplay}" font-size="18" font-style="italic" fill="${heroColor}" opacity=".75">${escapeXml(signoffText)} ${escapeXml(name)}</text>
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
