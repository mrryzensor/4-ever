const sharp = require('sharp');
const fs = require('fs');
const path = require('path');

async function run() {
  const publicDir = path.join(process.cwd(), 'public');
  if (!fs.existsSync(publicDir)) {
    fs.mkdirSync(publicDir, { recursive: true });
  }

  // Copy original webp and png
  fs.copyFileSync('Logo.webp', path.join(publicDir, 'Logo.webp'));
  fs.copyFileSync('Logo.png', path.join(publicDir, 'Logo.png'));
  if (fs.existsSync('LogoGrande.webp')) {
    fs.copyFileSync('LogoGrande.webp', path.join(publicDir, 'LogoGrande.webp'));
  }

  // Favicons
  await sharp('Logo.png').resize(32, 32).toFile(path.join(publicDir, 'favicon-32x32.png'));
  await sharp('Logo.png').resize(48, 48).toFile(path.join(publicDir, 'favicon.ico'));
  await sharp('Logo.png').resize(64, 64).toFile(path.join(publicDir, 'favicon.png'));
  await sharp('Logo.png').resize(180, 180).toFile(path.join(publicDir, 'apple-touch-icon.png'));
  await sharp('Logo.png').resize(192, 192).toFile(path.join(publicDir, 'icon-192.png'));
  await sharp('Logo.png').resize(512, 512).toFile(path.join(publicDir, 'icon-512.png'));

  // Open Graph 1200x630 Social Banner with Logo centered on Atelier luxury cream background
  const logoResized = await sharp('Logo.png')
    .resize(460, 460, { fit: 'contain', background: { r: 0, g: 0, b: 0, alpha: 0 } })
    .toBuffer();

  const ogSvgBackground = Buffer.from(`
    <svg width="1200" height="630" viewBox="0 0 1200 630" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id="bg" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stop-color="#FDFCF0" />
          <stop offset="50%" stop-color="#FAF9F0" />
          <stop offset="100%" stop-color="#F4F1DC" />
        </linearGradient>
        <radialGradient id="glow" cx="50%" cy="45%" r="45%">
          <stop offset="0%" stop-color="#FFFFFF" stop-opacity="0.9" />
          <stop offset="100%" stop-color="#FAF9F0" stop-opacity="0" />
        </radialGradient>
      </defs>
      <rect width="1200" height="630" fill="url(#bg)" />
      <rect width="1200" height="630" fill="url(#glow)" />
      
      <!-- Elegant double borders -->
      <rect x="24" y="24" width="1152" height="582" rx="24" fill="none" stroke="#D4A373" stroke-width="1.5" stroke-opacity="0.4" />
      <rect x="36" y="36" width="1128" height="558" rx="18" fill="none" stroke="#5A5A40" stroke-width="0.75" stroke-opacity="0.3" />
      
      <!-- Subtle luxury corner ornaments -->
      <circle cx="36" cy="36" r="4" fill="#D4A373" opacity="0.6" />
      <circle cx="1164" cy="36" r="4" fill="#D4A373" opacity="0.6" />
      <circle cx="36" cy="594" r="4" fill="#D4A373" opacity="0.6" />
      <circle cx="1164" cy="594" r="4" fill="#D4A373" opacity="0.6" />

      <!-- Subtitle badge & description -->
      <text x="600" y="490" text-anchor="middle" font-family="sans-serif" font-size="14" font-weight="600" letter-spacing="5" fill="#7D8C7A">ATELIER NUPCIAL DIGITAL</text>
      <text x="600" y="530" text-anchor="middle" font-family="serif" font-size="24" font-style="italic" fill="#3D3D2C">Invitaciones de Boda Elegantes, Interactivas &amp; Gestión RSVP</text>
    </svg>
  `);

  await sharp(ogSvgBackground)
    .composite([
      {
        input: logoResized,
        top: 20,
        left: 370,
      }
    ])
    .png()
    .toFile(path.join(publicDir, 'og-landing.png'));

  // Also create WebP version of OG image
  await sharp(path.join(publicDir, 'og-landing.png'))
    .webp({ quality: 92 })
    .toFile(path.join(publicDir, 'og-landing.webp'));

  console.log('Successfully generated all public assets, favicons, and social OG images.');
}

run().catch(console.error);
