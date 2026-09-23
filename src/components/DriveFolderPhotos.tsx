import { useCallback, useEffect, useMemo, useState } from 'react';
import { parseDriveFolderUrl } from '../lib/driveFolder.ts';

export interface DriveGalleryPhoto {
  id: string;
  name: string;
  thumbnailUrl: string;
  openUrl: string;
}

interface DriveFolderPhotosResponse {
  photos?: DriveGalleryPhoto[];
  nextPageToken?: string;
  error?: string;
}

export function useDriveFolderPhotos(folderUrl: string | undefined, weddingId: number) {
  const folder = useMemo(() => parseDriveFolderUrl(folderUrl), [folderUrl]);
  const [photos, setPhotos] = useState<DriveGalleryPhoto[]>([]);
  const [nextPageToken, setNextPageToken] = useState<string>();
  const [loading, setLoading] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);
  const [error, setError] = useState<string | null>(null);

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
        const query = new URLSearchParams({ weddingId: String(weddingId) });
        if (folder.resourceKey) query.set('resourceKey', folder.resourceKey);
        const response = await fetch(
          `/api/drive-folders/${encodeURIComponent(folder.folderId)}/photos?${query.toString()}`,
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

  const loadMore = useCallback(async () => {
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
  }, [folder, loadingMore, nextPageToken, weddingId]);

  return {
    photos,
    loading,
    loadingMore,
    error,
    hasMore: Boolean(nextPageToken),
    isDriveFolder: Boolean(folder),
    loadMore,
  };
}
