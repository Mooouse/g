// Catalog entry for the "rise" trajectory (pure data).

import type { JsonSchema } from '@gp/core/schema';

export interface RiseConfig {
  type: 'rise';
  /** Seconds to cross the screen, random within [min, max] */
  time: readonly [number, number];
  /** Sway amplitude, share of the target radius */
  sway: number;
}

export const RISE_DEFAULTS: RiseConfig = { type: 'rise', time: [5.5, 7.5], sway: 0.15 };

export const RISE_META = {
  id: 'rise',
  kind: 'trajectory',
  description: 'Targets float up from below the screen with a gentle sway (balloons, bubbles).',
  schema: {
    type: 'object',
    description: 'How targets move. `rise`: from the bottom to the top.',
    properties: {
      type: { const: 'rise', description: 'Trajectory id', 'x-gp-ref': 'trajectory' },
      time: {
        type: 'array',
        items: { type: 'number', exclusiveMinimum: 0 },
        minItems: 2,
        maxItems: 2,
        description: 'Seconds to cross the screen, [min, max]. Slow for toddlers (5–8 s).',
        default: RISE_DEFAULTS.time,
      },
      sway: { type: 'number', minimum: 0, maximum: 1, description: 'Sway amplitude, share of the target radius', default: RISE_DEFAULTS.sway },
    },
    required: ['type'],
    additionalProperties: false,
  } satisfies JsonSchema,
} as const;
