import assert from 'node:assert/strict';
import { createServer } from 'node:http';
import sharp from 'sharp';
import { generateWeddingOgImage } from '../src/lib/ogImageGenerator.ts';

const driveThumbnail = await sharp({
  create: {
    width: 64,
    height: 64,
    channels: 3,
    background: { r: 20, g: 65, b: 220 },
  },
})
  .png()
  .toBuffer();

let thumbnailRequests = 0;
const proxy = createServer((request, response) => {
  const requestUrl = new URL(request.url || '/', 'http://127.0.0.1');
  const isSignedThumbnail = requestUrl.pathname === '/api/drive-folders/folder_1/photos/photo_1/thumbnail'
    && requestUrl.searchParams.has('signature');

  if (!isSignedThumbnail) {
    response.writeHead(404).end();
    return;
  }

  thumbnailRequests += 1;
  response.writeHead(200, {
    'Content-Type': 'image/png',
    'Content-Length': driveThumbnail.length,
  });
  response.end(driveThumbnail);
});

await new Promise<void>((resolve, reject) => {
  proxy.once('error', reject);
  proxy.listen(0, '127.0.0.1', resolve);
});

const address = proxy.address();
assert(address && typeof address === 'object', 'thumbnail proxy should bind to a local port');
const internalAssetOrigin = `http://127.0.0.1:${address.port}`;
const driveCover = '/api/drive-folders/folder_1/photos/photo_1/thumbnail?signature=ci';

try {
  const weddingImage = await generateWeddingOgImage({
    eventType: 'bodas',
    coupleNames: 'Ruth & Raúl',
    eventDate: '2026-12-05',
    ceremonyVenue: 'Fundo Piamonte',
    receptionAddress: 'Pucuchinche, Ecuador',
    coverPhoto: driveCover,
  }, null, internalAssetOrigin);

  const xvImage = await generateWeddingOgImage({
    eventType: 'xv',
    coupleNames: 'Valeria Montserrat',
    eventDate: '2026-10-17',
    ceremonyVenue: 'Salón Diamante',
    receptionAddress: 'Av. Las Palmas 550',
    coverPhoto: driveCover,
  }, null, internalAssetOrigin);

  const [weddingMetadata, xvMetadata] = await Promise.all([
    sharp(weddingImage).metadata(),
    sharp(xvImage).metadata(),
  ]);

  for (const metadata of [weddingMetadata, xvMetadata]) {
    assert.equal(metadata.format, 'png');
    assert.equal(metadata.width, 1200);
    assert.equal(metadata.height, 630);
  }

  assert.equal(thumbnailRequests, 2, 'both event types should resolve the signed Drive cover');
  assert.notDeepEqual(weddingImage, xvImage, 'wedding and XV cards should have distinct event designs');

  const { data: backgroundPixel } = await sharp(weddingImage)
    .extract({ left: 100, top: 300, width: 1, height: 1 })
    .removeAlpha()
    .raw()
    .toBuffer({ resolveWithObject: true });
  assert(backgroundPixel[2] > backgroundPixel[1] * 2, 'the Drive thumbnail should be visible behind the overlay');

  console.log('Open Graph verification passed: wedding and XV PNGs are 1200x630 and resolve signed Drive covers.');
} finally {
  await new Promise<void>((resolve, reject) => {
    proxy.close((error) => error ? reject(error) : resolve());
  });
}
