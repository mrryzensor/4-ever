import { Guest, WeddingSettings } from '../types.ts';

/**
 * Builds the direct WhatsApp RSVP URL with a prefilled, personalized message.
 */
export function getWhatsappRsvpUrl(settings: WeddingSettings, guest?: Guest | null): string {
  const phone = (settings.rsvpWhatsappPhone || settings.contactPhone || '').replace(/[^0-9]/g, '');
  if (!phone) return '';

  const celebrant = settings.coupleNames || 'los anfitriones';
  const guestName = guest?.fullName ? ` de parte de ${guest.fullName}` : '';
  const passesCount = guest?.allocatedPasses || guest?.confirmedPasses || 1;
  const passesText = guest ? ` (${passesCount} ${passesCount === 1 ? 'pase' : 'pases'})` : '';

  let message = settings.rsvpWhatsappMessage?.trim();
  if (!message) {
    message = `¡Hola! Confirmo con mucho gusto mi asistencia al evento de ${celebrant}${guestName}${passesText}. ¡Muchas gracias por la invitación! ✨🎉`;
  } else {
    message = message
      .replace(/{celebrant}/gi, celebrant)
      .replace(/{novios}/gi, celebrant)
      .replace(/{cumpleanero}/gi, celebrant)
      .replace(/{quinceanera}/gi, celebrant)
      .replace(/{guest}/gi, guest?.fullName || '')
      .replace(/{invitado}/gi, guest?.fullName || '')
      .replace(/{passes}/gi, String(passesCount))
      .replace(/{pases}/gi, String(passesCount));
  }

  return `https://wa.me/${phone}?text=${encodeURIComponent(message)}`;
}
