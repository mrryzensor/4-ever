import type { EventType, WeddingSettings } from '../types.ts';

interface InvitationShareSettings {
  id: number;
  slug?: string;
  eventType?: EventType;
  coupleNames: string;
  eventDate?: string;
  eventTime?: string;
  shareMessageTemplate?: string;
  branchSlug?: string | null;
}

export const DEFAULT_INVITATION_SHARE_TEMPLATE = `💌 ¡Estás invitado/a!\n\n{coupleNames} te invita a celebrar este día tan especial. ✨\n📅 {eventDate}\n\nConfirma tu asistencia aquí:\n{url}\n\n¡Te esperamos! 💛`;

export function cleanMojibake(text: string): string {
  if (!text) return text;
  let result = text;
  if (/[\u00C2-\u00C3\u00E2\u00F0]/.test(result)) {
    try {
      const bytes = new Uint8Array(result.length);
      let canDecode = true;
      for (let i = 0; i < result.length; i++) {
        const code = result.charCodeAt(i);
        if (code > 255) {
          canDecode = false;
          break;
        }
        bytes[i] = code;
      }
      if (canDecode) {
        const decoded = new TextDecoder('utf-8', { fatal: true }).decode(bytes);
        result = decoded;
      }
    } catch {
      // Fallback to pattern replacements
    }
  }
  return result
    .replace(/ðŸ’Œ/g, '💌')
    .replace(/ðŸ“…/g, '📅')
    .replace(/ðŸ’›/g, '💛')
    .replace(/ðŸŽ‰/g, '🎉')
    .replace(/ðŸ’•/g, '💕')
    .replace(/ðŸ’ /g, '💍')
    .replace(/âœ¨/g, '✨')
    .replace(/âœ…/g, '✅')
    .replace(/âœ”/g, '✔')
    .replace(/ðŸ‘‰/g, '👉')
    .replace(/ðŸ‘°/g, '👰')
    .replace(/ðŸ¤µ/g, '🤵')
    .replace(/â ¤ï¸ /g, '❤️')
    .replace(/â ¤/g, '❤')
    .replace(/Â¡/g, '¡')
    .replace(/Â¿/g, '¿')
    .replace(/Ã¡/g, 'á')
    .replace(/Ã©/g, 'é')
    .replace(/Ã­/g, 'í')
    .replace(/Ã³/g, 'ó')
    .replace(/Ãº/g, 'ú')
    .replace(/Ã±/g, 'ñ')
    .replace(/Ã /g, 'Á')
    .replace(/Ã‰/g, 'É')
    .replace(/Ã /g, 'Í')
    .replace(/Ã“/g, 'Ó')
    .replace(/Ãš/g, 'Ú')
    .replace(/Ã‘/g, 'Ñ');
}

export function getInvitationUrl(settings: Pick<InvitationShareSettings, 'id' | 'slug' | 'eventType' | 'branchSlug'>, origin: string) {
  const url = settings.slug
    ? new URL(`/${encodeURIComponent(settings.slug)}`, origin)
    : new URL('/', origin);
  if (!settings.slug) {
    url.searchParams.set('w', String(settings.id || 1));
    url.searchParams.set('event', settings.eventType || 'bodas');
  }
  if (settings.branchSlug) url.searchParams.set('branch', settings.branchSlug);
  return url.toString();
}

export function getInvitationShareImageUrl(settings: Pick<InvitationShareSettings, 'id' | 'slug' | 'branchSlug'>, origin: string) {
  const query = new URLSearchParams({
    wedding: settings.slug || String(settings.id || 1),
    v: String(Date.now()),
  });
  if (settings.branchSlug) query.set('branch', settings.branchSlug);
  return `${origin}/api/og-image?${query.toString()}`;
}

function formatShareDate(value: string | undefined) {
  if (!value) return '';
  const dateOnly = value.slice(0, 10);
  const date = new Date(`${dateOnly}T12:00:00Z`);
  if (Number.isNaN(date.getTime())) return value;
  return new Intl.DateTimeFormat('es-PE', {
    dateStyle: 'long',
    timeZone: 'America/Lima',
  }).format(date);
}

export function buildInvitationShareMessage(
  settings: InvitationShareSettings,
  origin: string,
) {
  const url = getInvitationUrl(settings, origin);
  const rawTemplate = settings.shareMessageTemplate?.trim() || DEFAULT_INVITATION_SHARE_TEMPLATE;
  const template = cleanMojibake(rawTemplate);
  const values: Record<string, string> = {
    coupleNames: cleanMojibake(settings.coupleNames || 'Los anfitriones'),
    eventDate: cleanMojibake(formatShareDate(settings.eventDate)),
    eventTime: settings.eventTime || '',
    url,
    link: url,
  };
  const message = template.replace(/\{(coupleNames|eventDate|eventTime|url|link)\}/g, (_match, token: string) => values[token] || '').trim();
  const result = message.includes(url) ? message : `${message}\n\n${url}`;
  return cleanMojibake(result);
}

export function isMobileShareDevice() {
  if (typeof navigator === 'undefined' || typeof window === 'undefined') return false;
  const mobileAgent = /Android|iPhone|iPad|iPod|IEMobile|Opera Mini/i.test(navigator.userAgent);
  const compactTouchDevice = navigator.maxTouchPoints > 0 && window.matchMedia('(max-width: 767px)').matches;
  return mobileAgent || compactTouchDevice;
}

export async function copyTextToClipboard(text: string) {
  if (navigator.clipboard?.writeText) {
    try {
      await navigator.clipboard.writeText(text);
      return true;
    } catch {
      // Fall through for browsers that block Clipboard API access.
    }
  }

  const input = document.createElement('textarea');
  input.value = text;
  input.setAttribute('readonly', '');
  input.style.position = 'fixed';
  input.style.opacity = '0';
  document.body.appendChild(input);
  input.select();
  const copied = document.execCommand('copy');
  input.remove();
  return copied;
}

export type InvitationShareResult = 'shared' | 'opened-whatsapp' | 'copied' | 'prompted' | 'cancelled' | 'failed';

export async function sendInvitationMessage(message: string, title: string, imageUrl?: string): Promise<InvitationShareResult> {
  if (isMobileShareDevice()) {
    if (typeof navigator.share === 'function') {
      let imageFile: File | null = null;
      if (imageUrl && typeof File !== 'undefined' && typeof navigator.canShare === 'function') {
        try {
          const response = await fetch(imageUrl, { cache: 'no-store', credentials: 'same-origin' });
          if (response.ok) {
            const blob = await response.blob();
            if (blob.type.startsWith('image/')) {
              imageFile = new File([blob], 'invitacion-2date.png', { type: blob.type });
            }
          }
        } catch {
          // If the image endpoint is unavailable, continue with the text and link.
        }
      }

      try {
        const shareData: ShareData = imageFile && navigator.canShare?.({ files: [imageFile] })
          ? { title, text: message, files: [imageFile] }
          : { title, text: message };
        await navigator.share(shareData);
        return 'shared';
      } catch (error) {
        return (error as DOMException)?.name === 'AbortError' ? 'cancelled' : 'failed';
      }
    }
    window.open('https://wa.me/?text=' + encodeURIComponent(message), '_blank', 'noopener,noreferrer');
    return 'opened-whatsapp';
  }

  if (await copyTextToClipboard(message)) return 'copied';
  window.prompt('Copia y comparte este mensaje:', message);
  return 'prompted';
}
