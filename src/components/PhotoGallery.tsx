import React, { useState, useEffect } from 'react';
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
} from 'lucide-react';
import { GalleryPhoto, PhotoComment, WeddingSettings } from '../types.ts';
import { AnimatedCameraLens, StyleSpecificDivider } from './AnimatedSvgs.tsx';
import { CARD_THEMES } from '../lib/themes.ts';

interface PhotoGalleryProps {
  weddingId?: number;
  guestName?: string;
  guestCode?: string;
  cardStyle?: string;
  externalAlbumUrl?: string;
  externalAlbumTitle?: string;
  externalAlbumType?: string;
  settings?: WeddingSettings;
}

export const PhotoGallery: React.FC<PhotoGalleryProps> = ({
  weddingId = 1,
  guestName = '',
  guestCode = '',
  cardStyle = 'classic-gold',
  externalAlbumUrl,
  externalAlbumTitle,
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
        }
      } catch (err) {
        console.error('Error loading comments:', err);
      } finally {
        setLoadingComments(false);
      }
    };

    fetchComments();
  }, [activePhoto?.id, weddingId]);

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

  const effectiveAlbumUrl = externalAlbumUrl || settings?.galleryExternalAlbumUrl;
  const effectiveAlbumTitle = externalAlbumTitle || settings?.galleryExternalAlbumTitle || 'Álbum Fotográfico Completo';
  const isDark = cardStyle === 'dark-luxury';
  const activeTheme = CARD_THEMES[cardStyle as keyof typeof CARD_THEMES] || CARD_THEMES['classic-gold'];

  const [carouselIndex, setCarouselIndex] = useState(0);

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
        <div className={`w-14 h-14 rounded-2xl flex items-center justify-center mx-auto mb-3 border shadow-xs ${
          isDark
            ? 'bg-[#C5A059]/15 text-[#C5A059] border-[#5A5A40]/60'
            : 'bg-[#5A5A40]/10 text-[#5A5A40] border-[#E5E2D0]'
        }`}>
          <AnimatedCameraLens className="w-10 h-10" />
        </div>
        <span className={`text-xs uppercase tracking-[0.3em] font-semibold block mb-2 ${
          isDark ? 'text-[#C5A059]' : 'text-[#7D8C7A]'
        }`}>
          Sesión de Fotos & Recuerdos
        </span>
        <h2 className={`text-3xl sm:text-5xl font-serif font-normal ${
          isDark ? 'text-[#FDFCF0]' : 'text-[#3D3D2C]'
        }`}>
          Nuestra Galería de Fotos
        </h2>
        <StyleSpecificDivider
          cardStyle={cardStyle}
          className="w-48 sm:w-60 h-8 mx-auto mt-2"
          color={activeTheme?.accentColorHex}
        />
        <p className={`text-sm max-w-xl mx-auto mt-2 leading-relaxed font-serif italic ${
          isDark ? 'text-stone-300' : 'text-stone-600'
        }`}>
          Desliza o usa los botones para revivir nuestras sesiones y momentos favoritos juntos.
        </p>

        {/* External Cloud Album Banner (Google Photos, Apple Photos, Drive, etc.) */}
        {effectiveAlbumUrl && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className={`mt-6 max-w-lg mx-auto rounded-2xl p-4 flex items-center justify-between gap-3 shadow-xs border ${
              isDark
                ? 'bg-[#282B25] border-[#C5A059]/40 text-stone-100'
                : 'bg-amber-50/90 border-amber-300/80 text-amber-950'
            }`}
          >
            <div className="flex items-center gap-3 text-left">
              <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${
                isDark ? 'bg-[#C5A059]/20 text-[#C5A059]' : 'bg-amber-200/80 text-amber-900'
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
              className={`px-4 py-2 rounded-xl text-xs font-semibold shrink-0 flex items-center gap-1.5 shadow-xs transition-colors ${
                isDark
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
        <div className={`py-16 text-center backdrop-blur-sm rounded-3xl p-8 max-w-md mx-auto shadow-xs border ${
          isDark
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
              className={`mt-4 inline-flex items-center gap-1.5 px-5 py-2.5 rounded-full text-xs font-medium shadow-xs transition-colors ${
                isDark
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
        <div className="max-w-4xl mx-auto">
          {/* Main Hero Slider Frame */}
          <div className="relative rounded-3xl overflow-hidden shadow-2xl bg-stone-950 aspect-[4/3] sm:aspect-[16/10] md:aspect-[16/9] border border-[#E5E2D0]/40 group select-none">
            
            {/* Current Photo Slide with AnimatePresence */}
            <AnimatePresence mode="wait">
              {currentCarouselPhoto && (
                <motion.div
                  key={currentCarouselPhoto.id}
                  initial={{ opacity: 0, scale: 0.98 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.98 }}
                  transition={{ duration: 0.35, ease: 'easeOut' }}
                  onClick={() => setActivePhotoIndex(carouselIndex)}
                  className="w-full h-full cursor-pointer relative"
                >
                  <img
                    src={currentCarouselPhoto.url}
                    alt={currentCarouselPhoto.caption || 'Foto de boda'}
                    className="w-full h-full object-contain sm:object-cover bg-stone-950 transition-transform duration-700 group-hover:scale-105"
                    referrerPolicy="no-referrer"
                  />

                  {/* Gradient Overlay at bottom for caption and badges */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/20 to-transparent flex flex-col justify-between p-4 sm:p-6 text-white pointer-events-none">
                    <div className="flex justify-between items-center pointer-events-auto">
                      <span className="text-[11px] uppercase font-bold tracking-widest bg-black/50 backdrop-blur-md px-3.5 py-1.5 rounded-full border border-white/20 text-amber-200">
                        {currentCarouselPhoto.caption ? 'Sesión de Fotos' : 'Foto de los Novios'}
                      </span>
                      
                      <div className="flex items-center gap-2">
                        <button
                          type="button"
                          onClick={(e) => handleLike(currentCarouselPhoto.id, e)}
                          className="px-3 py-1.5 rounded-full bg-black/50 backdrop-blur-md hover:bg-rose-600/80 text-white transition-colors flex items-center gap-1.5 text-xs border border-white/20 cursor-pointer"
                        >
                          <Heart className="w-4 h-4 fill-rose-500 text-rose-500 shrink-0" />
                          <span>{currentCarouselPhoto.likesCount}</span>
                        </button>

                        <button
                          type="button"
                          onClick={() => setActivePhotoIndex(carouselIndex)}
                          className="px-3 py-1.5 rounded-full bg-black/50 backdrop-blur-md hover:bg-amber-500/80 text-white transition-colors flex items-center gap-1.5 text-xs border border-white/20 cursor-pointer"
                          title="Ver en pantalla completa con comentarios"
                        >
                          <Sparkles className="w-3.5 h-3.5 text-amber-300" />
                          <span className="hidden sm:inline">Comentar / Ampliar</span>
                        </button>
                      </div>
                    </div>

                    <div className="pointer-events-auto">
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

            {/* Slide Index Pill */}
            <div className="absolute top-4 left-4 z-20 bg-black/60 backdrop-blur-md px-3 py-1 rounded-full border border-white/20 text-xs font-mono text-stone-300 flex items-center gap-1.5 pointer-events-none">
              <span className="text-amber-300 font-bold">{carouselIndex + 1}</span>
              <span className="text-stone-500">/</span>
              <span>{photos.length}</span>
            </div>
          </div>

          {/* Horizontal Thumbnails Strip Slider */}
          {photos.length > 1 && (
            <div className="mt-4 flex items-center justify-center gap-2.5 overflow-x-auto py-2 px-2 no-scrollbar">
              {photos.map((photo, idx) => (
                <button
                  key={photo.id}
                  type="button"
                  onClick={() => setCarouselIndex(idx)}
                  className={`relative w-14 h-14 sm:w-16 sm:h-16 rounded-2xl overflow-hidden shrink-0 transition-all cursor-pointer border-2 ${
                    idx === carouselIndex
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

          {/* Inline Action Indicator */}
          <div className="mt-4 text-center">
            <button
              type="button"
              onClick={() => setActivePhotoIndex(carouselIndex)}
              className={`inline-flex items-center gap-2 px-5 py-2 rounded-full text-xs font-serif font-semibold border transition-all cursor-pointer hover:scale-105 ${
                isDark
                  ? 'bg-[#282B25] border-[#5A5A40] text-stone-200 hover:text-white'
                  : 'bg-white/80 border-[#E5E2D0] text-[#3D3D2C] hover:bg-white'
              }`}
            >
              <Sparkles className="w-3.5 h-3.5 text-amber-500" />
              <span>Ver en modo pantalla completa y dejar dedicatoria</span>
            </button>
          </div>
        </div>
      )}

      {/* Lightbox Modal - Full Viewport Interactive Carousel (Highest z-index above demo header) */}
      <AnimatePresence>
        {activePhoto && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setActivePhotoIndex(null)}
            className="fixed inset-0 z-[9995] bg-black/95 backdrop-blur-xl flex items-center justify-center p-2 sm:p-4 lg:p-6"
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
                      <div className="mt-2.5 flex items-center justify-center gap-3 text-xs text-stone-300 font-serif">
                        {activePhoto.authorName && (
                          <span className="text-amber-200/90 italic">
                            Fotografía por: {activePhoto.authorName}
                          </span>
                        )}
                        {activePhoto.authorName && activePhoto.createdAt && (
                          <span className="text-stone-600">•</span>
                        )}
                        {activePhoto.createdAt && (
                          <span className="text-stone-400 font-mono text-[11px]">
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
              <div className="w-full lg:w-[420px] flex flex-col justify-between bg-stone-900/95 text-stone-100 border-t lg:border-t-0 lg:border-l border-stone-800 shrink-0 max-h-[94vh] overflow-hidden">
                
                {/* Header & Photo Title - With clean spacing from close button */}
                <div className="p-5 sm:p-6 pr-16 pb-4 border-b border-stone-800/80 shrink-0 relative">
                  <span className="text-[10px] uppercase font-bold tracking-widest bg-amber-500/20 text-amber-300 border border-amber-500/30 px-3 py-1 rounded-full inline-block mb-2">
                    {activePhoto.caption ? 'Sesión de Fotos' : 'Álbum de los Novios'}
                  </span>

                  <h3 className="text-base sm:text-lg font-serif font-semibold text-white leading-snug">
                    {activePhoto.caption || 'Recuerdo de la Boda'}
                  </h3>
                </div>

                {/* Interactive Comments List (Scrollable) */}
                <div className="flex-1 p-5 sm:p-6 py-3 overflow-y-auto space-y-3 min-h-0 custom-scrollbar">
                  <div className="flex items-center justify-between text-xs text-stone-400 pb-1 border-b border-stone-800/40">
                    <div className="flex items-center gap-1.5 font-semibold text-stone-300">
                      <MessageCircle className="w-3.5 h-3.5 text-amber-400" />
                      <span>Comentarios & Dedicatorias</span>
                    </div>
                    <span className="text-[11px] font-mono text-stone-400 bg-stone-800/60 px-2 py-0.5 rounded-full">
                      {comments.length}
                    </span>
                  </div>

                  {loadingComments ? (
                    <div className="py-6 text-center text-xs text-stone-500 flex items-center justify-center gap-2">
                      <Loader2 className="w-3.5 h-3.5 animate-spin text-amber-400" />
                      <span>Cargando comentarios...</span>
                    </div>
                  ) : comments.length === 0 ? (
                    <div className="py-8 text-center bg-stone-950/40 rounded-2xl border border-dashed border-stone-800 p-4">
                      <MessageCircle className="w-6 h-6 text-stone-600 mx-auto mb-1.5" />
                      <p className="text-xs text-stone-400 font-medium">Sé el primero en comentar esta foto</p>
                      <p className="text-[11px] text-stone-500 mt-0.5">Deja un lindo mensaje o recuerdo para los novios.</p>
                    </div>
                  ) : (
                    comments.map((c) => (
                      <div
                        key={c.id}
                        className="bg-stone-950/60 border border-stone-800/80 rounded-2xl p-3.5 space-y-1 hover:border-stone-700/60 transition-colors animate-in fade-in"
                      >
                        <div className="flex items-center justify-between gap-2">
                          <div className="flex items-center gap-1.5 min-w-0">
                            <div className="w-5 h-5 rounded-full bg-amber-500/20 text-amber-300 flex items-center justify-center text-[10px] font-bold shrink-0">
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
                        <p className="text-xs text-stone-300 leading-relaxed pl-6">
                          {c.message}
                        </p>
                      </div>
                    ))
                  )}
                </div>

                {/* Write Comment Box & Like Bar */}
                <div className="p-4 sm:p-5 bg-stone-950/90 border-t border-stone-800 shrink-0 space-y-3">
                  
                  {/* Action Bar (Like + Download) */}
                  <div className="flex items-center justify-between gap-3">
                    <button
                      type="button"
                      onClick={() => handleLike(activePhoto.id)}
                      className={`flex-1 flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl border transition-all cursor-pointer text-xs font-semibold shadow-xs ${
                        likedPhotoIds.includes(activePhoto.id)
                          ? 'bg-rose-950/50 border-rose-700/80 text-rose-300'
                          : 'bg-stone-800 hover:bg-rose-950/30 text-stone-200 hover:text-rose-400 border-stone-700'
                      }`}
                    >
                      <Heart
                        className={`w-4 h-4 shrink-0 transition-transform ${
                          likedPhotoIds.includes(activePhoto.id)
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
                      className="p-2.5 rounded-xl bg-stone-800 hover:bg-stone-700 text-stone-200 border border-stone-700 transition-colors flex items-center justify-center shadow-xs"
                      title="Abrir imagen original en alta resolución"
                    >
                      <ExternalLink className="w-4 h-4" />
                    </a>
                  </div>

                  {/* Comment Input Form */}
                  <form onSubmit={handleAddComment} className="space-y-2">
                    <div className="flex items-center gap-2">
                      <div className="relative flex-1">
                        <User className="w-3.5 h-3.5 text-stone-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
                        <input
                          type="text"
                          value={authorInputName}
                          onChange={(e) => setAuthorInputName(e.target.value)}
                          placeholder="Tu nombre (ej. Familia Pérez)"
                          className="w-full pl-8 pr-3 py-1.5 rounded-xl bg-stone-900 border border-stone-700 text-xs text-stone-100 placeholder-stone-400 focus:outline-none focus:border-amber-400 focus:ring-1 focus:ring-amber-400"
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
                        className="flex-1 px-3 py-2 rounded-xl bg-stone-900 border border-stone-700 text-xs text-stone-100 placeholder-stone-400 focus:outline-none focus:border-amber-400 focus:ring-1 focus:ring-amber-400"
                        required
                      />
                      <button
                        type="submit"
                        disabled={isSubmittingComment || !newCommentText.trim()}
                        className="px-4 py-2 rounded-xl bg-amber-600 hover:bg-amber-500 disabled:opacity-50 text-white text-xs font-semibold flex items-center justify-center gap-1.5 transition-all shadow-xs cursor-pointer shrink-0"
                        title="Enviar comentario"
                      >
                        {isSubmittingComment ? (
                          <Loader2 className="w-4 h-4 animate-spin" />
                        ) : (
                          <>
                            <span>Enviar</span>
                            <Send className="w-3.5 h-3.5" />
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
      </AnimatePresence>
    </section>
  );
};
