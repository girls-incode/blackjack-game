export const SUITS = ["HEARTS", "CLUBS", "SPADES", "DIAMONDS"] as const;
export const VALUES = [
  "2",
  "3",
  "4",
  "5",
  "6",
  "7",
  "8",
  "9",
  "10",
  "J",
  "Q",
  "K",
  "A",
] as const;

export type Suit = (typeof SUITS)[number];
export type Value = (typeof VALUES)[number];

export interface Card {
  suit: Suit;
  value: Value;
}

export const BLACKJACK_SCORE = 21;
const FACE_CARD_VALUE = 10;
const ACE_VALUE = 11;
const FACE_VALUES: ReadonlySet<Value> = new Set<Value>(["J", "Q", "K"]);

export const SUIT_SYMBOLS: Record<Suit, string> = {
  HEARTS: "H",
  CLUBS: "C",
  SPADES: "S",
  DIAMONDS: "D",
};

type CardRecord = { suit?: unknown; value?: unknown };

const isCardRecord = (value: unknown): value is CardRecord =>
  typeof value === "object" && value !== null;

export const cardValue = (card: Card): number => {
  if (card.value === "A") return ACE_VALUE;
  if (FACE_VALUES.has(card.value)) return FACE_CARD_VALUE;

  return Number(card.value);
};

export const score = (cards: readonly Card[]): number =>
  cards.reduce((sum, card) => sum + cardValue(card), 0);

export const isBust = (cards: readonly Card[]): boolean =>
  score(cards) > BLACKJACK_SCORE;

/** A blackjack is exactly two cards with a total score of 21. */
export const isBlackjack = (cards: readonly Card[]): boolean =>
  cards.length === 2 && score(cards) === BLACKJACK_SCORE;

export const formatCard = (card: Card): string =>
  `${SUIT_SYMBOLS[card.suit]}${card.value}`;

const isOneOf = <T extends string>(
  options: readonly T[],
  value: unknown,
): value is T => options.some((option) => option === value);

/** Returns whether an unknown value has the shape of a valid card. */
export const isCard = (value: unknown): value is Card => {
  if (!isCardRecord(value)) return false;

  const { suit, value: rank } = value;

  return isOneOf(SUITS, suit) && isOneOf(VALUES, rank);
};
