// "tap-score" round: pop targets for points before the clock runs out. Golden targets are worth more,
// spiky ones take time off and reset the combo, quick pops build a combo multiplier, and targets speed up
// towards the end. "Time!" → the app's round lifecycle → the kit's result screen.

import { drawEmoji, drawIconButton, drawText, easeOutBack, fitTextSize, hitCircle, margin, rng, topLeftButton, type App, type ProbeTarget, type RoundResult, type Scene, type Theme } from '@gp/core';
import { TargetField, type Target } from '../field/target-field.ts';
import { rise } from '../trajectories/rise.ts';
import type { TapScoreConfig, TargetKind } from './tap-score.meta.ts';

export interface TapScoreStrings {
  go: string;
  timeUp: string;
}

/** What the round reports to the kit */
export interface ScoreResult extends RoundResult {
  score: number;
  pops: number;
  taps: number;
  bestMultiplier: number;
  bestCombo: number;
}

interface FloatLabel {
  text: string;
  color: string;
  x: number;
  y: number;
  age: number;
}

const LABEL_SEC = 0.9;

export class TapScoreRound implements Scene {
  readonly id = 'round';
  readonly field: TargetField;
  state: 'countdown' | 'play' | 'celebrate' | 'done' = 'countdown';
  score = 0;
  pops = 0;
  taps = 0;
  /** Seconds left on the clock */
  timeLeft: number;
  private t = 0;
  private stateT = 0;
  private combo = 0;
  private bestCombo = 0;
  private bestMult = 1;
  private lastPopT = -99;
  private lastTapT = 0;
  private readonly labels: FloatLabel[] = [];
  private readonly kinds: TargetKind[];
  private readonly totalWeight: number;

  constructor(
    private readonly app: App,
    private readonly theme: Theme,
    private readonly cfg: TapScoreConfig,
    private readonly strings: TapScoreStrings,
    readonly mode: string,
    /** Show the hand hint (first round of the first session) */
    private readonly hint: boolean,
  ) {
    this.timeLeft = cfg.goal.time;
    this.kinds = cfg.targets;
    this.totalWeight = this.kinds.reduce((s, k) => s + k.weight, 0);
    this.field = new TargetField(app, cfg, theme, rise(cfg.trajectory), () => null, {
      pickKind: () => this.pickKind(),
      onGone: (b: Target) => this.app.events.emit('target:miss', { kind: b.kind }),
    });
    if (cfg.countdown <= 0) this.state = 'play';
  }

  get multiplier(): number {
    return 1 + this.cfg.combo.steps.filter((s) => this.combo >= s).length;
  }

  private pickKind(): { kind: string; speed: number } {
    let x = rng.random() * this.totalWeight;
    for (const k of this.kinds) {
      x -= k.weight;
      if (x < 0) return { kind: k.kind, speed: k.speed };
    }
    return { kind: this.kinds[0].kind, speed: this.kinds[0].speed };
  }

  enter(): void {
    this.app.keepAwake(true);
    this.field.prefill(this.cfg.prefill, 0.55, 0.9);
    this.app.events.emit('round:start', { mode: this.mode });
  }

  exit(): void {
    this.app.keepAwake(false);
  }

  private homeButton() {
    return topLeftButton(this.app);
  }

  probe(): ProbeTarget[] {
    const h = this.homeButton();
    return [{ id: 'home', x: h.x - h.r, y: h.y - h.r, w: h.r * 2, h: h.r * 2 }];
  }

  pointer(x: number, y: number): void {
    if (this.state === 'celebrate' || this.state === 'done') return;
    const b = this.state === 'play' ? this.field.hit(x, y) : null;
    if (b) {
      this.taps++;
      this.lastTapT = this.t;
      this.popTarget(b);
      return;
    }
    if (hitCircle(this.homeButton(), x, y)) {
      this.app.audio.tap();
      this.app.home();
      return;
    }
    // A tap on empty space is not punished: several fingers at once are normal
    if (this.state === 'play') {
      this.taps++;
      this.lastTapT = this.t;
    }
  }

  private popTarget(b: Target): void {
    const x = this.field.drawX(b);
    if (!this.field.pop(b)) return;
    const kind = this.kinds.find((k) => k.kind === b.kind) ?? this.kinds[0];
    if (kind.penalty) {
      this.timeLeft = Math.max(0, this.timeLeft - kind.penalty.time);
      if (kind.penalty.combo) this.combo = 0;
      this.app.audio.nope();
      this.labels.push({ text: `−${kind.penalty.time}s`, color: '#ff5a6e', x, y: b.y, age: 0 });
      this.app.events.emit('target:penalty', { kind: kind.kind, time: kind.penalty.time });
      return;
    }
    this.combo = this.t - this.lastPopT <= this.cfg.combo.window ? this.combo + 1 : 1;
    this.lastPopT = this.t;
    this.bestCombo = Math.max(this.bestCombo, this.combo);
    const mult = this.multiplier;
    if (mult > this.bestMult) {
      this.bestMult = mult;
      if (mult > 1) this.app.audio.star(Math.min(2, mult - 2));
    }
    const points = kind.score * mult;
    this.score += points;
    this.pops++;
    if (kind.kind === 'golden') this.app.audio.sparkle();
    this.labels.push({ text: `+${points}`, color: kind.kind === 'golden' ? '#ffd21f' : '#ffffff', x, y: b.y, age: 0 });
    this.app.events.emit('target:pop', { n: this.pops, kind: kind.kind });
    this.app.events.emit('score', { score: this.score, combo: this.combo, multiplier: mult });
  }

