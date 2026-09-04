import React, { useState, useEffect } from 'react';
import {
  Sparkles,
  Heart,
  Calendar,
  Clock,
  MapPin,
  Camera,
  Gift,
  Shirt,
  CheckCircle2,
  Upload,
  Link as LinkIcon,
  Zap,
  Loader2,
  Plus,
  Trash2,
  Save,
  Check,
  Smartphone,
  ExternalLink,
  ImageIcon,
  Palette,
  Clipboard,
  Video,
  Film,
  BookOpen,
  MessageSquare,
} from 'lucide-react';
import { WeddingSettings, GalleryPhoto, CardStyleId } from '../../../types.ts';
import { optimizeImageClient, formatBytes, ImageOptimizationResult } from '../../../lib/mediaOptimizer.ts';
import { WEDDING_HERO_PRESETS } from './adminConstants.ts';
import { CARD_THEMES } from '../../../lib/themes.ts';
import { StyleSpecificDivider } from '../AnimatedSvgs.tsx';

interface SimpleModeInlineProps {
  settings: WeddingSettings;
  onChange: (updated: Partial<WeddingSettings>) => void;
  onSaveAllSettings: () => void;
  savingSettings: boolean;
  settingsSavedToast: boolean;
  onSwitchToAdvanced?: () => void;
}

const PERU_BANKS = [
  'BCP',
  'Interbank',
  'BBVA Perú',
  'Scotiabank',
  'Yape / Plin',
  'Banco de la Nación',
  'BanBif',
];

const GALLERY_CATEGORIES = [
  { id: 'preparativos', label: 'Preparativos' },
  { id: 'ceremonia', label: 'Ceremonia' },
  { id: 'brindis', label: 'Brindis' },
  { id: 'fiesta', label: 'Fiesta & Baile' },
  { id: 'photobooth', label: 'Photobooth' },
  { id: 'recuerdos', label: 'Recuerdos' },
];

