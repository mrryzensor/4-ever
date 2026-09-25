import React from 'react';
import { Sparkles } from 'lucide-react';

export interface ManFashionIllustrationProps {
  suitColor: string;
  shirtColor?: string;
  tieColor?: string;
  outfitType: 'tuxedo' | 'suit' | 'guayabera' | 'blazer';
  fabricFinish?: 'matte' | 'satin' | 'linen' | 'velvet';
  showShoes?: boolean;
  lightweight?: boolean;
}

export interface WomanFashionIllustrationProps {
  dressColor: string;
  accessoryColor?: string;
  outfitType: 'long-gown' | 'cocktail' | 'jumpsuit' | 'boho';
  fabricFinish?: 'matte' | 'satin' | 'linen' | 'velvet';
  showShoes?: boolean;
  lightweight?: boolean;
}

const shade = (hex: string, amount: number) => {
  const value = /^#?[\da-f]{6}$/i.test(hex) ? hex.replace('#', '') : '59615A';
  const channels = [0, 2, 4].map((index) => Math.max(0, Math.min(255, parseInt(value.slice(index, index + 2), 16) + amount)));
  return `#${channels.map((channel) => channel.toString(16).padStart(2, '0')).join('')}`;
};

const FigureBadge: React.FC<{ children: string; dark?: boolean }> = ({ children, dark }) => (
  <div className="absolute -bottom-3 inset-x-0 flex justify-center">
    <span className={`flex items-center gap-1 rounded-full border px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.18em] shadow-sm ${dark ? 'border-slate-600 bg-slate-800 text-white' : 'border-rose-200 bg-white text-rose-950'}`}>
      <Sparkles className="h-3 w-3 text-amber-500" />{children}
    </span>
  </div>
);

