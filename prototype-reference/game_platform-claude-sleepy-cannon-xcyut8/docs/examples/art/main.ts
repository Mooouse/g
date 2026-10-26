// Forge Night — the @gp/art showcase as a game QA can run: a title, a 40-second run where every tap is an explosion,
// the results. scene.ts draws; this file is the host contract (the gp init skeleton's shape, cut to the minimum).
// Dev only: ?at=<seconds> renders the run at that moment on the fixed step (the docs' screenshots: same pixels every
// time), ?meter shows the frame meter, ?cover stages the cover frame.
// Sound: @gp/core/sound — a theme for the title and one for the run, the forge's ambience, and the effects from
// createSfx's recipes (no files): a boom per tap, a click per button, a bell for the results; all of it holds on the
// pause screen. Juice: taps close together are a chain, shown as it grows ("×3 = 900", previewScore) and scored when it
// ends by the ScoreSequencer — a beat per blast, quicker and higher each time, the labels clear of each other, a land
// sized by the chain against a big one; a tap fast-forwards it.

import { ScoreSequencer, drawScoreLabels, previewScore, screenTheme, type GameContext, type ScoreStep } from '@gp/core';
import { icon, type IconName } from '@gp/core/icons';
import { bossTheme, createAmbience, createMixer, createMusic, createSfx, musicTheme, sfxRecipe } from '@gp/core/sound';
import { fitCanvas, watchContext } from '@gp/art/bake';
import { FrameMeter } from '@gp/art/perf';
import { fontReady, numberCss, useFont } from '@gp/art/type';
import { DELA_GOTHIC_ONE } from '@gp/art/type/dela-gothic-one';
import { EXO_2 } from '@gp/art/type/exo-2';
import { createScene } from './scene.ts';

const RUN_SEC = 40;
/** A new player's first shift runs past the first minute: it ends in a results screen, and the first minute must not (gp qa) */
const FIRST_SHIFT_SEC = 75;
const DT = 1 / 60;
/** Taps this close (s) are one chain; the chain scores when none follows */
const CHAIN_GAP = 0.9;
/** A chain this big lands at full size (landSize: a quarter of it 0.3, all of it 0.9) */
const CHAIN_TARGET = 1600;

