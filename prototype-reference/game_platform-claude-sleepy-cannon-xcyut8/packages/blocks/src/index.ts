// @gp/blocks — ready-made building blocks. Runtime registry: ids in game.yaml → implementations.

import type { Theme } from '@gp/core';
import { neonPop } from './themes/neon-pop.ts';
import { skyBalloons } from './themes/sky-balloons.ts';

export { TargetField, type Target, type TargetContent, type TargetSize, type FieldConfig, type FieldHooks } from './field/target-field.ts';
export { TapCollectRound } from './mechanics/tap-collect.ts';
export { TapScoreRound, type ScoreResult, type TapScoreStrings } from './mechanics/tap-score.ts';
export { rise } from './trajectories/rise.ts';
export type { Trajectory, Moving } from './trajectories/types.ts';
export * from './index.meta.ts';

export const THEMES: Record<string, Theme> = {
  [skyBalloons.id]: skyBalloons,
  [neonPop.id]: neonPop,
};
