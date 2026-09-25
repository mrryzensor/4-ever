import React from 'react';
import { Landmark, Plus, Trash2 } from 'lucide-react';
import type { BankAccountConfig, WeddingSettings } from '../../../types.ts';
import { BANK_COUNTRIES, BANK_CURRENCIES, createBankAccount, getBankAccounts, serializeBankAccounts } from '../../../lib/bankAccounts.ts';

interface BankAccountsEditorProps {
  settings: WeddingSettings;
  onChange: (updated: Partial<WeddingSettings>) => void;
}

const inputClass = 'w-full min-w-0 bg-white border border-[#E5E2D0] rounded-xl px-3.5 py-2.5 text-sm text-[#3D3D3D] focus:outline-none focus:border-[#5A5A40]';
const labelClass = 'text-xs font-semibold text-stone-700 block mb-1.5';

export const BankAccountsEditor: React.FC<BankAccountsEditorProps> = ({ settings, onChange }) => {
  const accounts = getBankAccounts(settings, true);
  const commit = (next: BankAccountConfig[]) => onChange(serializeBankAccounts(next, settings.coupleNames));
  const updateAccount = (index: number, patch: Partial<BankAccountConfig>) => {
    const next = accounts.map((account, accountIndex) => accountIndex === index ? { ...account, ...patch } : account);
    commit(next);
  };

  return (
    <section className="space-y-4" aria-label="Cuentas bancarias para regalos">
      <header className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h4 className="text-sm font-bold text-[#3D3D2C] flex items-center gap-2">
            <Landmark className="w-4 h-4 text-[#7D8C7A]" /> Cuentas bancarias y transferencias
          </h4>
          <p className="text-xs text-stone-500 mt-1">Agrega una o más cuentas. El país propone su moneda y los datos bancarios disponibles; puedes cambiar la moneda manualmente.</p>
        </div>
        <button
          type="button"
          onClick={() => commit([...accounts, createBankAccount(accounts[0]?.country || 'PE', settings.coupleNames)])}
          className="shrink-0 inline-flex items-center justify-center gap-2 rounded-xl bg-[#5A5A40] hover:bg-[#484833] text-white px-4 py-2.5 text-xs font-semibold cursor-pointer"
        >
          <Plus className="w-4 h-4" /> Agregar cuenta
        </button>
      </header>

      <div className="space-y-4">
        {accounts.map((account, index) => (
          <article key={account.id} className="rounded-2xl border border-[#E5E2D0] bg-[#FAF9F0] p-4 sm:p-5 space-y-4">
            <div className="flex items-center justify-between gap-3">
              <div>
                <h5 className="text-sm font-bold text-stone-800">{account.bankName.trim() || `Cuenta ${index + 1}`}</h5>
                <p className="text-[11px] text-stone-500">{index === 0 ? 'Cuenta principal' : `Cuenta adicional ${index}`}</p>
              </div>
              {accounts.length > 1 && (
                <button
                  type="button"
                  onClick={() => commit(accounts.filter((_, accountIndex) => accountIndex !== index))}
                  aria-label={`Eliminar cuenta ${index + 1}`}
                  className="inline-flex items-center gap-1.5 rounded-lg border border-rose-200 bg-white px-3 py-2 text-xs font-semibold text-rose-700 hover:bg-rose-50 cursor-pointer"
                >
                  <Trash2 className="w-3.5 h-3.5" /> Quitar
                </button>
              )}
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3.5">
              <div>
                <label className={labelClass} htmlFor={`bank-country-${account.id}`}>País de la cuenta</label>
                <select
                  id={`bank-country-${account.id}`}
                  value={account.country}
                  onChange={(event) => {
                    const country = BANK_COUNTRIES.find((item) => item.code === event.target.value) ?? BANK_COUNTRIES[0];
                    updateAccount(index, { country: country.code, currency: country.currency });
                  }}
                  className={`${inputClass} cursor-pointer`}
                >
                  {BANK_COUNTRIES.map((country) => <option key={country.code} value={country.code}>{country.name}</option>)}
                </select>
              </div>
              <div>
                <label className={labelClass} htmlFor={`bank-currency-${account.id}`}>Moneda</label>
                <select
                  id={`bank-currency-${account.id}`}
                  value={account.currency}
                  onChange={(event) => updateAccount(index, { currency: event.target.value })}
                  className={`${inputClass} cursor-pointer`}
                >
                  {BANK_CURRENCIES.map(([code, name]) => <option key={code} value={code}>{name}</option>)}
                </select>
              </div>
              <div>
                <label className={labelClass} htmlFor={`bank-name-${account.id}`}>Banco o entidad</label>
                <input id={`bank-name-${account.id}`} value={account.bankName} onChange={(event) => updateAccount(index, { bankName: event.target.value })} placeholder="Ej. BCP, BBVA, Interbank" className={inputClass} />
              </div>
              <div>
                <label className={labelClass} htmlFor={`bank-beneficiary-${account.id}`}>Titular / beneficiario</label>
                <input id={`bank-beneficiary-${account.id}`} value={account.beneficiary} onChange={(event) => updateAccount(index, { beneficiary: event.target.value })} placeholder={settings.coupleNames || 'Nombres del titular'} className={inputClass} />
              </div>
              <div>
                <label className={labelClass} htmlFor={`bank-account-${account.id}`}>Número de cuenta</label>
                <input id={`bank-account-${account.id}`} value={account.accountNumber} onChange={(event) => updateAccount(index, { accountNumber: event.target.value })} placeholder="Número de cuenta bancaria" inputMode="numeric" className={`${inputClass} font-mono`} />
              </div>
              {account.country === 'PE' && (
                <div>
                  <label className={labelClass} htmlFor={`bank-cci-${account.id}`}>CCI (20 dígitos)</label>
                  <input id={`bank-cci-${account.id}`} value={account.cci} onChange={(event) => updateAccount(index, { cci: event.target.value })} placeholder="Código de Cuenta Interbancario" inputMode="numeric" className={`${inputClass} font-mono`} />
                </div>
              )}
              {account.country === 'MX' && (
                <>
                  <div>
                    <label className={labelClass} htmlFor={`bank-clabe-${account.id}`}>CLABE interbancaria (18 dígitos)</label>
                    <input id={`bank-clabe-${account.id}`} value={account.clabe} onChange={(event) => updateAccount(index, { clabe: event.target.value })} placeholder="CLABE interbancaria" inputMode="numeric" className={`${inputClass} font-mono`} />
                  </div>
                  <div>
                    <label className={labelClass} htmlFor={`bank-card-${account.id}`}>Número de tarjeta (opcional)</label>
                    <input id={`bank-card-${account.id}`} value={account.cardNumber} onChange={(event) => updateAccount(index, { cardNumber: event.target.value })} placeholder="Número de tarjeta" inputMode="numeric" className={`${inputClass} font-mono`} />
                  </div>
                </>
              )}
              {account.country === 'PE' && (
                <>
                  <div>
                    <label className={labelClass} htmlFor={`bank-yape-${account.id}`}>Celular de Yape (opcional)</label>
                    <input id={`bank-yape-${account.id}`} value={account.yapePhone} onChange={(event) => updateAccount(index, { yapePhone: event.target.value })} placeholder="+51 987 654 321" inputMode="tel" className={`${inputClass} font-mono`} />
                  </div>
                  <div>
                    <label className={labelClass} htmlFor={`bank-plin-${account.id}`}>Celular de Plin (opcional)</label>
                    <input id={`bank-plin-${account.id}`} value={account.plinPhone} onChange={(event) => updateAccount(index, { plinPhone: event.target.value })} placeholder="+51 987 654 321" inputMode="tel" className={`${inputClass} font-mono`} />
                  </div>
                </>
              )}
              <div className="sm:col-span-2 lg:col-span-3">
                <label className={labelClass} htmlFor={`bank-concept-${account.id}`}>Concepto sugerido</label>
                <input id={`bank-concept-${account.id}`} value={account.concept} onChange={(event) => updateAccount(index, { concept: event.target.value })} placeholder={`Evento ${settings.coupleNames || '{nombres}'}`} className={inputClass} />
                <p className="text-[10px] text-stone-500 mt-1">Sugerencia: Evento {settings.coupleNames || '{nombres}'}</p>
              </div>
            </div>
          </article>
        ))}
      </div>
    </section>
  );
};
