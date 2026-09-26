import React from 'react';

interface RsvpCompanionToggleProps {
  label: string;
  checked: boolean;
  onChange: (checked: boolean) => void;
  isDark?: boolean;
  accentColor?: string;
}

export const RsvpCompanionToggle: React.FC<RsvpCompanionToggleProps> = ({
  label,
  checked,
  onChange,
  isDark = false,
  accentColor = '#5A5A40',
}) => (
  <label
    className={`flex w-full items-center justify-between gap-4 rounded-2xl border px-4 py-3.5 transition-colors cursor-pointer ${
      isDark ? 'bg-stone-900/70' : 'bg-white'
    }`}
    style={{ borderColor: checked ? accentColor : isDark ? '#44403c' : '#e7e5e4' }}
  >
    <span className={`min-w-0 break-words text-sm sm:text-base font-semibold ${isDark ? 'text-stone-100' : 'text-stone-800'}`}>
      {label}
    </span>
    <span className="relative inline-flex shrink-0 items-center">
      <input
        type="checkbox"
        checked={checked}
        onChange={(event) => onChange(event.target.checked)}
        className="peer sr-only"
        aria-label={label}
      />
      <span
        aria-hidden="true"
        className={`relative h-7 w-12 rounded-full transition-colors after:absolute after:left-1 after:top-1 after:h-5 after:w-5 after:rounded-full after:bg-white after:shadow-sm after:transition-transform after:content-[''] peer-focus-visible:outline peer-focus-visible:outline-2 peer-focus-visible:outline-offset-2 ${
          checked ? 'after:translate-x-5' : ''
        }`}
        style={{ backgroundColor: checked ? accentColor : isDark ? '#57534e' : '#d6d3d1' }}
      />
    </span>
  </label>
);
