import React, { useState, useEffect } from 'react';
import {
  Heart,
  MessageCircle,
  Camera,
  Trash2,
  ExternalLink,
  Loader2,
  TrendingUp,
  Sparkles,
  User,
  Calendar,
  Image as ImageIcon,
  Clock,
  Filter,
} from 'lucide-react';
import { GalleryPhoto, PhotoComment, WeddingSettings } from '../../../types.ts';
import { toast } from '../../../lib/toast.ts';

interface AdminGalleryTabProps {
  settings: WeddingSettings;
  onOpenPhotoInSimulator?: (photo: GalleryPhoto) => void;
}

export const AdminGalleryTab: React.FC<AdminGalleryTabProps> = ({
  settings,
}) => {
  const [photos, setPhotos] = useState<GalleryPhoto[]>([]);
  const [comments, setComments] = useState<PhotoComment[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedPhotoFilter, setSelectedPhotoFilter] = useState<number | 'all'>('all');
  const [commentSearch, setCommentSearch] = useState('');
  const [isDeletingCommentId, setIsDeletingCommentId] = useState<number | null>(null);

  const weddingId = settings.id || 1;

  const loadData = async () => {
    try {
      setLoading(true);
      const [photosRes, commentsRes] = await Promise.all([
        fetch(`/api/gallery?weddingId=${weddingId}`),
        fetch(`/api/gallery-comments?weddingId=${weddingId}`),
      ]);

      const photosData = await photosRes.json();
      const commentsData = await commentsRes.json();

      if (Array.isArray(photosData)) setPhotos(photosData);
      if (Array.isArray(commentsData)) setComments(commentsData);
    } catch (err) {
      console.error('Error loading gallery admin metrics:', err);
      toast.error('Error al cargar métricas de la galería', 'Error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [weddingId]);

  const handleDeleteComment = async (commentId: number) => {
    if (!confirm('¿Estás seguro de que deseas eliminar este comentario?')) return;
    try {
      setIsDeletingCommentId(commentId);
      await fetch(`/api/gallery/comments/${commentId}`, { method: 'DELETE' });
      setComments((prev) => prev.filter((c) => c.id !== commentId));
      toast.success('Comentario eliminado con éxito', 'Eliminado');
    } catch (err) {
      console.error('Error deleting comment:', err);
      toast.error('Error al eliminar comentario', 'Error');
    } finally {
      setIsDeletingCommentId(null);
    }
  };

  // Calculations
  const totalLikes = photos.reduce((acc, p) => acc + (p.likesCount || 0), 0);
  const totalComments = comments.length;
  const totalPhotos = photos.length;
  const topLikedPhoto = [...photos].sort((a, b) => (b.likesCount || 0) - (a.likesCount || 0))[0];

  // Filtered comments
  const filteredComments = comments.filter((c) => {
    const matchesPhoto = selectedPhotoFilter === 'all' || c.photoId === selectedPhotoFilter;
    const matchesText =
      !commentSearch ||
      c.guestName.toLowerCase().includes(commentSearch.toLowerCase()) ||
      c.message.toLowerCase().includes(commentSearch.toLowerCase());
    return matchesPhoto && matchesText;
  });

  return (
    <div className="space-y-6 max-w-7xl mx-auto p-4 sm:p-6 lg:p-8">
      {/* 1. Header & Title */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-3xl border border-[#E5E2D0] shadow-xs">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-rose-100 text-rose-800 border border-rose-200">
              Interacción en Tiempo Real
            </span>
            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-amber-100 text-amber-900 border border-amber-200">
              {totalPhotos} Fotos en Galería
            </span>
          </div>
          <h2 className="text-xl sm:text-2xl font-serif font-bold text-stone-900">
            Métricas & Comentarios de la Galería
          </h2>
          <p className="text-xs text-stone-500 mt-1">
            Supervisa las reacciones con "Me gusta", lecturas y dedicatorias que los invitados dejan en tus fotografías de boda.
          </p>
        </div>

        <button
          type="button"
          onClick={loadData}
          disabled={loading}
          className="px-4 py-2 rounded-xl bg-[#FAF9F0] hover:bg-[#F2EFE0] text-[#5A5A40] border border-[#E5E2D0] text-xs font-semibold flex items-center gap-1.5 transition-all shadow-2xs self-start sm:self-auto cursor-pointer"
        >
          {loading ? (
            <Loader2 className="w-3.5 h-3.5 animate-spin" />
          ) : (
            <Sparkles className="w-3.5 h-3.5" />
          )}
          <span>Actualizar Datos</span>
        </button>
      </div>

      {/* 2. Top KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Likes */}
        <div className="bg-white p-5 rounded-2xl border border-[#E5E2D0] shadow-2xs flex items-center justify-between">
          <div>
            <span className="text-[11px] font-semibold text-stone-500 uppercase tracking-wider block mb-1">
              Total "Me Gusta"
            </span>
            <h3 className="text-2xl sm:text-3xl font-serif font-bold text-rose-600">
              {totalLikes}
            </h3>
            <span className="text-[10px] text-stone-400 mt-0.5 block">
              Reacciones de los invitados
            </span>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-rose-50 text-rose-600 flex items-center justify-center border border-rose-100">
            <Heart className="w-6 h-6 fill-rose-500" />
          </div>
        </div>

        {/* Total Comments */}
        <div className="bg-white p-5 rounded-2xl border border-[#E5E2D0] shadow-2xs flex items-center justify-between">
          <div>
            <span className="text-[11px] font-semibold text-stone-500 uppercase tracking-wider block mb-1">
              Total Comentarios
            </span>
            <h3 className="text-2xl sm:text-3xl font-serif font-bold text-amber-700">
              {totalComments}
            </h3>
            <span className="text-[10px] text-stone-400 mt-0.5 block">
              Dedicatorias en fotos
            </span>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-amber-50 text-amber-700 flex items-center justify-center border border-amber-200">
            <MessageCircle className="w-6 h-6" />
          </div>
        </div>

        {/* Total Photos in Gallery */}
        <div className="bg-white p-5 rounded-2xl border border-[#E5E2D0] shadow-2xs flex items-center justify-between">
          <div>
            <span className="text-[11px] font-semibold text-stone-500 uppercase tracking-wider block mb-1">
              Fotos Publicadas
            </span>
            <h3 className="text-2xl sm:text-3xl font-serif font-bold text-[#5A5A40]">
              {totalPhotos}
            </h3>
            <span className="text-[10px] text-stone-400 mt-0.5 block">
              Colección fotográfica
            </span>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-[#FAF9F0] text-[#5A5A40] flex items-center justify-center border border-[#E5E2D0]">
            <Camera className="w-6 h-6" />
          </div>
        </div>

        {/* Most Popular Photo */}
        <div className="bg-white p-5 rounded-2xl border border-[#E5E2D0] shadow-2xs flex items-center justify-between">
          <div className="min-w-0 pr-2">
            <span className="text-[11px] font-semibold text-stone-500 uppercase tracking-wider block mb-1">
              Foto Más Querida
            </span>
            <h3 className="text-base font-serif font-bold text-stone-900 truncate">
              {topLikedPhoto ? (topLikedPhoto.caption || 'Foto de Boda') : 'Sin fotos'}
            </h3>
            <span className="text-[10px] text-rose-600 font-bold mt-0.5 flex items-center gap-1">
              <Heart className="w-3 h-3 fill-rose-500" /> {topLikedPhoto?.likesCount || 0} Me gusta
            </span>
          </div>
          {topLikedPhoto && (
            <img
              src={topLikedPhoto.url}
              alt="Foto destacada"
              className="w-12 h-12 rounded-2xl object-cover border border-[#E5E2D0] shrink-0"
            />
          )}
        </div>
      </div>

      {/* 3. Main Content: Left Column (Photos breakdown) & Right Column (Comments Feed) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        
        {/* Left Column: Photos Grid & Metrics Breakdown (lg:col-span-5) */}
        <div className="lg:col-span-5 bg-white p-5 sm:p-6 rounded-3xl border border-[#E5E2D0] shadow-xs space-y-4">
          <div className="flex items-center justify-between border-b border-[#E5E2D0] pb-3">
            <div className="flex items-center gap-2">
              <ImageIcon className="w-4 h-4 text-[#5A5A40]" />
              <h3 className="text-sm font-bold text-stone-900 font-serif">
                Rendimiento por Fotografía
              </h3>
            </div>
            <button
              type="button"
              onClick={() => setSelectedPhotoFilter('all')}
              className={`text-[11px] px-2.5 py-1 rounded-full font-semibold transition-colors cursor-pointer ${
                selectedPhotoFilter === 'all'
                  ? 'bg-[#5A5A40] text-white'
                  : 'bg-stone-100 text-stone-600 hover:bg-stone-200'
              }`}
            >
              Ver Todas
            </button>
          </div>

          {photos.length === 0 ? (
            <div className="p-8 text-center bg-[#FAF9F0] rounded-2xl border border-dashed border-[#E5E2D0]">
              <Camera className="w-8 h-8 text-stone-400 mx-auto mb-2" />
              <p className="text-xs text-stone-600">No hay fotos subidas en la galería todavía.</p>
            </div>
          ) : (
            <div className="space-y-2.5 max-h-[600px] overflow-y-auto pr-1 custom-scrollbar">
              {photos.map((photo, idx) => {
                const photoCommentsCount = comments.filter((c) => c.photoId === photo.id).length;
                const isSelected = selectedPhotoFilter === photo.id;

                return (
                  <div
                    key={photo.id}
                    onClick={() => setSelectedPhotoFilter(isSelected ? 'all' : photo.id)}
                    className={`p-3 rounded-2xl border transition-all cursor-pointer flex items-center gap-3 ${
                      isSelected
                        ? 'border-[#5A5A40] bg-[#5A5A40]/10 ring-1 ring-[#5A5A40]'
                        : 'border-[#E5E2D0] hover:border-[#5A5A40]/50 bg-[#FAF9F0]/40'
                    }`}
                  >
                    <div className="relative w-14 h-14 rounded-xl overflow-hidden shrink-0 border border-[#E5E2D0] bg-stone-900">
                      <img src={photo.url} alt="Foto" className="w-full h-full object-cover" />
                      <span className="absolute bottom-0.5 right-0.5 bg-black/75 text-white text-[9px] font-mono px-1 rounded">
                        #{idx + 1}
                      </span>
                    </div>

                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-semibold text-stone-900 truncate">
                        {photo.caption || 'Foto de los Novios'}
                      </p>
                      <p className="text-[10px] text-stone-500 truncate">
                        {photo.authorName ? `Por: ${photo.authorName}` : 'Galería oficial'}
                      </p>

                      <div className="flex items-center gap-3 mt-1.5 text-[11px]">
                        <span className="flex items-center gap-1 font-semibold text-rose-600">
                          <Heart className="w-3 h-3 fill-rose-500" /> {photo.likesCount || 0}
                        </span>
                        <span className="flex items-center gap-1 font-semibold text-amber-700">
                          <MessageCircle className="w-3 h-3 text-amber-600" /> {photoCommentsCount}
                        </span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Right Column: Interactive Comments Feed (lg:col-span-7) */}
        <div className="lg:col-span-7 bg-white p-5 sm:p-6 rounded-3xl border border-[#E5E2D0] shadow-xs space-y-4">
          
          {/* Header & Filter Controls */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-[#E5E2D0] pb-3">
            <div className="flex items-center gap-2">
              <MessageCircle className="w-4 h-4 text-amber-600" />
              <h3 className="text-sm font-bold text-stone-900 font-serif">
                Muro de Comentarios & Dedicatorias ({filteredComments.length})
              </h3>
            </div>

            {/* Search within comments */}
            <input
              type="text"
              value={commentSearch}
              onChange={(e) => setCommentSearch(e.target.value)}
              placeholder="Buscar por invitado o texto..."
              className="px-3 py-1.5 rounded-xl border border-[#E5E2D0] bg-[#FAF9F0] text-xs text-stone-800 focus:outline-none focus:ring-1 focus:ring-[#5A5A40] w-full sm:w-56"
            />
          </div>

          {/* Active Photo Filter Notification */}
          {selectedPhotoFilter !== 'all' && (
            <div className="bg-amber-50 border border-amber-200 p-2.5 rounded-xl flex items-center justify-between text-xs text-amber-900">
              <span className="truncate">
                Filtrando comentarios para la foto seleccionada (ID #{selectedPhotoFilter})
              </span>
              <button
                type="button"
                onClick={() => setSelectedPhotoFilter('all')}
                className="font-bold underline ml-2 text-amber-950 cursor-pointer shrink-0"
              >
                Limpiar filtro
              </button>
            </div>
          )}

          {/* Comments List */}
          {loading ? (
            <div className="py-16 text-center text-xs text-stone-500 flex items-center justify-center gap-2">
              <Loader2 className="w-4 h-4 animate-spin text-amber-700" />
              <span>Cargando comentarios...</span>
            </div>
          ) : filteredComments.length === 0 ? (
            <div className="py-16 text-center bg-[#FAF9F0] rounded-2xl border border-dashed border-[#E5E2D0] p-6 space-y-2">
              <MessageCircle className="w-8 h-8 text-stone-400 mx-auto" />
              <p className="text-xs font-semibold text-stone-700">No hay comentarios en este filtro</p>
              <p className="text-[11px] text-stone-500 max-w-xs mx-auto">
                Los mensajes que escriban los invitados en el carrusel de fotos aparecerán automáticamente en este muro.
              </p>
            </div>
          ) : (
            <div className="space-y-3 max-h-[600px] overflow-y-auto pr-1 custom-scrollbar">
              {filteredComments.map((comment) => {
                const relatedPhoto = photos.find((p) => p.id === comment.photoId);

                return (
                  <div
                    key={comment.id}
                    className="p-4 rounded-2xl bg-[#FAF9F0]/80 border border-[#E5E2D0] hover:border-[#5A5A40]/40 transition-colors space-y-2"
                  >
                    {/* Comment Header */}
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex items-center gap-2.5 min-w-0">
                        <div className="w-8 h-8 rounded-full bg-[#5A5A40] text-white flex items-center justify-center text-xs font-bold font-serif shrink-0 shadow-2xs">
                          {comment.guestName ? comment.guestName.charAt(0).toUpperCase() : 'I'}
                        </div>
                        <div className="min-w-0">
                          <h4 className="text-xs font-bold text-stone-900 truncate">
                            {comment.guestName}
                          </h4>
                          <span className="text-[10px] text-stone-400 flex items-center gap-1">
                            <Clock className="w-3 h-3" />
                            {comment.createdAt
                              ? new Date(comment.createdAt).toLocaleString(undefined, {
                                  dateStyle: 'medium',
                                  timeStyle: 'short',
                                })
                              : 'Recién'}
                          </span>
                        </div>
                      </div>

                      {/* Associated Photo Thumbnail badge */}
                      {relatedPhoto && (
                        <div className="flex items-center gap-2 shrink-0">
                          <img
                            src={relatedPhoto.url}
                            alt="Foto asociada"
                            className="w-8 h-8 rounded-lg object-cover border border-[#E5E2D0]"
                            title={relatedPhoto.caption || 'Foto asociada'}
                          />
                          <button
                            type="button"
                            onClick={() => handleDeleteComment(comment.id)}
                            disabled={isDeletingCommentId === comment.id}
                            className="p-1.5 rounded-lg text-stone-400 hover:text-rose-600 hover:bg-rose-50 transition-colors cursor-pointer"
                            title="Eliminar este comentario"
                          >
                            {isDeletingCommentId === comment.id ? (
                              <Loader2 className="w-3.5 h-3.5 animate-spin" />
                            ) : (
                              <Trash2 className="w-3.5 h-3.5" />
                            )}
                          </button>
                        </div>
                      )}
                    </div>

                    {/* Comment Message */}
                    <p className="text-xs text-stone-700 leading-relaxed pl-10 bg-white/70 p-3 rounded-xl border border-[#E5E2D0]/60">
                      "{comment.message}"
                    </p>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
