import React, { useState } from 'react';
import {
  CreditCard,
  CheckCircle,
  Landmark,
  Sparkles,
  Copy,
  Plus,
  Trash2,
  ExternalLink,
} from 'lucide-react';
import { WeddingSettings, GiftRegistryItem } from '../../../../types.ts';

interface AdminGiftRegistrySettingsProps {
  settings: WeddingSettings;
  onChange: (updated: Partial<WeddingSettings>) => void;
}

export const AdminGiftRegistrySettings: React.FC<AdminGiftRegistrySettingsProps> = ({
  settings,
  onChange,
}) => {
  const [copiedKey, setCopiedKey] = useState<string | null>(null);
  const [showAddStoreModal, setShowAddStoreModal] = useState(false);
  const [newStoreName, setNewStoreName] = useState('Liverpool');
  const [newEventNumber, setNewEventNumber] = useState('');
  const [newItemUrl, setNewItemUrl] = useState('');
  const [newItemDescription, setNewItemDescription] = useState('');

  const getParsedStoreItems = (): GiftRegistryItem[] => {
    if (Array.isArray(settings.customStoreItems)) {
      return settings.customStoreItems;
    }
    if (typeof settings.customStoreItems === 'string') {
      try {
        const parsed = JSON.parse(settings.customStoreItems);
        if (Array.isArray(parsed)) return parsed;
      } catch (e) {
        return [];
      }
    }
    return [];
  };

  const handleCopyBankPreview = (text: string, key: string) => {
    if (!text) return;
    navigator.clipboard.writeText(text);
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(null), 2000);
  };

  const handleAddStoreItem = () => {
    if (!newStoreName.trim()) return;
    const current = getParsedStoreItems();
    const newItem: GiftRegistryItem = {
      type: 'store',
      title: newStoreName.trim(),
      eventNumber: newEventNumber.trim() || undefined,
      url: newItemUrl.trim() || undefined,
      description: newItemDescription.trim() || undefined,
    };
    onChange({ customStoreItems: [...current, newItem] });
    setNewStoreName('Liverpool');
    setNewEventNumber('');
    setNewItemUrl('');
    setNewItemDescription('');
    setShowAddStoreModal(false);
  };

  const handleRemoveStoreItem = (index: number) => {
    const current = getParsedStoreItems().filter((_, i) => i !== index);
    onChange({ customStoreItems: current });
  };

  return (
    <div className="bg-white p-4 sm:p-6 lg:p-7 rounded-2xl sm:rounded-3xl border border-[#E5E2D0] space-y-5 sm:space-y-6 shadow-sm min-w-0">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-[#E5E2D0] pb-4">
        <div>
          <h3 className="text-lg font-serif text-[#1a1a1a] flex items-center gap-2 font-bold">
            <CreditCard className="w-5 h-5 text-[#7D8C7A]" />
            Gestión de Números de Cuenta & Mesa de Regalos
          </h3>
          <p className="text-xs text-[#7D8C7A] mt-0.5">
            Configura tus datos de transferencia bancaria, CLABE, cuenta, lluvia de sobres y enlaces a tiendas departamentales.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-[11px] font-semibold bg-emerald-50 text-emerald-800 border border-emerald-200 px-3 py-1 rounded-full flex items-center gap-1">
            <CheckCircle className="w-3 h-3 text-emerald-600" />
            Copia en 1-Clic para Invitados
          </span>
        </div>
      </div>

      {/* Toggles for Gift Modalities */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <label
          className={`p-3.5 rounded-2xl border transition-all cursor-pointer flex items-center gap-3 select-none ${
            settings.enableBankTransfer !== false
              ? 'bg-[#FAF9F0] border-[#5A5A40]/40 ring-1 ring-[#5A5A40]/20 shadow-2xs'
              : 'bg-white border-[#E5E2D0] opacity-60'
          }`}
        >
          <input
            type="checkbox"
            checked={settings.enableBankTransfer !== false}
            onChange={(e) =>
              onChange({ enableBankTransfer: e.target.checked })
            }
            className="w-4 h-4 rounded text-[#5A5A40] accent-[#5A5A40] cursor-pointer"
          />
          <div>
            <span className="text-xs font-bold text-[#1a1a1a] block">Transferencia Bancaria</span>
            <span className="text-[10px] text-[#7D8C7A]">CLABE, Cuenta y Tarjeta</span>
          </div>
        </label>

        <label
          className={`p-3.5 rounded-2xl border transition-all cursor-pointer flex items-center gap-3 select-none ${
            settings.enableEnvelopeGift !== false
              ? 'bg-[#FAF9F0] border-[#5A5A40]/40 ring-1 ring-[#5A5A40]/20 shadow-2xs'
              : 'bg-white border-[#E5E2D0] opacity-60'
          }`}
        >
          <input
            type="checkbox"
            checked={settings.enableEnvelopeGift !== false}
            onChange={(e) =>
              onChange({ enableEnvelopeGift: e.target.checked })
            }
            className="w-4 h-4 rounded text-[#5A5A40] accent-[#5A5A40] cursor-pointer"
          />
          <div>
            <span className="text-xs font-bold text-[#1a1a1a] block">Lluvia de Sobres</span>
            <span className="text-[10px] text-[#7D8C7A]">Buzón / Sobre en Recepción</span>
          </div>
        </label>

        <label
          className={`p-3.5 rounded-2xl border transition-all cursor-pointer flex items-center gap-3 select-none ${
            settings.enableStoreRegistry !== false
              ? 'bg-[#FAF9F0] border-[#5A5A40]/40 ring-1 ring-[#5A5A40]/20 shadow-2xs'
              : 'bg-white border-[#E5E2D0] opacity-60'
          }`}
        >
          <input
            type="checkbox"
            checked={settings.enableStoreRegistry !== false}
            onChange={(e) =>
              onChange({ enableStoreRegistry: e.target.checked })
            }
            className="w-4 h-4 rounded text-[#5A5A40] accent-[#5A5A40] cursor-pointer"
          />
          <div>
            <span className="text-xs font-bold text-[#1a1a1a] block">Tiendas Departamentales</span>
            <span className="text-[10px] text-[#7D8C7A]">Liverpool, Amazon, etc.</span>
          </div>
        </label>
      </div>

      {/* 3.1 Direct Bank Transfer Configuration */}
      {settings.enableBankTransfer !== false && (
        <div className="bg-[#FAF9F0] border border-[#E5E2D0] rounded-3xl p-5 sm:p-6 space-y-5">
          <div className="flex items-center justify-between">
            <h4 className="text-xs font-bold text-[#5A5A40] uppercase tracking-wider flex items-center gap-2">
              <Landmark className="w-4 h-4 text-[#7D8C7A]" />
              Datos de la Cuenta Bancaria Principal:
            </h4>
            <span className="text-[10px] text-stone-500 font-serif italic">
              Se muestra con botones para copiar al portapapeles
            </span>
          </div>

          {/* Preset Bank Quick Selectors */}
          <div>
            <label className="text-[11px] font-semibold text-stone-700 block mb-1.5">
              Selección Rápida de Institución Bancaria:
            </label>
            <div className="flex flex-wrap gap-1.5">
              {[
                'BBVA',
                'Santander',
                'Nu México',
                'Citibanamex',
                'Banorte',
                'HSBC',
                'Scotiabank',
                'Mercado Pago',
                'BCP (Perú)',
                'Interbank',
                'BBVA Perú',
                'Bancolombia',
              ].map((bank) => (
                <button
                  key={bank}
                  type="button"
                  onClick={() => onChange({ bankName: bank })}
                  className={`px-3 py-1 rounded-full text-[11px] font-medium border transition-all cursor-pointer ${
                    (settings.bankName || 'BBVA').toLowerCase().includes(bank.toLowerCase().split(' ')[0])
                      ? 'bg-[#5A5A40] text-white border-[#5A5A40] shadow-xs'
                      : 'bg-white text-[#3D3D3D] border-[#E5E2D0] hover:border-[#7D8C7A]'
                  }`}
                >
                  {bank}
                </button>
              ))}
            </div>
          </div>

          {/* Bank Form Fields */}
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3.5">
            <div>
              <label className="text-[11px] font-semibold text-stone-700 block mb-1">
                Nombre del Banco:
              </label>
              <input
                type="text"
                placeholder="Ej. BBVA México o Santander"
                value={settings.bankName || ''}
                onChange={(e) =>
                  onChange({ bankName: e.target.value })
                }
                className="w-full bg-white border border-[#E5E2D0] rounded-xl px-3.5 py-2 text-xs text-[#3D3D3D] focus:outline-none focus:border-[#5A5A40]"
              />
            </div>

            <div>
              <label className="text-[11px] font-semibold text-stone-700 block mb-1">
                Titular / Beneficiario:
              </label>
              <input
                type="text"
                placeholder="Ej. Sofía Ruiz & Alejandro Morales"
                value={settings.bankBeneficiary || ''}
                onChange={(e) =>
                  onChange({ bankBeneficiary: e.target.value })
                }
                className="w-full bg-white border border-[#E5E2D0] rounded-xl px-3.5 py-2 text-xs text-[#3D3D3D] focus:outline-none focus:border-[#5A5A40]"
              />
            </div>

            <div>
              <label className="text-[11px] font-semibold text-stone-700 block mb-1">
                CLABE Interbancaria (18 dígitos) / CCI:
              </label>
              <input
                type="text"
                placeholder="012 180 015487965412"
                value={settings.bankClabe || ''}
                onChange={(e) =>
                  onChange({ bankClabe: e.target.value })
                }
                className="w-full bg-white border border-[#E5E2D0] rounded-xl px-3.5 py-2 text-xs font-mono text-[#3D3D3D] focus:outline-none focus:border-[#5A5A40]"
              />
            </div>

            <div>
              <label className="text-[11px] font-semibold text-stone-700 block mb-1">
                Número de Cuenta:
              </label>
              <input
                type="text"
                placeholder="1548796541"
                value={settings.bankAccountNumber || ''}
                onChange={(e) =>
                  onChange({ bankAccountNumber: e.target.value })
                }
                className="w-full bg-white border border-[#E5E2D0] rounded-xl px-3.5 py-2 text-xs font-mono text-[#3D3D3D] focus:outline-none focus:border-[#5A5A40]"
              />
            </div>

            <div>
              <label className="text-[11px] font-semibold text-stone-700 block mb-1">
                Número de Tarjeta (16 dígitos):
              </label>
              <input
                type="text"
                placeholder="4152 3138 9012 4589"
                value={settings.bankCardNumber || ''}
                onChange={(e) =>
                  onChange({ bankCardNumber: e.target.value })
                }
                className="w-full bg-white border border-[#E5E2D0] rounded-xl px-3.5 py-2 text-xs font-mono text-[#3D3D3D] focus:outline-none focus:border-[#5A5A40]"
              />
            </div>

            <div>
              <label className="text-[11px] font-semibold text-stone-700 block mb-1">
                Concepto Sugerido / Moneda:
              </label>
              <div className="grid grid-cols-2 gap-2">
                <input
                  type="text"
                  placeholder="Mis XV Valeria Montserrat"
                  value={settings.bankConcept || ''}
                  onChange={(e) =>
                    onChange({ bankConcept: e.target.value })
                  }
                  className="w-full bg-white border border-[#E5E2D0] rounded-xl px-3 py-2 text-xs text-[#3D3D3D] focus:outline-none focus:border-[#5A5A40]"
                />
                <select
                  value={settings.bankCurrency || 'MXN'}
                  onChange={(e) =>
                    onChange({ bankCurrency: e.target.value })
                  }
                  className="w-full bg-white border border-[#E5E2D0] rounded-xl px-2 py-2 text-xs text-[#3D3D3D] focus:outline-none focus:border-[#5A5A40] cursor-pointer"
                >
                  <option value="MXN">MXN ($)</option>
                  <option value="USD">USD ($)</option>
                  <option value="EUR">EUR (€)</option>
                  <option value="PEN">PEN (S/)</option>
                  <option value="CLP">CLP ($)</option>
                  <option value="COP">COP ($)</option>
                </select>
              </div>
            </div>
          </div>

          {/* Live Interactive Bank Card Preview */}
          <div className="p-4 bg-white rounded-2xl border border-[#E5E2D0] shadow-xs space-y-3">
            <div className="flex items-center justify-between border-b border-stone-100 pb-2">
              <span className="text-[10px] uppercase font-bold tracking-widest text-[#5A5A40] flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-[#7D8C7A]" />
                Vista Previa Interactiva de la Tarjeta Bancaria (Como la verá el invitado):
              </span>
              <span className="text-[10px] text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full font-medium">
                Botones de copia activos
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3 pt-1">
              {/* Bank & Titular */}
              <div className="p-3 bg-[#FAF9F0] rounded-xl border border-[#E5E2D0]">
                <span className="text-[10px] text-stone-500 block uppercase font-medium">Banco & Titular</span>
                <p className="text-xs font-bold text-[#1a1a1a] mt-0.5">{settings.bankName || 'Banco Principal'}</p>
                <p className="text-[11px] text-stone-600 truncate">{settings.bankBeneficiary || 'Sofía & Alejandro'}</p>
              </div>

              {/* CLABE */}
              {settings.bankClabe && (
                <div className="p-3 bg-[#FAF9F0] rounded-xl border border-[#E5E2D0] flex items-center justify-between gap-2">
                  <div className="min-w-0">
                    <span className="text-[10px] text-stone-500 block uppercase font-medium">CLABE Interbancaria</span>
                    <p className="text-xs font-mono font-bold text-[#1a1a1a] truncate mt-0.5">{settings.bankClabe}</p>
                  </div>
                  <button
                    type="button"
                    onClick={() => handleCopyBankPreview(settings.bankClabe || '', 'clabe')}
                    className="px-2.5 py-1 bg-white border border-[#E5E2D0] hover:bg-stone-50 text-[10px] font-semibold rounded-lg text-[#5A5A40] flex items-center gap-1 cursor-pointer shrink-0 transition-colors shadow-2xs"
                  >
                    {copiedKey === 'clabe' ? (
                      <>
                        <CheckCircle className="w-3 h-3 text-emerald-600" />
                        <span className="text-emerald-700">Copiado</span>
                      </>
                    ) : (
                      <>
                        <Copy className="w-3 h-3" />
                        <span>Copiar</span>
                      </>
                    )}
                  </button>
                </div>
              )}

              {/* Account Number */}
              {settings.bankAccountNumber && (
                <div className="p-3 bg-[#FAF9F0] rounded-xl border border-[#E5E2D0] flex items-center justify-between gap-2">
                  <div className="min-w-0">
                    <span className="text-[10px] text-stone-500 block uppercase font-medium">No. Cuenta</span>
                    <p className="text-xs font-mono font-bold text-[#1a1a1a] truncate mt-0.5">{settings.bankAccountNumber}</p>
                  </div>
                  <button
                    type="button"
                    onClick={() => handleCopyBankPreview(settings.bankAccountNumber || '', 'account')}
                    className="px-2.5 py-1 bg-white border border-[#E5E2D0] hover:bg-stone-50 text-[10px] font-semibold rounded-lg text-[#5A5A40] flex items-center gap-1 cursor-pointer shrink-0 transition-colors shadow-2xs"
                  >
                    {copiedKey === 'account' ? (
                      <>
                        <CheckCircle className="w-3 h-3 text-emerald-600" />
                        <span className="text-emerald-700">Copiado</span>
                      </>
                    ) : (
                      <>
                        <Copy className="w-3 h-3" />
                        <span>Copiar</span>
                      </>
                    )}
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* 3.2 Envelope Gift Message */}
      {settings.enableEnvelopeGift !== false && (
        <div className="bg-[#FAF9F0] border border-[#E5E2D0] rounded-3xl p-5 space-y-2">
          <label className="text-xs font-bold text-[#5A5A40] flex items-center justify-between">
            <span>Mensaje para Lluvia de Sobres (Efectivo en Recepción):</span>
            <span className="text-[10px] font-normal text-stone-500">Cofre de deseos en el salón</span>
          </label>
          <textarea
            rows={2}
            placeholder="Ej. Si deseas tener un detalle con nosotros, dispondremos de un cofre especial de sobres en la recepción para tus mejores deseos."
            value={settings.envelopeGiftMessage || ''}
            onChange={(e) =>
              onChange({ envelopeGiftMessage: e.target.value })
            }
            className="w-full bg-white border border-[#E5E2D0] rounded-xl p-3 text-xs text-[#3D3D3D] focus:outline-none focus:border-[#5A5A40] resize-none"
          />
        </div>
      )}

      {/* 3.3 Store Registries (Liverpool, Amazon, etc.) */}
      {settings.enableStoreRegistry !== false && (
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <label className="text-xs font-bold text-[#1a1a1a]">
              Mesas de Regalo en Tiendas Departamentales / Deseos Especiales:
            </label>
            <button
              type="button"
              onClick={() => setShowAddStoreModal(true)}
              className="px-3 py-1.5 rounded-full bg-[#5A5A40] hover:bg-[#484833] text-white text-[11px] font-semibold flex items-center gap-1 cursor-pointer transition-colors shadow-2xs"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Agregar Tienda / Mesa</span>
            </button>
          </div>

          {/* List of custom stores */}
          {getParsedStoreItems().length === 0 ? (
            <div className="p-4 bg-[#FAF9F0] border border-dashed border-[#E5E2D0] rounded-2xl text-center text-xs text-[#7D8C7A]">
              No has agregado tiendas departamentales aún. Puedes agregar Liverpool, Amazon, El Palacio de Hierro o tus Deseos Especiales.
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
              {getParsedStoreItems().map((item, idx) => (
                <div
                  key={item.id || idx}
                  className="p-3.5 bg-[#FAF9F0] rounded-2xl border border-[#E5E2D0] flex flex-col justify-between space-y-2 relative"
                >
                  <div>
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-[#1a1a1a]">
                        {item.storeName || item.title}
                      </span>
                      <button
                        type="button"
                        onClick={() => handleRemoveStoreItem(idx)}
                        className="text-stone-400 hover:text-rose-600 p-1 transition-colors cursor-pointer"
                        title="Eliminar"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                    {item.eventNumber && (
                      <span className="text-[10px] font-mono text-[#5A5A40] bg-white px-2 py-0.5 rounded-md border border-[#E5E2D0] inline-block mt-1">
                        Evento #{item.eventNumber}
                      </span>
                    )}
                    {item.description && (
                      <p className="text-[11px] text-stone-500 mt-1 line-clamp-2">{item.description}</p>
                    )}
                  </div>

                  {item.url && (
                    <a
                      href={item.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-[10px] text-[#5A5A40] hover:underline flex items-center gap-1 font-semibold pt-1 border-t border-stone-200/60"
                    >
                      <ExternalLink className="w-3 h-3" />
                      <span>Ver mesa en {item.storeName}</span>
                    </a>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Add Store Registry Modal */}
      {showAddStoreModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-900/60 backdrop-blur-sm">
          <div className="bg-[#FDFCF0] border border-[#E5E2D0] rounded-3xl p-6 sm:p-8 max-w-md w-full shadow-2xl text-[#3D3D3D] relative space-y-4">
            <button
              onClick={() => setShowAddStoreModal(false)}
              className="absolute top-5 right-5 text-[#5A5A40] hover:text-[#1a1a1a] text-xl font-light w-8 h-8 rounded-full flex items-center justify-center hover:bg-white border border-transparent hover:border-[#E5E2D0] cursor-pointer transition-colors"
            >
              &times;
            </button>

            <div>
              <h3 className="text-lg font-serif font-bold text-[#1a1a1a]">
                Agregar Mesa de Regalos / Tienda
              </h3>
              <p className="text-xs text-[#7D8C7A] mt-0.5">
                Liverpool, Amazon, Palacio de Hierro, Zankyou o Viaje de XV Años.
              </p>
            </div>

            <div className="space-y-3">
              <div>
                <label className="text-xs font-semibold text-[#5A5A40] block mb-1">
                  Nombre de la Tienda / Servicio:
                </label>
                <div className="flex flex-wrap gap-1 mb-1.5">
                  {['Liverpool', 'Amazon', 'Palacio de Hierro', 'Viaje de XV Años', 'Zankyou', 'Falabella'].map((st) => (
                    <button
                      key={st}
                      type="button"
                      onClick={() => setNewStoreName(st)}
                      className={`px-2.5 py-0.5 text-[10px] rounded-full border transition-all cursor-pointer ${
                        newStoreName === st
                          ? 'bg-[#5A5A40] text-white border-[#5A5A40]'
                          : 'bg-white border-[#E5E2D0] text-[#3D3D3D]'
                      }`}
                    >
                      {st}
                    </button>
                  ))}
                </div>
                <input
                  type="text"
                  placeholder="Ej. Liverpool"
                  value={newStoreName}
                  onChange={(e) => setNewStoreName(e.target.value)}
                  className="w-full bg-[#FAF9F0] border border-[#E5E2D0] rounded-xl px-3 py-2 text-xs text-[#3D3D3D] focus:outline-none focus:border-[#5A5A40]"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-[#5A5A40] block mb-1">
                  Número de Evento / Código de Mesa:
                </label>
                <input
                  type="text"
                  placeholder="Ej. 51489632"
                  value={newEventNumber}
                  onChange={(e) => setNewEventNumber(e.target.value)}
                  className="w-full bg-[#FAF9F0] border border-[#E5E2D0] rounded-xl px-3 py-2 text-xs font-mono text-[#3D3D3D] focus:outline-none focus:border-[#5A5A40]"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-[#5A5A40] block mb-1">
                  Enlace Directo de la Mesa de Regalos:
                </label>
                <input
                  type="url"
                  placeholder="https://mesaderegalos.liverpool.com.mx/..."
                  value={newItemUrl}
                  onChange={(e) => setNewItemUrl(e.target.value)}
                  className="w-full bg-[#FAF9F0] border border-[#E5E2D0] rounded-xl px-3 py-2 text-xs text-[#3D3D3D] focus:outline-none focus:border-[#5A5A40]"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-[#5A5A40] block mb-1">
                  Descripción o Mensaje Breve (Opcional):
                </label>
                <input
                  type="text"
                  placeholder="Ej. Mesa oficial para nuestro nuevo hogar"
                  value={newItemDescription}
                  onChange={(e) => setNewItemDescription(e.target.value)}
                  className="w-full bg-[#FAF9F0] border border-[#E5E2D0] rounded-xl px-3 py-2 text-xs text-[#3D3D3D] focus:outline-none focus:border-[#5A5A40]"
                />
              </div>

              <button
                type="button"
                onClick={handleAddStoreItem}
                className="w-full py-3 rounded-full bg-[#5A5A40] hover:bg-[#484833] text-white text-xs font-semibold shadow-sm transition-all cursor-pointer mt-3"
              >
                Guardar Tienda en Mesa de Regalos
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
