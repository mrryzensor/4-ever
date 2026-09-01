import sharp from 'sharp';
import path from 'path';
import fs from 'fs';
import { WeddingSettings, Guest } from '../types.ts';
import { formatHeroDate } from './dateFormatters.ts';

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

/**
 * Generates an ultra-crisp 1200x630 Open Graph Image representing the Hero of the Wedding Invitation.
 * Designed specifically for rich social cards on WhatsApp, Facebook, iMessage, Twitter/X, Instagram, LinkedIn, etc.
 */
export async function generateWeddingOgImage(
  settings: Partial<WeddingSettings>,
  guest?: Partial<Guest> | null
): Promise<Buffer> {
  const width = 1200;
  const height = 630;

  const coupleNames = settings.coupleNames || 'Nuestra Boda';
  const eventDateFormatted = formatHeroDate(
    settings.eventDate || '2026-11-28',
    settings.heroDateFormat || 'dd.mm.aaaa',
    settings.heroCustomDateText
  );
  const venue = settings.ceremonyVenue || settings.receptionVenue || 'Acompáñanos a Celebrar';
  const location = settings.receptionAddress || settings.ceremonyAddress || '';

  // 1. Resolve Background Image
  let backgroundBuffer: Buffer | null = null;
  const coverPhoto = settings.coverPhoto;

  if (coverPhoto) {
    try {
      if (coverPhoto.startsWith('/uploads/')) {
        const localPath = path.join(process.cwd(), coverPhoto);
        if (fs.existsSync(localPath)) {
          backgroundBuffer = await sharp(localPath)
            .resize(width, height, { fit: 'cover', position: 'center' })
            .toBuffer();
        }
      } else if (coverPhoto.startsWith('http://') || coverPhoto.startsWith('https://')) {
        const controller = new AbortController();
        const timeout = setTimeout(() => controller.abort(), 4000);
        const resp = await fetch(coverPhoto, { signal: controller.signal });
        clearTimeout(timeout);
        if (resp.ok) {
          const arrayBuf = await resp.arrayBuffer();
          backgroundBuffer = await sharp(Buffer.from(arrayBuf))
            .resize(width, height, { fit: 'cover', position: 'center' })
            .toBuffer();
        }
      }
    } catch (e) {
      console.warn('Could not fetch custom hero photo for OG card, using procedural background:', e);
    }
  }

  // If no background image found, generate elegant dark luxury procedural background
  if (!backgroundBuffer) {
    backgroundBuffer = await sharp({
      create: {
        width,
        height,
        channels: 4,
        background: { r: 24, g: 30, b: 35, alpha: 1 },
      },
    })
      .png()
      .toBuffer();
  }

  // 2. Build Hero Overlay SVG with Typography & Golden Accents
  const guestBadge = guest?.fullName
    ? `<g transform="translate(600, 490)">
        <rect x="-240" y="-22" width="480" height="44" rx="22" fill="rgba(197, 160, 89, 0.25)" stroke="#D4AF37" stroke-width="1.5" />
        <text x="0" y="6" text-anchor="middle" font-family="'Cinzel', 'Playfair Display', Georgia, serif" font-size="18" fill="#FDFCF0" font-weight="600" letter-spacing="2">
          INVITACIÓN ESPECIAL PARA: ${escapeXml(guest.fullName.toUpperCase())}
        </text>
      </g>`
    : '';

  const locationText = location
    ? `<text x="600" y="555" text-anchor="middle" font-family="'Montserrat', 'Inter', sans-serif" font-size="18" fill="rgba(255,255,255,0.8)" font-weight="400" letter-spacing="2">
        ${escapeXml(venue.toUpperCase())} ${venue && location ? '•' : ''} ${escapeXml(location)}
      </text>`
    : `<text x="600" y="555" text-anchor="middle" font-family="'Montserrat', 'Inter', sans-serif" font-size="20" fill="rgba(255,255,255,0.85)" font-weight="400" letter-spacing="3">
        ${escapeXml(venue.toUpperCase())}
      </text>`;

  const svgOverlay = `
    <svg width="${width}" height="${height}" viewBox="0 0 ${width}" ${height}" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <!-- Dark Vignette Gradient for high contrast -->
        <linearGradient id="vignette" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stop-color="#000000" stop-opacity="0.75" />
          <stop offset="40%" stop-color="#000000" stop-opacity="0.45" />
          <stop offset="70%" stop-color="#000000" stop-opacity="0.70" />
          <stop offset="100%" stop-color="#000000" stop-opacity="0.95" />
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
        <text x="600" y="110" text-anchor="middle" font-family="'Cinzel', 'Playfair Display', Georgia, serif" font-size="18" fill="url(#goldGradient)" font-weight="700" letter-spacing="6">
          N U E S T R A   B O D A
        </text>
        <line x1="420" y1="130" x2="780" y2="130" stroke="url(#goldGradient)" stroke-width="1" stroke-opacity="0.6" />
      </g>

      <!-- Date Badge -->
      <g filter="url(#softGlow)">
        <text x="600" y="185" text-anchor="middle" font-family="'Cinzel', 'Playfair Display', Georgia, serif" font-size="28" fill="#F3F0E6" font-weight="600" letter-spacing="4">
          ${escapeXml(eventDateFormatted)}
        </text>
      </g>

      <!-- Main Couple Names -->
      <g filter="url(#textGlow)">
        <text x="600" y="325" text-anchor="middle" font-family="'Playfair Display', 'Cinzel', Georgia, serif" font-size="${coupleNames.length > 25 ? 58 : 72}" fill="#FFFFFF" font-weight="700" letter-spacing="2">
          ${escapeXml(coupleNames)}
        </text>
      </g>

      <!-- Rings / Monogram Symbol -->
      <g transform="translate(600, 395)" filter="url(#softGlow)">
        <circle cx="-14" cy="0" r="18" fill="none" stroke="url(#goldGradient)" stroke-width="3" />
        <circle cx="14" cy="0" r="18" fill="none" stroke="url(#goldGradient)" stroke-width="3" />
        <path d="M-8,-14 L0,-24 L8,-14" fill="none" stroke="url(#goldGradient)" stroke-width="2" />
      </g>

      <!-- Guest Personalized Badge (if present) -->
      ${guestBadge}

      <!-- Venue & Location Info at Bottom -->
      <g filter="url(#softGlow)">
        ${locationText}
      </g>

      <!-- Bottom RSVP Call to Action -->
      <text x="600" y="585" text-anchor="middle" font-family="'Montserrat', 'Inter', sans-serif" font-size="14" fill="url(#goldGradient)" font-weight="600" letter-spacing="3">
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
