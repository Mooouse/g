// Catalog entry for the "tap-collect" mechanic (pure data): its settings, schema and defaults.

import type { JsonSchema } from '@gp/core/schema';
import type { ContentItem, PopField, ShowField } from '../content/types.ts';
import { RISE_DEFAULTS, RISE_META, type RiseConfig } from '../trajectories/rise.meta.ts';

export interface TapCollectConfig {
  mechanic: 'tap-collect';
  /** Targets to pop to finish the round */
  goal: number;
  maxOnScreen: number;
  spawnEvery: readonly [number, number];
  /** Targets already on screen when the round starts (no waiting) */
  prefill: number;
  trajectory: RiseConfig;
  target: { radius: number; min: number; max: number };
  /** Fireworks after the last target, s — also a buffer so an ongoing tap never lands on an ad */
  celebrateSec: number;
}

/** A mode as the round plays it: content fully expanded, all choices explicit */
export interface ResolvedMode {
  id: string;
  show: ShowField;
  pop: PopField;
  /** Pop-up text in the target's color */
  popColored: boolean;
  /** Speak the item's word */
  say: boolean;
  /** Items name the target color (Colors mode) instead of coming from a bag */
  colorBound: boolean;
  items: ContentItem[];
}

export const TAP_COLLECT_DEFAULTS: TapCollectConfig = {
  mechanic: 'tap-collect',
  goal: 15,
  maxOnScreen: 6,
  spawnEvery: [0.45, 0.95],
  prefill: 2,
  trajectory: RISE_DEFAULTS,
  target: { radius: 0.105, min: 38, max: 92 },
  celebrateSec: 1.4,
};

const range = (description: string, def: readonly [number, number]): JsonSchema => ({
  type: 'array',
  items: { type: 'number', minimum: 0 },
  minItems: 2,
  maxItems: 2,
  description,
  default: def,
});

export const TAP_COLLECT_META = {
  id: 'tap-collect',
  kind: 'mechanic',
  description:
    'Targets move across the screen; a tap pops one (confetti, a pop-up word, the word spoken). The round ends after `goal` pops. No losing, no timer, missed targets just leave.',
  schema: {
    type: 'object',
    description: 'The round: mechanic and its settings. Everything except `mechanic` has a default.',
    properties: {
      mechanic: { const: 'tap-collect', description: 'Mechanic id', 'x-gp-ref': 'mechanic' },
      goal: { type: 'integer', minimum: 1, maximum: 100, description: 'Targets to pop to finish the round', default: TAP_COLLECT_DEFAULTS.goal },
      maxOnScreen: { type: 'integer', minimum: 1, maximum: 12, description: 'Max targets on screen at once', default: TAP_COLLECT_DEFAULTS.maxOnScreen },
      spawnEvery: range('Pause between spawns, seconds, [min, max]', TAP_COLLECT_DEFAULTS.spawnEvery),
      prefill: { type: 'integer', minimum: 0, maximum: 12, description: 'Targets already on screen when the round starts', default: TAP_COLLECT_DEFAULTS.prefill },
      trajectory: RISE_META.schema,
      target: {
        type: 'object',
        description: 'Target size: `radius` share of the short screen side, clamped to [`min`, `max`] CSS px (≈ dp). The audience profile sets a floor for `min`.',
        properties: {
          radius: { type: 'number', exclusiveMinimum: 0, maximum: 0.5, default: TAP_COLLECT_DEFAULTS.target.radius },
          min: { type: 'number', minimum: 10, default: TAP_COLLECT_DEFAULTS.target.min },
          max: { type: 'number', minimum: 10, default: TAP_COLLECT_DEFAULTS.target.max },
        },
        additionalProperties: false,
      },
      celebrateSec: { type: 'number', minimum: 0.5, maximum: 5, description: 'Fireworks after the last pop, seconds', default: TAP_COLLECT_DEFAULTS.celebrateSec },
    },
    required: ['mechanic'],
    additionalProperties: false,
  } satisfies JsonSchema,
  example: 'round:\n  mechanic: tap-collect\n  goal: 12\n  trajectory: { type: rise, time: [6, 8] }',
} as const;
