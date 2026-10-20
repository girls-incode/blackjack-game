import { type Card, isBlackjack, isBust, score } from "./card";
import { Deck } from "./deck";
import type { CardDrawStrategy } from "./strategy";

/** Defines a player's name and card-drawing strategy for a game. */
export interface PlayerConfig {
  name: string;
  strategy: CardDrawStrategy;
}

/** Stores a player's name and cards during and after a round. */
export interface PlayerState {
  name: string;
  cards: readonly Card[];
}

/** Outcome of a game: the winner's name and both final hands. */
export interface GameResult {
  winner: string;
  dealer: PlayerState;
  player: PlayerState;
}

/** Which side of the table won a round. */
type Side = "player" | "dealer";

/** Internal hand that `Game` mutates while drawing. */
type MutablePlayerState = {
  name: string;
  cards: Card[];
};

/**
 * Plays one round of blackjack between a player and a dealer.
 *
 * This class handles the round rules: dealing, blackjack, busting and the winner.
 * Each side's draw rule comes from its `CardDrawStrategy`.
 */
export class Game {
  constructor(
    private readonly playerConfig: PlayerConfig,
    private readonly dealerConfig: PlayerConfig,
  ) {}

  /**
   * Plays a round, drawing cards from `cards` in order.
   *
   * 1. The player and the dealer are each dealt two cards, player first.
   * 2. Blackjack (21 with two cards) ends the round early. If the dealer has it,
   *    the dealer wins, even if the player also has it. Otherwise, if the player
   *    has it, the player wins.
   * 3. The player draws until their strategy stops them. Busting means the dealer wins.
   * 4. The dealer draws until their strategy stops them. If the dealer busts,
   *    the player wins. Otherwise, the higher score wins, and the dealer wins ties.
   *
   * @throws if the deck runs out of cards before the round ends.
   */
  play(cards: readonly Card[]): GameResult {
    const deck = new Deck(cards);
    const player = this.deal(this.playerConfig.name, deck);
    const dealer = this.deal(this.dealerConfig.name, deck);
    const winningSide = this.playRound(player, dealer, deck);
    const sides: Record<Side, MutablePlayerState> = { player, dealer };

    return { winner: sides[winningSide].name, dealer, player };
  }

  /** Runs the draw rules and returns which side won. */
  private playRound(
    player: MutablePlayerState,
    dealer: MutablePlayerState,
    deck: Deck,
  ): Side {
    // Dealer wins when both have blackjack.
    if (isBlackjack(dealer.cards)) return "dealer";
    if (isBlackjack(player.cards)) return "player";

    this.drawUntilDone(player, this.playerConfig, score(dealer.cards), deck);
    if (isBust(player.cards)) return "dealer";

    this.drawUntilDone(dealer, this.dealerConfig, score(player.cards), deck);
    if (isBust(dealer.cards)) return "player";

    return score(dealer.cards) >= score(player.cards) ? "dealer" : "player";
  }

  /** Deals the opening two cards. */
  private deal(name: string, deck: Deck): MutablePlayerState {
    return { name, cards: [deck.draw(), deck.draw()] };
  }

  /** Gives the player cards until their strategy says stop or they bust. */
  private drawUntilDone(
    state: MutablePlayerState,
    config: PlayerConfig,
    opponentScore: number,
    deck: Deck,
  ): void {
    const currentHand = state.cards;

    while (
      !isBust(currentHand) &&
      config.strategy.shouldDraw(currentHand, opponentScore)
    ) {
      currentHand.push(deck.draw());
    }
  }
}
