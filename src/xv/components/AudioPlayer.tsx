import React, { useState, useRef, useEffect } from 'react';
import { Volume2, VolumeX, Play, Pause, Music, Upload, Check, Disc3, Zap, Loader2, FileAudio } from 'lucide-react';
import { WeddingSettings } from '../../types.ts';
import { optimizeAudioClient, formatBytes, AudioOptimizationResult } from '../../lib/mediaOptimizer.ts';

interface AudioPlayerProps {
  settings?: WeddingSettings;
  audioUrl?: string;
  songTitle?: string;
  artistName?: string;
  onUpdateSettings?: (updated: Partial<WeddingSettings>) => void;
  onAudioUpdated?: (newUrl: string, newTitle: string) => void;
  isAdmin?: boolean;
}

const PRESET_SONGS = [
  {
    title: 'Acoustic Romance (Guitarra Suave)',
    url: 'https://cdn.pixabay.com/download/audio/2022/05/27/audio_1808fbf07a.mp3?filename=acoustic-guitars-ambient-uplifting-112705.mp3',
  },
  {
    title: 'Canon in D (Pachelbel - Piano & Cuerdas)',
    url: 'https://cdn.pixabay.com/download/audio/2022/03/10/audio_c3527e028b.mp3?filename=canon-in-d-piano-solo-10023.mp3',
  },
  {
    title: 'Wedding Waltz & Strings (Clásico Elegante)',
    url: 'https://cdn.pixabay.com/download/audio/2022/01/18/audio_d0a13f69d2.mp3?filename=wedding-18451.mp3',
  },
  {
    title: 'Love Story Piano & Violin',
    url: 'https://cdn.pixabay.com/download/audio/2021/11/24/audio_349d4f0099.mp3?filename=emotional-piano-inspirational-11267.mp3',
  },
];

