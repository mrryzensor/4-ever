import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { createPortal } from 'react-dom';
import {
  Check,
  ChevronLeft,
  ChevronRight,
  Folder,
  Images,
  Loader2,
  X,
} from 'lucide-react';
import type { WeddingSettings } from '../types.ts';
import { parseDriveFolderUrl } from '../lib/driveFolder.ts';
import type { DriveGalleryPhoto } from './DriveFolderPhotos.tsx';

type Destination = 'gallery' | 'hero';
type DriveFolder = { id: string; name: string; browseToken: string };
type BrowserResponse = {
  folderName?: string;
  folders?: DriveFolder[];
  photos?: DriveGalleryPhoto[];
  nextPageToken?: string;
  error?: string;
};

interface DrivePhotoPickerProps {
  settings: WeddingSettings;
  onChange: (updated: Partial<WeddingSettings>) => void;
  defaultDestination?: Destination;
  className?: string;
}

const parsePhotoIds = (value?: string): string[] => {
  try {
    const parsed = JSON.parse(value || '[]');
    return Array.isArray(parsed) ? parsed.filter((id): id is string => typeof id === 'string') : [];
  } catch {
    return [];
  }
};

const parseHeroPhotos = (settings: WeddingSettings): string[] => {
  try {
    const parsed = JSON.parse(settings.heroPhotos || '[]');
    if (Array.isArray(parsed)) return parsed.filter((url): url is string => typeof url === 'string' && Boolean(url));
  } catch {
    if (settings.heroPhotos?.includes(',')) {
      return settings.heroPhotos.split(',').map((url) => url.trim()).filter(Boolean);
    }
  }
  return settings.coverPhoto ? [settings.coverPhoto] : [];
};

