import React from 'react';

interface NumeralTextProps {
  children?: string | number | null;
  scope?: 'global' | 'countdown';
}

export const NumeralText: React.FC<NumeralTextProps> = ({ children, scope = 'global' }) => {
  const parts = String(children ?? '').split(/(\d+)/g);
  const numeralAttribute = scope === 'countdown'
    ? { 'data-countdown-numerals': '' }
    : { 'data-global-numerals': '' };

  return (
    <>
      {parts.map((part, index) => (
        /\d/.test(part)
          ? <span {...numeralAttribute} key={`${index}-${part}`}>{part}</span>
          : part
      ))}
    </>
  );
};
