import React from 'react';
import { Copy, Check } from 'lucide-react';
import type { BankAccountConfig } from '../types.ts';
import { BANK_COUNTRIES, hasBankAccountData } from '../lib/bankAccounts.ts';
import { DEFAULT_GIFT_REGISTRY_COPY, type GiftRegistryCopy } from '../lib/giftRegistryCopy.ts';

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
        const fields = [
          [copy.beneficiaryLabel, account.beneficiary],
          [copy.bankLabel, account.bankName],
          [copy.accountNumberLabel, account.accountNumber],
          ...(account.country === 'PE' ? [[copy.cciLabel, account.cci] as [string, string]] : []),
          ...(account.country === 'MX' ? [[copy.clabeLabel, account.clabe] as [string, string], [copy.cardNumberLabel, account.cardNumber] as [string, string]] : []),
          ...(account.country === 'PE' ? [[copy.yapeLabel, account.yapePhone] as [string, string], [copy.plinLabel, account.plinPhone] as [string, string]] : []),
          [copy.conceptLabel, account.concept],
        ].filter((field): field is [string, string] => Boolean(field[1]?.trim()));
        const allText = [
          account.bankName && `${copy.bankLabel}: ${account.bankName}`,
          account.beneficiary && `${copy.beneficiaryLabel}: ${account.beneficiary}`,
          account.accountNumber && `${copy.accountNumberLabel}: ${account.accountNumber}`,
          account.country === 'PE' && account.cci && `${copy.cciLabel}: ${account.cci}`,
          account.country === 'MX' && account.clabe && `${copy.clabeLabel}: ${account.clabe}`,
          account.country === 'MX' && account.cardNumber && `${copy.cardNumberLabel}: ${account.cardNumber}`,
          account.country === 'PE' && account.yapePhone && `${copy.yapeLabel}: ${account.yapePhone}`,
          account.country === 'PE' && account.plinPhone && `${copy.plinLabel}: ${account.plinPhone}`,
          account.concept && `${copy.conceptLabel}: ${account.concept}`,
          `${copy.currencyLabel}: ${account.currency}`,
        ].filter(Boolean).join('\n');

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
                {fields.map(([label, value]) => {
                  const key = `${account.id}-${label}`;
                  return (
                    <div key={key} className={`flex items-center justify-between gap-3 rounded-lg border px-3 py-2 ${fieldClass}`}>
                      <div className="min-w-0">
                        <span data-typography-role="detail" className={`block text-xs uppercase tracking-wide ${mutedClass}`}>{label}</span>
                        <span data-typography-role="body" className={`break-all text-sm ${label === 'Concepto sugerido' ? '' : 'font-mono'} ${valueClass}`}>{value}</span>
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
