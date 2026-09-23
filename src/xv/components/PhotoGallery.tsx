import React, { useState, useEffect, useRef, useMemo, useCallback } from 'react';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence } from 'motion/react';
import {
  Camera,
  Heart,
  ExternalLink,
  Loader2,
  X,
  Sparkles,
  ChevronLeft,
  ChevronRight,
  ChevronDown,
  ChevronUp,
  Share2,
  MessageCircle,
  Send,
  User,
  Trash2,
  Upload,
  Plus,
  Clipboard,
  CheckCircle2,
  Play,
  Pause,
} from 'lucide-react';
import { GalleryPhoto, PhotoComment, WeddingSettings } from '../../types.ts';
import { AnimatedCameraLens, StyleSpecificDivider } from './AnimatedSvgs.tsx';
import { CARD_THEMES } from '../../lib/themes.ts';
import { optimizeImageClient } from '../../lib/mediaOptimizer.ts';
import { useDriveFolderPhotos } from '../../components/DriveFolderPhotos.tsx';

type CarouselPhoto = GalleryPhoto & { driveOpenUrl?: string; driveFileId?: string; driveInteractionToken?: string; responsiveUrls?: Record<640 | 960 | 1440 | 1920, string> };

const DRIVE_IMAGE_WIDTHS = [640, 960, 1440, 1920] as const;
const getCarouselPhotoLoadKey = (photo: CarouselPhoto) =>
  photo.driveFileId || `gallery:${photo.weddingId}:${photo.id}`;
const getCarouselImageAttributes = (photo: CarouselPhoto) => photo.responsiveUrls ? ({
  src: photo.responsiveUrls[1920] || photo.url,
  srcSet: DRIVE_IMAGE_WIDTHS.map((width) => `${photo.responsiveUrls![width]} ${width}w`).join(', '),
  sizes: '(max-width: 640px) 94vw, (max-width: 1280px) 84vw, 1500px',
}) : ({ src: photo.url });

const preloadCarouselImage = (photo: CarouselPhoto) => new Promise<void>((resolve, reject) => {
  const image = new Image();
  const attributes = getCarouselImageAttributes(photo);
  let settled = false;
  const finish = async () => {
    if (settled) return;
    if (!image.naturalWidth) {
      settled = true;
      reject(new Error('La imagen no pudo cargarse'));
      return;
    }
    try { await image.decode(); } catch { /* onload confirms the bytes arrived */ }
    if (!settled) {
      settled = true;
      resolve();
    }
  };
  image.onload = () => { void finish(); };
  image.onerror = () => {
    if (!settled) {
      settled = true;
      reject(new Error('La imagen no pudo cargarse'));
    }
  };
  image.referrerPolicy = 'no-referrer';
  image.sizes = attributes.sizes || '';
  image.srcset = attributes.srcSet || '';
  image.src = attributes.src;
  if (image.complete) void finish();
});

interface PhotoGalleryProps {
  weddingId?: number;
  guestName?: string;
  guestCode?: string;
  cardStyle?: string;
  externalAlbumUrl?: string;
  externalAlbumTitle?: string;
  externalAlbumType?: string;
  isAdmin?: boolean;
  settings?: WeddingSettings;
}

