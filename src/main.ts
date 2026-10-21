import { type DeckSource, HttpDeckSource } from "./deckSource/deckSource";
import { ConfigError, handleError } from "./errors";
import { formatResult } from "./game/format";
import { createStandardBlackjackGame } from "./game/standardBlackjackGame";
import { consoleLogger, type Logger } from "./logging";
import { promptPlayerName } from "./playerName";

const DEFAULT_DECK_URL = "https://sandbox.getunleash.io/blackjack/shuffle";

type RunOptions = {
  args?: readonly string[];
  env?: NodeJS.ProcessEnv;
  fetchFn?: typeof fetch;
  logger?: Logger;
  deckSource?: DeckSource;
  promptName?: () => Promise<string>;
};

const resolveDeckUrl = (
  args: readonly string[],
  env: NodeJS.ProcessEnv,
): string => {
  if (args.length > 1) {
    throw new ConfigError("Only one deck URL may be provided");
  }

  return args[0]?.trim() || env.DECK_URL?.trim() || DEFAULT_DECK_URL;
};

export const run = async ({
  args = process.argv.slice(2),
  env = process.env,
  fetchFn = fetch,
  logger = consoleLogger,
  deckSource,
  promptName = promptPlayerName,
}: RunOptions = {}): Promise<void> => {
  const source =
    deckSource ?? new HttpDeckSource(resolveDeckUrl(args, env), fetchFn);
  const playerName = await promptName();
  const deck = await source.getDeck();
  const gameResult = createStandardBlackjackGame(playerName).play(deck);
  logger.info(formatResult(gameResult));
};

// Run the CLI only when this module is executed directly, not when imported by tests.
if (import.meta.main) {
  void run().catch((err) => {
    process.exitCode = handleError(err, consoleLogger);
  });
}