/** Clean editorial menswear silhouette; intentionally uses a small, filter-free SVG. */
export const ManFashionIllustration: React.FC<ManFashionIllustrationProps> = ({
  suitColor,
  shirtColor = '#F7F5EF',
  tieColor = '#465247',
  outfitType,
  showShoes = true,
  lightweight = false,
}) => {
  const id = React.useId().replace(/:/g, '');
  const jacketDark = shade(suitColor, -28);
  const jacketLight = shade(suitColor, 18);
  const isGuayabera = outfitType === 'guayabera';

  return (
    <div className={`relative mx-auto flex aspect-[1/2.05] w-full max-w-[220px] items-center justify-center select-none sm:max-w-[240px] ${lightweight ? '' : 'drop-shadow-lg'}`}>
      <svg viewBox="0 0 220 450" className="h-full w-full overflow-visible" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
        <defs>
          <linearGradient id={`jacket-${id}`} x1="0" y1="0" x2="1" y2="1"><stop stopColor={jacketLight}/><stop offset=".52" stopColor={suitColor}/><stop offset="1" stopColor={jacketDark}/></linearGradient>
          <linearGradient id={`shirt-${id}`} x1="0" y1="0" x2="1" y2="1"><stop stopColor="#fff"/><stop offset="1" stopColor={shade(shirtColor, -20)}/></linearGradient>
        </defs>
        <ellipse cx="110" cy="427" rx="49" ry="6" fill="#18201D" opacity=".13"/>
        {/* Shoes, legs and hands */}
        <path d="M86 342 84 403q0 12-8 19l-12 6q-4 3 1 5h43q5-3 2-8l-8-12 8-71Zm49 0 2 61q0 12 9 19l12 6q4 3-1 5h-43q-5-3-2-8l8-12-8-71Z" fill={jacketDark}/>
        {showShoes && <g fill="#262622"><path d="M65 425q14 2 21-5l10 9q5 4 5 9H65q-6-2 0-7Z"/><path d="M137 429q12 4 19-4l10 7q5 4 5 8h-43q-5-2 0-7Z"/></g>}
        <path d="M65 430h34m39 0h32" stroke="#D7C7A0" strokeWidth="1.5" opacity=".8"/>
        <path d="M74 157q-10 15-13 50l-8 71q-1 9 7 11l9-4 17-79m69-49q10 15 13 50l8 71q1 9-7 11l-9-4-17-79" fill={`url(#jacket-${id})`} stroke={jacketDark} strokeWidth="1.4" strokeLinejoin="round"/>
        <path d="M55 280q7 1 13-5l-4 20q-7 3-12-2Zm110 0q-7 1-13-5l4 20q7 3 12-2Z" fill="#D6A78F"/>
        {/* Neck and face */}
        <path d="M99 75h22v29q-11 13-22 0Z" fill="#D9A88F"/>
        <ellipse cx="110" cy="52" rx="22" ry="28" fill="#E7BDA5"/>
        <path d="M88 50q-3-31 23-32 25 1 22 31l-6-10q-16 2-31-7l-7 18Z" fill="#282421"/>
        <path d="M90 50q-7-2-5 7 2 6 7 4m36-11q7-2 5 7-2 6-7 4" fill="#E7BDA5"/>
        <path d="M101 55h1m17 0h1" stroke="#49352E" strokeWidth="2.4" strokeLinecap="round"/>
        <path d="M105 68q5 4 10 0" fill="none" stroke="#A96E63" strokeWidth="1.5" strokeLinecap="round"/>
        {/* Shirt, shoulders and tailored jacket */}
        <path d="M87 101q10-9 23-9t23 9l14 21-13 20-4 67H80l-4-67-13-20 14-21Z" fill={`url(#jacket-${id})`} stroke={jacketDark} strokeWidth="1.5" strokeLinejoin="round"/>
        <path d="m98 96 12 10 12-10 5 24-17 30-17-30Z" fill={`url(#shirt-${id})`} stroke="#D6D1C7" strokeWidth="1"/>
        {!isGuayabera && <path d={outfitType === 'tuxedo' ? 'm106 111 4-5 4 5-2 17 7 40-9 11-9-11 7-40Z' : 'm107 112 3-5 4 5-2 15 6 32-8 8-8-8 6-32Z'} fill={tieColor} stroke={shade(tieColor, -24)} strokeWidth="1"/>}
        <path d="M80 123 67 142m73-19 13 19" stroke={jacketLight} strokeWidth="2" opacity=".75"/>
        {isGuayabera ? <g fill="none" stroke={jacketDark} strokeWidth="1.4"><path d="M93 151v54m34-54v54M98 157h2m-2 12h2m-2 12h2m-2 12h2m24-36h2m-2 12h2m-2 12h2m-2 12h2"/></g> : <g fill="none" stroke={shade(suitColor, 35)} strokeWidth="1"><path d="m96 109-16 19m40-19 16 19m-25 34v63"/><path d="M90 182h7"/></g>}
        <path d="M80 209h60l-7 136q-13 6-24 0-11 6-23 0l-6-136Z" fill={`url(#jacket-${id})`} stroke={jacketDark} strokeWidth="1.5" strokeLinejoin="round"/>
        <path d="M110 211v132m0-110 4 18m-4 28 4 18" stroke={jacketLight} strokeWidth="1.3" opacity=".75"/>
        <path d="M91 229h5m-5 16h5m28-16h5m-5 16h5" stroke={jacketLight} strokeWidth="1.4" strokeLinecap="round" opacity=".8"/>
        <circle cx="115" cy="177" r="2" fill="#D8B675"/>
        {outfitType === 'tuxedo' && <path d="M82 117 97 108l12 21-10 12Zm56 0-15-9-12 21 10 12Z" fill="#18222B" stroke="#D8B675" strokeWidth="1"/>}
      </svg>
      <FigureBadge dark>Caballero</FigureBadge>
    </div>
  );
};

