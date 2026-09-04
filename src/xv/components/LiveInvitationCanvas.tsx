import React, { useState, useRef, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  Smartphone,
  Tablet,
  Monitor,
  RotateCcw,
  Sparkles,
  ExternalLink,
  Maximize2,
  ZoomIn,
  ZoomOut,
  Hand,
  MousePointer,
  Wifi,
  RefreshCw,
  ChevronDown,
  Check
} from 'lucide-react';
import { WeddingSettings } from '../../types.ts';
import { CARD_THEMES } from '../../lib/themes.ts';

interface LiveInvitationCanvasProps {
  settings: WeddingSettings;
  onOpenFullInvitation?: () => void;
}

type DevicePreset = 'iphone15' | 'android' | 'compact' | 'tablet' | 'desktop';
type ToolMode = 'interact' | 'pan';

interface DeviceSpec {
  name: string;
  category: 'mobile' | 'tablet' | 'desktop';
  width: number;
  height: number;
  outerRadius: string;
  innerRadius: string;
  hasDynamicIsland?: boolean;
  hasHomeIndicator?: boolean;
}

const DEVICE_SPECS: Record<DevicePreset, DeviceSpec> = {
  iphone15: {
    name: 'iPhone 15 Pro (393px)',
    category: 'mobile',
    width: 393,
    height: 852,
    outerRadius: 'rounded-[50px]',
    innerRadius: 'rounded-[40px]',
    hasDynamicIsland: true,
    hasHomeIndicator: true,
  },
  android: {
    name: 'Galaxy S24 (412px)',
    category: 'mobile',
    width: 412,
    height: 890,
    outerRadius: 'rounded-[44px]',
    innerRadius: 'rounded-[36px]',
    hasDynamicIsland: false,
    hasHomeIndicator: true,
  },
  compact: {
    name: 'Móvil Compacto (375px)',
    category: 'mobile',
    width: 375,
    height: 667,
    outerRadius: 'rounded-[36px]',
    innerRadius: 'rounded-[28px]',
    hasDynamicIsland: false,
    hasHomeIndicator: false,
  },
  tablet: {
    name: 'iPad / Tablet (768px)',
    category: 'tablet',
    width: 768,
    height: 980,
    outerRadius: 'rounded-[36px]',
    innerRadius: 'rounded-[28px]',
    hasDynamicIsland: false,
    hasHomeIndicator: true,
  },
  desktop: {
    name: 'Escritorio (1024px)',
    category: 'desktop',
    width: 1024,
    height: 768,
    outerRadius: 'rounded-2xl',
    innerRadius: 'rounded-xl',
    hasDynamicIsland: false,
    hasHomeIndicator: false,
  },
};

