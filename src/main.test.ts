import { describe, expect, it, vi } from "vitest";
import { run } from "./main";
import { cards, fakeLogger, fetchReplying, jsonResponse } from "./testing";

const promptName = async () => "Ivar";

describe("main", () => {
  it("runs the game end to end and prints the result", async () => {
    const logger = fakeLogger();
    const fetchFn = fetchReplying(jsonResponse(cards("H10,H7,S10,S6,SK")));

    await run({
      args: [" https://example.com/deck "],
      fetchFn,
      logger,
      promptName,
    });

    expect(fetchFn).toHaveBeenCalledWith(
      new URL("https://example.com/deck"),
      expect.objectContaining({ method: "GET" }),
    );
    expect(logger.info).toHaveBeenCalledWith(
      "Winner: Ivar\nDealer | 26 | S10,S6,SK\nIvar | 17 | H10,H7",
    );
  });

  it("defaults to the sandbox shuffle endpoint when no URL is given", async () => {
    const logger = fakeLogger();
    const fetchFn = fetchReplying(jsonResponse(cards("HA,HK,S9,S8")));

    await run({ env: { DECK_URL: "  " }, fetchFn, logger, promptName });

    expect(fetchFn).toHaveBeenCalledWith(
      new URL("https://sandbox.getunleash.io/blackjack/shuffle"),
      expect.objectContaining({ method: "GET" }),
    );
  });

  it("uses DECK_URL when no command-line URL is given", async () => {
    const logger = fakeLogger();
    const deckUrl = "https://example.com/from-env";
    const fetchFn = fetchReplying(jsonResponse(cards("HA,HK,S9,S8")));

    await run({
      env: { DECK_URL: `  ${deckUrl}  ` },
      fetchFn,
      logger,
      promptName,
    });

    expect(fetchFn).toHaveBeenCalledWith(
      new URL(deckUrl),
      expect.objectContaining({ method: "GET" }),
    );
  });

  it("runs with an injected deck source", async () => {
    const logger = fakeLogger();
    const deckSource = {
      getDeck: vi.fn().mockResolvedValue(cards("H10,H7,S10,S6,SK")),
    };

    await run({ deckSource, logger, promptName });

    expect(deckSource.getDeck).toHaveBeenCalledOnce();
    expect(logger.info).toHaveBeenCalledWith(
      "Winner: Ivar\nDealer | 26 | S10,S6,SK\nIvar | 17 | H10,H7",
    );
  });

  it("rejects more than one command-line URL", async () => {
    await expect(
      run({ args: ["https://example.com/one", "https://example.com/two"] }),
    ).rejects.toThrow("Only one deck URL may be provided");
  });

  it("does not ask for a name when the URL is invalid", async () => {
    const promptSpy = vi.fn(promptName);

    await expect(
      run({ args: ["not a url"], promptName: promptSpy }),
    ).rejects.toThrow();
    expect(promptSpy).not.toHaveBeenCalled();
  });
});
