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
  const dark = shade(dressColor, -28);
  const light = shade(dressColor, 24);
  const isCocktail = outfitType === 'cocktail';
  const isJumpsuit = outfitType === 'jumpsuit';
  const isBoho = outfitType === 'boho';

  return (
    <div className={`relative mx-auto flex aspect-[1/2.05] w-full max-w-[220px] items-center justify-center select-none sm:max-w-[240px] ${lightweight ? '' : 'drop-shadow-lg'}`}>
      <svg viewBox="0 0 240 500" className="h-full w-full overflow-visible" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
        <defs>
          <linearGradient id={`gown-${id}`} x1="78" y1="144" x2="167" y2="434" gradientUnits="userSpaceOnUse">
            <stop stopColor={light} /><stop offset=".48" stopColor={dressColor} /><stop offset="1" stopColor={dark} />
          </linearGradient>
          <linearGradient id={`skin-woman-${id}`} x1="91" y1="55" x2="151" y2="226" gradientUnits="userSpaceOnUse">
            <stop stopColor="#F4D6C5" /><stop offset="1" stopColor="#D19B84" />
          </linearGradient>
          <linearGradient id={`hair-woman-${id}`} x1="94" y1="20" x2="151" y2="181" gradientUnits="userSpaceOnUse">
            <stop stopColor="#594339" /><stop offset=".58" stopColor="#342720" /><stop offset="1" stopColor="#211915" />
          </linearGradient>
          <linearGradient id={`shoe-${id}`} x1="95" y1="431" x2="150" y2="447" gradientUnits="userSpaceOnUse">
            <stop stopColor="#39332F" /><stop offset="1" stopColor="#1E1C1A" />
          </linearGradient>
        </defs>

        <ellipse cx="120" cy="472" rx="50" ry="7" fill="#211B19" opacity=".12" />

        {/* Long, soft hair behind the figure */}
        <path d="M93 62 Q87 22 119 18 Q151 20 147 62 L151 128 Q149 151 137 169 L126 155 L112 169 Q96 152 89 130Z" fill={`url(#hair-woman-${id})`} />
        <path d="M101 38 Q110 24 124 25 M95 57 Q92 99 99 129 M142 55 Q146 91 140 121" fill="none" stroke="#806653" strokeWidth="2" strokeLinecap="round" opacity=".55" />

        {/* Legs only show below shorter hems; long dresses meet the shoes cleanly. */}
        {isCocktail && <g fill={`url(#skin-woman-${id})`}><path d="M101 326 Q109 330 116 327 L113 428 L101 428Z" /><path d="M125 327 Q133 330 140 326 L139 428 L127 428Z" /></g>}
        {isJumpsuit && <g fill={`url(#skin-woman-${id})`}><path d="M101 356 Q109 359 116 355 L113 429 L101 429Z" /><path d="M125 355 Q133 359 140 356 L139 429 L127 429Z" /></g>}
        {!isCocktail && !isJumpsuit && <g fill={`url(#skin-woman-${id})`}><path d="M101 412 Q109 415 116 412 L114 432 L102 432Z" /><path d="M124 412 Q132 415 139 412 L138 432 L126 432Z" /></g>}
        {showShoes && <g fill={`url(#shoe-${id})`}><path d="M101 427 Q108 432 115 427 L119 439 Q116 444 106 444 L89 444 Q85 441 92 437Z" /><path d="M126 427 Q133 432 140 427 L151 437 Q157 441 151 444 L132 444 Q124 443 124 439Z" /><path d="M91 440 Q104 443 118 439 M129 439 Q141 443 154 440" fill="none" stroke={accessoryColor} strokeWidth="1.3" /></g>}

        {/* Face, neck and a simple, softly waved hairstyle */}
        <path d="M107 82 L133 82 L133 119 Q120 128 107 119Z" fill={`url(#skin-woman-${id})`} />
        <path d="M99 51 Q100 25 120 24 Q140 25 141 52 L138 75 Q133 91 120 92 Q107 91 102 75Z" fill={`url(#skin-woman-${id})`} />
        <path d="M98 58 Q94 26 117 19 Q143 18 145 47 Q136 43 128 35 Q116 49 99 58Z" fill={`url(#hair-woman-${id})`} />
        <path d="M101 45 Q99 83 103 115 M139 44 Q143 81 138 113" fill="none" stroke="#2B201B" strokeWidth="4" strokeLinecap="round" />
        <path d="M109 59h3 M128 59h3" stroke="#49342C" strokeWidth="2" strokeLinecap="round" />
        <path d="M119 62 117 71 Q120 74 123 71 M114 80 Q120 83 126 80" fill="none" stroke="#A96F62" strokeWidth="1.25" strokeLinecap="round" />
        <circle cx="98" cy="69" r="2.2" fill={accessoryColor} /><circle cx="142" cy="69" r="2.2" fill={accessoryColor} />

        {/* Minimal bodice and soft A-line skirt */}
        <path d="M94 122 Q105 114 120 119 Q135 114 146 122 L151 180 Q138 198 120 200 Q102 198 89 180Z" fill={`url(#gown-${id})`} stroke={dark} strokeWidth="1.2" strokeLinejoin="round" />
        {isBoho ? (
          <path d="M94 126 Q107 143 120 132 Q133 143 146 126 L144 140 Q132 151 120 142 Q108 151 96 140Z" fill={light} opacity=".88" />
        ) : (
          <path d="M95 124 Q107 141 120 130 Q133 141 145 124" fill="none" stroke={accessoryColor} strokeWidth="1.8" strokeLinecap="round" />
        )}
        <path d="M101 148 Q120 157 139 148 M120 151 L120 190" fill="none" stroke={light} strokeWidth="1.2" opacity=".48" />
        <path d="M99 188 Q120 196 141 188 L143 201 Q120 208 97 201Z" fill={accessoryColor} opacity=".88" />
        <circle cx="120" cy="194" r="2" fill="#FFF4D6" />

        {isJumpsuit ? (
          <g>
            <path d="M94 199 Q120 207 146 199 L156 421 Q140 430 125 426 L120 300 L115 426 Q100 430 84 421Z" fill={`url(#gown-${id})`} stroke={dark} strokeWidth="1.3" strokeLinejoin="round" />
            <path d="M101 218 L95 411 M139 218 L145 411 M120 214 L120 414" fill="none" stroke={light} strokeWidth="1.2" opacity=".48" />
            <path d="M95 202 120 231 145 202 138 168 120 185 102 168Z" fill={`url(#gown-${id})`} stroke={dark} strokeWidth="1.1" strokeLinejoin="round" />
            <path d="M103 168 120 185 137 168" fill="none" stroke="#F4F0E8" strokeWidth="2" />
          </g>
        ) : (
          <g>
            <path d={isCocktail
              ? 'M97 199 Q120 207 143 199 Q149 248 164 326 Q120 342 76 326 Q91 248 97 199Z'
              : isBoho
                ? 'M97 199 Q120 207 143 199 Q151 267 164 332 Q179 385 188 426 Q120 440 52 426 Q61 385 76 332 Q89 267 97 199Z'
                : 'M97 199 Q120 207 143 199 Q150 265 162 328 Q176 380 183 426 Q120 440 57 426 Q64 380 78 328 Q90 265 97 199Z'}
              fill={`url(#gown-${id})`} stroke={dark} strokeWidth="1.3" strokeLinejoin="round" />
            <path d={isCocktail
              ? 'M85 316 Q120 326 155 316 M103 218 Q99 264 88 311 M137 218 Q141 264 152 311'
              : 'M87 268 Q120 279 153 268 M72 345 Q120 360 168 345 M62 407 Q120 422 178 407'}
              fill="none" stroke={light} strokeWidth="1.35" strokeLinecap="round" opacity=".56" />
            {isBoho && <path d="M77 346 Q120 360 163 346 M58 416 Q120 431 182 416" fill="none" stroke={accessoryColor} strokeWidth="1" strokeDasharray="3 4" opacity=".65" />}
          </g>
        )}

        {/* A calm, symmetrical fashion pose keeps both arms clear and connected. */}
        <path d="M94 127 C85 130 80 138 77 149 C74 161 76 174 74 187 L69 212 C67 220 69 227 74 230 Q79 233 82 228 L84 221 Q82 217 84 210 L92 181 Q96 162 105 141Z" fill={`url(#skin-woman-${id})`} />
        <path d="M146 127 C155 130 160 138 163 149 C166 161 164 174 166 187 L171 212 C173 220 171 227 166 230 Q161 233 158 228 L156 221 Q158 217 156 210 L148 181 Q144 162 135 141Z" fill={`url(#skin-woman-${id})`} />
        <path d="M79 151 C77 164 79 174 77 186 L72 212 M161 151 C163 164 161 174 163 186 L168 212" fill="none" stroke="#B77E69" strokeWidth="1.05" strokeLinecap="round" opacity=".42" />
        <path d="M73 228 Q77 231 80 227 M160 227 Q163 231 167 228" fill="none" stroke="#A96F62" strokeWidth=".9" strokeLinecap="round" opacity=".5" />
      </svg>
      <FigureBadge>Dama</FigureBadge>
    </div>
  );
};
