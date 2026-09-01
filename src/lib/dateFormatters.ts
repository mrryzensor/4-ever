export type HeroDateFormatId =
  | 'dd.mm.aaaa'
  | 'dd / mm / aaaa'
  | 'dd - mm - aaaa'
  | 'dd.mm.aa'
  | 'aaaa.mm.dd'
  | 'literal-full'
  | 'literal-short'
  | 'literal-en'
  | 'custom';

export interface DateFormatOption {
  id: HeroDateFormatId;
  label: string;
  example: string;
  description: string;
}

export const DATE_FORMAT_OPTIONS: DateFormatOption[] = [
  {
    id: 'dd.mm.aaaa',
    label: 'dd.mm.aaaa (Puntos - Por Defecto)',
    example: '28.11.2026',
    description: 'Elegante, minimalista y contemporáneo',
  },
  {
    id: 'dd / mm / aaaa',
    label: 'dd / mm / aaaa (Barras espaciadas)',
    example: '28 / 11 / 2026',
    description: 'Editorial con aire clásico',
  },
  {
    id: 'dd - mm - aaaa',
    label: 'dd - mm - aaaa (Guiones espaciados)',
    example: '28 - 11 - 2026',
    description: 'Moderno y equilibrado',
  },
  {
    id: 'dd.mm.aa',
    label: 'dd.mm.aa (Año corto)',
    example: '28.11.26',
    description: 'Minimalista ultra compacto',
  },
  {
    id: 'aaaa.mm.dd',
    label: 'aaaa.mm.dd (Año primero)',
    example: '2026.11.28',
    description: 'Estilo internacional',
  },
  {
    id: 'literal-full',
    label: 'Literal Completo (Día de la semana + Fecha)',
    example: 'Sábado, 28 de Noviembre de 2026',
    description: 'Tradicional y solemne',
  },
  {
    id: 'literal-short',
    label: 'Literal Elegante (Día + Mes + Año)',
    example: '28 de Noviembre de 2026',
    description: 'Cálido y legible',
  },
  {
    id: 'literal-en',
    label: 'Literal Internacional (Inglés)',
    example: 'November 28, 2026',
    description: 'Bodas de destino o bilingües',
  },
  {
    id: 'custom',
    label: 'Texto Personalizado',
    example: 'Ej. 28 • Noviembre • 2026',
    description: 'Escribe exactamente la fecha como desees',
  },
];

const MONTHS_ES = [
  'Enero',
  'Febrero',
  'Marzo',
  'Abril',
  'Mayo',
  'Junio',
  'Julio',
  'Agosto',
  'Septiembre',
  'Octubre',
  'Noviembre',
  'Diciembre',
];

const MONTHS_EN = [
  'January',
  'February',
  'March',
  'April',
  'May',
  'June',
  'July',
  'August',
  'September',
  'October',
  'November',
  'December',
];

const WEEKDAYS_ES = [
  'Domingo',
  'Lunes',
  'Martes',
  'Miércoles',
  'Jueves',
  'Viernes',
  'Sábado',
];

/**
 * Formats wedding event date according to the selected hero format style
 */
export function formatHeroDate(
  dateInput: string | Date | undefined,
  formatStyle: string = 'dd.mm.aaaa',
  customText?: string
): string {
  if (formatStyle === 'custom' && customText && customText.trim()) {
    return customText.trim();
  }

  if (!dateInput) {
    return '28.11.2026';
  }

  try {
    let year = 2026;
    let month = 11;
    let day = 28;
    let weekdayIndex = 6;

    if (typeof dateInput === 'string') {
      const cleanDateStr = dateInput.split('T')[0];
      const parts = cleanDateStr.split('-');
      if (parts.length === 3) {
        year = parseInt(parts[0], 10);
        month = parseInt(parts[1], 10);
        day = parseInt(parts[2], 10);
        const parsedDate = new Date(year, month - 1, day);
        weekdayIndex = parsedDate.getDay();
      } else {
        const d = new Date(dateInput);
        if (!isNaN(d.getTime())) {
          year = d.getFullYear();
          month = d.getMonth() + 1;
          day = d.getDate();
          weekdayIndex = d.getDay();
        }
      }
    } else if (dateInput instanceof Date && !isNaN(dateInput.getTime())) {
      year = dateInput.getFullYear();
      month = dateInput.getMonth() + 1;
      day = dateInput.getDate();
      weekdayIndex = dateInput.getDay();
    }

    const dd = String(day).padStart(2, '0');
    const mm = String(month).padStart(2, '0');
    const aaaa = String(year);
    const aa = aaaa.slice(-2);
    const monthNameEs = MONTHS_ES[month - 1] || 'Noviembre';
    const monthNameEn = MONTHS_EN[month - 1] || 'November';
    const weekdayNameEs = WEEKDAYS_ES[weekdayIndex] || 'Sábado';

    switch (formatStyle) {
      case 'dd.mm.aaaa':
        return `${dd}.${mm}.${aaaa}`;
      case 'dd / mm / aaaa':
        return `${dd} / ${mm} / ${aaaa}`;
      case 'dd - mm - aaaa':
        return `${dd} - ${mm} - ${aaaa}`;
      case 'dd.mm.aa':
        return `${dd}.${mm}.${aa}`;
      case 'aaaa.mm.dd':
        return `${aaaa}.${mm}.${dd}`;
      case 'literal-full':
        return `${weekdayNameEs}, ${day} de ${monthNameEs} de ${aaaa}`;
      case 'literal-short':
        return `${day} de ${monthNameEs} de ${aaaa}`;
      case 'literal-en':
        return `${monthNameEn} ${day}, ${aaaa}`;
      default:
        // Default to dd.mm.aaaa
        return `${dd}.${mm}.${aaaa}`;
    }
  } catch {
    return '28.11.2026';
  }
}