  update(dt: number): void {
    this.t += dt;
    this.stateT += dt;
    if (this.state === 'countdown' && this.stateT >= this.cfg.countdown) {
      this.state = 'play';
      this.stateT = 0;
      this.lastTapT = this.t;
    }
    if (this.state === 'play') {
      this.timeLeft -= dt;
      const p = Math.min(1, Math.max(0, 1 - this.timeLeft / this.cfg.goal.time));
      this.field.speedup = 1 + (this.cfg.ramp.speed - 1) * p;
      this.field.spawnFactor = 1 + (this.cfg.ramp.spawn - 1) * p;
      if (this.t - this.lastPopT > this.cfg.combo.window) this.combo = 0;
      if (this.timeLeft <= 0) {
        this.timeLeft = 0;
        this.state = 'celebrate';
        this.stateT = 0;
        this.field.speedup = 3;
        this.app.audio.win();
      }
    }
    this.field.update(dt, this.state === 'play' || this.state === 'countdown');
    for (let i = this.labels.length - 1; i >= 0; i--) {
      const l = this.labels[i];
      l.age += dt;
      l.y -= this.app.u * 0.1 * dt;
      if (l.age > LABEL_SEC) this.labels.splice(i, 1);
    }
    if (this.state === 'celebrate' && this.stateT >= this.cfg.celebrateSec) {
      this.state = 'done';
      const result: ScoreResult = { mode: this.mode, score: this.score, pops: this.pops, taps: this.taps, bestMultiplier: this.bestMult, bestCombo: this.bestCombo };
      void this.app.finishRound(result);
    }
  }

  draw(g: CanvasRenderingContext2D): void {
    const { w, h, u, time } = this.app;
    this.theme.drawBackground(g, w, h, time);
    this.field.draw(g);
    for (const l of this.labels) {
      g.globalAlpha = Math.max(0, Math.min(1, (LABEL_SEC - l.age) / 0.3));
      const s = u * 0.07 * easeOutBack(l.age / 0.2);
      if (s > 1) drawText(g, l.text, l.x, l.y, s, l.color, this.theme.ui.textOutline);
    }
    g.globalAlpha = 1;

    // HUD: home (top left), clock bar (top center), score and combo (top right)
    const home = this.homeButton();
    drawIconButton(g, home.x, home.y, home.r, 'home', { icon: this.theme.ui.icon, fill: 'rgba(255,255,255,0.85)' });
    const m = margin(this.app);
    const right = w - this.app.inset.right - m;
    const scoreS = fitTextSize(g, String(this.score), u * 0.09, w * 0.3);
    drawText(g, String(this.score), right - (w * 0.3) / 2, home.y, scoreS, '#ffffff', this.theme.ui.textOutline);
    if (this.multiplier > 1) drawText(g, `×${this.multiplier}`, right - (w * 0.3) / 2, home.y + home.r * 1.1, u * 0.05, '#ffd21f', this.theme.ui.textOutline);
    const barL = home.x + home.r + m;
    const barR = right - w * 0.3 - m;
    const barW = Math.max(40, barR - barL);
    const barH = Math.max(8, u * 0.022);
    const frac = this.timeLeft / this.cfg.goal.time;
    g.fillStyle = 'rgba(255,255,255,0.25)';
    g.fillRect(barL, home.y - barH / 2, barW, barH);
    g.fillStyle = frac < 0.2 ? '#ff5a6e' : '#ffffff';
    g.fillRect(barL, home.y - barH / 2, barW * frac, barH);
    drawText(g, String(Math.ceil(this.timeLeft)), barL + barW / 2, home.y + barH * 2.2, u * 0.04, '#ffffff', this.theme.ui.textOutline, 700);

    if (this.state === 'countdown') {
      const k = easeOutBack(this.stateT / 0.3);
      drawText(g, this.strings.go, w / 2, h / 2, u * 0.16 * k, '#ffffff', this.theme.ui.textOutline);
    } else if (this.state === 'celebrate' || this.state === 'done') {
      const k = easeOutBack(this.stateT / 0.3);
      drawText(g, this.strings.timeUp, w / 2, h / 2, u * 0.14 * k, '#ffffff', this.theme.ui.textOutline);
    }
    // First-run hint: a hand over a target when nothing was tapped for a while
    if (this.hint && this.state === 'play' && this.pops === 0 && this.t - this.lastTapT > this.cfg.idleHintSec && this.cfg.idleHintSec > 0) {
      const b = this.field.items.find((x) => x.kind !== 'spiky' && x.y > h * 0.3 && x.y < h * 0.85);
      if (b) drawEmoji(g, '👆', this.field.drawX(b) + u * 0.02, b.y + this.field.baseRadius() * (0.9 + Math.sin(time * 6) * 0.15), u * 0.1);
    }
  }
}
