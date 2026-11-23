import React from 'react';
import { RotateCcw, Type, Sparkles, Calendar, Quote, Users, MapPin } from 'lucide-react';
import { WeddingSettings } from '../../../types.ts';

interface HeroTypographyScaleControlsProps {
  settings: WeddingSettings;
  onChange: (updated: Partial<WeddingSettings>) => void;
  accentColor?: string;
}

interface ScaleFieldConfig {
  key: keyof WeddingSettings;
  label: string;
  help: string;
  icon: React.ComponentType<{ className?: string }>;
  sampleText: string;
  fontClass?: string;
}

export const HeroTypographyScaleControls: React.FC<HeroTypographyScaleControlsProps> = ({
  settings,
  onChange,
}) => {
  const isBirthday = settings.eventType === 'birthday';
  const isXv = settings.eventType === 'xv';

  const heroScaleFields: ScaleFieldConfig[] = [
    {
      key: 'typographyHeroNamesScale',
      label: 'Nombres Principales (Título del Hero)',
      help: 'Tamaño del nombre del festejado o pareja en la portada',
      icon: Type,
      sampleText: settings.coupleNames || (isBirthday ? 'Sofía Alvarez' : isXv ? 'Valeria Montserrat' : 'Sofía & Alejandro'),
      fontClass: 'font-serif font-bold italic',
    },
    {
      key: 'typographyHeroHeadingScale',
      label: 'Encabezado Superior / Caligráfico',
      help: 'Texto caligráfico decorativo (ej. It\'s my Birthday, Mis XV, Nuestra Boda)',
      icon: Sparkles,
      sampleText: settings.heroHeadingText?.trim() || (isBirthday ? "It's my Birthday" : isXv ? "Mis XV Años" : "Nuestra Boda"),
      fontClass: 'font-serif italic',
    },
    {
      key: 'typographyHeroInvitationScale',
      label: 'Frase de Invitación',
      help: 'Texto o frase sobre el nombre (ej. TE INVITO A CELEBRAR MI CUMPLEAÑOS)',
      icon: Sparkles,
      sampleText: settings.heroInvitationText?.trim() || (isBirthday ? 'TE INVITO A CELEBRAR MI CUMPLEAÑOS' : isXv ? 'TE INVITO A CELEBRAR MIS XV' : 'TE INVITAMOS A CELEBRAR NUESTRA BODA'),
      fontClass: 'uppercase tracking-widest font-sans font-semibold text-xs',
    },
    {
      key: 'typographyHeroDateScale',
      label: 'Fecha y Hora del Evento',
      help: 'Tamaño del bloque de fecha, día de la semana y horario en portada',
      icon: Calendar,
      sampleText: 'SÁBADO 28 NOVIEMBRE · 20:00',
      fontClass: 'uppercase tracking-wider font-sans font-bold',
    },
    {
      key: 'typographyHeroQuoteScale',
      label: 'Cita o Frase Especial del Hero',
      help: 'Tamaño de la frase célebre, dedicatoria o versículo bíblico',
      icon: Quote,
      sampleText: settings.heroQuote?.trim() || 'El amor todo lo sufre, todo lo cree, todo lo espera...',
      fontClass: 'font-serif italic',
    },
    {
      key: 'typographyHeroBadgeScale',
      label: 'Placa / Píldora de Pases (Badge VIP)',
      help: 'Tamaño de la insignia de invitados y número de pases en portada',
      icon: Users,
      sampleText: 'Pase para: Familia Rodríguez · 2 pases',
      fontClass: 'font-sans font-medium text-xs',
    },
    {
      key: 'typographyHeroLocationScale',
      label: 'Ubicación y Dirección en Portada',
      help: 'Tamaño del nombre del local y dirección si están activos en portada',
      icon: MapPin,
      sampleText: 'Local Casa Blanca · Al costado del Aeropuerto',
      fontClass: 'font-sans text-xs',
    },
  ];

  const hasCustomScales = heroScaleFields.some((f) => {
    const val = settings[f.key] as number | undefined;
    return val !== undefined && val !== 100;
  });

  const handleResetAll = () => {
    onChange({
      typographyHeroNamesScale: 100,
      typographyHeroHeadingScale: 100,
      typographyHeroInvitationScale: 100,
      typographyHeroDateScale: 100,
      typographyHeroQuoteScale: 100,
      typographyHeroBadgeScale: 100,
      typographyHeroLocationScale: 100,
    });
  };

  return (
    <div className="p-4 sm:p-5 space-y-4 border-t border-stone-200 bg-stone-50/60">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 pb-2 border-b border-stone-200">
        <div>
          <h4 className="text-xs sm:text-sm font-bold text-stone-900">
            Escala Individual de Textos del Hero (Portada)
          </h4>
          <p className="text-[11px] text-stone-500 mt-0.5">
            Ajusta el tamaño independiente de cada elemento de texto. Los cambios se reflejan en tiempo real en la portada.
          </p>
        </div>
        {hasCustomScales && (
          <button
            type="button"
            onClick={handleResetAll}
            className="self-start sm:self-auto px-3 py-1.5 rounded-lg border border-stone-300 bg-white hover:bg-stone-100 text-stone-700 text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer"
          >
            <RotateCcw className="w-3.5 h-3.5 text-stone-500" />
            <span>Restablecer a 100%</span>
          </button>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
        {heroScaleFields.map((field) => {
          const val = (settings[field.key] as number | undefined) ?? 100;
          const Icon = field.icon;
          const isModified = val !== 100;

          return (
            <div
              key={field.key}
              className={`p-3.5 rounded-xl border transition-all ${
                isModified
                  ? 'bg-white border-amber-300/80 shadow-xs ring-1 ring-amber-200/50'
                  : 'bg-white border-stone-200'
              }`}
            >
              <div className="flex items-center justify-between gap-2 mb-1">
                <div className="flex items-center gap-1.5 min-w-0">
                  <Icon className="w-3.5 h-3.5 text-stone-500 shrink-0" />
                  <span className="text-xs font-bold text-stone-800 truncate">
                    {field.label}
                  </span>
                </div>
                <span
                  className={`text-xs font-mono font-bold px-2 py-0.5 rounded-md ${
                    isModified ? 'bg-amber-100 text-amber-900' : 'bg-stone-100 text-stone-600'
                  }`}
                >
                  {val}%
                </span>
              </div>

              <p className="text-[11px] text-stone-500 mb-2">
                {field.help}
              </p>

              {/* Slider Control */}
              <div className="flex items-center gap-2 mb-2">
                <input
                  type="range"
                  min="50"
                  max="200"
                  step="1"
                  value={val}
                  onChange={(e) => onChange({ [field.key]: Number(e.target.value) })}
                  className="w-full accent-amber-600 cursor-pointer"
                  aria-label={field.label}
                />
              </div>

              {/* Quick Presets & Live Sample Preview */}
              <div className="flex items-center justify-between gap-2 pt-1.5 border-t border-stone-100 text-[10px]">
                <div className="flex items-center gap-1">
                  <button
                    type="button"
                    onClick={() => onChange({ [field.key]: Math.max(50, val - 10) })}
                    className="px-1.5 py-0.5 rounded bg-stone-100 hover:bg-stone-200 text-stone-600 font-mono font-semibold"
                    title="Reducir 10%"
                  >
                    -10%
                  </button>
                  {isModified && (
                    <button
                      type="button"
                      onClick={() => onChange({ [field.key]: 100 })}
                      className="px-1.5 py-0.5 rounded bg-amber-50 hover:bg-amber-100 text-amber-800 font-semibold"
                      title="Volver al 100%"
                    >
                      100%
                    </button>
                  )}
                  <button
                    type="button"
                    onClick={() => onChange({ [field.key]: Math.min(200, val + 10) })}
                    className="px-1.5 py-0.5 rounded bg-stone-100 hover:bg-stone-200 text-stone-600 font-mono font-semibold"
                    title="Aumentar 10%"
                  >
                    +10%
                  </button>
                </div>

                {/* Scaled Preview Sample */}
                <div className="min-w-0 max-w-[55%] text-right overflow-hidden">
                  <span
                    style={{
                      zoom: val / 100,
                      display: 'inline-block',
                      transformOrigin: 'right center',
                    }}
                    className={`text-stone-700 truncate ${field.fontClass || ''}`}
                  >
                    {field.sampleText}
                  </span>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
