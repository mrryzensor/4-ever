const WAX_SEAL_MOTIFS: Record<string, string[]> = {
  gold: [
    'M29 72C20 59 21 43 30 30M71 72C80 59 79 43 70 30',
    'M28 61c-8-2-10-9-6-14 7 1 10 6 8 12Zm-1-18c-7-4-7-11-2-15 6 3 8 8 4 14Zm45 18c8-2 10-9 6-14-7 1-10 6-8 12Zm1-18c7-4 7-11 2-15-6 3-8 8-4 14Z',
    'M42 22h16M42 78h16',
  ],
  floral: [
    'M50 17c-7 7-7 13 0 18 7-5 7-11 0-18Zm0 48c-7 7-7 13 0 18 7-5 7-11 0-18ZM17 50c7-7 13-7 18 0-5 7-11 7-18 0Zm48 0c7-7 13-7 18 0-5 7-11 7-18 0Z',
    'M28 28Q50 12 72 28M28 72Q50 88 72 72',
  ],
  boho: [
    'M50 17v12m0 42v12M17 50h12m42 0h12M27 27l9 9m28 28 9 9m0-46-9 9m-28 28-9 9',
    'M50 31 69 50 50 69 31 50 50 31Z',
  ],
  minimal: [
    'M50 16a34 34 0 1 0 0 68 34 34 0 0 0 0-68Z',
    'M50 24v13m0 26v13M24 50h13m26 0h13',
  ],
  stars: [
    'M50 17l3.5 9.5L63 30l-9.5 3.5L50 43l-3.5-9.5L37 30l9.5-3.5L50 17Zm-22 38 2 5.5 5.5 2-5.5 2-2 5.5-2-5.5-5.5-2 5.5-2 2-5.5Zm44 0 2 5.5 5.5 2-5.5 2-2 5.5-2-5.5-5.5-2 5.5-2 2-5.5Z',
    'M33 45c8 15 26 15 34 0M35 77c10 5 20 5 30 0',
  ],
  garden: [
    'M28 76c-3-18 3-35 22-52 19 17 25 34 22 52',
    'M36 65c-8-2-11-8-9-14 8 0 12 5 11 12Zm5-19c-7-4-8-10-4-15 7 3 9 8 6 14Zm23 19c8-2 11-8 9-14-8 0-12 5-11 12Zm-5-19c7-4 8-10 4-15-7 3-9 8-6 14Z',
  ],
  crown: [
    'M27 44l8-14 15 12 15-12 8 14-4 12H31l-4-12Z',
    'M32 63h36M38 70h24M50 25v7',
  ],
  sunset: [
    'M29 53a21 21 0 0 1 42 0M25 56h50M32 34l-5-6m41 6 5-6M50 26v-8M22 67l-7 3m63-3 7 3',
    'M34 73h32m-26 6h20',
  ],
  lavender: [
    'M35 79c4-17 7-34 15-52m15 52c-4-17-7-34-15-52',
    'M46 39c-8 0-11-6-8-12 7 0 10 4 9 10Zm8 9c8 0 11-6 8-12-7 0-10 4-9 10ZM40 56c-8 0-11-6-8-12 7 0 10 4 9 10Zm20-8c-8 0-11-6-8-12 7 0 10 4 9 10ZM36 69c-7-1-9-6-6-11 6 1 8 4 7 9Zm28-13c7-1 9-6 6-11-6 1-8 4-7 9Z',
  ],
  monstera: [
    'M50 18c16 0 27 12 27 29 0 17-12 29-27 35-15-6-27-18-27-35 0-17 11-29 27-29Z',
    'M50 21v55M50 40 35 30m15 21 17-13M50 61 34 51m16 15 14-10',
  ],
  seashell: [
    'M22 69a28 28 0 0 1 56 0M50 41v28M50 42 35 69m15-27 15 27M50 44 27 62m23-18 23 18M50 47 42 69m8-22 8 22',
    'M25 72h50M34 78h32',
  ],
  'art-deco': [
    'M50 16 82 50 50 84 18 50 50 16Z',
    'M50 27 72 50 50 73 28 50 50 27Z',
    'M41 19h18M41 81h18',
  ],
};

export function getWaxSealMotifPaths(ornamentStyle?: string): string[] {
  const style = ornamentStyle?.toLowerCase() || 'gold';
  if (style.includes('floral') || style.includes('watercolor')) return WAX_SEAL_MOTIFS.floral;
  if (style.includes('boho')) return WAX_SEAL_MOTIFS.boho;
  if (style.includes('minimal')) return WAX_SEAL_MOTIFS.minimal;
  if (style.includes('star')) return WAX_SEAL_MOTIFS.stars;
  if (style.includes('garden')) return WAX_SEAL_MOTIFS.garden;
  if (style.includes('crown')) return WAX_SEAL_MOTIFS.crown;
  if (style.includes('sunset')) return WAX_SEAL_MOTIFS.sunset;
  if (style.includes('lavender')) return WAX_SEAL_MOTIFS.lavender;
  if (style.includes('monstera')) return WAX_SEAL_MOTIFS.monstera;
  if (style.includes('seashell')) return WAX_SEAL_MOTIFS.seashell;
  if (style.includes('art-deco')) return WAX_SEAL_MOTIFS['art-deco'];
  return WAX_SEAL_MOTIFS.gold;
}
