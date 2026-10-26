// Germ Dodge — the kit: code example. A cell dodges germs; how long can you last?
// It shows the whole contract of a code game (docs/guides/code-games.md):
// - screens in the `ui` layer (DOM), the action on the canvas;
// - host.gameplay(true/false) around the run and the game's own pause, host.roundEnd() once per run;
// - host.adBreak() only when the player chooses to go on ("Play again" — mountResults does it), never on Menu;
// - a rewarded "Continue" only from its button, and only if host.rewardedAvailable, with its own "No thanks"
//   (rewardedOffer: both disabled while the ad is pending, a late reward after the run moved on ignored);
// - host.load/save for progress (cloud save on the portal), host.rng for randomness, host.audio for sound;
// - the loop runs only during a run (nothing on the menus, the pause screen or under an ad: gp qa checks it);
// - data-gp="play" on the Play button (QA of the production build taps it), host.qa(...) for dev QA;
// - every text through host.t (strings/<code>.yaml, ten languages; docs/guides/i18n.md), a language picker on the title;
// - the first minute (docs/guides/first-minute.md): a new player (host.firstVisit) lands straight in a lesson run that
//   can't be lost in its first seconds, with one short hint that goes when they move (hints()); the title comes after
//   it; the results screen's big button plays again and shows the next goal (mountResults); host.fail() at a hit,
//   host.screen() on each screen (the funnel); the run is saved every second and resumed after a reload (saveRun);
//   a return on a new day opens with a "welcome back" card (recordVisit, welcomeBack); a new player's first run can't
//   be lost in its first minute (a hit only knocks the cell back while its shield lasts: gp qa's touch bot plays 60 s);
// - desktop decides (gp qa on crazygames): the dish fills every screen with detail, and the world scales with the
//   screen's short side, so the cell is no speck at 1280×720 (host.qa({ hero }) says where it is).
// - the platform's screens in the game's colours with one screenTheme() call.

import { FONT_FALLBACK, hints, languagePicker, mountResults, MoveInput, recordVisit, rewardedOffer, screenTheme, welcomeBack, type GameContext, type ResultsGoal } from '@gp/core';

const SAVE = { best: 0, runs: 0, sound: true, hints: [] as string[], visit: { first: '', last: '', days: 0 } };
type Save = typeof SAVE;

interface Germ {
  x: number;
  y: number;
  vx: number;
  vy: number;
  r: number;
}

/** The run in progress, as saved for a reload (host.saveRun) */
const RUN = { clock: 0, px: 0.5, py: 0.5, continued: false, germs: [] as number[][] };

const CELL_R = 16; // at a phone's short side; the world scales with the screen (unit)
const SPEED = 260; // CSS px per second, the same
/** A first run's grace: its germs fly past the cell for this long, so a player who is still looking can't lose */
const LESSON_SEC = 14;
/** A first run's shield: until then a hit only knocks the cell back (a new player's first minute can't end in a loss) */
const SHIELD_SEC = 62;
/** The goals a best time works toward (the results screen and the welcome-back card show the next one) */
const GOALS = [10, 20, 30, 45, 60, 90, 120, 180];

