export interface GiftRegistryCopy {
  pageEyebrow: string;
  pageTitle: string;
  badgeText: string;
  eyebrow: string;
  cardTitle: string;
  bankBadgeFallbackText: string;
  bankTransferTitle: string;
  bankTransferSubtitle: string;
  envelopeGiftTitle: string;
  showOptionsButtonText: string;
  showAccountsButtonText: string;
  hideOptionsButtonText: string;
  accountFallbackTitle: string;
  beneficiaryLabel: string;
  bankLabel: string;
  accountNumberLabel: string;
  cciLabel: string;
  clabeLabel: string;
  clabeCciLabel: string;
  cardNumberLabel: string;
  yapeLabel: string;
  plinLabel: string;
  conceptLabel: string;
  currencyLabel: string;
  copyDataButtonText: string;
  copyBankDataButtonText: string;
  copiedButtonText: string;
  copiedBankDataButtonText: string;
  copyAccountAriaLabel: string;
  copyFieldAriaLabel: string;
}

export const DEFAULT_GIFT_REGISTRY_COPY: GiftRegistryCopy = {
  pageEyebrow: 'Mesa de Regalos & Aportaciones',
  pageTitle: 'Mesa de Regalos',
  badgeText: 'Mesa de Regalos',
  eyebrow: 'Muestra de Cariño',
  cardTitle: 'Mesa de Regalos & Cuentas',
  bankBadgeFallbackText: 'Transferencia',
  bankTransferTitle: 'Transferencia Bancaria',
  bankTransferSubtitle: 'Depósito nacional o transferencia interbancaria',
  envelopeGiftTitle: 'Lluvia de Sobres',
  showOptionsButtonText: 'Ver opciones adicionales',
  showAccountsButtonText: 'Ver cuentas y opciones adicionales',
  hideOptionsButtonText: 'Ocultar opciones adicionales',
  accountFallbackTitle: 'Transferencia bancaria {number}',
  beneficiaryLabel: 'Titular / Beneficiario',
  bankLabel: 'Banco',
  accountNumberLabel: 'Número de cuenta',
  cciLabel: 'CCI',
  clabeLabel: 'CLABE interbancaria',
  clabeCciLabel: 'CLABE interbancaria / CCI',
  cardNumberLabel: 'Número de tarjeta',
  yapeLabel: 'Yape',
  plinLabel: 'Plin',
  conceptLabel: 'Concepto sugerido',
  currencyLabel: 'Moneda',
  copyDataButtonText: 'Copiar datos',
  copyBankDataButtonText: 'Copiar datos bancarios',
  copiedButtonText: 'Copiado',
  copiedBankDataButtonText: '¡Datos bancarios copiados!',
  copyAccountAriaLabel: 'Copiar datos de la cuenta',
  copyFieldAriaLabel: 'Copiar {label}',
};

export const DEFAULT_WEDDING_GIFT_REGISTRY_MESSAGE =
  'El mejor regalo es tu compañía. Si deseas tener un detalle con nosotros, te compartimos nuestras cuentas bancarias y mesa de regalos:';

export const DEFAULT_XV_GIFT_REGISTRY_MESSAGE =
  'El mejor regalo es tu presencia y cariño. Si deseas hacerme un presente o detalle especial para mis quince años, pongo a tu disposición mi cuenta bancaria o sobre el día del evento.';

export function getGiftRegistryMessage(value?: string | null, eventType?: string | null): string {
  if (typeof value === 'string' && value.trim()) return value;
  return eventType === 'xv'
    ? DEFAULT_XV_GIFT_REGISTRY_MESSAGE
    : DEFAULT_WEDDING_GIFT_REGISTRY_MESSAGE;
}

export function getGiftRegistryCopy(value?: string | null): GiftRegistryCopy {
  if (!value) return DEFAULT_GIFT_REGISTRY_COPY;

  try {
    const parsed = JSON.parse(value);
    if (!parsed || typeof parsed !== 'object' || Array.isArray(parsed)) {
      return DEFAULT_GIFT_REGISTRY_COPY;
    }

    return Object.fromEntries(
      Object.entries(DEFAULT_GIFT_REGISTRY_COPY).map(([key, fallback]) => [
        key,
        typeof parsed[key] === 'string' ? parsed[key] : fallback,
      ]),
    ) as GiftRegistryCopy;
  } catch {
    return DEFAULT_GIFT_REGISTRY_COPY;
  }
}
