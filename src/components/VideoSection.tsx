import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { Video, Plus, Trash2, Play, Film, ExternalLink, Sparkles } from 'lucide-react';
import { WeddingVideo } from '../types.ts';
import { AnimatedFilmReel, StyleSpecificDivider } from './AnimatedSvgs.tsx';
import { CARD_THEMES } from '../lib/themes.ts';
import { ConfirmModal } from './ConfirmModal.tsx';
import { toast } from '../lib/toast.ts';

interface VideoSectionProps {
  weddingId?: number;
  isAdmin?: boolean;
  cardStyle?: string;
}

export const VideoSection: React.FC<VideoSectionProps> = ({
  weddingId = 1,
  isAdmin = false,
  cardStyle = 'classic-gold',
}) => {
  const [videos, setVideos] = useState<WeddingVideo[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);

  // Add form state
  const [title, setTitle] = useState('');
  const [videoUrl, setVideoUrl] = useState('');
  const [description, setDescription] = useState('');
  const [authorName, setAuthorName] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const fetchVideos = async () => {
    try {
      setLoading(true);
      const res = await fetch(`/api/videos?weddingId=${weddingId}`);
      const data = await res.json();
      if (Array.isArray(data)) {
        setVideos(data);
      }
    } catch (err) {
      console.error('Error fetching videos:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchVideos();
  }, [weddingId]);

  const handleAddVideo = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!videoUrl || !title) return;

    setSubmitting(true);
    try {
      const res = await fetch('/api/videos', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          weddingId,
          title,
          videoUrl,
          description,
          authorName: authorName || 'Novios',
        }),
      });

      if (!res.ok) throw new Error('Error al agregar video');
      const newVideo = await res.json();
      setVideos((prev) => [newVideo, ...prev]);
      setShowAddModal(false);
      setTitle('');
      setVideoUrl('');
      setDescription('');
      toast.success('Video agregado con éxito', 'Video Publicado');
    } catch (err: any) {
      toast.error(err.message || 'Error al agregar video', 'Error');
    } finally {
      setSubmitting(false);
    }
  };

  const [videoToDelete, setVideoToDelete] = useState<WeddingVideo | null>(null);
  const [isDeletingVideo, setIsDeletingVideo] = useState(false);

  const handleDeleteVideo = (video: WeddingVideo) => {
    setVideoToDelete(video);
  };

  const confirmDeleteVideo = async () => {
    if (!videoToDelete) return;
    setIsDeletingVideo(true);
    try {
      await fetch(`/api/videos/${videoToDelete.id}`, { method: 'DELETE' });
      setVideos((prev) => prev.filter((v) => v.id !== videoToDelete.id));
      toast.success(`Video "${videoToDelete.title}" eliminado`, 'Eliminado');
      setVideoToDelete(null);
    } catch (err) {
      console.error('Error deleting video:', err);
      toast.error('Error al eliminar el video', 'Error');
    } finally {
      setIsDeletingVideo(false);
    }
  };

  const renderEmbed = (video: WeddingVideo) => {
    if (video.platform === 'youtube' && video.embedId) {
      return (
        <div className="relative w-full aspect-video rounded-2xl overflow-hidden bg-black shadow-lg">
          <iframe
            src={`https://www.youtube-nocookie.com/embed/${video.embedId}?rel=0`}
            title={video.title}
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
            className="w-full h-full border-0"
          />
        </div>
      );
    }

    if (video.platform === 'instagram') {
      return (
        <div className="relative w-full aspect-[9/16] max-w-sm mx-auto rounded-2xl overflow-hidden bg-stone-900 border border-stone-800 shadow-lg flex flex-col items-center justify-center p-6 text-center text-stone-300">
          <Film className="w-12 h-12 text-rose-400 mb-3 shrink-0" />
          <p className="text-sm font-semibold text-white mb-2">{video.title}</p>
          <p className="text-xs text-stone-400 mb-4">{video.description || 'Video de Instagram Reels'}</p>
          <a
            href={video.videoUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="px-4 py-2 rounded-full bg-gradient-to-r from-purple-600 via-pink-600 to-rose-500 text-white text-xs font-semibold flex items-center gap-2 hover:brightness-110 shadow"
          >
            <ExternalLink className="w-4 h-4 shrink-0" /> Ver en Instagram
          </a>
        </div>
      );
    }

    if (video.platform === 'facebook') {
      return (
        <div className="relative w-full aspect-video rounded-2xl overflow-hidden bg-stone-900 border border-stone-800 shadow-lg flex flex-col items-center justify-center p-6 text-center text-stone-300">
          <Film className="w-12 h-12 text-blue-400 mb-3 shrink-0" />
          <p className="text-sm font-semibold text-white mb-2">{video.title}</p>
          <p className="text-xs text-stone-400 mb-4">{video.description || 'Video de Facebook'}</p>
          <a
            href={video.videoUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="px-4 py-2 rounded-full bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold flex items-center gap-2 shadow"
          >
            <ExternalLink className="w-4 h-4 shrink-0" /> Ver en Facebook
          </a>
        </div>
      );
    }

    // Direct / fallback
    return (
      <div className="relative w-full aspect-video rounded-2xl overflow-hidden bg-black shadow-lg">
        <video
          src={video.videoUrl}
          controls
          className="w-full h-full object-cover"
        />
      </div>
    );
  };

  return (
    <section className="w-full px-4 sm:px-8 md:px-12 lg:px-16 py-10 sm:py-14 bg-transparent" id="videos">
      <div className="max-w-4xl mx-auto text-center mb-8 sm:mb-10">
        <div className="w-14 h-14 rounded-2xl bg-[#5A5A40]/10 text-[#5A5A40] flex items-center justify-center mx-auto mb-3 border border-[#E5E2D0]">
          <AnimatedFilmReel className="w-10 h-10" />
        </div>
        <span className="text-xs uppercase tracking-[0.3em] font-semibold text-[#7D8C7A] block mb-2">
          Momentos en Video
        </span>
        <h2 className="text-3xl sm:text-5xl font-serif text-[#3D3D2C] font-normal">
          Nuestra Historia en Video
        </h2>
        <StyleSpecificDivider
          cardStyle={cardStyle}
          className="w-48 sm:w-60 h-8 mx-auto mt-2"
          color={CARD_THEMES[cardStyle]?.accentColorHex}
        />
        <p className="text-sm text-stone-600 max-w-xl mx-auto mt-1">
          Revive el Save The Date, la propuesta de matrimonio y los mensajes más emotivos de nuestros seres queridos.
        </p>

        {isAdmin && (
          <div className="mt-8 flex justify-center">
            <button
              onClick={() => setShowAddModal(true)}
              className="px-6 py-3 rounded-full bg-[#5A5A40] text-[#FDFCF0] text-xs font-serif font-semibold shadow-md hover:bg-[#484833] flex items-center gap-2 cursor-pointer transition-colors"
              id="btn-add-video"
            >
              <Plus className="w-4 h-4 text-amber-300" />
              <span>Agregar Video (YouTube, Instagram, Facebook...)</span>
            </button>
          </div>
        )}
      </div>

      <div className="max-w-7xl mx-auto">
        {loading ? (
          <div className="py-12 text-center text-stone-400 text-sm">
            Cargando videos...
          </div>
        ) : videos.length === 0 ? (
          <div className="py-12 text-center bg-white/60 backdrop-blur-sm border border-dashed border-[#E5E2D0] rounded-3xl p-8 max-w-md mx-auto">
            <Film className="w-10 h-10 text-[#7D8C7A]/70 mx-auto mb-2" />
            <h4 className="text-sm font-semibold text-stone-800">
              No hay videos agregados todavía
            </h4>
            <p className="text-xs text-stone-500 mt-1">
              Puedes agregar enlaces de YouTube, Instagram Reels o Facebook.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {videos.map((video) => (
              <motion.div
                layout
                key={video.id}
                className="bg-white/90 backdrop-blur-sm rounded-3xl p-5 border border-[#E5E2D0] shadow-sm hover:shadow-md transition-all flex flex-col justify-between"
              >
                {renderEmbed(video)}

                <div className="mt-4 flex items-start justify-between">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] uppercase font-bold tracking-wider px-2.5 py-0.5 rounded-full bg-[#FAF9F0] text-[#5A5A40] border border-[#E5E2D0]">
                        {video.platform}
                      </span>
                      <span className="text-[11px] text-stone-500">
                        Por: {video.authorName || 'Novios'}
                      </span>
                    </div>
                    <h3 className="text-base font-serif font-bold text-[#3D3D2C] mt-1.5">
                      {video.title}
                    </h3>
                    {video.description && (
                      <p className="text-xs text-stone-600 mt-1 leading-relaxed">
                        {video.description}
                      </p>
                    )}
                  </div>

                  {isAdmin && (
                    <button
                      onClick={() => handleDeleteVideo(video)}
                      className="text-rose-500 hover:text-rose-700 p-1 cursor-pointer transition-colors"
                      title="Eliminar video"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  )}
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>

      {/* Add Video Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
          <div className="bg-white border border-stone-200 rounded-3xl p-6 max-w-md w-full shadow-2xl text-stone-800 relative">
            <button
              onClick={() => setShowAddModal(false)}
              className="absolute top-4 right-4 text-stone-400 hover:text-stone-700 text-xl font-bold cursor-pointer"
            >
              &times;
            </button>

            <h3 className="text-xl font-serif font-bold text-stone-900 mb-1 flex items-center gap-2">
              <Video className="w-5 h-5 text-amber-600" />
              Agregar Video de Boda
            </h3>
            <p className="text-xs text-stone-500 mb-4">
              Soporta URLs de YouTube, Instagram Reels, Facebook Video o enlace directo.
            </p>

            <form onSubmit={handleAddVideo} className="space-y-4">
              <div>
                <label className="text-xs font-semibold text-stone-700 block mb-1">
                  Título del Video:
                </label>
                <input
                  type="text"
                  placeholder="Ej. Save The Date Oficial o Baile Sorpresa"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full bg-stone-50 border border-stone-300 rounded-xl px-3 py-2 text-xs text-stone-900 focus:outline-none focus:border-amber-500"
                  required
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-stone-700 block mb-1">
                  Enlace o URL del Video:
                </label>
                <input
                  type="url"
                  placeholder="https://www.youtube.com/watch?v=... o https://instagram.com/reel/..."
                  value={videoUrl}
                  onChange={(e) => setVideoUrl(e.target.value)}
                  className="w-full bg-stone-50 border border-stone-300 rounded-xl px-3 py-2 text-xs text-stone-900 focus:outline-none focus:border-amber-500"
                  required
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-stone-700 block mb-1">
                  Descripción (opcional):
                </label>
                <textarea
                  rows={2}
                  placeholder="Breve reseña del video..."
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="w-full bg-stone-50 border border-stone-300 rounded-xl p-2.5 text-xs text-stone-900 focus:outline-none focus:border-amber-500 resize-none"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-stone-700 block mb-1">
                  Publicado por:
                </label>
                <input
                  type="text"
                  placeholder="Ej. Sofía & Alejandro"
                  value={authorName}
                  onChange={(e) => setAuthorName(e.target.value)}
                  className="w-full bg-stone-50 border border-stone-300 rounded-xl px-3 py-2 text-xs text-stone-900 focus:outline-none focus:border-amber-500"
                />
              </div>

              <button
                type="submit"
                disabled={submitting}
                className="w-full py-3 rounded-xl bg-gradient-to-r from-amber-600 to-amber-700 hover:from-amber-700 hover:to-amber-800 text-white text-xs font-semibold shadow-md disabled:opacity-50 transition-all cursor-pointer"
              >
                {submitting ? 'Guardando...' : 'Guardar Video'}
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Confirmation Modal for Video Deletion */}
      <ConfirmModal
        isOpen={Boolean(videoToDelete)}
        title="¿Eliminar Video?"
        message={`¿Estás seguro de que deseas eliminar el video "${videoToDelete?.title}"?\nEsta acción no se puede deshacer.`}
        confirmText="Eliminar Video"
        cancelText="Cancelar"
        variant="danger"
        isLoading={isDeletingVideo}
        onConfirm={confirmDeleteVideo}
        onCancel={() => setVideoToDelete(null)}
      />
    </section>
  );
};
