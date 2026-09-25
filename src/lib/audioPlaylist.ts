import { AudioTrack, WeddingSettings } from '../types.ts';

const legacyTrack = (settings: Pick<WeddingSettings, 'audioUrl' | 'audioTitle'>): AudioTrack[] =>
  settings.audioUrl
    ? [{ id: `legacy-${settings.audioUrl}`, title: settings.audioTitle || 'Pista principal', url: settings.audioUrl }]
    : [];

export function getAudioPlaylist(
  settings?: Pick<WeddingSettings, 'audioPlaylist' | 'audioUrl' | 'audioTitle'> | null,
): AudioTrack[] {
  if (!settings) return [];
  if (settings.audioPlaylist) {
    try {
      const parsed = JSON.parse(settings.audioPlaylist);
      if (Array.isArray(parsed)) {
        return parsed.filter((track): track is AudioTrack =>
          Boolean(track && typeof track.url === 'string' && track.url.trim()),
        ).map((track, index) => ({
          id: typeof track.id === 'string' && track.id ? track.id : `audio-${index}-${track.url}`,
          title: typeof track.title === 'string' && track.title.trim() ? track.title.trim() : 'Pista sin título',
          url: track.url,
        }));
      }
    } catch {
      // Old or malformed data falls back to the single legacy audio URL.
    }
  }
  return legacyTrack(settings);
}
