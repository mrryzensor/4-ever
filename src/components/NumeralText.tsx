import React, { useContext } from 'react';
import { NumberFontContext } from '../lib/NumberFontContext.ts';

interface NumeralTextProps {
  children?: string | number | null;
  scope?: 'global' | 'countdown';
  fontFamily?: string;
}

export const NumeralText: React.FC<NumeralTextProps> = ({ children, scope = 'global', fontFamily }) => {
  const globalFontFamily = useContext(NumberFontContext);
  const parts = String(children ?? '').split(/(\d+)/g);
  const numeralAttribute = scope === 'countdown'
    ? { 'data-countdown-numerals': '' }
    : { 'data-global-numerals': '' };
  const appliedFontFamily = fontFamily || (scope === 'global' ? globalFontFamily : null);
  const numeralStyle = appliedFontFamily
    ? {
        fontFamily: appliedFontFamily,
        ...(scope === 'countdown'
          ? { '--countdown-number-font': appliedFontFamily }
          : { '--invitation-numeral-font': appliedFontFamily }),
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
