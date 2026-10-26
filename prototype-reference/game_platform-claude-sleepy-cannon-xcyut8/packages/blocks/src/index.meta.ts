// Catalog of the blocks in this package — pure data, safe to import from Node (validator, CLI, docs).

export type { ContentItem, ContentPack, StickerPack, ShowField, PopField } from './content/types.ts';
export { CONTENT_PACKS, STICKER_PACKS, NUMBER_WORDS_EN } from './content/packs.ts';
export { SKY_BALLOONS_META } from './themes/sky-balloons.meta.ts';
export { RISE_META, RISE_DEFAULTS, type RiseConfig } from './trajectories/rise.meta.ts';
export { TAP_COLLECT_META, TAP_COLLECT_DEFAULTS, type TapCollectConfig, type ResolvedMode } from './mechanics/tap-collect.meta.ts';
export { TAP_SCORE_META, TAP_SCORE_DEFAULTS, type TapScoreConfig, type TargetKind } from './mechanics/tap-score.meta.ts';
export { NEON_POP_META } from './themes/neon-pop.meta.ts';

import { NEON_POP_META } from './themes/neon-pop.meta.ts';
import { SKY_BALLOONS_META } from './themes/sky-balloons.meta.ts';

/** Theme catalog entries by id */
export const THEME_METAS = { [SKY_BALLOONS_META.id]: SKY_BALLOONS_META, [NEON_POP_META.id]: NEON_POP_META } as const;
