import React, { useState } from 'react';
import {
  CreditCard,
  Building2,
  Plane,
  Copy,
  Check,
  ExternalLink,
  HeartHandshake,
  Mail,
  Wallet,
  Sparkles
} from 'lucide-react';
import { WeddingSettings, GiftRegistryItem } from '../types.ts';
import { AnimatedGiftBox, StyleSpecificDivider } from './AnimatedSvgs.tsx';
import { CARD_THEMES } from '../lib/themes.ts';

interface GiftRegistrySectionProps {
  settings: WeddingSettings;
}

export const GiftRegistrySection: React.FC<GiftRegistrySectionProps> = ({ settings }) => {
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  if (settings.showGiftRegistry === false) {
    return null;
  }

  let registryItems: GiftRegistryItem[] = [];
  try {
    registryItems = JSON.parse(settings.giftRegistry || '[]');
  } catch {
    registryItems = [];
  }

  const handleCopy = (text: string, key: string) => {
    if (!text) return;
    navigator.clipboard.writeText(text);
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(null), 2000);
  };

  // If host provided direct bank settings and no bank item in registryItems, we construct one
  const hasDirectBankSettings =
    settings.enableBankTransfer !== false &&
    Boolean(settings.bankClabe || settings.bankAccountNumber || settings.bankName);

  const hasDirectBankInItems = registryItems.some((item) => item.type === 'bank');

  return (
    <section className="w-full px-4 sm:px-8 md:px-12 lg:px-16 py-10 sm:py-14 bg-transparent" id="mesa-de-regalos">
      <div className="max-w-4xl mx-auto text-center mb-10 sm:mb-12">
        <div className="w-14 h-14 rounded-2xl bg-[#5A5A40]/10 text-[#5A5A40] flex items-center justify-center mx-auto mb-3 border border-[#E5E2D0]">
          <AnimatedGiftBox className="w-10 h-10" />
        </div>
        <span className="text-xs uppercase tracking-[0.3em] font-semibold text-[#7D8C7A] block mb-2">
          Mesa de Regalos & Aportaciones
        </span>
        <h2 className="text-3xl sm:text-5xl font-serif text-[#3D3D2C] font-normal">
          Mesa de Regalos
        </h2>
        <StyleSpecificDivider
          cardStyle={settings.cardStyle}
          className="w-48 sm:w-60 h-8 mx-auto mt-2"
          color={CARD_THEMES[settings.cardStyle]?.accentColorHex}
        />
        <p className="text-sm text-stone-600 max-w-xl mx-auto mt-1 leading-relaxed">
          {settings.giftRegistryMessage ||
            'El mejor regalo es tu presencia en nuestro gran día. Si deseas tener un detalle con nosotros para nuestro nuevo hogar o luna de miel, ponemos a tu disposición las siguientes opciones:'}
        </p>
      </div>

      <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {/* ==================================================================== */}
        {/* DIRECT BANK ACCOUNT CARD (If configured in Settings) */}
        {/* ==================================================================== */}
        {hasDirectBankSettings && !hasDirectBankInItems && (
          <div className="bg-white/95 backdrop-blur-sm rounded-3xl p-8 border border-[#E5E2D0] shadow-sm hover:shadow-md transition-all flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between mb-5">
                <div className="w-12 h-12 rounded-2xl bg-[#FAF9F0] text-[#5A5A40] flex items-center justify-center border border-[#E5E2D0]">
                  <CreditCard className="w-6 h-6 shrink-0" />
                </div>
                <span className="text-[10px] font-bold uppercase tracking-widest bg-[#FAF9F0] text-[#5A5A40] border border-[#E5E2D0] px-2.5 py-1 rounded-full font-mono">
                  {settings.bankName || 'Transferencia'}
                </span>
              </div>

              <h3 className="text-xl font-serif font-bold text-[#3D3D2C] mb-1">
                Transferencia Bancaria
              </h3>
              <p className="text-xs text-[#7D8C7A] font-serif italic mb-4">
                Depósito nacional o transferencia interbancaria
              </p>

              <div className="space-y-3 text-xs sm:text-sm text-stone-600">
                {settings.bankBeneficiary && (
                  <div className="flex items-center justify-between p-2.5 bg-[#FAF9F0] rounded-xl border border-[#E5E2D0]">
                    <div>
                      <span className="text-[10px] text-[#7D8C7A] block uppercase font-mono font-semibold">
                        Titular / Beneficiario:
                      </span>
                      <span className="font-semibold text-[#3D3D2C]">
                        {settings.bankBeneficiary}
                      </span>
                    </div>
                    <button
                      type="button"
                      onClick={() => handleCopy(settings.bankBeneficiary!, 'direct-beneficiary')}
                      className="p-1.5 text-[#5A5A40] hover:text-[#3D3D2C] transition-colors cursor-pointer"
                      title="Copiar Titular"
                    >
                      {copiedKey === 'direct-beneficiary' ? (
                        <Check className="w-4 h-4 text-emerald-600" />
                      ) : (
                        <Copy className="w-4 h-4" />
                      )}
                    </button>
                  </div>
                )}

                {(settings.bankClabe || settings.bankCci) && (
                  <div className="p-3 bg-[#FAF9F0] rounded-2xl border border-[#E5E2D0]">
                    <span className="text-[10px] text-[#7D8C7A] block uppercase font-mono font-semibold">
                      Código de Cuenta Interbancario (CCI):
                    </span>
                    <div className="flex items-center justify-between mt-1">
                      <span className="font-mono font-bold text-[#3D3D2C] text-xs sm:text-sm tracking-wider">
                        {settings.bankCci || settings.bankClabe}
                      </span>
                      <button
                        type="button"
                        onClick={() => handleCopy((settings.bankCci || settings.bankClabe)!, 'direct-clabe')}
                        className="p-1.5 text-[#5A5A40] hover:text-[#3D3D2C] transition-colors cursor-pointer"
                        title="Copiar CCI"
                      >
                        {copiedKey === 'direct-clabe' ? (
                          <Check className="w-4 h-4 text-emerald-600" />
                        ) : (
                          <Copy className="w-4 h-4" />
                        )}
                      </button>
                    </div>
                  </div>
                )}

                {settings.bankYapePhone && (
                  <div className="flex items-center justify-between p-2.5 bg-[#FAF9F0] rounded-xl border border-[#E5E2D0]">
                    <div>
                      <span className="text-[10px] text-[#7D8C7A] block uppercase font-mono font-semibold">
                        Yape / Plin (Celular):
                      </span>
                      <span className="font-mono font-bold text-[#3D3D2C]">
                        {settings.bankYapePhone}
                      </span>
                    </div>
                    <button
                      type="button"
                      onClick={() => handleCopy(settings.bankYapePhone!, 'direct-yape')}
                      className="p-1.5 text-[#5A5A40] hover:text-[#3D3D2C] transition-colors cursor-pointer"
                      title="Copiar Celular Yape/Plin"
                    >
                      {copiedKey === 'direct-yape' ? (
                        <Check className="w-4 h-4 text-emerald-600" />
                      ) : (
                        <Copy className="w-4 h-4" />
                      )}
                    </button>
                  </div>
                )}

                {settings.bankAccountNumber && (
                  <div className="flex items-center justify-between p-2.5 bg-[#FAF9F0] rounded-xl border border-[#E5E2D0]">
                    <div>
                      <span className="text-[10px] text-[#7D8C7A] block uppercase font-mono font-semibold">
                        Número de Cuenta:
                      </span>
                      <span className="font-mono font-bold text-[#3D3D2C]">
                        {settings.bankAccountNumber}
                      </span>
                    </div>
                    <button
                      type="button"
                      onClick={() => handleCopy(settings.bankAccountNumber!, 'direct-acc')}
                      className="p-1.5 text-[#5A5A40] hover:text-[#3D3D2C] transition-colors cursor-pointer"
                      title="Copiar Cuenta"
                    >
                      {copiedKey === 'direct-acc' ? (
                        <Check className="w-4 h-4 text-emerald-600" />
                      ) : (
                        <Copy className="w-4 h-4" />
                      )}
                    </button>
                  </div>
                )}

                {settings.bankConcept && (
                  <p className="text-[11px] text-[#7D8C7A] font-mono">
                    <strong>Concepto sugerido:</strong> {settings.bankConcept}
                  </p>
                )}
              </div>
            </div>

            <div className="mt-6 pt-4 border-t border-[#E5E2D0]">
              <button
                type="button"
                onClick={() =>
                  handleCopy(
                    `Banco: ${settings.bankName || 'Banco'}\nBeneficiario: ${settings.bankBeneficiary || ''}\nCLABE: ${settings.bankClabe || ''}\nCuenta: ${settings.bankAccountNumber || ''}\nConcepto: ${settings.bankConcept || ''}`,
                    'direct-all'
                  )
                }
                className="w-full py-3 px-4 rounded-full bg-[#5A5A40] hover:bg-[#484833] text-white text-xs font-semibold flex items-center justify-center gap-2 shadow-xs transition-all cursor-pointer"
              >
                {copiedKey === 'direct-all' ? (
                  <>
                    <Check className="w-4 h-4 text-emerald-400 shrink-0" />
                    <span>¡Todos los datos copiados!</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-4 h-4 shrink-0" />
                    <span>Copiar Todos los Datos Bancarios</span>
                  </>
                )}
              </button>
            </div>
          </div>
        )}

        {/* ==================================================================== */}
        {/* CUSTOM ITEMS FROM GIFT REGISTRY JSON */}
        {/* ==================================================================== */}
        {registryItems.map((item, index) => (
          <div
            key={index}
            className="bg-white/95 backdrop-blur-sm rounded-3xl p-8 border border-[#E5E2D0] shadow-sm hover:shadow-md transition-all flex flex-col justify-between"
          >
            <div>
              <div className="flex items-center justify-between mb-5">
                <div className="w-12 h-12 rounded-2xl bg-[#FAF9F0] text-[#5A5A40] flex items-center justify-center border border-[#E5E2D0]">
                  {item.type === 'bank' && <CreditCard className="w-6 h-6 shrink-0" />}
                  {item.type === 'store' && <Building2 className="w-6 h-6 shrink-0" />}
                  {item.type === 'honeymoon' && <Plane className="w-6 h-6 shrink-0" />}
                  {item.type === 'envelope' && <Mail className="w-6 h-6 shrink-0" />}
                  {item.type === 'other' && <HeartHandshake className="w-6 h-6 shrink-0" />}
                </div>
                {item.bankName && (
                  <span className="text-[10px] font-bold uppercase tracking-widest bg-[#FAF9F0] text-[#5A5A40] border border-[#E5E2D0] px-2.5 py-1 rounded-full font-mono">
                    {item.bankName}
                  </span>
                )}
              </div>

              <h3 className="text-xl font-serif font-bold text-[#3D3D2C] mb-2">
                {item.title}
              </h3>

              {item.type === 'bank' && (
                <div className="space-y-2.5 text-xs sm:text-sm text-stone-600">
                  {item.beneficiary && (
                    <div className="flex items-center justify-between p-2 bg-[#FAF9F0] rounded-xl border border-[#E5E2D0]">
                      <div>
                        <span className="text-[10px] text-[#7D8C7A] block uppercase font-mono font-semibold">
                          Titular:
                        </span>
                        <span className="font-semibold text-[#3D3D2C]">{item.beneficiary}</span>
                      </div>
                      <button
                        type="button"
                        onClick={() => handleCopy(item.beneficiary!, `item-ben-${index}`)}
                        className="p-1 text-[#5A5A40] hover:text-[#3D3D2C] transition-colors cursor-pointer"
                        title="Copiar Titular"
                      >
                        {copiedKey === `item-ben-${index}` ? (
                          <Check className="w-4 h-4 text-emerald-600" />
                        ) : (
                          <Copy className="w-4 h-4" />
                        )}
                      </button>
                    </div>
                  )}

                  {item.clabe && (
                    <div className="p-3 bg-[#FAF9F0] rounded-2xl border border-[#E5E2D0]">
                      <span className="text-[10px] text-[#7D8C7A] block uppercase font-mono font-semibold">
                        CLABE Interbancaria / CCI:
                      </span>
                      <div className="flex items-center justify-between mt-1">
                        <span className="font-mono font-bold text-[#3D3D2C] text-xs sm:text-sm">
                          {item.clabe}
                        </span>
                        <button
                          type="button"
                          onClick={() => handleCopy(item.clabe!, `item-clabe-${index}`)}
                          className="p-1 text-[#5A5A40] hover:text-[#3D3D2C] transition-colors cursor-pointer shrink-0"
                          title="Copiar CLABE"
                        >
                          {copiedKey === `item-clabe-${index}` ? (
                            <Check className="w-4 h-4 text-emerald-600" />
                          ) : (
                            <Copy className="w-4 h-4" />
                          )}
                        </button>
                      </div>
                    </div>
                  )}

                  {item.accountNumber && (
                    <div className="flex items-center justify-between p-2 bg-[#FAF9F0] rounded-xl border border-[#E5E2D0]">
                      <div>
                        <span className="text-[10px] text-[#7D8C7A] block uppercase font-mono font-semibold">
                          Número de Cuenta:
                        </span>
                        <span className="font-mono font-bold text-[#3D3D2C]">{item.accountNumber}</span>
                      </div>
                      <button
                        type="button"
                        onClick={() => handleCopy(item.accountNumber!, `item-acc-${index}`)}
                        className="p-1 text-[#5A5A40] hover:text-[#3D3D2C] transition-colors cursor-pointer"
                        title="Copiar Cuenta"
                      >
                        {copiedKey === `item-acc-${index}` ? (
                          <Check className="w-4 h-4 text-emerald-600" />
                        ) : (
                          <Copy className="w-4 h-4" />
                        )}
                      </button>
                    </div>
                  )}

                  {item.concept && (
                    <p className="text-[11px] text-[#7D8C7A] font-mono">
                      <strong>Concepto:</strong> {item.concept}
                    </p>
                  )}
                </div>
              )}

              {item.type === 'store' && (
                <div className="space-y-3 text-xs sm:text-sm text-stone-600">
                  {item.eventNumber && (
                    <div className="flex items-center justify-between p-3 bg-[#FAF9F0] rounded-2xl border border-[#E5E2D0]">
                      <div>
                        <span className="text-[10px] text-[#7D8C7A] block uppercase font-mono font-semibold">
                          Número de Evento:
                        </span>
                        <span className="font-mono font-bold text-[#5A5A40] text-sm">
                          {item.eventNumber}
                        </span>
                      </div>
                      <button
                        type="button"
                        onClick={() => handleCopy(item.eventNumber!, `item-event-${index}`)}
                        className="p-1 text-[#5A5A40] hover:text-[#3D3D2C] transition-colors cursor-pointer"
                        title="Copiar Número de Evento"
                      >
                        {copiedKey === `item-event-${index}` ? (
                          <Check className="w-4 h-4 text-emerald-600" />
                        ) : (
                          <Copy className="w-4 h-4" />
                        )}
                      </button>
                    </div>
                  )}
                  <p className="text-stone-500 text-xs leading-relaxed">
                    {item.description ||
                      'Puedes consultar nuestra mesa de regalos en línea o visitando la sucursal de tu preferencia.'}
                  </p>
                </div>
              )}

              {item.type === 'honeymoon' && (
                <p className="text-xs sm:text-sm text-stone-600 leading-relaxed">
                  {item.description ||
                    'Ayúdanos a vivir experiencias increíbles en nuestro primer viaje como esposos.'}
                </p>
              )}

              {item.type === 'envelope' && (
                <p className="text-xs sm:text-sm text-stone-600 leading-relaxed">
                  {item.description ||
                    'Si prefieres hacernos un obsequio en efectivo, dispondremos de un cofre especial de sobres en la entrada de la recepción.'}
                </p>
              )}

              {item.type === 'other' && item.description && (
                <p className="text-xs sm:text-sm text-stone-600 leading-relaxed">
                  {item.description}
                </p>
              )}
            </div>

            {/* Bottom action button */}
            <div className="mt-6 pt-4 border-t border-[#E5E2D0]">
              {item.url ? (
                <a
                  href={item.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full py-3 px-5 rounded-full bg-gradient-to-r from-amber-600 via-amber-700 to-amber-800 text-amber-50 text-xs font-serif font-semibold flex items-center justify-center gap-2 shadow-md hover:brightness-110 transition-all"
                >
                  <ExternalLink className="w-4 h-4 shrink-0" />
                  <span>Ir a la Mesa de Regalos</span>
                </a>
              ) : item.type === 'bank' ? (
                <button
                  type="button"
                  onClick={() =>
                    handleCopy(
                      `Banco: ${item.bankName || 'Banco'}\nBeneficiario: ${item.beneficiary || ''}\nCLABE: ${item.clabe || ''}\nCuenta: ${item.accountNumber || ''}\nConcepto: ${item.concept || ''}`,
                      `item-all-${index}`
                    )
                  }
                  className="w-full py-3 px-4 rounded-full bg-[#FAF9F0] hover:bg-stone-200/60 border border-[#E5E2D0] text-[#3D3D2C] text-xs font-semibold flex items-center justify-center gap-2 transition-all cursor-pointer"
                >
                  {copiedKey === `item-all-${index}` ? (
                    <>
                      <Check className="w-4 h-4 text-emerald-600 shrink-0" />
                      <span>¡Datos bancarios copiados!</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-4 h-4 shrink-0" />
                      <span>Copiar Datos Bancarios</span>
                    </>
                  )}
                </button>
              ) : null}
            </div>
          </div>
        ))}

        {/* ==================================================================== */}
        {/* ENVELOPE GIFT CARD (Lluvia de Sobres si está activado) */}
        {/* ==================================================================== */}
        {settings.enableEnvelopeGift && (
          <div className="bg-white/95 backdrop-blur-sm rounded-3xl p-8 border border-[#E5E2D0] shadow-sm hover:shadow-md transition-all flex flex-col justify-between">
            <div>
              <div className="w-12 h-12 rounded-2xl bg-[#FAF9F0] text-[#5A5A40] flex items-center justify-center mb-5 border border-[#E5E2D0]">
                <Mail className="w-6 h-6 shrink-0" />
              </div>

              <h3 className="text-xl font-serif font-bold text-[#3D3D2C] mb-2">
                Lluvia de Sobres
              </h3>

              <p className="text-xs sm:text-sm text-stone-600 leading-relaxed">
                {settings.envelopeGiftMessage ||
                  'Si deseas hacernos un regalo en efectivo el día del evento, dispondremos de un cofre especial en la recepción para depositar tu sobre con tus mejores deseos.'}
              </p>
            </div>

            <div className="mt-6 pt-4 border-t border-[#E5E2D0] text-center">
              <span className="text-[11px] text-[#7D8C7A] font-serif italic block">
                ¡Agradecemos de corazón tu muestra de cariño!
              </span>
            </div>
          </div>
        )}
      </div>
    </section>
  );
};
