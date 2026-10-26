// "rise": from below the screen to above it, with a gentle sway. Balloons, bubbles.

import { rng, type Theme } from '@gp/core';
import type { RiseConfig } from './rise.meta.ts';
import type { Moving, Trajectory } from './types.ts';

export function rise(cfg: RiseConfig): Trajectory {
  return {
    id: 'rise',
    spawnY: (h: number, r: number, k: number, theme: Theme) => h + r * k * (theme.targetAspect + 0.2),
    speed: (h: number, r: number) => (h + r * 4) / rng.range(cfg.time[0], cfg.time[1]),
    step(m: Moving, dt: number, speedup: number) {
      m.y -= m.speed * speedup * dt;
    },
    gone: (m: Moving, _h: number, r: number, theme: Theme) => m.y < -r * (theme.targetAspect + theme.targetTail + 0.3),
    swayX: (m: Moving, time: number, r: number) => Math.sin(time * 0.9 + m.phase) * r * cfg.sway,
  };
}
