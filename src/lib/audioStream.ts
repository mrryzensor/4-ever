/**
 * Helper utility to ensure audio is always played via HTTP streaming (HTTP 206 Range)
 * with Content-Disposition: inline, completely preventing file downloads.
 */
export function getStreamAudioUrl(url?: string): string {
  if (!url || typeof url !== 'string') return '';
  const trimmed = url.trim();
  if (!trimmed) return '';

  // Already using the streaming endpoint
  if (trimmed.startsWith('/api/audio/stream')) {
    return trimmed;
  }

  // Local static audio in public/audio or uploads
  if (trimmed.startsWith('/audio/') || trimmed.startsWith('audio/')) {
    const pathWithSlash = trimmed.startsWith('/') ? trimmed : `/${trimmed}`;
    return `/api/audio/stream?url=${encodeURIComponent(pathWithSlash)}`;
  }

  if (trimmed.startsWith('/uploads/') || trimmed.startsWith('uploads/')) {
    const pathWithSlash = trimmed.startsWith('/') ? trimmed : `/${trimmed}`;
    return `/api/audio/stream?url=${encodeURIComponent(pathWithSlash)}`;
  }

  // Remote HTTP/HTTPS audio (e.g. Pixabay or external audio files)
  if (trimmed.startsWith('http://') || trimmed.startsWith('https://')) {
    return `/api/audio/stream?url=${encodeURIComponent(trimmed)}`;
  }

  return trimmed;
}
