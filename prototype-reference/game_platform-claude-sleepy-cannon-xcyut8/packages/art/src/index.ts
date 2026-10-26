// @gp/art — the drawing module for kit: code games: drawn in code and drawn well, with generated images where they help (docs/guides/art.md).
// Import a module's subpath (`@gp/art/fx`) or the whole set from here; either way the build keeps only what is used.

export * from './color.ts';
export * from './palette.ts';
export * from './noise.ts';
export * from './bake.ts';
export * from './material.ts';
export * from './light.ts';
export * from './shapes.ts';
export * from './sprite.ts';
export * from './hud.ts';
export * from './rig.ts';
export * from './tween.ts';
export * from './fx.ts';
export * from './camera.ts';
export * from './scenery.ts';
export * from './perf.ts';
export * from './assets.ts';
export * from './dom.ts';
// The faces themselves are their own modules (@gp/art/type/<face>): only the ones a game imports land in its upload
export * from './type.ts';
