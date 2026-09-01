import React, { useRef, useState, useEffect } from 'react';
import {
  Sparkles,
  Image as ImageIcon,
  Upload,
  RotateCcw,
  Check,
  Calendar,
  Zap,
  CheckCircle2,
  Loader2,
  Clipboard,
} from 'lucide-react';
import { WeddingSettings } from '../../../types.ts';
import { WEDDING_HERO_PRESETS, HERO_FIT_OPTIONS, HERO_POSITION_OPTIONS } from '../adminConstants.ts';
import { DATE_FORMAT_OPTIONS, formatHeroDate } from '../../../lib/dateFormatters.ts';
import { optimizeImageClient, formatBytes, ImageOptimizationResult } from '../../../lib/mediaOptimizer.ts';

interface AdminHeroSettingsProps {
  settings: WeddingSettings;
  onChange: (updated: Partial<WeddingSettings>) => void;
  onOpenSimpleMode?: () => void;
}

export const AdminHeroSettings: React.FC<AdminHeroSettingsProps> = ({
  settings,
  onChange,
  onOpenSimpleMode,
}) => {
  const [uploadingHeroImage, setUploadingHeroImage] = useState(false);
  const [heroUploadMessage, setHeroUploadMessage] = useState<string | null>(null);
  const [heroOptimizationStats, setHeroOptimizationStats] = useState<ImageOptimizationResult | null>(null);
  const [isDraggingHero, setIsDraggingHero] = useState(false);
  const heroFileInputRef = useRef<HTMLInputElement>(null);
  const heroDropZoneRef = useRef<HTMLDivElement>(null);

  const processHeroFile = async (file: File) => {
    if (!file.type.startsWith('image/')) return;

    try {
      setUploadingHeroImage(true);
      setHeroUploadMessage('Optimizando imagen a formato AVIF (95% compresión)...');

      // Client-side AVIF / WebP compression and dimension scaling (2000px max)
      const optimizedResult = await optimizeImageClient(file, {
        maxDimension: 2000,
        quality: 0.70,
        preferredFormat: 'avif',
      });

      setHeroOptimizationStats(optimizedResult);

      // Instant local preview
      const previewUrl = URL.createObjectURL(optimizedResult.file);
      onChange({ coverPhoto: previewUrl });

      setHeroUploadMessage('Subiendo imagen optimizada al servidor...');
      const formData = new FormData();
      formData.append('file', optimizedResult.file);

      const res = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      });

      if (res.ok) {
        const data = await res.json();
        if (data.url) {
          onChange({ coverPhoto: data.url });
          setHeroUploadMessage('¡Foto de portada optimizada y guardada en AVIF!');
          setTimeout(() => setHeroUploadMessage(null), 4000);
        }
      } else {
        setHeroUploadMessage('Foto aplicada en vista previa.');
        setTimeout(() => setHeroUploadMessage(null), 3000);
      }
    } catch (err) {
      console.warn('Upload fallback to local preview:', err);
      // Fallback preview
      const reader = new FileReader();
      reader.onload = (event) => {
        if (event.target?.result) {
          onChange({ coverPhoto: event.target!.result as string });
        }
      };
      reader.readAsDataURL(file);
      setHeroUploadMessage('Foto aplicada localmente.');
      setTimeout(() => setHeroUploadMessage(null), 3000);
    } finally {
      setUploadingHeroImage(false);
    }
  };

  const handleHeroFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      await processHeroFile(file);
    }
  };

  // Drag and drop handlers
  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDraggingHero(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDraggingHero(false);
  };

  const handleDrop = async (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDraggingHero(false);
    const file = e.dataTransfer.files?.[0];
    if (file) {
      await processHeroFile(file);
    }
  };

  // Clipboard Paste listener when dropzone or window has focus
  const handlePaste = async (e: React.ClipboardEvent) => {
    const items = e.clipboardData?.items;
    if (!items) return;
    for (let i = 0; i < items.length; i++) {
      if (items[i].type.startsWith('image/')) {
        const file = items[i].getAsFile();
        if (file) {
          e.preventDefault();
          await processHeroFile(file);
          break;
        }
      }
    }
  };

  // Also support global paste when container is active
  useEffect(() => {
    const handleGlobalPaste = (e: ClipboardEvent) => {
      // Don't intercept paste in text inputs or textareas unless it's an image
      const activeEl = document.activeElement;
      const isInput = activeEl?.tagName === 'INPUT' || activeEl?.tagName === 'TEXTAREA';
      
      const items = e.clipboardData?.items;
      if (!items) return;
      
      for (let i = 0; i < items.length; i++) {
        if (items[i].type.startsWith('image/')) {
          const file = items[i].getAsFile();
          if (file) {
            e.preventDefault();
            processHeroFile(file);
            break;
          }
        }
      }
    };

    window.addEventListener('paste', handleGlobalPaste);
    return () => window.removeEventListener('paste', handleGlobalPaste);
  }, []);

  return (
    <div className="space-y-6">
      {/* ==================================================================== */}
      {/* HERO SECTION CONFIGURATION & ATELIER DESIGN */}
      {/* ==================================================================== */}
      <div className="bg-white p-5 sm:p-7 rounded-3xl border border-[#E5E2D0] space-y-6 shadow-sm overflow-hidden">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-[#E5E2D0] pb-4">
          <div className="min-w-0">
            <h3 className="text-base sm:text-lg font-serif text-[#1a1a1a] flex items-center gap-2 font-bold truncate">
              <Sparkles className="w-4 h-4 text-[#7D8C7A] shrink-0" />
              Fotografía y Portada del Hero
            </h3>
            <p className="text-xs text-[#7D8C7A] mt-0.5 leading-relaxed">
              Carga tu foto de portada, elige el modo de ajuste a pantalla (Cover, Stretch, Contain) y personaliza textos.
            </p>
          </div>
          {onOpenSimpleMode && (
            <button
              type="button"
              onClick={onOpenSimpleMode}
              className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-gradient-to-r from-amber-700 via-amber-800 to-amber-900 hover:brightness-110 text-amber-50 text-xs font-semibold shadow-xs transition-all cursor-pointer shrink-0 self-start sm:self-auto"
              title="Configuración ultrarrápida: pon tus datos, sube tu foto y listo"
            >
              <Sparkles className="w-3.5 h-3.5 text-amber-300 animate-pulse" />
              <span>Abrir Modo Fácil / Simple</span>
            </button>
          )}
        </div>

        {/* A. SECCIÓN DE FOTOGRAFÍA DE PORTADA (CARGA & PRESETS) */}
        <div className="space-y-4 bg-[#FAF9F0] p-4 sm:p-5 rounded-2xl border border-[#E5E2D0]">
          <div className="flex items-center justify-between">
            <label className="text-xs font-bold text-[#1a1a1a] flex items-center gap-1.5">
              <ImageIcon className="w-4 h-4 text-[#5A5A40]" />
              <span>1. Foto de Portada del Hero:</span>
            </label>
            {settings.coverPhoto && (
              <button
                type="button"
                onClick={() =>
                  onChange({
                    coverPhoto:
                      'https://images.unsplash.com/photo-1519741497674-611481863552?auto=format&fit=crop&w=2000&q=85',
                  })
                }
                className="text-[11px] text-[#7D8C7A] hover:text-[#5A5A40] flex items-center gap-1 cursor-pointer transition-colors"
                title="Restablecer foto original"
              >
                <RotateCcw className="w-3 h-3" />
                <span>Restablecer por defecto</span>
              </button>
            )}
          </div>

          {/* Dropzone / Upload Box with Drag & Drop and Direct Paste (Ctrl+V) */}
          <div
            ref={heroDropZoneRef}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            onPaste={handlePaste}
            tabIndex={0}
            className={`grid grid-cols-1 md:grid-cols-12 gap-4 items-center p-3 sm:p-4 rounded-3xl border-2 transition-all outline-none ${
              isDraggingHero
                ? 'border-[#5A5A40] bg-[#5A5A40]/10 scale-[1.01]'
                : 'border-transparent bg-transparent'
            }`}
          >
            {/* Photo Preview Thumbnail */}
            <div className="md:col-span-4 relative group rounded-2xl overflow-hidden border border-[#E5E2D0] bg-stone-900 aspect-3/4 max-h-56 flex items-center justify-center shadow-xs">
              {settings.coverPhoto ? (
                <>
                  <img
                    src={settings.coverPhoto}
                    alt="Hero cover preview"
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent flex flex-col justify-end p-2.5">
                    <span className="text-[10px] font-semibold text-white truncate">
                      Foto Actual
                    </span>
                    <span className="text-[9px] text-amber-200 uppercase font-mono">
                      {settings.heroImageFit || 'cover'} • {settings.heroImagePosition || 'center'}
                    </span>
                  </div>
                </>
              ) : (
                <div className="text-center p-4 text-stone-400">
                  <ImageIcon className="w-8 h-8 mx-auto mb-1 opacity-60" />
                  <span className="text-xs">Sin foto</span>
                </div>
              )}
            </div>

            {/* Upload Controls */}
            <div className="md:col-span-8 space-y-3">
              {/* Hidden file input */}
              <input
                type="file"
                ref={heroFileInputRef}
                onChange={handleHeroFileUpload}
                accept="image/*"
                className="hidden"
              />

              {/* Main upload button */}
              <button
                type="button"
                onClick={() => heroFileInputRef.current?.click()}
                disabled={uploadingHeroImage}
                className="w-full py-4 px-4 rounded-2xl bg-white border-2 border-dashed border-[#7D8C7A]/60 hover:border-[#5A5A40] hover:bg-[#F0EEDC] text-[#5A5A40] font-semibold text-xs flex flex-col items-center justify-center gap-1.5 cursor-pointer transition-all shadow-xs group"
              >
                {uploadingHeroImage ? (
                  <div className="flex items-center gap-2">
                    <Loader2 className="w-4 h-4 text-[#5A5A40] animate-spin" />
                    <span>Optimizando a formato AVIF & guardando...</span>
                  </div>
                ) : (
                  <>
                    <div className="flex items-center gap-2">
                      <Upload className="w-4 h-4 text-[#5A5A40] shrink-0 group-hover:scale-110 transition-transform" />
                      <span>Arrastra o selecciona foto desde tu dispositivo</span>
                      <span className="text-[10px] bg-emerald-100 text-emerald-800 font-bold px-2 py-0.5 rounded-full flex items-center gap-1">
                        <Zap className="w-2.5 h-2.5" /> AVIF 95%
                      </span>
                    </div>
                    <div className="flex items-center gap-1.5 text-[11px] text-[#7D8C7A]">
                      <Clipboard className="w-3 h-3 text-[#7D8C7A]" />
                      <span>o pega una imagen copiada directamente presionando <strong>Ctrl+V</strong></span>
                    </div>
                  </>
                )}
              </button>

              {/* AVIF Optimization Info Badge */}
              {heroOptimizationStats && (
                <div className="bg-emerald-50/90 border border-emerald-200 rounded-xl p-2.5 flex items-center justify-between gap-2 text-xs text-emerald-900">
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                    <div>
                      <p className="font-semibold text-[11px] leading-tight">
                        Optimización AVIF completada
                      </p>
                      <p className="text-[10px] text-emerald-700">
                        {formatBytes(heroOptimizationStats.originalSize)} ➔ {formatBytes(heroOptimizationStats.optimizedSize)} ({heroOptimizationStats.compressionRatio}% de ahorro)
                      </p>
                    </div>
                  </div>
                  <span className="text-[10px] font-mono font-bold bg-emerald-200/80 text-emerald-900 px-2 py-0.5 rounded-md">
                    {heroOptimizationStats.format.replace('image/', '').toUpperCase()}
                  </span>
                </div>
              )}

              {heroUploadMessage && (
                <p className="text-[11px] text-emerald-800 bg-emerald-50 border border-emerald-200 px-3 py-1.5 rounded-xl font-medium flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                  <span>{heroUploadMessage}</span>
                </p>
              )}

              {/* Direct URL input */}
              <div className="space-y-1">
                <label className="text-[11px] font-semibold text-[#5A5A40] block">
                  O pega un enlace de imagen directo (URL):
                </label>
                <div className="flex gap-2">
                  <input
                    type="url"
                    placeholder="https://mis-fotos.com/boda-portada.jpg"
                    value={settings.coverPhoto || ''}
                    onChange={(e) =>
                      onChange({ coverPhoto: e.target.value })
                    }
                    className="w-full bg-white border border-[#E5E2D0] rounded-xl px-3 py-2 text-xs text-[#3D3D3D] focus:outline-none focus:border-[#5A5A40]"
                  />
                </div>
              </div>

              {/* Preset photo picker */}
              <div className="space-y-1.5 pt-1">
                <span className="text-[11px] font-semibold text-[#7D8C7A] block">
                  Fotos de Boda Profesionales Preestablecidas (1 clic para probar):
                </span>
                <div className="grid grid-cols-3 sm:grid-cols-6 gap-1.5">
                  {WEDDING_HERO_PRESETS.map((preset) => {
                    const isCurrent = settings.coverPhoto === preset.url;
                    return (
                      <button
                        key={preset.id}
                        type="button"
                        onClick={() =>
                          onChange({ coverPhoto: preset.url })
                        }
                        className={`relative rounded-xl overflow-hidden aspect-square border transition-all cursor-pointer group ${
                          isCurrent
                            ? 'border-[#5A5A40] ring-2 ring-[#5A5A40]/30 shadow-xs'
                            : 'border-[#E5E2D0] hover:border-[#7D8C7A]'
                        }`}
                        title={preset.name}
                      >
                        <img
                          src={preset.thumbnail}
                          alt={preset.name}
                          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                        />
                        <div className="absolute inset-0 bg-black/30 group-hover:bg-black/10 transition-colors" />
                        <span className="absolute bottom-0.5 inset-x-0.5 text-[8px] font-medium text-white bg-black/60 px-1 py-0.5 rounded text-center truncate">
                          {preset.tag}
                        </span>
                        {isCurrent && (
                          <div className="absolute top-1 right-1 w-3.5 h-3.5 rounded-full bg-[#5A5A40] text-white flex items-center justify-center text-[8px]">
                            ✓
                          </div>
                        )}
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>

          {/* B. ESTILOS DE AJUSTE A PANTALLA (DISPLAY FIT OPTIONS) */}
          <div className="pt-3 border-t border-[#E5E2D0]/80 space-y-2.5">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold text-[#1a1a1a] block">
                Modo de Ajuste de la Foto a la Pantalla (Display Fit):
              </label>
              <span className="text-[10px] font-mono text-[#5A5A40] bg-white px-2 py-0.5 rounded-md border border-[#E5E2D0]">
                fit: {settings.heroImageFit || 'cover'}
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              {HERO_FIT_OPTIONS.map((fitOpt) => {
                const isSelected = (settings.heroImageFit || 'cover') === fitOpt.id;
                return (
                  <button
                    key={fitOpt.id}
                    type="button"
                    onClick={() =>
                      onChange({ heroImageFit: fitOpt.id })
                    }
                    className={`p-3 rounded-2xl border text-left transition-all cursor-pointer flex flex-col justify-between ${
                      isSelected
                        ? 'bg-white border-[#5A5A40] ring-2 ring-[#5A5A40]/20 shadow-xs'
                        : 'bg-white/60 border-[#E5E2D0] hover:bg-white hover:border-[#7D8C7A]'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-1">
                      <span className="font-serif font-bold text-xs text-[#1a1a1a]">
                        {fitOpt.title}
                      </span>
                      <span
                        className={`text-[9px] px-1.5 py-0.5 rounded-full font-semibold uppercase ${
                          isSelected
                            ? 'bg-[#5A5A40] text-white'
                            : 'bg-stone-100 text-stone-600'
                        }`}
                      >
                        {fitOpt.badge}
                      </span>
                    </div>
                    <p className="text-[11px] text-[#7D8C7A] leading-relaxed">
                      {fitOpt.desc}
                    </p>
                  </button>
                );
              })}
            </div>
          </div>

          {/* C. ENCUADRE / POSICIÓN FOCAL */}
          <div className="pt-3 border-t border-[#E5E2D0]/80 space-y-2">
            <label className="text-xs font-bold text-[#1a1a1a] block">
              Encuadre / Posición Focal de la Fotografía:
            </label>
            <div className="grid grid-cols-3 gap-2">
              {HERO_POSITION_OPTIONS.map((pos) => {
                const isSelected = (settings.heroImagePosition || 'center') === pos.id;
                return (
                  <button
                    key={pos.id}
                    type="button"
                    onClick={() =>
                      onChange({ heroImagePosition: pos.id })
                    }
                    className={`py-2 px-2.5 rounded-xl border text-center transition-all cursor-pointer ${
                      isSelected
                        ? 'bg-[#5A5A40] text-white border-[#5A5A40] shadow-xs'
                        : 'bg-white border-[#E5E2D0] text-[#3D3D3D] hover:border-[#7D8C7A]'
                    }`}
                  >
                    <span className="text-xs font-semibold block">{pos.label}</span>
                  </button>
                );
              })}
            </div>
            <span className="text-[10px] text-[#7D8C7A] block">
              Si en el móvil los rostros quedan tapados o muy arriba, selecciona <strong>"Arriba / Rostros"</strong>.
            </span>
          </div>

          {/* D. OSCURIDAD DE VIÑETA & DESENFOQUE AL SCROLL */}
          <div className="pt-3 border-t border-[#E5E2D0]/80 grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Overlay darkness */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <label className="text-xs font-bold text-[#1a1a1a]">
                  Oscuridad de la Viñeta (Legibilidad):
                </label>
                <span className="text-xs font-mono font-bold text-[#5A5A40]">
                  {settings.heroOverlayOpacity !== undefined ? settings.heroOverlayOpacity : 50}%
                </span>
              </div>
              <input
                type="range"
                min={10}
                max={90}
                step={5}
                value={settings.heroOverlayOpacity !== undefined ? settings.heroOverlayOpacity : 50}
                onChange={(e) =>
                  onChange({ heroOverlayOpacity: parseInt(e.target.value, 10) })
                }
                className="w-full accent-[#5A5A40] cursor-pointer"
              />
              <div className="flex justify-between gap-1 pt-1">
                {[20, 40, 60, 80].map((val) => (
                  <button
                    key={val}
                    type="button"
                    onClick={() =>
                      onChange({ heroOverlayOpacity: val })
                    }
                    className={`text-[10px] px-2 py-0.5 rounded-md border transition-all cursor-pointer ${
                      (settings.heroOverlayOpacity !== undefined ? settings.heroOverlayOpacity : 50) === val
                        ? 'bg-[#5A5A40] text-white border-[#5A5A40]'
                        : 'bg-white border-[#E5E2D0] text-[#7D8C7A]'
                    }`}
                  >
                    {val}%
                  </button>
                ))}
              </div>
            </div>

            {/* Scroll blur toggle */}
            <div className="space-y-2 flex flex-col justify-between">
              <label className="text-xs font-bold text-[#1a1a1a] block">
                Desenfoque Progresivo al Scroll:
              </label>
              <label className="flex items-center gap-2.5 p-2.5 bg-white rounded-xl border border-[#E5E2D0] cursor-pointer hover:bg-stone-50 transition-colors">
                <input
                  type="checkbox"
                  checked={settings.heroEnableScrollBlur !== false}
                  onChange={(e) =>
                    onChange({ heroEnableScrollBlur: e.target.checked })
                  }
                  className="w-4 h-4 rounded text-[#5A5A40] accent-[#5A5A40] cursor-pointer"
                />
                <span className="text-xs text-[#3D3D3D] font-medium">
                  Efecto Cinemático de Blur al deslizar hacia abajo
                </span>
              </label>
              <span className="text-[10px] text-[#7D8C7A] block">
                Transiciona la portada suavemente hacia el color de fondo de la boda.
              </span>
            </div>
          </div>
        </div>

        {/* 2. Selector de Formato de Fecha del Hero */}
        <div className="space-y-3 pt-2 border-t border-[#E5E2D0]">
          <label className="text-xs font-bold text-[#1a1a1a] block">
            2. Formato de la Fecha en la Portada:
          </label>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
            {DATE_FORMAT_OPTIONS.map((opt) => {
              const isSelected = (settings.heroDateFormat || 'dd.mm.aaaa') === opt.id;
              const previewText = formatHeroDate(settings.eventDate, opt.id, settings.heroCustomDateText);
              return (
                <button
                  key={opt.id}
                  type="button"
                  onClick={() =>
                    onChange({ heroDateFormat: opt.id })
                  }
                  className={`p-3 rounded-2xl border text-left transition-all cursor-pointer flex flex-col justify-between min-w-0 ${
                    isSelected
                      ? 'bg-[#FAF9F0] border-[#5A5A40] ring-2 ring-[#5A5A40]/20 shadow-xs'
                      : 'bg-white border-[#E5E2D0] hover:border-[#7D8C7A]'
                  }`}
                >
                  <div className="flex items-center justify-between w-full mb-1">
                    <span className="font-serif font-bold text-xs text-[#1a1a1a] truncate">
                      {opt.label}
                    </span>
                    {isSelected && (
                      <Check className="w-3.5 h-3.5 text-[#5A5A40] shrink-0" />
                    )}
                  </div>
                  <span className="font-mono text-[11px] text-[#5A5A40] bg-stone-100/70 px-2 py-0.5 rounded-md mt-1 block truncate w-full">
                    {previewText}
                  </span>
                </button>
              );
            })}
          </div>

          {/* Si selecciona formato personalizado */}
          {settings.heroDateFormat === 'custom' && (
            <div className="mt-2 pt-2">
              <label className="text-xs font-semibold text-[#5A5A40] block mb-1">
                Texto Exacto de la Fecha Personalizada:
              </label>
              <input
                type="text"
                placeholder="Ej. 28 • Noviembre • 2026 o Sábado 28 / 11 / 2026"
                value={settings.heroCustomDateText || ''}
                onChange={(e) =>
                  onChange({ heroCustomDateText: e.target.value })
                }
                className="w-full bg-[#FAF9F0] border border-[#E5E2D0] rounded-2xl px-3.5 py-2.5 text-xs text-[#3D3D3D] focus:outline-none focus:border-[#5A5A40]"
              />
            </div>
          )}
        </div>

        {/* 3. Nombres de los Contrayentes & Enlace Personalizado /slug */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2 border-t border-[#E5E2D0]">
          <div>
            <label className="text-xs font-bold text-[#1a1a1a] block mb-1">
              3. Nombres de los Novios:
            </label>
            <input
              type="text"
              value={settings.coupleNames}
              onChange={(e) =>
                onChange({ coupleNames: e.target.value })
              }
              placeholder="Nombre & Nombre"
              className="w-full bg-[#FAF9F0] border border-[#E5E2D0] rounded-2xl px-3.5 py-2.5 text-xs text-[#3D3D3D] focus:outline-none focus:border-[#5A5A40]"
            />
            <span className="text-[10px] text-[#7D8C7A] mt-1 block">
              Ejemplo: <em>Sofía & Alejandro</em> o <em>Sergio & Lore</em>
            </span>
          </div>

          <div>
            <label className="text-xs font-bold text-[#1a1a1a] block mb-1">
              Enlace / URL Personalizada (Slug):
            </label>
            <div className="relative flex items-center">
              <span className="absolute left-3 text-xs font-mono text-stone-400 select-none">
                /
              </span>
              <input
                type="text"
                value={settings.slug || ''}
                onChange={(e) => {
                  const cleaned = e.target.value
                    .toLowerCase()
                    .replace(/[^a-z0-9-_]/g, '');
                  onChange({ slug: cleaned });
                }}
                placeholder="bodasergioylore"
                className="w-full bg-[#FAF9F0] border border-[#E5E2D0] rounded-2xl pl-6 pr-3.5 py-2.5 text-xs text-[#3D3D3D] font-mono focus:outline-none focus:border-[#5A5A40]"
              />
            </div>
            <span className="text-[10px] text-[#7D8C7A] mt-1 block">
              Enlace directo: <em>/{settings.slug || 'bodasergioylore'}</em>
            </span>
          </div>

          <div>
            <label className="text-xs font-bold text-[#1a1a1a] block mb-1">
              Fecha del Evento:
            </label>
            <input
              type="date"
              value={settings.eventDate}
              onChange={(e) =>
                onChange({ eventDate: e.target.value })
              }
              className="w-full bg-[#FAF9F0] border border-[#E5E2D0] rounded-2xl px-3.5 py-2.5 text-xs text-[#3D3D3D] focus:outline-none focus:border-[#5A5A40]"
            />
            <span className="text-[10px] text-[#7D8C7A] mt-1 block">
              Al cambiarla, se actualiza el formato elegido arriba.
            </span>
          </div>
        </div>

        {/* 4. Frase Especial del Hero & Texto Bíblico / Cita */}
        <div className="space-y-4 pt-2 border-t border-[#E5E2D0]">
          <div>
            <label className="text-xs font-bold text-[#1a1a1a] flex items-center justify-between mb-1">
              <span>4. Frase Especial del Hero (Texto de su Preferencia):</span>
              <span className="text-[10px] text-[#7D8C7A] font-normal">
                Se enmarca automáticamente entre comillas grandes “ ”
              </span>
            </label>
            <div className="relative">
              <span className="absolute left-3.5 top-2.5 font-serif text-2xl text-[#7D8C7A]/50 select-none leading-none">
                “
              </span>
              <textarea
                rows={3}
                value={
                  settings.heroQuote !== undefined
                    ? settings.heroQuote
                    : 'El amor todo lo sufre, todo lo cree, todo lo espera, todo lo soporta.'
                }
                onChange={(e) =>
                  onChange({ heroQuote: e.target.value })
                }
                placeholder="Texto de su Preferencia o Frase de Amor..."
                className="w-full bg-[#FAF9F0] border border-[#E5E2D0] rounded-2xl pl-8 pr-8 py-3 text-xs text-[#3D3D3D] focus:outline-none focus:border-[#5A5A40] resize-none font-serif italic"
              />
              <span className="absolute right-3.5 bottom-2.5 font-serif text-2xl text-[#7D8C7A]/50 select-none leading-none">
                ”
              </span>
            </div>
          </div>

          <div>
            <label className="text-xs font-bold text-[#1a1a1a] block mb-1">
              5. Texto Bíblico o Cita / Autor (debajo de las comillas):
            </label>
            <input
              type="text"
              value={
                settings.heroVerse !== undefined
                  ? settings.heroVerse
                  : '1 Corintios 13:7'
              }
              onChange={(e) =>
                onChange({ heroVerse: e.target.value })
              }
              placeholder="Ej. TextoBiblico 14:17 o 1 Corintios 13:7 o Antoine de Saint-Exupéry"
              className="w-full bg-[#FAF9F0] border border-[#E5E2D0] rounded-2xl px-3.5 py-2.5 text-xs text-[#3D3D3D] focus:outline-none focus:border-[#5A5A40] font-sans"
            />
            <span className="text-[10px] text-[#7D8C7A] mt-1 block">
              Aparece centrado, con tipografía en mayúsculas espaciadas, debajo de la comilla de cierre.
            </span>
          </div>
        </div>

        {/* 5. Live Visual Preview of Hero Header with Chosen Photo Background & Fit */}
        <div className="relative text-white rounded-3xl border border-stone-800 shadow-2xl overflow-hidden min-h-[300px] flex flex-col justify-between p-6 sm:p-8">
          {/* Simulated background with exact settings */}
          <div
            className="absolute inset-0 bg-no-repeat transition-all duration-300 pointer-events-none"
            style={{
              backgroundImage: `url(${settings.coverPhoto || 'https://images.unsplash.com/photo-1519741497674-611481863552?auto=format&fit=crop&w=2000&q=85'})`,
              backgroundSize:
                settings.heroImageFit === 'fill'
                  ? '100% 100%'
                  : settings.heroImageFit === 'contain'
                  ? 'contain'
                  : settings.heroImageFit === 'original'
                  ? 'auto'
                  : 'cover',
              backgroundPosition:
                settings.heroImagePosition === 'top'
                  ? 'center top'
                  : settings.heroImagePosition === 'bottom'
                  ? 'center bottom'
                  : 'center center',
            }}
          />

          {/* Simulated darkness overlay */}
          {(() => {
            const alpha = (settings.heroOverlayOpacity !== undefined ? settings.heroOverlayOpacity : 50) / 100;
            return (
              <div
                className="absolute inset-0 pointer-events-none transition-opacity duration-300"
                style={{
                  background: `linear-gradient(to bottom, rgba(0,0,0,${Math.min(0.95, alpha * 1.15)}) 0%, rgba(0,0,0,${alpha * 0.75}) 50%, rgba(0,0,0,${Math.min(0.98, alpha * 1.45)}) 100%)`,
                }}
              />
            );
          })()}

          {/* Top status bar inside mini-preview */}
          <div className="relative z-10 flex items-center justify-between border-b border-white/20 pb-2.5">
            <span className="text-[10px] font-bold uppercase tracking-widest text-amber-200 flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5" />
              Vista Previa en Vivo del Hero:
            </span>
            <span className="text-[9px] uppercase tracking-wider text-stone-200 bg-black/40 backdrop-blur-sm px-2.5 py-0.5 rounded-full border border-white/10 font-mono">
              fit: {settings.heroImageFit || 'cover'} • {settings.heroImagePosition || 'center'}
            </span>
          </div>

          {/* Rendered Hero hierarchy */}
          <div className="relative z-10 py-6 text-center flex flex-col items-center justify-center space-y-3">
            {/* Date */}
            <p className="text-sm sm:text-base font-serif tracking-[0.25em] uppercase text-stone-200 font-medium drop-shadow">
              {formatHeroDate(
                settings.eventDate,
                settings.heroDateFormat || 'dd.mm.aaaa',
                settings.heroCustomDateText
              )}
            </p>

            {/* Names */}
            <h2 className="text-2xl sm:text-4xl font-serif italic text-white tracking-tight drop-shadow-lg">
              {settings.coupleNames || 'Nombre & Nombre'}
            </h2>

            {/* Quote with quotes */}
            <div className="flex flex-col items-center max-w-md mx-auto pt-1">
              <span className="text-3xl sm:text-4xl font-serif text-amber-200/90 leading-none select-none drop-shadow">
                “
              </span>
              <p className="text-xs sm:text-sm font-serif italic text-stone-100 leading-relaxed px-4 text-center drop-shadow">
                {settings.heroQuote !== undefined && settings.heroQuote !== ''
                  ? settings.heroQuote
                  : 'Texto de su Preferencia'}
              </p>
              <span className="text-3xl sm:text-4xl font-serif text-amber-200/90 leading-none select-none drop-shadow">
                ”
              </span>

              {/* Bible verse */}
              {(settings.heroVerse !== undefined ? settings.heroVerse : 'TextoBiblico 14:17') && (
                <p className="text-[10px] sm:text-xs font-sans tracking-[0.25em] uppercase font-semibold text-amber-200 mt-2 drop-shadow">
                  {settings.heroVerse !== undefined ? settings.heroVerse : 'TextoBiblico 14:17'}
                </p>
              )}
            </div>
          </div>

          <div className="relative z-10 text-center text-[10px] text-stone-300 font-light">
            ✦ Desliza hacia abajo en el simulador para ver la transición suave hacia las demás secciones
          </div>
        </div>

        {/* 6. Elementos Adicionales Opcionales del Hero */}
        <div className="pt-2 border-t border-[#E5E2D0] space-y-3">
          <label className="text-xs font-bold text-[#1a1a1a] block">
            6. Elementos Adicionales del Hero (Opcionales):
          </label>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <label className="flex items-center gap-3 p-3 bg-[#FAF9F0] rounded-2xl border border-[#E5E2D0] cursor-pointer hover:bg-[#F0EEDC] transition-colors">
              <input
                type="checkbox"
                checked={Boolean(settings.heroShowCountdown)}
                onChange={(e) =>
                  onChange({ heroShowCountdown: e.target.checked })
                }
                className="w-4 h-4 rounded text-[#5A5A40] accent-[#5A5A40] cursor-pointer"
              />
              <div>
                <span className="text-xs font-semibold text-[#1a1a1a] block">
                  Contador Regresivo en Portada
                </span>
                <span className="text-[10px] text-[#7D8C7A]">
                  Por defecto desactivado (el contador se ve en el cuerpo).
                </span>
              </div>
            </label>

            <label className="flex items-center gap-3 p-3 bg-[#FAF9F0] rounded-2xl border border-[#E5E2D0] cursor-pointer hover:bg-[#F0EEDC] transition-colors">
              <input
                type="checkbox"
                checked={Boolean(settings.heroShowRsvpButton)}
                onChange={(e) =>
                  onChange({ heroShowRsvpButton: e.target.checked })
                }
                className="w-4 h-4 rounded text-[#5A5A40] accent-[#5A5A40] cursor-pointer"
              />
              <div>
                <span className="text-xs font-semibold text-[#1a1a1a] block">
                  Botón RSVP Directo en Portada
                </span>
                <span className="text-[10px] text-[#7D8C7A]">
                  Por defecto desactivado (permite un diseño más puro).
                </span>
              </div>
            </label>

            <label className="flex items-center gap-3 p-3 bg-[#FAF9F0] rounded-2xl border border-[#E5E2D0] cursor-pointer hover:bg-[#F0EEDC] transition-colors">
              <input
                type="checkbox"
                checked={Boolean(settings.heroShowIcon)}
                onChange={(e) =>
                  onChange({ heroShowIcon: e.target.checked })
                }
                className="w-4 h-4 rounded text-[#5A5A40] accent-[#5A5A40] cursor-pointer"
              />
              <div>
                <span className="text-xs font-semibold text-[#1a1a1a] block">
                  Motivo Vectorial Animado en Portada
                </span>
                <span className="text-[10px] text-[#7D8C7A]">
                  Cisnes, Sol Boho, Alianzas según el estilo.
                </span>
              </div>
            </label>

            <label className="flex items-center gap-3 p-3 bg-[#FAF9F0] rounded-2xl border border-[#E5E2D0] cursor-pointer hover:bg-[#F0EEDC] transition-colors">
              <input
                type="checkbox"
                checked={Boolean(settings.heroShowGuestPill)}
                onChange={(e) =>
                  onChange({ heroShowGuestPill: e.target.checked })
                }
                className="w-4 h-4 rounded text-[#5A5A40] accent-[#5A5A40] cursor-pointer"
              />
              <div>
                <span className="text-xs font-semibold text-[#1a1a1a] block">
                  Píldora de Pases del Invitado en Portada
                </span>
                <span className="text-[10px] text-[#7D8C7A]">
                  Muestra el nombre del invitado en el hero.
                </span>
              </div>
            </label>
          </div>
        </div>
      </div>

      {/* Couple & General Data */}
      <div className="bg-white p-6 sm:p-8 rounded-3xl sm:rounded-[36px] border border-[#E5E2D0] space-y-4 shadow-sm">
        <h3 className="text-lg font-serif text-[#1a1a1a] flex items-center gap-2 font-bold">
          <Calendar className="w-4 h-4 text-[#7D8C7A]" />
          Horarios y Mensajes de Bienvenida
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="text-xs font-semibold text-[#5A5A40] block mb-1.5">
              Hashtag Oficial de la Boda:
            </label>
            <input
              type="text"
              value={settings.hashtag}
              onChange={(e) =>
                onChange({ hashtag: e.target.value })
              }
              className="w-full bg-[#FAF9F0] border border-[#E5E2D0] rounded-2xl px-3.5 py-2.5 text-xs text-[#3D3D3D] focus:outline-none focus:border-[#5A5A40]"
            />
          </div>

          <div>
            <label className="text-xs font-semibold text-[#5A5A40] block mb-1.5">
              Hora de Inicio General:
            </label>
            <input
              type="time"
              value={settings.eventTime}
              onChange={(e) =>
                onChange({ eventTime: e.target.value })
              }
              className="w-full bg-[#FAF9F0] border border-[#E5E2D0] rounded-2xl px-3.5 py-2.5 text-xs text-[#3D3D3D] focus:outline-none focus:border-[#5A5A40]"
            />
          </div>
        </div>

        <div className="space-y-4 pt-2 border-t border-[#E5E2D0]">
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="text-xs font-bold text-[#1a1a1a] block">
                1. Frase / Título Principal de Bienvenida (1 sola línea):
              </label>
              <span className="text-[10px] text-[#7D8C7A] font-mono">Letra grande destacada</span>
            </div>
            <input
              type="text"
              value={settings.welcomeMessage || ''}
              onChange={(e) =>
                onChange({ welcomeMessage: e.target.value })
              }
              placeholder="Ej. ¡Nos casamos! Nos hace inmensa ilusión celebrar nuestro amor"
              className="w-full bg-[#FAF9F0] border border-[#E5E2D0] rounded-xl px-3.5 py-2.5 text-xs text-[#3D3D3D] focus:outline-none focus:border-[#5A5A40] shadow-2xs font-serif"
            />
          </div>

          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="text-xs font-bold text-[#1a1a1a] block">
                2. Subtítulo / Mensaje Acompañante (1 a 2 líneas):
              </label>
              <span className="text-[10px] text-[#7D8C7A] font-mono">Debajo del separador</span>
            </div>
            <textarea
              rows={2}
              value={settings.welcomeSubtitle !== undefined ? settings.welcomeSubtitle : 'Nos emociona compartir este día tan especial contigo. Aquí encontrarás todos los detalles y ubicaciones de nuestra celebración.'}
              onChange={(e) =>
                onChange({ welcomeSubtitle: e.target.value })
              }
              placeholder="Ej. Nos emociona compartir este día tan especial contigo. Aquí encontrarás todos los detalles y ubicaciones de nuestra celebración."
              className="w-full bg-[#FAF9F0] border border-[#E5E2D0] rounded-xl p-3 text-xs text-[#3D3D3D] focus:outline-none focus:border-[#5A5A40] resize-none shadow-2xs"
            />
          </div>
        </div>
      </div>
    </div>
  );
};
