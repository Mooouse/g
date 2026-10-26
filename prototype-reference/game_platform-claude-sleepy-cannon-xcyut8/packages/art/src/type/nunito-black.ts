// Nunito Black (© 2014 The Nunito Project Authors, SIL OFL 1.1 without a Reserved Font Name:
// packages/art/fonts/OFL-Nunito.txt; source github.com/google/fonts ofl/nunito, the variable font instanced at 900):
// a rounded sans at its heaviest weight — friendly UI text, cards, buttons
// and numbers of casual, idle, puzzle and cozy games. One weight.
// The file (≈ 22 KB WOFF2) is cut to GAME_CHARSET by tools/subset-fonts.sh; importing this module puts it in the upload.

import type { GameFont } from '../type.ts';

export const NUNITO_BLACK: GameFont = {
  family: 'Nunito Black',
  source: new URL('../../fonts/nunito-black.woff2', import.meta.url).href,
  weight: '100 1000',
  drawWeight: 900,
  what: 'a rounded sans at weight 900: friendly UI text, cards, buttons (casual, idle, puzzle, cozy)',
  licence: 'OFL-1.1',
  licenceFile: 'packages/art/fonts/OFL-Nunito.txt',
};