export const SimpleModeInline: React.FC<SimpleModeInlineProps> = ({
  settings,
  onChange,
  onSaveAllSettings,
  savingSettings,
  settingsSavedToast,
}) => {
  const [activeStep, setActiveStep] = useState<
    'datos' | 'llegar' | 'itinerario' | 'vestimenta' | 'regalos' | 'galeria' | 'video' | 'libro' | 'confirmacion'
  >('datos');

  // Photo optimization state for Cover Photo
  const [isOptimizingCover, setIsOptimizingCover] = useState(false);
  const [coverOptimizationStats, setCoverOptimizationStats] = useState<ImageOptimizationResult | null>(null);
  const [coverUploadMsg, setCoverUploadMsg] = useState<string | null>(null);

  // Gallery Management State for Novios
  const [galleryPhotos, setGalleryPhotos] = useState<GalleryPhoto[]>([]);
  const [loadingGallery, setLoadingGallery] = useState(false);
  const [isUploadingGalleryPhoto, setIsUploadingGalleryPhoto] = useState(false);
  const [galleryCategory, setGalleryCategory] = useState<'preparativos' | 'ceremonia' | 'brindis' | 'fiesta' | 'photobooth' | 'recuerdos'>('ceremonia');
  const [galleryCaption, setGalleryCaption] = useState('');
  const [galleryUploadStats, setGalleryUploadStats] = useState<ImageOptimizationResult | null>(null);
  const [galleryUploadSuccess, setGalleryUploadSuccess] = useState<string | null>(null);
  const [isDraggingGallery, setIsDraggingGallery] = useState(false);
  const [batchUploadProgress, setBatchUploadProgress] = useState<{
    current: number;
    total: number;
    currentFileName: string;
  } | null>(null);
  const [batchSummary, setBatchSummary] = useState<{
    count: number;
    originalBytes: number;
    optimizedBytes: number;
    savedPercent: number;
  } | null>(null);

  // Video Section State for Novios
  const [videoList, setVideoList] = useState<any[]>([]);
  const [loadingVideos, setLoadingVideos] = useState(false);
  const [newVideoTitle, setNewVideoTitle] = useState('');
  const [newVideoUrl, setNewVideoUrl] = useState('');
  const [newVideoDesc, setNewVideoDesc] = useState('');
  const [newVideoPlatform, setNewVideoPlatform] = useState<'youtube' | 'vimeo' | 'tiktok' | 'direct'>('youtube');
  const [isAddingVideo, setIsAddingVideo] = useState(false);

  // Guestbook Wishes State for Novios
  const [wishesList, setWishesList] = useState<any[]>([]);
  const [loadingWishes, setLoadingWishes] = useState(false);

  // Parse itinerary items
  const itineraryItems: { time: string; title: string; desc: string }[] = (() => {
    try {
      if (settings.itinerary) {
        const parsed = typeof settings.itinerary === 'string' ? JSON.parse(settings.itinerary) : settings.itinerary;
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
    } catch {}
    return [
      { time: '17:00', title: 'Ceremonia Religiosa', desc: 'Enlace matrimonial y bendición' },
      { time: '18:30', title: 'Cóctel & Bienvenida', desc: 'Brindis y aperitivos' },
      { time: '20:00', title: 'Banquete & Cena', desc: 'Cena de gala y primer baile' },
      { time: '22:00', title: 'Fiesta & Baile', desc: 'Pista de baile y barra libre' },
    ];
  })();

  const handleUpdateItinerary = (index: number, field: string, value: string) => {
    const updated = [...itineraryItems];
    updated[index] = { ...updated[index], [field]: value };
    onChange({ itinerary: JSON.stringify(updated) });
  };

  const handleAddItineraryItem = () => {
    const updated = [
      ...itineraryItems,
      { time: '23:30', title: 'Momento Especial', desc: 'Descripción breve' },
    ];
    onChange({ itinerary: JSON.stringify(updated) });
  };

  const handleRemoveItineraryItem = (index: number) => {
    const updated = itineraryItems.filter((_, i) => i !== index);
    onChange({ itinerary: JSON.stringify(updated) });
  };

  // Fetch gallery photos for the couple to manage
  const loadCoupleGalleryPhotos = async () => {
    try {
      setLoadingGallery(true);
      const res = await fetch(`/api/gallery?weddingId=${settings.id || 1}`);
      const data = await res.json();
      if (Array.isArray(data)) {
        setGalleryPhotos(data);
      }
    } catch (err) {
      console.error('Error fetching gallery photos:', err);
    } finally {
      setLoadingGallery(false);
    }
  };

  const loadCoupleVideos = async () => {
    try {
      setLoadingVideos(true);
      const res = await fetch(`/api/videos?weddingId=${settings.id || 1}`);
      const data = await res.json();
      if (Array.isArray(data)) {
        setVideoList(data);
      }
    } catch (err) {
      console.error('Error fetching videos:', err);
    } finally {
      setLoadingVideos(false);
    }
  };

  const loadCoupleWishes = async () => {
    try {
      setLoadingWishes(true);
      const res = await fetch(`/api/wishes?weddingId=${settings.id || 1}`);
      const data = await res.json();
      if (Array.isArray(data)) {
        setWishesList(data);
      }
    } catch (err) {
      console.error('Error fetching wishes:', err);
    } finally {
      setLoadingWishes(false);
    }
  };

  useEffect(() => {
    if (activeStep === 'galeria' || activeStep === 'pareja') {
      loadCoupleGalleryPhotos();
    } else if (activeStep === 'video') {
      loadCoupleVideos();
    } else if (activeStep === 'libro') {
      loadCoupleWishes();
    }
  }, [activeStep, settings.id]);

  const handleAddVideoSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newVideoTitle.trim() || !newVideoUrl.trim()) return;
    try {
      setIsAddingVideo(true);
      const res = await fetch('/api/videos', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          weddingId: settings.id || 1,
          title: newVideoTitle.trim(),
          platform: newVideoPlatform,
          videoUrl: newVideoUrl.trim(),
          description: newVideoDesc.trim() || undefined,
          authorName: settings.coupleNames || 'Los Novios',
        }),
      });
      if (res.ok) {
        setNewVideoTitle('');
        setNewVideoUrl('');
        setNewVideoDesc('');
        loadCoupleVideos();
      }
    } catch (err) {
      console.error('Error adding video:', err);
    } finally {
      setIsAddingVideo(false);
    }
  };

  const handleDeleteVideo = async (videoId: number) => {
    try {
      setVideoList((prev) => prev.filter((v) => v.id !== videoId));
      await fetch(`/api/videos/${videoId}`, { method: 'DELETE' });
    } catch (err) {
      console.error('Error deleting video:', err);
    }
  };

  const handleDeleteWish = async (wishId: number) => {
    try {
      setWishesList((prev) => prev.filter((w) => w.id !== wishId));
      await fetch(`/api/wishes/${wishId}`, { method: 'DELETE' });
    } catch (err) {
      console.error('Error deleting wish:', err);
    }
  };

  // Handle Cover Photo Upload with client-side AVIF 95% compression
  const processCoverFile = async (file: File) => {
    if (!file.type.startsWith('image/')) return;

    try {
      setIsOptimizingCover(true);
      setCoverUploadMsg('Optimizando foto en formato AVIF al 95%...');

      const result = await optimizeImageClient(file, {
        maxDimension: 2000,
        quality: 0.70,
        preferredFormat: 'avif',
      });

      setCoverOptimizationStats(result);

      // Instant preview in canvas
      const previewUrl = URL.createObjectURL(result.file);
      onChange({ coverPhoto: previewUrl });

      setCoverUploadMsg('Guardando en almacenamiento persistente...');
      const formData = new FormData();
      formData.append('file', result.file);

      const uploadRes = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      });

      if (uploadRes.ok) {
        const uploadData = await uploadRes.json();
        if (uploadData.url) {
          onChange({ coverPhoto: uploadData.url });
          setCoverUploadMsg('¡Foto de portada guardada en AVIF con éxito!');
          setTimeout(() => setCoverUploadMsg(null), 3500);
        }
      } else {
        setCoverUploadMsg('Foto aplicada en vista previa.');
      }
    } catch (err) {
      console.warn('Error during cover optimization/upload:', err);
      const reader = new FileReader();
      reader.onload = (event) => {
        if (event.target?.result) {
          onChange({ coverPhoto: event.target!.result as string });
        }
      };
      reader.readAsDataURL(file);
      setCoverUploadMsg('Foto aplicada en vista previa.');
      setTimeout(() => setCoverUploadMsg(null), 3000);
    } finally {
      setIsOptimizingCover(false);
    }
  };

  const handleCoverPhotoSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      await processCoverFile(file);
    }
  };

  // Global paste handler for images when SimpleMode is open
  useEffect(() => {
    const handlePaste = (e: ClipboardEvent) => {
      // If user is pasting into a text input or textarea, let default behavior handle text
      const target = e.target as HTMLElement;
      if (target && (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA')) {
        // If there's an image file in the clipboard, intercept and upload
        const items = e.clipboardData?.items;
        if (!items) return;
        for (let i = 0; i < items.length; i++) {
          if (items[i].type.startsWith('image/')) {
            const file = items[i].getAsFile();
            if (file) {
              e.preventDefault();
              if (activeStep === 'galeria') {
                processGalleryFiles([file]);
              } else {
                processCoverFile(file);
              }
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
            if (activeStep === 'galeria') {
              processGalleryFiles([file]);
            } else {
              processCoverFile(file);
            }
            break;
          }
        }
      }
    };

    window.addEventListener('paste', handlePaste);
    return () => window.removeEventListener('paste', handlePaste);
  }, [activeStep]);

  // Handle Gallery Photo Upload for the Couple (Single or Batch up to 10 photos + Drag & Drop)
  const processGalleryFiles = async (files: FileList | File[]) => {
    const rawFiles = Array.from(files).filter((f) => f.type.startsWith('image/'));
    if (rawFiles.length === 0) return;

    // Limit to max 10 photos
    const filesToUpload = rawFiles.slice(0, 10);
    const totalFiles = filesToUpload.length;

    try {
      setIsUploadingGalleryPhoto(true);
      setGalleryUploadSuccess(null);
      setBatchSummary(null);

      let totalOriginalBytes = 0;
      let totalOptimizedBytes = 0;
      const createdPhotos: GalleryPhoto[] = [];

      for (let i = 0; i < totalFiles; i++) {
        const file = filesToUpload[i];
        setBatchUploadProgress({
          current: i + 1,
          total: totalFiles,
          currentFileName: file.name,
        });

        // Optimize client-side to AVIF 95%
        const result = await optimizeImageClient(file, {
          maxDimension: 1920,
          quality: 0.72,
          preferredFormat: 'avif',
        });

        totalOriginalBytes += result.originalSize;
        totalOptimizedBytes += result.optimizedSize;
        setGalleryUploadStats(result);

        // Upload file to server storage
        const formData = new FormData();
        formData.append('file', result.file);

        let finalUrl = '';
        try {
          const uploadRes = await fetch('/api/upload', {
            method: 'POST',
            body: formData,
          });
          if (uploadRes.ok) {
            const data = await uploadRes.json();
            finalUrl = data.url;
          } else {
            finalUrl = URL.createObjectURL(result.file);
          }
        } catch {
          finalUrl = URL.createObjectURL(result.file);
        }

        // Save record in database
        const itemCaption =
          totalFiles === 1 && galleryCaption.trim()
            ? galleryCaption.trim()
            : galleryCaption.trim()
            ? `${galleryCaption.trim()} (${i + 1}/${totalFiles})`
            : file.name.replace(/\.[^/.]+$/, '').replace(/[-_]/g, ' ');

        const photoPayload = {
          weddingId: settings.id || 1,
          url: finalUrl,
          caption: itemCaption || 'Fotografía de la boda',
          authorName: 'Novios',
          category: galleryCategory,
        };

        const dbRes = await fetch('/api/gallery', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(photoPayload),
        });

        if (dbRes.ok) {
          const newPhoto = await dbRes.json();
          createdPhotos.push(newPhoto);
        }
      }

      if (createdPhotos.length > 0) {
        setGalleryPhotos((prev) => [...createdPhotos, ...prev]);
        setGalleryCaption('');

        const savedBytes = Math.max(0, totalOriginalBytes - totalOptimizedBytes);
        const savedPercent =
          totalOriginalBytes > 0
            ? Math.round((savedBytes / totalOriginalBytes) * 100)
            : 0;

        setBatchSummary({
          count: createdPhotos.length,
          originalBytes: totalOriginalBytes,
          optimizedBytes: totalOptimizedBytes,
          savedPercent,
        });

        setGalleryUploadSuccess(
          `¡${createdPhotos.length} foto(s) añadidas a la galería con optimización AVIF al 95%! (${formatBytes(totalOptimizedBytes)})`
        );

        setTimeout(() => {
          setGalleryUploadSuccess(null);
          setBatchUploadProgress(null);
        }, 5000);
      }
    } catch (err) {
      console.error('Error uploading gallery photos:', err);
    } finally {
      setIsUploadingGalleryPhoto(false);
      setBatchUploadProgress(null);
    }
  };

  const handleGalleryPhotoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      await processGalleryFiles(e.target.files);
      e.target.value = '';
    }
  };

  const handleGalleryDrop = async (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDraggingGallery(false);

    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      await processGalleryFiles(e.dataTransfer.files);
    }
  };

  const handleGalleryDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    if (!isDraggingGallery) setIsDraggingGallery(true);
  };

  const handleGalleryDragLeave = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDraggingGallery(false);
  };

  const handleDeleteGalleryPhoto = async (photoId: number) => {
    try {
      setGalleryPhotos((prev) => prev.filter((p) => p.id !== photoId));
      await fetch(`/api/gallery/${photoId}`, { method: 'DELETE' });
    } catch (err) {
      console.error('Error deleting photo:', err);
    }
  };

  const stepsList = [
    { id: 'datos', label: '1. Datos & Foto', icon: Heart, desc: 'Nombres, fecha y portada', isOptional: false },
    { id: 'llegar', label: '2. Cómo Llegar', icon: MapPin, desc: 'Ceremonia y recepción', isOptional: false },
    { id: 'itinerario', label: '3. Itinerario', icon: Clock, desc: 'Cronograma del evento', isOptional: false },
    { id: 'vestimenta', label: '4. Vestimenta', icon: Shirt, desc: 'Código de vestimenta', isOptional: false },
    { id: 'regalos', label: '5. Regalos (Perú)', icon: Gift, desc: 'BCP, Interbank, Yape/Plin', isOptional: false },
    { id: 'galeria', label: '6. Galería de Fotos', icon: Camera, desc: 'Subir fotos de los novios', isOptional: false },
    { id: 'video', label: '7. Video de Historia', icon: Film, desc: 'YouTube / Reels / TikTok', isOptional: true, isEnabled: settings.showVideoMemories === true },
    { id: 'libro', label: '8. Libro de Firmas', icon: BookOpen, desc: 'Deseos y dedicatorias', isOptional: true, isEnabled: settings.showGuestbook === true },
    { id: 'confirmacion', label: '9. Confirmación', icon: CheckCircle2, desc: 'RSVP y WhatsApp', isOptional: false },
  ];

  return (
    <div className="space-y-4 sm:space-y-6 w-full max-w-full min-w-0 animate-fadeIn box-border">
      {/* 1. Header Banner */}
      <div className="bg-gradient-to-br from-[#FAF9F0] via-white to-[#F0EEDC] border border-[#E5E2D0] rounded-3xl p-3.5 sm:p-5 shadow-xs w-full max-w-full min-w-0 box-border overflow-hidden">
        <div className="flex items-start sm:items-center gap-3 min-w-0">
          <div className="w-10 h-10 sm:w-11 sm:h-11 rounded-2xl bg-amber-800/10 border border-amber-800/20 text-amber-900 flex items-center justify-center shadow-xs shrink-0 mt-0.5 sm:mt-0">
            <Zap className="w-5 h-5 text-amber-700" />
          </div>
          <div className="min-w-0 flex-1">
            <div className="flex flex-wrap items-center gap-1.5 min-w-0">
              <h3 className="font-serif text-base sm:text-lg font-bold text-stone-900 leading-snug break-words">
                Modo Simple: Configuración Rápida
              </h3>
              <span className="text-[9px] sm:text-[10px] bg-emerald-100 text-emerald-800 border border-emerald-200/60 font-bold px-2 py-0.5 rounded-full inline-flex items-center gap-1 shrink-0">
                <Sparkles className="w-2.5 h-2.5" /> Predeterminado
              </span>
            </div>
            <p className="text-[11px] sm:text-xs text-stone-600 mt-1 leading-relaxed break-words">
              Ingresa tus datos, sube tu foto con compresión automática en <strong className="text-stone-800 font-semibold">AVIF al 95%</strong> y activa opcionalmente video o libro de firmas.
            </p>
          </div>
        </div>

        {/* Interactive Step Pills */}
        <div className="mt-4 pt-3.5 border-t border-[#E5E2D0]/80 grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 lg:grid-cols-9 gap-1.5 w-full min-w-0">
          {stepsList.map((step) => {
            const Icon = step.icon;
            const isActive = activeStep === step.id;
            return (
              <button
                key={step.id}
                type="button"
                onClick={() => setActiveStep(step.id as any)}
                className={`p-2 rounded-xl text-left transition-all cursor-pointer select-none flex flex-col gap-0.5 min-w-0 overflow-hidden relative ${
                  isActive
                    ? 'bg-[#5A5A40] text-white shadow-xs ring-2 ring-[#5A5A40]/30'
                    : 'bg-white/70 hover:bg-white text-stone-700 border border-[#E5E2D0]/60'
                }`}
              >
                <div className="flex items-center justify-between gap-1 min-w-0">
                  <div className="flex items-center gap-1.5 min-w-0">
                    <Icon className={`w-3.5 h-3.5 shrink-0 ${isActive ? 'text-amber-300' : 'text-[#7D8C7A]'}`} />
                    <span className="text-[11px] sm:text-xs font-bold truncate block">{step.label}</span>
                  </div>
                  {step.isOptional && (
                    <span
                      className={`text-[8px] px-1 py-0.2 rounded-full font-bold uppercase shrink-0 ${
                        step.isEnabled
                          ? 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                          : 'bg-stone-100 text-stone-500 border border-stone-200'
                      }`}
                    >
                      {step.isEnabled ? 'ON' : 'Opc.'}
                    </span>
                  )}
                </div>
                <span className={`text-[9px] sm:text-[10px] truncate block ${isActive ? 'text-white/80' : 'text-stone-400'}`}>
                  {step.desc}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* 2. Step Content Form */}
      <div className="bg-white border border-[#E5E2D0] rounded-3xl p-3.5 sm:p-6 shadow-xs space-y-6 w-full max-w-full min-w-0 box-border overflow-hidden">
        {/* STEP 1: DATOS & FOTO DE PORTADA */}
        {activeStep === 'datos' && (
          <div className="space-y-6 animate-fadeIn min-w-0">
            <div className="border-b border-[#E5E2D0] pb-3 flex flex-wrap items-center justify-between gap-2 min-w-0">
              <div className="min-w-0 flex-1">
                <h4 className="font-serif text-sm sm:text-base font-bold text-stone-900 break-words">
                  1. Datos de la Pareja & Foto de Portada
                </h4>
                <p className="text-[11px] sm:text-xs text-stone-500 break-words">
                  Aparecen en el sobre interactivo, portada y cabecera de la invitación.
                </p>
              </div>
              <span className="text-[9px] sm:text-[10px] uppercase font-bold tracking-widest bg-emerald-50 text-emerald-800 border border-emerald-200 px-2.5 py-0.5 rounded-full inline-flex items-center gap-1 shrink-0">
                <Zap className="w-3 h-3" /> AVIF 95%
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="sm:col-span-2">
                <label className="block text-xs font-bold text-stone-700 uppercase tracking-wider mb-1.5">
                  Nombres de la Pareja
                </label>
                <input
                  type="text"
                  value={settings.coupleNames || ''}
                  onChange={(e) => onChange({ coupleNames: e.target.value })}
                  placeholder="Ej. Ana García & Carlos Mendoza"
                  className="w-full px-4 py-2.5 rounded-xl border border-[#E5E2D0] bg-[#FAF9F0] focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#5A5A40] text-sm text-stone-800 font-serif"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-stone-700 uppercase tracking-wider mb-1.5">
                  Fecha de la Boda
                </label>
                <input
                  type="date"
                  value={settings.eventDate || ''}
                  onChange={(e) => onChange({ eventDate: e.target.value })}
                  className="w-full px-4 py-2.5 rounded-xl border border-[#E5E2D0] bg-[#FAF9F0] focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#5A5A40] text-sm text-stone-800"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-stone-700 uppercase tracking-wider mb-1.5">
                  Hora de Inicio
                </label>
                <input
                  type="time"
                  value={settings.eventTime || '17:00'}
                  onChange={(e) => onChange({ eventTime: e.target.value })}
                  className="w-full px-4 py-2.5 rounded-xl border border-[#E5E2D0] bg-[#FAF9F0] focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#5A5A40] text-sm text-stone-800"
                />
              </div>

              <div className="sm:col-span-2 space-y-3">
                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <label className="block text-xs font-bold text-stone-700 uppercase tracking-wider">
                      1. Título / Frase Principal (1 línea grande)
                    </label>
                    <span className="text-[10px] text-stone-500 font-mono">Letra grande</span>
                  </div>
                  <input
                    type="text"
                    value={settings.welcomeMessage || ''}
                    onChange={(e) => onChange({ welcomeMessage: e.target.value })}
                    placeholder="¡Nos casamos! Nos hace inmensa ilusión celebrar nuestro amor"
                    className="w-full px-4 py-2.5 rounded-xl border border-[#E5E2D0] bg-[#FAF9F0] focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#5A5A40] text-xs text-stone-800 font-serif"
                  />
                </div>

                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <label className="block text-xs font-bold text-stone-700 uppercase tracking-wider">
                      2. Subtítulo / Dedicatoria (máximo 2 líneas)
                    </label>
                    <span className="text-[10px] text-stone-500 font-mono">Debajo del separador</span>
                  </div>
                  <textarea
                    rows={2}
                    value={settings.welcomeSubtitle !== undefined ? settings.welcomeSubtitle : 'Nos emociona compartir este día tan especial contigo. Aquí encontrarás todos los detalles y ubicaciones de nuestra celebración.'}
                    onChange={(e) => onChange({ welcomeSubtitle: e.target.value })}
                    placeholder="Nos emociona compartir este día tan especial contigo. Aquí encontrarás todos los detalles y ubicaciones de nuestra celebración."
                    className="w-full px-4 py-2.5 rounded-xl border border-[#E5E2D0] bg-[#FAF9F0] focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#5A5A40] text-xs text-stone-800 leading-relaxed resize-none"
                  />
                </div>
              </div>
            </div>

            {/* Cover / Hero Multi-Photo Carousel Settings with AVIF 95% Compression */}
            <div className="p-4 rounded-2xl bg-[#FAF9F0] border border-[#E5E2D0] space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Camera className="w-4 h-4 text-[#5A5A40]" />
                  <label className="text-xs font-bold text-stone-800 uppercase tracking-wider">
                    Fotografías de Portada (Hero) & Pase Automático
                  </label>
                </div>
                <span className="text-[10px] bg-emerald-100 text-emerald-800 font-bold px-2 py-0.5 rounded-full flex items-center gap-1">
                  <Zap className="w-3 h-3 text-emerald-700" /> Multi-Foto Hero
                </span>
              </div>

              {/* Hero Photos list resolution */}
              {(() => {
                let currentHeroList: string[] = [];
                try {
                  if (settings.heroPhotos) {
                    const parsed = JSON.parse(settings.heroPhotos);
                    if (Array.isArray(parsed) && parsed.length > 0) currentHeroList = parsed;
                  }
                } catch {
                  if (typeof settings.heroPhotos === 'string' && settings.heroPhotos.includes(',')) {
                    currentHeroList = settings.heroPhotos.split(',').map((s) => s.trim()).filter(Boolean);
                  }
                }
                if (currentHeroList.length === 0 && settings.coverPhoto) {
                  currentHeroList = [settings.coverPhoto];
                }

                const toggleHeroPhoto = (url: string) => {
                  let updated: string[];
                  if (currentHeroList.includes(url)) {
                    if (currentHeroList.length === 1) return; // Keep at least one
                    updated = currentHeroList.filter((u) => u !== url);
                  } else {
                    updated = [...currentHeroList, url];
                  }
                  onChange({
                    heroPhotos: JSON.stringify(updated),
                    coverPhoto: updated[0] || url,
                  });
                };

                const removeHeroPhoto = (index: number) => {
                  if (currentHeroList.length <= 1) return;
                  const updated = currentHeroList.filter((_, i) => i !== index);
                  onChange({
                    heroPhotos: JSON.stringify(updated),
                    coverPhoto: updated[0],
                  });
                };

                return (
                  <div className="space-y-4">
                    {/* Active Hero Photos Carousel Preview & Order */}
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-[11px] font-semibold text-stone-700">
                          Fotos activas en la Portada ({currentHeroList.length}):
                        </span>
                        {currentHeroList.length > 1 && (
                          <span className="text-[10px] text-amber-700 bg-amber-50 border border-amber-200 px-2 py-0.5 rounded-full font-medium">
                            Pase automático activo
                          </span>
                        )}
                      </div>

                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                        {currentHeroList.map((url, idx) => (
                          <div
                            key={idx}
                            className="relative aspect-[4/3] rounded-xl overflow-hidden border-2 border-[#5A5A40] bg-stone-900 group shadow-xs"
                          >
                            <img src={url} alt={`Hero ${idx + 1}`} className="w-full h-full object-cover" />
                            <div className="absolute top-1.5 left-1.5 bg-black/70 backdrop-blur-xs text-amber-300 font-mono text-[10px] px-1.5 py-0.5 rounded-md font-bold">
                              #{idx + 1}
                            </div>
                            {currentHeroList.length > 1 && (
                              <button
                                type="button"
                                onClick={() => removeHeroPhoto(idx)}
                                className="absolute top-1.5 right-1.5 w-6 h-6 rounded-full bg-rose-600 hover:bg-rose-700 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer shadow-md"
                                title="Quitar de la portada"
                              >
                                <Trash2 className="w-3 h-3" />
                              </button>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Auto-play Timer Interval Control */}
                    {currentHeroList.length > 1 && (
                      <div className="p-3 bg-white rounded-xl border border-[#E5E2D0] flex flex-col sm:flex-row sm:items-center justify-between gap-2.5">
                        <div className="flex items-center gap-2">
                          <Clock className="w-4 h-4 text-amber-600 shrink-0" />
                          <div>
                            <span className="text-xs font-bold text-stone-800">
                              Tiempo de transición del Hero:
                            </span>
                            <p className="text-[10px] text-stone-500">
                              Cada cuántos segundos cambia la foto automáticamente
                            </p>
                          </div>
                        </div>

                        <div className="flex items-center gap-1.5">
                          {[3, 5, 8, 12].map((sec) => (
                            <button
                              key={sec}
                              type="button"
                              onClick={() => onChange({ heroAutoplayInterval: sec })}
                              className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                                (settings.heroAutoplayInterval || 5) === sec
                                  ? 'bg-[#5A5A40] text-white shadow-xs'
                                  : 'bg-stone-100 text-stone-600 hover:bg-stone-200'
                              }`}
                            >
                              {sec}s
                            </button>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Upload new photo for Hero */}
                    <div className="space-y-2">
                      <label className="block w-full py-3 px-4 rounded-xl bg-white border border-[#E5E2D0] hover:bg-[#FAF9F0] hover:border-[#5A5A40] text-[#5A5A40] font-semibold text-xs text-center cursor-pointer transition-all shadow-2xs group">
                        <input
                          type="file"
                          accept="image/*"
                          onChange={handleCoverPhotoSelect}
                          disabled={isOptimizingCover}
                          className="hidden"
                        />
                        <div className="flex items-center justify-center gap-2">
                          <Upload className="w-4 h-4 text-[#5A5A40] group-hover:scale-110 transition-transform" />
                          <span>Subir nueva fotografía para la portada (Auto-AVIF)</span>
                        </div>
                      </label>

                      {isOptimizingCover && (
                        <div className="bg-amber-50 border border-amber-200 rounded-xl p-2 flex items-center justify-center gap-2 text-xs text-amber-900 font-medium">
                          <Loader2 className="w-4 h-4 animate-spin text-amber-700" />
                          <span>Optimizando en formato AVIF al 95%...</span>
                        </div>
                      )}

                      {coverUploadMsg && (
                        <p className="text-[11px] text-emerald-800 bg-emerald-50 border border-emerald-200 px-3 py-1.5 rounded-xl font-medium">
                          {coverUploadMsg}
                        </p>
                      )}
                    </div>

                    {/* Choose from Uploaded Gallery Photos */}
                    {galleryPhotos.length > 0 && (
                      <div className="pt-2 border-t border-[#E5E2D0]">
                        <p className="text-[11px] text-stone-700 font-bold mb-1.5 flex items-center gap-1.5">
                          <ImageIcon className="w-3.5 h-3.5 text-[#5A5A40]" />
                          <span>Elegir fotos que ya subiste a la Galería ({galleryPhotos.length}):</span>
                        </p>
                        <p className="text-[10px] text-stone-500 mb-2">
                          Haz clic en las fotos para activarlas o desactivarlas en el carrusel de la portada.
                        </p>
                        <div className="grid grid-cols-4 sm:grid-cols-6 gap-2 max-h-44 overflow-y-auto p-1">
                          {galleryPhotos.map((p) => {
                            const isSelected = currentHeroList.includes(p.url);
                            return (
                              <button
                                key={p.id}
                                type="button"
                                onClick={() => toggleHeroPhoto(p.url)}
                                className={`relative aspect-square rounded-xl overflow-hidden border-2 transition-all cursor-pointer ${
                                  isSelected
                                    ? 'border-[#5A5A40] ring-2 ring-[#5A5A40]/40 scale-105 shadow-sm opacity-100'
                                    : 'border-transparent opacity-60 hover:opacity-100'
                                }`}
                                title={isSelected ? 'Foto activa en portada' : 'Haz clic para añadir a la portada'}
                              >
                                <img src={p.url} alt="Galería" className="w-full h-full object-cover" />
                                {isSelected && (
                                  <div className="absolute top-1 right-1 w-4 h-4 rounded-full bg-[#5A5A40] text-white flex items-center justify-center text-[10px]">
                                    ✓
                                  </div>
                                )}
                              </button>
                            );
                          })}
                        </div>
                      </div>
                    )}

                    {/* Presets Sample Selector */}
                    <div className="pt-2 border-t border-[#E5E2D0]">
                      <p className="text-[11px] text-stone-500 font-medium mb-1.5">O elige entre fotografías de muestra:</p>
                      <div className="grid grid-cols-4 gap-2">
                        {WEDDING_HERO_PRESETS.slice(0, 4).map((preset) => {
                          const isSelected = currentHeroList.includes(preset.url);
                          return (
                            <button
                              key={preset.id}
                              type="button"
                              onClick={() => toggleHeroPhoto(preset.url)}
                              className={`relative aspect-[4/3] rounded-lg overflow-hidden border-2 transition-all cursor-pointer ${
                                isSelected
                                  ? 'border-[#5A5A40] ring-2 ring-[#5A5A40]/30 scale-105 shadow-sm'
                                  : 'border-transparent hover:opacity-80'
                              }`}
                              title={preset.name}
                            >
                              <img src={preset.url} alt={preset.name} className="w-full h-full object-cover" />
                              {isSelected && (
                                <div className="absolute top-1 right-1 w-4 h-4 rounded-full bg-[#5A5A40] text-white flex items-center justify-center text-[10px]">
                                  ✓
                                </div>
                              )}
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  </div>
                );
              })()}
            </div>

            {/* Atelier de Estilos & Ilustraciones Animadas (6 Diseños) */}
            <div className="p-4 sm:p-5 rounded-2xl sm:rounded-3xl bg-[#FAF9F0] border border-[#E5E2D0] space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Palette className="w-4 h-4 text-[#5A5A40]" />
                  <label className="text-xs font-bold text-stone-800 uppercase tracking-wider">
                    Atelier de Estilos &amp; Ilustraciones Animadas (6 Diseños)
                  </label>
                </div>
                <span className="text-[10px] bg-amber-100 text-amber-900 border border-amber-200/60 font-bold px-2 py-0.5 rounded-full flex items-center gap-1">
                  <Sparkles className="w-3 h-3 text-amber-700" /> Vectorial Animado
                </span>
              </div>
              <p className="text-xs text-stone-600">
                Selecciona la identidad visual de tu invitación. Cada estilo personaliza los colores, tipografías finas, sobre y animaciones SVG de toda la boda.
              </p>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                {(Object.keys(CARD_THEMES) as CardStyleId[]).map((themeKey) => {
                  const t = CARD_THEMES[themeKey];
                  const isSelected = settings.cardStyle === themeKey;
                  return (
                    <button
                      key={themeKey}
                      type="button"
                      onClick={() => onChange({ cardStyle: themeKey })}
                      className={`p-3.5 rounded-2xl border text-left transition-all cursor-pointer relative overflow-hidden flex flex-col justify-between min-w-0 ${
                        isSelected
                          ? 'bg-white border-[#5A5A40] ring-2 ring-[#5A5A40]/30 shadow-md scale-[1.01]'
                          : 'bg-white/80 border-[#E5E2D0] hover:border-[#7D8C7A] hover:bg-white hover:shadow-xs'
                      }`}
                    >
                      <div className="min-w-0">
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-[9px] font-bold uppercase tracking-widest text-[#5A5A40] bg-[#F9F7EF] px-2 py-0.5 rounded-full border border-[#E5E2D0] truncate max-w-[120px]">
                            {t.badge}
                          </span>
                          {isSelected ? (
                            <span className="w-5 h-5 rounded-full bg-[#5A5A40] text-white flex items-center justify-center shrink-0">
                              <Check className="w-3 h-3 text-white" />
                            </span>
                          ) : (
                            <span className="w-3.5 h-3.5 rounded-full border border-stone-300 shrink-0" />
                          )}
                        </div>

                        <h4 className="text-xs sm:text-sm font-serif font-bold text-[#1a1a1a] mb-1 truncate">
                          {t.name}
                        </h4>
                        <p className="text-[11px] text-stone-500 line-clamp-2 leading-relaxed mb-3">
                          {t.description}
                        </p>
                      </div>

                      <div className="pt-2 border-t border-[#E5E2D0]/60 flex items-center justify-between mt-auto">
                        <div className="flex items-center gap-1.5 min-w-0">
                          <div className={`w-3.5 h-3.5 rounded-full aspect-square shrink-0 circle-badge ${t.sealBg} shadow-xs`} />
                          <span className="text-[10px] text-[#7D8C7A] font-serif italic truncate">
                            Sello {t.sealText}
                          </span>
                        </div>

                        <div className="w-14 h-4 flex items-center justify-end shrink-0">
                          <StyleSpecificDivider cardStyle={themeKey} className="w-12 h-3.5" color={t.accentColorHex} />
                        </div>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
        )}

        {/* STEP 2: CÓMO LLEGAR */}
        {activeStep === 'llegar' && (
          <div className="space-y-6 animate-fadeIn">
            <div className="border-b border-[#E5E2D0] pb-3">
              <h4 className="font-serif text-base font-bold text-stone-900">
                2. Ubicaciones & Cómo Llegar (Google Maps)
              </h4>
              <p className="text-xs text-stone-500">
                Direcciones y enlaces para que tus invitados abran Google Maps o Waze con un clic.
              </p>
            </div>

            {/* Ceremonia */}
            <div className="p-4 rounded-2xl bg-[#FAF9F0] border border-[#E5E2D0] space-y-3">
              <div className="flex items-center gap-2">
                <MapPin className="w-4 h-4 text-amber-700" />
                <h5 className="text-xs font-bold text-stone-800 uppercase tracking-wider">
                  Lugar de la Ceremonia
                </h5>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <input
                  type="text"
                  value={settings.ceremonyVenue || ''}
                  onChange={(e) => onChange({ ceremonyVenue: e.target.value })}
                  placeholder="Nombre del lugar (Ej. Parroquia San José, Miraflores)"
                  className="px-3.5 py-2 rounded-xl border border-[#E5E2D0] bg-white text-xs text-stone-800"
                />
                <input
                  type="text"
                  value={settings.ceremonyAddress || ''}
                  onChange={(e) => onChange({ ceremonyAddress: e.target.value })}
                  placeholder="Dirección (Ej. Av. Larco 123, Miraflores, Lima)"
                  className="px-3.5 py-2 rounded-xl border border-[#E5E2D0] bg-white text-xs text-stone-800"
                />
                <div className="sm:col-span-2">
                  <input
                    type="url"
                    value={settings.ceremonyMapsUrl || ''}
                    onChange={(e) => onChange({ ceremonyMapsUrl: e.target.value })}
                    placeholder="Enlace de Google Maps (https://maps.app.goo.gl/...)"
                    className="w-full px-3.5 py-2 rounded-xl border border-[#E5E2D0] bg-white text-xs text-stone-800 font-mono"
                  />
                </div>
              </div>
            </div>

            {/* Recepción */}
            <div className="p-4 rounded-2xl bg-[#FAF9F0] border border-[#E5E2D0] space-y-3">
              <div className="flex items-center gap-2">
                <MapPin className="w-4 h-4 text-emerald-700" />
                <h5 className="text-xs font-bold text-stone-800 uppercase tracking-wider">
                  Lugar de la Recepción / Fiesta
                </h5>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <input
                  type="text"
                  value={settings.receptionVenue || ''}
                  onChange={(e) => onChange({ receptionVenue: e.target.value })}
                  placeholder="Nombre del Local / Fundo (Ej. Casa Hacienda Villa, Pachacámac)"
                  className="px-3.5 py-2 rounded-xl border border-[#E5E2D0] bg-white text-xs text-stone-800"
                />
                <input
                  type="text"
                  value={settings.receptionAddress || ''}
                  onChange={(e) => onChange({ receptionAddress: e.target.value })}
                  placeholder="Dirección (Ej. Calle Los Eucaliptos Mz B Lt 4, Pachacámac)"
                  className="px-3.5 py-2 rounded-xl border border-[#E5E2D0] bg-white text-xs text-stone-800"
                />
                <div className="sm:col-span-2">
                  <input
                    type="url"
                    value={settings.receptionMapsUrl || ''}
                    onChange={(e) => onChange({ receptionMapsUrl: e.target.value })}
                    placeholder="Enlace de Google Maps (https://maps.app.goo.gl/...)"
                    className="w-full px-3.5 py-2 rounded-xl border border-[#E5E2D0] bg-white text-xs text-stone-800 font-mono"
                  />
                </div>
              </div>
            </div>
          </div>
        )}

        {/* STEP 3: ITINERARIO */}
        {activeStep === 'itinerario' && (
          <div className="space-y-6 animate-fadeIn">
            <div className="border-b border-[#E5E2D0] pb-3 flex items-center justify-between">
              <div>
                <h4 className="font-serif text-base font-bold text-stone-900">
                  3. Itinerario & Cronograma del Evento
                </h4>
                <p className="text-xs text-stone-500">
                  Define las horas y momentos clave de tu celebración.
                </p>
              </div>
              <button
                type="button"
                onClick={handleAddItineraryItem}
                className="px-3 py-1.5 rounded-xl bg-[#5A5A40] text-white text-xs font-semibold flex items-center gap-1.5 cursor-pointer hover:bg-[#484833] transition-all"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Añadir Momento</span>
              </button>
            </div>

            <div className="space-y-3">
              {itineraryItems.map((item, idx) => (
                <div
                  key={idx}
                  className="p-3.5 rounded-2xl bg-[#FAF9F0] border border-[#E5E2D0] grid grid-cols-1 sm:grid-cols-12 gap-3 items-center"
                >
                  <div className="sm:col-span-2">
                    <input
                      type="time"
                      value={item.time}
                      onChange={(e) => handleUpdateItinerary(idx, 'time', e.target.value)}
                      className="w-full px-3 py-1.5 rounded-xl border border-[#E5E2D0] bg-white text-xs font-semibold text-stone-800 text-center"
                    />
                  </div>
                  <div className="sm:col-span-4">
                    <input
                      type="text"
                      value={item.title}
                      onChange={(e) => handleUpdateItinerary(idx, 'title', e.target.value)}
                      placeholder="Momento (Ej. Ceremonia)"
                      className="w-full px-3 py-1.5 rounded-xl border border-[#E5E2D0] bg-white text-xs font-semibold text-stone-800"
                    />
                  </div>
                  <div className="sm:col-span-5">
                    <input
                      type="text"
                      value={item.desc}
                      onChange={(e) => handleUpdateItinerary(idx, 'desc', e.target.value)}
                      placeholder="Detalle (Ej. Enlace matrimonial)"
                      className="w-full px-3 py-1.5 rounded-xl border border-[#E5E2D0] bg-white text-xs text-stone-600"
                    />
                  </div>
                  <div className="sm:col-span-1 flex justify-end">
                    <button
                      type="button"
                      onClick={() => handleRemoveItineraryItem(idx)}
                      disabled={itineraryItems.length <= 1}
                      className="p-1.5 rounded-lg text-stone-400 hover:text-rose-600 hover:bg-rose-50 transition-colors cursor-pointer disabled:opacity-30"
                      title="Eliminar"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* STEP 4: VESTIMENTA */}
        {activeStep === 'vestimenta' && (
          <div className="space-y-6 animate-fadeIn">
            <div className="border-b border-[#E5E2D0] pb-3">
              <h4 className="font-serif text-base font-bold text-stone-900">
                4. Código de Vestimenta (Dress Code)
              </h4>
              <p className="text-xs text-stone-500">
                Orienta a tus invitados sobre el atuendo adecuado para tu boda.
              </p>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-stone-700 uppercase tracking-wider mb-1.5">
                  Estilo Principal
                </label>
                <input
                  type="text"
                  value={settings.dressCode || 'Formal / Traje y Vestido Largo'}
                  onChange={(e) => onChange({ dressCode: e.target.value })}
                  placeholder="Ej. Rigurosa Etiqueta / Formal Elegante / Guayabera & Vestido Cóctel"
                  className="w-full px-4 py-2.5 rounded-xl border border-[#E5E2D0] bg-[#FAF9F0] focus:bg-white text-xs text-stone-800 font-semibold"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-stone-700 uppercase tracking-wider mb-1.5">
                  Nota o Recomendaciones Especiales
                </label>
                <textarea
                  rows={3}
                  value={settings.dressCodeDescription || ''}
                  onChange={(e) => onChange({ dressCodeDescription: e.target.value })}
                  placeholder="Ej. Agradecemos reservar el color blanco y marfil exclusivamente para la novia. Se sugiere calzado cómodo para césped..."
                  className="w-full px-4 py-2.5 rounded-xl border border-[#E5E2D0] bg-[#FAF9F0] focus:bg-white text-xs text-stone-800 leading-relaxed"
                />
              </div>
            </div>
          </div>
        )}

        {/* STEP 5: REGALOS (PERÚ & BILLETERAS DIGITALES) */}
        {activeStep === 'regalos' && (
          <div className="space-y-6 animate-fadeIn">
            <div className="border-b border-[#E5E2D0] pb-3 flex items-center justify-between">
              <div>
                <h4 className="font-serif text-base font-bold text-stone-900">
                  5. Mesa de Regalos & Cuentas Bancarias (Perú)
                </h4>
                <p className="text-xs text-stone-500">
                  Configura tus cuentas en BCP, BBVA, Interbank, Scotiabank o billeteras Yape / Plin.
                </p>
              </div>
              <span className="text-[10px] bg-amber-100 text-amber-900 font-bold px-2.5 py-0.5 rounded-full border border-amber-200">
                🇵🇪 Optimizado para Perú
              </span>
            </div>

            {/* Quick Bank Presets */}
            <div className="space-y-2">
              <label className="block text-[11px] font-bold text-stone-700 uppercase tracking-wider">
                Selección Rápida de Banco o Billetera:
              </label>
              <div className="flex flex-wrap gap-1.5">
                {PERU_BANKS.map((b) => (
                  <button
                    key={b}
                    type="button"
                    onClick={() => onChange({ bankName: b, enableBankTransfer: true })}
                    className={`px-3 py-1.5 rounded-xl text-xs font-semibold border transition-all cursor-pointer ${
                      (settings.bankName || 'BCP').toLowerCase().includes(b.toLowerCase().split(' ')[0])
                        ? 'bg-[#5A5A40] text-white border-[#5A5A40] shadow-2xs'
                        : 'bg-[#FAF9F0] text-stone-700 border-[#E5E2D0] hover:bg-white'
                    }`}
                  >
                    {b}
                  </button>
                ))}
              </div>
            </div>

            {/* Bank details form */}
            <div className="p-4 rounded-2xl bg-[#FAF9F0] border border-[#E5E2D0] space-y-4">
              <div className="flex items-center gap-2">
                <Gift className="w-4 h-4 text-[#5A5A40]" />
                <h5 className="text-xs font-bold text-stone-800 uppercase tracking-wider">
                  Datos de Cuenta Bancaria / Yape / Plin
                </h5>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                <div>
                  <label className="block text-[11px] font-semibold text-stone-600 mb-1">
                    Banco / Entidad Financiera
                  </label>
                  <input
                    type="text"
                    value={settings.bankName || ''}
                    onChange={(e) => onChange({ bankName: e.target.value, enableBankTransfer: true })}
                    placeholder="Ej. BCP (Banco de Crédito del Perú) o Interbank"
                    className="w-full px-3.5 py-2 rounded-xl border border-[#E5E2D0] bg-white text-xs text-stone-800"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-semibold text-stone-600 mb-1">
                    Titular de la Cuenta / Beneficiario
                  </label>
                  <input
                    type="text"
                    value={settings.bankBeneficiary || ''}
                    onChange={(e) => onChange({ bankBeneficiary: e.target.value, enableBankTransfer: true })}
                    placeholder="Nombres y Apellidos de los Novios"
                    className="w-full px-3.5 py-2 rounded-xl border border-[#E5E2D0] bg-white text-xs text-stone-800"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-semibold text-stone-600 mb-1">
                    Número de Cuenta (Soles / Dólares)
                  </label>
                  <input
                    type="text"
                    value={settings.bankAccountNumber || ''}
                    onChange={(e) => onChange({ bankAccountNumber: e.target.value, enableBankTransfer: true })}
                    placeholder="Ej. 194-12345678-0-99"
                    className="w-full px-3.5 py-2 rounded-xl border border-[#E5E2D0] bg-white text-xs text-stone-800 font-mono"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-semibold text-stone-600 mb-1">
                    Código de Cuenta Interbancario (CCI - 20 dígitos)
                  </label>
                  <input
                    type="text"
                    value={settings.bankClabe || settings.bankCci || ''}
                    onChange={(e) =>
                      onChange({
                        bankClabe: e.target.value,
                        bankCci: e.target.value,
                        enableBankTransfer: true,
                      })
                    }
                    placeholder="002 194 001234567809 99"
                    className="w-full px-3.5 py-2 rounded-xl border border-[#E5E2D0] bg-white text-xs text-stone-800 font-mono"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-semibold text-stone-600 mb-1 flex items-center gap-1">
                    <Smartphone className="w-3 h-3 text-amber-700" />
                    <span>Número de Celular para Yape / Plin</span>
                  </label>
                  <input
                    type="tel"
                    value={settings.bankYapePhone || ''}
                    onChange={(e) => onChange({ bankYapePhone: e.target.value, enableBankTransfer: true })}
                    placeholder="+51 987 654 321"
                    className="w-full px-3.5 py-2 rounded-xl border border-[#E5E2D0] bg-white text-xs text-stone-800 font-mono"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-semibold text-stone-600 mb-1">
                    Concepto Sugerido para la Transferencia
                  </label>
                  <input
                    type="text"
                    value={settings.bankConcept || ''}
                    onChange={(e) => onChange({ bankConcept: e.target.value, enableBankTransfer: true })}
                    placeholder="Regalo Boda Ana & Carlos"
                    className="w-full px-3.5 py-2 rounded-xl border border-[#E5E2D0] bg-white text-xs text-stone-800"
                  />
                </div>
              </div>
            </div>
          </div>
        )}

        {/* STEP 6: GALERÍA DE FOTOS (GESTIÓN EXCLUSIVA PARA LOS NOVIOS) */}
        {activeStep === 'galeria' && (
          <div className="space-y-6 animate-fadeIn">
            <div className="border-b border-[#E5E2D0] pb-3 flex items-center justify-between">
              <div>
                <h4 className="font-serif text-base font-bold text-stone-900">
                  6. Galería de Fotos & Álbumes en la Nube
                </h4>
                <p className="text-xs text-stone-500">
                  Sube las fotos oficiales que verán tus invitados o enlaza un álbum compartido en Google Photos / Drive.
                </p>
              </div>
              <span className="text-[10px] uppercase font-bold tracking-widest bg-emerald-50 text-emerald-800 border border-emerald-200 px-2.5 py-0.5 rounded-full flex items-center gap-1">
                <Zap className="w-3 h-3" /> AVIF 95%
              </span>
            </div>

            {/* Couple Upload Box & Drag and Drop Dropzone */}
            <div className="p-4 sm:p-5 rounded-2xl bg-[#FAF9F0] border border-[#E5E2D0] space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Camera className="w-4 h-4 text-[#5A5A40]" />
                  <h5 className="text-xs font-bold text-stone-800 uppercase tracking-wider">
                    Subir Fotografías a la Galería Oficial
                  </h5>
                </div>
                <span className="text-[10px] bg-amber-100 text-amber-900 border border-amber-200 font-bold px-2 py-0.5 rounded-full">
                  Hasta 10 fotos a la vez
                </span>
              </div>

              {/* Caption control */}
              <div>
                <label className="block text-[11px] font-semibold text-stone-600 mb-1">
                  Nota o pie de foto para este lote (opcional):
                </label>
                <input
                  type="text"
                  value={galleryCaption}
                  onChange={(e) => setGalleryCaption(e.target.value)}
                  placeholder="Ej. Sesión de fotos preboda / Recuerdos especiales"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-[#E5E2D0] bg-white text-xs text-stone-800 focus:outline-none focus:ring-1 focus:ring-[#5A5A40]"
                />
              </div>

              {/* Drag and Drop Zone + Multi-file input */}
              <div
                onDragOver={handleGalleryDragOver}
                onDragLeave={handleGalleryDragLeave}
                onDrop={handleGalleryDrop}
                className={`relative rounded-2xl border-2 border-dashed p-6 text-center transition-all ${
                  isDraggingGallery
                    ? 'border-[#5A5A40] bg-[#5A5A40]/10 scale-[1.01]'
                    : 'border-[#E5E2D0] bg-white hover:border-[#5A5A40]/50 hover:bg-stone-50/50'
                }`}
              >
                <input
                  type="file"
                  multiple
                  accept="image/*"
                  id="gallery-multi-upload-input"
                  onChange={handleGalleryPhotoUpload}
                  disabled={isUploadingGalleryPhoto}
                  className="hidden"
                />

                {isUploadingGalleryPhoto ? (
                  <div className="space-y-3 py-2">
                    <Loader2 className="w-8 h-8 animate-spin text-[#5A5A40] mx-auto" />
                    <div className="space-y-1">
                      <p className="text-xs font-bold text-stone-800">
                        {batchUploadProgress
                          ? `Procesando foto ${batchUploadProgress.current} de ${batchUploadProgress.total}...`
                          : 'Optimizando fotografías en AVIF al 95%...'}
                      </p>
                      {batchUploadProgress?.currentFileName && (
                        <p className="text-[11px] text-stone-500 font-mono truncate max-w-xs mx-auto">
                          {batchUploadProgress.currentFileName}
                        </p>
                      )}
                    </div>
                    {batchUploadProgress && (
                      <div className="w-full max-w-xs mx-auto bg-stone-200 rounded-full h-1.5 overflow-hidden">
                        <div
                          className="bg-[#5A5A40] h-full transition-all duration-300"
                          style={{
                            width: `${(batchUploadProgress.current / batchUploadProgress.total) * 100}%`,
                          }}
                        />
                      </div>
                    )}
                  </div>
                ) : (
                  <label
                    htmlFor="gallery-multi-upload-input"
                    className="cursor-pointer block space-y-2 select-none"
                  >
                    <div className="w-12 h-12 rounded-2xl bg-[#FAF9F0] border border-[#E5E2D0] flex items-center justify-center text-[#5A5A40] mx-auto shadow-2xs">
                      <Upload className="w-5 h-5" />
                    </div>
                    <div>
                      <p className="text-xs font-bold text-stone-800">
                        {isDraggingGallery
                          ? '¡Suelta tus fotos aquí para subirlas!'
                          : 'Arrastra y suelta, pega (Ctrl+V) o haz clic para seleccionar fotos'}
                      </p>
                      <p className="text-[11px] text-stone-500 mt-0.5">
                        Formatos JPG, PNG, WEBP, HEIC. También puedes <strong className="text-stone-700">pegar imágenes directamente con Ctrl+V</strong>. Se optimizarán automáticamente en <span className="font-semibold text-emerald-800">AVIF al 95%</span>.
                      </p>
                    </div>
                    <div className="pt-1 flex items-center justify-center gap-2">
                      <span className="inline-flex items-center gap-1.5 px-4 py-1.5 rounded-xl bg-[#5A5A40] hover:bg-[#484833] text-white text-xs font-semibold shadow-xs transition-all">
                        <Plus className="w-3.5 h-3.5" />
                        <span>Seleccionar Fotos</span>
                      </span>
                      <span className="inline-flex items-center gap-1 px-3 py-1.5 rounded-xl bg-stone-100 text-stone-700 border border-stone-300 text-xs font-mono font-medium shadow-2xs">
                        <Clipboard className="w-3 h-3 text-[#5A5A40]" />
                        <span>Ctrl+V para Pegar</span>
                      </span>
                    </div>
                  </label>
                )}
              </div>

              {/* Batch Summary & AVIF details */}
              {batchSummary && (
                <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-3 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs text-emerald-900 animate-fadeIn">
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                    <span className="font-semibold">
                      ¡{batchSummary.count} foto(s) subidas exitosamente en AVIF al 95%!
                    </span>
                  </div>
                  <span className="text-[11px] font-mono text-emerald-800">
                    {formatBytes(batchSummary.originalBytes)} ➔ {formatBytes(batchSummary.optimizedBytes)} ({batchSummary.savedPercent}% ahorro)
                  </span>
                </div>
              )}

              {galleryUploadSuccess && !batchSummary && (
                <p className="text-[11px] text-emerald-800 bg-emerald-50 border border-emerald-200 px-3 py-2 rounded-xl font-medium animate-fadeIn">
                  {galleryUploadSuccess}
                </p>
              )}
            </div>

            {/* Current Uploaded Photos Grid */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-stone-700 uppercase tracking-wider flex items-center gap-1.5">
                  <ImageIcon className="w-3.5 h-3.5 text-[#5A5A40]" />
                  Fotos en la Galería ({galleryPhotos.length})
                </span>
                {loadingGallery && (
                  <span className="text-[11px] text-stone-400 flex items-center gap-1">
                    <Loader2 className="w-3 h-3 animate-spin text-amber-700" /> Cargando fotos...
                  </span>
                )}
              </div>

              {galleryPhotos.length === 0 ? (
                <div className="p-8 border border-dashed border-[#E5E2D0] rounded-2xl text-center bg-[#FAF9F0]">
                  <Camera className="w-8 h-8 text-stone-400 mx-auto mb-2" />
                  <p className="text-xs text-stone-600 font-medium">
                    Aún no has subido fotos a la galería.
                  </p>
                  <p className="text-[11px] text-stone-400 mt-0.5">
                    Sube recuerdos arriba para que aparezcan en la invitación de tus invitados.
                  </p>
                </div>
              ) : (
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
                  {galleryPhotos.map((photo) => (
                    <div
                      key={photo.id}
                      className="relative aspect-square rounded-2xl overflow-hidden border border-[#E5E2D0] bg-stone-100 group shadow-2xs"
                    >
                      <img
                        src={photo.url}
                        alt={photo.caption || 'Foto'}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity p-2 flex flex-col justify-between">
                        <span className="text-[9px] uppercase font-bold bg-white/30 backdrop-blur-xs text-white px-2 py-0.5 rounded-full self-start flex items-center gap-1">
                          <Heart className="w-2.5 h-2.5 fill-rose-400 text-rose-400" />
                          <span>{photo.likesCount || 0}</span>
                        </span>
                        <div className="flex items-center justify-between text-white">
                          <span className="text-[10px] truncate max-w-[70%] font-medium">
                            {photo.caption || 'Foto de los novios'}
                          </span>
                          <button
                            type="button"
                            onClick={() => handleDeleteGalleryPhoto(photo.id)}
                            className="p-1 rounded-lg bg-rose-600 hover:bg-rose-700 text-white transition-colors cursor-pointer"
                            title="Eliminar foto"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* External Cloud Album Links */}
            <div className="p-4 rounded-2xl bg-[#FAF9F0] border border-[#E5E2D0] space-y-3">
              <div className="flex items-center gap-2">
                <LinkIcon className="w-4 h-4 text-[#5A5A40]" />
                <h5 className="text-xs font-bold text-stone-800 uppercase tracking-wider">
                  Enlace Opcional a Álbum en la Nube (Google Photos / Drive / Apple)
                </h5>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-semibold text-stone-600 mb-1">
                    Título del Botón
                  </label>
                  <input
                    type="text"
                    value={settings.galleryExternalAlbumTitle || 'Ver Álbum en Google Photos'}
                    onChange={(e) => onChange({ galleryExternalAlbumTitle: e.target.value })}
                    placeholder="Ej. Ver Álbum en Google Photos"
                    className="w-full px-3.5 py-2 rounded-xl border border-[#E5E2D0] bg-white text-xs text-stone-800"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-semibold text-stone-600 mb-1">
                    URL Pública del Álbum Compartido
                  </label>
                  <input
                    type="url"
                    value={settings.galleryExternalAlbumUrl || ''}
                    onChange={(e) => onChange({ galleryExternalAlbumUrl: e.target.value })}
                    placeholder="https://photos.app.goo.gl/..."
                    className="w-full px-3.5 py-2 rounded-xl border border-[#E5E2D0] bg-white text-xs text-stone-800 font-mono"
                  />
                </div>
              </div>
            </div>
          </div>
        )}

        {/* STEP: VIDEO DE HISTORIA (OPCIONAL) */}
        {activeStep === 'video' && (
          <div className="space-y-6 animate-fadeIn">
            <div className="border-b border-[#E5E2D0] pb-3 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <div className="flex items-center gap-2">
                  <h4 className="font-serif text-base font-bold text-stone-900">
                    Nuestra Historia en Video
                  </h4>
                  <span className="text-[10px] bg-amber-100 text-amber-900 font-bold px-2 py-0.5 rounded-full border border-amber-200">
                    Opcional
                  </span>
                </div>
                <p className="text-xs text-stone-500 mt-0.5">
                  Comparte el video de su propuesta, save the date, o reel de Instagram / YouTube.
                </p>
              </div>

              {/* Toggle Switch */}
              <label className="inline-flex items-center gap-2 cursor-pointer select-none bg-[#FAF9F0] border border-[#E5E2D0] px-3.5 py-1.5 rounded-2xl">
                <input
                  type="checkbox"
                  checked={settings.showVideoMemories === true}
                  onChange={(e) => onChange({ showVideoMemories: e.target.checked })}
                  className="sr-only peer"
                />
                <div className="w-9 h-5 bg-stone-300 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-[#5A5A40] relative"></div>
                <span className="text-xs font-bold text-stone-800">
                  {settings.showVideoMemories === true ? 'Sección Activada' : 'Sección Desactivada'}
                </span>
              </label>
            </div>

            {settings.showVideoMemories !== true ? (
              <div className="p-8 border border-dashed border-[#E5E2D0] rounded-2xl text-center bg-[#FAF9F0] space-y-2">
                <Film className="w-8 h-8 text-stone-400 mx-auto" />
                <p className="text-xs text-stone-700 font-bold">
                  La sección de video está actualmente desactivada en la invitación.
                </p>
                <p className="text-[11px] text-stone-500 max-w-md mx-auto">
                  Si deseas mostrar un video de su historia (YouTube, TikTok, Instagram Reel o Vimeo), actívala con el botón superior.
                </p>
              </div>
            ) : (
              <div className="space-y-6">
                {/* Form to add video */}
                <form onSubmit={handleAddVideoSubmit} className="p-4 rounded-2xl bg-[#FAF9F0] border border-[#E5E2D0] space-y-4">
                  <h5 className="text-xs font-bold text-stone-800 uppercase tracking-wider flex items-center gap-1.5">
                    <Plus className="w-4 h-4 text-[#5A5A40]" />
                    Agregar Video a la Invitación
                  </h5>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <div className="sm:col-span-2">
                      <label className="block text-[11px] font-semibold text-stone-700 mb-1">
                        Título del Video
                      </label>
                      <input
                        type="text"
                        value={newVideoTitle}
                        onChange={(e) => setNewVideoTitle(e.target.value)}
                        placeholder="Ej. Nuestra Propuesta en Cusco / Save The Date"
                        className="w-full px-3.5 py-2 rounded-xl border border-[#E5E2D0] bg-white text-xs text-stone-800"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] font-semibold text-stone-700 mb-1">
                        Plataforma
                      </label>
                      <select
                        value={newVideoPlatform}
                        onChange={(e) => setNewVideoPlatform(e.target.value as any)}
                        className="w-full px-3.5 py-2 rounded-xl border border-[#E5E2D0] bg-white text-xs text-stone-800"
                      >
                        <option value="youtube">YouTube</option>
                        <option value="vimeo">Vimeo</option>
                        <option value="tiktok">TikTok</option>
                        <option value="direct">Enlace Directo / MP4</option>
                      </select>
                    </div>
                  </div>

                  <div>
                    <label className="block text-[11px] font-semibold text-stone-700 mb-1">
                      Enlace del Video (URL de YouTube / Vimeo / TikTok)
                    </label>
                    <input
                      type="url"
                      value={newVideoUrl}
                      onChange={(e) => setNewVideoUrl(e.target.value)}
                      placeholder="https://www.youtube.com/watch?v=..."
                      className="w-full px-3.5 py-2 rounded-xl border border-[#E5E2D0] bg-white text-xs text-stone-800 font-mono"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-semibold text-stone-700 mb-1">
                      Descripción o Dedicatoria (Opcional)
                    </label>
                    <input
                      type="text"
                      value={newVideoDesc}
                      onChange={(e) => setNewVideoDesc(e.target.value)}
                      placeholder="Un vistazo de nuestro camino juntos..."
                      className="w-full px-3.5 py-2 rounded-xl border border-[#E5E2D0] bg-white text-xs text-stone-800"
                    />
                  </div>

                  <div className="flex justify-end">
                    <button
                      type="submit"
                      disabled={isAddingVideo || !newVideoTitle.trim() || !newVideoUrl.trim()}
                      className="px-5 py-2 rounded-xl bg-[#5A5A40] hover:bg-[#484833] text-white text-xs font-bold flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
                    >
                      {isAddingVideo ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Plus className="w-3.5 h-3.5" />}
                      <span>Agregar Video</span>
                    </button>
                  </div>
                </form>

                {/* Videos list */}
                <div className="space-y-3">
                  <span className="text-xs font-bold text-stone-700 uppercase tracking-wider flex items-center gap-1.5">
                    <Video className="w-3.5 h-3.5 text-[#5A5A40]" />
                    Videos Publicados ({videoList.length})
                  </span>

                  {loadingVideos ? (
                    <div className="p-4 text-center text-xs text-stone-400 flex items-center justify-center gap-2">
                      <Loader2 className="w-4 h-4 animate-spin text-amber-700" /> Cargando videos...
                    </div>
                  ) : videoList.length === 0 ? (
                    <div className="p-6 border border-dashed border-[#E5E2D0] rounded-2xl text-center bg-[#FAF9F0]">
                      <p className="text-xs text-stone-600">Aún no has agregado videos.</p>
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      {videoList.map((vid) => (
                        <div key={vid.id} className="p-3.5 bg-[#FAF9F0] border border-[#E5E2D0] rounded-2xl flex items-start justify-between gap-3">
                          <div className="min-w-0">
                            <h6 className="text-xs font-bold text-stone-900 truncate">{vid.title}</h6>
                            <p className="text-[10px] text-stone-500 font-mono truncate">{vid.videoUrl}</p>
                            {vid.description && <p className="text-[11px] text-stone-600 mt-1 line-clamp-2">{vid.description}</p>}
                          </div>
                          <button
                            type="button"
                            onClick={() => handleDeleteVideo(vid.id)}
                            className="p-1.5 rounded-xl bg-rose-50 text-rose-600 hover:bg-rose-100 transition-colors cursor-pointer shrink-0"
                            title="Eliminar video"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        )}

        {/* STEP: LIBRO DE FIRMAS & DESEOS (OPCIONAL) */}
        {activeStep === 'libro' && (
          <div className="space-y-6 animate-fadeIn">
            <div className="border-b border-[#E5E2D0] pb-3 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <div className="flex items-center gap-2">
                  <h4 className="font-serif text-base font-bold text-stone-900">
                    Libro de Firmas Virtual
                  </h4>
                  <span className="text-[10px] bg-amber-100 text-amber-900 font-bold px-2 py-0.5 rounded-full border border-amber-200">
                    Opcional
                  </span>
                </div>
                <p className="text-xs text-stone-500 mt-0.5">
                  Permite a tus invitados dejar dedicatorias y felicitaciones con buenos deseos en su invitación.
                </p>
              </div>

              {/* Toggle Switch */}
              <label className="inline-flex items-center gap-2 cursor-pointer select-none bg-[#FAF9F0] border border-[#E5E2D0] px-3.5 py-1.5 rounded-2xl">
                <input
                  type="checkbox"
                  checked={settings.showGuestbook === true}
                  onChange={(e) => onChange({ showGuestbook: e.target.checked })}
                  className="sr-only peer"
                />
                <div className="w-9 h-5 bg-stone-300 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-[#5A5A40] relative"></div>
                <span className="text-xs font-bold text-stone-800">
                  {settings.showGuestbook === true ? 'Sección Activada' : 'Sección Desactivada'}
                </span>
              </label>
            </div>

            {settings.showGuestbook !== true ? (
              <div className="p-8 border border-dashed border-[#E5E2D0] rounded-2xl text-center bg-[#FAF9F0] space-y-2">
                <BookOpen className="w-8 h-8 text-stone-400 mx-auto" />
                <p className="text-xs text-stone-700 font-bold">
                  El libro de firmas está actualmente desactivado en la invitación.
                </p>
                <p className="text-[11px] text-stone-500 max-w-md mx-auto">
                  Si deseas que los invitados escriban mensajes y felicitaciones que aparezcan en un mural de deseos, actívalo arriba.
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-stone-700 uppercase tracking-wider flex items-center gap-1.5">
                    <MessageSquare className="w-3.5 h-3.5 text-[#5A5A40]" />
                    Deseos y Mensajes de Invitados ({wishesList.length})
                  </span>
                  {loadingWishes && (
                    <span className="text-[11px] text-stone-400 flex items-center gap-1">
                      <Loader2 className="w-3 h-3 animate-spin text-amber-700" /> Cargando...
                    </span>
                  )}
                </div>

                {wishesList.length === 0 ? (
                  <div className="p-8 border border-dashed border-[#E5E2D0] rounded-2xl text-center bg-[#FAF9F0]">
                    <p className="text-xs text-stone-600 font-medium">Aún no hay dedicatorias escritas.</p>
                    <p className="text-[11px] text-stone-400 mt-0.5">
                      Cuando tus invitados firmen el libro desde la invitación, podrás verlos y gestionarlos aquí.
                    </p>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
                    {wishesList.map((wish) => (
                      <div key={wish.id} className="p-3.5 bg-[#FAF9F0] border border-[#E5E2D0] rounded-2xl space-y-2 flex flex-col justify-between">
                        <div>
                          <div className="flex items-center justify-between gap-2">
                            <span className="text-xs font-bold text-stone-900 truncate">{wish.guestName}</span>
                            <span className="text-[9px] text-stone-400">{wish.relationship || 'Invitado'}</span>
                          </div>
                          <p className="text-xs text-stone-600 italic mt-1 line-clamp-3">"{wish.message}"</p>
                        </div>
                        <div className="flex justify-end pt-2 border-t border-[#E5E2D0]/60">
                          <button
                            type="button"
                            onClick={() => handleDeleteWish(wish.id)}
                            className="p-1 text-rose-600 hover:text-rose-800 text-xs font-medium flex items-center gap-1 cursor-pointer"
                          >
                            <Trash2 className="w-3 h-3" /> Eliminar
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
        )}

        {/* STEP 7: CONFIRMACIÓN RSVP */}
        {activeStep === 'confirmacion' && (
          <div className="space-y-6 animate-fadeIn">
            <div className="border-b border-[#E5E2D0] pb-3">
              <h4 className="font-serif text-base font-bold text-stone-900">
                7. Confirmación de Asistencia (RSVP)
              </h4>
              <p className="text-xs text-stone-500">
                Establece la fecha límite y el número de contacto directo para tus invitados.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-stone-700 uppercase tracking-wider mb-1.5">
                  Fecha Límite para Confirmar (RSVP)
                </label>
                <input
                  type="date"
                  value={settings.rsvpDeadline || ''}
                  onChange={(e) => onChange({ rsvpDeadline: e.target.value })}
                  className="w-full px-4 py-2.5 rounded-xl border border-[#E5E2D0] bg-[#FAF9F0] focus:bg-white text-xs text-stone-800"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-stone-700 uppercase tracking-wider mb-1.5">
                  Teléfono de Contacto / WhatsApp (Perú)
                </label>
                <input
                  type="tel"
                  value={settings.contactPhone || ''}
                  onChange={(e) => onChange({ contactPhone: e.target.value })}
                  placeholder="+51 987 654 321"
                  className="w-full px-4 py-2.5 rounded-xl border border-[#E5E2D0] bg-[#FAF9F0] focus:bg-white text-xs text-stone-800 font-mono"
                />
              </div>
            </div>
          </div>
        )}

        {/* 3. Bottom Action Bar */}
        <div className="pt-4 border-t border-[#E5E2D0] flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            {settingsSavedToast && (
              <span className="text-xs text-emerald-800 bg-emerald-50 border border-emerald-200 px-3.5 py-1.5 rounded-full font-semibold flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                ¡Cambios guardados con éxito!
              </span>
            )}
          </div>

          <div className="flex items-center gap-2.5 w-full sm:w-auto justify-end">
            <button
              type="button"
              onClick={onSaveAllSettings}
              disabled={savingSettings}
              className="w-full sm:w-auto px-7 py-3 rounded-2xl bg-[#5A5A40] hover:bg-[#484833] text-white text-xs font-semibold shadow-md flex items-center justify-center gap-2 cursor-pointer transition-all disabled:opacity-50 select-none"
            >
              <Save className="w-4 h-4 text-white" />
              <span>{savingSettings ? 'Guardando en BD...' : 'Guardar Todo'}</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
