import { parseDriveFolderUrl } from './driveFolder.ts';

export function getDrivePhotoFallbackTitle(fileName: string): string {
  const title = fileName.replace(/\.[^./\\]+$/, '').replace(/[_-]+/g, ' ').trim();
  return title || fileName.trim() || 'Foto';
}

export interface DrivePhotoTitleReference {
  id: string;
  assetUrl: string;
}

interface DriveBrowseResult {
  photos?: Array<{ id: string; fullUrl: string }>;
  folders?: Array<{ browseToken: string }>;
  nextPageToken?: string;
  error?: string;
}

export async function loadAllDrivePhotoTitleReferences(
  albumUrl: string | undefined,
  weddingId: number,
  onProgress?: (folderCount: number, photoCount: number) => void,
): Promise<DrivePhotoTitleReference[]> {
  const root = parseDriveFolderUrl(albumUrl);
  if (!root) return [];

  const pendingFolders: Array<string | undefined> = [undefined];
  const seenFolders = new Set<string>();
  const references: DrivePhotoTitleReference[] = [];
  const seenPhotos = new Set<string>();
  let processedFolders = 0;

  const loadFolder = async (browseToken?: string) => {
    let pageToken: string | undefined;
    let isFirstPage = true;
    const seenPageTokens = new Set<string>();
    do {
      const query = new URLSearchParams({ weddingId: String(weddingId) });
      if (browseToken) query.set('browseToken', browseToken);
      else if (root.resourceKey) query.set('resourceKey', root.resourceKey);
      if (pageToken) query.set('pageToken', pageToken);
      const response = await fetch(`/api/drive-folders/${encodeURIComponent(root.folderId)}/browse?${query.toString()}`);
      const result = await response.json() as DriveBrowseResult;
      if (!response.ok) throw new Error(result.error || 'No se pudieron preparar las fotos de Drive.');

      for (const photo of result.photos || []) {
        if (!photo.id || !photo.fullUrl || seenPhotos.has(photo.id)) continue;
        seenPhotos.add(photo.id);
        references.push({ id: photo.id, assetUrl: photo.fullUrl });
      }
      if (isFirstPage) {
        for (const child of result.folders || []) {
          if (child.browseToken && !seenFolders.has(child.browseToken)) {
            seenFolders.add(child.browseToken);
            pendingFolders.push(child.browseToken);
          }
        }
      }
      pageToken = result.nextPageToken;
      if (pageToken && seenPageTokens.has(pageToken)) throw new Error('Google Drive devolvió una página repetida. Recarga el álbum e inténtalo de nuevo.');
      if (pageToken) seenPageTokens.add(pageToken);
      isFirstPage = false;
      onProgress?.(processedFolders, references.length);
    } while (pageToken);
  };

  const worker = async () => {
    while (pendingFolders.length > 0) {
      const browseToken = pendingFolders.shift();
      await loadFolder(browseToken);
      processedFolders += 1;
      onProgress?.(processedFolders, references.length);
    }
  };

  await Promise.all(Array.from({ length: 4 }, () => worker()));
  return references;
}

export function parseDrivePhotoTitles(value?: string): Record<string, string> {
  try {
    const parsed: unknown = JSON.parse(value || '{}');
    if (!parsed || typeof parsed !== 'object' || Array.isArray(parsed)) return {};
    return Object.fromEntries(
      Object.entries(parsed).filter((entry): entry is [string, string] => typeof entry[1] === 'string'),
    );
  } catch {
    return {};
  }
}
