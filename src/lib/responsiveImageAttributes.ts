const UNSPLASH_IMAGE_HOST = 'images.unsplash.com';

const responsiveWidths = [640, 960, 1440, 1920] as const;

function isSignedFullDriveAsset(source: string): boolean {
  try {
    const url = new URL(source, 'https://local.invalid');
    return url.origin === 'https://local.invalid' &&
      /^\/api\/drive-folders\/[A-Za-z0-9_-]{1,200}\/photos\/[A-Za-z0-9_-]{1,200}\/thumbnail$/.test(url.pathname) &&
      url.searchParams.get('variant') === 'full';
  } catch {
    return false;
  }
}

export function getOptimizedImageUrl(source: string, width: number, weddingId?: number): string {
  const localUpload = /^\/uploads\/[A-Za-z0-9._-]+$/.test(source);
  const signedDriveAsset = isSignedFullDriveAsset(source);
  if ((localUpload || signedDriveAsset) && Number.isSafeInteger(weddingId) && Number(weddingId) > 0) {
    const driveWidth = responsiveWidths.find((candidate) => candidate >= width) || responsiveWidths[responsiveWidths.length - 1];
    const query = new URLSearchParams({ weddingId: String(weddingId), src: source, width: String(signedDriveAsset ? driveWidth : width) });
    return `/api/image-variant?${query.toString()}`;
  }

  try {
    const url = new URL(source);
    if (url.protocol !== 'https:' || url.hostname.toLowerCase() !== UNSPLASH_IMAGE_HOST) return source;
    url.searchParams.set('w', String(width));
    url.searchParams.set('q', url.searchParams.get('q') || '82');
    url.searchParams.set('auto', url.searchParams.get('auto') || 'format');
    url.searchParams.set('fit', url.searchParams.get('fit') || 'crop');
    return url.toString();
  } catch {
    return source;
  }
}

/** Build browser-selectable image variants for Unsplash URLs. Other hosts keep their original URL. */
export function getResponsiveImageAttributes(
  source: string,
  sizes: string,
  weddingId?: number,
): { srcSet: string; sizes: string } | null {
  try {
    const localUpload = /^\/uploads\/[A-Za-z0-9._-]+$/.test(source);
    const signedDriveAsset = isSignedFullDriveAsset(source);
    let srcSet: string;

    if ((localUpload || signedDriveAsset) && Number.isSafeInteger(weddingId) && Number(weddingId) > 0) {
      srcSet = responsiveWidths.map((width) => {
        const query = new URLSearchParams({ weddingId: String(weddingId), src: source, width: String(width) });
        return `/api/image-variant?${query.toString()} ${width}w`;
      }).join(', ');
    } else {
      const url = new URL(source);
      if (url.protocol !== 'https:' || url.hostname.toLowerCase() !== UNSPLASH_IMAGE_HOST) return null;

      srcSet = responsiveWidths.map((width) => {
        return `${getOptimizedImageUrl(url.toString(), width)} ${width}w`;
      }).join(', ');
    }

    return { srcSet, sizes };
  } catch {
    return null;
  }
}
