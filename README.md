# Blackjack game

A TypeScript command-line Blackjack game that fetches a deck over HTTP, plays a game between a named player and a dealer, and prints the result.

<img src="docs/blackjack-round.svg" alt="Blackjack round: Dealer 27, You 19, You wins" width="100%"/>

## The game

The game is played between a named Player and the Dealer using a deck fetched from a URL.

### Deck

Each card is represented as a JSON object:

```json
{"suit":"HEARTS","value":"5"}
```

- `suit`: `HEARTS`, `CLUBS`, `SPADES`, or `DIAMONDS`
- `value`: `2`–`10`, `J`, `Q`, `K`, or `A`

The deck is fetched with `GET` from the URL provided on the command line. If no URL is provided, the default is `https://sandbox.getunleash.io/blackjack/shuffle`.

### Card values

- Number cards are worth their face value.
- Face cards (`J`, `Q`, `K`) are worth 10.
- Aces (`A`) are worth 11.

### Rules

1. The Player, whose name is entered at startup, draws two cards first. The Dealer then draws two cards.
2. If neither hand has blackjack after the initial draw, play continues.
3. If both hands have blackjack, the Dealer wins.
4. Blackjack only occurs on the initial draw and requires exactly two cards with a total score of 21.
5. The Player draws until their score reaches 17 or higher. A score above 21 is a bust, and the Player loses.
6. If the Player has not busted, the Dealer draws until their score is higher than the Player's or exceeds 21. If the Dealer busts, the Player wins.

### Output

Cards are displayed using a one-letter suit followed by the value returned by the shuffle endpoint. The suit letters are `H` (hearts), `S` (spades), `C` (clubs), and `D` (diamonds); for example, the seven of spades is `S7`.

The result is printed in this order:

1. The winner, prefixed with `Winner:`
2. The Dealer's name, score, and cards in hand, separated by `|`
3. The Player's name, score, and cards in hand, separated by `|`

### Examples

Cards are supplied in draw order: the Player's two cards, the Dealer's two cards, then any cards drawn during the round.

1. Dealer busts

Input deck: `D2,H2,S7,S10,C6,H9,CJ`

```
Winner: You
Dealer | 27 | S7,S10,CJ
You | 19 | D2,H2,C6,H9
```

2. Both have blackjack so Dealer wins.

Input deck: `HA,HK,SA,SQ`

```
Winner: Dealer
Dealer | 21 | SA,SQ
You | 21 | HA,HK
```

3. Player busts

Input deck: `H10,H6,S2,S3,HK`

```
Winner: Dealer
Dealer | 5 | S2,S3
You | 26 | H10,H6,HK
```

## Requirements

[![Node.js](https://img.shields.io/badge/Node.js-%3E%3D26-339933?style=for-the-badge&logo=nodedotjs&logoColor=white)](https://nodejs.org/) [![pnpm](https://img.shields.io/badge/pnpm-12.12.1-F69220?style=for-the-badge&logo=pnpm&logoColor=white)](https://pnpm.io/) [![TypeScript](https://img.shields.io/badge/TypeScript-7.0.2-3178C6?style=for-the-badge&logo=typescript&logoColor=white)](https://github.com/microsoft/typescript) [![Vite](https://img.shields.io/badge/Vite-8.3.4-646CFF?style=for-the-badge&logo=vite&logoColor=white)](https://github.com/vitejs/vite) [![Vitest](https://img.shields.io/badge/Vitest-5.0.3-6E9F18?style=for-the-badge&logo=vitest&logoColor=white)](https://vitest.dev/) [![Biome](https://img.shields.io/badge/Biome-2.5.15-60A5FA?style=for-the-badge&logo=biome&logoColor=white)](https://biomejs.dev/)

## Setup

```sh
pnpm install
```

### Development

```sh
pnpm test         # run the tests (vitest)
pnpm typecheck    # type-check with tsc
pnpm build        # bundle to dist/ with vite
pnpm check        # format and lint with biome
pnpm format       # format supported files with biome
```

### Run

```sh
pnpm start                      # uses the default deck URL
pnpm start <deck-url>           # uses the given deck URL
```

The game prompts for your name, which replaces `You` in the result. If you leave it blank, close input, or enter `Dealer`, it defaults to `You`. The prompt goes to stderr; the result goes to stdout.


## Logging and observability

All output goes through a `Logger` (`src/logging/logger.ts`), an interface with two methods. The production implementation keeps the game result as plain text and uses Pino for structured failures:

- `info(message)`: the game result, written as plain text to stdout.
- `error(message, error?)`: a failure, reported by `handleError`. Pino writes structured JSON to stderr, including the error details; the process exits with code 1.

This keeps stdout suitable for displaying or piping the game result while stderr retains structured diagnostics, for example (fields abbreviated):

```json
{"level":50,"msg":"Error: deck request failed","err":{"type":"Error","message":"request failed"}}
```

To send output to a monitoring tool such as Sentry or Datadog, write an object that implements `Logger`:

```ts
const sentryLogger: Logger = {
  info: (message) => console.log(message),
  error: (message, error) => Sentry.captureException(error ?? message),
};
```

Then use it in the entry point of `src/main.ts`:

```ts
void run({ logger: sentryLogger }).catch((err) => {
  process.exitCode = handleError(err, sentryLogger);
});
```

## Project layout

```
src/
├── main.ts                 # entry point: reads the URL, fetches the deck, plays, prints
├── main.test.ts            # entry-point tests
├── playerName.ts           # asks for and cleans the player's name
├── playerName.test.ts
├── logging/
│   ├── logger.ts            # Logger interface
│   └── index.ts
├── game/
│   ├── game.ts             # round rules
│   ├── game.test.ts
│   ├── standardBlackjackGame.ts # standard game configuration
│   ├── strategy.ts         # draw strategies
│   ├── strategy.test.ts
│   ├── card.ts             # cards and scoring
│   ├── card.test.ts
│   ├── deck.ts             # deck operations
│   ├── deck.test.ts
│   ├── format.ts           # output formatting
│   └── format.test.ts
├── deckSource/
│   ├── deckSource.ts       # deck-source interface and HTTP fetching
│   ├── deckSource.test.ts
│   ├── deckParser.ts       # response validation
│   └── deckParser.test.ts
├── errors/
│   ├── appErrors.ts         # application error types
│   ├── handleError.ts       # top-level error handling
│   ├── index.ts             # error-module exports
│   └── errors.test.ts       # error-handling tests
└── testing/                 # shared test helpers (cards, HTTP responses, fake logger)
```