export const AudioPlayer: React.FC<AudioPlayerProps> = ({
  settings,
  audioUrl,
  songTitle,
  artistName,
  onUpdateSettings,
  onAudioUpdated,
  isAdmin = false,
}) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [isOptimizing, setIsOptimizing] = useState(false);
  const [audioOptimization, setAudioOptimization] = useState<AudioOptimizationResult | null>(null);
  const [customTitle, setCustomTitle] = useState('');
  const [uploadSuccess, setUploadSuccess] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  const effectiveAudioUrl =
    audioUrl ||
    settings?.audioUrl ||
    'https://cdn.pixabay.com/download/audio/2022/05/27/audio_1808fbf07a.mp3?filename=acoustic-guitars-ambient-uplifting-112705.mp3';

  const effectiveTitle =
    songTitle ||
    settings?.audioTitle ||
    'Nuestra Canción de Boda';

  const effectiveArtist =
    artistName ||
    settings?.coupleNames ||
    'Música de la Celebración';

  const effectiveAutoplay = settings?.audioAutoplay ?? false;

  useEffect(() => {
    if (audioRef.current && effectiveAudioUrl) {
      audioRef.current.src = effectiveAudioUrl;
      if (effectiveAutoplay) {
        audioRef.current
          .play()
          .then(() => setIsPlaying(true))
          .catch(() => {
            // Autoplay blocked by browser until user interaction
            setIsPlaying(false);
          });
      }
    }
  }, [effectiveAudioUrl, effectiveAutoplay]);

  const togglePlay = () => {
    if (!audioRef.current) return;
    if (isPlaying) {
      audioRef.current.pause();
      setIsPlaying(false);
    } else {
      audioRef.current
        .play()
        .then(() => setIsPlaying(true))
        .catch((err) => console.log('Audio play error:', err));
    }
  };

  const toggleMute = () => {
    if (!audioRef.current) return;
    audioRef.current.muted = !isMuted;
    setIsMuted(!isMuted);
  };

  const triggerUpdate = (newUrl: string, newTitle: string) => {
    if (onAudioUpdated) {
      onAudioUpdated(newUrl, newTitle);
    }
    if (onUpdateSettings) {
      onUpdateSettings({
        audioUrl: newUrl,
        audioTitle: newTitle,
      });
    }
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      setIsOptimizing(true);
      // Perform client-side audio optimization to reduce weight
      const result = await optimizeAudioClient(file, {
        targetBitrate: 128000, // 128 kbps optimal lightweight stereo
      });
      setAudioOptimization(result);

      setUploading(true);
      const formData = new FormData();
      formData.append('file', result.file);

      const res = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      });
      const data = await res.json();
      if (data.url) {
        const title = customTitle || file.name.replace(/\.[^/.]+$/, '');
        triggerUpdate(data.url, title);
        setUploadSuccess(true);
        setTimeout(() => {
          setUploadSuccess(false);
          setShowModal(false);
          setAudioOptimization(null);
        }, 2200);
      }
    } catch (err) {
      console.error('Error uploading audio:', err);
    } finally {
      setIsOptimizing(false);
      setUploading(false);
    }
  };

  const selectPreset = (song: { title: string; url: string }) => {
    triggerUpdate(song.url, song.title);
    setShowModal(false);
  };

  const [isMobileExpanded, setIsMobileExpanded] = useState(false);

  return (
    <>
      <audio
        ref={audioRef}
        loop
        onPlay={() => setIsPlaying(true)}
        onPause={() => setIsPlaying(false)}
      />

      {/* Floating Audio Controller */}
      <div
        className={`fixed bottom-6 left-4 sm:left-6 z-40 flex items-center bg-[#F9F7EF]/95 text-[#3D3D3D] backdrop-blur-md rounded-full shadow-lg border border-[#E5E2D0] transition-all duration-300 ${
          isMobileExpanded
            ? 'p-2 sm:px-4 sm:py-2.5 gap-2.5 sm:gap-3'
            : 'p-1.5 sm:px-4 sm:py-2.5 gap-1.5 sm:gap-3'
        }`}
      >
        {/* Play/Pause Button (Always accessible) */}
        <button
          onClick={togglePlay}
          className="w-10 h-10 rounded-full aspect-square shrink-0 circle-badge bg-[#5A5A40] text-white flex items-center justify-center shadow-sm transition-transform active:scale-95 cursor-pointer hover:bg-[#484833]"
          title={isPlaying ? 'Pausar música' : 'Reproducir música'}
          id="btn-toggle-audio"
        >
          {isPlaying ? (
            <Pause className="w-5 h-5 fill-current shrink-0" />
          ) : (
            <Play className="w-5 h-5 fill-current ml-0.5 shrink-0" />
          )}
        </button>

        {/* Info & Disc Icon (Visible on desktop OR when mobile expanded) */}
        <div
          className={`${
            isMobileExpanded ? 'flex' : 'hidden sm:flex'
          } flex-col max-w-[130px] sm:max-w-[170px] min-w-0 animate-fadeIn`}
        >
          <span className="text-[9px] uppercase tracking-widest font-bold text-[#7D8C7A] flex items-center gap-1.5 font-mono">
            <Disc3 className={`w-3.5 h-3.5 shrink-0 ${isPlaying ? 'animate-spin' : ''}`} />
            Música de boda
          </span>
          <span className="text-xs font-serif italic truncate text-[#1a1a1a]" title={effectiveTitle}>
            {effectiveTitle}
          </span>
        </div>

        {/* Volume Mute Button (Visible on desktop OR when mobile expanded) */}
        <div className={`${isMobileExpanded ? 'flex' : 'hidden sm:flex'} items-center gap-1.5`}>
          <button
            onClick={toggleMute}
            className="p-1.5 sm:p-2 text-[#7D8C7A] hover:text-[#5A5A40] transition-colors cursor-pointer shrink-0"
            title={isMuted ? 'Desmutear' : 'Mutear'}
            id="btn-mute-audio"
          >
            {isMuted ? <VolumeX className="w-4 h-4 sm:w-5 sm:h-5 shrink-0" /> : <Volume2 className="w-4 h-4 sm:w-5 sm:h-5 shrink-0" />}
          </button>

          {/* Only Editor / Admin can see the Upload / Change Song Button */}
          {isAdmin && (
            <button
              onClick={() => setShowModal(true)}
              className="w-7 h-7 sm:w-8 sm:h-8 rounded-full aspect-square shrink-0 circle-badge bg-white hover:bg-[#FAF9F0] border border-[#E5E2D0] text-[#5A5A40] transition-colors cursor-pointer shadow-xs flex items-center justify-center"
              title="Cambiar o subir audio (Solo Organizador)"
              id="btn-open-audio-settings"
            >
              <Upload className="w-3.5 h-3.5 sm:w-4 sm:h-4 shrink-0" />
            </button>
          )}
        </div>

        {/* Mobile Expand / Collapse Toggle Button */}
        <button
          type="button"
          onClick={() => setIsMobileExpanded((prev) => !prev)}
          className="sm:hidden p-1 rounded-full text-[#7D8C7A] hover:text-[#1a1a1a] transition-colors cursor-pointer"
          title={isMobileExpanded ? 'Minimizar reproductor' : 'Expandir reproductor'}
        >
          <Music className={`w-4 h-4 ${isPlaying ? 'text-[#5A5A40] animate-bounce' : ''}`} />
        </button>
      </div>

      {/* Audio Customization Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#1a1a1a]/70 backdrop-blur-sm">
          <div className="bg-[#FDFCF0] border border-[#E5E2D0] rounded-[32px] sm:rounded-[40px] p-6 sm:p-8 max-w-md w-full shadow-2xl text-[#3D3D3D]">
            <div className="flex justify-between items-center mb-5 pb-3 border-b border-[#E5E2D0]">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-full aspect-square shrink-0 circle-badge bg-[#5A5A40] text-white flex items-center justify-center shadow-xs">
                  <Music className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-lg font-serif text-[#1a1a1a]">
                    Música de la Invitación
                  </h3>
                  <p className="text-[10px] uppercase tracking-widest text-[#7D8C7A] font-bold">
                    Compresión en Frontend & Almacenamiento
                  </p>
                </div>
              </div>
              <button
                onClick={() => setShowModal(false)}
                className="text-[#5A5A40] hover:text-[#1a1a1a] text-xl font-light w-8 h-8 rounded-full aspect-square shrink-0 circle-badge flex items-center justify-center hover:bg-white border border-transparent hover:border-[#E5E2D0] cursor-pointer transition-colors"
              >
                &times;
              </button>
            </div>

            <div className="space-y-5">
              {/* Presets */}
              <div>
                <label className="text-[10px] font-bold text-[#5A5A40] uppercase tracking-widest block mb-2">
                  Seleccionar pista recomendada
                </label>
                <div className="space-y-2">
                  {PRESET_SONGS.map((song, i) => (
                    <button
                      key={i}
                      onClick={() => selectPreset(song)}
                      className={`w-full text-left p-3 rounded-2xl border text-xs flex items-center justify-between cursor-pointer transition-all ${
                        effectiveAudioUrl === song.url
                          ? 'bg-[#FAF9F0] border-[#5A5A40] text-[#1a1a1a] shadow-xs'
                          : 'bg-white border-[#E5E2D0] text-[#5A5A40] hover:bg-[#FAF9F0]'
                      }`}
                    >
                      <span className="truncate font-medium">{song.title}</span>
                      {effectiveAudioUrl === song.url && (
                        <Check className="w-4 h-4 text-[#5A5A40] shrink-0 ml-2" />
                      )}
                    </button>
                  ))}
                </div>
              </div>

              {/* Upload Custom Audio */}
              <div className="pt-4 border-t border-[#E5E2D0]">
                <label className="text-[10px] font-bold text-[#5A5A40] uppercase tracking-widest block mb-2">
                  O subir canción propia (MP3, WAV, M4A)
                </label>
                <input
                  type="text"
                  placeholder="Nombre de la canción (opcional)"
                  value={customTitle}
                  onChange={(e) => setCustomTitle(e.target.value)}
                  className="w-full bg-[#FAF9F0] border border-[#E5E2D0] rounded-2xl px-3.5 py-2.5 text-xs text-[#3D3D3D] mb-3 focus:outline-none focus:border-[#5A5A40]"
                />

                <label className="flex flex-col items-center justify-center border-2 border-dashed border-[#E5E2D0] hover:border-[#5A5A40] rounded-[24px] p-5 cursor-pointer bg-[#FAF9F0] hover:bg-white transition-all">
                  {isOptimizing ? (
                    <div className="flex flex-col items-center gap-2 py-2">
                      <Loader2 className="w-6 h-6 text-[#5A5A40] animate-spin" />
                      <span className="text-xs text-[#5A5A40] font-semibold">
                        Optimizando audio en navegador...
                      </span>
                      <span className="text-[10px] text-[#7D8C7A]">Transcodificando con Web Audio API</span>
                    </div>
                  ) : (
                    <>
                      <Upload className="w-6 h-6 text-[#7D8C7A] mb-1.5" />
                      <span className="text-xs text-[#5A5A40] font-medium text-center">
                        {uploading ? 'Subiendo archivo ligero al servidor...' : 'Haz clic para seleccionar archivo de audio'}
                      </span>
                      <div className="flex items-center gap-1.5 mt-1.5">
                        <span className="text-[10px] bg-[#EAE8D5] text-[#5A5A40] font-bold px-2 py-0.5 rounded-full border border-[#D5D2BD]">
                          ⚡ Auto-optimización en Frontend
                        </span>
                      </div>
                      <span className="text-[10px] text-[#7D8C7A] mt-1 font-mono">Máx. 25MB (se procesa en el cliente)</span>
                    </>
                  )}
                  <input
                    type="file"
                    accept="audio/*"
                    onChange={handleFileUpload}
                    disabled={uploading || isOptimizing}
                    className="hidden"
                  />
                </label>

                {audioOptimization && audioOptimization.compressionRatio > 0 && (
                  <div className="p-2.5 mt-3 bg-[#FAF9F0] rounded-xl border border-[#7D8C7A]/40 text-[#5A5A40] text-xs space-y-1">
                    <div className="flex items-center justify-between font-semibold">
                      <span className="flex items-center gap-1.5">
                        <Zap className="w-4 h-4 text-[#5A5A40] shrink-0" /> Compresión de Audio Completada
                      </span>
                      <span className="bg-[#5A5A40] text-white text-[10px] px-2 py-0.5 rounded-full font-bold">
                        -{audioOptimization.compressionRatio}% peso
                      </span>
                    </div>
                    <div className="text-[11px] text-[#7D8C7A] flex items-center justify-between font-mono">
                      <span>Original: {formatBytes(audioOptimization.originalSize)}</span>
                      <span>➔</span>
                      <span className="font-bold text-[#5A5A40]">Optimizado: {formatBytes(audioOptimization.optimizedSize)}</span>
                    </div>
                  </div>
                )}

                {uploadSuccess && (
                  <p className="text-[#5A5A40] bg-[#FAF9F0] border border-[#7D8C7A]/40 p-2.5 rounded-xl text-xs mt-3 text-center flex items-center justify-center gap-2">
                    <Check className="w-4 h-4 text-[#7D8C7A] shrink-0" /> ¡Audio optimizado y guardado con éxito!
                  </p>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

