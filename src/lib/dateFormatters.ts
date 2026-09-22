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
 * Universal date parser that reliably parses any date input:
 * - YYYY-MM-DD, YYYY.MM.DD, YYYY/MM/DD
 * - DD.MM.YYYY, DD/MM/YYYY, DD-MM-YYYY
 * - Spanish textual dates: "12 de Diciembre de 2026", "12 Diciembre 2026"
 * - ISO formats and Date instances
 * - Configurable time (24h or 12h AM/PM, with or without seconds)
 */
export function parseEventTargetDate(
  dateInput: string | Date | undefined,
  timeInput?: string | undefined,
  fallbackText?: string
): Date {
  const str =
    (typeof dateInput === 'string' ? dateInput.trim() : '') ||
    (typeof fallbackText === 'string' ? fallbackText.trim() : '') ||
    '2026-11-28';

  let hours = 17;
  let minutes = 0;
  let seconds = 0;

  if (timeInput && typeof timeInput === 'string') {
    const t = timeInput.trim();
    const isPM = /pm/i.test(t);
    const isAM = /am/i.test(t);
    const cleanTime = t.replace(/[^\d:]/g, '');
    const tParts = cleanTime.split(':').map((n) => parseInt(n, 10));
    if (tParts.length >= 2 && !isNaN(tParts[0]) && !isNaN(tParts[1])) {
      hours = tParts[0];
      minutes = tParts[1];
      if (tParts.length >= 3 && !isNaN(tParts[2])) {
        seconds = tParts[2];
      }
      if (isPM && hours < 12) hours += 12;
      if (isAM && hours === 12) hours = 0;
    }
  }

  if (dateInput instanceof Date && !isNaN(dateInput.getTime())) {
    return new Date(dateInput.getFullYear(), dateInput.getMonth(), dateInput.getDate(), hours, minutes, seconds);
  }

  // 1. Direct standard YYYY-MM-DD or YYYY.MM.DD or YYYY/MM/DD (with optional spaces)
  const ymdMatch = str.match(/^(\d{4})\s*[-\.\/]\s*(\d{1,2})\s*[-\.\/]\s*(\d{1,2})/);
  if (ymdMatch) {
    const y = parseInt(ymdMatch[1], 10);
    const m = parseInt(ymdMatch[2], 10);
    const d = parseInt(ymdMatch[3], 10);
    return new Date(y, m - 1, d, hours, minutes, seconds);
  }

  // 2. Standard DD.MM.YYYY, DD/MM/YYYY, DD-MM-YYYY, DD.MM.YY (with optional spaces)
  const dmyMatch = str.match(/^(\d{1,2})\s*[-\.\/]\s*(\d{1,2})\s*[-\.\/]\s*(\d{2,4})/);
  if (dmyMatch) {
    const d = parseInt(dmyMatch[1], 10);
    const m = parseInt(dmyMatch[2], 10);
    let y = parseInt(dmyMatch[3], 10);
    if (y < 100) y += 2000;
    return new Date(y, m - 1, d, hours, minutes, seconds);
  }

  // 3. Spanish textual date: e.g. "Sábado, 12 de Diciembre de 2026", "12 de Diciembre de 2026", "12 Diciembre 2026"
  const spanishMatch = str.match(/(\d{1,2})\s+(?:de\s+)?([a-záéíóúñ]+)\s+(?:del?\s+)?(\d{2,4})/i);
  if (spanishMatch) {
    const d = parseInt(spanishMatch[1], 10);
    const mName = spanishMatch[2].toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');
    const mIndex = MONTHS_ES.findIndex((m) =>
      m.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').startsWith(mName.substring(0, 3))
    );
    let y = parseInt(spanishMatch[3], 10);
    if (y < 100) y += 2000;
    if (mIndex !== -1) {
      return new Date(y, mIndex, d, hours, minutes, seconds);
    }
  }

  // 4. Fallback try native Date
  const parsed = new Date(str);
  if (!isNaN(parsed.getTime())) {
    return new Date(parsed.getFullYear(), parsed.getMonth(), parsed.getDate(), hours, minutes, seconds);
  }

  return new Date(2026, 11 - 1, 28, hours, minutes, seconds);
}

export interface CountdownTimeLeft {
  days: number;
  hours: number;
  minutes: number;
  seconds: number;
  isExpired: boolean;
  totalMilliseconds: number;
}

export function calculateCountdownTimeLeft(targetDate: Date): CountdownTimeLeft {
  const now = Date.now();
  const difference = targetDate.getTime() - now;

  if (difference > 0) {
    return {
      days: Math.floor(difference / (1000 * 60 * 60 * 24)),
      hours: Math.floor((difference / (1000 * 60 * 60)) % 24),
      minutes: Math.floor((difference / (1000 * 60)) % 60),
      seconds: Math.floor((difference / 1000) % 60),
      isExpired: false,
      totalMilliseconds: difference,
    };
  }

  return {
    days: 0,
    hours: 0,
    minutes: 0,
    seconds: 0,
    isExpired: true,
    totalMilliseconds: 0,
  };
}

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

  if (!dateInput && (!customText || !customText.trim())) {
    return '28.11.2026';
  }

  try {
    const parsedDate = parseEventTargetDate(dateInput, '12:00', customText);
    const year = parsedDate.getFullYear();
    const month = parsedDate.getMonth() + 1;
    const day = parsedDate.getDate();
    const weekdayIndex = parsedDate.getDay();

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
        return `${dd}.${mm}.${aaaa}`;
    }
  } catch {
    return '28.11.2026';
  }
}
