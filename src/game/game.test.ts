import { describe, expect, it } from "vitest";
import { DeckExhaustedError } from "../errors";
import { cards } from "../testing";
import { formatCard, score } from "./card";
import { Game } from "./game";
import { createStandardBlackjackGame } from "./standardBlackjackGame";
import { StandOnScoreStrategy } from "./strategy";

const play = (deck: string) => createStandardBlackjackGame().play(cards(deck));

describe("standard game", () => {
  it.each([
    ["dealer wins when both have blackjack", "HA,HK,SA,SQ", "Dealer"],
    ["player wins with only blackjack", "HA,HK,S9,S8", "You"],
    ["dealer wins with only blackjack", "H9,H8,SA,SQ", "Dealer"],
  ])("ends immediately when %s", (_description, deck, winner) => {
    const r = play(deck);
    expect(r.winner).toBe(winner);
    expect(r.player.cards).toHaveLength(2);
    expect(r.dealer.cards).toHaveLength(2);
  });
  it.each([
    ["player", "HA,DA,S9,S8", "Dealer"],
    ["dealer", "H10,H7,SA,CA", "You"],
  ])("counts two initial aces as 22, so the %s loses", (side, deck, winner) => {
    const r = play(deck);
    const hand = side === "player" ? r.player : r.dealer;
    const otherHand = side === "player" ? r.dealer : r.player;
    expect(r.winner).toBe(winner);
    expect(score(hand.cards)).toBe(22);
    expect(otherHand.cards).toHaveLength(2);
  });
  it("player busts and loses without dealer drawing", () => {
    const r = play("H10,H6,S2,S3,HK");
    expect(r.winner).toBe("Dealer");
    expect(score(r.player.cards)).toBe(26);
    expect(r.dealer.cards).toHaveLength(2);
  });
  it("draws for the player below 17", () => {
    const r = play("H10,H6,S10,S8,H2,S2");
    expect(r.player.cards.map(formatCard)).toEqual(["H10", "H6", "H2"]);
  });
  it("draws for the dealer until its score is higher", () => {
    const r = play("H10,H9,S2,S3,S4,S5,S6,S7");
    expect(r.dealer.cards.map(formatCard)).toEqual([
      "S2",
      "S3",
      "S4",
      "S5",
      "S6",
    ]);
    expect(r.winner).toBe("Dealer");
  });
  it("draws for the dealer when its score ties the player", () => {
    const r = play("H10,H8,S10,S8,S2");
    expect(r.winner).toBe("Dealer");
    expect(score(r.dealer.cards)).toBe(20);
  });
  it("awards the round to the player when the dealer busts", () => {
    const r = play("H10,H7,S10,S6,SK");
    expect(r.winner).toBe("You");
    expect(score(r.dealer.cards)).toBe(26);
  });
  it("throws if the deck runs out", () => {
    expect(() => play("H2,H3,S2")).toThrow(DeckExhaustedError);
  });
  it("throws if the deck is empty", () => {
    expect(() => createStandardBlackjackGame().play([])).toThrow(
      DeckExhaustedError,
    );
  });
  it("does not mutate the input deck", () => {
    const deck = cards("H10,H7,S10,S6,SK");
    createStandardBlackjackGame().play(deck);
    expect(deck).toEqual(cards("H10,H7,S10,S6,SK"));
  });
  it("can play multiple rounds with the same game instance", () => {
    const game = createStandardBlackjackGame();
    expect([
      game.play(cards("HA,HK,S9,S8")).winner,
      game.play(cards("H9,H8,SA,SQ")).winner,
    ]).toEqual(["You", "Dealer"]);
  });
});

describe("standard game with a custom player name", () => {
  it("uses the name for the player and keeps the dealer", () => {
    const r = createStandardBlackjackGame("Ivar").play(
      cards("H10,H7,S10,S6,SK"),
    );
    expect(r.winner).toBe("Ivar");
    expect(r.player.name).toBe("Ivar");
    expect(r.dealer.name).toBe("Dealer");
  });
});

describe("Game with custom players", () => {
  it("uses the configured names and draw strategies", () => {
    const stand = new StandOnScoreStrategy(0);
    const r = new Game(
      { name: "Bob", strategy: stand },
      { name: "House", strategy: stand },
    ).play(cards("H10,H5,S10,S6"));
    expect(r.winner).toBe("House");
    expect(r.player.name).toBe("Bob");
    expect(r.dealer.name).toBe("House");
    expect(r.player.cards).toHaveLength(2);
  });

  it.each([
    ["the player scores higher", "H10,H8,S10,S6", "Bob"],
    ["the scores tie", "H10,H8,S10,S8", "House"],
  ])(
    "compares final scores when the dealer never draws and %s",
    (_description, deck, winner) => {
      const standOn17 = new StandOnScoreStrategy(17);
      const neverDraw = new StandOnScoreStrategy(0);

      const r = new Game(
        { name: "Bob", strategy: standOn17 },
        { name: "House", strategy: neverDraw },
      ).play(cards(deck));

      expect(r.winner).toBe(winner);
    },
  );
});
