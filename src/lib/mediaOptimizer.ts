/**
 * Client-Side Media Optimizer
 * 
 * Performs 100% browser-based image and audio compression and conversion before
 * uploading to storage. Reduces bandwidth, server load, and storage consumption.
 */

export interface ImageOptimizationResult {
  file: File;
  originalSize: number;
  optimizedSize: number;
  format: 'image/avif' | 'image/webp' | 'image/jpeg';
  compressionRatio: number; // Percentage saved (e.g., 95%)
  width: number;
  height: number;
}

export interface AudioOptimizationResult {
  file: File;
  originalSize: number;
  optimizedSize: number;
  format: string;
  compressionRatio: number;
  duration: number;
}

/**
 * Check if the current browser supports encoding to image/avif in canvas.toBlob / toDataURL
 */
export function isAvifEncodingSupported(): Promise<boolean> {
  return new Promise((resolve) => {
    try {
      const canvas = document.createElement('canvas');
      canvas.width = 1;
      canvas.height = 1;
      canvas.toBlob((blob) => {
        resolve(blob !== null && blob.type === 'image/avif');
      }, 'image/avif');
    } catch {
      resolve(false);
    }
  });
}

/**
 * Format bytes into human readable string (e.g., 2.4 MB, 180 KB)
 */
export function formatBytes(bytes: number, decimals = 1): string {
  if (bytes === 0) return '0 B';
  const k = 1024;
  const dm = decimals < 0 ? 0 : decimals;
  const sizes = ['B', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i];
}

/**
 * Optimizes an image in the frontend:
 * 1. Resizes large phone camera images (e.g. 4000x3000 -> max 1920px maintaining aspect ratio)
 * 2. Converts to AVIF (target ~95% size reduction) with fallback to WebP
 * 3. Returns an optimized File ready for upload
 */
export async function optimizeImageClient(
  file: File,
  options: {
    maxDimension?: number;
    quality?: number; // 0.0 to 1.0 (default 0.70 for optimal ~95% size reduction with high visual fidelity)
    preferredFormat?: 'avif' | 'webp' | 'auto';
  } = {}
): Promise<ImageOptimizationResult> {
  const originalSize = file.size;
  const maxDimension = options.maxDimension || 1920;
  const quality = options.quality !== undefined ? options.quality : 0.72;

  // Load image into HTMLImageElement
  const imageBitmap = await loadImage(file);

  // Compute scaled dimensions preserving aspect ratio
  let targetWidth = imageBitmap.width;
  let targetHeight = imageBitmap.height;

  if (targetWidth > maxDimension || targetHeight > maxDimension) {
    if (targetWidth > targetHeight) {
      targetHeight = Math.round((targetHeight * maxDimension) / targetWidth);
      targetWidth = maxDimension;
    } else {
      targetWidth = Math.round((targetWidth * maxDimension) / targetHeight);
      targetHeight = maxDimension;
    }
  }

  // Draw to offscreen canvas with high quality smoothing
  const canvas = document.createElement('canvas');
  canvas.width = targetWidth;
  canvas.height = targetHeight;
  const ctx = canvas.getContext('2d', { alpha: true });

  if (!ctx) {
    throw new Error('No se pudo inicializar el contexto 2D de canvas');
  }

  ctx.imageSmoothingEnabled = true;
  ctx.imageSmoothingQuality = 'high';
  ctx.drawImage(imageBitmap, 0, 0, targetWidth, targetHeight);

  // Detect format support
  const avifSupported = await isAvifEncodingSupported();
  let mimeType: 'image/avif' | 'image/webp' | 'image/jpeg' = 'image/webp';
  let ext = '.webp';

  if (options.preferredFormat === 'avif' || (options.preferredFormat !== 'webp' && avifSupported)) {
    mimeType = 'image/avif';
    ext = '.avif';
  } else {
    mimeType = 'image/webp';
    ext = '.webp';
  }

  // Convert canvas to blob
  const blob = await new Promise<Blob>((resolve, reject) => {
    canvas.toBlob(
      (b) => {
        if (b && b.size > 0) {
          resolve(b);
        } else {
          // Fallback to WebP if AVIF fails during encoding
          canvas.toBlob(
            (fallbackBlob) => {
              if (fallbackBlob) {
                mimeType = 'image/webp';
                ext = '.webp';
                resolve(fallbackBlob);
              } else {
                reject(new Error('Fallo al exportar imagen optimizada'));
              }
            },
            'image/webp',
            quality
          );
        }
      },
      mimeType,
      quality
    );
  });

  const optimizedSize = blob.size;
  const baseName = file.name.replace(/\.[^/.]+$/, '');
  const optimizedFileName = `${baseName}-opt${ext}`;
  const optimizedFile = new File([blob], optimizedFileName, { type: mimeType });

  const savings = Math.max(0, Math.round(((originalSize - optimizedSize) / originalSize) * 100));

  return {
    file: optimizedFile,
    originalSize,
    optimizedSize,
    format: mimeType,
    compressionRatio: savings,
    width: targetWidth,
    height: targetHeight,
  };
}

/**
 * Loads an image file into an Image element or ImageBitmap
 */
function loadImage(file: File): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    const url = URL.createObjectURL(file);
    img.onload = () => {
      URL.revokeObjectURL(url);
      resolve(img);
    };
    img.onerror = (err) => {
      URL.revokeObjectURL(url);
      reject(err);
    };
    img.src = url;
  });
}

