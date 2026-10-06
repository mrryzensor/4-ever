import React from 'react';

interface NumeralTextProps {
  children?: string | number | null;
}

export const NumeralText: React.FC<NumeralTextProps> = ({ children }) => {
  const parts = String(children ?? '').split(/(\d+)/g);

  return (
    <>
      {parts.map((part, index) => (
        /\d/.test(part)
          ? <span data-global-numerals="" key={`${index}-${part}`}>{part}</span>
          : part
      ))}
    </>
  );
};
