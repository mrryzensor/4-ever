import React, { useEffect, useRef, useState } from 'react';
import { Check, ChevronDown, ChevronUp, Loader2, Music2, Pause, Play, Trash2, Upload, Volume2 } from 'lucide-react';
import { AudioTrack, WeddingSettings } from '../../../types.ts';
import { getAudioPlaylist } from '../../../lib/audioPlaylist.ts';
import { getStreamAudioUrl } from '../../../lib/audioStream.ts';
import { optimizeAudioClient } from '../../../lib/mediaOptimizer.ts';

interface AudioSettingsPanelProps {
  settings: WeddingSettings;
  onChange: (updated: Partial<WeddingSettings>) => void;
}

const createTrackId = (file: File) => {
  const randomPart = typeof crypto !== 'undefined' && 'randomUUID' in crypto
    ? crypto.randomUUID()
    : `${Date.now()}-${Math.random().toString(36).slice(2)}`;
  return `${randomPart}-${file.name}`;
};

export const AudioSettingsPanel: React.FC<AudioSettingsPanelProps> = ({ settings, onChange }) => {
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState('');
  const [notice, setNotice] = useState('');
  const [previewingTrackId, setPreviewingTrackId] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const previewAudioRef = useRef<HTMLAudioElement>(null);
  const previewRequestRef = useRef(0);
  const tracks = getAudioPlaylist(settings);
  const activeTrackUrl = settings.audioUrl || '';

  useEffect(() => () => {
    previewRequestRef.current += 1;
    previewAudioRef.current?.pause();
  }, []);

  const persistTracks = (nextTracks: AudioTrack[]) => {
    onChange({ audioPlaylist: JSON.stringify(nextTracks) });
  };

  const handleUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files ?? []) as File[];
    event.target.value = '';
    if (!files.length) return;

    setUploading(true);
    setNotice('');
    const uploadedTracks: AudioTrack[] = [];
    let failedFiles = 0;
    try {
      for (let index = 0; index < files.length; index += 1) {
        const file = files[index];
        setProgress(`Preparando ${index + 1} de ${files.length}: ${file.name}`);
        try {
          const optimized = await optimizeAudioClient(file, { targetBitrate: 128000 });
          const body = new FormData();
          body.append('file', optimized.file);
          const response = await fetch('/api/upload', { method: 'POST', body });
          const result = await response.json();
          if (!response.ok || !result.url) throw new Error(result.error || 'No se pudo guardar el archivo.');
          uploadedTracks.push({
            id: createTrackId(file),
            title: file.name.replace(/\.[^/.]+$/, ''),
            url: result.url,
          });
        } catch (error) {
          failedFiles += 1;
          console.error(`No se pudo subir la pista ${file.name}:`, error);
        }
      }

      if (uploadedTracks.length) {
        persistTracks([...getAudioPlaylist(settings), ...uploadedTracks]);
        setNotice(`${uploadedTracks.length} ${uploadedTracks.length === 1 ? 'pista agregada' : 'pistas agregadas'} a la lista.${failedFiles ? ` ${failedFiles} no se pudieron subir.` : ''}`);
      } else {
        setNotice('No se pudo agregar ninguna pista. Revisa el formato y vuelve a intentarlo.');
      }
    } finally {
      setUploading(false);
      setProgress('');
    }
  };

  const selectTrack = (track: AudioTrack) => {
    onChange({ audioUrl: track.url, audioTitle: track.title });
  };

  const toggleTrackPreview = (track: AudioTrack) => {
    const audio = previewAudioRef.current;
    if (!audio) return;

    if (previewingTrackId === track.id && !audio.paused) {
      audio.pause();
      setPreviewingTrackId(null);
      return;
    }

    const requestId = ++previewRequestRef.current;
    audio.pause();
    const previewUrl = getStreamAudioUrl(track.url);
    const resolvedUrl = new URL(previewUrl, window.location.href).href;
    if (audio.src !== resolvedUrl) {
      audio.src = previewUrl;
      audio.load();
    }

    setNotice('');
    setPreviewingTrackId(track.id);
    audio.play().catch(() => {
      if (previewRequestRef.current !== requestId) return;
      setPreviewingTrackId(null);
      setNotice(`No se pudo reproducir la vista previa de «${track.title}».`);
    });
  };

  const renameTrack = (trackId: string, title: string) => {
    const nextTracks = tracks.map((track) => track.id === trackId ? { ...track, title } : track);
    const activeTrack = nextTracks.find((track) => track.id === trackId);
    onChange({
      audioPlaylist: JSON.stringify(nextTracks),
      ...(activeTrack?.url === activeTrackUrl ? { audioTitle: title } : {}),
    });
  };

  const moveTrack = (index: number, direction: -1 | 1) => {
    const targetIndex = index + direction;
    if (targetIndex < 0 || targetIndex >= tracks.length) return;
    const nextTracks = [...tracks];
    [nextTracks[index], nextTracks[targetIndex]] = [nextTracks[targetIndex], nextTracks[index]];
    persistTracks(nextTracks);
  };

  const removeTrack = (track: AudioTrack) => {
    const nextTracks = tracks.filter((item) => item.id !== track.id);
    const update: Partial<WeddingSettings> = { audioPlaylist: JSON.stringify(nextTracks) };
    if (track.url === activeTrackUrl) {
      update.audioUrl = nextTracks[0]?.url || '';
      update.audioTitle = nextTracks[0]?.title || '';
    }
    onChange(update);
    setNotice(`Se quitó «${track.title}» de la lista.`);
  };

  return (
    <section className="rounded-2xl border border-[#E5E2D0] bg-white p-4 sm:p-5 shadow-xs space-y-4" aria-labelledby="audio-settings-title">
      <header className="flex flex-wrap items-center justify-between gap-3 border-b border-[#E5E2D0] pb-3">
        <div className="flex items-center gap-2.5">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#F4F2E8] text-[#5A5A40]"><Music2 className="h-4 w-4" /></div>
          <div>
            <h3 id="audio-settings-title" className="font-serif text-sm font-bold text-stone-900">Música de la invitación</h3>
            <p className="text-[11px] text-stone-500">Agrega varias pistas, ordénalas y elige la principal.</p>
          </div>
        </div>
        <label className="inline-flex max-w-sm items-start gap-2 text-xs font-medium text-stone-700 cursor-pointer">
          <input
            type="checkbox"
            checked={Boolean(settings.audioAutoplay)}
            onChange={(event) => onChange({ audioAutoplay: event.target.checked })}
            className="mt-0.5 h-4 w-4 shrink-0 accent-[#5A5A40]"
          />
          <span>
            <span className="block">Reproducir automáticamente</span>
            <span className="mt-0.5 block text-[10px] font-normal text-stone-500">
              Se aplica al abrir o recargar la invitación; no inicia ni pausa el audio de la vista previa abierta.
            </span>
          </span>
        </label>
      </header>

      <div className="space-y-2" aria-label="Lista de pistas de audio">
        {tracks.length ? tracks.map((track, index) => {
          const isActive = track.url === activeTrackUrl;
          return (
            <div key={track.id} className={`grid grid-cols-[minmax(0,1fr)_auto] items-center gap-2 rounded-xl border p-2.5 ${isActive ? 'border-[#5A5A40] bg-[#F7F6EF]' : 'border-stone-200 bg-white'}`}>
              <div className="flex min-w-0 items-center gap-2.5">
                <button
                  type="button"
                  onClick={() => selectTrack(track)}
                  aria-label={isActive ? `Pista principal: ${track.title}` : `Usar ${track.title} como pista principal`}
                  aria-pressed={isActive}
                  className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full border cursor-pointer ${isActive ? 'border-[#5A5A40] bg-[#5A5A40] text-white' : 'border-stone-200 bg-white text-stone-500 hover:text-[#5A5A40]'}`}
                >
                  {isActive ? <Check className="h-4 w-4" /> : <Volume2 className="h-4 w-4" />}
                </button>
                <div className="min-w-0 flex-1">
                  <input
                    type="text"
                    value={track.title}
                    onChange={(event) => renameTrack(track.id, event.target.value)}
                    aria-label={`Nombre de pista ${index + 1}`}
                    className="w-full min-w-0 border-0 bg-transparent p-0 text-xs font-semibold text-stone-800 focus:outline-none focus:ring-1 focus:ring-[#5A5A40] rounded"
                  />
                  <span className="block truncate text-[10px] text-stone-500">{previewingTrackId === track.id ? 'Preescuchando · toca para pausar' : isActive ? 'Pista principal' : 'En la lista de reproducción'}</span>
                </div>
              </div>
              <div className="flex items-center gap-1">
                <button
                  type="button"
                  onClick={() => toggleTrackPreview(track)}
                  aria-label={`${previewingTrackId === track.id ? 'Pausar' : 'Reproducir'} vista previa de ${track.title}`}
                  aria-pressed={previewingTrackId === track.id}
                  className={`rounded-lg p-1.5 cursor-pointer ${previewingTrackId === track.id ? 'bg-[#5A5A40] text-white' : 'text-[#5A5A40] hover:bg-[#F4F2E8]'}`}
                >
                  {previewingTrackId === track.id ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
                </button>
                <button type="button" onClick={() => moveTrack(index, -1)} disabled={index === 0 || uploading} aria-label={`Subir ${track.title}`} className="rounded-lg p-1.5 text-stone-500 hover:bg-stone-100 disabled:opacity-30 cursor-pointer disabled:cursor-not-allowed"><ChevronUp className="h-4 w-4" /></button>
                <button type="button" onClick={() => moveTrack(index, 1)} disabled={index === tracks.length - 1 || uploading} aria-label={`Bajar ${track.title}`} className="rounded-lg p-1.5 text-stone-500 hover:bg-stone-100 disabled:opacity-30 cursor-pointer disabled:cursor-not-allowed"><ChevronDown className="h-4 w-4" /></button>
                <button type="button" onClick={() => removeTrack(track)} disabled={uploading} aria-label={`Quitar ${track.title}`} className="rounded-lg p-1.5 text-stone-400 hover:bg-rose-50 hover:text-rose-600 disabled:opacity-40 cursor-pointer disabled:cursor-not-allowed"><Trash2 className="h-4 w-4" /></button>
              </div>
            </div>
          );
        }) : <p className="rounded-xl border border-dashed border-stone-300 p-4 text-center text-xs text-stone-500">Aún no hay pistas. Puedes subir una o varias.</p>}
      </div>

      <audio ref={previewAudioRef} preload="none" onEnded={() => setPreviewingTrackId(null)} className="hidden" />

      <div className="flex flex-wrap items-center gap-3">
        <button
          type="button"
          onClick={() => inputRef.current?.click()}
          disabled={uploading}
          className="inline-flex items-center gap-2 rounded-xl bg-[#5A5A40] px-4 py-2.5 text-xs font-semibold text-white shadow-sm transition hover:bg-[#484833] disabled:opacity-60 cursor-pointer disabled:cursor-wait"
        >
          {uploading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Upload className="h-4 w-4" />}
          {uploading ? 'Procesando pistas…' : 'Subir audio(s)'}
        </button>
        <input
          ref={inputRef}
          type="file"
          multiple
          accept="audio/*,.mp3,.m4a,.mp4,.aac,.wav,.wave,.ogg,.oga,.opus,.webm,.weba,.flac"
          onChange={handleUpload}
          disabled={uploading}
          className="sr-only"
        />
        <span className="text-[10px] text-stone-500">MP3, M4A/AAC, OGG/Opus, WebM/Opus, WAV y FLAC</span>
      </div>
      {progress && <p role="status" className="text-xs text-[#5A5A40]">{progress}</p>}
      {notice && <p role="status" className="rounded-lg bg-[#F7F6EF] px-3 py-2 text-xs text-stone-700">{notice}</p>}
      <p className="text-[10px] leading-relaxed text-stone-500">Las pistas se reproducen en el orden de la lista. La reproducción automática se aplicará a la invitación publicada, no al simulador; en muchos móviles el navegador requiere una primera interacción del invitado.</p>
    </section>
  );
};
