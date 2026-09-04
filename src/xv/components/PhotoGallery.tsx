import React, { useState, useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence } from 'motion/react';
import {
  Camera,
  Heart,
  ExternalLink,
  Globe,
  Loader2,
  X,
  Sparkles,
  ChevronLeft,
  ChevronRight,
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
  externalAlbumTitle,
  isAdmin = false,
  settings,
}) => {
  const [photos, setPhotos] = useState<GalleryPhoto[]>([]);
  const [loading, setLoading] = useState(true);
  const [activePhotoIndex, setActivePhotoIndex] = useState<number | null>(null);

  // Comments state for the active photo
  const [comments, setComments] = useState<PhotoComment[]>([]);
  const [loadingComments, setLoadingComments] = useState(false);
  const [newCommentText, setNewCommentText] = useState('');
  const [authorInputName, setAuthorInputName] = useState(guestName || '');
  const [isSubmittingComment, setIsSubmittingComment] = useState(false);
  const [likedPhotoIds, setLikedPhotoIds] = useState<number[]>([]);
  const [photoCommentsMap, setPhotoCommentsMap] = useState<Record<number, PhotoComment[]>>({});

  const activePhoto = activePhotoIndex !== null && photos[activePhotoIndex] ? photos[activePhotoIndex] : null;

  // Fetch comments when active photo changes
  useEffect(() => {
    if (!activePhoto) {
      setComments([]);
      return;
    }

    const fetchComments = async () => {
      try {
        setLoadingComments(true);
        const res = await fetch(`/api/gallery/${activePhoto.id}/comments?weddingId=${weddingId}`);
        const data = await res.json();
        if (Array.isArray(data)) {
          setComments(data);
          setPhotoCommentsMap((prev) => ({ ...prev, [activePhoto.id]: data }));
        }
      } catch (err) {
        console.error('Error loading comments:', err);
      } finally {
        setLoadingComments(false);
      }
    };

    fetchComments();
  }, [activePhoto?.id, weddingId]);

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
    if (photos.length === 0) return;
    setActivePhotoIndex((prev) => (prev === null || prev === 0 ? photos.length - 1 : prev - 1));
  };

  const handleNextPhoto = (e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    if (photos.length === 0) return;
    setActivePhotoIndex((prev) => (prev === null || prev === photos.length - 1 ? 0 : prev + 1));
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
  }, [activePhotoIndex, photos.length]);


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

  const handleLike = async (photoId: number, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
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
      const res = await fetch(`/api/gallery/${activePhoto.id}/comments`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      const createdComment = await res.json();
      if (createdComment && createdComment.id) {
        setComments((prev) => [...prev, createdComment]);
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

  const effectiveAlbumUrl = externalAlbumUrl || settings?.galleryExternalAlbumUrl;
  const effectiveAlbumTitle = externalAlbumTitle || settings?.galleryExternalAlbumTitle || 'Álbum Fotográfico Completo';
  const isDark = cardStyle === 'dark-luxury';
  const activeTheme = CARD_THEMES[cardStyle as keyof typeof CARD_THEMES] || CARD_THEMES['classic-gold'];

  const [carouselIndex, setCarouselIndex] = useState(0);
  const [isAutoPlay, setIsAutoPlay] = useState(true);
  const [isHovered, setIsHovered] = useState(false);
  const [photoRatios, setPhotoRatios] = useState<Record<number, number>>({});

  // Auto-play timer (slides every 4.5 seconds when active and not hovered)
  useEffect(() => {
    if (!isAutoPlay || isHovered || photos.length <= 1 || activePhotoIndex !== null) return;
    const interval = setInterval(() => {
      setCarouselIndex((prev) => (prev === photos.length - 1 ? 0 : prev + 1));
    }, 4500);
    return () => clearInterval(interval);
  }, [isAutoPlay, isHovered, photos.length, activePhotoIndex]);

  const handleImageLoad = (photoId: number, e: React.SyntheticEvent<HTMLImageElement>) => {
    const img = e.currentTarget;
    if (img.naturalWidth && img.naturalHeight) {
      const ratio = img.naturalWidth / img.naturalHeight;
      setPhotoRatios((prev) => ({ ...prev, [photoId]: ratio }));
    }
  };

  const handlePrevCarousel = () => {
    if (photos.length === 0) return;
    setCarouselIndex((prev) => (prev === 0 ? photos.length - 1 : prev - 1));
  };

  const handleNextCarousel = () => {
    if (photos.length === 0) return;
    setCarouselIndex((prev) => (prev === photos.length - 1 ? 0 : prev + 1));
  };

  const currentCarouselPhoto = photos[carouselIndex] || photos[0];

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
          Nuestra Galería de Fotos
        </h2>
        <StyleSpecificDivider
          cardStyle={cardStyle}
          className="w-48 sm:w-60 h-8 mx-auto mt-2"
          color={activeTheme?.accentColorHex}
        />
        <p className={`text-sm max-w-xl mx-auto mt-2 leading-relaxed font-serif italic ${isDark ? 'text-stone-300' : 'text-stone-600'
          }`}>
          Desliza o usa los botones para revivir nuestras sesiones y momentos favoritos juntos.
        </p>

        {/* External Cloud Album Banner (Google Photos, Apple Photos, Drive, etc.) */}
        {effectiveAlbumUrl && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className={`mt-6 max-w-lg mx-auto rounded-2xl p-4 flex items-center justify-between gap-3 shadow-xs border ${isDark
                ? 'bg-[#282B25] border-[#C5A059]/40 text-stone-100'
                : 'bg-amber-50/90 border-amber-300/80 text-amber-950'
              }`}
          >
            <div className="flex items-center gap-3 text-left">
              <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${isDark ? 'bg-[#C5A059]/20 text-[#C5A059]' : 'bg-amber-200/80 text-amber-900'
                }`}>
                <Globe className="w-5 h-5" />
              </div>
              <div className="min-w-0">
                <div className={`text-xs font-serif font-bold truncate ${isDark ? 'text-[#FDFCF0]' : 'text-amber-950'}`}>
                  {effectiveAlbumTitle}
                </div>
                <div className={`text-[11px] truncate ${isDark ? 'text-stone-400' : 'text-amber-800/80'}`}>
                  Álbum oficial en la nube para ver todas las fotos en alta resolución
                </div>
              </div>
            </div>
            <a
              href={effectiveAlbumUrl}
              target="_blank"
              rel="noopener noreferrer"
              className={`px-4 py-2 rounded-xl text-xs font-semibold shrink-0 flex items-center gap-1.5 shadow-xs transition-colors ${isDark
                  ? 'bg-[#C5A059] text-stone-950 hover:bg-[#d8b46d] font-bold'
                  : 'bg-amber-800 hover:bg-amber-900 text-amber-50'
                }`}
            >
              <span>Abrir Álbum</span>
              <ExternalLink className="w-3.5 h-3.5" />
            </a>
          </motion.div>
        )}
      </div>

      {/* Interactive Carousel Slider Container */}
      {loading ? (
        <div className={`py-20 text-center text-sm flex items-center justify-center gap-2 ${isDark ? 'text-stone-400' : 'text-stone-400'}`}>
          <Loader2 className={`w-4 h-4 animate-spin ${isDark ? 'text-[#C5A059]' : 'text-amber-700'}`} />
          <span>Cargando fotos de la galería...</span>
        </div>
      ) : photos.length === 0 ? (
        <div className={`py-16 text-center backdrop-blur-sm rounded-3xl p-8 max-w-md mx-auto shadow-xs border ${isDark
            ? 'bg-[#282B25]/90 border-[#5A5A40]/60 text-stone-200'
            : 'bg-white/70 border-[#E5E2D0] text-stone-800'
          }`}>
          <Camera className={`w-12 h-12 mx-auto mb-3 ${isDark ? 'text-[#C5A059]' : 'text-[#7D8C7A]/70'}`} />
          <h4 className={`text-base font-serif font-semibold ${isDark ? 'text-[#FDFCF0]' : 'text-stone-800'}`}>
            Galería en preparación
          </h4>
          <p className={`text-xs mt-1 leading-relaxed ${isDark ? 'text-stone-400' : 'text-stone-500'}`}>
            Las fotografías y momentos oficiales de la boda serán compartidos aquí por los novios.
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
                        style={{ backgroundImage: `url(${currentCarouselPhoto.url})` }}
                      />

                      <img
                        src={currentCarouselPhoto.url}
                        alt={currentCarouselPhoto.caption || 'Foto de boda'}
                        onLoad={(e) => handleImageLoad(currentCarouselPhoto.id, e)}
                        className="relative z-10 w-full h-full object-contain sm:object-cover transition-transform duration-700 group-hover:scale-103"
                        referrerPolicy="no-referrer"
                      />

                      {/* Gradient Overlay at bottom for caption, comments and badges */}
                      <div className="absolute inset-0 z-20 bg-gradient-to-t from-black/95 via-black/35 to-transparent flex flex-col justify-between p-4 sm:p-6 text-white pointer-events-none">
                        {/* Top Action Bar: Likes & Comments count at top-right */}
                        <div className="flex justify-end items-center pointer-events-auto w-full">
                          <div className="flex items-center gap-2">
                            <button
                              type="button"
                              onClick={(e) => handleLike(currentCarouselPhoto.id, e)}
                              className="px-3 py-1.5 rounded-full bg-black/60 backdrop-blur-md hover:bg-rose-600/80 text-white transition-colors flex items-center gap-1.5 text-xs border border-white/20 cursor-pointer shadow-sm"
                            >
                              <Heart className="w-4 h-4 fill-rose-500 text-rose-500 shrink-0" />
                              <span>{currentCarouselPhoto.likesCount}</span>
                            </button>

                            <button
                              type="button"
                              onClick={() => setActivePhotoIndex(carouselIndex)}
                              className="px-3 py-1.5 rounded-full bg-black/60 backdrop-blur-md hover:bg-amber-500/80 text-white transition-colors flex items-center gap-1.5 text-xs border border-white/20 cursor-pointer shadow-sm"
                              title="Ver en pantalla completa con comentarios"
                            >
                              <MessageCircle className="w-3.5 h-3.5 text-amber-300" />
                              <span>
                                {(photoCommentsMap[currentCarouselPhoto.id]?.length || 0) > 0
                                  ? `${photoCommentsMap[currentCarouselPhoto.id].length} Comentarios`
                                  : 'Comentar'}
                              </span>
                            </button>
                          </div>
                        </div>

                        {/* Bottom Area: Animated Comments + Badge + Caption */}
                        <div className="space-y-2 pointer-events-auto max-w-2xl">
                          {photoCommentsMap[currentCarouselPhoto.id] && photoCommentsMap[currentCarouselPhoto.id].length > 0 && (
                            <div className="space-y-2 mb-3">
                              {photoCommentsMap[currentCarouselPhoto.id].slice(0, 2).map((comm, cIdx) => {
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
                                      {comm.authorName?.charAt(0).toUpperCase() || 'I'}
                                    </div>
                                    <div className="min-w-0 flex-1">
                                      <span className="font-semibold text-amber-300 mr-1.5">
                                        {comm.authorName || 'Invitado'}:
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
                              {currentCarouselPhoto.caption ? 'Sesión de Fotos' : 'Foto de los Novios'}
                            </span>
                          </div>

                          {currentCarouselPhoto.caption && (
                            <p className="text-sm sm:text-base font-serif font-medium text-stone-100 mb-1 drop-shadow-md">
                              {currentCarouselPhoto.caption}
                            </p>
                          )}
                          <p className="text-xs text-amber-200/90 font-serif italic drop-shadow-sm">
                            {currentCarouselPhoto.authorName ? `Fotografía: ${currentCarouselPhoto.authorName}` : 'Recuerdos de los novios'}
                          </p>
                        </div>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>

            {/* Left Carousel Navigation Button */}
            {photos.length > 1 && (
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
            {photos.length > 1 && (
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
                <span>{photos.length}</span>
              </div>

              {photos.length > 1 && (
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
          {photos.length > 1 && (
            <div className="mt-4 flex items-center justify-center gap-2.5 overflow-x-auto py-2 px-2 no-scrollbar">
              {photos.map((photo, idx) => (
                <button
                  key={photo.id}
                  type="button"
                  onClick={() => setCarouselIndex(idx)}
                  className={`relative w-14 h-14 sm:w-16 sm:h-16 rounded-2xl overflow-hidden shrink-0 transition-all cursor-pointer border-2 ${idx === carouselIndex
                      ? isDark
                        ? 'border-[#C5A059] ring-2 ring-[#C5A059]/40 scale-105 opacity-100 shadow-md'
                        : 'border-[#5A5A40] ring-2 ring-[#5A5A40]/30 scale-105 opacity-100 shadow-md'
                      : 'border-transparent opacity-45 hover:opacity-85 hover:scale-100'
                    }`}
                >
                  <img
                    src={photo.url}
                    alt="Miniatura"
                    className="w-full h-full object-cover"
                    loading="lazy"
                  />
                </button>
              ))}
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
                  <p className="text-xs text-stone-400">Comparte tu recuerdo con los novios</p>
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
                    placeholder="Ej. ¡Felicidades a los novios! / Momento inolvidable"
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
                  className="relative w-[96vw] max-w-7xl h-[94vh] bg-stone-950 rounded-2xl sm:rounded-3xl overflow-hidden shadow-2xl border border-stone-800 flex flex-col lg:flex-row animate-in fade-in zoom-in-95 duration-200"
                >
                  {/* Close Button Top Right */}
                  <button
                    type="button"
                    onClick={() => setActivePhotoIndex(null)}
                    className="absolute top-4 right-4 z-30 w-11 h-11 rounded-full bg-black/75 hover:bg-black text-white flex items-center justify-center border border-white/20 shadow-lg cursor-pointer transition-all hover:scale-105"
                    title="Cerrar galería (Esc)"
                  >
                    <X className="w-6 h-6" />
                  </button>

                  {/* Huge Immersive Photo Carousel Display Area */}
                  <div className="flex-1 bg-black/80 flex flex-col justify-between items-center p-2 sm:p-4 min-h-0 overflow-hidden relative select-none">

                    {/* Photo Position Counter at top */}
                    <div className="absolute top-4 left-4 z-20 bg-black/60 backdrop-blur-md px-3.5 py-1.5 rounded-full border border-white/10 text-xs font-mono font-medium text-stone-300 flex items-center gap-2">
                      <span className="text-amber-300 font-bold">{(activePhotoIndex ?? 0) + 1}</span>
                      <span className="text-stone-500">/</span>
                      <span>{photos.length}</span>
                    </div>

                    {/* Left Carousel Navigation Button */}
                    {photos.length > 1 && (
                      <button
                        type="button"
                        onClick={handlePrevPhoto}
                        className="absolute left-3 sm:left-5 top-1/2 -translate-y-1/2 z-20 w-12 h-12 rounded-full bg-black/60 hover:bg-black/90 text-white flex items-center justify-center border border-white/20 backdrop-blur-md shadow-xl cursor-pointer transition-all hover:scale-110 active:scale-95"
                        title="Foto anterior (Flecha Izquierda)"
                      >
                        <ChevronLeft className="w-7 h-7 -translate-x-0.5" />
                      </button>
                    )}

                    {/* Right Carousel Navigation Button */}
                    {photos.length > 1 && (
                      <button
                        type="button"
                        onClick={handleNextPhoto}
                        className="absolute right-3 sm:right-5 top-1/2 -translate-y-1/2 z-20 w-12 h-12 rounded-full bg-black/60 hover:bg-black/90 text-white flex items-center justify-center border border-white/20 backdrop-blur-md shadow-xl cursor-pointer transition-all hover:scale-110 active:scale-95"
                        title="Siguiente foto (Flecha Derecha)"
                      >
                        <ChevronRight className="w-7 h-7 translate-x-0.5" />
                      </button>
                    )}

                    {/* Main Photo with smooth transition */}
                    <div className="flex-1 w-full flex flex-col items-center justify-center min-h-0 relative px-2">
                      <AnimatePresence mode="wait">
                        <motion.div
                          key={activePhoto.id}
                          initial={{ opacity: 0, scale: 0.98 }}
                          animate={{ opacity: 1, scale: 1 }}
                          exit={{ opacity: 0, scale: 0.98 }}
                          transition={{ duration: 0.25 }}
                          className="flex flex-col items-center justify-center max-h-[72vh] w-full"
                        >
                          <img
                            src={activePhoto.url}
                            alt={activePhoto.caption || 'Foto de boda'}
                            className="max-h-[66vh] w-auto max-w-full object-contain rounded-xl shadow-2xl"
                            referrerPolicy="no-referrer"
                          />

                          {/* Photo Subtitle (Author & Date underneath the photo) */}
                          <div className="mt-2.5 flex items-center justify-center gap-3 text-xs sm:text-sm text-stone-300 font-serif">
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

                    {/* Bottom Thumbnails Carousel Bar */}
                    {photos.length > 1 && (
                      <div className="w-full pt-2 flex items-center justify-center gap-2 overflow-x-auto pb-1 max-w-2xl px-4 no-scrollbar shrink-0 z-20">
                        {photos.map((p, idx) => (
                          <button
                            key={p.id}
                            type="button"
                            onClick={() => setActivePhotoIndex(idx)}
                            className={`relative w-12 h-12 sm:w-14 sm:h-14 rounded-xl overflow-hidden shrink-0 transition-all cursor-pointer border-2 ${idx === activePhotoIndex
                              ? 'border-amber-400 ring-2 ring-amber-400/40 scale-105 opacity-100'
                              : 'border-transparent opacity-40 hover:opacity-80'
                              }`}
                          >
                            <img src={p.url} alt="Miniatura" className="w-full h-full object-cover" />
                          </button>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Sidebar Info, Likes & Interactive Comments Panel */}
                  <div className="w-full lg:w-[440px] flex flex-col justify-between bg-stone-900/95 text-stone-100 border-t lg:border-t-0 lg:border-l border-stone-800 shrink-0 max-h-[94vh] overflow-hidden">

                    {/* Header & Photo Title - With clean spacing from close button */}
                    <div className="p-5 sm:p-6 pr-16 pb-4 border-b border-stone-800/80 shrink-0 relative">
                      <span className="text-xs uppercase font-bold tracking-widest bg-amber-500/20 text-amber-300 border border-amber-500/30 px-3.5 py-1 rounded-full inline-block mb-2.5">
                        {activePhoto.caption ? 'Sesión de Fotos' : 'Álbum de los Novios'}
                      </span>

                      <h3 className="text-lg sm:text-xl font-serif font-semibold text-white leading-snug">
                        {activePhoto.caption || 'Recuerdo de la Boda'}
                      </h3>
                    </div>

                    {/* Interactive Comments List (Scrollable) */}
                    <div className="flex-1 p-5 sm:p-6 py-4 overflow-y-auto space-y-3 min-h-0 custom-scrollbar">
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
                          <p className="text-xs text-stone-500 mt-1">Deja un lindo mensaje o recuerdo para los novios.</p>
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

                    {/* Write Comment Box & Like Bar - Larger Inputs & Clearer Controls */}
                    <div className="p-4 sm:p-6 bg-stone-950/95 border-t border-stone-800 shrink-0 space-y-3.5">

                      {/* Action Bar (Like + Download) */}
                      <div className="flex items-center justify-between gap-3">
                        <button
                          type="button"
                          onClick={() => handleLike(activePhoto.id)}
                          className={`flex-1 flex items-center justify-center gap-2 py-3 px-5 rounded-2xl border transition-all cursor-pointer text-sm font-semibold shadow-sm ${likedPhotoIds.includes(activePhoto.id)
                              ? 'bg-rose-950/60 border-rose-600 text-rose-200'
                              : 'bg-stone-800 hover:bg-rose-950/40 text-stone-100 hover:text-rose-300 border-stone-700'
                            }`}
                        >
                          <Heart
                            className={`w-4 h-4 shrink-0 transition-transform ${likedPhotoIds.includes(activePhoto.id)
                                ? 'fill-rose-500 text-rose-500 scale-110'
                                : 'fill-rose-500 text-rose-500'
                              }`}
                          />
                          <span>
                            {activePhoto.likesCount} {activePhoto.likesCount === 1 ? 'Me gusta' : 'Me gusta'}
                          </span>
                        </button>

                        <a
                          href={activePhoto.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          download
                          className="p-3 rounded-2xl bg-stone-800 hover:bg-stone-700 text-stone-200 border border-stone-700 transition-colors flex items-center justify-center shadow-sm"
                          title="Abrir imagen original en alta resolución"
                        >
                          <ExternalLink className="w-5 h-5" />
                        </a>
                      </div>

                      {/* Comment Input Form - Increased Height & Typography */}
                      <form onSubmit={handleAddComment} className="space-y-2.5">
                        <div className="flex items-center gap-2">
                          <div className="relative flex-1">
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
