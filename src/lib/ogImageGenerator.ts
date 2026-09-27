import sharp from 'sharp';
import path from 'path';
import fs from 'fs';
import { WeddingSettings, Guest } from '../types.ts';
import { formatHeroDate } from './dateFormatters.ts';
import { getEventPresentation } from './eventUtils.ts';

// Helper to escape XML characters for SVG text
function escapeXml(unsafe: string): string {
  if (!unsafe) return '';
  return unsafe
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
}

function wrapHeroNames(value: string, maxLineLength = 18): string[] {
  const words = value.trim().split(/\s+/).filter(Boolean);
  if (!words.length) return [];

  const lines: string[] = [];
  let line = '';
  for (const word of words) {
    const wordCharacters = Array.from(word);
    if (wordCharacters.length > maxLineLength) {
      if (line) {
        lines.push(line);
        line = '';
      }
      for (let index = 0; index < wordCharacters.length; index += maxLineLength) {
        lines.push(wordCharacters.slice(index, index + maxLineLength).join(''));
      }
      continue;
    }

    const candidate = line ? `${line} ${word}` : word;
    if (line && candidate.length > maxLineLength) {
      lines.push(line);
      line = word;
    } else {
      line = candidate;
    }
  }
  if (line) lines.push(line);

  // Reserve a clear, visible name block even when an unusually long name is entered.
  const visibleLines = lines.slice(0, 3);
  if (lines.length > visibleLines.length && visibleLines.length) {
    const lastLine = Array.from(visibleLines[visibleLines.length - 1]);
    visibleLines[visibleLines.length - 1] = `${lastLine.slice(0, maxLineLength - 1).join('')}…`;
  }
  return visibleLines;
}

/**
 * Generates an ultra-crisp 1200x630 Open Graph image representing the event hero.
 * Designed specifically for rich social cards on WhatsApp, Facebook, iMessage, Twitter/X, Instagram, LinkedIn, etc.
 */
