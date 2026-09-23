import React, { useEffect, useMemo, useState } from 'react';
import { ExternalLink, Image as ImageIcon, LoaderCircle } from 'lucide-react';
import { EventType } from '../types.ts';
import { CARD_THEMES } from '../lib/themes.ts';
import { XV_CARD_THEMES } from '../xv/themes.ts';
import { parseDriveFolderUrl } from '../lib/driveFolder.ts';

interface DrivePhoto {
  id: string;
  name: string;
  thumbnailUrl: string;
  openUrl: string;
}

interface DriveFolderPhotosResponse {
  photos?: DrivePhoto[];
  nextPageToken?: string;
  error?: string;
  code?: string;
}

interface DriveFolderPhotosProps {
  folderUrl: string;
  title: string;
  cardStyle?: string;
  eventType: EventType;
  weddingId: number;
}

export const DriveFolderPhotos: React.FC<DriveFolderPhotosProps> = ({
  folderUrl,
  title,
  cardStyle = 'classic-gold',
  eventType,
  weddingId,
}) => {
  const folder = useMemo(() => parseDriveFolderUrl(folderUrl), [folderUrl]);
  const [photos, setPhotos] = useState<DrivePhoto[]>([]);
  const [nextPageToken, setNextPageToken] = useState<string | undefined>();
  const [loading, setLoading] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const theme = eventType === 'xv'
    ? (XV_CARD_THEMES[cardStyle] || XV_CARD_THEMES['romantic-floral'])
    : (CARD_THEMES[cardStyle] || CARD_THEMES['classic-gold']);
  const palette = theme.cardLayoutVariant;
  const isDark = ['dark-luxury', 'royal-navy', 'emerald-botanical'].includes(palette || '');

  useEffect(() => {
    if (!folder) {
      setPhotos([]);
      setNextPageToken(undefined);
      setError(null);
      setLoading(false);
      return;
    }

    const controller = new AbortController();
    const loadFirstPage = async () => {
      setLoading(true);
      setPhotos([]);
      setNextPageToken(undefined);
      setError(null);

      try {
        const query = new URLSearchParams();
        query.set('weddingId', String(weddingId));
        if (folder.resourceKey) query.set('resourceKey', folder.resourceKey);
        const queryString = query.toString();
        const response = await fetch(
          `/api/drive-folders/${encodeURIComponent(folder.folderId)}/photos${queryString ? `?${queryString}` : ''}`,
          { signal: controller.signal },
        );
        const result = await response.json() as DriveFolderPhotosResponse;
        if (!response.ok) throw new Error(result.error || 'No se pudieron cargar las fotos de Drive.');
        setPhotos(Array.isArray(result.photos) ? result.photos : []);
        setNextPageToken(result.nextPageToken);
      } catch (loadError) {
        if (!controller.signal.aborted) {
          setError(loadError instanceof Error ? loadError.message : 'No se pudieron cargar las fotos de Drive.');
        }
      } finally {
        if (!controller.signal.aborted) setLoading(false);
      }
    };

    void loadFirstPage();
    return () => controller.abort();
  }, [folder, weddingId]);

  const loadMore = async () => {
    if (!folder || !nextPageToken || loadingMore) return;
    setLoadingMore(true);
    setError(null);

    try {
      const query = new URLSearchParams({ pageToken: nextPageToken, weddingId: String(weddingId) });
      if (folder.resourceKey) query.set('resourceKey', folder.resourceKey);
      const response = await fetch(
        `/api/drive-folders/${encodeURIComponent(folder.folderId)}/photos?${query.toString()}`,
      );
      const result = await response.json() as DriveFolderPhotosResponse;
      if (!response.ok) throw new Error(result.error || 'No se pudieron cargar más fotos.');
      setPhotos((current) => [...current, ...(Array.isArray(result.photos) ? result.photos : [])]);
      setNextPageToken(result.nextPageToken);
    } catch (loadError) {
      setError(loadError instanceof Error ? loadError.message : 'No se pudieron cargar más fotos.');
    } finally {
      setLoadingMore(false);
    }
  };

  if (!folder) return null;

  return (
    <section className="mx-auto mb-10 w-full max-w-7xl px-4 sm:px-8" aria-label={title || 'Fotos compartidas desde Google Drive'}>
      <div className={`rounded-3xl border p-4 sm:p-6 ${theme.cardBgClass} ${theme.cardShapeClass || 'rounded-3xl'} ${theme.cardBorderDecoration || 'shadow-sm'}`}>
        <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
          <div className="flex min-w-0 items-center gap-3">
            <div className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border ${theme.accentClass}`}>
              <ImageIcon className="h-5 w-5" style={{ color: theme.accentColorHex }} />
            </div>
            <div className="min-w-0 text-left">
              <h3 className={`truncate font-serif text-lg font-semibold ${theme.textPrimaryClass}`}>
                {title.trim() || 'Fotos compartidas'}
              </h3>
              <p className={`text-xs ${isDark ? 'text-stone-300' : 'text-stone-500'}`}>
                Fotos cargadas directamente desde la carpeta compartida.
              </p>
            </div>
          </div>
          <span className={`rounded-full border px-3 py-1 text-[10px] font-semibold ${theme.accentClass}`}>
            {photos.length} {photos.length === 1 ? 'foto' : 'fotos'}
          </span>
        </div>

        {loading ? (
          <div className={`flex items-center justify-center gap-2 py-10 text-sm ${isDark ? 'text-stone-300' : 'text-stone-500'}`}>
            <LoaderCircle className="h-4 w-4 animate-spin" /> Consultando carpeta compartida…
          </div>
        ) : error ? (
          <div className={`rounded-2xl border border-dashed p-5 text-center text-xs ${isDark ? 'border-stone-600 text-stone-300' : 'border-[#E5E2D0] text-stone-600'}`} role="status">
            {error} El enlace para abrir la carpeta sigue disponible arriba.
          </div>
        ) : photos.length === 0 ? (
          <div className={`rounded-2xl border border-dashed p-5 text-center text-xs ${isDark ? 'border-stone-600 text-stone-300' : 'border-[#E5E2D0] text-stone-600'}`}>
            No encontramos imágenes compartidas en esta carpeta.
          </div>
        ) : (
          <>
            <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 sm:gap-3 md:grid-cols-4 lg:grid-cols-5">
              {photos.map((photo) => (
                <a
                  key={photo.id}
                  href={photo.openUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={`group relative aspect-square overflow-hidden rounded-2xl border ${isDark ? 'border-stone-600 bg-stone-900' : 'border-[#E5E2D0] bg-[#FAF9F0]'}`}
                  title={`Abrir ${photo.name} en Google Drive`}
                >
                  <img
                    src={photo.thumbnailUrl}
                    alt={photo.name}
                    loading="lazy"
                    referrerPolicy="no-referrer"
                    className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                  />
                  <span className="absolute inset-x-0 bottom-0 flex translate-y-full items-center justify-center gap-1.5 bg-black/65 px-2 py-2 text-[10px] font-semibold text-white transition-transform group-hover:translate-y-0 group-focus-visible:translate-y-0">
                    Abrir en Drive <ExternalLink className="h-3 w-3" />
                  </span>
                </a>
              ))}
            </div>
            {nextPageToken && (
              <div className="mt-5 text-center">
                <button
                  type="button"
                  onClick={() => void loadMore()}
                  disabled={loadingMore}
                  className={`inline-flex items-center gap-2 rounded-xl border px-4 py-2 text-xs font-semibold disabled:opacity-60 ${theme.accentClass}`}
                >
                  {loadingMore && <LoaderCircle className="h-3.5 w-3.5 animate-spin" />}
                  Cargar más fotos
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </section>
  );
};
