// A trajectory moves targets across the screen: where they appear, how fast, when they are gone.

import type { Theme } from '@gp/core';

export interface Moving {
  x: number;
  y: number;
  /** Size factor (0.92…1.08); the radius itself comes from the screen size */
  k: number;
  /** px/s */
  speed: number;
  /** Random phase for sway */
  phase: number;
}

export interface Trajectory {
  readonly id: string;
  /** y of a new target that enters the screen */
  spawnY(h: number, r: number, k: number, theme: Theme): number;
  /** Speed of a new target, px/s */
  speed(h: number, r: number): number;
  step(m: Moving, dt: number, speedup: number): void;
  /** The target left the screen */
  gone(m: Moving, h: number, r: number, theme: Theme): boolean;
  /** Horizontal sway added when drawing and hit testing */
  swayX(m: Moving, time: number, r: number): number;
}
