// Content packs: lists of things a game shows and says (numbers, letters, animals, words...).
// A pack is plain data, no code. A game references a pack by id or lists items inline in game.yaml.

export interface ContentItem {
  /** Text drawn on a target: a digit, a letter, a short word */
  label?: string;
  /** Emoji drawn on a target */
  emoji?: string;
  /** The word: shown as the pop-up and spoken by text-to-speech */
  word?: string;
  /** For color-bound packs: the target color (#rrggbb) this item names */
  color?: string;
}

/** What is drawn on the target */
export type ShowField = 'none' | 'label' | 'emoji';
/** What pops up where the target burst */
export type PopField = 'none' | 'label' | 'emoji' | 'word';

export interface ContentPack {
  readonly id: string;
  readonly description: string;
  /** BCP 47 language of the words, if there are words */
  readonly lang?: string;
  /**
   * list — items come up in a shuffled bag (each once, no back-to-back repeats);
   * color-bound — the item is the one naming the target's color (Colors mode)
   */
  readonly kind: 'list' | 'color-bound';
  /** Defaults for a mode that uses this pack */
  readonly defaults: { show: ShowField; pop: PopField; popColored?: boolean };
  readonly items: readonly ContentItem[];
}

/** A list of reward stickers (emoji), unlocked in order */
export interface StickerPack {
  readonly id: string;
  readonly description: string;
  readonly stickers: readonly string[];
}
