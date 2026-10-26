// @gp/art/assets: which animation frame is drawn when.

import { describe, expect, it } from 'vitest';
import { frameAt } from '../src/assets.ts';

describe('frameAt', () => {
  const f = ['a', 'b', 'c'];
  it('loops at the frame rate', () => {
    expect([0, 0.124, 0.125, 0.25, 0.375, 0.5].map((t) => frameAt(f, t, 8))).toEqual(['a', 'a', 'b', 'c', 'a', 'b']);
  });
  it('holds the last frame of a one-shot, and never reads before the first', () => {
    expect(frameAt(f, 10, 8, false)).toBe('c');
    expect(frameAt(f, -1, 8)).toBe('a');
    expect(() => frameAt([], 0)).toThrow();
  });
});
