// "tap-collect" round: targets move across the screen; a tap pops one, shows a word above it and says it.
// After `goal` pops — fireworks, then the app's round lifecycle (break with an ad, result screen).

import { drawEmoji, drawIconButton, drawText, easeOutBack, hitCircle, margin, rng, topLeftButton, Bag, type App, type ProbeTarget, type Scene, type Theme } from '@gp/core';
import { TargetField, type Target, type TargetContent } from '../field/target-field.ts';
import { rise } from '../trajectories/rise.ts';
import type { ResolvedMode, TapCollectConfig } from './tap-collect.meta.ts';

interface PopLabel {
  text?: string;
  emoji?: string;
  color: string;
  x: number;
  y: number;
  age: number;
}

const LABEL_SEC = 1.3;

export class TapCollectRound implements Scene {
  readonly id = 'round';
  readonly field: TargetField;
  private readonly labels: PopLabel[] = [];
  private readonly popColors: string[] = [];
  state: 'play' | 'celebrate' | 'done' = 'play';
  private celebrateT = 0;
  private nextBurst = 0;
  /** Each item of the mode comes up once, then the bag is reshuffled */
  private readonly bag: Bag;

  constructor(
    private readonly app: App,
    private readonly theme: Theme,
    private readonly cfg: TapCollectConfig,
    readonly mode: ResolvedMode,
  ) {
    this.bag = new Bag(mode.items.length);
    this.field = new TargetField(app, cfg, theme, rise(cfg.trajectory), (color) => this.makeContent(color));
  }

  get popped(): number {
    return this.popColors.length;
  }

  enter(): void {
    this.app.keepAwake(true);
    // A couple of targets right away — no waiting
    this.field.prefill(this.cfg.prefill, 0.65, 0.9);
    this.app.events.emit('round:start', { mode: this.mode.id });
  }

  exit(): void {
    this.app.keepAwake(false);
    this.app.audio.stopSpeech();
  }

  private makeContent(color: string): TargetContent {
    const m = this.mode;
    const item = m.colorBound ? (m.items.find((x) => x.color?.toLowerCase() === color.toLowerCase()) ?? m.items[0]) : m.items[this.bag.next()];
    const c: TargetContent = {};
    if (m.show === 'label') c.label = item.label;
    else if (m.show === 'emoji') c.emoji = item.emoji;
    if (m.pop === 'label') c.popText = item.label;
    else if (m.pop === 'word') c.popText = item.word;
    else if (m.pop === 'emoji') c.popEmoji = item.emoji;
    if (m.popColored) c.popColor = color;
    if (m.say && item.word) c.say = item.word;
    return c;
  }

  private homeButton() {
    return topLeftButton(this.app);
  }

  probe(): ProbeTarget[] {
    const h = this.homeButton();
    return [{ id: 'home', x: h.x - h.r, y: h.y - h.r, w: h.r * 2, h: h.r * 2 }];
  }

  pointer(x: number, y: number): void {
    // Fireworks and the switch to the result: the reward is earned, an accidental Home would take it away
    if (this.state !== 'play') return;
    // A target beats the button: popping a target near the top-left corner must not exit to the menu
    const b = this.field.hit(x, y);
    if (b) {
      this.popTarget(b);
      return;
    }
    if (hitCircle(this.homeButton(), x, y)) {
      this.app.audio.tap();
      this.app.home();
    }
  }

  private popTarget(b: Target): void {
    const x = this.field.drawX(b);
    if (!this.field.pop(b)) return;
    this.popColors.push(b.color);
    this.app.events.emit('target:pop', { n: this.popped });
    const c = b.content;
    if (c) {
      if (c.popText || c.popEmoji) this.labels.push({ text: c.popText, emoji: c.popEmoji, color: c.popColor ?? '#ffffff', x, y: b.y, age: 0 });
      if (c.say) this.app.audio.speak(c.say);
    }
    if (this.popped >= this.cfg.goal) this.startCelebrate();
  }

  private startCelebrate(): void {
    this.state = 'celebrate';
    this.celebrateT = 0;
    this.nextBurst = 0.15;
    this.field.speedup = 3;
    this.app.audio.win();
  }

  update(dt: number): void {
    this.field.update(dt, this.state === 'play');
    for (let i = this.labels.length - 1; i >= 0; i--) {
      const l = this.labels[i];
      l.age += dt;
      l.y -= this.app.u * 0.12 * dt;
      if (l.age > LABEL_SEC) this.labels.splice(i, 1);
    }
    if (this.state === 'celebrate') {
      this.celebrateT += dt;
      if (this.celebrateT >= this.nextBurst && this.celebrateT < this.cfg.celebrateSec - 0.3) {
        this.nextBurst += 0.35;
        const { w, h, u } = this.app;
        const color = rng.pick(this.theme.palette);
        this.field.particles.burst(w * (0.2 + rng.random() * 0.6), h * (0.2 + rng.random() * 0.3), color, 28, u * 0.45);
        this.app.audio.firework();
      }
      if (this.celebrateT >= this.cfg.celebrateSec) {
        this.state = 'done';
        void this.app.finishRound({ mode: this.mode.id });
      }
    }
  }

  draw(ctx: CanvasRenderingContext2D): void {
    const { w, h, u, time } = this.app;
    this.theme.drawBackground(ctx, w, h, time);
    this.field.draw(ctx);

    // Pop-up words/numbers/letters/animals
    for (const l of this.labels) {
      const appear = easeOutBack(l.age / 0.25);
      const alpha = Math.min(1, (LABEL_SEC - l.age) / 0.35);
      ctx.globalAlpha = Math.max(0, alpha);
      const size = u * 0.14 * appear;
      if (l.emoji) drawEmoji(ctx, l.emoji, l.x, l.y, size * 1.2);
      else if (l.text) {
        // Long color names must stay on screen
        const len = l.text.length;
        const s = len > 3 ? Math.min(size, (w * 0.9) / (len * 0.62)) : size * 1.2;
        const x = Math.min(w - s * len * 0.32, Math.max(s * len * 0.32, l.x));
        const colored = l.color !== '#ffffff';
        drawText(ctx, l.text, x, l.y, s, l.color, colored ? '#ffffff' : this.theme.ui.textOutline);
      }
    }
    ctx.globalAlpha = 1;

    // Home button and round progress (colored dots — no numbers or text)
    const home = this.homeButton();
    drawIconButton(ctx, home.x, home.y, home.r, 'home', { icon: this.theme.ui.icon, fill: 'rgba(255,255,255,0.85)' });
    const m = margin(this.app);
    const left = home.x + home.r + m;
    const right = w - this.app.inset.right - m;
    const n = this.cfg.goal;
    const step = Math.min(u * 0.055, (right - left) / n);
    const dotR = step * 0.36;
    const startX = left + (right - left - step * n) / 2 + step / 2;
    for (let i = 0; i < n; i++) {
      const x = startX + i * step;
      ctx.beginPath();
      ctx.arc(x, home.y, dotR, 0, Math.PI * 2);
      ctx.fillStyle = i < this.popped ? this.popColors[i] : 'rgba(255, 255, 255, 0.55)';
      ctx.fill();
    }
  }
}
