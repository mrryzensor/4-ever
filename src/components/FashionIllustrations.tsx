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

/** Lightweight editorial menswear illustration: tailored shapes, natural proportions, no raster assets. */
export const ManFashionIllustration: React.FC<ManFashionIllustrationProps> = ({
  suitColor,
  shirtColor = '#F7F5EF',
  tieColor = '#465247',
  outfitType,
  showShoes = true,
  lightweight = false,
}) => {
  const id = React.useId().replace(/:/g, '');
  const jacketDark = shade(suitColor, -30);
  const jacketLight = shade(suitColor, 22);
  const isGuayabera = outfitType === 'guayabera';

  return (
    <div className={`relative mx-auto flex aspect-[1/2.05] w-full max-w-[220px] items-center justify-center select-none sm:max-w-[240px] ${lightweight ? '' : 'drop-shadow-lg'}`}>
      <svg viewBox="0 0 240 500" className="h-full w-full overflow-visible" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
        <defs>
          <linearGradient id={`suit-${id}`} x1="58" y1="112" x2="181" y2="425" gradientUnits="userSpaceOnUse">
            <stop stopColor={jacketLight} /><stop offset=".48" stopColor={suitColor} /><stop offset="1" stopColor={jacketDark} />
          </linearGradient>
          <linearGradient id={`shirt-${id}`} x1="94" y1="114" x2="143" y2="218" gradientUnits="userSpaceOnUse">
            <stop stopColor="#FFFFFF" /><stop offset="1" stopColor={shade(shirtColor, -24)} />
          </linearGradient>
          <linearGradient id={`skin-man-${id}`} x1="91" y1="45" x2="145" y2="260" gradientUnits="userSpaceOnUse">
            <stop stopColor="#F1CFB8" /><stop offset="1" stopColor="#C99076" />
          </linearGradient>
          <linearGradient id={`trousers-${id}`} x1="85" y1="294" x2="154" y2="430" gradientUnits="userSpaceOnUse">
            <stop stopColor={suitColor} /><stop offset=".52" stopColor={jacketDark} /><stop offset=".72" stopColor={jacketLight} /><stop offset="1" stopColor={jacketDark} />
          </linearGradient>
          <linearGradient id={`hair-man-${id}`} x1="98" y1="20" x2="143" y2="75" gradientUnits="userSpaceOnUse">
            <stop stopColor="#514139" /><stop offset="1" stopColor="#171413" />
          </linearGradient>
        </defs>

        <ellipse cx="120" cy="472" rx="49" ry="7" fill="#20221F" opacity=".13" />

        {/* Legs and polished shoes */}
        <path d="M87 286 Q119 297 153 286 L150 421 Q137 430 121 422 L117 342 L112 422 Q97 430 84 421 Z" fill={`url(#trousers-${id})`} stroke={jacketDark} strokeWidth="1.4" strokeLinejoin="round" />
        <path d="M99 307 96 413 M141 307 143 413" fill="none" stroke={jacketLight} strokeWidth="1.5" opacity=".45" />
        <path d="M116 349 112 419 M124 349 128 419" fill="none" stroke={jacketDark} strokeWidth="1" opacity=".55" />
        {showShoes && (
          <g>
            <path d="M84 417 Q97 425 112 419 L114 433 Q111 440 102 441 L70 441 Q65 438 71 433Z" fill="#272522" />
            <path d="M127 419 Q142 425 153 416 L170 433 Q176 438 169 441 L132 441 Q124 439 125 433Z" fill="#272522" />
            <path d="M72 436 Q92 439 112 435 M131 435 Q151 439 171 436" fill="none" stroke="#B99A62" strokeWidth="1.4" opacity=".85" />
          </g>
        )}

        {/* Neck, ears and face */}
        <path d="M105 82 L135 82 L134 118 Q120 130 106 118Z" fill={`url(#skin-man-${id})`} />
        <ellipse cx="99" cy="61" rx="5" ry="9" fill="#D9A98E" />
        <ellipse cx="141" cy="61" rx="5" ry="9" fill="#D9A98E" />
        <path d="M100 49 Q100 24 120 23 Q141 24 140 52 L137 74 Q132 91 120 91 Q107 89 102 73Z" fill={`url(#skin-man-${id})`} />
        <path d="M99 57 Q96 28 116 19 Q138 15 144 37 L141 56 Q134 44 122 43 Q111 43 101 56Z" fill={`url(#hair-man-${id})`} />
        <path d="M104 39 Q119 24 137 34" fill="none" stroke="#887065" strokeWidth="2" opacity=".45" />
        <path d="M109 60h3 M128 60h3" stroke="#47342D" strokeWidth="2.4" strokeLinecap="round" />
        <path d="M119 62 117 72 Q120 75 123 72 M113 81 Q120 85 127 81" fill="none" stroke="#A76F60" strokeWidth="1.4" strokeLinecap="round" />

        {/* Arms sit behind the jacket body for a clean, continuous silhouette. */}
        <path d="M87 126 Q76 135 72 158 L63 242 Q61 255 70 260 L80 255 L98 173 L105 148Z M153 126 Q164 135 168 158 L177 242 Q179 255 170 260 L160 255 L142 173 L135 148Z" fill={isGuayabera ? shirtColor : `url(#suit-${id})`} stroke={isGuayabera ? '#D5D0C7' : jacketDark} strokeWidth="1.5" strokeLinejoin="round" />
        <path d="M69 251 Q68 264 74 271 L82 269 L82 257Z M171 251 Q172 264 166 271 L158 269 L158 257Z" fill={`url(#skin-man-${id})`} />

        {/* Shirt and jacket / guayabera, drawn as one balanced torso. */}
        <path d="M91 116 Q103 106 120 108 Q137 106 149 116 L168 154 L155 176 L153 298 Q120 310 87 298 L85 176 L72 154Z" fill={isGuayabera ? `url(#shirt-${id})` : `url(#suit-${id})`} stroke={jacketDark} strokeWidth="1.6" strokeLinejoin="round" />
        {isGuayabera ? (
          <g>
            <path d="M101 116 120 135 139 116 134 133 120 145 106 133Z" fill="#F5F2EA" stroke="#D9D2C6" strokeWidth="1" />
            <path d="M103 145v130 M137 145v130 M109 147v126 M131 147v126" stroke="#C9C3B7" strokeWidth="1.15" opacity=".75" />
            <path d="M94 162h16v20H94z M130 162h16v20h-16z M94 211h16v20H94z M130 211h16v20h-16z" fill="#F8F6F0" stroke="#D4CEC2" strokeWidth="1" />
            {[151, 171, 191, 211, 231, 251].map((y) => <circle key={`button-${y}`} cx="120" cy={y} r="1.6" fill="#B99A62" />)}
          </g>
        ) : (
          <g>
            <path d="M101 113 120 132 139 113 134 151 120 172 106 151Z" fill={`url(#shirt-${id})`} stroke="#D6D1C7" strokeWidth="1" />
            {outfitType === 'tuxedo' ? (
              <g fill={tieColor} stroke={shade(tieColor, -25)} strokeWidth=".7">
                <path d="m111 132-11-8q-3 8 0 15l11-3Zm18 0 11-8q3 8 0 15l-11-3Z" />
                <rect x="116" y="128" width="8" height="9" rx="2" />
              </g>
            ) : (
              <path d="m115 132 5-4 5 4-2 9 7 39-10 12-10-12 7-39Z" fill={tieColor} stroke={shade(tieColor, -28)} strokeWidth=".8" />
            )}
            <path d="M101 114 86 151 111 178 119 143 112 126Z M139 114 154 151 129 178 121 143 128 126Z" fill={outfitType === 'tuxedo' ? '#18212B' : `url(#suit-${id})`} stroke={jacketDark} strokeWidth="1.2" strokeLinejoin="round" />
            <path d="M87 151 105 163 M153 151 135 163" stroke={jacketLight} strokeWidth="1.5" opacity=".7" />
            <path d="M137 177h13v4h-13Z" fill={jacketDark} />
            <path d="m140 179 4-8 4 8Z" fill="#F2E7CC" />
            {[205, 224].map((y) => <circle key={`coat-button-${y}`} cx="122" cy={y} r="2" fill="#D2B56F" />)}
            {outfitType === 'tuxedo' && <path d="M91 123 103 115l12 24-9 15Zm58 0-12-8-12 24 9 15Z" fill="#131923" stroke="#C7A65B" strokeWidth=".8" />}
          </g>
        )}
        <path d="M89 292 Q120 302 151 292" fill="none" stroke={jacketLight} strokeWidth="1.4" opacity=".5" />
      </svg>
      <FigureBadge dark>Caballero</FigureBadge>
    </div>
  );
};