export default function start({ host, canvas, ui }: GameContext): void {
  const save = host.load({ best: 0 });
  /** Shifts started this session */
  let shifts = 0;
  const g = canvas.getContext('2d', { alpha: false })!;
  const params = new URLSearchParams(location.search);
  const dev = import.meta.env.DEV;
  const scene = createScene(7);
  const meter = dev && params.has('meter') ? new FrameMeter() : null;
  let w = 0;
  let h = 0;
  let state: 'title' | 'play' | 'paused' | 'results' = 'title';
  let runT = 0;
  let acc = 0;
  let demo = false;
  /** This shift's length: a new player's first is longer */
  let shiftSec = RUN_SEC;
  watchContext(canvas);

  const mixer = createMixer(host);
  const music = createMusic(mixer, {
    title: musicTheme('calm', 31, { root: 'A3', scale: 'dorian' }),
    run: bossTheme(musicTheme('dark', 47, { root: 'A3' }), 53, { bpm: 126 }),
  });
  const ambience = createAmbience(mixer, { seed: 7 });
  const forge = { hum: 0.5, wind: 0.3, crackle: 0.25 };
  // The effects: recipes, no files — each play a little off in pitch (a hundred booms aren't one sound a hundred times)
  const sfx = createSfx(mixer, {
    boom: { src: sfxRecipe('boom'), vol: 0.9 },
    tick: { src: sfxRecipe('glass', { hz: 1320, decay: 0.45 }), vary: 0.01 },
    roll: sfxRecipe('whoosh', { pitch: 0.6, decay: 4 }),
    land: sfxRecipe('thud'),
    bell: { src: sfxRecipe('bell'), vary: 0 },
    click: sfxRecipe('click'),
  });
  /** The chain being tapped: each blast +100 and +1 mult, so three quick taps are 300 × 3 */
  let chain: ScoreStep[] = [];
  let chainIdle = 0;
  /** Where the chain playing back ended: its count-up stands over it */
  let chainAt = { x: 0, y: 0 };
  const seq = new ScoreSequencer({
    host,
    onStep: ({ pitch, point, fast }) => {
      if (fast) return;
      sfx.play('tick', { rate: pitch });
      if (point) {
        const [x, y] = scene.camera.toWorld(point.x, point.y);
        scene.fx.emit('sparks', x, y, { n: 8, scale: 0.6 });
      }
    },
    onRoll: ({ k }) => sfx.play('roll', { vol: 0.4 + 0.6 * k }),
    onLand: ({ total, big }) => {
      sfx.play('land', { vol: 0.5 + big * 0.5 });
      if (big > 0.6) {
        sfx.play('bell', { vol: 0.6 });
        mixer.duck(0.4, 0.8);
        // Something new the player meets (gp qa counts the distinct ones over a long demo run: docs/guides/first-minute.md)
        host.seen('payout', 'big');
      }
      scene.camera.addTrauma(0.15 + big * 0.45);
      scene.state.score += total;
    },
    // On screen at its size now (a getter: the sequencer reads it for each label)
    labels: {
      size: 22,
      get bounds() {
        return { w, h };
      },
    },
  });
  /** The chain is over: play it back, beat by beat */
  const scoreChain = () => {
    if (!chain.length) return;
    const last = chain[chain.length - 1].at as { x: number; y: number };
    chainAt = { x: last.x, y: last.y };
    seq.play(chain, { base: { mult: 0 }, target: CHAIN_TARGET });
    chain = [];
  };
  /** A tap in the run: the blast, its boom, a link of the chain (a tap during the playback fast-forwards it) */
  const blast = (x: number, y: number) => {
    if (seq.playing) seq.skip();
    scene.tap(x, y);
    sfx.play('boom', { rate: 1 - Math.min(0.25, chain.length * 0.04) });
    mixer.duck(0.45, 0.6);
    // Its label the points only: the count-up over the chain shows the multiplier climbing
    chain.push({ kind: 'blast', at: { x, y: y - 40 }, add: 100, mult: 1, label: '+100' });
    host.seen('chain', `x${chain.length}`);
    chainIdle = 0;
    host.happytime();
  };

  // Game type (@gp/art/type): a heavy display face for the titles and buttons, a technical one for the words and the
  // HUD (scene.ts) — two files of ≈ 20 KB in the upload, not the system's fonts
  const display = useFont(DELA_GOTHIC_ONE);
  const text = useFont(EXO_2);
  // The platform's own screens (none in this showcase yet, the language sheet in a real game) wear the same look
  screenTheme({ bg: '#0f1a3ae6', panel: '#ffffff12', ink: '#eef5fa', muted: '#a9bedb', accent: '#ffb25c', accentInk: '#1a0f05', radius: 20, font: text, display });
  const style = document.createElement('style');
  style.textContent = `
    #ui { position: fixed; inset: 0; display: flex; align-items: center; justify-content: center; pointer-events: none;
          font: 800 18px ${text}; color: #eef5fa; text-align: center; }
    ${numberCss({ font: text, color: '#ffe0a3', selector: '#ui .num' })}
    #ui .screen { pointer-events: auto; display: flex; flex-direction: column; gap: 12px; align-items: center; padding: 22px 30px;
                  border-radius: 20px; max-width: 86vw; background: linear-gradient(180deg, #1a2a55cc, #0a1230e6);
                  border: 1px solid #c9e6ff40; box-shadow: 0 0 0 1px #00000040, 0 18px 50px #02051880, inset 0 1px 0 #ffffff30;
                  backdrop-filter: blur(10px); -webkit-backdrop-filter: blur(10px); }
    #ui h1 { margin: 0; font: 400 40px ${display}; letter-spacing: 0.02em; background: linear-gradient(180deg, #fff3d6, #ffb25c);
             -webkit-background-clip: text; background-clip: text; color: transparent; filter: drop-shadow(0 2px 10px #ff8a2a80); }
    #ui button { min-width: ${host.minTouchPx * 3}px; min-height: ${host.minTouchPx}px; border: 0; border-radius: 999px; cursor: pointer;
                 font: 400 19px ${display}; color: #1a0f05; padding: 0 22px; display: inline-flex; align-items: center; justify-content: center; gap: 8px;
                 background: linear-gradient(180deg, #ffd38a, #ff8a2a); box-shadow: 0 4px 18px #ff8a2a66, inset 0 1px 0 #ffffffa0; }
    #ui button.alt { background: linear-gradient(180deg, #33507a, #1c2c4c); color: #eef5fa; box-shadow: inset 0 1px 0 #ffffff40; }
    #ui .hint { position: fixed; bottom: 18px; left: 0; right: 0; font-size: 15px; color: #e8f2ffd0; text-shadow: 0 1px 6px #000a; pointer-events: none; }
  `;
  document.head.append(style);
  /** A button with a drawn icon (@gp/core/icons) before its words */
  const button = (words: string, onClick: () => void, gp?: string, alt = false, mark?: IconName) => {
    const b = document.createElement('button');
    if (mark) b.append(icon(mark, { style: 'solid', size: 20 }));
    b.append(words);
    if (gp) b.dataset.gp = gp;
    if (alt) b.className = 'alt';
    b.addEventListener('click', () => {
      sfx.play('click');
      onClick();
    });
    return b;
  };
  const screen = (...children: (HTMLElement | string)[]) => {
    const s = document.createElement('div');
    s.className = 'screen';
    s.append(...children.map((c) => (typeof c === 'string' ? Object.assign(document.createElement('div'), { textContent: c }) : c)));
    ui.replaceChildren(s);
    wake();
  };
  const title = (words: string) => Object.assign(document.createElement('h1'), { textContent: words });
  /** "Score 12 345": the number in the outlined HUD style (numberCss), with a drawn star */
  const scoreLine = (n: number, label = 'Score') => {
    const d = document.createElement('div');
    d.append(icon('star', { style: 'solid', color: '#ffc65c', size: 22 }), ` ${label} `, Object.assign(document.createElement('span'), { className: 'num', textContent: String(n) }));
    return d;
  };
  const best = (n: number) => scoreLine(n, 'Best');

  // Bake ahead on the title screen, a piece per idle moment (scene.prewarm): the run starts with warm caches
  let warming = false;
  const idle = (fn: () => void) => ('requestIdleCallback' in window ? requestIdleCallback(() => fn(), { timeout: 200 }) : setTimeout(fn, 30));
  const prewarm = () => {
    if (warming) return;
    warming = true;
    const step = () => (scene.prewarm() ? idle(step) : (warming = false));
    idle(step);
  };
  function showTitle(): void {
    state = 'title';
    prewarm();
    host.gameplay(false);
    music.hold(false);
    music.play('title');
    ambience.hold(false);
    ambience.set({ hum: 0.3, wind: 0.4 });
    screen(title('Forge Night'), save.best ? best(save.best) : 'The @gp/art showcase', button('Play', play, 'play', false, 'play'));
  }
  function play(): void {
    state = 'play';
    runT = 0;
    shiftSec = host.firstVisit && !save.best && !shifts ? FIRST_SHIFT_SEC : RUN_SEC;
    shifts++;
    acc = 0;
    scene.state.score = 0;
    scene.state.shown = 0;
    chain = [];
    seq.finish();
    host.gameplay(true);
    music.play('run');
    ambience.set(forge);
    const hint = Object.assign(document.createElement('div'), { className: 'hint', textContent: 'Tap anywhere: boom!' });
    ui.replaceChildren(hint);
    wake();
  }
  function pauseGame(): void {
    if (state !== 'play') return;
    state = 'paused';
    host.gameplay(false);
    music.hold(true);
    ambience.hold(true);
    seq.pause(true);
    sfx.hush();
    screen(title('Paused'), button('Resume', resume, 'resume', false, 'play'));
  }
  function resume(): void {
    state = 'play';
    host.gameplay(true);
    music.hold(false);
    ambience.hold(false);
    seq.pause(false);
    ui.replaceChildren();
    wake();
  }
  function results(): void {
    if (state !== 'play' && state !== 'paused') return;
    // The chain still open and the one playing back count: scored at once
    scoreChain();
    seq.finish();
    seq.pause(false);
    state = 'results';
    host.gameplay(false);
    music.hold(false);
    music.play('title');
    ambience.hold(false);
    ambience.set({ hum: 0.3, wind: 0.4 });
    const score = scene.state.score;
    const best = score > save.best;
    if (best) save.best = score;
    host.save(save);
    host.roundEnd({ score, newBest: best });
    sfx.play('bell', { rate: best ? 1.5 : 1 });
    screen(title(best ? 'New best!' : 'Shift over'), scoreLine(score), button('Play again', async () => {
      await host.adBreak();
      play();
    }, 'again', false, 'refresh'), button('Menu', showTitle, undefined, true, 'home'));
  }

  function update(dt: number): void {
    if (state !== 'play' || host.paused) return;
    acc += dt;
    while (acc >= DT) {
      acc -= DT;
      scene.update(DT);
      seq.update(DT);
      runT += DT;
      chainIdle += DT;
      if (chain.length && chainIdle >= CHAIN_GAP) scoreChain();
      // The demo bot taps in bursts of 1–4 every 2.5 s, so its chains play back too
      const f = Math.floor(runT * 60);
      if (demo && f % 14 === 0 && f % 150 < (1 + (Math.floor(f / 150) % 4)) * 14) blast(w * (0.3 + 0.4 * ((runT * 7) % 1)), h * (0.5 + 0.15 * ((runT * 3) % 1)));
    }
    if (runT >= 4) ui.querySelector('.hint')?.remove();
    if (runT >= shiftSec) results();
  }
  function draw(): void {
    meter?.begin();
    g.setTransform(canvas.width / w, 0, 0, canvas.height / h, 0, 0);
    scene.draw(g, w, h, state === 'play' || state === 'paused');
    if (state === 'play' || state === 'paused') drawChain();
    meter?.end();
    meter?.draw(g, 8, h - 26, `q${scene.quality.level}`);
  }
  /** The chain as it grows (its result before it plays back: previewScore), then the count-up and the beats' labels */
  function drawChain(): void {
    const font = display;
    g.save();
    g.textAlign = 'center';
    g.textBaseline = 'middle';
    g.lineJoin = 'round';
    const tag = (text: string, x: number, y: number, size: number, color: string) => {
      g.font = `800 ${size}px ${font}`;
      g.lineWidth = 5;
      g.strokeStyle = '#120a06';
      g.strokeText(text, x, y);
      g.fillStyle = color;
      g.fillText(text, x, y);
    };
    const clampX = (x: number) => Math.max(90, Math.min(w - 90, x));
    if (chain.length > 1) {
      const p = previewScore(chain, { mult: 0 });
      const a = chain[chain.length - 1].at as { x: number; y: number };
      tag(`×${chain.length} = ${p.total}`, clampX(a.x), Math.max(70, a.y - 70), 24, '#9dfcff');
    }
    if (seq.playing) {
      const s = seq.shown;
      tag(seq.state === 'land' ? `+${Math.round(s.total)}` : `${Math.round(s.add)} × ${Math.round(s.mult)}`, clampX(chainAt.x), Math.max(70, chainAt.y - 110), seq.state === 'land' ? 34 : 28, '#ffd38a');
    }
    g.restore();
    drawScoreLabels(g, seq.labels(), { font, colors: { label: '#9dfcff' } });
  }
  function resize(): void {
    ({ w, h } = fitCanvas(canvas));
    scene.resize(w, h);
  }

  canvas.addEventListener('pointerdown', (e) => {
    if (state !== 'play' || host.paused) return;
    blast(e.clientX, e.clientY);
  });
  window.addEventListener('resize', () => {
    resize();
    wake();
  });
  window.addEventListener('keydown', (e) => {
    if (e.code === 'KeyP') pauseGame();
  });
  host.onPause((reason) => {
    if (reason !== 'ad') pauseGame();
  });
  host.onResume(() => wake());
  host.qa({
    play: () => play(),
    end: () => results(),
    demo: () => {
      demo = true;
    },
    // The state gp qa compares after 10 s of the same seeded demo at 60 and 144 Hz: the fixed step (DT) makes them equal
    digest: () => scene.state.score,
    // The robot: gp qa checks it is at least 6 % of the screen's short side in play (desktop decides)
    hero: () => (state === 'play' || state === 'paused' ? scene.heroRect() : null),
    canvasUi: () =>
      state === 'play'
        ? [
            { name: 'gauges', kind: 'text', x: 12, y: 12, w: w < 520 ? 196 : 262, h: w < 520 ? 86 : 104, fontPx: 12 },
            { name: 'score', kind: 'text', x: w - (w < 520 ? 140 : 182), y: 12, w: w < 520 ? 128 : 170, h: w < 520 ? 46 : 56, fontPx: 20 },
          ]
        : [],
    // The cover's key art: gp covers composes it with the title (docs/guides/covers.md); dev only, out of the upload
    cover: dev ? scene.cover() : undefined,
    screens: {
      title: () => showTitle(),
      paused: () => {
        play();
        pauseGame();
      },
      results: () => {
        play();
        scene.state.score = 12345;
        results();
      },
    },
  });

  let raf = 0;
  let last = 0;
  const running = () => state === 'play' && !host.paused;
  const frame = (ts: number) => {
    raf = 0;
    const dt = last ? Math.min(0.05, (ts - last) / 1000) : 0;
    last = ts;
    update(dt);
    draw();
    // `!raf`: update() may have called wake() (a screen change mid-frame) and started the next frame already — a second
    // requestAnimationFrame here would run two loops, each frame drawn twice (Rivet Clash 2.0: 60 → ~10 fps in a battle)
    if (running() && !raf) raf = requestAnimationFrame(frame);
  };
  function wake(): void {
    if (!running()) draw();
    else if (!raf) {
      last = 0;
      raf = requestAnimationFrame(frame);
    }
  }
  if (dev) {
    // A benchmark for the docs' frame times: n frames of the full scene (sim + draw), ms per frame
    (window as unknown as { __artScene: unknown }).__artScene = scene;
    (window as unknown as { __artBench: unknown }).__artBench = (n = 300, auto = true, level = 0) => {
      const times: number[] = [];
      if (!auto) scene.quality.set(level);
      for (let i = 0; i < n; i++) {
        const t0 = performance.now();
        scene.update(DT);
        if (i % 90 === 45) scene.tap(w * 0.6, h * 0.6);
        draw();
        // Force the canvas to rasterize now, so the time includes it (Chrome defers 2D drawing to the frame's end)
        g.getImageData(0, 0, 1, 1);
        times.push(performance.now() - t0);
        if (!auto) scene.quality.set(level);
      }
      times.sort((a, b) => a - b);
      return { avg: times.reduce((a, b) => a + b, 0) / n, p50: times[n >> 1], p95: times[Math.floor(n * 0.95)], level: scene.quality.level, particles: scene.fx.count };
    };
  }
  resize();
  const at = dev ? Number(params.get('at')) : NaN;
  // The docs' frames draw HUD text at once: wait for its face (a canvas never swaps a font in by itself)
  if (dev && (params.has('cover') || at > 0)) void fontReady(EXO_2).then(still);
  else showTitle();
  function still(): void {
    if (params.has('cover')) {
      // The cover: the scene a few seconds in (the creature awake, steam up); gp covers draws the key art from
      // host.qa({ cover }) over it and letters the title
      scene.lights.offThread = false;
      for (let i = 0; i < 60 * 4.6; i++) scene.update(DT);
      draw();
      document.body.dataset.cover = 'ready';
    } else {
      // A repeatable frame for the docs: the run at `at` seconds, HUD on (the light map of this frame, not the last)
      state = 'paused';
      scene.lights.offThread = false;
      for (let i = 0; i < Math.round(at * 60); i++) scene.update(DT);
      // The light map and the baked parts settle on the frame before (they follow the lights' direction)
      draw();
      draw();
      document.body.dataset.shot = 'ready';
    }
  }
}