/**
 * Optimizes an audio file in the browser:
 * Decodes the audio with Web Audio API, then re-encodes to a compressed WebM/Opus or downsampled buffer
 * to significantly reduce upload payload and bandwidth.
 */
export async function optimizeAudioClient(
  file: File,
  options: {
    targetBitrate?: number; // e.g. 128000 for high quality wedding music, 96000 for voice/background
  } = {}
): Promise<AudioOptimizationResult> {
  const originalSize = file.size;

  // If browser doesn't support Web Audio or MediaRecorder, return original
  if (typeof window === 'undefined' || !window.AudioContext) {
    return {
      file,
      originalSize,
      optimizedSize: originalSize,
      format: file.type || 'audio/mpeg',
      compressionRatio: 0,
      duration: 0,
    };
  }

  try {
    const arrayBuffer = await file.arrayBuffer();
    const AudioCtxClass = window.AudioContext || (window as any).webkitAudioContext;
    const audioCtx = new AudioCtxClass();
    
    const audioBuffer = await audioCtx.decodeAudioData(arrayBuffer);
    const duration = audioBuffer.duration;

    // Check if MediaRecorder with Opus is supported for fast client-side encoding
    const mimeTypes = [
      'audio/webm;codecs=opus',
      'audio/webm',
      'audio/ogg;codecs=opus',
      'audio/ogg',
      'audio/mp4',
    ];

    let chosenMime = '';
    for (const m of mimeTypes) {
      if (typeof MediaRecorder !== 'undefined' && MediaRecorder.isTypeSupported(m)) {
        chosenMime = m;
        break;
      }
    }

    if (!chosenMime) {
      // If MediaRecorder cannot transcode, close audio context and return original
      await audioCtx.close();
      return {
        file,
        originalSize,
        optimizedSize: originalSize,
        format: file.type || 'audio/mpeg',
        compressionRatio: 0,
        duration,
      };
    }

    // Play into MediaStreamDestination and record through MediaRecorder with optimal bitrate
    const dest = audioCtx.createMediaStreamDestination();
    const source = audioCtx.createBufferSource();
    source.buffer = audioBuffer;
    source.connect(dest);

    const bitrate = options.targetBitrate || 128000;
    const recorder = new MediaRecorder(dest.stream, {
      mimeType: chosenMime,
      audioBitsPerSecond: bitrate,
    });

    const chunks: Blob[] = [];
    recorder.ondataavailable = (e) => {
      if (e.data && e.data.size > 0) {
        chunks.push(e.data);
      }
    };

    const recordPromise = new Promise<Blob>((resolve) => {
      recorder.onstop = () => {
        const finalBlob = new Blob(chunks, { type: chosenMime });
        resolve(finalBlob);
      };
    });

    // Start playback & recording
    recorder.start(100);
    source.start(0);

    // If audio is very long, we can cap recording or encode chunk
    // Note: For instant in-memory processing, we let it finish
    // Since playback in Web Audio Destination runs in real-time, for large tracks over 2 minutes,
    // we can provide downsampled lightweight WAV/OGG or use the buffer directly to prevent UI freeze
    if (duration > 180) {
      // For longer songs, fallback to preserving file or fast trim
      source.stop();
      recorder.stop();
      await audioCtx.close();
      return {
        file,
        originalSize,
        optimizedSize: originalSize,
        format: file.type || 'audio/mpeg',
        compressionRatio: 0,
        duration,
      };
    }

    // Wait until audio playback finishes
    source.onended = () => {
      if (recorder.state !== 'inactive') {
        recorder.stop();
      }
    };

    // Safety timeout in case onended triggers late
    const maxWaitTime = Math.min((duration + 1) * 1000, 15000);
    const timeoutPromise = new Promise<void>((r) => setTimeout(r, maxWaitTime));

    await Promise.race([recordPromise, timeoutPromise]);
    if (recorder.state !== 'inactive') {
      recorder.stop();
    }

    const compressedBlob = await recordPromise;
    await audioCtx.close();

    const isWebm = chosenMime.includes('webm');
    const ext = isWebm ? '.webm' : chosenMime.includes('ogg') ? '.ogg' : '.mp4';
    const baseName = file.name.replace(/\.[^/.]+$/, '');
    const optimizedFileName = `${baseName}-opt${ext}`;

    const optimizedFile = new File([compressedBlob], optimizedFileName, {
      type: chosenMime,
    });

    // If compressed size is actually smaller, use it; otherwise use original
    if (optimizedFile.size < originalSize && optimizedFile.size > 1024) {
      const savings = Math.round(((originalSize - optimizedFile.size) / originalSize) * 100);
      return {
        file: optimizedFile,
        originalSize,
        optimizedSize: optimizedFile.size,
        format: chosenMime,
        compressionRatio: savings,
        duration,
      };
    }

    return {
      file,
      originalSize,
      optimizedSize: originalSize,
      format: file.type || 'audio/mpeg',
      compressionRatio: 0,
      duration,
    };
  } catch (err) {
    console.warn('Frontend audio optimization fallback to original:', err);
    return {
      file,
      originalSize,
      optimizedSize: originalSize,
      format: file.type || 'audio/mpeg',
      compressionRatio: 0,
      duration: 0,
    };
  }
}
