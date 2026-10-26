// Catalog entry for the "tap-score" mechanic (pure data): a timed round of popping targets for points,
// with target kinds, a combo multiplier and a speed-up towards the end. For general audiences (13+).

import type { JsonSchema } from '@gp/core/schema';
import { RISE_DEFAULTS, RISE_META, type RiseConfig } from '../trajectories/rise.meta.ts';

export interface TargetKind {
  kind: 'normal' | 'golden' | 'spiky';
  /** Relative chance */
  weight: number;
  /** Points for popping it (before the combo multiplier) */
  score: number;
  /** Speed factor relative to normal targets */
  speed: number;
  /** For bad targets: seconds taken off the clock, and whether the combo resets */
  penalty: { time: number; combo: boolean } | null;
}

export interface TapScoreConfig {
  mechanic: 'tap-score';
  /** Round length, seconds */
  goal: { time: number };
  maxOnScreen: number;
  spawnEvery: readonly [number, number];
  prefill: number;
  /** "Go!" before the clock starts, seconds (0 — none) */
  countdown: number;
  trajectory: RiseConfig;
  /** Linear speed-up from start to end of the round: speed and spawn-rate factors at the end */
  ramp: { speed: number; spawn: number };
  target: { radius: number; min: number; max: number };
  targets: TargetKind[];
  /** A pop within `window` seconds of the previous one continues the combo; `steps` are the pops for ×2, ×3… */
  combo: { window: number; steps: number[] };
  /** "Time!" pause after the clock runs out, seconds — so ongoing taps don't hit the result screen */
  celebrateSec: number;
  /** A hand hint over a target when nothing is tapped for this long in the first round (0 — off) */
  idleHintSec: number;
}

export const TAP_SCORE_DEFAULTS: TapScoreConfig = {
  mechanic: 'tap-score',
  goal: { time: 45 },
  maxOnScreen: 8,
  spawnEvery: [0.35, 0.7],
  prefill: 3,
  countdown: 1,
  trajectory: { ...RISE_DEFAULTS, time: [3.2, 4.5], sway: 0.1 },
  ramp: { speed: 1.6, spawn: 1.4 },
  target: { radius: 0.085, min: 26, max: 70 },
  targets: [
    { kind: 'normal', weight: 88, score: 10, speed: 1, penalty: null },
    { kind: 'golden', weight: 4, score: 50, speed: 1.3, penalty: null },
    { kind: 'spiky', weight: 8, score: 0, speed: 1, penalty: { time: 3, combo: true } },
  ],
  combo: { window: 0.9, steps: [5, 10, 20, 35] },
  celebrateSec: 0.8,
  idleHintSec: 3,
};

const pair = (description: string, def: readonly [number, number]): JsonSchema => ({
  type: 'array',
  items: { type: 'number', minimum: 0 },
  minItems: 2,
  maxItems: 2,
  description,
  default: def,
});

export const TAP_SCORE_META = {
  id: 'tap-score',
  kind: 'mechanic',
  description:
    'A timed round: pop targets for points before the clock runs out. Golden targets are rare and worth more; spiky ones take time off and reset the combo; quick pops build a ×2…×5 combo; targets speed up towards the end. Missed targets just leave. Ends on a score screen with the best score.',
  schema: {
    type: 'object',
    description: 'The round: mechanic and its settings. Everything except `mechanic` has a default.',
    properties: {
      mechanic: { const: 'tap-score', description: 'Mechanic id', 'x-gp-ref': 'mechanic' },
      goal: {
        type: 'object',
        description: 'How the round ends',
        properties: { time: { type: 'integer', minimum: 10, maximum: 300, default: 45, description: 'Round length, seconds' } },
        additionalProperties: false,
      },
      maxOnScreen: { type: 'integer', minimum: 1, maximum: 16, default: TAP_SCORE_DEFAULTS.maxOnScreen, description: 'Max targets on screen at once' },
      spawnEvery: pair('Pause between spawns at the start, seconds, [min, max]', TAP_SCORE_DEFAULTS.spawnEvery),
      prefill: { type: 'integer', minimum: 0, maximum: 16, default: TAP_SCORE_DEFAULTS.prefill, description: 'Targets on screen when the round starts' },
      countdown: { type: 'number', minimum: 0, maximum: 3, default: TAP_SCORE_DEFAULTS.countdown, description: '"Go!" before the clock starts, seconds (0 — none). 1 s is enough for a short round' },
      trajectory: RISE_META.schema,
      ramp: {
        type: 'object',
        description: 'Speed-up towards the end of the round (linear): factors at the end',
        properties: {
          speed: { type: 'number', minimum: 1, maximum: 2, default: TAP_SCORE_DEFAULTS.ramp.speed, description: 'Target speed factor at the end (≤ 2)' },
          spawn: { type: 'number', minimum: 1, maximum: 2, default: TAP_SCORE_DEFAULTS.ramp.spawn, description: 'Spawn-rate factor at the end (≤ 2)' },
        },
        additionalProperties: false,
      },
      target: {
        type: 'object',
        description: 'Target size: `radius` share of the short screen side, clamped to [`min`, `max`] CSS px. The audience profile sets a floor for `min`.',
        properties: {
          radius: { type: 'number', exclusiveMinimum: 0, maximum: 0.5, default: TAP_SCORE_DEFAULTS.target.radius },
          min: { type: 'number', minimum: 10, default: TAP_SCORE_DEFAULTS.target.min },
          max: { type: 'number', minimum: 10, default: TAP_SCORE_DEFAULTS.target.max },
        },
        additionalProperties: false,
      },
      targets: {
        type: 'array',
        minItems: 1,
        maxItems: 3,
        description: 'Target kinds and their chances. A bad (spiky) target always differs by shape, not only by color.',
        items: {
          type: 'object',
          properties: {
            kind: { enum: ['normal', 'golden', 'spiky'] },
            weight: { type: 'number', exclusiveMinimum: 0, description: 'Relative chance' },
            score: { type: 'integer', minimum: 0, maximum: 1000, description: 'Points (before the combo multiplier)' },
            speed: { type: 'number', minimum: 0.5, maximum: 2, default: 1, description: 'Speed factor' },
            penalty: {
              type: 'object',
              description: 'Only for spiky targets',
              properties: {
                time: { type: 'number', minimum: 0, maximum: 10, description: 'Seconds taken off the clock' },
                combo: { type: 'boolean', description: 'Resets the combo' },
              },
              additionalProperties: false,
            },
          },
          required: ['kind', 'weight'],
          additionalProperties: false,
        },
      },
      combo: {
        type: 'object',
        properties: {
          window: { type: 'number', minimum: 0.2, maximum: 3, default: TAP_SCORE_DEFAULTS.combo.window, description: 'Seconds between pops that keep the combo' },
          steps: { type: 'array', items: { type: 'integer', minimum: 1 }, maxItems: 8, default: TAP_SCORE_DEFAULTS.combo.steps, description: 'Pops in a row for ×2, ×3, …' },
        },
        additionalProperties: false,
      },
      celebrateSec: { type: 'number', minimum: 0.3, maximum: 3, default: TAP_SCORE_DEFAULTS.celebrateSec, description: '"Time!" pause after the clock runs out' },
      idleHintSec: { type: 'number', minimum: 0, maximum: 10, default: TAP_SCORE_DEFAULTS.idleHintSec, description: 'Hand hint over a target after this many idle seconds in the first round (0 — off)' },
    },
    required: ['mechanic'],
    additionalProperties: false,
  } satisfies JsonSchema,
  example: 'round:\n  mechanic: tap-score\n  goal: { time: 45 }',
} as const;
