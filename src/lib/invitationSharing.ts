import type { EventType, WeddingSettings } from '../types.ts';

interface InvitationShareSettings {
  id: number;
  slug?: string;
  eventType?: EventType;
  coupleNames: string;
  eventDate?: string;
  eventTime?: string;
  shareMessageTemplate?: string;
}

export const DEFAULT_INVITATION_SHARE_TEMPLATE = `💌 ¡Estás invitado/a!\n\n{coupleNames} te invita a celebrar este día tan especial. ✨\n📅 {eventDate}\n\nConfirma tu asistencia aquí:\n{url}\n\n¡Te esperamos! 💛`;

export function getInvitationUrl(settings: Pick<InvitationShareSettings, 'id' | 'slug' | 'eventType'>, origin: string) {
  if (settings.slug) return `${origin}/${encodeURIComponent(settings.slug)}`;
  const query = new URLSearchParams({
    w: String(settings.id || 1),
    event: settings.eventType || 'bodas',
  });
  return `${origin}/?${query.toString()}`;
}

export function getInvitationShareImageUrl(settings: Pick<InvitationShareSettings, 'id' | 'slug'>, origin: string) {
  const query = new URLSearchParams({
    wedding: settings.slug || String(settings.id || 1),
    v: String(Date.now()),
  });
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
  const template = settings.shareMessageTemplate?.trim() || DEFAULT_INVITATION_SHARE_TEMPLATE;
  const values: Record<string, string> = {
    coupleNames: settings.coupleNames || 'Los anfitriones',
    eventDate: formatShareDate(settings.eventDate),
    eventTime: settings.eventTime || '',
    url,
    link: url,
  };
  const message = template.replace(/\{(coupleNames|eventDate|eventTime|url|link)\}/g, (_match, token: string) => values[token] || '').trim();
  return message.includes(url) ? message : `${message}\n\n${url}`;
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