export const PhotoGallery: React.FC<PhotoGalleryProps> = ({
  weddingId = 1,
  guestName = '',
  guestCode = '',
  cardStyle = 'classic-gold',
  externalAlbumUrl,
  isAdmin = false,
  settings,
}) => {
  const effectiveAlbumUrl = externalAlbumUrl || settings?.galleryExternalAlbumUrl;
  const driveGallery = useDriveFolderPhotos(effectiveAlbumUrl, weddingId);
  const drivePhotoSelectionMode = settings?.galleryDrivePhotoSelectionMode === 'selected' ? 'selected' : 'all';
  const drivePhotoSelectionIds = useMemo(() => {
    try {
      const ids = JSON.parse(settings?.galleryDrivePhotoIds || '[]');
      return new Set(Array.isArray(ids) ? ids.filter((id): id is string => typeof id === 'string') : []);
    } catch {
      return new Set<string>();
    }
  }, [settings?.galleryDrivePhotoIds]);
  const [photos, setPhotos] = useState<GalleryPhoto[]>([]);
  const [loading, setLoading] = useState(true);
  const [activePhotoIndex, setActivePhotoIndex] = useState<number | null>(null);
  const thumbnailRailRef = useRef<HTMLDivElement>(null);
  const landingThumbnailRailRef = useRef<HTMLDivElement>(null);
  const [mobileCommentsOpen, setMobileCommentsOpen] = useState(false);

  // Close mobile comments drawer whenever active photo changes so the photo is protagonist
  useEffect(() => {
    setMobileCommentsOpen(false);
  }, [activePhotoIndex]);

  // Comments state for the active photo
  const [comments, setComments] = useState<PhotoComment[]>([]);
  const [loadingComments, setLoadingComments] = useState(false);
  const [newCommentText, setNewCommentText] = useState('');
  const [authorInputName, setAuthorInputName] = useState(guestName || '');
  const [isSubmittingComment, setIsSubmittingComment] = useState(false);
  const [likedPhotoIds, setLikedPhotoIds] = useState<number[]>([]);
  const [likedDrivePhotoIds, setLikedDrivePhotoIds] = useState<string[]>([]);
  const [drivePhotoLikesById, setDrivePhotoLikesById] = useState<Record<string, number>>({});
  const [drivePhotoCommentsById, setDrivePhotoCommentsById] = useState<Record<string, PhotoComment[]>>({});
  const [photoCommentsMap, setPhotoCommentsMap] = useState<Record<number, PhotoComment[]>>({});

  const carouselPhotos = useMemo<CarouselPhoto[]>(() => [
    ...photos,
    ...driveGallery.photos
      .filter((photo) => drivePhotoSelectionMode === 'all'
        ? !drivePhotoSelectionIds.has(photo.id)
        : drivePhotoSelectionIds.has(photo.id))
      .map((photo, index) => ({
      id: -(index + 1),
      weddingId,
      url: photo.fullUrl || photo.thumbnailUrl,
      thumbnailUrl: photo.thumbnailUrl,
      caption: photo.name,
      authorName: 'Carpeta compartida',
      category: 'recuerdos' as const,
      likesCount: 0,
      approved: true,
      createdAt: '',
      driveOpenUrl: photo.openUrl,
      driveFileId: photo.id,
      driveInteractionToken: photo.interactionToken,
      responsiveUrls: photo.responsiveUrls,
    })),
  ], [driveGallery.photos, drivePhotoSelectionIds, drivePhotoSelectionMode, photos, weddingId]);

  const activePhoto = activePhotoIndex !== null && carouselPhotos[activePhotoIndex] ? carouselPhotos[activePhotoIndex] : null;
  const getCommentsForPhoto = (photo?: CarouselPhoto | null) => photo
    ? photo.driveFileId ? drivePhotoCommentsById[photo.driveFileId] || [] : photoCommentsMap[photo.id] || []
    : [];
  const getLikesCountForPhoto = (photo: CarouselPhoto) => photo.driveFileId
    ? drivePhotoLikesById[photo.driveFileId] ?? photo.likesCount ?? 0
    : photo.likesCount || 0;
  const hasLikedPhoto = (photo: CarouselPhoto) => photo.driveFileId
    ? likedDrivePhotoIds.includes(photo.driveFileId)
    : likedPhotoIds.includes(photo.id);

  useEffect(() => {
    if (activePhotoIndex === null) return;
    const rail = thumbnailRailRef.current;
    const thumbnail = rail?.querySelector<HTMLElement>(`[data-thumbnail-index="${activePhotoIndex}"]`);
    if (!rail || !thumbnail) return;
    const offset = thumbnail.getBoundingClientRect().left - rail.getBoundingClientRect().left;
    rail.scrollTo({
      left: Math.max(0, rail.scrollLeft + offset - (rail.clientWidth - thumbnail.clientWidth) / 2),
      behavior: 'smooth',
    });
  }, [activePhotoIndex, carouselPhotos.length]);

  const scrollThumbnailRail = (direction: -1 | 1) => {
    if (!thumbnailRailRef.current) return;
    thumbnailRailRef.current.scrollBy({
      left: direction * Math.max(220, thumbnailRailRef.current.clientWidth * 0.75),
      behavior: 'smooth',
    });
  };

  const scrollLandingThumbnailRail = (direction: -1 | 1) => {
    if (!landingThumbnailRailRef.current) return;
    landingThumbnailRailRef.current.scrollBy({
      left: direction * Math.max(220, landingThumbnailRailRef.current.clientWidth * 0.75),
      behavior: 'smooth',
    });
  };

  // Fetch comments when active photo changes
  useEffect(() => {
    if (!activePhoto) {
      setComments([]);
      return;
    }
    let cancelled = false;
    setComments([]);

    const fetchComments = async () => {
      try {
        setLoadingComments(true);
        if (activePhoto.driveFileId) {
          if (!driveGallery.folderId || !activePhoto.driveInteractionToken) { setComments([]); return; }
          const query = new URLSearchParams({ weddingId: String(weddingId), signature: activePhoto.driveInteractionToken });
          const res = await fetch(`/api/drive-folders/${encodeURIComponent(driveGallery.folderId)}/photos/${encodeURIComponent(activePhoto.driveFileId)}/interactions?${query}`);
          if (!res.ok) throw new Error('No se pudieron cargar las interacciones de Drive.');
          const data = await res.json() as { likesCount?: number; comments?: PhotoComment[] };
          if (cancelled) return;
          const driveComments = Array.isArray(data.comments) ? data.comments : [];
          setComments(driveComments);
          setDrivePhotoCommentsById((prev) => ({ ...prev, [activePhoto.driveFileId!]: driveComments }));
          setDrivePhotoLikesById((prev) => ({ ...prev, [activePhoto.driveFileId!]: Number(data.likesCount) || 0 }));
        } else {
          const res = await fetch(`/api/gallery/${activePhoto.id}/comments?weddingId=${weddingId}`);
          const data = await res.json();
          if (cancelled) return;
          if (Array.isArray(data)) {
            setComments(data);
            setPhotoCommentsMap((prev) => ({ ...prev, [activePhoto.id]: data }));
          }
        }
      } catch (err) {
        if (!cancelled) console.error('Error loading comments:', err);
      } finally {
        if (!cancelled) setLoadingComments(false);
      }
    };

    void fetchComments();
    return () => { cancelled = true; };
  }, [activePhoto?.id, activePhoto?.driveFileId, activePhoto?.driveInteractionToken, driveGallery.folderId, weddingId]);

  // Bulk load comments for all photos to animate during auto-play
  useEffect(() => {
    const fetchAllComments = async () => {
      try {
        const res = await fetch(`/api/gallery-comments?weddingId=${weddingId}`);
        const data = await res.json();
        if (Array.isArray(data)) {
          const map: Record<number, PhotoComment[]> = {};
          data.forEach((c: PhotoComment) => {
            if (!map[c.photoId]) map[c.photoId] = [];
            map[c.photoId].push(c);
          });
          setPhotoCommentsMap(map);
        }
      } catch (err) {
        console.error('Error loading all gallery comments:', err);
      }
    };

    fetchAllComments();
  }, [weddingId]);

  // Update guest default name if props update
  useEffect(() => {
    if (guestName && !authorInputName) {
      setAuthorInputName(guestName);
    }
  }, [guestName]);

  const handlePrevPhoto = (e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    if (carouselPhotos.length === 0) return;
    setActivePhotoIndex((prev) => (prev === null || prev === 0 ? carouselPhotos.length - 1 : prev - 1));
  };

  const handleNextPhoto = (e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    if (carouselPhotos.length === 0) return;
    setActivePhotoIndex((prev) => (prev === null || prev === carouselPhotos.length - 1 ? 0 : prev + 1));
  };

  // Keyboard arrow navigation (Left / Right / Escape)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Do not trigger arrow navigation if user is typing in comment input/textarea
      const target = e.target as HTMLElement;
      if (target && (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA')) {
        return;
      }

      if (activePhotoIndex === null) return;
      if (e.key === 'ArrowLeft') {
        e.preventDefault();
        handlePrevPhoto();
      } else if (e.key === 'ArrowRight') {
        e.preventDefault();
        handleNextPhoto();
      } else if (e.key === 'Escape') {
        e.preventDefault();
        setActivePhotoIndex(null);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [activePhotoIndex, carouselPhotos.length]);


  const fetchPhotos = async () => {
    try {
      setLoading(true);
      const url = `/api/gallery?weddingId=${weddingId}`;
      const res = await fetch(url);
      const data = await res.json();
      if (Array.isArray(data)) {
        setPhotos(data);
      }
    } catch (err) {
      console.error('Error loading gallery photos:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPhotos();
  }, [weddingId]);

  const handleLike = async (photo: CarouselPhoto, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    if (photo.driveFileId) {
      if (likedDrivePhotoIds.includes(photo.driveFileId) || !driveGallery.folderId || !photo.driveInteractionToken) return;
      const fileId = photo.driveFileId;
      setLikedDrivePhotoIds((prev) => [...prev, fileId]);
      setDrivePhotoLikesById((prev) => ({ ...prev, [fileId]: (prev[fileId] ?? photo.likesCount ?? 0) + 1 }));
      const query = new URLSearchParams({ weddingId: String(weddingId), signature: photo.driveInteractionToken });
      try {
        const response = await fetch(`/api/drive-folders/${encodeURIComponent(driveGallery.folderId)}/photos/${encodeURIComponent(fileId)}/like?${query}`, { method: 'POST' });
        if (!response.ok) throw new Error('No se pudo registrar el “Me gusta”.');
        const data = await response.json() as { likesCount?: number };
        setDrivePhotoLikesById((prev) => ({ ...prev, [fileId]: Number(data.likesCount) || prev[fileId] || 0 }));
      } catch (err) {
        setLikedDrivePhotoIds((prev) => prev.filter((id) => id !== fileId));
        setDrivePhotoLikesById((prev) => ({ ...prev, [fileId]: Math.max(0, (prev[fileId] || 1) - 1) }));
        console.error('Error liking Drive photo:', err);
      }
      return;
    }
    const photoId = photo.id;
    if (likedPhotoIds.includes(photoId)) return; // Prevent multiple likes in session

    setLikedPhotoIds((prev) => [...prev, photoId]);
    // Optimistic UI update
    setPhotos((prev) =>
      prev.map((p) => (p.id === photoId ? { ...p, likesCount: (p.likesCount || 0) + 1 } : p))
    );

    try {
      await fetch(`/api/gallery/${photoId}/like`, { method: 'POST' });
    } catch (err) {
      console.error('Error liking photo:', err);
    }
  };

  const handleAddComment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!activePhoto || !newCommentText.trim() || isSubmittingComment) return;

    const guestDisplayName = authorInputName.trim() || 'Invitado Especial';
    const payload = {
      guestName: guestDisplayName,
      guestCode: guestCode || null,
      message: newCommentText.trim(),
      weddingId,
    };

    try {
      setIsSubmittingComment(true);
      const url = activePhoto.driveFileId && driveGallery.folderId && activePhoto.driveInteractionToken
        ? `/api/drive-folders/${encodeURIComponent(driveGallery.folderId)}/photos/${encodeURIComponent(activePhoto.driveFileId)}/comments?${new URLSearchParams({ weddingId: String(weddingId), signature: activePhoto.driveInteractionToken })}`
        : `/api/gallery/${activePhoto.id}/comments`;
      const res = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      if (!res.ok) throw new Error('No se pudo guardar el comentario.');
      const createdComment = await res.json();
      if (createdComment && createdComment.id) {
        setComments((prev) => [...prev, createdComment]);
        if (activePhoto.driveFileId) {
          setDrivePhotoCommentsById((prev) => ({ ...prev, [activePhoto.driveFileId!]: [...(prev[activePhoto.driveFileId!] || []), createdComment] }));
        } else {
          setPhotoCommentsMap((prev) => ({ ...prev, [activePhoto.id]: [...(prev[activePhoto.id] || []), createdComment] }));
        }
        setNewCommentText('');
      }
    } catch (err) {
      console.error('Error submitting comment:', err);
    } finally {
      setIsSubmittingComment(false);
    }
  };

  // Guest photo upload state & handlers (with AVIF 95% + Paste + Drag & Drop support)
  const [isUploadingPhoto, setIsUploadingPhoto] = useState(false);
  const [uploadMessage, setUploadMessage] = useState<string | null>(null);
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [uploadCaption, setUploadCaption] = useState('');
  const [isDraggingPhoto, setIsDraggingPhoto] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const processGuestPhotoFile = async (file: File) => {
    if (!file.type.startsWith('image/')) return;

    try {
      setIsUploadingPhoto(true);
      setUploadMessage('Optimizando fotografía a formato AVIF (95% compresión)...');

      const optimized = await optimizeImageClient(file, {
        maxDimension: 1920,
        quality: 0.72,
        preferredFormat: 'avif',
      });

      setUploadMessage('Subiendo fotografía optimizada...');
      const formData = new FormData();
      formData.append('file', optimized.file);

      let finalUrl = '';
      const uploadRes = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      });

      if (uploadRes.ok) {
        const uploadData = await uploadRes.json();
        finalUrl = uploadData.url;
      } else {
        finalUrl = URL.createObjectURL(optimized.file);
      }

      setUploadMessage('Registrando en la galería...');
      const payload = {
        weddingId,
        url: finalUrl,
        caption: uploadCaption.trim() || 'Recuerdo compartido',
        authorName: authorInputName.trim() || guestName || 'Invitado Especial',
        guestCode: guestCode || null,
        likesCount: 0,
        type: 'photo',
      };

      const saveRes = await fetch('/api/gallery', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const newPhoto = await saveRes.json();
      if (newPhoto && newPhoto.id) {
        setPhotos((prev) => [newPhoto, ...prev]);
        setUploadMessage('¡Fotografía añadida a la galería con éxito!');
        setTimeout(() => {
          setUploadMessage(null);
          setShowUploadModal(false);
          setUploadCaption('');
        }, 1500);
      }
    } catch (err) {
      console.error('Error uploading guest photo:', err);
      setUploadMessage('Error al subir la fotografía. Por favor intenta de nuevo.');
      setTimeout(() => setUploadMessage(null), 3000);
    } finally {
      setIsUploadingPhoto(false);
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      processGuestPhotoFile(file);
    }
  };

  // Clipboard paste listener in PhotoGallery
  useEffect(() => {
    const handlePaste = (e: ClipboardEvent) => {
      // If user is typing in a text input or textarea, don't capture unless it's an image file
      const target = e.target as HTMLElement;
      if (target && (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA')) {
        const items = e.clipboardData?.items;
        if (!items) return;
        for (let i = 0; i < items.length; i++) {
          if (items[i].type.startsWith('image/')) {
            const file = items[i].getAsFile();
            if (file) {
              e.preventDefault();
              setShowUploadModal(true);
              processGuestPhotoFile(file);
              break;
            }
          }
        }
        return;
      }

      const items = e.clipboardData?.items;
      if (!items) return;
      for (let i = 0; i < items.length; i++) {
        if (items[i].type.startsWith('image/')) {
          const file = items[i].getAsFile();
          if (file) {
            e.preventDefault();
            setShowUploadModal(true);
            processGuestPhotoFile(file);
            break;
          }
        }
      }
    };

    window.addEventListener('paste', handlePaste);
    return () => window.removeEventListener('paste', handlePaste);
  }, [weddingId, authorInputName, guestName, guestCode, uploadCaption]);

  const isDark = cardStyle === 'dark-luxury';
  const activeTheme = CARD_THEMES[cardStyle as keyof typeof CARD_THEMES] || CARD_THEMES['classic-gold'];

  const [carouselIndex, setCarouselIndex] = useState(0);
  const [isAutoPlay, setIsAutoPlay] = useState(true);
  const [isHovered, setIsHovered] = useState(false);
  const [photoRatios, setPhotoRatios] = useState<Record<number, number>>({});
  const [loadedCarouselPhotoKeys, setLoadedCarouselPhotoKeys] = useState<string[]>([]);
  const [isLoadingNextPhoto, setIsLoadingNextPhoto] = useState(false);
  const [carouselLoadError, setCarouselLoadError] = useState(false);
  const carouselNavigationRequestRef = useRef(0);
  const autoplayIntervalMs = Math.max(2, Number(settings?.heroAutoplayInterval) || 5) * 1000;
  const currentCarouselPhoto = carouselPhotos[carouselIndex] || carouselPhotos[0];
  const currentCarouselPhotoKey = currentCarouselPhoto ? getCarouselPhotoLoadKey(currentCarouselPhoto) : null;
  const isCurrentCarouselPhotoLoaded = !currentCarouselPhotoKey || loadedCarouselPhotoKeys.includes(currentCarouselPhotoKey);

  const navigateToCarouselPhoto = useCallback(async (nextIndex: number) => {
    const targetPhoto = carouselPhotos[nextIndex];
    if (!targetPhoto) return;
    const requestId = ++carouselNavigationRequestRef.current;
    const targetKey = getCarouselPhotoLoadKey(targetPhoto);
    setCarouselLoadError(false);

    if (!loadedCarouselPhotoKeys.includes(targetKey)) {
      setIsLoadingNextPhoto(true);
      try {
        await preloadCarouselImage(targetPhoto);
      } catch {
        if (requestId === carouselNavigationRequestRef.current) {
          setIsLoadingNextPhoto(false);
          setCarouselLoadError(true);
        }
        return;
      }
      if (requestId !== carouselNavigationRequestRef.current) return;
      setLoadedCarouselPhotoKeys((previous) => previous.includes(targetKey) ? previous : [...previous, targetKey]);
    }

    if (requestId !== carouselNavigationRequestRef.current) return;
    setCarouselIndex(nextIndex);
    setIsLoadingNextPhoto(false);
  }, [carouselPhotos, loadedCarouselPhotoKeys]);

  useEffect(() => {
    const visibleIndex = activePhotoIndex ?? carouselIndex;
    const rail = landingThumbnailRailRef.current;
    const thumbnail = rail?.querySelector<HTMLElement>(`[data-gallery-thumbnail-index="${visibleIndex}"]`);
    if (!rail || !thumbnail) return;
    const offset = thumbnail.getBoundingClientRect().left - rail.getBoundingClientRect().left;
    rail.scrollTo({
      left: Math.max(0, rail.scrollLeft + offset - (rail.clientWidth - thumbnail.clientWidth) / 2),
      behavior: 'smooth',
    });
  }, [activePhotoIndex, carouselIndex, carouselPhotos.length]);

  // Start a fresh configured interval only after the current image is fully loaded.
  useEffect(() => {
    if (!isAutoPlay || isHovered || carouselPhotos.length <= 1 || activePhotoIndex !== null || isLoadingNextPhoto || carouselLoadError || !isCurrentCarouselPhotoLoaded) return;
    const timer = setTimeout(() => {
      void navigateToCarouselPhoto(carouselIndex === carouselPhotos.length - 1 ? 0 : carouselIndex + 1);
    }, autoplayIntervalMs);
    return () => clearTimeout(timer);
  }, [isAutoPlay, isHovered, carouselPhotos.length, activePhotoIndex, carouselIndex, autoplayIntervalMs, isLoadingNextPhoto, carouselLoadError, isCurrentCarouselPhotoLoaded, navigateToCarouselPhoto]);

  useEffect(() => {
    setCarouselIndex(0);
    setActivePhotoIndex(null);
    setLoadedCarouselPhotoKeys([]);
    setIsLoadingNextPhoto(false);
    setCarouselLoadError(false);
    carouselNavigationRequestRef.current += 1;
  }, [weddingId, effectiveAlbumUrl]);

  useEffect(() => {
    if (carouselIndex >= carouselPhotos.length) void navigateToCarouselPhoto(0);
  }, [carouselIndex, carouselPhotos.length, navigateToCarouselPhoto]);

  const handleImageLoad = async (photoId: number, e: React.SyntheticEvent<HTMLImageElement>) => {
    const img = e.currentTarget;
    if (img.naturalWidth && img.naturalHeight) {
      const ratio = img.naturalWidth / img.naturalHeight;
      setPhotoRatios((prev) => ({ ...prev, [photoId]: ratio }));
      const photo = carouselPhotos.find((item) => item.id === photoId);
      if (photo) {
        try { await img.decode(); } catch { /* onLoad already confirms the image bytes arrived */ }
        const photoKey = getCarouselPhotoLoadKey(photo);
        setLoadedCarouselPhotoKeys((prev) => prev.includes(photoKey) ? prev : [...prev, photoKey]);
      }
    }
  };

  const handlePrevCarousel = () => {
    if (carouselPhotos.length === 0) return;
    void navigateToCarouselPhoto(carouselIndex === 0 ? carouselPhotos.length - 1 : carouselIndex - 1);
  };

  const handleNextCarousel = () => {
    if (carouselPhotos.length === 0) return;
    void navigateToCarouselPhoto(carouselIndex === carouselPhotos.length - 1 ? 0 : carouselIndex + 1);
  };

  return (
    <section className="w-full px-4 sm:px-8 md:px-12 lg:px-16 py-10 sm:py-14 bg-transparent" id="galeria">
      <div className="max-w-4xl mx-auto text-center mb-8 sm:mb-10">
        <div className={`w-14 h-14 rounded-2xl flex items-center justify-center mx-auto mb-3 border shadow-xs ${isDark
            ? 'bg-[#C5A059]/15 text-[#C5A059] border-[#5A5A40]/60'
            : 'bg-[#5A5A40]/10 text-[#5A5A40] border-[#E5E2D0]'
          }`}>
          <AnimatedCameraLens className="w-10 h-10" />
        </div>
        <span className={`text-xs uppercase tracking-[0.3em] font-semibold block mb-2 ${isDark ? 'text-[#C5A059]' : 'text-[#7D8C7A]'
          }`}>
          Sesión de Fotos & Recuerdos
        </span>
        <h2 className={`text-3xl sm:text-5xl font-serif font-normal ${isDark ? 'text-[#FDFCF0]' : 'text-[#3D3D2C]'
          }`}>
          Mi Galería de Fotos
        </h2>
        <StyleSpecificDivider
          cardStyle={cardStyle}
          className="w-48 sm:w-60 h-8 mx-auto mt-2"
          color={activeTheme?.accentColorHex}
        />
        <p className={`text-sm max-w-xl mx-auto mt-2 leading-relaxed font-serif italic ${isDark ? 'text-stone-300' : 'text-stone-600'
          }`}>
          Desliza o usa los botones para revivir mi sesión de fotos de quince años y mis recuerdos favoritos.
        </p>

      </div>

      {driveGallery.isDriveFolder && driveGallery.error && (
        <p role="status" className="mx-auto mb-5 max-w-2xl rounded-xl border border-amber-300 bg-amber-50 px-4 py-3 text-center text-xs text-amber-900">
          {driveGallery.error}
        </p>
      )}

      {/* Interactive Carousel Slider Container */}
      {(loading || driveGallery.loading) && carouselPhotos.length === 0 ? (
        <div className={`py-20 text-center text-sm flex items-center justify-center gap-2 ${isDark ? 'text-stone-400' : 'text-stone-400'}`}>
          <Loader2 className={`w-4 h-4 animate-spin ${isDark ? 'text-[#C5A059]' : 'text-amber-700'}`} />
          <span>Cargando fotos de la galería...</span>
        </div>
      ) : carouselPhotos.length === 0 ? (
        <div className={`py-16 text-center backdrop-blur-sm rounded-3xl p-8 max-w-md mx-auto shadow-xs border ${isDark
            ? 'bg-[#282B25]/90 border-[#5A5A40]/60 text-stone-200'
            : 'bg-white/70 border-[#E5E2D0] text-stone-800'
          }`}>
          <Camera className={`w-12 h-12 mx-auto mb-3 ${isDark ? 'text-[#C5A059]' : 'text-[#7D8C7A]/70'}`} />
          <h4 className={`text-base font-serif font-semibold ${isDark ? 'text-[#FDFCF0]' : 'text-stone-800'}`}>
            Galería en preparación
          </h4>
          <p className={`text-xs mt-1 leading-relaxed ${isDark ? 'text-stone-400' : 'text-stone-500'}`}>
            Las fotografías y recuerdos oficiales de los quince años serán compartidos aquí por la quinceañera.
          </p>
          {effectiveAlbumUrl && (
            <a
              href={effectiveAlbumUrl}
              target="_blank"
              rel="noopener noreferrer"
              className={`mt-4 inline-flex items-center gap-1.5 px-5 py-2.5 rounded-full text-xs font-medium shadow-xs transition-colors ${isDark
                  ? 'bg-[#C5A059] text-stone-950 font-bold hover:bg-[#d8b46d]'
                  : 'bg-[#5A5A40] text-white hover:bg-[#484833]'
                }`}
            >
              <span>Ver Álbum en la Nube</span>
              <ExternalLink className="w-3.5 h-3.5" />
            </a>
          )}
        </div>
      ) : (
        <div className="w-full mx-auto flex flex-col items-center">
          {(() => {
            const currentRatio = currentCarouselPhoto ? (photoRatios[currentCarouselPhoto.id] || 1.4) : 1.4;
            const isPortrait = currentRatio < 0.92;
            const isSquareOrSoftPortrait = currentRatio >= 0.92 && currentRatio < 1.2;

            // Compute ideal aspect ratio container classes based on detected photo geometry
            const containerClass = isPortrait
              ? 'max-w-md sm:max-w-lg aspect-[3/4] sm:aspect-[4/5] md:aspect-[9/16] max-h-[82vh]'
              : isSquareOrSoftPortrait
              ? 'max-w-xl sm:max-w-2xl aspect-square max-h-[75vh]'
              : 'w-full max-w-6xl 2xl:max-w-[1500px] aspect-[4/3] sm:aspect-[16/10] md:aspect-[16/9] max-h-[85vh]';

            return (
              <div
                onMouseEnter={() => setIsHovered(true)}
                onMouseLeave={() => setIsHovered(false)}
                className={`relative w-full rounded-3xl overflow-hidden shadow-2xl bg-stone-950 border border-[#E5E2D0]/40 group select-none transition-all duration-700 ease-in-out ${containerClass}`}
              >
                {/* Current Photo Slide with AnimatePresence */}
                <AnimatePresence mode="wait">
                  {currentCarouselPhoto && (
                    <motion.div
                      key={currentCarouselPhoto.id}
                      initial={{ opacity: 0, scale: 0.98 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.98 }}
                      transition={{ duration: 0.45, ease: 'easeInOut' }}
                      onClick={() => setActivePhotoIndex(carouselIndex)}
                      className="w-full h-full cursor-pointer relative flex items-center justify-center bg-stone-950"
                    >
                      {/* Blurred Ambient Glow Background for aesthetic framing */}
                      <div
                        className="absolute inset-0 bg-cover bg-center filter blur-2xl opacity-40 scale-110"
                        style={{ backgroundImage: `url(${currentCarouselPhoto.thumbnailUrl || currentCarouselPhoto.url})` }}
                      />

                      <img
                        {...getCarouselImageAttributes(currentCarouselPhoto)}
                        alt={currentCarouselPhoto.caption || 'Foto de XV Años'}
                        onLoad={(e) => handleImageLoad(currentCarouselPhoto.id, e)}
                        onError={() => setCarouselLoadError(true)}
                        className="relative z-10 w-full h-full object-contain sm:object-cover transition-transform duration-700 group-hover:scale-103"
                        referrerPolicy="no-referrer"
                      />

                      {(!isCurrentCarouselPhotoLoaded || isLoadingNextPhoto) && !carouselLoadError && (
                        <div className="absolute inset-0 z-30 flex items-center justify-center bg-black/25 pointer-events-none" role="status" aria-live="polite">
                          <span className="inline-flex items-center gap-2 rounded-full bg-black/75 px-4 py-2 text-xs text-white shadow-lg">
                            <Loader2 className="h-4 w-4 animate-spin text-amber-300" /> Cargando foto...
                          </span>
                        </div>
                      )}
                      {carouselLoadError && (
                        <div className="absolute inset-0 z-30 flex items-center justify-center bg-black/45 pointer-events-none" role="status" aria-live="polite">
                          <span className="rounded-full bg-black/80 px-4 py-2 text-xs text-white shadow-lg">No se pudo cargar la foto. Intenta nuevamente.</span>
                        </div>
                      )}

                      {/* Gradient Overlay at bottom for caption, comments and badges */}
                      <div className="absolute inset-0 z-20 bg-gradient-to-t from-black/95 via-black/35 to-transparent flex flex-col justify-between p-4 sm:p-6 text-white pointer-events-none">
                        {/* Top Action Bar: Likes & Comments count at top-right */}
                        <div className="flex justify-end items-center pointer-events-auto w-full">
                          <div className="flex items-center gap-2">
                            {currentCarouselPhoto.driveOpenUrl && <a href={currentCarouselPhoto.driveOpenUrl} target="_blank" rel="noopener noreferrer" onClick={(e) => e.stopPropagation()} className="rounded-full bg-black/60 px-3 py-1.5 text-xs text-white border border-white/20 inline-flex items-center gap-1.5">Abrir en Drive <ExternalLink className="w-3.5 h-3.5" /></a>}
                            <button
                              type="button"
                              onClick={(e) => handleLike(currentCarouselPhoto, e)}
                              className="px-3 py-1.5 rounded-full bg-black/60 backdrop-blur-md hover:bg-rose-600/80 text-white transition-colors flex items-center gap-1.5 text-xs border border-white/20 cursor-pointer shadow-sm"
                            >
                              <Heart className="w-4 h-4 fill-rose-500 text-rose-500 shrink-0" />
                              <span>{getLikesCountForPhoto(currentCarouselPhoto)}</span>
                            </button>

                            <button
                              type="button"
                              onClick={() => setActivePhotoIndex(carouselIndex)}
                              className="px-3 py-1.5 rounded-full bg-black/60 backdrop-blur-md hover:bg-amber-500/80 text-white transition-colors flex items-center gap-1.5 text-xs border border-white/20 cursor-pointer shadow-sm"
                              title="Ver en pantalla completa con comentarios"
                            >
                              <MessageCircle className="w-3.5 h-3.5 text-amber-300" />
                              <span>
                                {(getCommentsForPhoto(currentCarouselPhoto).length || 0) > 0
                                  ? `${getCommentsForPhoto(currentCarouselPhoto).length} Comentarios`
                                  : 'Comentar'}
                              </span>
                            </button>
                          </div>
                        </div>

                        {/* Bottom Area: Animated Comments + Badge + Caption */}
                        <div className="space-y-2 pointer-events-auto max-w-2xl">
                          {getCommentsForPhoto(currentCarouselPhoto).length > 0 && (
                            <div className="space-y-2 mb-3">
                              {getCommentsForPhoto(currentCarouselPhoto).slice(0, 2).map((comm, cIdx) => {
                                const commentText = (comm && (comm.comment || (comm as any).message)) ? String(comm.comment || (comm as any).message) : '';
                                if (!commentText) return null;
                                return (
                                  <motion.div
                                    key={comm.id || cIdx}
                                    initial={{ opacity: 0, y: 15, scale: 0.95 }}
                                    animate={{ opacity: 1, y: 0, scale: 1 }}
                                    transition={{ duration: 0.45, delay: 0.15 * (cIdx + 1) }}
                                    className="flex items-start gap-2.5 px-4 py-2.5 rounded-2xl bg-black/75 backdrop-blur-md border border-white/20 text-xs text-stone-200 shadow-2xl max-w-xl"
                                  >
                                    <div className="w-6 h-6 rounded-full bg-amber-500/30 text-amber-300 font-bold flex items-center justify-center text-[11px] shrink-0 border border-amber-400/40 mt-0.5">
                                      {comm.guestName?.charAt(0).toUpperCase() || 'I'}
                                    </div>
                                    <div className="min-w-0 flex-1">
                                      <span className="font-semibold text-amber-300 mr-1.5">
                                        {comm.guestName || 'Invitado'}:
                                      </span>
                                      <span className="italic text-stone-100 line-clamp-2 leading-snug">
                                        "{commentText.length > 120 ? commentText.slice(0, 117) + '...' : commentText}"
                                      </span>
                                    </div>
                                  </motion.div>
                                );
                              })}
                            </div>
                          )}

                          {/* Category Badge positioned nicely above caption */}
                          <div className="mb-1.5">
                            <span className="inline-block text-[10px] sm:text-[11px] uppercase font-bold tracking-widest bg-black/60 backdrop-blur-md px-3 py-1 rounded-full border border-white/20 text-amber-300 shadow-sm">
                              {currentCarouselPhoto.driveOpenUrl ? 'Google Drive' : currentCarouselPhoto.caption ? 'Sesión de Fotos' : 'Recuerdo de Mis XV'}
                            </span>
                          </div>

                          {currentCarouselPhoto.caption && (
                            <p className="text-sm sm:text-base font-serif font-medium text-stone-100 mb-1 drop-shadow-md">
                              {currentCarouselPhoto.caption}
                            </p>
                          )}
                          <p className="text-xs text-amber-200/90 font-serif italic drop-shadow-sm">
                            {currentCarouselPhoto.driveOpenUrl ? 'Fotos compartidas' : currentCarouselPhoto.authorName ? `Fotografía: ${currentCarouselPhoto.authorName}` : 'Recuerdos de la Quinceañera'}
                          </p>
                        </div>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>

            {/* Left Carousel Navigation Button */}
            {carouselPhotos.length > 1 && (
              <button
                type="button"
                onClick={handlePrevCarousel}
                className="absolute left-3 sm:left-5 top-1/2 -translate-y-1/2 z-20 w-11 h-11 sm:w-13 sm:h-13 rounded-full bg-black/65 hover:bg-black/90 text-white flex items-center justify-center border border-white/25 backdrop-blur-md shadow-xl cursor-pointer transition-all hover:scale-110 active:scale-95"
                title="Foto anterior"
              >
                <ChevronLeft className="w-6 h-6 sm:w-7 sm:h-7 -translate-x-0.5" />
              </button>
            )}

            {/* Right Carousel Navigation Button */}
            {carouselPhotos.length > 1 && (
              <button
                type="button"
                onClick={handleNextCarousel}
                className="absolute right-3 sm:right-5 top-1/2 -translate-y-1/2 z-20 w-11 h-11 sm:w-13 sm:h-13 rounded-full bg-black/65 hover:bg-black/90 text-white flex items-center justify-center border border-white/25 backdrop-blur-md shadow-xl cursor-pointer transition-all hover:scale-110 active:scale-95"
                title="Siguiente foto"
              >
                <ChevronRight className="w-6 h-6 sm:w-7 sm:h-7 translate-x-0.5" />
              </button>
            )}

            {/* Top Bar: Slide Index Pill + Auto-Play Play/Pause Button */}
            <div className="absolute top-4 left-4 z-20 flex items-center gap-2">
              <div className="bg-black/60 backdrop-blur-md px-3 py-1 rounded-full border border-white/20 text-xs font-mono text-stone-300 flex items-center gap-1.5 pointer-events-none">
                <span className="text-amber-300 font-bold">{carouselIndex + 1}</span>
                <span className="text-stone-500">/</span>
                <span>{driveGallery.hasMore ? `${carouselPhotos.length}+` : carouselPhotos.length}</span>
              </div>

              {carouselPhotos.length > 1 && (
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    setIsAutoPlay(!isAutoPlay);
                  }}
                  className={`px-2.5 py-1 rounded-full text-[11px] font-sans font-medium flex items-center gap-1 backdrop-blur-md border transition-all cursor-pointer ${
                    isAutoPlay
                      ? 'bg-amber-500/80 text-stone-950 border-amber-300 shadow-xs'
                      : 'bg-black/60 text-stone-300 border-white/20 hover:bg-black/80'
                  }`}
                  title={isAutoPlay ? 'Pausar pase automático' : 'Activar pase automático'}
                >
                  {isAutoPlay ? (
                    <>
                      <Pause className="w-3 h-3 fill-current" />
                      <span className="hidden sm:inline">Auto</span>
                    </>
                  ) : (
                    <>
                      <Play className="w-3 h-3 fill-current" />
                      <span className="hidden sm:inline">Play</span>
                    </>
                  )}
                </button>
              )}
            </div>
          </div>
        );
      })()}

          {/* Horizontal Thumbnails Strip Slider */}
          {carouselPhotos.length > 1 && (
            <div className="mt-4 flex w-full max-w-full min-w-0 items-center gap-1 py-2 px-1">
              <button type="button" onClick={() => scrollLandingThumbnailRail(-1)} aria-label="Ver miniaturas anteriores" className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-full border ${isDark ? 'border-white/20 bg-black/70 text-white' : 'border-[#E5E2D0] bg-white/90 text-stone-700'}`}><ChevronLeft className="h-5 w-5" /></button>
              <div ref={landingThumbnailRailRef} className="flex min-w-0 flex-1 items-center justify-start gap-2.5 overflow-x-auto px-1 no-scrollbar scroll-smooth">
                {carouselPhotos.map((photo, idx) => (
                  <button
                    key={photo.id}
                    data-gallery-thumbnail-index={idx}
                    type="button"
                    onClick={() => void navigateToCarouselPhoto(idx)}
                    aria-label={`Ver foto ${idx + 1} de ${carouselPhotos.length}`}
                    aria-current={idx === carouselIndex ? 'true' : undefined}
                    className={`relative w-12 h-12 sm:w-16 sm:h-16 rounded-2xl overflow-hidden shrink-0 transition-all cursor-pointer border-2 ${idx === carouselIndex
                        ? isDark
                          ? 'border-[#C5A059] ring-2 ring-[#C5A059]/40 opacity-100 shadow-md'
                          : 'border-[#5A5A40] ring-2 ring-[#5A5A40]/30 opacity-100 shadow-md'
                        : 'border-transparent opacity-50 hover:opacity-90'
                      }`}
                  >
                    <img src={photo.thumbnailUrl || photo.url} alt={`Miniatura ${idx + 1}`} className="w-full h-full object-cover" loading="lazy" />
                  </button>
                ))}
                {driveGallery.hasMore && <button type="button" onClick={() => void driveGallery.loadMore()} disabled={driveGallery.loadingMore} className={`flex h-12 shrink-0 items-center gap-2 rounded-xl border px-3 text-xs font-semibold disabled:opacity-60 ${isDark ? 'border-[#C5A059]/60 text-amber-200' : 'border-[#E5E2D0] text-[#3D3D2C]'}`}>{driveGallery.loadingMore && <Loader2 className="h-4 w-4 animate-spin" />}Cargar más</button>}
              </div>
              <button type="button" onClick={() => scrollLandingThumbnailRail(1)} aria-label="Ver miniaturas siguientes" className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-full border ${isDark ? 'border-white/20 bg-black/70 text-white' : 'border-[#E5E2D0] bg-white/90 text-stone-700'}`}><ChevronRight className="h-5 w-5" /></button>
            </div>
          )}

          {/* Inline Action Indicator & Upload Photo Button */}
          <div className="mt-5 flex flex-wrap items-center justify-center gap-3">
            <button
              type="button"
              onClick={() => setActivePhotoIndex(carouselIndex)}
              className={`inline-flex items-center gap-2 px-6 py-2.5 rounded-full text-xs font-serif font-bold uppercase tracking-wider border shadow-xs transition-all cursor-pointer hover:scale-105 active:scale-95 ${isDark
                  ? 'bg-[#282B25] border-[#5A5A40] text-stone-200 hover:text-white'
                  : 'bg-white/90 border-[#E5E2D0] text-[#3D3D2C] hover:bg-white'
                }`}
            >
              <Sparkles className="w-4 h-4 text-amber-500" />
              <span>Ver en pantalla completa</span>
            </button>

            {isAdmin && (
              <button
                type="button"
                onClick={() => setShowUploadModal(true)}
                className={`inline-flex items-center gap-2 px-6 py-2.5 rounded-full text-xs font-serif font-bold uppercase tracking-wider shadow-md transition-all cursor-pointer hover:scale-105 active:scale-95 ${isDark
                    ? 'bg-[#C5A059] text-stone-950 hover:bg-[#d8b46d]'
                    : 'bg-[#5A5A40] text-[#FDFCF0] hover:bg-[#484833]'
                  }`}
              >
                <Camera className="w-4 h-4" />
                <span>Añadir Foto Oficial</span>
              </button>
            )}
            {driveGallery.hasMore && (
              <button
                type="button"
                onClick={() => void driveGallery.loadMore()}
                disabled={driveGallery.loadingMore}
                className={`inline-flex items-center gap-2 px-5 py-2.5 rounded-full text-xs font-semibold border transition-all disabled:opacity-60 ${isDark ? 'border-[#C5A059]/60 text-amber-200' : 'border-[#E5E2D0] text-[#3D3D2C]'}`}
              >
                {driveGallery.loadingMore && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                Cargar más fotos de Drive
              </button>
            )}
          </div>

        </div>
      )}

      {/* Guest Photo Upload Modal */}
      <AnimatePresence>
        {showUploadModal && (
          <div className="fixed inset-0 z-[99990] bg-black/80 backdrop-blur-md flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 15 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 15 }}
              className="w-full max-w-md bg-stone-900 border border-stone-700 rounded-3xl p-6 text-stone-100 shadow-2xl relative space-y-4"
            >
              <button
                type="button"
                onClick={() => setShowUploadModal(false)}
                className="absolute top-4 right-4 text-stone-400 hover:text-white p-1 rounded-full bg-stone-800"
              >
                <X className="w-5 h-5" />
              </button>

              <div className="flex items-center gap-2.5 border-b border-stone-800 pb-3">
                <div className="w-10 h-10 rounded-2xl bg-amber-500/20 text-amber-300 flex items-center justify-center">
                  <Camera className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-serif font-bold text-base text-white">Subir Foto a la Galería</h3>
                  <p className="text-xs text-stone-400">Comparte tu recuerdo con la quinceañera</p>
                </div>
              </div>

              {/* Hidden file input */}
              <input
                type="file"
                ref={fileInputRef}
                accept="image/*"
                onChange={handleFileSelect}
                className="hidden"
              />

              {/* Drag and Drop Zone */}
              <div
                onDragOver={(e) => {
                  e.preventDefault();
                  setIsDraggingPhoto(true);
                }}
                onDragLeave={() => setIsDraggingPhoto(false)}
                onDrop={(e) => {
                  e.preventDefault();
                  setIsDraggingPhoto(false);
                  const file = e.dataTransfer.files?.[0];
                  if (file) processGuestPhotoFile(file);
                }}
                className={`p-6 rounded-2xl border-2 border-dashed text-center transition-all cursor-pointer ${isDraggingPhoto
                    ? 'border-amber-400 bg-amber-500/10 scale-102'
                    : 'border-stone-700 bg-stone-950/60 hover:border-amber-400/60'
                  }`}
                onClick={() => fileInputRef.current?.click()}
              >
                {isUploadingPhoto ? (
                  <div className="py-4 space-y-2 flex flex-col items-center justify-center">
                    <Loader2 className="w-8 h-8 animate-spin text-amber-400" />
                    <p className="text-xs font-medium text-amber-200">{uploadMessage}</p>
                  </div>
                ) : (
                  <div className="space-y-2">
                    <Upload className="w-8 h-8 text-amber-400 mx-auto" />
                    <p className="text-xs font-semibold text-stone-200">
                      Arrastra tu foto aquí o haz clic para buscarla
                    </p>
                    <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-stone-800 border border-stone-700 text-[11px] text-stone-300 font-mono">
                      <Clipboard className="w-3 h-3 text-amber-400" />
                      <span>o pega directamente con <strong>Ctrl+V</strong></span>
                    </div>
                  </div>
                )}
              </div>

              {/* Caption & Name Inputs */}
              <div className="space-y-2.5">
                <div>
                  <label className="block text-xs font-semibold text-stone-300 mb-1">
                    Tu nombre:
                  </label>
                  <input
                    type="text"
                    value={authorInputName}
                    onChange={(e) => setAuthorInputName(e.target.value)}
                    placeholder="Ej. Familia Gómez"
                    className="w-full px-3.5 py-2 rounded-xl bg-stone-950 border border-stone-700 text-xs text-stone-100 placeholder-stone-500 focus:outline-none focus:border-amber-400"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-stone-300 mb-1">
                    Pie de foto o dedicatoria (opcional):
                  </label>
                  <input
                    type="text"
                    value={uploadCaption}
                    onChange={(e) => setUploadCaption(e.target.value)}
                    placeholder="Ej. ¡Felicidades en tus XV! / Momento inolvidable"
                    className="w-full px-3.5 py-2 rounded-xl bg-stone-950 border border-stone-700 text-xs text-stone-100 placeholder-stone-500 focus:outline-none focus:border-amber-400"
                  />
                </div>
              </div>

              {uploadMessage && !isUploadingPhoto && (
                <div className="bg-emerald-950/60 border border-emerald-600/80 rounded-xl p-3 flex items-center gap-2 text-xs text-emerald-200">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                  <span>{uploadMessage}</span>
                </div>
              )}
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Lightbox Modal rendered via React Portal directly to body (Guarantees top stacking context above all headers) */}
      {typeof document !== 'undefined' &&
        createPortal(
          <AnimatePresence>
            {activePhoto && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onClick={() => setActivePhotoIndex(null)}
                className="fixed inset-0 z-[99999] bg-black/95 backdrop-blur-xl flex items-center justify-center p-2 sm:p-4 lg:p-6"
              >
                <div
                  onClick={(e) => e.stopPropagation()}
                  className="relative w-full h-full sm:w-[96vw] sm:max-w-7xl sm:h-[94vh] bg-stone-950 sm:rounded-3xl overflow-hidden shadow-2xl border-0 sm:border border-stone-800 flex flex-col lg:flex-row animate-in fade-in zoom-in-95 duration-200"
                >
                  {/* Top Bar Actions: High-res Download & Close Button */}
                  <div className="absolute top-3 sm:top-4 right-3 sm:right-4 z-40 flex items-center gap-2">
                    <a
                      href={activePhoto.driveOpenUrl || activePhoto.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      download
                      className="w-10 h-10 rounded-full bg-black/60 hover:bg-black/80 text-white flex items-center justify-center border border-white/20 backdrop-blur-md shadow-lg cursor-pointer transition-all hover:scale-105"
                      title={activePhoto.driveOpenUrl ? 'Abrir foto en Google Drive' : 'Abrir imagen original'}
                    >
                      <ExternalLink className="w-4 h-4 sm:w-5 sm:h-5" />
                    </a>
                    <button
                      type="button"
                      onClick={() => setActivePhotoIndex(null)}
                      className="w-10 h-10 rounded-full bg-black/75 hover:bg-black text-white flex items-center justify-center border border-white/20 shadow-lg cursor-pointer transition-all hover:scale-105"
                      title="Cerrar galería (Esc)"
                    >
                      <X className="w-5 h-5 sm:w-6 sm:h-6" />
                    </button>
                  </div>

                  {/* Huge Immersive Photo Carousel Display Area */}
                  <div className="flex-1 w-full h-full bg-black flex flex-col justify-center items-center p-0 sm:p-4 min-h-0 overflow-hidden relative select-none">

                    {/* Photo Position Counter at top */}
                    <div className="absolute top-3 sm:top-4 left-3 sm:left-4 z-40 bg-black/60 backdrop-blur-md px-3 sm:px-3.5 py-1 sm:py-1.5 rounded-full border border-white/10 text-xs font-mono font-medium text-stone-300 flex items-center gap-2 shadow-lg">
                      <span className="text-amber-300 font-bold">{(activePhotoIndex ?? 0) + 1}</span>
                      <span className="text-stone-500">/</span>
                      <span>{driveGallery.hasMore ? `${carouselPhotos.length}+` : carouselPhotos.length}</span>
                    </div>

                    {/* Left Carousel Navigation Button */}
                    {carouselPhotos.length > 1 && (
                      <button
                        type="button"
                        onClick={handlePrevPhoto}
                        className="absolute left-2 sm:left-5 top-1/2 -translate-y-1/2 z-30 w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-black/60 hover:bg-black/90 text-white flex items-center justify-center border border-white/20 backdrop-blur-md shadow-xl cursor-pointer transition-all hover:scale-110 active:scale-95"
                        title="Foto anterior"
                      >
                        <ChevronLeft className="w-6 h-6 sm:w-7 sm:h-7 -translate-x-0.5" />
                      </button>
                    )}

                    {/* Right Carousel Navigation Button */}
                    {carouselPhotos.length > 1 && (
                      <button
                        type="button"
                        onClick={handleNextPhoto}
                        className="absolute right-2 sm:right-5 top-1/2 -translate-y-1/2 z-30 w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-black/60 hover:bg-black/90 text-white flex items-center justify-center border border-white/20 backdrop-blur-md shadow-xl cursor-pointer transition-all hover:scale-110 active:scale-95"
                        title="Siguiente foto"
                      >
                        <ChevronRight className="w-7 h-7 translate-x-0.5" />
                      </button>
                    )}

                    {/* Main Photo with smooth transition */}
                    <div 
                      className="flex-1 w-full h-full flex flex-col items-center justify-center min-h-0 relative px-0 sm:px-2 cursor-pointer"
                      onClick={() => {
                        if (mobileCommentsOpen) {
                          setMobileCommentsOpen(false);
                        }
                      }}
                    >
                      <AnimatePresence mode="wait">
                        <motion.div
                          key={activePhoto.id}
                          initial={{ opacity: 0, scale: 0.98 }}
                          animate={{ opacity: 1, scale: 1 }}
                          exit={{ opacity: 0, scale: 0.98 }}
                          transition={{ duration: 0.25 }}
                          className="flex flex-col items-center justify-center h-full w-full relative"
                        >
                          <img
                            {...getCarouselImageAttributes(activePhoto)}
                            alt={activePhoto.caption || 'Foto de XV Años'}
                            className="h-full w-full max-h-[100vh] lg:max-h-[75vh] object-contain sm:rounded-xl shadow-2xl"
                            referrerPolicy="no-referrer"
                          />

                          {/* Photo Subtitle (Author & Date underneath the photo on desktop) */}
                          <div className="hidden lg:flex mt-2.5 items-center justify-center gap-3 text-xs sm:text-sm text-stone-300 font-serif">
                            {activePhoto.authorName && (
                              <span className="text-amber-200/90 italic">
                                Fotografía por: {activePhoto.authorName}
                              </span>
                            )}
                            {activePhoto.authorName && activePhoto.createdAt && (
                              <span className="text-stone-600">•</span>
                            )}
                            {activePhoto.createdAt && (
                              <span className="text-stone-400 font-mono text-[11px] sm:text-xs">
                                {new Date(activePhoto.createdAt).toLocaleDateString(undefined, {
                                  year: 'numeric',
                                  month: 'long',
                                  day: 'numeric',
                                })}
                              </span>
                            )}
                          </div>
                        </motion.div>
                      </AnimatePresence>
                    </div>

                    {/* MOBILE FLOATING ACTION COLUMN - Directly over the photo on the right */}
                    <div className="lg:hidden absolute right-3 bottom-24 z-30 flex flex-col items-center gap-3 select-none">
                      {/* Like Button directly over the photo */}
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleLike(activePhoto);
                        }}
                        className={`w-12 h-12 rounded-full backdrop-blur-md border shadow-2xl flex flex-col items-center justify-center cursor-pointer transition-all active:scale-90 ${
                          hasLikedPhoto(activePhoto)
                            ? 'bg-rose-950/80 border-rose-500 text-rose-200 ring-2 ring-rose-500/40 scale-105'
                            : 'bg-black/55 hover:bg-black/75 border-white/20 text-white'
                        }`}
                        title="Me gusta"
                      >
                        <Heart
                          className={`w-5 h-5 transition-transform ${
                            hasLikedPhoto(activePhoto)
                              ? 'fill-rose-500 text-rose-500 scale-110'
                              : 'fill-rose-500 text-rose-500'
                          }`}
                        />
                        <span className="text-[10px] font-bold mt-0.5 leading-none">{getLikesCountForPhoto(activePhoto)}</span>
                      </button>

                      {/* Comments Toggle Button directly over the photo */}
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          setMobileCommentsOpen((prev) => !prev);
                        }}
                        className={`w-12 h-12 rounded-full backdrop-blur-md border shadow-2xl flex flex-col items-center justify-center cursor-pointer transition-all active:scale-90 ${
                          mobileCommentsOpen
                            ? 'bg-amber-950/80 border-amber-400 text-amber-200 ring-2 ring-amber-400/40'
                            : 'bg-black/55 hover:bg-black/75 border-white/20 text-white'
                        }`}
                        title={mobileCommentsOpen ? 'Cerrar comentarios' : 'Ver comentarios'}
                      >
                        <MessageCircle className="w-5 h-5 text-amber-400" />
                        <span className="text-[10px] font-bold mt-0.5 leading-none">{comments.length}</span>
                      </button>
                    </div>

                    {/* MOBILE BOTTOM GRADIENT OVERLAY - Subtle & Elegant (Photo is the real protagonist) */}
                    <div className={`lg:hidden absolute inset-x-0 bottom-0 z-20 pointer-events-none transition-opacity duration-300 ${mobileCommentsOpen ? 'opacity-0' : 'opacity-100'}`}>
                      <div className="bg-gradient-to-t from-black/90 via-black/40 to-transparent pt-16 pb-4 px-4 pr-16 text-left">
                        <span className="text-[10px] uppercase font-bold tracking-widest bg-amber-500/20 text-amber-300 border border-amber-500/30 px-2 py-0.5 rounded-full inline-block mb-1">
                          {activePhoto.driveOpenUrl ? 'Google Drive' : activePhoto.caption ? 'Sesión de Fotos' : 'Álbum de Mis XV'}
                        </span>

                        <h3 className="text-sm font-serif font-semibold text-white leading-snug truncate drop-shadow-md">
                          {activePhoto.caption || 'Recuerdo de Mis Quince Años'}
                        </h3>

                        {activePhoto.authorName && (
                          <p className="text-[11px] text-stone-300/90 italic truncate drop-shadow-sm mt-0.5">
                            Por: {activePhoto.authorName}
                          </p>
                        )}

                        {/* Sutil Comment Preview: Only 1 compact line if there are comments */}
                        {comments.length > 0 && (
                          <div 
                            onClick={(e) => {
                              e.stopPropagation();
                              setMobileCommentsOpen(true);
                            }}
                            className="pointer-events-auto mt-1.5 inline-flex items-center gap-2 max-w-full px-3 py-1 rounded-full bg-black/40 hover:bg-black/60 backdrop-blur-md border border-white/15 text-[11px] text-stone-200 cursor-pointer shadow-md active:scale-95 transition-all"
                          >
                            <MessageCircle className="w-3 h-3 text-amber-400 shrink-0" />
                            <span className="font-semibold text-amber-200 truncate shrink-0">{comments[comments.length - 1].guestName}:</span>
                            <span className="truncate text-stone-300 italic">"{comments[comments.length - 1].message}"</span>
                          </div>
                        )}

                        {/* Sutil Trigger: Tap to comment or view all */}
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            setMobileCommentsOpen(true);
                          }}
                          className="pointer-events-auto mt-2 w-full flex items-center justify-between px-3.5 py-2 rounded-full bg-black/40 hover:bg-black/60 backdrop-blur-md border border-white/15 text-xs text-stone-300 shadow-md active:scale-98 transition-all cursor-pointer"
                        >
                          <span className="flex items-center gap-2">
                            <MessageCircle className="w-3.5 h-3.5 text-amber-400" />
                            <span>{comments.length === 0 ? 'Sé el primero en comentar...' : `Ver y dejar comentarios (${comments.length})...`}</span>
                          </span>
                          <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-white/15 text-amber-300">
                            {comments.length}
                          </span>
                        </button>
                      </div>
                    </div>

                    {/* Navigable thumbnail rail */}
                    {carouselPhotos.length > 1 && (
                      <div className="flex w-full max-w-2xl shrink-0 items-center gap-1 px-2 pt-2 pb-1 z-20">
                        <button type="button" onClick={() => scrollThumbnailRail(-1)} aria-label="Ver miniaturas anteriores" className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-black/60 text-white hover:bg-black/80"><ChevronLeft className="h-5 w-5" /></button>
                        <div ref={thumbnailRailRef} className="flex min-w-0 flex-1 items-center justify-start gap-2 overflow-x-auto px-1 no-scrollbar scroll-smooth">
                          {carouselPhotos.map((p, idx) => (
                            <button
                              key={p.id}
                              data-thumbnail-index={idx}
                              type="button"
                              onClick={() => setActivePhotoIndex(idx)}
                              aria-label={`Ver foto ${idx + 1} de ${carouselPhotos.length}`}
                              aria-current={idx === activePhotoIndex ? 'true' : undefined}
                              className={`relative h-10 w-10 sm:h-14 sm:w-14 shrink-0 overflow-hidden rounded-xl border-2 transition-all cursor-pointer ${idx === activePhotoIndex
                                ? 'border-amber-400 ring-2 ring-amber-400/40 opacity-100'
                                : 'border-transparent opacity-50 hover:opacity-90'
                                }`}
                            >
                              <img src={p.thumbnailUrl || p.url} alt={`Miniatura ${idx + 1}`} loading="lazy" className="h-full w-full object-cover" />
                            </button>
                          ))}
                          {driveGallery.hasMore && <button type="button" onClick={() => void driveGallery.loadMore()} disabled={driveGallery.loadingMore} className="flex h-10 shrink-0 items-center gap-1.5 rounded-lg border border-white/20 bg-black/60 px-3 text-[10px] font-semibold text-white disabled:opacity-60">{driveGallery.loadingMore && <Loader2 className="h-3.5 w-3.5 animate-spin" />}Cargar más</button>}
                        </div>
                        <button type="button" onClick={() => scrollThumbnailRail(1)} aria-label="Ver miniaturas siguientes" className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-black/60 text-white hover:bg-black/80"><ChevronRight className="h-5 w-5" /></button>
                      </div>
                    )}
                  </div>

                  {/* MOBILE COMMENTS SLIDE-UP SHEET (Translucent Frosted Glass, Non-intrusive) */}
                  <AnimatePresence>
                    {mobileCommentsOpen && (
                      <>
                        {/* Tap backdrop to close */}
                        <div 
                          className="lg:hidden absolute inset-0 z-30 bg-black/40 backdrop-blur-sm"
                          onClick={() => setMobileCommentsOpen(false)}
                        />

                        <motion.div
                          initial={{ y: '100%', opacity: 0 }}
                          animate={{ y: 0, opacity: 1 }}
                          exit={{ y: '100%', opacity: 0 }}
                          transition={{ type: 'spring', damping: 28, stiffness: 300 }}
                          className="lg:hidden absolute bottom-0 inset-x-0 z-40 max-h-[62vh] flex flex-col bg-stone-950/80 backdrop-blur-2xl border-t border-white/20 rounded-t-3xl shadow-[0_-15px_45px_rgba(0,0,0,0.85)] overflow-hidden"
                          onClick={(e) => e.stopPropagation()}
                        >
                          {/* Drag Handle & Header */}
                          <div className="p-3.5 pb-2.5 border-b border-white/10 shrink-0">
                            <div 
                              onClick={() => setMobileCommentsOpen(false)}
                              className="w-10 h-1 rounded-full bg-white/30 mx-auto mb-2 cursor-pointer hover:bg-white/50" 
                            />
                            <div className="flex items-center justify-between">
                              <div className="flex items-center gap-2">
                                <MessageCircle className="w-4 h-4 text-amber-400" />
                                <h4 className="text-sm font-semibold text-white">Comentarios & Dedicatorias</h4>
                                <span className="text-xs font-mono font-bold text-amber-300 bg-white/10 px-2 py-0.5 rounded-full">
                                  {comments.length}
                                </span>
                              </div>
                              <button
                                type="button"
                                onClick={() => setMobileCommentsOpen(false)}
                                className="w-7 h-7 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-stone-300 hover:text-white transition-colors cursor-pointer"
                                title="Cerrar comentarios"
                              >
                                <ChevronDown className="w-4 h-4" />
                              </button>
                            </div>
                          </div>

                          {/* Comments List */}
                          <div className="flex-1 p-3.5 py-2.5 overflow-y-auto space-y-2 min-h-0 custom-scrollbar">
                            {loadingComments ? (
                              <div className="py-6 text-center text-xs text-stone-400 flex items-center justify-center gap-2">
                                <Loader2 className="w-4 h-4 animate-spin text-amber-400" />
                                <span>Cargando comentarios...</span>
                              </div>
                            ) : comments.length === 0 ? (
                              <div className="py-6 text-center bg-white/5 backdrop-blur-sm rounded-2xl border border-dashed border-white/15 p-4">
                                <MessageCircle className="w-6 h-6 text-stone-400 mx-auto mb-1" />
                                <p className="text-xs text-stone-200 font-medium">Sé el primero en comentar esta foto</p>
                                <p className="text-[11px] text-stone-400 mt-0.5">Deja un lindo mensaje o felicitación para la quinceañera.</p>
                              </div>
                            ) : (
                              comments.map((c) => (
                                <div
                                  key={c.id}
                                  className="bg-white/10 backdrop-blur-md border border-white/15 rounded-2xl p-2.5 sm:p-3 space-y-1"
                                >
                                  <div className="flex items-center justify-between gap-2">
                                    <div className="flex items-center gap-2 min-w-0">
                                      <div className="w-5 h-5 rounded-full bg-amber-500/20 text-amber-300 flex items-center justify-center text-[10px] font-bold shrink-0 border border-amber-500/30">
                                        {c.guestName.charAt(0).toUpperCase()}
                                      </div>
                                      <span className="text-xs font-semibold text-amber-200 truncate">
                                        {c.guestName}
                                      </span>
                                    </div>
                                    {c.createdAt && (
                                      <span className="text-[10px] text-stone-400 font-mono shrink-0">
                                        {new Date(c.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                      </span>
                                    )}
                                  </div>
                                  <p className="text-xs text-stone-100 leading-relaxed pl-7">
                                    {c.message}
                                  </p>
                                </div>
                              ))
                            )}
                          </div>

                          {/* Mobile Comment Form */}
                          <div className="p-3 bg-black/50 border-t border-white/15 shrink-0">
                            <form onSubmit={handleAddComment} className="space-y-2">
                              <div className="relative">
                                <User className="w-3.5 h-3.5 text-stone-400 absolute left-3 top-1/2 -translate-y-1/2" />
                                <input
                                  type="text"
                                  value={authorInputName}
                                  onChange={(e) => setAuthorInputName(e.target.value)}
                                  placeholder="Tu nombre (ej. Familia Pérez)"
                                  className="w-full pl-8 pr-3 py-1.5 rounded-xl bg-white/10 border border-white/20 text-xs text-white placeholder-stone-400 focus:outline-none focus:border-amber-400"
                                  required
                                />
                              </div>

                              <div className="flex gap-2">
                                <input
                                  type="text"
                                  value={newCommentText}
                                  onChange={(e) => setNewCommentText(e.target.value)}
                                  placeholder="Escribe un comentario o felicitación..."
                                  className="flex-1 px-3 py-1.5 rounded-xl bg-white/10 border border-white/20 text-xs text-white placeholder-stone-400 focus:outline-none focus:border-amber-400"
                                  required
                                />
                                <button
                                  type="submit"
                                  disabled={isSubmittingComment || !newCommentText.trim()}
                                  className="px-3.5 py-1.5 rounded-xl bg-amber-600 hover:bg-amber-500 disabled:opacity-50 text-white text-xs font-serif font-bold flex items-center justify-center gap-1 transition-all shadow-md cursor-pointer"
                                  title="Enviar comentario"
                                >
                                  {isSubmittingComment ? (
                                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                                  ) : (
                                    <Send className="w-3.5 h-3.5" />
                                  )}
                                </button>
                              </div>
                            </form>
                          </div>
                        </motion.div>
                      </>
                    )}
                  </AnimatePresence>

                  {/* DESKTOP SIDEBAR PANEL - 100% full experience on desktop */}
                  <div className="hidden lg:flex w-[440px] flex-col justify-between bg-stone-900/95 text-stone-100 border-l border-stone-800 shrink-0 max-h-[94vh] overflow-hidden">
                    {/* Header & Photo Title */}
                    <div className="p-6 pr-16 pb-4 border-b border-stone-800/80 shrink-0">
                      <span className="text-xs uppercase font-bold tracking-widest bg-amber-500/20 text-amber-300 border border-amber-500/30 px-3 py-1 rounded-full inline-block mb-2">
                        {activePhoto.driveOpenUrl ? 'Google Drive' : activePhoto.caption ? 'Sesión de Fotos' : 'Álbum de Mis XV'}
                      </span>
                      <h3 className="text-xl font-serif font-semibold text-white leading-snug">
                        {activePhoto.caption || 'Recuerdo de Mis Quince Años'}
                      </h3>
                    </div>

                    {/* Comments List */}
                    <div className="flex-1 p-6 py-4 overflow-y-auto space-y-3 min-h-0 custom-scrollbar">
                      <div className="flex items-center justify-between text-xs sm:text-sm text-stone-400 pb-2 border-b border-stone-800/40">
                        <div className="flex items-center gap-2 font-semibold text-stone-200">
                          <MessageCircle className="w-4 h-4 text-amber-400" />
                          <span>Comentarios & Dedicatorias</span>
                        </div>
                        <span className="text-xs font-mono font-bold text-amber-300 bg-stone-800/80 px-2.5 py-0.5 rounded-full">
                          {comments.length}
                        </span>
                      </div>

                      {loadingComments ? (
                        <div className="py-8 text-center text-sm text-stone-500 flex items-center justify-center gap-2">
                          <Loader2 className="w-4 h-4 animate-spin text-amber-400" />
                          <span>Cargando comentarios...</span>
                        </div>
                      ) : comments.length === 0 ? (
                        <div className="py-10 text-center bg-stone-950/40 rounded-2xl border border-dashed border-stone-800 p-5">
                          <MessageCircle className="w-8 h-8 text-stone-600 mx-auto mb-2" />
                          <p className="text-sm text-stone-300 font-medium">Sé el primero en comentar esta foto</p>
                          <p className="text-xs text-stone-500 mt-1">Deja un lindo mensaje o recuerdo para la quinceañera.</p>
                        </div>
                      ) : (
                        comments.map((c) => (
                          <div
                            key={c.id}
                            className="bg-stone-950/70 border border-stone-800/90 rounded-2xl p-4 space-y-1.5 hover:border-stone-700/80 transition-colors animate-in fade-in"
                          >
                            <div className="flex items-center justify-between gap-2">
                              <div className="flex items-center gap-2 min-w-0">
                                <div className="w-6 h-6 rounded-full bg-amber-500/20 text-amber-300 flex items-center justify-center text-xs font-bold shrink-0">
                                  {c.guestName.charAt(0).toUpperCase()}
                                </div>
                                <span className="text-sm font-semibold text-amber-200 truncate">
                                  {c.guestName}
                                </span>
                              </div>
                              {c.createdAt && (
                                <span className="text-[11px] text-stone-400 font-mono shrink-0">
                                  {new Date(c.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                </span>
                              )}
                            </div>
                            <p className="text-xs sm:text-sm text-stone-200 leading-relaxed pl-8">
                              {c.message}
                            </p>
                          </div>
                        ))
                      )}
                    </div>

                    {/* Desktop Action Bar (Like + Download) & Comment Form */}
                    <div className="p-6 bg-stone-950/95 border-t border-stone-800 shrink-0 space-y-4">
                      <div className="flex items-center justify-between gap-3">
                        <button
                          type="button"
                          onClick={() => handleLike(activePhoto)}
                          className={`flex-1 flex items-center justify-center gap-2 py-3 px-5 rounded-2xl border transition-all cursor-pointer text-sm font-semibold shadow-sm ${hasLikedPhoto(activePhoto)
                              ? 'bg-rose-950/60 border-rose-600 text-rose-200'
                              : 'bg-stone-800 hover:bg-rose-950/40 text-stone-100 hover:text-rose-300 border-stone-700'
                            }`}
                        >
                          <Heart
                            className={`w-4 h-4 shrink-0 transition-transform ${hasLikedPhoto(activePhoto)
                                ? 'fill-rose-500 text-rose-500 scale-110'
                                : 'fill-rose-500 text-rose-500'
                              }`}
                          />
                          <span>
                            {getLikesCountForPhoto(activePhoto)} Me gusta
                          </span>
                        </button>

                        <a
                          href={activePhoto.driveOpenUrl || activePhoto.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          download
                          className="p-3 rounded-2xl bg-stone-800 hover:bg-stone-700 text-stone-200 border border-stone-700 transition-colors flex items-center justify-center shadow-sm"
                          title="Abrir imagen original en alta resolución"
                        >
                          <ExternalLink className="w-5 h-5" />
                        </a>
                      </div>

                      <form onSubmit={handleAddComment} className="space-y-3">
                        <div className="relative">
                          <User className="w-4 h-4 text-stone-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                          <input
                            type="text"
                            value={authorInputName}
                            onChange={(e) => setAuthorInputName(e.target.value)}
                            placeholder="Tu nombre (ej. Familia Pérez)"
                            className="w-full pl-10 pr-4 py-2.5 rounded-2xl bg-stone-900 border border-stone-700 text-sm text-stone-100 placeholder-stone-400 focus:outline-none focus:border-amber-400 focus:ring-1 focus:ring-amber-400"
                            required
                          />
                        </div>

                        <div className="flex gap-2">
                          <input
                            type="text"
                            value={newCommentText}
                            onChange={(e) => setNewCommentText(e.target.value)}
                            placeholder="Escribe un comentario o felicitación..."
                            className="flex-1 px-4 py-3 rounded-2xl bg-stone-900 border border-stone-700 text-sm text-stone-100 placeholder-stone-400 focus:outline-none focus:border-amber-400 focus:ring-1 focus:ring-amber-400"
                            required
                          />
                          <button
                            type="submit"
                            disabled={isSubmittingComment || !newCommentText.trim()}
                            className="px-6 py-3 rounded-2xl bg-amber-600 hover:bg-amber-500 disabled:opacity-50 text-white text-sm font-serif font-bold flex items-center justify-center gap-2 transition-all shadow-md cursor-pointer hover:scale-105 active:scale-95 shrink-0"
                            title="Enviar comentario"
                          >
                            {isSubmittingComment ? (
                              <Loader2 className="w-4 h-4 animate-spin" />
                            ) : (
                              <>
                                <span>Enviar</span>
                                <Send className="w-4 h-4" />
                              </>
                            )}
                          </button>
                        </div>
                      </form>
                    </div>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>,
          document.body
        )}
    </section>
  );
};