export const LiveInvitationCanvas: React.FC<LiveInvitationCanvasProps> = ({
  settings,
  onOpenFullInvitation,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const iframeRef = useRef<HTMLIFrameElement>(null);

  const [selectedDevice, setSelectedDevice] = useState<DevicePreset>('iphone15');
  const [isMobileDropdownOpen, setIsMobileDropdownOpen] = useState(false);
  const [toolMode, setToolMode] = useState<ToolMode>('interact');
  const [zoom, setZoom] = useState<number>(0.85);
  const [pan, setPan] = useState<{ x: number; y: number }>({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [isIframeLoaded, setIsIframeLoaded] = useState(false);
  const [refreshKey, setRefreshKey] = useState(0);

  const mobileDropdownRef = useRef<HTMLDivElement>(null);

  // Close mobile models dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (mobileDropdownRef.current && !mobileDropdownRef.current.contains(event.target as Node)) {
        setIsMobileDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const dragStartRef = useRef<{ x: number; y: number; panX: number; panY: number }>({
    x: 0,
    y: 0,
    panX: 0,
    panY: 0,
  });

  const activeTheme = CARD_THEMES[settings.cardStyle] || CARD_THEMES['classic-gold'];
  const currentSpec = DEVICE_SPECS[selectedDevice];

  // Sync settings to the iframe in real time via postMessage, sessionStorage & localStorage
  const sendSettingsToIframe = useCallback(() => {
    try {
      sessionStorage.setItem('atelier_live_settings', JSON.stringify(settings));
      localStorage.setItem('atelier_live_settings', JSON.stringify(settings));
    } catch (e) {
      console.warn('Failed to save to storage', e);
    }

    if (iframeRef.current && iframeRef.current.contentWindow) {
      try {
        iframeRef.current.contentWindow.postMessage(
          {
            type: 'ATELIER_SYNC_SETTINGS',
            settings: settings,
          },
          '*'
        );
      } catch (err) {
        console.warn('postMessage to preview iframe failed:', err);
      }
    }
  }, [settings]);

  useEffect(() => {
    sendSettingsToIframe();
  }, [settings, sendSettingsToIframe]);

  // Listen for iframe ready signal to immediately push latest settings
  useEffect(() => {
    const handleParentMessage = (e: MessageEvent) => {
      if (e.data?.type === 'ATELIER_EMBED_READY') {
        sendSettingsToIframe();
      }
    };
    window.addEventListener('message', handleParentMessage);
    return () => window.removeEventListener('message', handleParentMessage);
  }, [sendSettingsToIframe]);

  // Fit to Viewport / Auto-fit calculator
  const fitToViewport = useCallback(() => {
    if (!containerRef.current) return;
    const { clientWidth, clientHeight } = containerRef.current;
    if (clientWidth === 0 || clientHeight === 0) return;

    // Margin allowance for canvas borders and floating HUD
    const availableWidth = clientWidth - 48;
    const availableHeight = clientHeight - 96;

    const scaleX = availableWidth / currentSpec.width;
    const scaleY = availableHeight / currentSpec.height;
    const optimalScale = Math.min(scaleX, scaleY);

    // Keep scale between 0.35 and 1.15
    const clampedScale = Math.min(Math.max(optimalScale, 0.35), 1.15);
    setZoom(parseFloat(clampedScale.toFixed(2)));
    setPan({ x: 0, y: 0 });
  }, [currentSpec]);

  // Auto-fit on mount, when device changes, or when container resizes
  useEffect(() => {
    const timer = setTimeout(() => {
      fitToViewport();
    }, 80);

    const handleResize = () => {
      fitToViewport();
    };

    window.addEventListener('resize', handleResize);

    let resizeObserver: ResizeObserver | null = null;
    if (containerRef.current && typeof ResizeObserver !== 'undefined') {
      resizeObserver = new ResizeObserver(() => {
        fitToViewport();
      });
      resizeObserver.observe(containerRef.current);
    }

    return () => {
      clearTimeout(timer);
      window.removeEventListener('resize', handleResize);
      if (resizeObserver) {
        resizeObserver.disconnect();
      }
    };
  }, [selectedDevice, fitToViewport]);

  // Zoom handlers
  const handleZoomIn = () => {
    setZoom((prev) => Math.min(parseFloat((prev + 0.1).toFixed(2)), 2.2));
  };

  const handleZoomOut = () => {
    setZoom((prev) => Math.max(parseFloat((prev - 0.1).toFixed(2)), 0.35));
  };

  const handleZoomReset = () => {
    setZoom(1);
    setPan({ x: 0, y: 0 });
  };

  // Drag / Pan handlers
  const handleMouseDown = (e: React.MouseEvent) => {
    if (e.button !== 0) return;

    // In interact mode, don't drag if clicking inside the device frame
    if (toolMode === 'interact') {
      const target = e.target as HTMLElement;
      if (target.closest('.device-viewport-frame')) {
        return;
      }
    }

    setIsDragging(true);
    dragStartRef.current = {
      x: e.clientX,
      y: e.clientY,
      panX: pan.x,
      panY: pan.y,
    };
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging) return;
    const dx = e.clientX - dragStartRef.current.x;
    const dy = e.clientY - dragStartRef.current.y;
    setPan({
      x: dragStartRef.current.panX + dx,
      y: dragStartRef.current.panY + dy,
    });
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  // Wheel zoom when pressing Ctrl or Alt
  const handleWheel = (e: React.WheelEvent) => {
    if (e.ctrlKey || e.metaKey || e.altKey) {
      e.preventDefault();
      const zoomFactor = e.deltaY < 0 ? 0.08 : -0.08;
      setZoom((prev) => {
        const next = Math.min(Math.max(prev + zoomFactor, 0.35), 2.2);
        return parseFloat(next.toFixed(2));
      });
    }
  };

  const handleIframeLoad = () => {
    setIsIframeLoaded(true);
    if (iframeRef.current && iframeRef.current.contentWindow) {
      try {
        iframeRef.current.contentWindow.postMessage(
          {
            type: 'ATELIER_SYNC_SETTINGS',
            settings: settings,
          },
          '*'
        );
      } catch (err) {
        console.warn('postMessage on iframe load failed:', err);
      }
    }
  };

  const handleReloadIframe = () => {
    setRefreshKey((k) => k + 1);
  };

  const iframeSrc = `?mode=preview_embed&w=${settings.id || 1}&t=${refreshKey}`;

  return (
    <div className="w-full flex flex-col items-center select-none">
      {/* 1. Top Simulator Toolbar (Single Line: 1. Móvil w/ collapsible models, 2. Escritorio, 3. Actualizar, 4. Abrir en pestaña completa) */}
      <div className="w-full bg-[#FAF9F0] border border-[#E5E2D0] rounded-2xl p-1.5 sm:px-3 sm:py-2.5 mb-3 shadow-xs min-w-0">
        <div className="w-full flex items-center justify-between gap-1.5 sm:gap-2 overflow-x-auto custom-scrollbar pb-0.5">
          {/* Left Side: Preview Options (Móvil dropdown & Escritorio) */}
          <div className="flex items-center gap-1 sm:gap-1.5 shrink-0">
            {/* Option 1: Móvil with Collapsible Models Menu */}
            <div className="relative shrink-0" ref={mobileDropdownRef}>
              <button
                type="button"
                onClick={() => {
                  if (selectedDevice === 'desktop') {
                    setSelectedDevice('iphone15');
                  }
                  setIsMobileDropdownOpen((prev) => !prev);
                }}
                className={`px-2.5 sm:px-3 py-1.5 rounded-xl text-xs font-semibold flex items-center gap-1 sm:gap-1.5 transition-all cursor-pointer select-none whitespace-nowrap shadow-2xs shrink-0 ${
                  selectedDevice !== 'desktop'
                    ? 'bg-[#5A5A40] text-white shadow-xs'
                    : 'bg-white hover:bg-stone-50 text-stone-700 border border-[#E5E2D0]'
                }`}
              >
                <Smartphone className="w-3.5 h-3.5 shrink-0" />
                <span>Móvil</span>
                <ChevronDown
                  className={`w-3.5 h-3.5 transition-transform duration-200 shrink-0 ${
                    isMobileDropdownOpen ? 'rotate-180 text-amber-300' : selectedDevice !== 'desktop' ? 'text-white/80' : 'text-stone-400'
                  }`}
                />
              </button>

              {/* Collapsible Mobile Models Dropdown */}
              <AnimatePresence>
                {isMobileDropdownOpen && (
                  <motion.div
                    initial={{ opacity: 0, y: 6, scale: 0.96 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: 4, scale: 0.96 }}
                    transition={{ duration: 0.15 }}
                    className="absolute left-0 top-full mt-1.5 w-56 sm:w-60 bg-white border border-[#E5E2D0] rounded-2xl shadow-xl z-50 p-1.5 space-y-1"
                  >
                    <div className="px-2.5 py-1 text-[10px] uppercase font-bold tracking-wider text-stone-400 border-b border-[#E5E2D0]/60">
                      Modelos de Móvil
                    </div>
                    {[
                      { id: 'iphone15' as DevicePreset, name: 'iPhone 15 Pro', dims: '393 × 852 px', icon: Smartphone },
                      { id: 'android' as DevicePreset, name: 'Galaxy S24', dims: '412 × 890 px', icon: Smartphone },
                      { id: 'compact' as DevicePreset, name: 'Móvil Compacto', dims: '375 × 667 px', icon: Smartphone },
                      { id: 'tablet' as DevicePreset, name: 'iPad / Tablet', dims: '768 × 980 px', icon: Tablet },
                    ].map((dev) => {
                      const isCurrent = selectedDevice === dev.id;
                      const DevIcon = dev.icon;
                      return (
                        <button
                          key={dev.id}
                          type="button"
                          onClick={() => {
                            setSelectedDevice(dev.id);
                            setIsMobileDropdownOpen(false);
                          }}
                          className={`w-full px-2.5 py-2 rounded-xl text-left flex items-center justify-between gap-2 transition-all cursor-pointer ${
                            isCurrent
                              ? 'bg-[#FAF9F0] text-[#5A5A40] font-bold border border-[#E5E2D0]'
                              : 'hover:bg-[#FAF9F0]/60 text-stone-700 font-medium'
                          }`}
                        >
                          <div className="flex items-center gap-2 min-w-0">
                            <DevIcon className={`w-3.5 h-3.5 shrink-0 ${isCurrent ? 'text-[#5A5A40]' : 'text-stone-400'}`} />
                            <div className="truncate">
                              <p className="text-xs leading-tight truncate">{dev.name}</p>
                              <p className="text-[10px] text-stone-400 font-mono leading-none mt-0.5">{dev.dims}</p>
                            </div>
                          </div>
                          {isCurrent && <Check className="w-3.5 h-3.5 text-[#5A5A40] shrink-0" />}
                        </button>
                      );
                    })}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Option 2: Escritorio */}
            <button
              type="button"
              onClick={() => {
                setSelectedDevice('desktop');
                setIsMobileDropdownOpen(false);
              }}
              className={`px-2.5 sm:px-3 py-1.5 rounded-xl text-xs font-semibold flex items-center gap-1 sm:gap-1.5 transition-all cursor-pointer select-none whitespace-nowrap shadow-2xs shrink-0 ${
                selectedDevice === 'desktop'
                  ? 'bg-[#5A5A40] text-white shadow-xs'
                  : 'bg-white hover:bg-stone-50 text-stone-700 border border-[#E5E2D0]'
              }`}
            >
              <Monitor className="w-3.5 h-3.5 shrink-0" />
              <span>Escritorio</span>
            </button>
          </div>

          {/* Right Side: Reload & Option 3 (Pestaña Completa) */}
          <div className="flex items-center gap-1 sm:gap-1.5 shrink-0">
            <button
              type="button"
              onClick={handleReloadIframe}
              className="p-1.5 sm:px-2.5 sm:py-1.5 rounded-xl bg-white hover:bg-stone-100 border border-[#E5E2D0] text-[#5A5A40] text-xs font-semibold flex items-center gap-1 transition-colors cursor-pointer shadow-2xs shrink-0"
              title="Recargar Simulador"
            >
              <RefreshCw className="w-3.5 h-3.5 text-[#7D8C7A] shrink-0" />
              <span className="hidden lg:inline text-stone-600">Recargar</span>
            </button>

            {/* Option 3: Abrir en pestaña completa */}
            {onOpenFullInvitation && (
              <button
                type="button"
                onClick={onOpenFullInvitation}
                className="px-2.5 sm:px-3.5 py-1.5 rounded-xl bg-white hover:bg-stone-100 border border-[#E5E2D0] text-[#5A5A40] text-xs font-semibold flex items-center gap-1 sm:gap-1.5 transition-colors cursor-pointer shrink-0 shadow-2xs whitespace-nowrap"
                title="Abrir vista de invitado en pantalla completa"
              >
                <ExternalLink className="w-3.5 h-3.5 text-[#7D8C7A] shrink-0" />
                <span className="hidden sm:inline">Pestaña Completa</span>
                <span className="sm:hidden">Pestaña</span>
              </button>
            )}
          </div>
        </div>
      </div>

      {/* 2. Interactive Infinite Canvas Stage */}
      <div
        ref={containerRef}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
        onWheel={handleWheel}
        className={`w-full relative overflow-hidden rounded-3xl border border-[#E5E2D0] canvas-grid-pattern shadow-inner flex items-center justify-center ${
          toolMode === 'pan'
            ? isDragging
              ? 'cursor-grabbing'
              : 'cursor-grab'
            : isDragging
            ? 'cursor-grabbing'
            : 'cursor-default'
        }`}
        style={{
          height: 'calc(100vh - 170px)',
          minHeight: '620px',
        }}
      >
        {/* Floating Canvas HUD Controls */}
        <div className="absolute top-4 left-4 z-40 flex flex-wrap items-center gap-1.5 bg-[#FAF9F0]/95 backdrop-blur-md border border-[#E5E2D0] p-1.5 rounded-2xl shadow-md">
          {/* Mode: Interact vs Pan */}
          <div className="flex items-center bg-white border border-[#E5E2D0] rounded-xl p-0.5">
            <button
              type="button"
              onClick={() => setToolMode('interact')}
              className={`p-1.5 rounded-lg text-xs font-medium transition-all cursor-pointer ${
                toolMode === 'interact'
                  ? 'bg-[#5A5A40] text-white shadow-2xs'
                  : 'text-stone-600 hover:text-stone-900 hover:bg-stone-50'
              }`}
              title="Modo Interacción (Hacer scroll y probar botones en el dispositivo simulado)"
            >
              <MousePointer className="w-3.5 h-3.5" />
            </button>
            <button
              type="button"
              onClick={() => setToolMode('pan')}
              className={`p-1.5 rounded-lg text-xs font-medium transition-all cursor-pointer ${
                toolMode === 'pan'
                  ? 'bg-[#5A5A40] text-white shadow-2xs'
                  : 'text-stone-600 hover:text-stone-900 hover:bg-stone-50'
              }`}
              title="Modo Mover Canvas (Arrastrar y mover libremente el canvas)"
            >
              <Hand className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="h-4 w-px bg-[#E5E2D0] mx-0.5 hidden sm:block" />

          {/* Zoom Out */}
          <button
            type="button"
            onClick={handleZoomOut}
            className="p-1.5 bg-white hover:bg-stone-100 border border-[#E5E2D0] text-[#5A5A40] rounded-xl transition-colors cursor-pointer"
            title="Reducir Zoom (-)"
          >
            <ZoomOut className="w-3.5 h-3.5" />
          </button>

          {/* Zoom Percentage */}
          <button
            type="button"
            onClick={handleZoomReset}
            className="px-2 py-1 bg-white hover:bg-stone-100 border border-[#E5E2D0] text-[#5A5A40] text-xs font-mono font-bold rounded-xl transition-colors cursor-pointer min-w-[52px] text-center"
            title="Restablecer Zoom"
          >
            {Math.round(zoom * 100)}%
          </button>

          {/* Zoom In */}
          <button
            type="button"
            onClick={handleZoomIn}
            className="p-1.5 bg-white hover:bg-stone-100 border border-[#E5E2D0] text-[#5A5A40] rounded-xl transition-colors cursor-pointer"
            title="Aumentar Zoom (+)"
          >
            <ZoomIn className="w-3.5 h-3.5" />
          </button>

          <div className="h-4 w-px bg-[#E5E2D0] mx-0.5 hidden sm:block" />

          {/* Auto-fit to viewport */}
          <button
            type="button"
            onClick={fitToViewport}
            className="px-2.5 py-1 bg-[#5A5A40] hover:bg-[#484833] text-white text-xs font-semibold rounded-xl flex items-center gap-1 transition-colors cursor-pointer shadow-xs"
            title="Ajustar exactamente al tamaño disponible"
          >
            <Maximize2 className="w-3 h-3" />
            <span className="hidden sm:inline">Ajustar al Viewport</span>
          </button>

          {/* Reset pan center */}
          <button
            type="button"
            onClick={() => setPan({ x: 0, y: 0 })}
            className="p-1.5 bg-white hover:bg-stone-100 border border-[#E5E2D0] text-[#5A5A40] rounded-xl transition-colors cursor-pointer"
            title="Centrar en Canvas"
          >
            <RotateCcw className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* 3. Transformed Stage: Scale & Pan Layer */}
        <div
          className="transition-transform duration-75 ease-out origin-center flex items-center justify-center pointer-events-auto"
          style={{
            transform: `translate3d(${pan.x}px, ${pan.y}px, 0) scale(${zoom})`,
            willChange: 'transform',
          }}
        >
          {/* Device Mockup Shell */}
          <div
            className={`device-viewport-frame relative bg-stone-900 border-[10px] sm:border-[12px] border-stone-800 ${
              currentSpec.outerRadius
            } overflow-hidden flex flex-col ${
              toolMode === 'pan' ? 'pointer-events-none' : 'pointer-events-auto'
            }`}
            style={{
              width: `${currentSpec.width}px`,
              height: `${currentSpec.height}px`,
              boxShadow: '0 25px 60px -15px rgba(0, 0, 0, 0.4), 0 0 0 1px rgba(0, 0, 0, 0.15)',
            }}
          >
            {/* Smartphone Top Status Bar (iPhone Dynamic Island / Android Punch-hole) */}
            {currentSpec.category === 'mobile' && (
              <div className="w-full h-11 bg-black text-white flex items-center justify-between px-6 shrink-0 z-40 select-none">
                {/* Time */}
                <span className="text-xs font-semibold font-mono tracking-tight text-white/90">
                  9:41
                </span>

                {/* Dynamic Island or Camera Punch Hole */}
                {currentSpec.hasDynamicIsland ? (
                  <div className="w-28 h-6 bg-stone-900 rounded-full flex items-center justify-between px-2.5 border border-stone-800/80 shadow-inner">
                    <div className="w-2.5 h-2.5 rounded-full bg-stone-950 border border-stone-800" />
                    <div className="flex items-center gap-1">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                    </div>
                  </div>
                ) : (
                  <div className="w-3.5 h-3.5 rounded-full bg-stone-950 border border-stone-800" />
                )}

                {/* Status Icons */}
                <div className="flex items-center gap-1.5 text-white/90">
                  <span className="text-[10px] font-mono font-bold">5G</span>
                  <Wifi className="w-3.5 h-3.5" />
                  <div className="w-5 h-2.5 border border-white/80 rounded-xs flex items-center p-0.5">
                    <div className="w-full h-full bg-white rounded-2xs" />
                  </div>
                </div>
              </div>
            )}

            {/* Desktop Top Header Bar */}
            {currentSpec.category === 'desktop' && (
              <div className="w-full h-9 bg-stone-800 flex items-center justify-between px-4 shrink-0 z-40 select-none border-b border-stone-700">
                <div className="flex items-center gap-1.5">
                  <div className="w-3 h-3 rounded-full bg-red-500/80" />
                  <div className="w-3 h-3 rounded-full bg-amber-500/80" />
                  <div className="w-3 h-3 rounded-full bg-emerald-500/80" />
                </div>
                <div className="bg-stone-900/80 text-stone-300 font-mono text-[10px] px-6 py-1 rounded-md border border-stone-700/60 max-w-sm truncate text-center">
                  https://boda.invitacion.digital/{settings.coupleNames ? encodeURIComponent(settings.coupleNames) : 'nombres'}
                </div>
                <div className="w-12" />
              </div>
            )}

            {/* 100% Genuine Isolated Viewport: Real Mobile iframe */}
            <div className="flex-1 w-full h-full relative overflow-hidden bg-[#FAF9F0]">
              <iframe
                ref={iframeRef}
                key={refreshKey}
                src={iframeSrc}
                title="Invitación Digital en Vivo"
                onLoad={handleIframeLoad}
                className="w-full h-full border-0 block"
                style={{
                  width: '100%',
                  height: '100%',
                  display: 'block',
                }}
              />
            </div>

            {/* iOS Home Indicator Bar */}
            {currentSpec.hasHomeIndicator && (
              <div className="h-5 bg-black w-full flex items-center justify-center shrink-0 z-40 select-none">
                <div className="w-32 h-1 bg-white/40 rounded-full" />
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
