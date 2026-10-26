// Dela Gothic One (© 2020 The Dela Gothic Project Authors, SIL OFL 1.1 without a Reserved Font Name:
// packages/art/fonts/OFL-DelaGothicOne.txt; source github.com/google/fonts ofl/delagothicone): a heavy display face with
// round corners — titles, big buttons, banners and scores of arcade, action and casual games. One weight.
// The file (≈ 17 KB WOFF2) is cut to GAME_CHARSET by tools/subset-fonts.sh; importing this module puts it in the upload.

import type { GameFont } from '../type.ts';

export const DELA_GOTHIC_ONE: GameFont = {
  family: 'Dela Gothic One',
  source: new URL('../../fonts/dela-gothic-one.woff2', import.meta.url).href,
  weight: '100 900',
  drawWeight: 400,
  what: 'heavy display with round corners: titles, buttons, banners, scores (arcade, action, casual)',
  licence: 'OFL-1.1',
  licenceFile: 'packages/art/fonts/OFL-DelaGothicOne.txt',
};
