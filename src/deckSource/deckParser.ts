import { DeckFormatError, InvalidCardError } from "../errors";
import { type Card, isCard } from "../game/card";

const MAX_JSON_LENGTH = 80;

const truncatedJson = (item: unknown): string => {
  const json = JSON.stringify(item) ?? String(item);
  return json.length > MAX_JSON_LENGTH
    ? `${json.slice(0, MAX_JSON_LENGTH)}...`
    : json;
};

/** Validates an unknown deck response and returns normalized cards with only suit and value. */
export const parseDeck = (data: unknown): Card[] => {
  if (!Array.isArray(data)) {
    throw new DeckFormatError("Deck response is not a JSON list");
  }

  const deckData = data.map((item, i) => {
    if (!isCard(item)) {
      throw new InvalidCardError(
        `Invalid card at index ${i}: ${truncatedJson(item)}`,
      );
    }
    return { suit: item.suit, value: item.value };
  });

  return deckData;
};
