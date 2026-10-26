// Exo 2 ExtraBold (© 2013 The Exo 2 Project Authors, SIL OFL 1.1 without a Reserved Font Name:
// packages/art/fonts/OFL-Exo2.txt; source github.com/google/fonts ofl/exo2, the variable font instanced at 800): a
// technical, slightly squared sans — HUDs, readouts, labels and titles of sci-fi, shooter and racing games. One weight.
// The file (≈ 24 KB WOFF2) is cut to GAME_CHARSET by tools/subset-fonts.sh; importing this module puts it in the upload.

import type { GameFont } from '../type.ts';

export const EXO_2: GameFont = {
  family: 'Exo 2 ExtraBold',
  source: new URL('../../fonts/exo-2-extrabold.woff2', import.meta.url).href,
  weight: '100 900',
  drawWeight: 800,
  what: 'technical, slightly squared, weight 800: HUDs, readouts, labels (sci-fi, shooters, racing)',
  licence: 'OFL-1.1',
  licenceFile: 'packages/art/fonts/OFL-Exo2.txt',
};
