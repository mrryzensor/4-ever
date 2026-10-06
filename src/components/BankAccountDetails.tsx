import React from 'react';
import { Copy, Check } from 'lucide-react';
import type { BankAccountConfig, BankAccountDisplayField } from '../types.ts';
import { BANK_COUNTRIES, hasBankAccountData } from '../lib/bankAccounts.ts';
import { DEFAULT_GIFT_REGISTRY_COPY, type GiftRegistryCopy } from '../lib/giftRegistryCopy.ts';
import { NumeralText } from './NumeralText.tsx';

interface BankAccountDetailsProps {
  accounts: BankAccountConfig[];
  isDark: boolean;
  copiedKey: string | null;
  onCopy: (value: string, key: string) => void;
  className?: string;
  copy?: GiftRegistryCopy;
}

export const BankAccountDetails: React.FC<BankAccountDetailsProps> = ({ accounts, isDark, copiedKey, onCopy, className = '', copy = DEFAULT_GIFT_REGISTRY_COPY }) => {
  const visibleAccounts = accounts.filter(hasBankAccountData);
  if (!visibleAccounts.length) return null;

  const cardClass = isDark ? 'bg-stone-800 border-stone-700' : 'bg-white border-[#E5E2D0]';
  const fieldClass = isDark ? 'bg-stone-900/70 border-stone-700' : 'bg-stone-50 border-stone-200';
  const headingClass = isDark ? 'text-stone-100' : 'text-stone-900';
  const mutedClass = isDark ? 'text-stone-400' : 'text-stone-500';
  const valueClass = isDark ? 'text-stone-100' : 'text-stone-900';

  return (
    <div className={`space-y-3 ${className}`}>
      <header className="col-span-full">
        <h3 className={`text-base font-bold ${headingClass}`}>{copy.bankTransferTitle}</h3>
        {copy.bankTransferSubtitle && <p className={`mt-0.5 text-sm ${mutedClass}`}>{copy.bankTransferSubtitle}</p>}
      </header>
      {visibleAccounts.map((account, accountIndex) => {
        const countryName = BANK_COUNTRIES.find((country) => country.code === account.country)?.name ?? account.country;
        const defaultFields: Array<[BankAccountDisplayField, string, string]> = [
          ['beneficiary', copy.beneficiaryLabel, account.beneficiary],
          ['bankName', copy.bankLabel, account.bankName],
          ['accountNumber', copy.accountNumberLabel, account.accountNumber],
          ...(account.country === 'PE' ? [['cci', copy.cciLabel, account.cci] as [BankAccountDisplayField, string, string]] : []),
          ...(account.country === 'MX' ? [
            ['clabe', copy.clabeLabel, account.clabe] as [BankAccountDisplayField, string, string],
            ['cardNumber', copy.cardNumberLabel, account.cardNumber] as [BankAccountDisplayField, string, string],
          ] : []),
          ...(account.country === 'PE' ? [
            ['yapePhone', copy.yapeLabel, account.yapePhone] as [BankAccountDisplayField, string, string],
            ['plinPhone', copy.plinLabel, account.plinPhone] as [BankAccountDisplayField, string, string],
          ] : []),
          ['concept', copy.conceptLabel, account.concept],
        ];
        const availableFields = defaultFields.filter(([, , value]) => Boolean(value?.trim()));
        const preferredField = account.primaryDisplayField;
        const preferredIndex = preferredField && preferredField !== 'auto'
          ? availableFields.findIndex(([field]) => field === preferredField)
          : -1;
        const fields = preferredIndex > 0
          ? [availableFields[preferredIndex], ...availableFields.slice(0, preferredIndex), ...availableFields.slice(preferredIndex + 1)]
          : availableFields;
        const allText = [
          ...fields.map(([, label, value]) => `${label}: ${value}`),
          `${copy.currencyLabel}: ${account.currency}`,
        ].join('\n');

        return (
          <article key={account.id} className={`rounded-xl border p-3 sm:p-4 space-y-3 ${cardClass}`}>
            <header className="flex items-start justify-between gap-3">
              <div className="min-w-0">
                {account.bankName && <h4 className={`text-base font-bold ${headingClass}`}>{account.bankName}</h4>}
                {account.beneficiary && <p className={`text-sm mt-0.5 ${mutedClass}`}>{account.beneficiary}</p>}
                {!account.bankName && !account.beneficiary && <h4 className={`text-base font-bold ${headingClass}`}>{copy.accountFallbackTitle.replace('{number}', String(accountIndex + 1))}</h4>}
                <p className={`text-xs mt-1 ${mutedClass}`}>{countryName} · {copy.currencyLabel}: {account.currency}</p>
              </div>
              <button
                type="button"
                onClick={(event) => { event.stopPropagation(); onCopy(allText, `bank-all-${account.id}`); }}
                className={`inline-flex shrink-0 items-center gap-1.5 rounded-lg px-2.5 py-1.5 text-xs font-semibold cursor-pointer ${isDark ? 'bg-amber-500 text-stone-950' : 'bg-[#5A5A40] text-white'}`}
                aria-label={copy.copyAccountAriaLabel}
              >
                {copiedKey === `bank-all-${account.id}` ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                {copiedKey === `bank-all-${account.id}` ? copy.copiedButtonText : copy.copyDataButtonText}
              </button>
            </header>
            {fields.length > 0 && (
              <div className="space-y-2">
                {fields.map(([field, label, value]) => {
                  const key = `${account.id}-${label}`;
                  const isFeatured = preferredIndex >= 0 && fields[0][0] === field;
                  return (
                    <div key={key} className={`flex items-center justify-between gap-3 rounded-lg border px-3 py-2 ${fieldClass}`}>
                      <div className="min-w-0">
                        {isFeatured ? (
                          <div className="flex min-w-0 flex-wrap items-baseline gap-x-2 gap-y-0.5">
                            <span data-typography-role="detail" className={`text-xs font-bold ${mutedClass}`}>{label}:</span>
                            <span data-typography-role="body" className={`break-all text-base font-semibold ${field === 'concept' ? '' : 'font-mono'} ${valueClass}`}><NumeralText>{value}</NumeralText></span>
                          </div>
                        ) : (
                          <>
                            <span data-typography-role="detail" className={`block text-xs uppercase tracking-wide ${mutedClass}`}>{label}</span>
                            <span data-typography-role="body" className={`break-all text-sm ${field === 'concept' ? '' : 'font-mono'} ${valueClass}`}><NumeralText>{value}</NumeralText></span>
                          </>
                        )}
                      </div>
                      <button
                        type="button"
                        onClick={(event) => { event.stopPropagation(); onCopy(value, key); }}
                        aria-label={copy.copyFieldAriaLabel.replace('{label}', label)}
                        className={`shrink-0 p-1.5 rounded-md cursor-pointer ${isDark ? 'text-amber-300 hover:bg-stone-700' : 'text-[#5A5A40] hover:bg-stone-200'}`}
                      >
                        {copiedKey === key ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                      </button>
                    </div>
                  );
                })}
              </div>
            )}
          </article>
        );
      })}
    </div>
  );
};