export const DrivePhotoPicker: React.FC<DrivePhotoPickerProps> = ({
  settings,
  onChange,
  defaultDestination = 'gallery',
  className = '',
}) => {
  const folder = useMemo(() => parseDriveFolderUrl(settings.galleryExternalAlbumUrl), [settings.galleryExternalAlbumUrl]);
  const [isOpen, setIsOpen] = useState(false);
  const [destination, setDestination] = useState<Destination>(defaultDestination);
  const [trail, setTrail] = useState<Array<{ name: string; browseToken?: string }>>([{ name: 'Carpeta principal' }]);
  const [folders, setFolders] = useState<DriveFolder[]>([]);
  const [photos, setPhotos] = useState<DriveGalleryPhoto[]>([]);
  const [nextPageToken, setNextPageToken] = useState<string>();
  const [loading, setLoading] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);
  const [error, setError] = useState('');

  const selectionMode = settings.galleryDrivePhotoSelectionMode === 'selected' ? 'selected' : 'all';
  const galleryPhotoIds = useMemo(() => new Set(parsePhotoIds(settings.galleryDrivePhotoIds)), [settings.galleryDrivePhotoIds]);
  const heroPhotoUrls = useMemo(() => new Set(parseHeroPhotos(settings)), [settings.heroPhotos, settings.coverPhoto]);

  const loadFolder = useCallback(async (token: string | undefined, pageToken?: string, append = false) => {
    if (!folder) return;
    append ? setLoadingMore(true) : setLoading(true);
    setError('');
    try {
      const query = new URLSearchParams({ weddingId: String(settings.id || 1) });
      if (token) query.set('browseToken', token);
      else if (folder.resourceKey) query.set('resourceKey', folder.resourceKey);
      if (pageToken) query.set('pageToken', pageToken);
      const response = await fetch(`/api/drive-folders/${encodeURIComponent(folder.folderId)}/browse?${query}`);
      const result = await response.json() as BrowserResponse;
      if (!response.ok) throw new Error(result.error || 'No se pudo abrir esta carpeta de Drive.');
      setFolders(Array.isArray(result.folders) ? result.folders : []);
      setPhotos((current) => append ? [...current, ...(result.photos || [])] : (result.photos || []));
      setNextPageToken(result.nextPageToken);
    } catch (loadError) {
      setError(loadError instanceof Error ? loadError.message : 'No se pudo abrir esta carpeta de Drive.');
    } finally {
      setLoading(false);
      setLoadingMore(false);
    }
  }, [folder, settings.id]);

  const currentToken = trail[trail.length - 1]?.browseToken;
  useEffect(() => {
    if (isOpen && folder) void loadFolder(currentToken);
  }, [isOpen, folder, currentToken, loadFolder]);

  const openPicker = () => {
    setDestination(defaultDestination);
    setTrail([{ name: 'Carpeta principal' }]);
    setIsOpen(true);
  };

  const isPhotoSelected = (photo: DriveGalleryPhoto) => destination === 'gallery'
    ? selectionMode === 'all' ? !galleryPhotoIds.has(photo.id) : galleryPhotoIds.has(photo.id)
    : heroPhotoUrls.has(photo.fullUrl || photo.thumbnailUrl);

  const toggleGalleryPhoto = (photoId: string) => {
    const nextIds = new Set(galleryPhotoIds);
    if (selectionMode === 'all') {
      if (nextIds.has(photoId)) nextIds.delete(photoId);
      else nextIds.add(photoId);
    } else if (nextIds.has(photoId)) {
      nextIds.delete(photoId);
    } else {
      nextIds.add(photoId);
    }
    onChange({
      galleryDrivePhotoSelectionMode: selectionMode,
      galleryDrivePhotoIds: JSON.stringify([...nextIds]),
    });
  };

  const toggleHeroPhoto = (photo: DriveGalleryPhoto) => {
    const current = parseHeroPhotos(settings);
    const imageUrl = photo.fullUrl || photo.thumbnailUrl;
    const exists = current.includes(imageUrl);
    if (exists && current.length <= 1) return;
    const updated = exists
      ? current.filter((url) => url !== imageUrl)
      : [...current, imageUrl];
    const nextCover = settings.coverPhoto === imageUrl
      ? (updated[0] || '')
      : (settings.coverPhoto || updated[0] || '');
    onChange({ heroPhotos: JSON.stringify(updated), ...(nextCover ? { coverPhoto: nextCover } : {}) });
  };

  const setVisibleGalleryPhotos = (select: boolean) => {
    const nextIds = new Set(galleryPhotoIds);
    for (const photo of photos) {
      if (selectionMode === 'all') {
        if (select) nextIds.delete(photo.id);
        else nextIds.add(photo.id);
      } else if (select) {
        nextIds.add(photo.id);
      } else {
        nextIds.delete(photo.id);
      }
    }
    onChange({ galleryDrivePhotoSelectionMode: selectionMode, galleryDrivePhotoIds: JSON.stringify([...nextIds]) });
  };

  const activeGalleryCount = selectionMode === 'all'
    ? (galleryPhotoIds.size ? `Todas, menos ${galleryPhotoIds.size}` : 'Todas las fotos')
    : `${galleryPhotoIds.size} seleccionadas`;
  const activeHeroCount = `${heroPhotoUrls.size} en portada`;

  const modal = isOpen && typeof document !== 'undefined' ? createPortal(
    <div className="fixed inset-0 z-[120] flex items-center justify-center bg-stone-950/60 p-3 backdrop-blur-sm" onMouseDown={(event) => {
      if (event.target === event.currentTarget) setIsOpen(false);
    }}>
      <div className="flex max-h-[92vh] w-full max-w-5xl flex-col overflow-hidden rounded-2xl border border-[#E5E2D0] bg-[#FFFEF9] shadow-2xl">
        <header className="flex items-center justify-between gap-4 border-b border-[#E5E2D0] px-4 py-3 sm:px-6">
          <div className="flex min-w-0 items-center gap-3">
            <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#5A5A40]/10 text-[#5A5A40]"><Images className="h-5 w-5" /></span>
            <div className="min-w-0">
              <h3 className="font-serif text-lg font-bold text-stone-900">Elegir fotos de Google Drive</h3>
              <p className="truncate text-xs text-stone-500">Explora carpetas y subcarpetas del álbum compartido.</p>
            </div>
          </div>
          <button type="button" onClick={() => setIsOpen(false)} className="rounded-lg p-2 text-stone-500 hover:bg-stone-100" aria-label="Cerrar selector"><X className="h-5 w-5" /></button>
        </header>

        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-[#E5E2D0] px-4 py-3 sm:px-6">
          <div className="inline-flex rounded-xl border border-[#E5E2D0] bg-white p-1">
            <button type="button" onClick={() => setDestination('gallery')} className={`rounded-lg px-3 py-1.5 text-xs font-semibold ${destination === 'gallery' ? 'bg-[#5A5A40] text-white' : 'text-stone-600'}`}>
              Galería · {activeGalleryCount}
            </button>
            <button type="button" onClick={() => setDestination('hero')} className={`rounded-lg px-3 py-1.5 text-xs font-semibold ${destination === 'hero' ? 'bg-[#5A5A40] text-white' : 'text-stone-600'}`}>
              Hero · {activeHeroCount}
            </button>
          </div>
          <div className="flex flex-wrap gap-2">
            {destination === 'gallery' ? <>
              <button type="button" onClick={() => onChange({ galleryDrivePhotoSelectionMode: 'all', galleryDrivePhotoIds: '[]' })} className="rounded-lg border border-[#E5E2D0] bg-white px-3 py-1.5 text-xs font-semibold text-stone-700 hover:bg-stone-50">Marcar todas del álbum</button>
              <button type="button" onClick={() => onChange({ galleryDrivePhotoSelectionMode: 'selected', galleryDrivePhotoIds: '[]' })} className="rounded-lg border border-[#E5E2D0] bg-white px-3 py-1.5 text-xs font-semibold text-stone-700 hover:bg-stone-50">Desmarcar todas</button>
              {photos.length > 0 && <button type="button" onClick={() => setVisibleGalleryPhotos(!photos.every((photo) => isPhotoSelected(photo)))} className="rounded-lg border border-[#E5E2D0] bg-white px-3 py-1.5 text-xs text-stone-600 hover:bg-stone-50">{photos.every((photo) => isPhotoSelected(photo)) ? 'Desmarcar esta carpeta' : 'Marcar esta carpeta'}</button>}
            </> : <p className="self-center text-xs text-stone-500">Las fotos marcadas se agregan al pase automático de portada.</p>}
          </div>
        </div>

        <nav aria-label="Ruta de carpetas" className="flex items-center gap-1 overflow-x-auto border-b border-[#E5E2D0] px-4 py-2 text-xs sm:px-6">
          {trail.map((item, index) => <React.Fragment key={`${item.name}-${index}`}>
            {index > 0 && <ChevronRight className="h-3.5 w-3.5 shrink-0 text-stone-400" />}
            <button type="button" onClick={() => {
              if (index < trail.length - 1) {
                setTrail(trail.slice(0, index + 1));
                void loadFolder(item.browseToken);
              }
            }} className={`shrink-0 rounded-md px-1.5 py-1 ${index === trail.length - 1 ? 'font-semibold text-stone-900' : 'text-stone-500 hover:bg-stone-100'}`}>{item.name}</button>
          </React.Fragment>)}
        </nav>

        <main className="min-h-0 flex-1 overflow-y-auto p-4 sm:p-6">
          {!folder ? <div className="rounded-xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-900">Primero pega y guarda una URL de carpeta de Google Drive en la configuración del álbum.</div> : <>
            {error && <div role="alert" className="mb-4 rounded-xl border border-rose-200 bg-rose-50 p-3 text-sm text-rose-800">{error}</div>}
            {loading ? <div className="flex min-h-48 items-center justify-center gap-2 text-sm text-stone-500"><Loader2 className="h-5 w-5 animate-spin" />Cargando carpeta…</div> : <>
              {folders.length > 0 && <section className="mb-6">
                <h4 className="mb-2 text-[11px] font-bold uppercase tracking-wider text-stone-500">Carpetas ({folders.length})</h4>
                <div className="grid grid-cols-1 gap-2 sm:grid-cols-2 lg:grid-cols-3">
                  {folders.map((child) => <button type="button" key={child.id} onClick={() => {
                    setTrail((current) => [...current, { name: child.name, browseToken: child.browseToken }]);
                  }} className="flex min-w-0 items-center gap-2 rounded-xl border border-[#E5E2D0] bg-white px-3 py-2.5 text-left text-sm text-stone-700 hover:border-[#5A5A40] hover:bg-[#FAF9F0]">
                    <Folder className="h-4 w-4 shrink-0 text-[#9B7A37]" /><span className="truncate">{child.name}</span><ChevronRight className="ml-auto h-4 w-4 shrink-0 text-stone-400" />
                  </button>)}
                </div>
              </section>}
              {photos.length > 0 ? <section>
                <h4 className="mb-2 text-[11px] font-bold uppercase tracking-wider text-stone-500">Fotos de esta carpeta ({photos.length}{nextPageToken ? '+' : ''})</h4>
                <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
                  {photos.map((photo) => {
                    const selected = isPhotoSelected(photo);
                    return <button type="button" key={photo.id} onClick={() => destination === 'gallery' ? toggleGalleryPhoto(photo.id) : toggleHeroPhoto(photo)} className={`group relative aspect-square overflow-hidden rounded-xl border-2 text-left transition ${selected ? 'border-[#5A5A40] ring-2 ring-[#5A5A40]/15' : 'border-transparent hover:border-stone-300'}`} aria-pressed={selected} title={photo.name}>
                      <img src={photo.thumbnailUrl} alt={photo.name} loading="lazy" className="h-full w-full object-cover transition duration-300 group-hover:scale-105" />
                      <span className={`absolute right-2 top-2 flex h-6 w-6 items-center justify-center rounded-md shadow ${selected ? 'bg-[#5A5A40] text-white' : 'bg-white/90 text-stone-500'}`}><Check className="h-4 w-4" /></span>
                      <span className="absolute inset-x-0 bottom-0 truncate bg-gradient-to-t from-black/75 to-transparent px-2 pb-2 pt-6 text-[10px] text-white">{photo.name}</span>
                    </button>;
                  })}
                </div>
                {nextPageToken && <div className="mt-4 text-center"><button type="button" disabled={loadingMore} onClick={() => void loadFolder(currentToken, nextPageToken, true)} className="inline-flex items-center gap-2 rounded-xl border border-[#E5E2D0] bg-white px-4 py-2 text-xs font-semibold text-stone-700 disabled:opacity-50">{loadingMore && <Loader2 className="h-4 w-4 animate-spin" />}Cargar más fotos</button></div>}
              </section> : folders.length === 0 && <div className="flex min-h-40 flex-col items-center justify-center gap-2 text-center text-stone-500"><Images className="h-8 w-8 text-stone-300" /><p className="text-sm">Esta carpeta no contiene fotos ni subcarpetas.</p></div>}
            </>}
          </>}
        </main>
        <footer className="flex items-center justify-between gap-3 border-t border-[#E5E2D0] px-4 py-3 sm:px-6">
          <button type="button" disabled={trail.length <= 1} onClick={() => {
            const parentTrail = trail.slice(0, -1);
            setTrail(parentTrail);
            void loadFolder(parentTrail[parentTrail.length - 1]?.browseToken);
          }} className="inline-flex items-center gap-1 rounded-lg px-3 py-2 text-xs font-semibold text-stone-600 hover:bg-stone-100 disabled:opacity-40"><ChevronLeft className="h-4 w-4" />Carpeta anterior</button>
          <span className="text-[11px] text-stone-500">La configuración se guarda con “Guardar todo”.</span>
          <button type="button" onClick={() => setIsOpen(false)} className="rounded-lg bg-[#5A5A40] px-4 py-2 text-xs font-bold text-white">Listo</button>
        </footer>
      </div>
    </div>,
    document.body,
  ) : null;

  return <>
    <button type="button" onClick={openPicker} className={`inline-flex items-center justify-center gap-2 rounded-xl border border-[#5A5A40]/20 bg-white px-3.5 py-2 text-xs font-semibold text-[#484833] shadow-xs hover:bg-[#FAF9F0] ${className}`}>
      <Images className="h-4 w-4" />{defaultDestination === 'hero' ? 'Elegir fotos de Drive para el hero' : 'Elegir fotos de Drive'}
    </button>
    {modal}
  </>;
};
