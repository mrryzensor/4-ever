import type { BankAccountConfig, WeddingSettings } from '../types.ts';

export const BANK_COUNTRIES = [
  { code: 'PE', name: 'Perú', currency: 'PEN' },
  { code: 'MX', name: 'México', currency: 'MXN' },
  { code: 'US', name: 'Estados Unidos', currency: 'USD' },
  { code: 'CO', name: 'Colombia', currency: 'COP' },
  { code: 'CL', name: 'Chile', currency: 'CLP' },
  { code: 'AR', name: 'Argentina', currency: 'ARS' },
  { code: 'BR', name: 'Brasil', currency: 'BRL' },
  { code: 'EC', name: 'Ecuador', currency: 'USD' },
  { code: 'CR', name: 'Costa Rica', currency: 'CRC' },
  { code: 'ES', name: 'España', currency: 'EUR' },
  { code: 'GB', name: 'Reino Unido', currency: 'GBP' },
  { code: 'CA', name: 'Canadá', currency: 'CAD' },
] as const;

export const BANK_CURRENCIES = [
  ['PEN', 'PEN · Sol peruano'], ['MXN', 'MXN · Peso mexicano'], ['USD', 'USD · Dólar estadounidense'],
  ['COP', 'COP · Peso colombiano'], ['CLP', 'CLP · Peso chileno'], ['ARS', 'ARS · Peso argentino'],
  ['BRL', 'BRL · Real brasileño'], ['CRC', 'CRC · Colón costarricense'], ['EUR', 'EUR · Euro'],
  ['GBP', 'GBP · Libra esterlina'], ['CAD', 'CAD · Dólar canadiense'],
] as const;

const clean = (value: unknown) => typeof value === 'string' ? value : '';
const makeId = () => globalThis.crypto?.randomUUID?.() ?? `bank-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;

export function createBankAccount(
  country = 'PE',
  coupleNames = '',
): BankAccountConfig {
  const countryInfo = BANK_COUNTRIES.find((item) => item.code === country) ?? BANK_COUNTRIES[0];
  return {
    id: makeId(),
    country: countryInfo.code,
    currency: countryInfo.currency,
    bankName: '',
    beneficiary: '',
    accountNumber: '',
    clabe: '',
    cci: '',
    cardNumber: '',
    yapePhone: '',
    plinPhone: '',
    concept: coupleNames.trim() ? `Evento ${coupleNames.trim()}` : 'Evento {nombres}',
  };
}

function inferLegacyCountry(settings: WeddingSettings): string {
  const cci = clean(settings.bankCci).replace(/\D/g, '');
  const clabe = clean(settings.bankClabe).replace(/\D/g, '');
  if (cci || clabe.length === 20 || /per[uú]|\bBCP\b|interbank/i.test(settings.bankName || '')) return 'PE';
  const currency = clean(settings.bankCurrency).toUpperCase();
  return BANK_COUNTRIES.find((item) => item.currency === currency)?.code ?? 'MX';
}

/** Reads the new list while keeping old single-account records usable. */
export function getBankAccounts(settings: WeddingSettings, includeEmpty = false): BankAccountConfig[] {
  if (settings.bankAccounts) {
    try {
      const parsed = JSON.parse(settings.bankAccounts);
      if (Array.isArray(parsed)) {
        const accounts = parsed.filter((item) => item && typeof item === 'object').map((item) => ({
          ...createBankAccount('PE', settings.coupleNames),
          ...item,
          id: clean(item.id) || makeId(),
          country: clean(item.country) || 'PE',
          currency: clean(item.currency) || 'PEN',
          bankName: clean(item.bankName),
          beneficiary: clean(item.beneficiary),
          accountNumber: clean(item.accountNumber),
          clabe: clean(item.clabe),
          cci: clean(item.cci),
          cardNumber: clean(item.cardNumber),
          yapePhone: clean(item.yapePhone),
          plinPhone: clean(item.plinPhone),
          concept: clean(item.concept),
        }));
        if (accounts.length > 0) return includeEmpty ? accounts : accounts.filter(hasBankAccountData);
      }
    } catch {
      // Invalid legacy JSON falls back to the scalar fields below.
    }
  }

  const legacyHasData = Boolean(
    settings.bankName || settings.bankBeneficiary || settings.bankAccountNumber
    || settings.bankClabe || settings.bankCci || settings.bankCardNumber
    || settings.bankYapePhone || settings.bankPlinPhone,
  );
  if (!legacyHasData) return includeEmpty ? [createBankAccount('PE', settings.coupleNames)] : [];

  const country = inferLegacyCountry(settings);
  const legacyConcept = clean(settings.bankConcept);
  const conceptWasDefault = /^(?:evento sof[ií]a\s*&\s*alejandro|evento valeria montserrat|boda sof[ií]a|boda sofyale|regalo boda|regalo mis xv|mis xv valeria)/i.test(legacyConcept);
  return [{
    ...createBankAccount(country, settings.coupleNames),
    bankName: clean(settings.bankName),
    beneficiary: clean(settings.bankBeneficiary),
    accountNumber: clean(settings.bankAccountNumber),
    clabe: country === 'MX' ? clean(settings.bankClabe) : '',
    cci: country === 'PE' ? clean(settings.bankCci) || (clean(settings.bankClabe).replace(/\D/g, '').length === 20 ? clean(settings.bankClabe) : '') : '',
    cardNumber: country === 'MX' ? clean(settings.bankCardNumber) : '',
    yapePhone: clean(settings.bankYapePhone),
    plinPhone: clean(settings.bankPlinPhone),
    currency: clean(settings.bankCurrency) || (BANK_COUNTRIES.find((item) => item.code === country)?.currency ?? 'PEN'),
    concept: !legacyConcept || conceptWasDefault
      ? (settings.coupleNames ? `Evento ${settings.coupleNames}` : 'Evento {nombres}')
      : legacyConcept,
  }];
}

export function hasBankAccountData(account: BankAccountConfig): boolean {
  return Boolean(
    account.bankName || account.beneficiary || account.accountNumber || account.clabe
    || account.cci || account.cardNumber || account.yapePhone || account.plinPhone,
  );
}

export function serializeBankAccounts(accounts: BankAccountConfig[], coupleNames = ''): Partial<WeddingSettings> {
  const primary = accounts[0];
  return {
    bankAccounts: JSON.stringify(accounts),
    bankName: primary?.bankName ?? '',
    bankBeneficiary: primary?.beneficiary ?? '',
    bankAccountNumber: primary?.accountNumber ?? '',
    bankClabe: primary?.country === 'MX' ? primary.clabe : primary?.country === 'PE' ? primary.cci : '',
    bankCci: primary?.country === 'PE' ? primary.cci : '',
    bankCardNumber: primary?.country === 'MX' ? primary.cardNumber : '',
    bankYapePhone: primary?.yapePhone ?? '',
    bankPlinPhone: primary?.plinPhone ?? '',
    bankCurrency: primary?.currency ?? 'PEN',
    bankConcept: primary?.concept || (coupleNames ? `Evento ${coupleNames}` : 'Evento {nombres}'),
    enableBankTransfer: true,
  };
}