/** Graceful fashion silhouette with garment shapes that read clearly at small sizes. */
export const WomanFashionIllustration: React.FC<WomanFashionIllustrationProps> = ({
  dressColor,
  accessoryColor = '#C5A059',
  outfitType,
  showShoes = true,
  lightweight = false,
}) => {
  const id = React.useId().replace(/:/g, '');
  const dark = shade(dressColor, -30);
  const light = shade(dressColor, 22);
  const isLong = outfitType === 'long-gown' || outfitType === 'boho';

  return (
    <div className={`relative mx-auto flex aspect-[1/2.05] w-full max-w-[220px] items-center justify-center select-none sm:max-w-[240px] ${lightweight ? '' : 'drop-shadow-lg'}`}>
      <svg viewBox="0 0 220 450" className="h-full w-full overflow-visible" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
        <defs><linearGradient id={`dress-${id}`} x1="0" y1="0" x2="1" y2=".7"><stop stopColor={light}/><stop offset=".5" stopColor={dressColor}/><stop offset="1" stopColor={dark}/></linearGradient></defs>
        <ellipse cx="110" cy="427" rx="47" ry="6" fill="#211B19" opacity=".12"/>
        {/* Hair, head and neck */}
        <path d="M88 54q-8-34 22-36 30 2 23 42l-4 27-39 4-4-37Z" fill="#302522"/>
        <ellipse cx="110" cy="52" rx="20" ry="27" fill="#E8BDA8"/>
        <path d="M90 49q3-33 23-31 17 1 20 25-13-3-23-12-7 10-20 18Z" fill="#302522"/>
        <path d="M91 48q-8-2-6 7 1 6 7 5m36-12q8-2 6 7-1 6-7 5" fill="#E8BDA8"/>
        <path d="M102 56h1m15 0h1" stroke="#49342C" strokeWidth="2.2" strokeLinecap="round"/>
        <path d="M106 68q4 3 8 0" fill="none" stroke="#AE7065" strokeWidth="1.5" strokeLinecap="round"/>
        <path d="M100 75h20v25q-10 10-20 0Z" fill="#DCA991"/>
        {/* Arms */}
        <path d="M81 112q-9 5-13 21l-11 61q-2 9 6 11 7 1 10-8l17-55m49-30q9 5 13 21l11 61q2 9-6 11-7 1-10-8l-17-55" fill="none" stroke="#E8BDA8" strokeWidth="11" strokeLinecap="round" strokeLinejoin="round"/>
        <path d="M67 198q-4 9 2 17m84-17q4 9-2 17" fill="none" stroke="#D59A83" strokeWidth="1.2"/>
        {/* Fitted bodice */}
        <path d="M87 101q10-8 23-8t23 8l11 17-13 22-2 31H91l-2-31-13-22 11-17Z" fill={`url(#dress-${id})`} stroke={dark} strokeWidth="1.4" strokeLinejoin="round"/>
        {outfitType !== 'jumpsuit' && <path d="M91 101q8 4 19 15 11-11 19-15l-6 23-13 8-13-8Z" fill={light} opacity=".68"/>}
        <path d="M89 145q21 8 42 0" fill="none" stroke={accessoryColor} strokeWidth="2"/>
        {outfitType === 'jumpsuit' ? (
          <g>
            <path d="M88 166h44l-4 170h-13l-5-90-5 90H92Z" fill={`url(#dress-${id})`} stroke={dark} strokeWidth="1.4" strokeLinejoin="round"/>
            <path d="M94 182h31m-25 17h20m-20 18h20" stroke={light} strokeWidth="1.2" opacity=".7"/>
            <path d="M98 337 95 404m20-67 8 67" stroke="#D9A58E" strokeWidth="8" strokeLinecap="round"/>
          </g>
        ) : (
          <g>
            <path d={outfitType === 'cocktail'
              ? 'M91 166h38q7 54 23 117-40 18-80 0 15-64 19-117Z'
              : outfitType === 'boho'
                ? 'M91 166h38q12 59 40 184-27 21-59 18-32 3-59-18 28-125 40-184Z'
                : 'M91 166h38q12 62 42 187-26 23-61 20-35 3-61-20 30-125 42-187Z'}
              fill={`url(#dress-${id})`} stroke={dark} strokeWidth="1.5" strokeLinejoin="round"/>
            <path d={outfitType === 'cocktail' ? 'M84 282q26 9 52 0' : 'M60 352q50 19 100 0'} fill="none" stroke={light} strokeWidth="1.5" opacity=".75"/>
            {outfitType === 'boho' && <g fill="none" stroke={light} strokeWidth="1.2" opacity=".8"><path d="M79 236q31 16 62 0m-67 36q36 17 72 0m-79 37q43 20 86 0"/><path d="m91 168 19 20 19-20"/></g>}
            {outfitType === 'long-gown' && <path d="m110 181-4 153m0-85 11-12m-11 31 13-10" fill="none" stroke={light} strokeWidth="1.4" opacity=".75"/>}
            {outfitType === 'cocktail' && <path d="M99 283 96 405m20-122 8 122" stroke="#D9A58E" strokeWidth="8" strokeLinecap="round"/>}
          </g>
        )}
        {showShoes && <g fill="#9B7650"><path d="M92 403q9 1 14-2l5 16q-8 4-21 0-4-3 2-14Z"/><path d="M116 403q9 1 14-2l5 16q-8 4-21 0-4-3 2-14Z"/></g>}
        <path d="M92 416h23m-1 0h23" stroke={accessoryColor} strokeWidth="1.5"/>
        <circle cx="130" cy="153" r="3.3" fill={accessoryColor}/>
        {outfitType === 'boho' && <path d="M132 154q7 7 1 13" fill="none" stroke={accessoryColor} strokeWidth="1.3"/>}
      </svg>
      <FigureBadge>Dama</FigureBadge>
    </div>
  );
};
