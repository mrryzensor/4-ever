import React from 'react';
import type { RsvpOptionalField } from '../types.ts';

interface RsvpOptionalDetailsFieldsProps {
  fields: RsvpOptionalField[];
  values: Record<string, string>;
  onChange: (id: string, value: string) => void;
  isDark: boolean;
  labelColorClass: string;
}

export const RsvpOptionalDetailsFields: React.FC<RsvpOptionalDetailsFieldsProps> = ({
  fields,
  values,
  onChange,
  isDark,
  labelColorClass,
}) => {
  if (!fields.length) return null;
  const inputClass = `w-full rounded-xl border px-4 py-3 text-base focus:outline-none focus:border-amber-600 ${
    isDark ? 'border-stone-700 bg-stone-900 text-stone-100' : 'border-stone-300 bg-white text-stone-900'
  }`;

  return (
    <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
      {fields.map((field) => (
        <label key={field.id} className={`block ${field.type === 'textarea' ? 'md:col-span-2' : ''}`}>
          <span data-typography-role="detail" className={`mb-1.5 block text-sm font-bold uppercase tracking-wider ${labelColorClass}`}>
            {field.label}
          </span>
          {field.type === 'textarea' ? (
            <textarea
              rows={3}
              data-typography-role="body"
              placeholder={field.placeholder}
              value={values[field.id] || ''}
              onChange={(event) => onChange(field.id, event.target.value)}
              className={`${inputClass} resize-y p-4`}
            />
          ) : (
            <input
              type={field.type}
              data-typography-role="body"
              placeholder={field.placeholder}
              value={values[field.id] || ''}
              onChange={(event) => onChange(field.id, event.target.value)}
              className={inputClass}
            />
          )}
        </label>
      ))}
    </div>
  );
};