/** Elegant full-length eveningwear figure, drawn as compact editorial SVG. */
export const WomanFashionIllustration: React.FC<WomanFashionIllustrationProps> = ({
  dressColor,
  accessoryColor = '#C5A059',
  outfitType,
  showShoes = true,
  lightweight = false,
}) => {
  const id = React.useId().replace(/:/g, '');
  const dark = shade(dressColor, -34);
  const light = shade(dressColor, 28);
  const isCocktail = outfitType === 'cocktail';
  const isJumpsuit = outfitType === 'jumpsuit';
  const isBoho = outfitType === 'boho';

  return (
    <div className={`relative mx-auto flex aspect-[1/2.05] w-full max-w-[220px] items-center justify-center select-none sm:max-w-[240px] ${lightweight ? '' : 'drop-shadow-lg'}`}>
      <svg viewBox="0 0 240 500" className="h-full w-full overflow-visible" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
        <defs>
          <linearGradient id={`gown-${id}`} x1="66" y1="137" x2="184" y2="434" gradientUnits="userSpaceOnUse">
            <stop stopColor={light} /><stop offset=".42" stopColor={dressColor} /><stop offset="1" stopColor={dark} />
          </linearGradient>
          <linearGradient id={`skin-woman-${id}`} x1="83" y1="42" x2="158" y2="250" gradientUnits="userSpaceOnUse">
            <stop stopColor="#F4D4C2" /><stop offset="1" stopColor="#CA9079" />
          </linearGradient>
          <linearGradient id={`hair-woman-${id}`} x1="89" y1="20" x2="148" y2="207" gradientUnits="userSpaceOnUse">
            <stop stopColor="#554034" /><stop offset=".55" stopColor="#30231D" /><stop offset="1" stopColor="#171311" />
          </linearGradient>
          <linearGradient id={`metal-${id}`} x1="101" y1="174" x2="146" y2="245" gradientUnits="userSpaceOnUse">
            <stop stopColor="#FFF0B8" /><stop offset=".48" stopColor={accessoryColor} /><stop offset="1" stopColor={shade(accessoryColor, -30)} />
          </linearGradient>
        </defs>

        <ellipse cx="120" cy="472" rx="50" ry="7" fill="#211B19" opacity=".12" />

        {/* Back hair frames the face and falls softly behind the shoulders. */}
        <path d="M91 62 Q85 20 116 17 Q151 17 148 62 L153 145 Q151 179 137 202 L99 201 Q83 177 87 143Z" fill={`url(#hair-woman-${id})`} />
        {/* Legs and shoes remain visible below a midi hem; the long gown ends at the floor. */}
        {!isJumpsuit && (isCocktail ? (
          <g fill={`url(#skin-woman-${id})`}>
            <path d="M99 327 Q107 325 114 328 L112 424 L101 424Z" />
            <path d="M126 328 Q134 325 141 327 L139 424 L128 424Z" />
          </g>
        ) : (
          <g fill={`url(#skin-woman-${id})`}>
            <path d="M98 402 Q108 399 115 403 L113 431 L101 431Z" />
            <path d="M125 403 Q133 399 142 402 L139 431 L127 431Z" />
          </g>
        ))}
        {isJumpsuit && (
          <g fill={`url(#skin-woman-${id})`}>
            <path d="M100 354 Q108 352 115 355 L113 431 L101 431Z" />
            <path d="M125 355 Q133 352 141 354 L139 431 L127 431Z" />
          </g>
        )}
        {showShoes && (
          <g>
            <path d="M99 428 Q108 432 114 427 L120 442 Q117 447 107 447 L87 447 Q83 444 90 439Z" fill="#292522" />
            <path d="M127 427 Q135 432 143 427 L151 440 Q157 444 151 447 L130 447 Q122 446 123 441Z" fill="#292522" />
            <path d="M89 442 Q102 446 118 442 M127 442 Q141 446 154 442" fill="none" stroke={`url(#metal-${id})`} strokeWidth="1.4" />
          </g>
        )}

        {/* Face, neck and soft front hair pieces */}
        <path d="M106 81 L134 81 L134 121 Q120 132 106 121Z" fill={`url(#skin-woman-${id})`} />
        <path d="M98 51 Q98 24 120 23 Q142 24 142 53 L139 76 Q134 94 120 94 Q106 92 101 76Z" fill={`url(#skin-woman-${id})`} />
        <path d="M98 58 Q92 24 116 17 Q145 14 145 49 Q135 42 127 35 Q116 49 99 58Z" fill={`url(#hair-woman-${id})`} />
        <path d="M102 47 Q98 87 103 116 M139 45 Q145 89 139 123" fill="none" stroke="#241A16" strokeWidth="5" strokeLinecap="round" />
        <path d="M109 59h3 M128 59h3" stroke="#49342C" strokeWidth="2.3" strokeLinecap="round" />
        <path d="M119 62 117 72 Q120 75 123 72 M113 81 Q120 85 127 81" fill="none" stroke="#AE7065" strokeWidth="1.4" strokeLinecap="round" />
        <path d="M99 61 Q94 57 96 68 M141 61 Q146 57 144 68" fill="none" stroke={`url(#metal-${id})`} strokeWidth="1.5" />
        <circle cx="96" cy="69" r="2.4" fill={accessoryColor} /><circle cx="144" cy="69" r="2.4" fill={accessoryColor} />

        {/* Arms: one relaxed, one gently bent toward a small evening clutch. */}
        <path d="M91 127 Q80 135 77 155 L69 205 Q67 217 77 220 L86 215 L101 163 L108 145Z" fill={`url(#skin-woman-${id})`} />
        <path d="M149 127 Q160 136 162 155 L166 181 Q167 191 159 196 L151 191 L143 159 L135 145Z" fill={`url(#skin-woman-${id})`} />
        <path d="M74 212 Q72 222 78 229 L86 227 L86 215Z M153 187 Q150 196 156 203 L164 200 L161 190Z" fill={`url(#skin-woman-${id})`} />

        {/* Dress or jumpsuit silhouette */}
        {isJumpsuit ? (
          <g>
            <path d="M91 119 Q102 108 120 110 Q138 108 149 119 L158 153 L145 177 L151 210 Q138 221 120 216 Q102 221 89 210 L95 177 L82 153Z" fill={`url(#gown-${id})`} stroke={dark} strokeWidth="1.4" strokeLinejoin="round" />
            <path d="M99 118 120 143 141 118 134 160 120 171 106 160Z" fill="#F7F4EC" stroke="#D5CFC4" strokeWidth="1" />
            <path d="M93 210 Q120 218 147 210 L159 427 Q141 438 124 432 L120 292 L115 432 Q98 438 81 427Z" fill={`url(#gown-${id})`} stroke={dark} strokeWidth="1.5" strokeLinejoin="round" />
            <path d="M103 230 96 416 M137 230 145 416 M120 226 120 420" fill="none" stroke={light} strokeWidth="1.5" opacity=".55" />
          </g>
        ) : (
          <g>
            {/* Structured bodice and gently curved neckline */}
            <path d="M93 119 Q105 108 120 114 Q135 108 147 119 L145 190 Q132 199 120 196 Q108 199 95 190Z" fill={`url(#gown-${id})`} stroke={dark} strokeWidth="1.4" strokeLinejoin="round" />
            {isBoho ? (
              <path d="M91 121 Q105 138 120 127 Q135 138 149 121 L145 137 Q133 148 120 139 Q107 148 95 137Z" fill={light} stroke={dark} strokeWidth="1" />
            ) : (
              <path d="M94 120 Q106 140 120 126 Q134 140 146 120" fill="none" stroke={accessoryColor} strokeWidth="2.2" strokeLinecap="round" />
            )}
            <path d="M104 143 Q107 165 104 187 M136 143 Q133 165 136 187" fill="none" stroke={light} strokeWidth="1.3" opacity=".52" />
            <path d="M99 190 Q120 197 141 190 L143 201 Q120 208 97 201Z" fill={`url(#metal-${id})`} />
            {isCocktail ? (
              <path d="M97 200 Q120 207 143 200 Q151 256 171 330 Q120 352 69 330 Q89 256 97 200Z" fill={`url(#gown-${id})`} stroke={dark} strokeWidth="1.5" strokeLinejoin="round" />
            ) : (
              <path d={isBoho
                ? 'M97 200 Q120 207 143 200 Q151 257 166 321 Q182 370 192 430 Q120 447 48 430 Q58 370 74 321 Q89 257 97 200Z'
                : 'M97 200 Q120 207 143 200 Q151 260 169 333 Q183 383 190 430 Q120 445 50 430 Q57 383 71 333 Q89 260 97 200Z'}
                fill={`url(#gown-${id})`} stroke={dark} strokeWidth="1.5" strokeLinejoin="round" />
            )}
            <path d={isCocktail ? 'M87 303 Q120 316 153 303 M99 213 Q94 259 83 310 M141 213 Q146 259 157 310' : 'M87 262 Q120 276 153 262 M74 329 Q120 348 166 329 M61 402 Q120 422 179 402'} fill="none" stroke={light} strokeWidth="1.6" strokeLinecap="round" opacity=".64" />
            {isBoho && <path d="M76 331 Q120 349 164 331 M55 414 Q120 434 185 414" fill="none" stroke={accessoryColor} strokeWidth="1.3" strokeDasharray="3 4" opacity=".75" />}
            {isCocktail && <path d="M87 329 91 423 M153 329 149 423" fill="none" stroke={dark} strokeWidth="1.1" opacity=".45" />}
          </g>
        )}

        {/* Small satin clutch and fine jewelry accents */}
        <path d="M149 193 Q157 189 164 195 L171 208 Q160 217 149 208Z" fill={`url(#metal-${id})`} stroke={shade(accessoryColor, -32)} strokeWidth="1" />
        <path d="M154 194 Q159 190 164 194" fill="none" stroke="#FFF5D5" strokeWidth="1.3" />
        <circle cx="120" cy="188" r="2.2" fill={accessoryColor} />
      </svg>
      <FigureBadge>Dama</FigureBadge>
    </div>
  );
};