export async function generateWeddingOgImage(
  settings: Partial<WeddingSettings>,
  guest?: Partial<Guest> | null,
  internalAssetOrigin?: string,
): Promise<Buffer> {
  const width = 1200;
  const height = 630;

  const presentation = getEventPresentation(settings.eventType, settings.slug);
  const rawEventType = String(settings.eventType ?? '').normalize('NFD').replace(/[\u0300-\u036f]/g, '').trim().toLowerCase();
  const isXvEvent = presentation.type === 'xv';
  const isWeddingEvent = !rawEventType || ['boda', 'bodas', 'wedding', 'nupcias'].includes(rawEventType);
  const isGenericEvent = !isXvEvent && !isWeddingEvent;
  const coupleNames = settings.coupleNames?.trim() || (isGenericEvent ? 'Tu Evento' : presentation.defaultName);
  const nameLines = wrapHeroNames(coupleNames);
  const longestNameLine = Math.max(...nameLines.map((line) => line.length), 1);
  const maxNamesFontSize = nameLines.length >= 3 ? 56 : 72;
  const namesFontSize = Math.max(42, Math.min(maxNamesFontSize, Math.floor(maxNamesFontSize * (26 / longestNameLine))));
  const nameLineHeight = Math.round(namesFontSize * 1.12);
  const namesStartY = Math.round(325 - ((nameLines.length - 1) * nameLineHeight) / 2);
  const ringsY = 395 + Math.min((nameLines.length - 1) * 16, 32);
  const namesMarkup = nameLines
    .map((line, index) => `<tspan x="600"${index ? ` dy="${nameLineHeight}"` : ''}>${escapeXml(line)}</tspan>`)
    .join('');
  const eventDateFormatted = formatHeroDate(
    settings.eventDate || '2026-11-28',
    settings.heroDateFormat || 'dd.mm.aaaa',
    settings.heroCustomDateText
  );
  const venue = settings.ceremonyVenue || settings.receptionVenue || 'Acompáñanos a Celebrar';
  const rawLocation = settings.receptionAddress || settings.ceremonyAddress || '';
  const location = rawLocation
    .split(/https?:\/\/|www\./i)[0]
    .replace(/\s*(?:[·•|—–-]\s*)?c[oó]mo\s+llegar\s*:.*/i, '')
    .replace(/\s+/g, ' ')
    .trim();
  const venueAndLocation = [venue.trim(), location].filter(Boolean).join(' • ');
  const footerLocation = venueAndLocation.length > 76
    ? `${venueAndLocation.slice(0, 75).trimEnd()}…`
    : venueAndLocation;

  // 1. Resolve Background Image
  let backgroundBuffer: Buffer | null = null;
  const coverPhoto = settings.coverPhoto;

  if (coverPhoto) {
    try {
      if (coverPhoto.startsWith('/uploads/')) {
        // Uploaded covers are persisted in UPLOADS_DIR, which may be mounted
        // somewhere other than <cwd>/uploads in production.
        const uploadsDir = process.env.UPLOADS_DIR || path.join(process.cwd(), 'uploads');
        const filename = path.basename(coverPhoto.split(/[?#]/, 1)[0]);
        const localPath = path.join(uploadsDir, filename);
        if (fs.existsSync(localPath)) {
          backgroundBuffer = await sharp(localPath)
            .resize(width, height, { fit: 'cover', position: 'center' })
            .toBuffer();
        }
      } else if (/^data:image\/(?:png|jpe?g|webp|avif);base64,/i.test(coverPhoto)) {
        // Older editor sessions may have saved a data URL when the upload
        // endpoint was unavailable. It is still usable by the server renderer.
        const [, encodedImage] = coverPhoto.match(/^data:image\/(?:png|jpe?g|webp|avif);base64,([\s\S]+)$/i) || [];
        if (encodedImage) {
          const imageBuffer = Buffer.from(encodedImage, 'base64');
          if (imageBuffer.length <= 25 * 1024 * 1024) {
            backgroundBuffer = await sharp(imageBuffer)
              .resize(width, height, { fit: 'cover', position: 'center' })
              .toBuffer();
          }
        }
      } else if (coverPhoto.startsWith('/api/drive-folders/') && internalAssetOrigin) {
        // The Drive picker persists a signed, same-app proxy URL (not a
        // Google-hosted URL). Fetch it through this server so its existing
        // Drive API key and signature checks can resolve the private asset.
        const assetUrl = new URL(coverPhoto, internalAssetOrigin);
        const origin = new URL(internalAssetOrigin).origin;
        const validDriveAsset = assetUrl.origin === origin
          && /^\/api\/drive-folders\/[A-Za-z0-9_-]+\/photos\/[A-Za-z0-9_-]+\/thumbnail$/.test(assetUrl.pathname)
          && assetUrl.searchParams.has('signature');
        if (validDriveAsset) {
          const controller = new AbortController();
          const timeout = setTimeout(() => controller.abort(), 25000);
          try {
            const resp = await fetch(assetUrl, { signal: controller.signal });
            if (resp.ok) {
              const contentLength = Number(resp.headers.get('content-length') || 0);
              if (contentLength <= 25 * 1024 * 1024) {
                const arrayBuf = await resp.arrayBuffer();
                if (arrayBuf.byteLength <= 25 * 1024 * 1024) {
                  backgroundBuffer = await sharp(Buffer.from(arrayBuf))
                    .resize(width, height, { fit: 'cover', position: 'center' })
                    .toBuffer();
                }
              }
            }
          } finally {
            clearTimeout(timeout);
          }
        }
      } else if (coverPhoto.startsWith('http://') || coverPhoto.startsWith('https://')) {
        const controller = new AbortController();
        const timeout = setTimeout(() => controller.abort(), 4000);
        try {
          const resp = await fetch(coverPhoto, { signal: controller.signal });
          if (resp.ok) {
            const contentLength = Number(resp.headers.get('content-length') || 0);
            if (contentLength <= 25 * 1024 * 1024) {
              const arrayBuf = await resp.arrayBuffer();
              if (arrayBuf.byteLength <= 25 * 1024 * 1024) {
                backgroundBuffer = await sharp(Buffer.from(arrayBuf))
                  .resize(width, height, { fit: 'cover', position: 'center' })
                  .toBuffer();
              }
            }
          }
        } finally {
          clearTimeout(timeout);
        }
      }
    } catch (e) {
      console.warn('Could not resolve custom hero photo for OG card, using procedural background:', e);
    }
  }

  // If no background image found, generate elegant dark luxury procedural background
  if (!backgroundBuffer) {
    backgroundBuffer = await sharp({
      create: {
        width,
        height,
        channels: 4,
        background: { r: 25, g: 54, b: 46, alpha: 1 },
      },
    })
      .png()
      .toBuffer();
  }

  const categoryLabel = isXvEvent
    ? 'M I S   X V   A Ñ O S'
    : isGenericEvent
      ? 'C E L E B R A C I Ó N   E S P E C I A L'
      : 'N U E S T R A   B O D A';
  const celebrationSymbol = isXvEvent
    ? `<path d="M-37,8 L-28,-20 L-10,-5 L0,-30 L10,-5 L28,-20 L37,8 Z" fill="rgba(212,175,55,0.12)" stroke="url(#goldGradient)" stroke-width="3" stroke-linejoin="round" />
        <path d="M-37,13 L37,13" fill="none" stroke="url(#goldGradient)" stroke-width="3" stroke-linecap="round" />
        <path d="M-8,-13 L0,-22 L8,-13" fill="none" stroke="url(#goldGradient)" stroke-width="2" />`
    : isGenericEvent
      ? `<path d="M0,-29 L7,-8 L29,-7 L12,7 L18,29 L0,17 L-18,29 L-12,7 L-29,-7 L-7,-8 Z" fill="rgba(212,175,55,0.12)" stroke="url(#goldGradient)" stroke-width="3" stroke-linejoin="round" />`
      : `<circle cx="-14" cy="0" r="18" fill="none" stroke="url(#goldGradient)" stroke-width="3" />
        <circle cx="14" cy="0" r="18" fill="none" stroke="url(#goldGradient)" stroke-width="3" />
        <path d="M-8,-14 L0,-24 L8,-14" fill="none" stroke="url(#goldGradient)" stroke-width="2" />`;

  // 2. Build Hero Overlay SVG with Typography & Golden Accents
  const guestBadge = guest?.fullName
    ? `<g transform="translate(600, 490)">
        <rect x="-240" y="-22" width="480" height="44" rx="22" fill="rgba(197, 160, 89, 0.25)" stroke="#D4AF37" stroke-width="1.5" />
      <text x="0" y="6" text-anchor="middle" font-family="'DejaVu Serif', 'Cinzel', 'Playfair Display', Georgia, serif" font-size="18" fill="#FDFCF0" font-weight="600" letter-spacing="2">
          INVITACIÓN ESPECIAL PARA: ${escapeXml(guest.fullName.toUpperCase())}
        </text>
      </g>`
    : '';

  const locationText = location
    ? `<text x="600" y="555" text-anchor="middle" font-family="'DejaVu Sans', 'Montserrat', 'Inter', sans-serif" font-size="18" fill="rgba(255,255,255,0.8)" font-weight="400" letter-spacing="2">
        ${escapeXml(footerLocation.toUpperCase())}
      </text>`
    : `<text x="600" y="555" text-anchor="middle" font-family="'DejaVu Sans', 'Montserrat', 'Inter', sans-serif" font-size="20" fill="rgba(255,255,255,0.85)" font-weight="400" letter-spacing="3">
        ${escapeXml(venue.toUpperCase())}
      </text>`;

  const svgOverlay = `
    <svg width="${width}" height="${height}" viewBox="0 0 ${width} ${height}" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <!-- Dark Vignette Gradient for high contrast -->
        <linearGradient id="vignette" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stop-color="#000000" stop-opacity="0.45" />
          <stop offset="40%" stop-color="#000000" stop-opacity="0.25" />
          <stop offset="70%" stop-color="#000000" stop-opacity="0.42" />
          <stop offset="100%" stop-color="#000000" stop-opacity="0.68" />
        </linearGradient>

        <linearGradient id="goldGradient" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stop-color="#F9F5E8" />
          <stop offset="50%" stop-color="#E5C77A" />
          <stop offset="100%" stop-color="#C5A059" />
        </linearGradient>

        <filter id="textGlow" x="-20%" y="-20%" width="140%" height="140%">
          <feDropShadow dx="0" dy="4" stdDeviation="8" flood-color="#000" flood-opacity="0.9" />
        </filter>
        <filter id="softGlow" x="-20%" y="-20%" width="140%" height="140%">
          <feDropShadow dx="0" dy="2" stdDeviation="4" flood-color="#000" flood-opacity="0.7" />
        </filter>
      </defs>

      <!-- Vignette Overlay -->
      <rect width="${width}" height="${height}" fill="url(#vignette)" />

      <!-- Inner Border Frame -->
      <rect x="30" y="30" width="${width - 60}" height="${height - 60}" rx="12" fill="none" stroke="url(#goldGradient)" stroke-width="1.5" stroke-opacity="0.5" />
      <rect x="40" y="40" width="${width - 80}" height="${height - 80}" rx="8" fill="none" stroke="rgba(255,255,255,0.15)" stroke-width="1" />

      <!-- Corner Ornaments -->
      <path d="M45,65 L45,45 L65,45" fill="none" stroke="url(#goldGradient)" stroke-width="2" />
      <path d="M${width - 45},65 L${width - 45},45 L${width - 65},45" fill="none" stroke="url(#goldGradient)" stroke-width="2" />
      <path d="M45,${height - 65} L45,${height - 45} L65,${height - 45}" fill="none" stroke="url(#goldGradient)" stroke-width="2" />
      <path d="M${width - 45},${height - 65} L${width - 45},${height - 45} L${width - 65},${height - 45}" fill="none" stroke="url(#goldGradient)" stroke-width="2" />

      <!-- Top Tag / Category -->
      <g filter="url(#softGlow)">
        <text x="600" y="110" text-anchor="middle" font-family="'DejaVu Serif', 'Cinzel', 'Playfair Display', Georgia, serif" font-size="18" fill="url(#goldGradient)" font-weight="700" letter-spacing="6">
          ${categoryLabel}
        </text>
        <line x1="420" y1="130" x2="780" y2="130" stroke="url(#goldGradient)" stroke-width="1" stroke-opacity="0.6" />
      </g>

      <!-- Date Badge -->
      <g filter="url(#softGlow)">
        <text x="600" y="185" text-anchor="middle" font-family="'DejaVu Serif', 'Cinzel', 'Playfair Display', Georgia, serif" font-size="28" fill="#F3F0E6" font-weight="600" letter-spacing="4">
          ${escapeXml(eventDateFormatted)}
        </text>
      </g>

      <!-- Primary names from the event Hero (couple or quinceañera), wrapped to fit social previews -->
      <g filter="url(#textGlow)">
        <text x="600" y="${namesStartY}" text-anchor="middle" font-family="'DejaVu Serif', 'Playfair Display', Georgia, 'Times New Roman', serif" font-size="${namesFontSize}" fill="#FFFFFF" font-weight="700" letter-spacing="2">
          ${namesMarkup}
        </text>
      </g>

      <!-- Event-specific accent symbol -->
      <g transform="translate(600, ${ringsY})" filter="url(#softGlow)">
        ${celebrationSymbol}
      </g>

      <!-- Guest Personalized Badge (if present) -->
      ${guestBadge}

      <!-- Venue & Location Info at Bottom -->
      <g filter="url(#softGlow)">
        ${locationText}
      </g>

      <!-- Bottom RSVP Call to Action -->
      <text x="600" y="585" text-anchor="middle" font-family="'DejaVu Sans', 'Montserrat', 'Inter', sans-serif" font-size="14" fill="url(#goldGradient)" font-weight="600" letter-spacing="3">
        TOCA PARA ABRIR LA INVITACIÓN &amp; CONFIRMAR ASISTENCIA
      </text>
    </svg>
  `;

  // 3. Composite the background photo with the vector SVG overlay
  const finalImageBuffer = await sharp(backgroundBuffer)
    .composite([
      {
        input: Buffer.from(svgOverlay),
        top: 0,
        left: 0,
      },
    ])
    .png({ quality: 90, compressionLevel: 6 })
    .toBuffer();

  return finalImageBuffer;
}
