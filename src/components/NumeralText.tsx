import React from 'react';

interface NumeralTextProps {
  children?: string | number | null;
  scope?: 'global' | 'countdown';
  fontFamily?: string;
}

export const NumeralText: React.FC<NumeralTextProps> = ({ children, scope = 'global', fontFamily }) => {
  const parts = String(children ?? '').split(/(\d+)/g);
  const numeralAttribute = scope === 'countdown'
    ? { 'data-countdown-numerals': '' }
    : { 'data-global-numerals': '' };
  const numeralStyle = fontFamily
    ? {
        fontFamily,
        ...(scope === 'countdown' ? { '--countdown-number-font': fontFamily } : {}),
      } as React.CSSProperties
    : undefined;

  return (
    <>
      {parts.map((part, index) => (
        /\d/.test(part)
          ? <span {...numeralAttribute} key={`${index}-${part}`} style={numeralStyle}>{part}</span>
          : part
      ))}
    </>
  );
};
