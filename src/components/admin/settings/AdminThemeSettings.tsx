import React from 'react';
import { Palette, Eye, Check, Sparkles } from 'lucide-react';
import { WeddingSettings, CardStyleId } from '../../../types.ts';
import { CARD_THEMES } from '../../../lib/themes.ts';
import { StyleSpecificDivider, FixDateAnimatedTransitionDivider } from '../../AnimatedSvgs.tsx';

interface AdminThemeSettingsProps {
  settings: WeddingSettings;
  onChange: (updated: Partial<WeddingSettings>) => void;
  onBackToInvitation?: () => void;
}

export const AdminThemeSettings: React.FC<AdminThemeSettingsProps> = ({
  settings,
  onChange,
  onBackToInvitation,
}) => {
  return (
    <div className="bg-white p-4 sm:p-6 lg:p-7 rounded-2xl sm:rounded-3xl border border-[#E5E2D0] space-y-5 sm:space-y-6 shadow-sm min-w-0">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-[#E5E2D0] pb-4">
        <div>
          <h3 className="text-lg font-serif text-[#1a1a1a] flex items-center gap-2 font-bold">
            <Palette className="w-4 h-4 text-[#7D8C7A]" />
            Atelier de Estilos & Ilustraciones Animadas (6 Diseños)
          </h3>
          <p className="text-xs text-[#7D8C7A] mt-0.5">
            Cada estilo incluye su propia paleta cromática, tipografías finas y motivos vectoriales SVG animados.
          </p>
        </div>
        {onBackToInvitation && (
          <button
            type="button"
            onClick={onBackToInvitation}
            className="px-3.5 py-1.5 rounded-full bg-[#FAF9F0] hover:bg-[#F0EEDC] text-[#5A5A40] border border-[#E5E2D0] text-xs font-semibold flex items-center gap-1.5 transition-colors self-start sm:self-auto cursor-pointer"
          >
            <Eye className="w-3.5 h-3.5 text-[#7D8C7A]" />
            <span>Ver en Invitación</span>
          </button>
        )}
      </div>

      {/* 6 Style Cards with Animated SVG Motifs */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
        {(Object.keys(CARD_THEMES) as CardStyleId[]).map((themeKey) => {
          const t = CARD_THEMES[themeKey];
          const isSelected = settings.cardStyle === themeKey;
          return (
            <button
              key={themeKey}
              type="button"
              onClick={() =>
                onChange({ cardStyle: themeKey })
              }
              className={`p-3.5 rounded-2xl border text-left transition-all cursor-pointer relative overflow-hidden flex flex-col justify-between min-w-0 ${
                isSelected
                  ? 'bg-[#FAF9F0] border-[#5A5A40] ring-2 ring-[#5A5A40]/30 shadow-md'
                  : 'bg-white border-[#E5E2D0] hover:border-[#7D8C7A] hover:shadow-xs'
              }`}
            >
              <div className="min-w-0">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-[10px] font-bold uppercase tracking-widest text-[#5A5A40] bg-[#F9F7EF] px-2 py-0.5 rounded-full border border-[#E5E2D0] truncate max-w-[120px]">
                    {t.badge}
                  </span>
                  {isSelected ? (
                    <span className="w-5 h-5 rounded-full bg-[#5A5A40] text-white flex items-center justify-center shrink-0">
                      <Check className="w-3 h-3 text-white" />
                    </span>
                  ) : (
                    <span className="w-3 h-3 rounded-full border border-stone-300 shrink-0" />
                  )}
                </div>

                <h4 className="text-sm font-serif font-bold text-[#1a1a1a] mb-1 truncate">{t.name}</h4>
                <p className="text-[11px] text-stone-500 line-clamp-2 leading-relaxed mb-3">
                  {t.description}
                </p>
              </div>

              <div className="pt-2.5 border-t border-[#E5E2D0]/60 flex items-center justify-between mt-auto">
                <div className="flex items-center gap-1.5 min-w-0">
                  <div className={`w-4 h-4 rounded-full aspect-square shrink-0 circle-badge ${t.sealBg} shadow-xs`} />
                  <span className="text-[10px] text-[#7D8C7A] font-serif italic truncate">
                    Sello {t.sealText}
                  </span>
                </div>

                <div className="w-14 h-4 flex items-center justify-end shrink-0">
                  <StyleSpecificDivider cardStyle={themeKey} className="w-12 h-3.5" color={t.accentColorHex} />
                </div>
              </div>
            </button>
          );
        })}
      </div>

      {/* Live Atelier Preview Panel of Selected Style */}
      {(() => {
        const currentT = CARD_THEMES[settings.cardStyle] || CARD_THEMES['classic-gold'];
        return (
          <div className="bg-[#FAF9F0] border border-[#E5E2D0] rounded-3xl p-5 sm:p-6 space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-bold uppercase tracking-widest text-[#5A5A40] flex items-center gap-2">
                <Sparkles className="w-3.5 h-3.5 text-[#7D8C7A]" />
                Previsualización del Estilo Activo: {currentT.name}
              </span>
              <span className="text-[10px] px-2.5 py-0.5 rounded-full bg-white border border-[#E5E2D0] font-mono text-[#7D8C7A]">
                {currentT.bgHex}
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-center bg-white p-4 rounded-2xl border border-[#E5E2D0]">
              {/* Motif Animation */}
              <div className="text-center p-3 border-b md:border-b-0 md:border-r border-[#E5E2D0]">
                <span className="text-[10px] uppercase tracking-wider text-[#7D8C7A] font-semibold block mb-2">
                  Motivo Vectorial Animado
                </span>
                <div className="h-16 flex items-center justify-center">
                  <StyleSpecificDivider cardStyle={settings.cardStyle} className="w-36 h-10" color={currentT.accentColorHex} />
                </div>
              </div>

              {/* Animated FixDate Wave Transition */}
              <div className="text-center p-3 border-b md:border-b-0 md:border-r border-[#E5E2D0]">
                <span className="text-[10px] uppercase tracking-wider text-[#7D8C7A] font-semibold block mb-1">
                  Pase de Sección Orgánico (Hero ➔ Contenido)
                </span>
                <div className="h-16 flex items-center justify-center overflow-hidden rounded-xl bg-stone-900/5 p-2">
                  <FixDateAnimatedTransitionDivider fillColor={currentT.bgHex} className="w-full h-12" />
                </div>
              </div>

              {/* Design Details */}
              <div className="p-3 text-center md:text-left space-y-1">
                <span className="text-[10px] uppercase tracking-wider text-[#7D8C7A] font-semibold block">
                  Tipografías & Acento
                </span>
                <p className="text-xs font-serif font-bold text-[#1a1a1a]">
                  {settings.coupleNames || 'Nombres de la Pareja'}
                </p>
                <div className="flex items-center gap-1.5 justify-center md:justify-start pt-1">
                  <span
                    className="w-4 h-4 rounded-full border border-stone-300 shadow-xs inline-block"
                    style={{ backgroundColor: currentT.accentColorHex }}
                    title="Color de acento"
                  />
                  <span className="font-mono text-[10px] text-stone-500">
                    {currentT.accentColorHex}
                  </span>
                </div>
              </div>
            </div>
          </div>
        );
      })()}

      {/* Wax Seal & Digital Envelope settings */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2">
        <div>
          <label className="text-xs font-semibold text-[#5A5A40] block mb-1.5">
            Monograma en Sello de Cera:
          </label>
          <input
            type="text"
            value={settings.waxSealText}
            onChange={(e) =>
              onChange({ waxSealText: e.target.value })
            }
            placeholder="Ej. I & N"
            className="w-full bg-[#FAF9F0] border border-[#E5E2D0] rounded-2xl px-3.5 py-2.5 text-xs text-[#3D3D3D] focus:outline-none focus:border-[#5A5A40]"
          />
        </div>

        <div>
          <label className="text-xs font-semibold text-[#5A5A40] block mb-1.5">
            Color del Sobre Digital:
          </label>
          <div className="flex items-center gap-2">
            <input
              type="color"
              value={settings.envelopeColor || '#5A5A40'}
              onChange={(e) =>
                onChange({ envelopeColor: e.target.value })
              }
              className="w-9 h-9 rounded-xl border border-[#E5E2D0] cursor-pointer p-0"
            />
            <span className="font-mono text-xs text-[#5A5A40]">
              {settings.envelopeColor}
            </span>
          </div>
        </div>

        <div>
          <label className="text-xs font-semibold text-[#5A5A40] block mb-1.5">
            Fecha límite RSVP:
          </label>
          <input
            type="date"
            value={settings.rsvpDeadline}
            onChange={(e) =>
              onChange({ rsvpDeadline: e.target.value })
            }
            className="w-full bg-[#FAF9F0] border border-[#E5E2D0] rounded-2xl px-3.5 py-2.5 text-xs text-[#3D3D3D] focus:outline-none focus:border-[#5A5A40]"
          />
        </div>
      </div>
    </div>
  );
};
