import assert from 'node:assert/strict';
import sharp from 'sharp';
import { generateWeddingOgImage } from '../src/lib/ogImageGenerator.ts';

const weddingImage = await generateWeddingOgImage({
  eventType: 'bodas',
  coupleNames: 'Ruth & Raúl',
  eventDate: '2026-12-05',
  ceremonyVenue: 'Fundo Piamonte',
  receptionAddress: 'Pucuchinche, Ecuador',
  cardStyle: 'classic-gold',
  envelopeColor: '#5A5A40',
  waxSealColor: '#C5A059',
  waxSealText: 'R&R',
  waxSealTextIsCustom: true,
}, {
  fullName: 'Invitada de prueba',
  allocatedPasses: 2,
});

const xvImage = await generateWeddingOgImage({
  eventType: 'xv',
  coupleNames: 'Valeria Montserrat',
  eventDate: '2026-10-17',
  ceremonyVenue: 'Salón Diamante',
  receptionAddress: 'Av. Las Palmas 550',
  cardStyle: 'romantic-floral',
  envelopeColor: '#7A3654',
  waxSealColor: '#D4AF37',
  waxSealText: 'XV',
}, null);

const [weddingMetadata, xvMetadata] = await Promise.all([
  sharp(weddingImage).metadata(),
  sharp(xvImage).metadata(),
]);

for (const metadata of [weddingMetadata, xvMetadata]) {
  assert.equal(metadata.format, 'png');
  assert.equal(metadata.width, 1200);
  assert.equal(metadata.height, 630);
}

assert.notDeepEqual(weddingImage, xvImage, 'wedding and XV letter cards should have distinct event designs');

const [weddingPixel, xvPixel] = await Promise.all([
  sharp(weddingImage).extract({ left: 2, top: 2, width: 1, height: 1 }).removeAlpha().raw().toBuffer(),
  sharp(xvImage).extract({ left: 2, top: 2, width: 1, height: 1 }).removeAlpha().raw().toBuffer(),
]);
assert.notDeepEqual(weddingPixel, xvPixel, 'each card should preserve its selected theme colors');

console.log('Open Graph verification passed: invitation letter cards are landscape 1200x630 PNGs and retain each event theme.');
