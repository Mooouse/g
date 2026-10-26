// Catalog entry for the sky-balloons theme (pure data: read by the validator and the docs generator).

export const SKY_BALLOONS_META = {
  id: 'sky-balloons',
  description: 'Blue sky with a soft sun, drifting clouds and green hills; the tap target is a glossy balloon on a string. From "Pop the balloon!".',
  /** Target colors: rainbow order plus pink. colors-en names exactly these. */
  palette: ['#ff4b4b', '#ff9a1f', '#ffd21f', '#45c74a', '#3478f6', '#9a5ae6', '#ff6fb5'],
  background: '#7cc8f5',
  /** Menu card fills, cycled */
  cardColors: ['#fff4d6', '#e3f7df', '#ffe3ef', '#e6e8ff'],
  targetAspect: 1.18,
  targetTail: 1.6,
} as const;
