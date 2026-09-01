import React from 'react';
import {
  Shirt,
  Sparkles,
  Palette,
  Trash2,
  AlertCircle,
  Footprints,
} from 'lucide-react';
import { WeddingSettings } from '../../../types.ts';
import { WomanFashionMockup, ManFashionMockup } from '../../DressCodeSection.tsx';

interface AdminDressCodeSettingsProps {
  settings: WeddingSettings;
  onChange: (updated: Partial<WeddingSettings>) => void;
}

export const AdminDressCodeSettings: React.FC<AdminDressCodeSettingsProps> = ({
  settings,
  onChange,
}) => {
  // Helper to parse dress code palette
  const getParsedDressCodePalette = (): string[] => {
    if (Array.isArray(settings.dressCodePalette)) {
      return settings.dressCodePalette;
    }
    if (typeof settings.dressCodePalette === 'string') {
      try {
        const parsed = JSON.parse(settings.dressCodePalette);
        if (Array.isArray(parsed)) return parsed;
      } catch (e) {
        return (settings.dressCodePalette as string)
          .split(',')
          .map((s) => s.trim())
          .filter(Boolean);
      }
    }
    return ['#1C2D37', '#9E7D47', '#D4AF37', '#4A5B52', '#B26E59'];
  };

  const handleApplyDressCodePreset = (presetId: string) => {
    switch (presetId) {
      case 'black-tie':
        onChange({
          dressCode: 'Rigurosa Etiqueta (Black Tie)',
          dressCodeDescription:
            'Agradecemos su estricto apego al código de gala. Esmoquin para caballeros y vestido largo de noche para damas.',
          dressCodePalette: ['#0A0A0A', '#1A1A24', '#2C2B29', '#D4AF37', '#737B8B'],
          dressCodeWomenTitle: 'Para Ellas (Vestido Largo de Noche)',
          dressCodeWomenDescription:
            'Vestido largo hasta el suelo en telas finas (satén, terciopelo, crepé). Tonos oscuros, joyas discretas.',
          dressCodeMenTitle: 'Para Ellos (Esmoquin / Black Tie)',
          dressCodeMenDescription:
            'Esmoquin negro o azul medianoche, solapa de raso, camisa blanca de cuello diplomático, corbatín negro y zapatos de charol.',
          dressCodeWomanOutfit: 'long-gown',
          dressCodeManOutfit: 'tuxedo',
          dressCodeProhibitedColors:
            'Colores blancos, marfil, champaña y beige claro están reservados para la novia.',
          dressCodeFootwearNote:
            'Evento en salón de gala con pisos de mármol y madera pulida.',
        });
        break;
      case 'formal':
        onChange({
          dressCode: 'Formal / Traje de Noche',
          dressCodeDescription:
            'Vestimenta formal elegante. Traje oscuro para caballeros y vestido largo o midi de gala para damas.',
          dressCodePalette: ['#1C2D37', '#4A5B52', '#9E7D47', '#B26E59', '#3D2B24'],
          dressCodeWomenTitle: 'Para Ellas (Damas)',
          dressCodeWomenDescription:
            'Vestido largo o midi formal en telas elegantes. Colores vivos, pasteles o tonos joya. Accesorios sobrios.',
          dressCodeMenTitle: 'Para Ellos (Caballeros)',
          dressCodeMenDescription:
            'Traje completo en azul marino, carbón o gris oxford. Camisa de vestir, corbata y zapatos de piel.',
          dressCodeWomanOutfit: 'long-gown',
          dressCodeManOutfit: 'suit',
          dressCodeProhibitedColors:
            'Blanco, perla y marfil reservados para la novia.',
          dressCodeFootwearNote:
            'Recepción en interiores y terraza nivelada.',
        });
        break;
      case 'guayabera':
        onChange({
          dressCode: 'Guayabera Formal / Playa & Jardín',
          dressCodeDescription:
            'Etiqueta fresca y sofisticada. Guayabera de lino manga larga para caballeros y vestido fresco para damas.',
          dressCodePalette: ['#EBE6D8', '#C3B091', '#7D8C7A', '#355E3B', '#D27D2D'],
          dressCodeWomenTitle: 'Para Ellas (Vestidos Frescos & Telas Ligeras)',
          dressCodeWomenDescription:
            'Vestidos en lino, gasa, seda o georgette en cortes midi o vaporosos. Colores cálidos y estampados botánicos.',
          dressCodeMenTitle: 'Para Ellos (Guayabera de Lino Manga Larga)',
          dressCodeMenDescription:
            'Guayabera fina de lino en tonos claros (hueso, azul cielo, olivo) o blanco, pantalón formal de lino y mocasines.',
          dressCodeWomanOutfit: 'boho',
          dressCodeManOutfit: 'guayabera',
          dressCodeProhibitedColors:
            'Solo para damas: evitar vestidos completamente blancos.',
          dressCodeFootwearNote:
            'Césped y arena compacta: se recomienda tacón corrido (cuña), bloque o flats elegantes.',
        });
        break;
      case 'cocktail':
        onChange({
          dressCode: 'Cóctel / Semi-Formal',
          dressCodeDescription:
            'Elegancia moderna y dinámica. Vestido a la rodilla o traje sastre para damas y blazer con pantalón de vestir para caballeros.',
          dressCodePalette: ['#3A3B3C', '#708090', '#C5A059', '#6B8E23', '#8B0000'],
          dressCodeWomenTitle: 'Para Ellas (Vestido Cóctel / Jumpsuit)',
          dressCodeWomenDescription:
            'Vestido midi, cóctel por la rodilla o enterizo palazzo sofisticado con toques de brillo y accesorios chic.',
          dressCodeMenTitle: 'Para Ellos (Blazer & Pantalón de Vestir)',
          dressCodeMenDescription:
            'Saco sport o blazer de corte europeo, pantalón de vestir, camisa sin corbata o pañuelo de bolsillo.',
          dressCodeWomanOutfit: 'cocktail',
          dressCodeManOutfit: 'blazer',
          dressCodeProhibitedColors:
            'Tonos blancos y crudos reservados para la novia.',
          dressCodeFootwearNote:
            'Salón y jardín pavimentado.',
        });
        break;
      case 'boho':
        onChange({
          dressCode: 'Boho Chic & Romántico',
          dressCodeDescription:
            'Estilo bohemio, natural y relajado en armonía con los tonos de la naturaleza y campos abiertos.',
          dressCodePalette: ['#9A7B56', '#556B2F', '#C29B38', '#A0522D', '#D8C3A5'],
          dressCodeWomenTitle: 'Para Ellas (Boho Romántico)',
          dressCodeWomenDescription:
            'Vestidos fluidos, estampados florales o telas rústicas con texturas suaves y movimiento natural.',
          dressCodeMenTitle: 'Para Ellos (Lino & Tonos Tierra)',
          dressCodeMenDescription:
            'Pantalón de vestir beige o habano, camisa de lino con tirantes o chaleco rústico.',
          dressCodeWomanOutfit: 'boho',
          dressCodeManOutfit: 'guayabera',
          dressCodeProhibitedColors:
            'Blanco total y crema reservado para la novia.',
          dressCodeFootwearNote:
            'Jardín abierto: calzado cómodo y tacón ancho.',
        });
        break;
      default:
        break;
    }
  };

  const handleAddPaletteColor = (color: string) => {
    const current = getParsedDressCodePalette();
    if (!current.includes(color)) {
      onChange({ dressCodePalette: [...current, color] });
    }
  };

  const handleUpdatePaletteColor = (index: number, newColor: string) => {
    const current = [...getParsedDressCodePalette()];
    current[index] = newColor;
    onChange({ dressCodePalette: current });
  };

  const handleRemovePaletteColor = (index: number) => {
    const current = getParsedDressCodePalette().filter((_, i) => i !== index);
    onChange({ dressCodePalette: current });
  };

  return (
    <div className="bg-white p-4 sm:p-6 lg:p-7 rounded-2xl sm:rounded-3xl border border-[#E5E2D0] space-y-5 sm:space-y-6 shadow-sm min-w-0">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 border-b border-[#E5E2D0] pb-3.5 min-w-0">
        <div className="min-w-0">
          <h3 className="text-base sm:text-lg font-serif text-[#1a1a1a] flex items-center gap-2 font-bold truncate">
            <Shirt className="w-5 h-5 text-[#7D8C7A] shrink-0" />
            <span>Código de Vestimenta & Mockup</span>
          </h3>
          <p className="text-xs text-[#7D8C7A] mt-0.5">
            Define la etiqueta, paleta de colores sugerida y cómo se ilustrarán visualmente los atuendos.
          </p>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <span className="text-[11px] font-semibold bg-[#FAF9F0] text-[#5A5A40] border border-[#E5E2D0] px-3 py-1 rounded-full flex items-center gap-1">
            <Sparkles className="w-3.5 h-3.5 text-[#7D8C7A]" />
            Mockup Interactivo
          </span>
        </div>
      </div>

      {/* Quick Presets for Dress Code */}
      <div className="min-w-0">
        <label className="text-[11px] font-semibold text-stone-700 block mb-1.5">
          Plantillas Rápidas de Etiqueta (Auto-completar textos, paleta y atuendos):
        </label>
        <div className="flex flex-wrap gap-1.5 sm:gap-2">
          {[
            { id: 'black-tie', label: '🎩 Rigurosa Etiqueta (Black Tie)' },
            { id: 'formal', label: '👔 Formal / Traje de Noche' },
            { id: 'guayabera', label: '🌴 Guayabera Formal / Playa' },
            { id: 'cocktail', label: '🍸 Cóctel / Semi-Formal' },
            { id: 'boho', label: '🌿 Boho Chic & Romántico' },
          ].map((preset) => (
            <button
              key={preset.id}
              type="button"
              onClick={() => handleApplyDressCodePreset(preset.id)}
              className="px-2.5 sm:px-3 py-1.5 rounded-full text-xs font-medium bg-[#FAF9F0] hover:bg-[#5A5A40] hover:text-white border border-[#E5E2D0] text-[#3D3D3D] transition-all cursor-pointer shadow-2xs whitespace-nowrap"
            >
              {preset.label}
            </button>
          ))}
        </div>
      </div>

      {/* General Dress Code Details */}
      <div className="grid grid-cols-1 2xl:grid-cols-2 gap-3.5 min-w-0">
        <div className="min-w-0">
          <label className="text-[11px] font-semibold text-stone-700 block mb-1">
            Título del Código de Vestimenta:
          </label>
          <input
            type="text"
            placeholder="Ej. Formal Riguroso / Traje de Noche"
            value={settings.dressCode || ''}
            onChange={(e) =>
              onChange({ dressCode: e.target.value })
            }
            className="w-full bg-[#FAF9F0] border border-[#E5E2D0] rounded-xl px-3.5 py-2 text-xs font-semibold text-[#1a1a1a] focus:outline-none focus:border-[#5A5A40]"
          />
        </div>

        <div className="min-w-0">
          <label className="text-[11px] font-semibold text-stone-700 block mb-1">
            Mensaje o Frase para los Invitados:
          </label>
          <input
            type="text"
            placeholder="Ej. Agradecemos su puntualidad y apego al código de vestimenta."
            value={settings.dressCodeDescription || ''}
            onChange={(e) =>
              onChange({ dressCodeDescription: e.target.value })
            }
            className="w-full bg-[#FAF9F0] border border-[#E5E2D0] rounded-xl px-3.5 py-2 text-xs text-[#3D3D3D] focus:outline-none focus:border-[#5A5A40]"
          />
        </div>
      </div>

      {/* Color Palette Manager */}
      <div className="p-3.5 sm:p-4 bg-[#FAF9F0] rounded-2xl border border-[#E5E2D0] space-y-3 min-w-0">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 min-w-0">
          <div className="min-w-0">
            <span className="text-xs font-bold text-[#5A5A40] uppercase tracking-wider flex items-center gap-1.5">
              <Palette className="w-4 h-4 text-[#7D8C7A] shrink-0" />
              <span>Paleta de Colores Sugerida</span>
            </span>
            <p className="text-[11px] text-stone-500 mt-0.5 leading-tight">
              Los invitados podrán tocar cada color para ver el vestido y traje teñidos con estos tonos.
            </p>
          </div>

          {/* Add Quick Preset Colors */}
          <div className="flex items-center gap-1.5 flex-wrap shrink-0">
            <span className="text-[10px] text-stone-500 font-medium whitespace-nowrap">Agregar tono:</span>
            {['#1C2D37', '#9E7D47', '#D4AF37', '#4A5B52', '#B26E59', '#3D2B24', '#7D8C7A', '#2E3842'].map((c) => (
              <button
                key={c}
                type="button"
                onClick={() => handleAddPaletteColor(c)}
                className="w-5 h-5 rounded-full border border-white shadow-2xs hover:scale-125 transition-transform cursor-pointer shrink-0"
                style={{ backgroundColor: c }}
                title={`Agregar ${c}`}
              />
            ))}
          </div>
        </div>

        {/* Swatches List */}
        <div className="flex items-center gap-2 sm:gap-3 flex-wrap pt-1">
          {getParsedDressCodePalette().map((color, idx) => (
            <div
              key={idx}
              className="flex items-center gap-1.5 sm:gap-2 p-1.5 sm:p-2 bg-white rounded-xl border border-[#E5E2D0] shadow-2xs shrink-0"
            >
              <input
                type="color"
                value={color.startsWith('#') ? color : '#1C2D37'}
                onChange={(e) => handleUpdatePaletteColor(idx, e.target.value)}
                className="w-6 h-6 sm:w-7 sm:h-7 rounded-lg cursor-pointer border-0 p-0"
              />
              <input
                type="text"
                value={color}
                onChange={(e) => handleUpdatePaletteColor(idx, e.target.value)}
                className="w-14 sm:w-16 text-[11px] font-mono font-medium text-stone-700 bg-transparent border-0 focus:outline-none"
              />
              {getParsedDressCodePalette().length > 1 && (
                <button
                  type="button"
                  onClick={() => handleRemovePaletteColor(idx)}
                  className="text-stone-400 hover:text-rose-600 p-0.5 transition-colors cursor-pointer"
                  title="Eliminar color"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Specific Attire Customization: DAMAS & CABALLEROS */}
      <div className="grid grid-cols-1 2xl:grid-cols-2 gap-4 min-w-0">
        {/* Para Damas / Mujeres */}
        <div className="p-4 sm:p-5 bg-[#FAF9F0] rounded-2xl border border-[#E5E2D0] space-y-3.5 min-w-0">
          <div className="flex items-center gap-2 border-b border-[#E5E2D0] pb-2.5 min-w-0">
            <span className="w-2.5 h-2.5 rounded-full bg-rose-400 shrink-0 shadow-2xs" />
            <span className="text-xs font-serif font-bold text-stone-900 truncate">
              Para Ellas (Damas / Mujeres)
            </span>
          </div>

          {/* Model Selector */}
          <div className="space-y-1 min-w-0">
            <label className="text-[11px] font-semibold text-stone-700 block">
              Modelo Visual Ilustrado:
            </label>
            <select
              value={settings.dressCodeWomanOutfit || 'long-gown'}
              onChange={(e) =>
                onChange({
                  dressCodeWomanOutfit: e.target.value as any,
                })
              }
              className="w-full bg-white border border-[#E5E2D0] text-xs rounded-xl px-3 py-2 text-stone-800 font-semibold cursor-pointer shadow-2xs focus:outline-none focus:border-[#5A5A40]"
            >
              <option value="long-gown">Gala / Vestido Largo</option>
              <option value="cocktail">Midi / Cóctel</option>
              <option value="jumpsuit">Palazzo / Enterizo</option>
              <option value="boho">Boho / Fluido</option>
            </select>
          </div>

          <div className="space-y-1 min-w-0">
            <label className="text-[11px] font-semibold text-stone-700 block">
              Título de la sección:
            </label>
            <input
              type="text"
              placeholder="Para Ellas (Damas)"
              value={settings.dressCodeWomenTitle || 'Para Ellas (Damas)'}
              onChange={(e) =>
                onChange({ dressCodeWomenTitle: e.target.value })
              }
              className="w-full bg-white border border-[#E5E2D0] rounded-xl px-3 py-2 text-xs text-[#3D3D3D] focus:outline-none focus:border-[#5A5A40] shadow-2xs"
            />
          </div>

          <div className="space-y-1 min-w-0">
            <label className="text-[11px] font-semibold text-stone-700 block">
              Guía y Consejos de Vestimenta:
            </label>
            <textarea
              rows={3}
              placeholder="Vestido largo de noche o gala en telas finas (satén, crepé, seda). Evitar tonos blancos o marfil."
              value={settings.dressCodeWomenDescription || ''}
              onChange={(e) =>
                onChange({ dressCodeWomenDescription: e.target.value })
              }
              className="w-full bg-white border border-[#E5E2D0] rounded-xl p-3 text-xs text-[#3D3D3D] focus:outline-none focus:border-[#5A5A40] resize-none shadow-2xs"
            />
          </div>
        </div>

        {/* Para Caballeros / Varones */}
        <div className="p-4 sm:p-5 bg-[#FAF9F0] rounded-2xl border border-[#E5E2D0] space-y-3.5 min-w-0">
          <div className="flex items-center gap-2 border-b border-[#E5E2D0] pb-2.5 min-w-0">
            <span className="w-2.5 h-2.5 rounded-full bg-sky-500 shrink-0 shadow-2xs" />
            <span className="text-xs font-serif font-bold text-stone-900 truncate">
              Para Ellos (Caballeros / Varones)
            </span>
          </div>

          {/* Model Selector */}
          <div className="space-y-1 min-w-0">
            <label className="text-[11px] font-semibold text-stone-700 block">
              Modelo Visual Ilustrado:
            </label>
            <select
              value={settings.dressCodeManOutfit || 'suit'}
              onChange={(e) =>
                onChange({
                  dressCodeManOutfit: e.target.value as any,
                })
              }
              className="w-full bg-white border border-[#E5E2D0] text-xs rounded-xl px-3 py-2 text-stone-800 font-semibold cursor-pointer shadow-2xs focus:outline-none focus:border-[#5A5A40]"
            >
              <option value="suit">Traje Clásico</option>
              <option value="tuxedo">Esmoquin / Smoking</option>
              <option value="guayabera">Guayabera Formal</option>
              <option value="blazer">Blazer & Pantalón</option>
            </select>
          </div>

          <div className="space-y-1 min-w-0">
            <label className="text-[11px] font-semibold text-stone-700 block">
              Título de la sección:
            </label>
            <input
              type="text"
              placeholder="Para Ellos (Caballeros)"
              value={settings.dressCodeMenTitle || 'Para Ellos (Caballeros)'}
              onChange={(e) =>
                onChange({ dressCodeMenTitle: e.target.value })
              }
              className="w-full bg-white border border-[#E5E2D0] rounded-xl px-3 py-2 text-xs text-[#3D3D3D] focus:outline-none focus:border-[#5A5A40] shadow-2xs"
            />
          </div>

          <div className="space-y-1 min-w-0">
            <label className="text-[11px] font-semibold text-stone-700 block">
              Guía y Consejos de Vestimenta:
            </label>
            <textarea
              rows={3}
              placeholder="Traje formal completo en tonos oscuros (marino, carbón, gris oxford), camisa blanca o clara, corbata o moño y calzado de vestir."
              value={settings.dressCodeMenDescription || ''}
              onChange={(e) =>
                onChange({ dressCodeMenDescription: e.target.value })
              }
              className="w-full bg-white border border-[#E5E2D0] rounded-xl p-3 text-xs text-[#3D3D3D] focus:outline-none focus:border-[#5A5A40] resize-none shadow-2xs"
            />
          </div>
        </div>
      </div>

      {/* Extra Etiquette Notes */}
      <div className="grid grid-cols-1 2xl:grid-cols-2 gap-3.5 pt-1 min-w-0">
        <div className="min-w-0">
          <label className="text-[11px] font-semibold text-amber-900 block mb-1 flex items-center gap-1">
            <AlertCircle className="w-3.5 h-3.5 text-amber-700 shrink-0" />
            <span className="truncate">Colores Prohibidos / Reservados:</span>
          </label>
          <input
            type="text"
            placeholder="Ej. El color blanco, marfil y champaña claro están reservados..."
            value={settings.dressCodeProhibitedColors || ''}
            onChange={(e) =>
              onChange({ dressCodeProhibitedColors: e.target.value })
            }
            className="w-full bg-amber-50/70 border border-amber-200 rounded-xl px-3.5 py-2 text-xs text-amber-900 focus:outline-none focus:border-amber-400 shadow-2xs"
          />
        </div>

        <div className="min-w-0">
          <label className="text-[11px] font-semibold text-stone-700 block mb-1 flex items-center gap-1">
            <Footprints className="w-3.5 h-3.5 text-[#7D8C7A] shrink-0" />
            <span className="truncate">Sugerencia de Calzado / Superficie:</span>
          </label>
          <input
            type="text"
            placeholder="Ej. La recepción es en jardín con césped: sugerimos tacón corrido..."
            value={settings.dressCodeFootwearNote || ''}
            onChange={(e) =>
              onChange({ dressCodeFootwearNote: e.target.value })
            }
            className="w-full bg-[#FAF9F0] border border-[#E5E2D0] rounded-xl px-3.5 py-2 text-xs text-[#3D3D3D] focus:outline-none focus:border-[#5A5A40] shadow-2xs"
          />
        </div>
      </div>

      {/* Live Preview of Fashion Mockups in Admin */}
      <div className="p-4 sm:p-5 bg-[#FAF9F0] rounded-2xl border border-[#E5E2D0] space-y-3 min-w-0">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1.5 border-b border-[#E5E2D0] pb-2 min-w-0">
          <span className="text-xs font-bold text-[#5A5A40] flex items-center gap-1.5 min-w-0">
            <Sparkles className="w-3.5 h-3.5 text-[#7D8C7A] shrink-0" />
            <span className="truncate">Vista Previa de Ilustraciones de Moda Realistas:</span>
          </span>
          <span className="text-[10px] text-stone-500 font-mono shrink-0">
            {settings.dressCodeWomanOutfit || 'long-gown'} & {settings.dressCodeManOutfit || 'suit'}
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 items-center justify-center pt-2 min-w-0">
          {/* Woman Preview */}
          <div className="bg-white/80 rounded-2xl p-4 border border-[#E5E2D0] text-center flex flex-col items-center min-w-0">
            <span className="text-[10px] uppercase font-bold tracking-widest text-[#5A5A40] mb-2 truncate max-w-full">
              {settings.dressCodeWomenTitle || 'Para Ellas'}
            </span>
            <div className="w-48 max-w-full">
              <WomanFashionMockup
                dressColor={getParsedDressCodePalette()[0] || '#1C2D37'}
                outfitType={settings.dressCodeWomanOutfit || 'long-gown'}
              />
            </div>
          </div>

          {/* Man Preview */}
          <div className="bg-white/80 rounded-2xl p-4 border border-[#E5E2D0] text-center flex flex-col items-center min-w-0">
            <span className="text-[10px] uppercase font-bold tracking-widest text-[#5A5A40] mb-2 truncate max-w-full">
              {settings.dressCodeMenTitle || 'Para Ellos'}
            </span>
            <div className="w-48 max-w-full">
              <ManFashionMockup
                suitColor={getParsedDressCodePalette()[0] || '#1C2D37'}
                outfitType={settings.dressCodeManOutfit || 'suit'}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
