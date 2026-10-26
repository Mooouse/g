// Built-in content packs. English only for now: to add a language, add packs with another `lang`.

import type { ContentPack, StickerPack } from './types.ts';

const NUMBER_WORDS = ['zero', 'one', 'two', 'three', 'four', 'five', 'six', 'seven', 'eight', 'nine', 'ten'];

export const COLORS_EN: ContentPack = {
  id: 'colors-en',
  description: 'Seven color names, bound to the target color: the target shows nothing, the pop-up and voice name its color.',
  lang: 'en',
  kind: 'color-bound',
  defaults: { show: 'none', pop: 'word', popColored: true },
  items: [
    { color: '#ff4b4b', word: 'red' },
    { color: '#ff9a1f', word: 'orange' },
    { color: '#ffd21f', word: 'yellow' },
    { color: '#45c74a', word: 'green' },
    { color: '#3478f6', word: 'blue' },
    { color: '#9a5ae6', word: 'purple' },
    { color: '#ff6fb5', word: 'pink' },
  ],
};

export const NUMBERS_1_10_EN: ContentPack = {
  id: 'numbers-1-10-en',
  description: 'Numbers 1–10: the digit on the target and as the pop-up, the number word spoken ("three").',
  lang: 'en',
  kind: 'list',
  defaults: { show: 'label', pop: 'label' },
  items: NUMBER_WORDS.slice(1).map((word, i) => ({ label: String(i + 1), word })),
};

export const ALPHABET_EN: ContentPack = {
  id: 'alphabet-en',
  description: 'English alphabet A–Z: the letter on the target and as the pop-up; TTS reads an upper-case letter as its name ("A" → "ay").',
  lang: 'en',
  kind: 'list',
  defaults: { show: 'label', pop: 'label' },
  items: [...'ABCDEFGHIJKLMNOPQRSTUVWXYZ'].map((ch) => ({ label: ch, word: ch })),
};

const ANIMALS: [string, string][] = [
  ['🐶', 'dog'], ['🐱', 'cat'], ['🐮', 'cow'], ['🐴', 'horse'], ['🐑', 'sheep'], ['🐔', 'chicken'],
  ['🦆', 'duck'], ['🐰', 'bunny'], ['🐻', 'bear'], ['🦊', 'fox'], ['🐸', 'frog'], ['🐵', 'monkey'],
  ['🦁', 'lion'], ['🐯', 'tiger'], ['🐘', 'elephant'], ['🦒', 'giraffe'], ['🐢', 'turtle'], ['🐟', 'fish'],
  ['🐫', 'camel'], ['🐭', 'mouse'], ['🐧', 'penguin'], ['🦉', 'owl'], ['🐝', 'bee'], ['🦋', 'butterfly'],
  ['🦔', 'hedgehog'], ['🦓', 'zebra'],
];

export const ANIMALS_EN: ContentPack = {
  id: 'animals-en',
  description: '26 animals as long-established emoji (render on old Android): emoji on the target and as the pop-up, the name spoken.',
  lang: 'en',
  kind: 'list',
  defaults: { show: 'emoji', pop: 'emoji' },
  items: ANIMALS.map(([emoji, word]) => ({ emoji, word })),
};

export const STICKERS_24: StickerPack = {
  id: 'stickers-24',
  description: '24 bright stickers for the reward album: toys, sweets, animals, vehicles.',
  stickers: [
    '🎈', '🌈', '⭐', '🦄', '🍭', '🚀', '🐳', '🦖',
    '🍓', '🌻', '🚂', '🐙', '🦜', '🍉', '🐞', '🏰',
    '🌙', '🍦', '🚁', '🐬', '🧸', '🎁', '🌸', '👑',
  ],
};

export const CONTENT_PACKS: Record<string, ContentPack> = Object.fromEntries(
  [COLORS_EN, NUMBERS_1_10_EN, ALPHABET_EN, ANIMALS_EN].map((p) => [p.id, p]),
);

export const STICKER_PACKS: Record<string, StickerPack> = { [STICKERS_24.id]: STICKERS_24 };

/** Number words 0–10, for texts like the parent gate task */
export const NUMBER_WORDS_EN: readonly string[] = NUMBER_WORDS;
