import {
  ConfigError,
  DeckError,
  DeckFormatError,
  DeckHttpError,
  DeckRequestError,
} from "../errors";
import type { Card } from "../game/card";
import { parseDeck } from "./deckParser";

/** a deck comes from (HTTP, file, fixture). */
export interface DeckSource {
  getDeck(): Promise<Card[]>;
}

const TIMEOUT_MS = 5000;

const isTimeoutError = (err: unknown): err is Error =>
  err instanceof Error && err.name === "TimeoutError";

const timeoutError = (cause: Error): DeckRequestError =>
  new DeckRequestError(`Deck request timed out after ${TIMEOUT_MS} ms`, {
    cause,
  });

const readJson = async (response: Response): Promise<unknown> => {
  try {
    return await response.json();
  } catch (err) {
    if (isTimeoutError(err)) throw err;
    throw new DeckFormatError("Deck response was not valid JSON", {
      cause: err,
    });
  }
};

export class HttpDeckSource implements DeckSource {
  private readonly url: URL;

  constructor(
    url: string,
    private readonly fetchFn = fetch,
  ) {
    const parsed = URL.parse(url);
    if (
      !parsed ||
      !["http:", "https:"].includes(parsed.protocol) ||
      !parsed.hostname
    ) {
      throw new ConfigError(
        "Deck URL must be a valid http(s) URL",
      );
    }

    if (parsed.username || parsed.password) {
      throw new ConfigError("Deck URL must not contain credentials");
    }
    this.url = parsed;
  }

  async getDeck(): Promise<Card[]> {
    try {
      const res = await this.fetchFn(this.url, {
        method: "GET",
        signal: AbortSignal.timeout(TIMEOUT_MS),
      });
      if (!res.ok) {
        throw new DeckHttpError(
          `Deck endpoint returned HTTP ${res.status} ${res.statusText}`,
        );
      }

      return parseDeck(await readJson(res));
    } catch (err) {
      if (err instanceof DeckError) throw err;
      if (isTimeoutError(err)) throw timeoutError(err);

      const reason = err instanceof Error ? err.message : String(err);
      throw new DeckRequestError(`Deck request failed: ${reason}`, {
        cause: err,
      });
    }
  }
}