export default function start({ host, canvas, ui }: GameContext): void {
  const save: Save = host.load(SAVE);
  // The host's pause (a hidden tab, an ad) lets go of held keys and the stick
  const input = new MoveInput(canvas, { host });
  const g = canvas.getContext('2d')!;
  let w = 0;
  let h = 0;
  let dpr = 1;
  let state: 'title' | 'play' | 'paused' | 'dead' = 'title';
  let clock = 0;
  let px = 0;
  let py = 0;
  let germs: Germ[] = [];
  let spawnIn = 0;
  let continued = false;
  let lesson = false;
  let savedAt = 0;
  /** The world's scale: 1 at a phone's short side (≤ 470 px), more on a bigger screen */
  let unit = 1;
  /** A knock-back's flash on the shield (s left) */
  let bump = 0;
  /** The dish behind every screen, baked on resize */
  let dish: HTMLCanvasElement | null = null;
  // One hint at a time, learned once (saved in save.hints): the first run's "how to move", gone on the first move
  const tips = hints({ seen: save.hints, onSeen: () => host.save(save) });

  // --- Sound: short synth blips through the host (silenced during ads and in a hidden tab)
  const blip = (f0: number, f1: number, dur: number, vol = 0.08) => {
    const a = host.audio;
    if (!a || !save.sound) return;
    const o = a.ctx.createOscillator();
    const v = a.ctx.createGain();
    const now = a.ctx.currentTime;
    o.frequency.setValueAtTime(f0, now);
    o.frequency.exponentialRampToValueAtTime(f1, now + dur);
    v.gain.setValueAtTime(vol, now);
    v.gain.exponentialRampToValueAtTime(0.0001, now + dur);
    o.connect(v).connect(a.out);
    o.start(now);
    o.stop(now + dur + 0.02);
  };

  // --- Screens (DOM)
  const style = document.createElement('style');
  style.textContent = `
    #ui { position: fixed; inset: 0; display: flex; align-items: center; justify-content: center; pointer-events: none;
          font: 600 18px ${FONT_FALLBACK}; color: #e8fff8; text-align: center; }
    #ui .screen { pointer-events: auto; display: flex; flex-direction: column; gap: 14px; align-items: center;
                  background: #0f2230cc; padding: 24px 28px; border-radius: 18px; max-width: 86vw; }
    #ui h1 { margin: 0; font-size: 40px; color: #7ee0c0; }
    #ui button { min-width: ${host.minTouchPx * 3}px; min-height: ${host.minTouchPx}px; border: 0; border-radius: 999px;
                 font: 700 20px ${FONT_FALLBACK}; background: #7ee0c0; color: #0f2230; cursor: pointer; padding: 0 22px; }
    #ui button.alt { background: #24485c; color: #e8fff8; }
    #ui .hud { position: fixed; top: 12px; left: 0; right: 0; font-size: 22px; pointer-events: none; }
    #gp-results h2 { color: #7ee0c0; }
  `;
  document.head.append(style);
  // The platform's screens (results, welcome back, the language sheet, the hint) in the game's colours: one call
  screenTheme({ bg: '#0f2230ee', panel: '#ffffff10', ink: '#e8fff8', muted: '#9fc7bb', accent: '#7ee0c0', accentInk: '#0f2230', track: '#ffffff26', radius: 18 });

  const button = (text: string, onClick: () => void, opts: { alt?: boolean; gp?: string } = {}) => {
    const b = document.createElement('button');
    b.textContent = text;
    if (opts.alt) b.className = 'alt';
    if (opts.gp) b.dataset.gp = opts.gp;
    b.addEventListener('click', () => {
      blip(600, 800, 0.05);
      onClick();
    });
    return b;
  };
  const screen = (...children: (HTMLElement | string)[]) => {
    const s = document.createElement('div');
    s.className = 'screen';
    s.append(...children.map((c) => (typeof c === 'string' ? Object.assign(document.createElement('div'), { textContent: c }) : c)));
    ui.replaceChildren(s);
  };
  const title = (text: string) => Object.assign(document.createElement('h1'), { textContent: text });
  // Seconds with one decimal, as the language writes them (12.3 s · 12,3 s · 12,3 с)
  const time = (s: number) => host.t('seconds', { s: host.i18n.number(s, { minimumFractionDigits: 1, maximumFractionDigits: 1 }) });
  const t = host.t.bind(host);
  /** The next goal for the best time, and how far along it is */
  const nextGoal = (): ResultsGoal => {
    const target = GOALS.find((x) => x > save.best) ?? Math.ceil((save.best + 30) / 30) * 30;
    return { label: t('goal', { time: time(target) }), progress: save.best / target };
  };

  function showTitle(): void {
    state = 'title';
    host.gameplay(false);
    host.screen('title');
    tips.clear();
    input.setEnabled(false);
    const soundText = () => t('sound', { state: t(save.sound ? 'gp.on' : 'gp.off') });
    const sound = button(soundText(), () => {
      save.sound = !save.sound;
      sound.textContent = soundText();
      host.save(save);
    }, { alt: true });
    // The language picker: the player's choice is saved and beats the portal's and the browser's language from then on
    const lang = languagePicker({ host, className: 'alt', onChange: showTitle });
    screen(title('Germ Dodge'), save.best ? t('best', { time: time(save.best) }) : t('hint'), button(t('gp.play'), () => play(), { gp: 'play' }), sound, ...(lang ? [lang] : []));
    wake();
  }

  /** A new run; `asLesson`: a new player's first, whose germs fly past for LESSON_SEC */
  function play(asLesson = false): void {
    clock = 0;
    px = w / 2;
    py = h / 2;
    germs = [];
    lesson = asLesson;
    spawnIn = asLesson ? 2 : 1.2; // a moment to see where you are
    continued = false;
    savedAt = 0;
    resume();
    // Show the rule in play, don't write it: one short line, only if the player hasn't moved within a second and a half
    tips.show('move', t('tipMove'), { after: 1500 });
  }

  function resume(): void {
    state = 'play';
    input.setEnabled(true);
    host.gameplay(true);
    const hud = document.createElement('div');
    hud.className = 'hud';
    hud.dataset.gp = 'hud';
    ui.replaceChildren(hud);
    wake();
  }

  function pauseGame(): void {
    if (state !== 'play') return;
    state = 'paused';
    input.setEnabled(false);
    host.gameplay(false);
    host.screen('paused');
    screen(title(t('gp.paused')), button(t('gp.resume'), resume, { gp: 'resume' }), button(t('gp.giveUp'), die, { alt: true }));
    wake();
  }

  function die(): void {
    state = 'dead';
    input.setEnabled(false);
    host.gameplay(false);
    host.fail({ time: clock });
    tips.clear();
    wake();
    blip(300, 60, 0.4, 0.12);
    // Continue once per run, for a rewarded ad the player chooses, with its own "No thanks" as big and as plain
    // (CrazyGames: the same size, font and colour). null when no rewarded ad can be shown: then straight to the results;
    // a failed ad leaves the choice to the player. A tap on the offer disables both until the ad is over, and a reward
    // that arrives after the run moved on is ignored (stillOpen)
    const offer = continued
      ? null
      : rewardedOffer({
          host,
          placement: 'continue',
          label: t('continue'),
          layout: 'column',
          stillOpen: () => state === 'dead',
          onReward() {
            continued = true;
            germs = germs.filter((e) => Math.hypot(e.x - px, e.y - py) > 160 * unit);
            resume();
          },
          onSkip: () => {
            blip(600, 800, 0.05);
            finish();
          },
        });
    if (offer) {
      host.screen('continue');
      screen(title(t('ouch')), t('lasted', { time: time(clock) }), offer.el);
    } else finish();
  }

  function finish(): void {
    const newBest = clock > save.best;
    save.runs++;
    if (newBest) save.best = clock;
    // The first save of a new player (their visit is logged with it): a reload from now on is a returning visit
    save.visit = recordVisit(save.visit).log;
    host.save(save);
    host.clearRun();
    host.roundEnd({ time: clock, newBest, lost: true });
    if (newBest && save.runs > 1) host.happytime();
    // The big button plays again (an ad break first, within the channel's limits); Menu is small and shows no ad
    mountResults(ui, {
      host,
      title: t(newBest ? 'gp.newBest' : 'gameOver'),
      lines: [t('lasted', { time: time(clock) }), t('best', { time: time(save.best) })],
      primary: 'again',
      onPrimary: () => play(),
      onMenu: showTitle,
      goal: nextGoal(),
    });
  }

  // --- The game loop
  function spawn(): void {
    const r = (host.rng.range(9, 18) + Math.min(10, clock / 6)) * unit;
    const side = host.rng.int(4);
    const x = side === 0 ? -r : side === 1 ? w + r : host.rng.range(0, w);
    const y = side === 2 ? -r : side === 3 ? h + r : host.rng.range(0, h);
    // The lesson's germs fly past: aimed at least half a radian off the cell (the first threat sleeps)
    const off = lesson && clock < LESSON_SEC ? host.rng.pick([-1, 1]) * host.rng.range(0.55, 0.9) : host.rng.range(-0.35, 0.35);
    const a = Math.atan2(py - y, px - x) + off;
    const v = (host.rng.range(90, 150) + clock * 3) * unit;
    germs.push({ x, y, vx: Math.cos(a) * v, vy: Math.sin(a) * v, r });
  }

  function update(dt: number): void {
    if (state !== 'play' || host.paused) return;
    clock += dt;
    const d = input.direction();
    if (d.x || d.y) tips.done('move');
    const cr = CELL_R * unit;
    px = Math.max(cr, Math.min(w - cr, px + d.x * SPEED * unit * dt));
    py = Math.max(cr, Math.min(h - cr, py + d.y * SPEED * unit * dt));
    bump = Math.max(0, bump - dt);
    spawnIn -= dt;
    if (spawnIn <= 0) {
      spawn();
      spawnIn = Math.max(0.12, (lesson ? 0.9 : 0.7) - clock / 60);
    }
    for (const e of germs) {
      e.x += e.vx * dt;
      e.y += e.vy * dt;
    }
    germs = germs.filter((e) => e.x > -60 * unit && e.x < w + 60 * unit && e.y > -60 * unit && e.y < h + 60 * unit);
    // The run, saved once a second of play: a reload goes on from here (positions as shares of the screen)
    if (clock - savedAt >= 1) {
      savedAt = clock;
      host.saveRun({ clock, px: px / w, py: py / h, continued, germs: germs.map((e) => [e.x / w, e.y / h, e.vx, e.vy, e.r]) });
    }
    const hit = germs.find((e) => Math.hypot(e.x - px, e.y - py) < e.r + cr * 0.8);
    if (hit && shielded()) {
      // The first run's shield: the germ bursts, the cell is knocked back from it
      const a = Math.atan2(py - hit.y, px - hit.x);
      px = Math.max(cr, Math.min(w - cr, px + Math.cos(a) * cr * 2.5));
      py = Math.max(cr, Math.min(h - cr, py + Math.sin(a) * cr * 2.5));
      germs = germs.filter((e) => e !== hit);
      bump = 0.35;
      blip(500, 220, 0.12, 0.06);
    } else if (hit) die();
    const hud = ui.querySelector<HTMLElement>('[data-gp=hud]');
    if (hud) hud.textContent = time(clock);
  }

  /** A new player's first run, its first minute: hits only knock the cell back */
  const shielded = () => lesson && clock < SHIELD_SEC;

  /**
   * The dish: a lit agar plate full of faint cells, each lit from the top left — detail on every part of the screen
   * (a flat colour fails on a desktop: gp qa), baked once per size at the device's density
   */
  function bakeDish(): void {
    const c = dish ?? document.createElement('canvas');
    dish = c;
    c.width = Math.round(w * dpr);
    c.height = Math.round(h * dpr);
    const d = c.getContext('2d')!;
    d.setTransform(dpr, 0, 0, dpr, 0, 0);
    const R = Math.hypot(w, h) / 2;
    const bg = d.createRadialGradient(w * 0.42, h * 0.38, 0, w / 2, h / 2, R);
    bg.addColorStop(0, '#1d4a5c');
    bg.addColorStop(0.6, '#123142');
    bg.addColorStop(1, '#07141d');
    d.fillStyle = bg;
    d.fillRect(0, 0, w, h);
    // The cells: a fixed pattern (its own seed, not the run's), sized by the world's unit
    let seed = 7;
    const rnd = () => ((seed = (seed * 16807) % 2147483647) - 1) / 2147483646;
    const n = Math.round((w * h) / (2400 * unit * unit));
    for (let i = 0; i < n; i++) {
      const x = rnd() * w;
      const y = rnd() * h;
      const r = (14 + rnd() * 34) * unit;
      const fill = d.createRadialGradient(x - r * 0.35, y - r * 0.35, r * 0.1, x, y, r);
      fill.addColorStop(0, `rgba(150, 235, 210, ${0.07 + rnd() * 0.06})`);
      fill.addColorStop(1, 'rgba(40, 110, 120, 0.02)');
      d.fillStyle = fill;
      d.beginPath();
      d.arc(x, y, r, 0, Math.PI * 2);
      d.fill();
      d.strokeStyle = 'rgba(126, 224, 192, 0.09)';
      d.lineWidth = 1.2;
      d.stroke();
      d.fillStyle = 'rgba(200, 255, 235, 0.07)';
      d.beginPath();
      d.arc(x + r * 0.2, y + r * 0.1, r * 0.22, 0, Math.PI * 2);
      d.fill();
    }
    // The plate's rim: a vignette
    const v = d.createRadialGradient(w / 2, h / 2, R * 0.55, w / 2, h / 2, R);
    v.addColorStop(0, 'rgba(4, 10, 16, 0)');
    v.addColorStop(1, 'rgba(4, 10, 16, 0.7)');
    d.fillStyle = v;
    d.fillRect(0, 0, w, h);
  }

  function draw(): void {
    g.setTransform(1, 0, 0, 1, 0, 0);
    if (dish) g.drawImage(dish, 0, 0);
    g.setTransform(dpr, 0, 0, dpr, 0, 0);
    // Germs: a body lit from the top left, a darker rim
    for (const e of germs) {
      const b = g.createRadialGradient(e.x - e.r * 0.4, e.y - e.r * 0.4, e.r * 0.1, e.x, e.y, e.r);
      b.addColorStop(0, '#ffb3c4');
      b.addColorStop(0.55, '#e46b8b');
      b.addColorStop(1, '#8c2e4c');
      g.fillStyle = b;
      g.beginPath();
      g.arc(e.x, e.y, e.r, 0, Math.PI * 2);
      g.fill();
    }
    if (state !== 'title') {
      const r = CELL_R * unit;
      const glow = g.createRadialGradient(px, py, r * 0.6, px, py, r * 2.2);
      glow.addColorStop(0, 'rgba(126, 224, 192, 0.35)');
      glow.addColorStop(1, 'rgba(126, 224, 192, 0)');
      g.fillStyle = glow;
      g.fillRect(px - r * 2.2, py - r * 2.2, r * 4.4, r * 4.4);
      const body = g.createRadialGradient(px - r * 0.35, py - r * 0.4, r * 0.1, px, py, r);
      body.addColorStop(0, '#e6fff6');
      body.addColorStop(0.5, '#7ee0c0');
      body.addColorStop(1, '#2f8f78');
      g.fillStyle = body;
      g.beginPath();
      g.arc(px, py, r, 0, Math.PI * 2);
      g.fill();
      if (shielded()) {
        // The first run's shield: a ring that flashes on a knock-back
        g.strokeStyle = `rgba(200, 255, 240, ${0.35 + bump * 1.6})`;
        g.lineWidth = 2 + bump * 6;
        g.beginPath();
        g.arc(px, py, r * 1.45, 0, Math.PI * 2);
        g.stroke();
      }
    }
  }

  function resize(): void {
    dpr = Math.min(2, window.devicePixelRatio || 1);
    w = window.innerWidth;
    h = window.innerHeight;
    unit = Math.max(1, Math.min(w, h) / 470);
    canvas.width = Math.round(w * dpr);
    canvas.height = Math.round(h * dpr);
    px = Math.min(px, w - CELL_R * unit);
    py = Math.min(py, h - CELL_R * unit);
    bakeDish();
  }

  // The loop runs only while a run is on and the host isn't paused: on the title, the pause screen, the results and under
  // an ad nothing runs (gp qa checks it — a loop on a still screen drains a phone's battery). A still screen is drawn once
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
  /** After every change of screen or pause: start the loop if a run is on (no time jump), else draw the still screen once */
  function wake(): void {
    if (!running()) draw();
    else if (!raf) {
      last = 0;
      raf = requestAnimationFrame(frame);
    }
  }

  window.addEventListener('resize', () => {
    resize();
    wake();
  });
  window.addEventListener('keydown', (e) => {
    // P pauses; not Esc — on CrazyGames Esc leaves fullscreen and is a restricted key. The layout doesn't matter: e.code
    if (e.code === 'KeyP') pauseGame();
  });
  // A hidden tab, an ad or a lost WebGL context: the host already stopped gameplay and sound (update() stands still while
  // host.paused); on a hidden tab or a lost context the game shows its pause screen. onPause comes once per reason
  host.onPause((reason) => {
    if (reason !== 'ad') pauseGame();
  });
  // Back from an ad (or a lost context): go on, or redraw the screen the game is on
  host.onResume(wake);
  host.qa({
    play: () => play(),
    end: () => {
      continued = true; // no Continue offer: straight to the results
      die();
    },
    lose: () => die(),
    // Where the player's cell is: gp qa checks it is no speck on a desktop screen (≥ 6 % of the short side)
    hero: () => (state === 'play' || state === 'paused' ? { x: px - CELL_R * unit, y: py - CELL_R * unit, w: CELL_R * unit * 2, h: CELL_R * unit * 2 } : null),
    // Every screen, so gp qa checks each at every size (buttons, text that fits, no page scroll; screen-<name>-*.png).
    // Each opens its screen from wherever the previous left
    screens: {
      title: () => showTitle(),
      paused: () => {
        play();
        pauseGame();
      },
      ouch: () => {
        play();
        clock = 12.3;
        die();
      },
      'game-over': () => {
        play();
        clock = 12.3;
        continued = true;
        die();
      },
      'welcome-back': () => {
        showTitle();
        welcomeBack({ host, goal: nextGoal(), onContinue: () => play() });
      },
    },
  });

  resize();
  // Where the player starts: a run left by a reload (on the pause screen, one tap from going on); a new player straight in
  // a lesson run (no title in the way: CrazyGames' "land new users in gameplay"); everyone else on the title, with a
  // "welcome back" card on the first visit of a new day
  const saved = host.firstVisit ? null : host.loadRun(RUN, { maxAgeHours: 24 });
  if (saved) {
    clock = saved.clock;
    savedAt = clock;
    px = saved.px * w;
    py = saved.py * h;
    continued = saved.continued;
    germs = saved.germs.filter((e) => e.length === 5).map(([x, y, vx, vy, r]) => ({ x: x * w, y: y * h, vx, vy, r }));
    spawnIn = 1;
    state = 'play';
    pauseGame();
  } else if (host.firstVisit) play(true);
  else {
    const visit = recordVisit(save.visit);
    if (visit.log.last !== save.visit.last) {
      save.visit = visit.log;
      host.save(save);
    }
    showTitle();
    if (visit.newDay) welcomeBack({ host, goal: nextGoal(), onContinue: () => play() });
  }
}
