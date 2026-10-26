// Seeded smooth noise for things that must wobble without looking random: a camera shake, a flickering lamp, a ridge
// line, a blob's edge. Pure (Node too), deterministic: the same seed and input give the same value on every machine.

/** A 32-bit integer hash → [0, 1) */
export function hash(n: number, seed = 0): number {
  let h = Math.imul((n | 0) ^ Math.imul(seed | 0, 0x27d4eb2d), 0x9e3779b1);
  h ^= h >>> 15;
  h = Math.imul(h, 0x85ebca77);
  h ^= h >>> 13;
  h = Math.imul(h, 0xc2b2ae3d);
  h ^= h >>> 16;
  return (h >>> 0) / 4294967296;
}

const fade = (t: number) => t * t * (3 - 2 * t);

/** 1D value noise in −1…1, smooth (C1), period-free; `x` in cells (1 cell ≈ one bump) */
export function noise1(x: number, seed = 0): number {
  const i = Math.floor(x);
  const a = hash(i, seed);
  const b = hash(i + 1, seed);
  return (a + (b - a) * fade(x - i)) * 2 - 1;
}

/** 1D noise that repeats every `period` cells (seamless tiles: a ridge line that wraps) */
export function noise1p(x: number, period: number, seed = 0): number {
  const p = Math.max(1, Math.round(period));
  const i = Math.floor(x);
  const m = (k: number) => ((k % p) + p) % p;
  const a = hash(m(i), seed);
  const b = hash(m(i + 1), seed);
  return (a + (b - a) * fade(x - i)) * 2 - 1;
}

/** 2D value noise in −1…1 */
export function noise2(x: number, y: number, seed = 0): number {
  const i = Math.floor(x);
  const j = Math.floor(y);
  const u = fade(x - i);
  const v = fade(y - j);
  const h = (a: number, b: number) => hash(a + Math.imul(b, 57731), seed);
  const top = h(i, j) + (h(i + 1, j) - h(i, j)) * u;
  const bot = h(i, j + 1) + (h(i + 1, j + 1) - h(i, j + 1)) * u;
  return (top + (bot - top) * v) * 2 - 1;
}

/** Fractal 1D noise (octaves of noise1p when `period` is set): a natural ridge, −1…1 roughly */
export function fbm1(x: number, octaves = 4, seed = 0, period = 0): number {
  let sum = 0;
  let amp = 1;
  let norm = 0;
  let f = 1;
  for (let o = 0; o < octaves; o++) {
    sum += amp * (period ? noise1p(x * f, period * f, seed + o * 101) : noise1(x * f, seed + o * 101));
    norm += amp;
    amp *= 0.5;
    f *= 2;
  }
  return sum / norm;
}
